// Den · envio de notificações (Web Push) para lembretes de tarefas e fim do Pomodoro.
// Roda a cada 30 segundos, chamada pelo agendador (pg_cron) do Supabase.
//
// Segredos necessários (Supabase › Edge Functions › Secrets):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (o endereço do app), CRON_SECRET
// O Supabase já fornece SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY automaticamente.

const enc = new TextEncoder();

export function b64uToBytes(s: string): Uint8Array {
  const pad = '='.repeat((4 - (s.length % 4)) % 4);
  const bin = atob((s + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}
export function bytesToB64u(b: Uint8Array): string {
  let s = '';
  for (const x of b) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function concat(...parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}
async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, bytes: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, key, bytes * 8));
}

/** Criptografa o conteúdo no formato aes128gcm (RFC 8291 / RFC 8188). */
export async function encryptPayload(payload: Uint8Array, p256dhB64: string, authB64: string): Promise<Uint8Array> {
  const uaPublic = b64uToBytes(p256dhB64);
  const authSecret = b64uToBytes(authB64);
  const asKeys = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']) as CryptoKeyPair;
  const asPublic = new Uint8Array(await crypto.subtle.exportKey('raw', asKeys.publicKey));
  const uaKey = await crypto.subtle.importKey('raw', uaPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const ecdhSecret = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: uaKey }, asKeys.privateKey, 256));
  const ikm = await hkdf(authSecret, ecdhSecret, concat(enc.encode('WebPush: info\0'), uaPublic, asPublic), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, enc.encode('Content-Encoding: nonce\0'), 12);
  const aesKey = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aesKey, concat(payload, new Uint8Array([2]))));
  const rs = new Uint8Array([0, 0, 0x10, 0]); // 4096
  return concat(salt, rs, new Uint8Array([asPublic.length]), asPublic, cipher);
}

/** Cabeçalho de autorização VAPID (JWT ES256). */
export async function vapidAuth(endpoint: string, publicB64: string, privateB64: string, subject: string): Promise<string> {
  const pub = b64uToBytes(publicB64);
  const jwk = { kty: 'EC', crv: 'P-256', d: privateB64, x: bytesToB64u(pub.slice(1, 33)), y: bytesToB64u(pub.slice(33, 65)), ext: true };
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const header = bytesToB64u(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const claims = bytesToB64u(enc.encode(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: subject })));
  const sig = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc.encode(`${header}.${claims}`)));
  return `vapid t=${header}.${claims}.${bytesToB64u(sig)}, k=${publicB64}`;
}

export async function sendPush(sub: { endpoint: string; p256dh: string; auth: string }, data: unknown, vapid: { pub: string; priv: string; subject: string }): Promise<number> {
  const body = await encryptPayload(enc.encode(JSON.stringify(data)), sub.p256dh, sub.auth);
  const res = await fetch(sub.endpoint, {
    method: 'POST',
    headers: {
      'Content-Encoding': 'aes128gcm', 'Content-Type': 'application/octet-stream', TTL: '3600', Urgency: 'high',
      Authorization: await vapidAuth(sub.endpoint, vapid.pub, vapid.priv, vapid.subject),
    },
    body,
  });
  return res.status;
}

/* ---------- trabalho de cada execução ---------- */

type Reminder = { id: string; user_id: string; task_id: string; title: string; remind_at: string };
type Sub = { id: string; user_id: string; endpoint: string; p256dh: string; auth: string };

function messageFor(r: Reminder) {
  if (r.task_id.startsWith('focus:')) return { title: r.title, body: 'Toque para abrir o Den', tag: 'den-focus', url: './' };
  if (r.task_id === 'test') return { title: 'Den', body: r.title, tag: 'den-test', url: './' };
  return { title: 'Lembrete', body: r.title, tag: 'den-' + r.task_id, url: './' };
}

async function run(): Promise<Record<string, number>> {
  const env = (k: string) => Deno.env.get(k) ?? '';
  const base = env('SUPABASE_URL') + '/rest/v1';
  const key = env('SUPABASE_SERVICE_ROLE_KEY');
  const h = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
  const vapid = { pub: env('VAPID_PUBLIC_KEY'), priv: env('VAPID_PRIVATE_KEY'), subject: env('VAPID_SUBJECT') || 'https://ressbgomes-code.github.io/den/' };
  const now = new Date().toISOString();

  // Reserva os lembretes vencidos (marca como enviados antes de enviar, para não duplicar).
  const claim = await fetch(`${base}/reminders?sent_at=is.null&remind_at=lte.${encodeURIComponent(now)}&select=id,user_id,task_id,title,remind_at`, {
    method: 'PATCH', headers: { ...h, Prefer: 'return=representation' }, body: JSON.stringify({ sent_at: now }),
  });
  if (!claim.ok) throw new Error('claim ' + claim.status + ' ' + await claim.text());
  const due: Reminder[] = await claim.json();
  // Lembretes atrasados mais de 30 minutos (ex.: servidor parado) são descartados sem notificar.
  const fresh = due.filter((r) => Date.now() - Date.parse(r.remind_at) < 30 * 60e3);
  if (!fresh.length) return { due: due.length, sent: 0 };

  const users = [...new Set(fresh.map((r) => r.user_id))];
  const subsRes = await fetch(`${base}/push_subscriptions?user_id=in.(${users.join(',')})&select=id,user_id,endpoint,p256dh,auth`, { headers: h });
  const subs: Sub[] = subsRes.ok ? await subsRes.json() : [];

  let sent = 0, gone = 0;
  for (const r of fresh) {
    for (const s of subs.filter((x) => x.user_id === r.user_id)) {
      try {
        const status = await sendPush(s, messageFor(r), vapid);
        if (status === 404 || status === 410) { gone++; await fetch(`${base}/push_subscriptions?id=eq.${s.id}`, { method: 'DELETE', headers: h }); }
        else if (status < 300) sent++;
        else console.warn('push', status, s.endpoint.slice(0, 40));
      } catch (e) { console.warn('push error', String(e)); }
    }
  }
  return { due: due.length, sent, gone };
}

if (typeof Deno !== 'undefined') {
  Deno.serve(async (req) => {
    if (req.headers.get('x-cron-secret') !== Deno.env.get('CRON_SECRET')) return new Response('forbidden', { status: 403 });
    try { return Response.json(await run()); }
    catch (e) { console.error(e); return new Response(String(e), { status: 500 }); }
  });
}
