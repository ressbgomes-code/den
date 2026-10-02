// Dados locais primeiro, sincronizados com o Supabase quando houver conta e internet.

const cfg = window.DEN_CONFIG;
export const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

export const state = { items: new Map(), uid: null, email: null, status: 'idle', online: navigator.onLine };
const listeners = new Set();
export const on = fn => { listeners.add(fn); return () => listeners.delete(fn); };
const emit = what => listeners.forEach(fn => { try { fn(what); } catch (e) { console.error(e); } });

export const LS = {
  get(k, d = null) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};
const key = name => `den:${state.uid}:${name}`;
let outbox = new Set();
let saveTimer = null, flushTimer = null, retryTimer = null, flushing = false, channel = null;

function setStatus(s) { if (state.status !== s) { state.status = s; emit('status'); } }
function computeStatus() {
  if (state.uid === 'local') return setStatus('local');
  if (!state.online) return setStatus('offline');
  setStatus(outbox.size ? 'saving' : 'synced');
}

export function load(uid, email) {
  stopRealtime();
  state.uid = uid; state.email = email || null;
  state.items = new Map((LS.get(key('items'), []) || []).map(i => [i.id, i]));
  outbox = new Set(LS.get(key('outbox'), []));
  computeStatus(); emit('items');
}

export const get = id => state.items.get(id);
export const all = kind => [...state.items.values()].filter(i => i.kind === kind && !i.deleted);

function saveSoon() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 150);
}
export function saveNow() {
  clearTimeout(saveTimer);
  LS.set(key('items'), [...state.items.values()]);
  LS.set(key('outbox'), [...outbox]);
}

export function put(item, opts = {}) {
  const it = { ...item, updatedAt: opts.keepTime && item.updatedAt ? item.updatedAt : Date.now() };
  state.items.set(it.id, it);
  if (state.uid !== 'local') { outbox.add(it.id); flushSoon(); }
  saveSoon(); computeStatus();
  if (!opts.silent) emit('items');
  return it;
}
export function remove(id) { const it = get(id); if (it) put({ ...it, deleted: true }); }

function flushSoon(ms = 600) { clearTimeout(flushTimer); flushTimer = setTimeout(flush, ms); }

export async function flush() {
  if (state.uid === 'local' || !state.uid || !state.online || flushing || !outbox.size) return;
  flushing = true; setStatus('saving');
  const ids = [...outbox];
  const snap = new Map(ids.map(id => [id, get(id)?.updatedAt]));
  try {
    const rows = ids.map(id => get(id)).filter(Boolean).map(it => ({
      id: it.id, kind: it.kind, data: it, deleted: !!it.deleted, updated_at: new Date(it.updatedAt).toISOString(),
    }));
    for (let i = 0; i < rows.length; i += 200) {
      const { error } = await sb.from('items').upsert(rows.slice(i, i + 200));
      if (error) throw error;
    }
    await syncReminders(rows.filter(r => r.kind === 'task').map(r => r.data));
    ids.forEach(id => { if (get(id)?.updatedAt === snap.get(id)) outbox.delete(id); });
    saveNow(); flushing = false; computeStatus();
    if (outbox.size) flushSoon(300);
  } catch (e) {
    console.warn('sync', e); flushing = false; setStatus('error');
    clearTimeout(retryTimer); retryTimer = setTimeout(flush, 15000);
  }
}

// Lembretes futuros vão para a tabela que o servidor usa para enviar notificações.
async function syncReminders(tasks) {
  if (!tasks.length) return;
  const ids = tasks.map(t => t.id);
  const { error: delErr } = await sb.from('reminders').delete().in('task_id', ids).is('sent_at', null);
  if (delErr) throw delErr;
  const now = Date.now();
  const rows = tasks.filter(t => !t.done && !t.deleted).flatMap(t => (t.reminders || [])
    .filter(r => Date.parse(r.at) > now)
    .map(r => ({ task_id: t.id, title: t.title.replace(/(^|\s)#[^\s#]+/g, '$1').trim() || 'Lembrete', remind_at: new Date(r.at).toISOString() })));
  if (rows.length) { const { error } = await sb.from('reminders').insert(rows); if (error) throw error; }
}

function applyRemote(row) {
  const ts = Date.parse(row.updated_at);
  const local = get(row.id);
  if (local && (local.updatedAt || 0) >= ts) return false;
  state.items.set(row.id, { ...row.data, id: row.id, kind: row.kind, deleted: row.deleted, updatedAt: ts });
  outbox.delete(row.id);
  return true;
}

export async function pull(full = false) {
  if (state.uid === 'local' || !state.uid || !state.online) return 0;
  const last = LS.get(key('lastPull'));
  const since = full || !last ? '1970-01-01T00:00:00Z' : new Date(Date.parse(last) - 10 * 60e3).toISOString();
  let from = 0, changed = 0, maxTs = last;
  try {
    for (;;) {
      const { data, error } = await sb.from('items').select('id,kind,data,deleted,updated_at')
        .gt('updated_at', since).order('updated_at').range(from, from + 999);
      if (error) throw error;
      data.forEach(r => { if (applyRemote(r)) changed++; if (!maxTs || r.updated_at > maxTs) maxTs = r.updated_at; });
      if (data.length < 1000) break;
      from += 1000;
    }
    if (maxTs) LS.set(key('lastPull'), maxTs);
    saveNow(); computeStatus();
    if (changed) emit('items');
    return changed;
  } catch (e) { console.warn('pull', e); setStatus('error'); return 0; }
}

export function startRealtime() {
  if (state.uid === 'local' || channel) return;
  channel = sb.channel('items-' + state.uid)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'items', filter: `user_id=eq.${state.uid}` }, p => {
      if (p.new && p.new.id && applyRemote(p.new)) { saveSoon(); emit('items'); }
    })
    .subscribe();
}
function stopRealtime() { if (channel) { sb.removeChannel(channel); channel = null; } }

export function remoteCount() { return state.items.size; }

/* ---------- conta ---------- */

const redirect = () => location.href.split('#')[0].split('?')[0];
export const getSession = async () => (await sb.auth.getSession()).data.session;
export const signIn = (email, password) => sb.auth.signInWithPassword({ email, password });
export const signUp = (email, password) => sb.auth.signUp({ email, password, options: { emailRedirectTo: redirect() } });
export const resetPassword = email => sb.auth.resetPasswordForEmail(email, { redirectTo: redirect() });
export const updatePassword = password => sb.auth.updateUser({ password });
export async function signOut() { await flush(); stopRealtime(); await sb.auth.signOut(); }

// Itens criados sem conta passam para a conta no primeiro login.
export function migrateLocal() {
  const local = LS.get('den:local:items', []) || [];
  if (!local.length || state.uid === 'local') return 0;
  local.forEach(it => { if (!get(it.id)) { state.items.set(it.id, it); outbox.add(it.id); } });
  LS.del('den:local:items'); LS.del('den:local:outbox');
  saveNow(); flushSoon(); emit('items');
  return local.length;
}

/* ---------- notificações e cronômetro no servidor ---------- */

export async function savePushSubscription(sub) {
  const j = sub.toJSON();
  const { error } = await sb.from('push_subscriptions').upsert({ endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth }, { onConflict: 'endpoint' });
  if (error) throw error;
}
export async function scheduleServerReminder(title, atMs, taskId) {
  if (state.uid === 'local' || !state.online) return null;
  const { data, error } = await sb.from('reminders').insert({ task_id: taskId, title, remind_at: new Date(atMs).toISOString() }).select('id').single();
  return error ? null : data.id;
}
export async function cancelServerReminder(id) {
  if (!id || state.uid === 'local') return;
  await sb.from('reminders').delete().eq('id', id).is('sent_at', null);
}

/* ---------- rede ---------- */

addEventListener('online', () => { state.online = true; computeStatus(); flush(); pull(); });
addEventListener('offline', () => { state.online = false; computeStatus(); });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') { pull(); flush(); }
  else saveNow();
});
addEventListener('pagehide', saveNow);
