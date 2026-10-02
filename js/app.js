import { pad, ymd, pd, today, addDays, diff, nextWeek, WD, WD_SHORT, MO, MO_LONG, shortDate, longDate, dueInfo, dueLabel, parseQuick, splitRamble } from './parse.js';
import { esc, tagsOf, inline, renderMd, noteTitle, noteSnippet } from './md.js';
import * as store from './store.js';

const cfg = window.DEN_CONFIG;
const { LS } = store;

/* ================= ícones ================= */
const I = {
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  pen: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/></svg>',
  inbox: '<svg viewBox="0 0 24 24"><path d="M3.5 13h4.5l1.5 3h5l1.5-3h4.5"/><path d="M6 5h12l2.5 8v5a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18v-5z"/></svg>',
  upcoming: '<svg viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="17" height="16" rx="2.5"/><path d="M3.5 9h17M8 3v3M16 3v3M8 13h2M14 13h2M8 16.5h2"/></svg>',
  cal: '<svg viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="17" height="16" rx="2.5"/><path d="M3.5 9h17M8 3v3M16 3v3"/></svg>',
  notes: '<svg viewBox="0 0 24 24"><path d="M6 3.5h9l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19V5a1.5 1.5 0 0 1 1-1.5z"/><path d="M14.5 3.5V8h4.5M8.5 12.5h7M8.5 16h5"/></svg>',
  pin: '<svg viewBox="0 0 24 24"><path d="M9 3.5h6l-1 6 3.5 3.5h-11L10 9.5z"/><path d="M12 13v7.5"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M4.5 7h15M10 11v6M14 11v6M6 7l1 12.5a1.5 1.5 0 0 0 1.5 1.5h7a1.5 1.5 0 0 0 1.5-1.5L18 7M9 7V4.5h6V7"/></svg>',
  menu: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7"/></svg>',
  flag: '<svg viewBox="0 0 24 24"><path d="M5.5 21V4.5M5.5 4.5h11l-2 4 2 4h-11"/></svg>',
  eye: '<svg viewBox="0 0 24 24"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  left: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  right: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
  list: '<svg viewBox="0 0 24 24"><path d="M10 6.5h10M10 12h10M10 17.5h10"/><path d="M3.5 6.5l1.5 1.5 2.5-3M3.5 12.5l1.5 1.5 2.5-3"/></svg>',
  dots: '<svg viewBox="0 0 24 24"><circle cx="5.5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18.5" cy="12" r="1.2"/></svg>',
  send: '<svg viewBox="0 0 24 24"><path d="M3.5 13h4.5l1.5 3h5l1.5-3h4.5"/><path d="M12 3v8M8.5 7.5L12 11l3.5-3.5"/></svg>',
  mic: '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>',
  timer: '<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9.5 2.5h5"/></svg>',
  bell: '<svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></svg>',
  board: '<svg viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="5" height="15" rx="1.5"/><rect x="10" y="4.5" width="5" height="10" rx="1.5"/><rect x="16.5" y="4.5" width="4" height="7" rx="1.5"/></svg>',
  grid: '<svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5"/><rect x="13" y="3.5" width="7.5" height="7.5" rx="1.5"/><rect x="3.5" y="13" width="7.5" height="7.5" rx="1.5"/><rect x="13" y="13" width="7.5" height="7.5" rx="1.5"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  play: '<svg viewBox="0 0 24 24" class="fill"><path d="M7 5l12 7-12 7z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" class="fill"><rect x="6" y="5" width="4" height="14" rx="1.2"/><rect x="14" y="5" width="4" height="14" rx="1.2"/></svg>',
  stop: '<svg viewBox="0 0 24 24" class="fill"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
  skip: '<svg viewBox="0 0 24 24" class="fill"><path d="M6 5l9 7-9 7z"/><rect x="16" y="5" width="2.5" height="14" rx="1"/></svg>',
  down: '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>',
  hash: '<svg viewBox="0 0 24 24"><path d="M9 4L7 20M17 4l-2 16M4.5 9h16M3.5 15h16"/></svg>',
  cloudoff: '<svg viewBox="0 0 24 24"><path d="M2 2l20 20M8.5 16.5a5 5 0 0 1 7 0M5 12.6a10 10 0 0 1 5.2-2.5M14 10.2a10 10 0 0 1 5 2.4M12 20h.01"/></svg>',
  alert: '<svg viewBox="0 0 24 24"><path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17.5h.01"/></svg>',
  move: '<svg viewBox="0 0 24 24"><path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/></svg>',
};
const ic = (n, cls = '') => `<span class="ic ${cls}">${I[n]}</span>`;
const todayIcon = () => `<span class="ic"><svg viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="17" height="16" rx="2.5"/><path d="M3.5 9h17"/><text x="12" y="17.8" text-anchor="middle" font-size="8.5" font-weight="800" fill="currentColor" stroke="none">${new Date().getDate()}</text></svg></span>`;

/* ================= utilidades ================= */
const $ = (s, r = document) => r.querySelector(s);
const uid = p => p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const mq = matchMedia('(max-width: 760px)');
const isMobile = () => mq.matches;
const touchOnly = matchMedia('(hover: none)').matches;
const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const PCOLORS = ['#db4035', '#ff9933', '#fad000', '#7ecc49', '#299438', '#14aaf5', '#4073ff', '#884dff', '#e05194', '#808080'];
const STATUSES = [['todo', 'A fazer', '#9a9ea5'], ['doing', 'Em andamento', '#246fe0'], ['waiting', 'Aguardando', '#eb8909'], ['done', 'Feito', '#058527']];

const prefs = Object.assign({ focusMin: 25, shortMin: 5, longMin: 15, longEvery: 4, rambleLang: 'pt-BR', textSize: 'normal', theme: 'auto' }, LS.get('den:prefs', {}));
const savePrefs = () => LS.set('den:prefs', prefs);
// Tamanho do texto no celular (o iPhone não aplica o ajuste do sistema em apps web).
function applyTextSize() {
  const v = { normal: '100%', grande: '115%', maior: '130%' }[prefs.textSize] || '100%';
  document.documentElement.style.webkitTextSizeAdjust = v; document.documentElement.style.textSizeAdjust = v;
}
applyTextSize();
// Temas: auto (grafite, segue o aparelho), light (tudo claro), graphite (claro com barra grafite), dark, nord.
const THEMES = [
  { k: 'auto', name: 'Automático', desc: 'Grafite claro ou escuro, conforme o aparelho', side: '#2b2e31', bg: 'linear-gradient(135deg,#ffffff 50%,#1e2023 50%)', line: '#c9cbcf', acc: '#c93c30' },
  { k: 'light', name: 'Claro', desc: 'Tudo claro, inclusive a barra lateral', side: '#f4f4f5', bg: '#ffffff', line: '#e2e2e5', acc: '#c93c30', sideLine: '#c9cbcf' },
  { k: 'graphite', name: 'Claro com grafite', desc: 'O visual do computador: barra grafite e conteúdo claro', side: '#2b2e31', bg: '#ffffff', line: '#e2e2e5', acc: '#c93c30' },
  { k: 'dark', name: 'Escuro', desc: 'Sempre escuro', side: '#17191b', bg: '#1e2023', line: '#3a3d42', acc: '#ec6b5e' },
  { k: 'nord', name: 'Nord', desc: 'Azul-gelo da paleta Nord', side: '#242933', bg: '#2e3440', line: '#4c566a', acc: '#88c0d0' },
];
function applyTheme() {
  const t = prefs.theme || 'auto';
  if (t === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t;
  const bar = { light: '#ffffff', graphite: '#ffffff', dark: '#1e2023', nord: '#2e3440' }[t];
  document.querySelectorAll('meta[name="theme-color"]').forEach((m, i) => {
    if (bar) { m.setAttribute('content', bar); m.removeAttribute('media'); }
    else { m.setAttribute('media', i === 0 ? '(prefers-color-scheme: light)' : '(prefers-color-scheme: dark)'); m.setAttribute('content', i === 0 ? '#ffffff' : '#1e2023'); }
  });
}
applyTheme();
// Teclado do celular: a janela acompanha a área visível e fica acima das teclas.
if (window.visualViewport) {
  const vv = window.visualViewport;
  const fit = () => {
    const kb = Math.max(0, innerHeight - vv.height - vv.offsetTop);
    document.documentElement.style.setProperty('--kb', kb + 'px');
    document.documentElement.style.setProperty('--vvh', vv.height + 'px');
    document.body.classList.toggle('kb-open', kb > 80);
  };
  vv.addEventListener('resize', fit); vv.addEventListener('scroll', fit); fit();
}

/* ================= estado da interface ================= */
const S = {
  view: LS.get('den:view', { type: 'today' }), modes: LS.get('den:modes', {}),
  noteId: null, noteMode: 'read', showDone: false, search: '', composerKey: null, reading: false,
  calMonth: today().slice(0, 7), calSel: today(), calMode: LS.get('den:calmode', 'month'), started: false, loading: false, boardCol: 0,
};
const saveView = () => { LS.set('den:view', S.view); LS.set('den:modes', S.modes); };
const all = store.all, get = store.get;
const projects = () => all('project').sort((a, b) => (a.order ?? a.createdAt) - (b.order ?? b.createdAt));
const projById = id => { const p = id && get(id); return p && p.kind === 'project' && !p.deleted ? p : null; };
const PRIO_ORDER = (a, b) => (a.priority || 4) - (b.priority || 4) || ((a.due || '9999') + (a.time || '99')).localeCompare((b.due || '9999') + (b.time || '99')) || a.createdAt - b.createdAt;
const notesSorted = list => list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.updatedAt - a.updatedAt);
const itemTags = it => it.kind === 'note' ? tagsOf(it.body) : tagsOf((it.title || '') + ' ' + (it.desc || ''));
const hasTag = (it, t) => { for (const x of itemTags(it)) if (x === t || x.startsWith(t + '/')) return true; return false; };
const openTasks = () => all('task').filter(t => !t.done);
const put = (item, o) => store.put(item, o);
const remove = id => store.remove(id);

/* ================= notificações locais e som ================= */
let audioCtx = null;
function unlockAudio() { try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); if (audioCtx.state === 'suspended') audioCtx.resume(); } catch {} }
function chime() {
  try {
    if (!audioCtx) return;
    const t0 = audioCtx.currentTime;
    [880, 1175, 1568].forEach((f, i) => {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.frequency.value = f; o.type = 'sine';
      g.gain.setValueAtTime(0.0001, t0 + i * 0.16); g.gain.exponentialRampToValueAtTime(0.25, t0 + i * 0.16 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.16 + 0.5);
      o.connect(g).connect(audioCtx.destination); o.start(t0 + i * 0.16); o.stop(t0 + i * 0.16 + 0.55);
    });
  } catch {}
  try { navigator.vibrate?.([120, 80, 120]); } catch {}
}
async function osNotify(title, body, tag) {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') return false;
    const reg = await navigator.serviceWorker?.ready;
    if (reg) { await reg.showNotification(title, { body, tag, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png' }); return true; }
  } catch {}
  return false;
}
const notifState = () => !('Notification' in window) ? 'unsupported' : Notification.permission;

function urlB64ToUint8Array(base64) {
  const padding = '='.repeat((4 - base64.length % 4) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}
async function subscribePush() {
  if (!cfg.vapidPublicKey || store.state.uid === 'local' || !('serviceWorker' in navigator)) return false;
  const reg = await navigator.serviceWorker.ready;
  if (!reg.pushManager) return false;
  const sub = await reg.pushManager.getSubscription() || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToUint8Array(cfg.vapidPublicKey) });
  await store.savePushSubscription(sub);
  LS.set('den:push-ok', true);
  return true;
}
// Ao abrir o app com notificações já permitidas, confirma o registro deste aparelho no servidor.
async function ensurePush() { try { if (notifState() === 'granted') await subscribePush(); } catch (e) { console.warn('push', e); } }
async function enableNotifications() {
  if (!('Notification' in window)) {
    toast(standalone() ? 'Este aparelho não oferece notificações para apps web.' : 'No iPhone, instale o Den na Tela de Início para ativar notificações.');
    return false;
  }
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') { toast('Notificações bloqueadas. Libere nas configurações do navegador ou, no iPhone, em Ajustes › Notificações › Den.', null, 6000); render(); return false; }
  if (store.state.uid !== 'local') {
    try { await subscribePush(); }
    catch (e) { console.warn(e); toast('Notificações ativadas neste aparelho, mas não foi possível registrar no servidor.'); render(); return true; }
  }
  toast('Notificações ativadas'); render();
  return true;
}

// Enquanto o app está aberto, mostra os lembretes na hora.
const fired = new Set(LS.get('den:fired', []));
function checkReminders() {
  const now = Date.now();
  for (const t of openTasks()) for (const r of t.reminders || []) {
    const at = Date.parse(r.at), k = t.id + '@' + r.at;
    if (at <= now && at > now - 15 * 60e3 && !fired.has(k)) {
      fired.add(k); LS.set('den:fired', [...fired].slice(-300));
      chime(); toast('Lembrete: ' + plainTitle(t.title), null, 8000);
      if (document.visibilityState !== 'visible') osNotify('Lembrete', plainTitle(t.title), k);
    }
  }
}
const plainTitle = s => (s || '').replace(/(^|\s)#[^\s#]+/g, '$1').replace(/\s+/g, ' ').trim();

/* ================= barra lateral ================= */
function tagTree() {
  const live = [...store.state.items.values()].filter(it => !it.deleted && it.kind !== 'project' && !(it.kind === 'task' && it.done));
  const names = new Set();
  for (const it of live) for (const t of itemTags(it)) { const p = t.split('/'); for (let k = 1; k <= p.length; k++) names.add(p.slice(0, k).join('/')); }
  return [...names].sort().map(t => ({ t, depth: t.split('/').length - 1, label: t.split('/').pop(), n: live.filter(it => hasTag(it, t)).length }));
}
function navBtn(view, iconHtml, label, n) {
  const v = S.view; const on = v.type === view.type && (v.id || v.tag || '') === (view.id || view.tag || '');
  const data = Object.entries(view).map(([k, val]) => `data-${k}="${esc(val)}"`).join(' ');
  return `<button class="nav${on ? ' on' : ''}" data-a="nav" ${data}>${iconHtml}<span class="lbl">${esc(label)}</span>${n ? `<span class="n">${n}</span>` : ''}</button>`;
}
function renderSide() {
  const open = openTasks(); const td = today();
  let h = `<div class="side-label">Tarefas</div>`;
  h += navBtn({ type: 'inbox' }, ic('inbox'), 'Entrada', open.filter(t => !projById(t.project)).length);
  h += navBtn({ type: 'today' }, todayIcon(), 'Hoje', open.filter(t => (t.due && t.due <= td) || (t.deadline && t.deadline <= td)).length);
  h += navBtn({ type: 'upcoming' }, ic('upcoming'), 'Em breve', open.filter(t => t.due && t.due > td && t.due <= addDays(td, 7)).length);
  h += `<div class="side-label">Visões</div>`;
  h += navBtn({ type: 'calendar' }, ic('cal'), 'Calendário', 0);
  h += navBtn({ type: 'matrix' }, ic('grid'), 'Prioridades', 0);
  h += `<div class="side-label">Projetos <button data-a="new-project" aria-label="Novo projeto">${ic('plus', 'sm')}</button></div>`;
  for (const p of projects()) h += navBtn({ type: 'project', id: p.id }, `<span class="ic"><i class="dot" style="background:${esc(p.color)}"></i></span>`, p.name, open.filter(t => t.project === p.id).length);
  if (!projects().length) h += `<button class="nav" data-a="new-project"><span class="ic">${I.plus}</span><span class="lbl muted-side">Criar um projeto</span></button>`;
  h += `<div class="side-label">Notas <button data-a="new-note" aria-label="Nova nota">${ic('plus', 'sm')}</button></div>`;
  h += navBtn({ type: 'notes' }, ic('notes'), 'Todas as notas', all('note').length);
  const tags = tagTree();
  if (tags.length) {
    h += `<div class="side-label">Etiquetas</div>`;
    for (const t of tags) h += navBtn({ type: 'tag', tag: t.t }, `<span class="ic hash" style="margin-left:${t.depth * 14}px">#</span>`, t.label, t.n);
  }
  $('#side-nav').innerHTML = h;
  $('#side-settings').classList.toggle('on', S.view.type === 'settings');
}
function renderSync() {
  const st = store.state.status; const el = $('#sync');
  const map = { synced: ['ok', 'Sincronizado'], saving: ['busy', 'Salvando'], offline: ['off', 'Offline'], error: ['err', 'Sem sincronizar'], local: ['ok', 'Neste aparelho'], idle: ['', ''] };
  const [cls, txt] = map[st] || map.idle;
  el.className = 'sync ' + cls; el.querySelector('span').textContent = txt;
}
function renderTabbar() {
  const v = S.view.type;
  const tab = (type, icon, label) => `<button class="tab${v === type ? ' on' : ''}" data-a="${type === 'more' ? 'side-open' : 'nav'}" data-type="${type}">${icon}<span>${label}</span></button>`;
  $('#tabbar').innerHTML = tab('today', todayIcon(), 'Hoje') + tab('inbox', ic('inbox'), 'Entrada') + tab('notes', ic('notes'), 'Notas') + tab('search', ic('search'), 'Buscar') + tab('more', ic('menu'), 'Mais');
  $('#fab').hidden = ['notes', 'tag', 'settings'].includes(v) && S.reading || v === 'settings';
}

/* ================= linhas de tarefa ================= */
function taskMeta(t, opts = {}) {
  const p = projById(t.project); let meta = '';
  if (t.priority && t.priority <= 2 && !t.done) meta += `<span class="prio q${t.priority}">${ic('flag', 'sm')}P${t.priority}</span>`;
  if ((t.due || t.time) && !opts.hideDue) { const di = t.due ? dueInfo(t.due) : { cls: '' }; meta += `<span class="due ${t.done ? '' : di.cls}">${ic('cal', 'sm')}${esc(dueLabel(t.due, t.time))}</span>`; }
  else if (t.time && opts.hideDue) meta += `<span class="due">${esc(t.time)}</span>`;
  if (t.deadline && !t.done) { const n = diff(today(), t.deadline); meta += `<span class="deadline${n <= 2 ? ' soon' : ''}">${ic('flag', 'sm')}${n < 0 ? 'Prazo vencido' : n === 0 ? 'Prazo hoje' : 'Prazo ' + shortDate(t.deadline)}</span>`; }
  if ((t.reminders || []).some(r => Date.parse(r.at) > Date.now()) && !t.done) meta += `<span class="t-ic" title="Tem lembrete">${ic('bell', 'sm')}</span>`;
  if (t.pomos) meta += `<span class="t-ic">${ic('timer', 'sm')}${t.pomos}${t.pomoGoal ? '/' + t.pomoGoal : ''}</span>`;
  if (t.noteId && get(t.noteId) && !get(t.noteId).deleted) meta += `<span class="t-link" data-a="open-note" data-id="${esc(t.noteId)}">${ic('notes', 'sm')}${esc(noteTitle(get(t.noteId)))}</span>`;
  if (!opts.hideProject) meta += `<span class="t-proj">${p ? `${esc(p.name)}<i style="background:${esc(p.color)}"></i>` : `Entrada ${ic('inbox', 'sm')}`}</span>`;
  return meta;
}
function taskRow(t, opts = {}) {
  const firstDesc = (t.desc || '').split('\n').find(x => x.trim()) || '';
  return `<div class="task${t.done ? ' done' : ''}" data-id="${esc(t.id)}" ${opts.drag ? 'draggable="true"' : ''}>
    <div class="swipe-bg"><span class="sw-done">${ic('check')}Concluir</span><span class="sw-later">Reagendar${ic('cal')}</span></div>
    <div class="task-in">
      <button class="check p${t.priority || 4}" data-a="toggle" data-id="${esc(t.id)}" aria-label="${t.done ? 'Marcar como não feita' : 'Concluir tarefa'}">${I.check}</button>
      <div class="t-body" data-a="open" data-id="${esc(t.id)}" role="button" tabindex="0">
        <div class="t-title">${inline(t.title)}</div>
        ${firstDesc && !opts.compact ? `<div class="t-desc">${esc(firstDesc.replace(/[*_=~`#]/g, ''))}</div>` : ''}
        <div class="t-meta">${taskMeta(t, opts)}</div>
      </div>
    </div></div>`;
}
function headHtml(title, sub = '', actions = '') {
  return `<header class="head"><button class="icon-btn menu-btn" data-a="side-open" aria-label="Abrir menu">${I.menu}</button><h1>${esc(title)}</h1>${sub ? `<span class="sub">${esc(sub)}</span>` : ''}<span class="netslot">${netChip()}</span><span class="grow"></span>${actions}</header><div class="netbar-slot">${netBar()}</div>`;
}
function netChip() {
  const m = { offline: ['off', 'Offline'], error: ['err', 'Sem sincronizar'], saving: ['busy', 'Salvando'] }[store.state.status];
  return m ? `<span class="net-chip ${m[0]}" role="status"><i></i>${m[1]}</span>` : '';
}
function netBar() {
  const st = store.state.status, n = store.pendingCount();
  if (st === 'offline') return `<div class="netbar off" role="status">${ic('cloudoff', 'sm')}<span>Sem internet. ${n ? `${n} alteraç${n === 1 ? 'ão vai' : 'ões vão'} sincronizar quando a conexão voltar.` : 'Você pode continuar usando o Den normalmente.'}</span></div>`;
  if (st === 'error') return `<div class="netbar err" role="status">${ic('alert', 'sm')}<span>Não foi possível sincronizar. Tentando de novo…</span><button class="link-btn" data-a="sync-now">Tentar agora</button></div>`;
  return '';
}
function renderNet() {
  document.querySelectorAll('.netslot').forEach(e => { e.innerHTML = netChip(); });
  document.querySelectorAll('.netbar-slot').forEach(e => { e.innerHTML = netBar(); });
}
function viewSwitch(active) {
  const opts = [['list', 'Lista', 'Lista', 'list'], ['board', 'Quadro', 'Quadro', 'board'], ['calendar', 'Calendário', 'Agenda', 'cal'], ['matrix', 'Prioridades', 'Matriz', 'grid']];
  return `<div class="seg" role="tablist" aria-label="Visão">${opts.map(([k, l, sh, i]) => `<button role="tab" aria-selected="${k === active}" class="${k === active ? 'on' : ''}" data-a="mode" data-mode="${k}" title="${l}">${ic(i, 'sm')}<span class="lg">${l}</span><span class="sh">${sh}</span></button>`).join('')}</div>`;
}
const rambleBtn = () => `<button class="btn dark ramble-btn" data-a="ramble" title="Adicionar por voz">${ic('mic', 'sm')}<span>Ramble</span></button>`;

/* ================= visões de tarefas ================= */
let composerEl = null;
function addRow(key, preset = {}) {
  if (S.composerKey === key) return `<div class="composer-slot"></div>`;
  return `<button class="add-row" data-a="compose" data-key="${esc(key)}" data-preset='${esc(JSON.stringify(preset))}'><span class="plus">${ic('plus', 'sm')}</span>Adicionar tarefa</button>`;
}
const emptyMsg = (b, s) => `<div class="empty"><b>${b}</b>${s}</div>`;
const viewKey = () => S.view.type + (S.view.id || '');

function listTasks() {
  const v = S.view, td = today(), open = openTasks();
  if (v.type === 'today') return { title: 'Hoje', sub: longDate(td), tasks: open.filter(t => (t.due && t.due <= td) || (t.deadline && t.deadline <= td)), preset: { due: td }, doneFilter: t => t.doneAt && ymd(new Date(t.doneAt)) === td };
  if (v.type === 'upcoming') return { title: 'Em breve', sub: MO_LONG[new Date().getMonth()] + ' ' + new Date().getFullYear(), tasks: open.filter(t => t.due), preset: {}, doneFilter: t => t.due && t.doneAt && ymd(new Date(t.doneAt)) === td };
  if (v.type === 'project') { const p = projById(v.id); if (!p) return null; return { title: p.name, project: p, tasks: open.filter(t => t.project === p.id), preset: { project: p.id }, doneFilter: t => t.project === p.id }; }
  return { title: 'Entrada', tasks: open.filter(t => !projById(t.project)), preset: {}, doneFilter: t => !projById(t.project) };
}

function renderTasks(main) {
  const L = listTasks();
  if (!L) { S.view = { type: 'inbox' }; return renderTasks(main); }
  const mode = S.modes[viewKey()] || 'list';
  const actions = (L.project ? `<button class="icon-btn" data-a="edit-project" data-id="${esc(L.project.id)}" aria-label="Editar projeto">${I.dots}</button>` : '') + viewSwitch(mode) + rambleBtn();
  const td = today(); let body = '';
  const doneList = all('task').filter(t => t.done && L.doneFilter(t));
  if (mode === 'board') return renderBoard(main, L, actions);
  if (S.view.type === 'today') {
    const overdue = L.tasks.filter(t => (t.due && t.due < td) || (!t.due && t.deadline < td) || (t.due > td && t.deadline <= td)).sort(PRIO_ORDER);
    const tod = L.tasks.filter(t => !overdue.includes(t)).sort((a, b) => (a.time || '99').localeCompare(b.time || '99') || PRIO_ORDER(a, b));
    if (overdue.length) body += `<div class="section-h overdue">Atrasadas <span class="meta">${overdue.length}</span><span class="grow"></span><button class="link-btn" data-a="move-overdue">Mover para hoje</button></div>` + overdue.map(t => taskRow(t)).join('');
    if (overdue.length) body += `<div class="section-h">${esc(longDate(td))} <span class="meta">Hoje</span></div>`;
    body += tod.map(t => taskRow(t, { hideDue: t.due === td })).join('');
    body += addRow('today', L.preset);
    if (!L.tasks.length && S.composerKey !== 'today') body += emptyMsg('Nada para hoje', 'Aproveite, ou adicione algo com o botão +.');
  } else if (S.view.type === 'upcoming') {
    const overdue = L.tasks.filter(t => t.due < td).sort(PRIO_ORDER);
    if (overdue.length) body += `<div class="section-h overdue">Atrasadas <span class="meta">${overdue.length}</span></div>` + overdue.map(t => taskRow(t)).join('');
    for (let k = 0; k < 7; k++) {
      const d = addDays(td, k); const list = L.tasks.filter(t => t.due === d).sort((a, b) => (a.time || '99').localeCompare(b.time || '99') || PRIO_ORDER(a, b));
      const rel = k === 0 ? 'Hoje · ' : k === 1 ? 'Amanhã · ' : '';
      body += `<div class="section-h">${esc(shortDate(d))} <span class="meta">${rel}${WD[pd(d).getDay()]}</span></div>`;
      body += list.map(t => taskRow(t, { hideDue: true })).join('') + addRow('up' + d, { due: d });
    }
    const later = L.tasks.filter(t => t.due > addDays(td, 6)).sort((a, b) => a.due.localeCompare(b.due) || PRIO_ORDER(a, b));
    if (later.length) body += `<div class="section-h">Depois</div>` + later.map(t => taskRow(t)).join('');
  } else {
    const list = L.tasks.sort(PRIO_ORDER);
    body += list.map(t => taskRow(t, { hideProject: true })).join('');
    body += addRow(viewKey(), L.preset);
    if (!list.length && S.composerKey !== viewKey()) body += emptyMsg(L.project ? 'Nenhuma tarefa aberta neste projeto' : 'Sua Entrada está vazia', 'Tarefas sem projeto ficam aqui.');
  }
  if (doneList.length) {
    body += `<button class="link-btn done-toggle" data-a="show-done">${S.showDone ? 'Ocultar' : 'Mostrar'} concluídas (${doneList.length})</button>`;
    if (S.showDone) body += doneList.sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0)).slice(0, 50).map(t => taskRow(t)).join('');
  }
  const hint = touchOnly && L.tasks.length && !LS.get('den:hint-gestures') ? `<div class="coach" role="note"><b>Dicas rápidas</b><ul><li>Deslize uma tarefa para a <b>direita</b> para concluir, ou para a <b>esquerda</b> para reagendar.</li><li><b>Segure</b> uma tarefa ou cartão para mover.</li><li><b>Segure o botão +</b> para falar várias tarefas de uma vez.</li></ul><button class="btn" data-a="hint-ok">Entendi</button></div>` : '';
  paint(main, headHtml(L.title, L.sub, actions) + `<div class="scroll" data-scroll="tasks"><div class="task-col">${hint}${body}</div></div>`);
}

function paint(main, html) {
  const sc = $('.scroll', main); const prev = sc ? [sc.dataset.scroll, sc.scrollTop, sc.scrollLeft] : null;
  const active = document.activeElement; const restore = composerEl && composerEl.contains(active) ? active : null;
  const sel = restore && 'selectionStart' in restore ? [restore.selectionStart, restore.selectionEnd] : null;
  main.innerHTML = html;
  const nsc = $('.scroll', main); if (nsc && prev && prev[0] === nsc.dataset.scroll) { nsc.scrollTop = prev[1]; nsc.scrollLeft = prev[2]; }
  const slot = $('.composer-slot', main);
  if (slot && composerEl) { slot.replaceWith(composerEl); if (restore) { restore.focus({ preventScroll: true }); if (sel) try { restore.setSelectionRange(...sel); } catch {} } }
}

/* ---------- quadro (kanban) ---------- */
function renderBoard(main, L, actions) {
  const recentDone = all('task').filter(t => t.done && L.doneFilter(t)).sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0)).slice(0, 30);
  const cols = STATUSES.map(([k, label, color]) => {
    const list = k === 'done' ? recentDone : L.tasks.filter(t => (t.status || 'todo') === k).sort(PRIO_ORDER);
    return `<section class="col" data-drop="status" data-status="${k}">
      <div class="col-h"><i style="background:${color}"></i><h2>${label}</h2><span class="meta">${list.length}</span></div>
      <div class="col-list">${list.map(t => `<article class="card${t.done ? ' done' : ''}" data-id="${esc(t.id)}" draggable="true">
        <div class="card-top"><button class="check sm p${t.priority || 4}" data-a="toggle" data-id="${esc(t.id)}" aria-label="Concluir tarefa">${I.check}</button>
        <div class="t-body" data-a="open" data-id="${esc(t.id)}" role="button" tabindex="0"><div class="t-title">${inline(t.title)}</div></div></div>
        <div class="t-meta">${taskMeta(t, { hideProject: !!L.project })}</div></article>`).join('')}
      ${k !== 'done' ? addRow('board-' + k, { ...L.preset, status: k }) : ''}</div></section>`;
  }).join('');
  const counts = STATUSES.map(([k]) => k === 'done' ? recentDone.length : L.tasks.filter(t => (t.status || 'todo') === k).length);
  const tabs = `<div class="col-tabs" role="tablist" aria-label="Colunas">${STATUSES.map(([k, label], i) => `<button role="tab" data-a="col-jump" data-i="${i}" class="${i === (S.boardCol || 0) ? 'on' : ''}">${label}<em>${counts[i]}</em></button>`).join('')}</div>`;
  paint(main, headHtml(L.title, L.sub, actions) + tabs + `<div class="scroll board" data-scroll="board">${cols}</div>`);
  const board = $('.board', main);
  board.addEventListener('scroll', () => {
    const w = board.firstElementChild?.getBoundingClientRect().width || 1;
    const i = Math.round(board.scrollLeft / (w + 10));
    if (i !== S.boardCol) { S.boardCol = i; main.querySelectorAll('.col-tabs button').forEach((b, k) => { b.classList.toggle('on', k === i); b.setAttribute('aria-selected', k === i); }); }
  }, { passive: true });
}

/* ---------- calendário ---------- */
function calItems() {
  const byDay = {};
  for (const t of openTasks()) {
    if (t.due) (byDay[t.due] ||= []).push({ t, kind: 'due' });
    if (t.deadline && t.deadline !== t.due) (byDay[t.deadline] ||= []).push({ t, kind: 'deadline' });
  }
  Object.values(byDay).forEach(l => l.sort((a, b) => (a.kind === 'deadline' ? -1 : 0) - (b.kind === 'deadline' ? -1 : 0) || (a.t.time || '99').localeCompare(b.t.time || '99') || PRIO_ORDER(a.t, b.t)));
  return byDay;
}
const weekStart = ds => { const d = pd(ds); return addDays(ds, -((d.getDay() + 6) % 7)); };
const chipHtml = x => `<button class="chip-t ${x.kind === 'deadline' ? 'dl' : 'p' + (x.t.priority || 4)}" data-a="open" data-id="${esc(x.t.id)}" draggable="${x.kind === 'due'}" data-drag-id="${esc(x.t.id)}">${x.kind === 'deadline' ? ic('flag', 'sm') + 'Prazo: ' : x.t.time ? `<b>${x.t.time}</b> ` : ''}${esc(plainTitle(x.t.title))}</button>`;
const dotsHtml = items => `<span class="dots">${items.slice(0, 3).map(x => `<i class="${x.kind === 'deadline' ? 'dl' : 'p' + (x.t.priority || 4)}"></i>`).join('')}</span>`;
function renderCalendar(main) {
  const mode = S.calMode || 'month';
  const td = today(); const byDay = calItems(); const mob = isMobile();
  const wd = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];
  const agendaHtml = () => {
    const list = byDay[S.calSel] || [];
    return `<div class="agenda"><div class="section-h">${esc(longDate(S.calSel))} <span class="meta">${dueInfo(S.calSel).label}</span></div>${list.map(x => taskRow(x.t, { hideDue: x.kind === 'due' && !x.t.time })).join('')}${list.length ? '' : '<p class="muted small" style="margin:10px 0 0">Nada marcado para este dia.</p>'}${addRow('cal' + S.calSel, { due: S.calSel })}</div>`;
  };
  let title, body;
  if (mode === 'week') {
    const ws = weekStart(S.calSel); const days = Array.from({ length: 7 }, (_, i) => addDays(ws, i));
    const a = pd(days[0]), b = pd(days[6]);
    title = a.getMonth() === b.getMonth() ? `${a.getDate()}–${b.getDate()} ${MO[b.getMonth()]}` : `${a.getDate()} ${MO[a.getMonth()]} – ${b.getDate()} ${MO[b.getMonth()]}`;
    if (mob) {
      body = `<div class="week-strip" role="tablist" aria-label="Dias da semana">${days.map((ds, i) => { const items = byDay[ds] || []; return `<button role="tab" aria-selected="${ds === S.calSel}" class="wday${ds === S.calSel ? ' sel' : ''}${ds === td ? ' today' : ''}" data-a="cal-sel" data-date="${ds}"><span class="wd-l">${wd[i]}</span><span class="num">${pd(ds).getDate()}</span>${dotsHtml(items)}</button>`; }).join('')}</div>${agendaHtml()}`;
    } else {
      body = `<div class="week">${days.map((ds, i) => { const items = byDay[ds] || []; return `<section class="wcol${ds === td ? ' today' : ''}${ds === S.calSel ? ' sel' : ''}" data-drop="day" data-date="${ds}">
        <button class="wcol-h" data-a="cal-sel" data-date="${ds}"><span class="wd-l">${wd[i]}</span><span class="num">${pd(ds).getDate()}</span></button>
        <div class="wcol-list">${items.map(chipHtml).join('')}</div>
        <button class="add-row sm" data-a="cal-add" data-date="${ds}"><span class="plus">${ic('plus', 'sm')}</span>Adicionar</button></section>`; }).join('')}</div>`;
    }
  } else {
    const [y, m] = S.calMonth.split('-').map(Number);
    const first = new Date(y, m - 1, 1); const start = new Date(first); start.setDate(1 - ((first.getDay() + 6) % 7));
    const weeks = Math.ceil((((first.getDay() + 6) % 7) + new Date(y, m, 0).getDate()) / 7);
    title = `${mob ? MO_LONG[m - 1].slice(0, 3) : MO_LONG[m - 1]} ${y}`;
    let cells = '';
    for (let i = 0; i < weeks * 7; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i); const ds = ymd(d);
      const inMonth = d.getMonth() === m - 1; const items = byDay[ds] || [];
      const cls = `cell${inMonth ? '' : ' out'}${ds === td ? ' today' : ''}${ds === S.calSel ? ' sel' : ''}`;
      if (mob) cells += `<button class="${cls}" data-a="cal-sel" data-date="${ds}" aria-label="${longDate(ds)}${items.length ? ', ' + items.length + ' item' + (items.length === 1 ? '' : 's') : ''}"><span class="num">${d.getDate()}</span>${dotsHtml(items)}</button>`;
      else cells += `<div class="${cls}" data-drop="day" data-date="${ds}"><div class="cell-h"><span class="num">${d.getDate()}</span><button class="cell-add" data-a="cal-add" data-date="${ds}" aria-label="Adicionar tarefa em ${shortDate(ds)}">${I.plus}</button></div>
        ${items.slice(0, 4).map(chipHtml).join('')}
        ${items.length > 4 ? `<button class="more" data-a="cal-sel" data-date="${ds}">+${items.length - 4} mais</button>` : ''}</div>`;
    }
    body = `<div class="cal${mob ? ' compact' : ''}"><div class="wd">${wd.map(w => `<span>${w}</span>`).join('')}</div><div class="grid" style="grid-template-rows:repeat(${weeks},minmax(0,1fr))">${cells}</div></div>${mob || (byDay[S.calSel] || []).length > 4 ? agendaHtml() : ''}`;
  }
  const unit = mode === 'week' ? 'Semana' : 'Mês';
  const head = `<div class="cal-nav"><button class="icon-btn bordered" data-a="cal-prev" aria-label="${unit} anterior">${I.left}</button><button class="icon-btn bordered" data-a="cal-next" aria-label="Próxim${mode === 'week' ? 'a semana' : 'o mês'}">${I.right}</button><button class="btn ghost" data-a="cal-today">Hoje</button>
    <div class="seg mini" role="tablist" aria-label="Período"><button role="tab" aria-selected="${mode === 'month'}" class="${mode === 'month' ? 'on' : ''}" data-a="cal-mode" data-m="month">Mês</button><button role="tab" aria-selected="${mode === 'week'}" class="${mode === 'week' ? 'on' : ''}" data-a="cal-mode" data-m="week">Semana</button></div></div>`;
  paint(main, headHtml(title, '', head + viewSwitch('calendar') + rambleBtn()) + `<div class="scroll cal-scroll" data-scroll="cal-${mode}">${body}</div>`);
}
function calShift(dir) {
  if ((S.calMode || 'month') === 'week') { S.calSel = addDays(S.calSel, 7 * dir); S.calMonth = S.calSel.slice(0, 7); }
  else { const [y, m] = S.calMonth.split('-').map(Number); const d = new Date(y, m - 1 + dir, 1); S.calMonth = ymd(d).slice(0, 7); S.calSel = S.calSel.slice(0, 7) === S.calMonth ? S.calSel : ymd(d); }
  render();
}

/* ---------- matriz de Eisenhower ---------- */
const isImportant = t => (t.priority || 4) <= 2;
const isUrgent = t => { const lim = addDays(today(), 2); return (t.due && t.due <= lim) || (t.deadline && t.deadline <= lim); };
const QUADS = [
  ['do', 'Fazer primeiro', 'Faça hoje', true, true],
  ['plan', 'Agendar', 'Escolha um horário', true, false],
  ['delegate', 'Delegar ou simplificar', 'Dá para alguém ajudar?', false, true],
  ['drop', 'Depois ou descartar', 'Tudo bem deixar ir', false, false],
];
function renderMatrix(main) {
  const tasks = openTasks();
  const quads = QUADS.map(([k, name, hint, imp, urg]) => {
    const list = tasks.filter(t => isImportant(t) === imp && !!isUrgent(t) === urg).sort(PRIO_ORDER);
    return `<section class="quad q-${k}" data-drop="quad" data-quad="${k}">
      <div class="quad-h"><h2>${name}</h2><span class="meta">${hint}</span><span class="grow"></span><span class="count">${list.length}</span>
      <button class="icon-btn sm" data-a="quad-add" data-quad="${k}" aria-label="Adicionar em ${name}">${I.plus}</button></div>
      <div class="quad-list">${list.map(t => taskRow(t, { compact: true, drag: true })).join('') || '<p class="muted small">Nada aqui.</p>'}</div></section>`;
  }).join('');
  paint(main, headHtml('Prioridades', 'Todas as tarefas abertas', viewSwitch('matrix') + rambleBtn()) +
    `<p class="matrix-help">Importante = prioridade P1 ou P2. Urgente = data ou prazo nos próximos 2 dias.${touchOnly ? '' : ' Arraste uma tarefa para outro quadro e o Den ajusta a prioridade e a data.'}</p>
    <div class="scroll matrix" data-scroll="matrix"><span class="axis ax-top a1">Urgente</span><span class="axis ax-top a2">Não urgente</span><span class="axis ax-side s1">Importante</span><span class="axis ax-side s2">Não importante</span>${quads}</div>`);
}
function moveToQuad(t, q) {
  const [, , , imp, urg] = QUADS.find(x => x[0] === q);
  const patch = {};
  if (imp && !isImportant(t)) patch.priority = 2;
  if (!imp && isImportant(t)) patch.priority = 3;
  if (urg && !isUrgent(t)) patch.due = today();
  if (!urg && isUrgent(t)) { patch.due = addDays(today(), 7); if (t.deadline && t.deadline <= addDays(today(), 2)) patch.deadline = null; }
  return patch;
}

/* ================= notas ================= */
function currentNotes() {
  let notes = all('note');
  if (S.view.type === 'search') { const q = S.search.toLowerCase(); notes = q ? notes.filter(n => n.body.toLowerCase().includes(q)) : []; }
  else if (S.view.type === 'tag') notes = notes.filter(n => hasTag(n, S.view.tag));
  return notesSorted(notes);
}
function currentTasks() {
  if (S.view.type === 'search') { const q = S.search.toLowerCase(); return q ? all('task').filter(t => !t.done && ((t.title || '') + ' ' + (t.desc || '')).toLowerCase().includes(q)).sort(PRIO_ORDER) : []; }
  if (S.view.type === 'tag') return openTasks().filter(t => hasTag(t, S.view.tag)).sort(PRIO_ORDER);
  return [];
}
const noteTime = ms => { const d = new Date(ms); return ymd(d) === today() ? `${pad(d.getHours())}:${pad(d.getMinutes())}` : shortDate(ymd(d)); };
let editorKey = null, noteTimer = null, listTimer = null, delConfirm = false;
const dirtyNotes = new Set();

function renderNotes(main) {
  if (!$('.notes-wrap', main)) { main.innerHTML = `<div class="notes-wrap"><section class="list-pane"></section><section class="editor-pane"></section></div>`; editorKey = null; }
  const notes = currentNotes(), tasks = currentTasks();
  if (S.noteId && (!get(S.noteId) || get(S.noteId).deleted)) S.noteId = null;
  $('.notes-wrap', main).classList.toggle('reading', !!(S.reading && S.noteId));
  const pane = $('.list-pane', main);
  const isSearch = S.view.type === 'search';
  const title = isSearch ? 'Buscar' : S.view.type === 'tag' ? '#' + S.view.tag : 'Notas';
  const sub = isSearch ? (S.search ? `${tasks.length + notes.length} resultados` : '') : `${notes.length} nota${notes.length === 1 ? '' : 's'}`;
  let h = '';
  if (tasks.length) h += `<div class="mini-h">Tarefas · ${tasks.length}</div><div class="mini-tasks">${tasks.map(t => taskRow(t, { compact: true })).join('')}</div><div class="mini-h">Notas · ${notes.length}</div>`;
  h += notes.map(n => `<button class="ncard${n.id === S.noteId ? ' on' : ''}" data-a="open-note" data-id="${esc(n.id)}">
      <h3>${n.pinned ? ic('pin', 'sm') : ''}<span class="nt">${esc(noteTitle(n))}</span></h3>
      <p>${esc(noteSnippet(n)) || '<span class="muted">Sem texto adicional</span>'}</p><time>${noteTime(n.updatedAt)}</time></button>`).join('');
  if (!notes.length && !tasks.length) h += isSearch ? emptyMsg(S.search ? 'Nada encontrado' : 'Busque em tudo', S.search ? 'Tente outra palavra ou uma #etiqueta.' : 'Tarefas e notas aparecem aqui enquanto você digita.') : emptyMsg('Nenhuma nota ainda', 'Toque em ✎ para começar a escrever.');
  const prev = $('.list-scroll', pane)?.scrollTop || 0;
  const searchBox = isSearch ? `<label class="search-inline">${ic('search', 'sm')}<input id="search-inline" type="search" placeholder="Buscar tarefas e notas" value="${esc(S.search)}" autocomplete="off" enterkeyhint="search"></label>` : '';
  const hadFocus = document.activeElement?.id === 'search-inline';
  pane.innerHTML = `<header class="head"><button class="icon-btn menu-btn" data-a="side-open" aria-label="Abrir menu">${I.menu}</button><h1>${esc(title)}</h1><span class="sub">${esc(sub)}</span><span class="netslot">${netChip()}</span><span class="grow"></span><button class="icon-btn" data-a="new-note" aria-label="Nova nota">${I.pen}</button></header><div class="netbar-slot">${netBar()}</div>${searchBox}<div class="list-scroll">${h}</div>`;
  $('.list-scroll', pane).scrollTop = prev;
  const si = $('#search-inline', pane);
  if (si) { si.addEventListener('input', e => { S.search = e.target.value.trim(); $('#search').value = e.target.value; renderNotes(main); }); if (hadFocus) { si.focus(); si.setSelectionRange(si.value.length, si.value.length); } }
  renderEditor($('.editor-pane', main));
}
function sentSet(n) { return new Set(all('task').filter(t => t.noteId === n.id && typeof t.noteLine === 'number').map(t => t.noteLine)); }
function renderEditor(pane, force) {
  const n = S.noteId && get(S.noteId);
  const key = (n ? n.id : '') + '|' + S.noteMode + '|' + delConfirm + '|' + (n ? !!n.pinned : '');
  if (!force && key === editorKey && pane.firstChild) {
    const ta = $('#ed-ta', pane);
    if (n && ta && document.activeElement !== ta && ta.value !== n.body) ta.value = n.body;
    if (n && S.noteMode === 'read' && !ta) { const md = $('.md', pane); if (md) md.innerHTML = renderMd(n.body, sentSet(n), ic('send', 'sm')); }
    if (n) $('.ed-foot', pane).innerHTML = footHtml(n);
    return;
  }
  editorKey = key;
  if (!n) { pane.innerHTML = `<div class="ed-empty"><div><b>Escolha uma nota ou comece uma nova</b><p>Markdown, ==destaques== e #etiquetas funcionam aqui.</p><button class="btn primary" data-a="new-note">Nova nota</button></div></div>`; return; }
  const read = S.noteMode === 'read';
  const f = (k, label, inner, st = '') => `<button class="fmt" data-a="fmt" data-f="${k}" title="${label}" aria-label="${label}" ${st}>${inner}</button>`;
  pane.innerHTML = `<div class="ed-bar">
      <button class="fmt back-btn" data-a="back" aria-label="Voltar para notas">${I.back}</button>
      ${read ? '' : f('h', 'Título', 'H') + f('b', 'Negrito', 'B') + f('i', 'Itálico', '<i>I</i>') + f('hl', 'Destaque', '<span class="hl-ic">H</span>') + f('todo', 'Item de checklist', I.list) + f('code', 'Código', '&lt;/&gt;') + f('tag', 'Etiqueta', '#')}
      <span class="grow"></span>
      ${delConfirm ? `<span class="confirm">Apagar nota? <button class="btn danger" data-a="note-del-yes">Apagar</button><button class="btn ghost" data-a="note-del-no">Manter</button></span>` : `
      <button class="fmt${n.pinned ? ' on' : ''}" data-a="note-pin" aria-label="${n.pinned ? 'Desafixar' : 'Fixar no topo'}">${I.pin}</button>
      <button class="fmt${read ? '' : ' on'}" data-a="note-mode" aria-label="${read ? 'Editar' : 'Ler'}">${read ? I.pen : I.eye}</button>
      <button class="fmt" data-a="note-del" aria-label="Apagar nota">${I.trash}</button>`}
    </div>
    <div class="ed-scroll"><div class="ed-inner">${read ? `<div class="md">${renderMd(n.body, sentSet(n), ic('send', 'sm'))}</div>` : `<textarea class="ed-ta" id="ed-ta" spellcheck="true" placeholder="Comece com um # Título">${esc(n.body)}</textarea>`}</div></div>
    <div class="ed-foot">${footHtml(n)}</div>`;
  const ta = $('#ed-ta', pane);
  if (ta) {
    ta.addEventListener('input', onNoteInput);
    ta.addEventListener('blur', () => flushNote(n.id));
    ta.addEventListener('keydown', e => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'b') { e.preventDefault(); fmt('b'); }
      else if (mod && e.key.toLowerCase() === 'i') { e.preventDefault(); fmt('i'); }
      else if (e.key === 'Enter' && !e.shiftKey) continueList(e, ta);
    });
  }
}
function footHtml(n) {
  const words = (n.body.match(/\S+/g) || []).length;
  const linked = all('task').filter(t => t.noteId === n.id && !t.done).length;
  return `<span>${words} palavra${words === 1 ? '' : 's'}</span><span>Editada ${noteTime(n.updatedAt)}</span>${linked ? `<span>${linked} tarefa${linked === 1 ? '' : 's'} vinculada${linked === 1 ? '' : 's'}</span>` : ''}`;
}
function continueList(e, ta) {
  const s = ta.selectionStart; if (s !== ta.selectionEnd) return;
  const before = ta.value.slice(0, s); const line = before.slice(before.lastIndexOf('\n') + 1);
  const m = line.match(/^(\s*)([-*+] \[[ xX]\] |[-*+] |(\d+)[.)] )(.*)$/);
  if (!m) return;
  e.preventDefault();
  if (!m[4].trim()) ta.setRangeText('', s - line.length, s, 'end');
  else {
    let marker = m[2];
    if (/\[[ xX]\]/.test(marker)) marker = marker.replace(/\[[xX]\]/, '[ ]');
    else if (m[3]) marker = (+m[3] + 1) + marker.slice(m[3].length);
    ta.setRangeText('\n' + m[1] + marker, s, s, 'end');
  }
  onNoteInput();
}
function onNoteInput() {
  const ta = $('#ed-ta'); const n = get(S.noteId); if (!ta || !n) return;
  n.body = ta.value; n.updatedAt = Date.now(); dirtyNotes.add(n.id);
  clearTimeout(noteTimer); noteTimer = setTimeout(() => flushNote(n.id), 700);
  clearTimeout(listTimer); listTimer = setTimeout(() => { if (layoutOf() === 'notes') renderNotes($('#main')); }, 300);
}
function flushNote(id) {
  if (!dirtyNotes.has(id)) return;
  clearTimeout(noteTimer); dirtyNotes.delete(id);
  const n = get(id); if (n) put(n, { silent: true });
  renderSide();
}
function fmt(f) {
  const ta = $('#ed-ta'); if (!ta) return;
  const s = ta.selectionStart, e = ta.selectionEnd, sel = ta.value.slice(s, e);
  const lineStart = ta.value.lastIndexOf('\n', s - 1) + 1;
  ta.focus();
  const wrap = (a, b = a, ph = 'texto') => { ta.setRangeText(a + (sel || ph) + b, s, e, 'select'); if (!sel) ta.setSelectionRange(s + a.length, s + a.length + ph.length); };
  if (f === 'b') wrap('**');
  else if (f === 'i') wrap('*');
  else if (f === 'hl') wrap('==');
  else if (f === 'code') wrap('`', '`', 'código');
  else if (f === 'tag') ta.setRangeText(s > 0 && !/\s/.test(ta.value[s - 1]) ? ' #' : '#', s, e, 'end');
  else if (f === 'h') { const line = ta.value.slice(lineStart); const m = line.match(/^(#{1,3})\s/); if (m) ta.setRangeText(m[1].length < 3 ? m[1] + '# ' : '', lineStart, lineStart + m[0].length, 'end'); else ta.setRangeText('## ', lineStart, lineStart, 'end'); }
  else if (f === 'todo') { const line = ta.value.slice(lineStart); const m = line.match(/^\s*[-*+] \[[ xX]\] /); if (m) ta.setRangeText('', lineStart, lineStart + m[0].length, 'end'); else ta.setRangeText('- [ ] ', lineStart, lineStart, 'end'); }
  onNoteInput();
}
function newNote() {
  cleanupEmptyNote();
  const now = Date.now(); const tag = S.view.type === 'tag' ? `\n\n#${S.view.tag}` : '';
  const n = { id: uid('n'), kind: 'note', body: '# ' + tag, pinned: false, createdAt: now };
  if (layoutOf() !== 'notes' || S.view.type === 'search') { S.view = { type: 'notes' }; saveView(); }
  S.noteId = n.id; S.noteMode = 'edit'; delConfirm = false;
  if (isMobile() && !layers.includes('note')) pushLayer('note');
  S.reading = true;
  put(n);
  const ta = $('#ed-ta'); if (ta) { ta.focus(); ta.setSelectionRange(2, 2); }
  closeSide();
}
function cleanupEmptyNote() {
  const n = S.noteId && get(S.noteId);
  if (n && !n.deleted && !n.body.replace(/#[\p{L}\p{N}_\-\/]+/gu, '').replace(/[#\s]/g, '')) { clearTimeout(noteTimer); dirtyNotes.delete(n.id); remove(n.id); }
  else if (n) flushNote(n.id);
}
function openNote(id) {
  if (S.noteId !== id) cleanupEmptyNote();
  if (layoutOf() !== 'notes') { S.view = { type: 'notes' }; saveView(); }
  if (S.noteId !== id) { S.noteId = id; S.noteMode = 'read'; delConfirm = false; }
  closeOverlay().then(() => { const was = S.reading; S.reading = true; render(); if (isMobile() && !was && !layers.includes('note')) pushLayer('note'); });
}

/* ================= ajustes ================= */
function renderSettings(main) {
  const st = store.state; const ns = notifState();
  const notifTxt = { granted: 'Ativadas neste aparelho', denied: 'Bloqueadas. Libere nas configurações do navegador. No iPhone: Ajustes › Notificações › Den.', default: 'Ainda não ativadas', unsupported: standalone() ? 'Este navegador não oferece notificações.' : 'No iPhone, instale o Den na Tela de Início para ativar.' }[ns];
  const pushNote = st.uid === 'local'
    ? '<p class="muted small">Sem conta, os avisos só aparecem com o Den aberto. Entre na sua conta para receber com o app fechado.</p>'
    : '<p class="muted small">Você recebe um aviso no horário de cada tarefa e quando o Pomodoro termina, mesmo com o Den fechado. Funciona no iPhone (com o Den instalado na Tela de Início) e no navegador do computador. Ative em cada aparelho.</p>';
  const field = (id, label, val, min, max) => `<label class="num-field"><span>${label}</span><input type="number" inputmode="numeric" id="${id}" min="${min}" max="${max}" value="${val}"></label>`;
  paint(main, headHtml('Ajustes') + `<div class="scroll" data-scroll="settings"><div class="settings">
    <section><h2>Conta</h2>${st.uid === 'local'
      ? `<p>Você está usando o Den sem conta. Os dados ficam só neste aparelho.</p><button class="btn primary" data-a="go-auth">Entrar ou criar conta</button>`
      : `<p><b>${esc(st.email || '')}</b></p><p class="muted small">Status: ${esc({ synced: 'sincronizado', saving: 'salvando…', offline: 'sem internet, as mudanças vão sincronizar depois', error: 'erro ao sincronizar, tentando de novo' }[st.status] || st.status)}</p>
         <div class="row"><button class="btn ghost" data-a="sync-now">Sincronizar agora</button><button class="btn danger" data-a="sign-out">Sair</button></div>`}</section>
    <section><h2>Notificações</h2><p>${notifTxt}</p>${ns === 'default' ? '<button class="btn primary" data-a="enable-notif">Ativar notificações</button>' : ''}${ns === 'granted' ? `<div class="row"><button class="btn ghost" data-a="test-notif">Testar neste aparelho</button>${st.uid !== 'local' ? '<button class="btn ghost" data-a="test-push">Testar com o app fechado</button>' : ''}</div>` : ''}${pushNote}</section>
    <section><h2>Tema</h2><div class="themes" role="radiogroup" aria-label="Tema">${THEMES.map(t => `<button role="radio" aria-checked="${prefs.theme === t.k}" class="theme-opt${prefs.theme === t.k ? ' on' : ''}" data-a="theme" data-v="${t.k}">
      <span class="tp" aria-hidden="true"><span class="s" style="background:${t.side}"><i style="background:${t.acc};width:70%"></i><i style="background:${t.sideLine || 'rgba(255,255,255,.25)'}"></i><i style="background:${t.sideLine || 'rgba(255,255,255,.25)'};width:80%"></i></span><span class="c" style="background:${t.bg}"><i style="background:${t.line};width:80%"></i><i style="background:${t.line}"></i><i style="background:${t.acc};width:35%"></i></span></span>
      <b>${t.name}</b><small>${t.desc}</small></button>`).join('')}</div></section>
    <section><h2>Tamanho do texto</h2><p class="muted small">Vale para o celular. No computador, use o zoom do navegador.</p><div class="seg" role="radiogroup" aria-label="Tamanho do texto">${[['normal', 'Normal'], ['grande', 'Grande'], ['maior', 'Maior']].map(([k, l]) => `<button role="radio" aria-checked="${prefs.textSize === k}" class="${prefs.textSize === k ? 'on' : ''}" data-a="text-size" data-v="${k}">${l}</button>`).join('')}</div></section>
    <section><h2>Pomodoro</h2><div class="nums">${field('pf-focus', 'Foco (min)', prefs.focusMin, 5, 120)}${field('pf-short', 'Pausa curta', prefs.shortMin, 1, 30)}${field('pf-long', 'Pausa longa', prefs.longMin, 5, 60)}${field('pf-every', 'Pausa longa a cada', prefs.longEvery, 2, 8)}</div></section>
    <section><h2>Ramble</h2><label class="num-field wide"><span>Idioma da fala</span><select id="pf-lang"><option value="pt-BR"${prefs.rambleLang === 'pt-BR' ? ' selected' : ''}>Português (Brasil)</option><option value="en-US"${prefs.rambleLang === 'en-US' ? ' selected' : ''}>English</option></select></label></section>
    ${standalone() ? '' : `<section><h2>Instalar no iPhone</h2><ol class="steps"><li>Abra este endereço no <b>Safari</b>.</li><li>Toque em <b>Compartilhar</b> (o quadrado com a seta).</li><li>Escolha <b>Adicionar à Tela de Início</b>.</li><li>Abra o Den pelo ícone e ative as notificações aqui.</li></ol></section>`}
    <section><h2>Seus dados</h2><p class="muted small">Baixe uma cópia de todas as tarefas, notas e projetos.</p><button class="btn ghost" data-a="export">Exportar (JSON)</button></section>
    <p class="muted small center">Den · versão ${esc(cfg.version)}</p>
  </div></div>`);
  const bind = (id, k) => $('#' + id)?.addEventListener('change', e => { const v = +e.target.value; if (v > 0) { prefs[k] = v; savePrefs(); toast('Ajuste salvo'); } });
  bind('pf-focus', 'focusMin'); bind('pf-short', 'shortMin'); bind('pf-long', 'longMin'); bind('pf-every', 'longEvery');
  $('#pf-lang')?.addEventListener('change', e => { prefs.rambleLang = e.target.value; savePrefs(); });
}

/* ================= render principal ================= */
let lastLayout = null;
function layoutOf() {
  const t = S.view.type;
  if (['notes', 'tag', 'search'].includes(t)) return 'notes';
  if (t === 'calendar' || t === 'matrix' || t === 'settings') return t;
  return 'tasks';
}
const VIEW_TITLE = { today: 'Hoje', inbox: 'Entrada', upcoming: 'Em breve', project: 'Projeto', calendar: 'Calendário', matrix: 'Prioridades', notes: 'Notas', tag: 'Etiqueta', search: 'Buscar', settings: 'Ajustes' };
function skeletonHtml() {
  const row = w => `<div class="sk-row"><span class="sk-ck"></span><span class="sk-lines"><span class="sk" style="width:${w}%"></span><span class="sk sm" style="width:${w - 25}%"></span></span></div>`;
  return `<div class="scroll" data-scroll="sk"><div class="task-col sk-wrap" aria-busy="true">${row(72)}${row(56)}${row(64)}${row(48)}<p class="sk-msg" role="status">Sincronizando suas tarefas…</p></div></div>`;
}
function renderMain() {
  const main = $('#main'); const lay = layoutOf();
  if (S.loading && !store.state.items.size && lay !== 'settings') { lastLayout = null; main.innerHTML = headHtml(VIEW_TITLE[S.view.type] || 'Den') + skeletonHtml(); return; }
  if (lay !== lastLayout) { main.innerHTML = ''; lastLayout = lay; editorKey = null; }
  main.dataset.layout = lay;
  if (lay === 'tasks') renderTasks(main);
  else if (lay === 'notes') renderNotes(main);
  else if (lay === 'calendar') renderCalendar(main);
  else if (lay === 'matrix') renderMatrix(main);
  else renderSettings(main);
}
function render() {
  if (!S.started) return;
  renderSide(); renderSync(); renderTabbar(); renderMain(); renderFocusPill();
}
function closeSide() { if (layers.includes('side')) popLayer('side'); else $('#app').classList.remove('side-open'); }
function openSide() { if (!$('#app').classList.contains('side-open')) { $('#app').classList.add('side-open'); pushLayer('side'); } }
async function go(view) {
  await closeAllLayers();
  applyView(view, true);
}
function applyView(view, push) {
  cleanupEmptyNote();
  S.view = view; S.composerKey = null; composerEl = null; S.reading = false;
  if (view.type !== 'search') { S.search = ''; $('#search').value = ''; }
  if (view.type === 'notes' || view.type === 'tag') {
    const pool = view.type === 'tag' ? all('note').filter(n => hasTag(n, view.tag)) : all('note');
    if (!S.noteId || !pool.some(n => n.id === S.noteId)) { const s = notesSorted(pool)[0]; S.noteId = s && !isMobile() ? s.id : null; S.noteMode = 'read'; }
  }
  saveView(); $('#app').classList.remove('side-open'); render();
  if (push) afterPops(() => history.pushState({ den: 1, view }, '', '#' + hashFor(view)));
  $('#main .scroll')?.scrollTo?.(0, 0);
  if (view.type === 'search' && isMobile()) $('#search-inline')?.focus();
}

/* ================= histórico: o voltar do iPhone, Android e navegador fecha a camada de cima ================= */
const layers = []; const popWaiters = []; let pendingPops = 0; let popChain = Promise.resolve();
const afterPops = fn => { popChain = popChain.then(fn); return popChain; };
function pushLayer(kind) { layers.push(kind); afterPops(() => history.pushState({ den: 1, layer: kind, view: S.view }, '')); }
function closeLayerUI(kind) {
  if (kind === 'overlay') closeOverlayNow();
  else if (kind === 'focus') { focusOpen = false; renderFocus(); renderFocusPill(); }
  else if (kind === 'note') { cleanupEmptyNote(); S.reading = false; render(); }
  else if (kind === 'side') $('#app').classList.remove('side-open');
}
function popLayer(kind) {
  const i = kind ? layers.lastIndexOf(kind) : layers.length - 1;
  if (i < 0) { closeLayerUI(kind); return popChain; }
  const k = layers[i]; layers.splice(i, 1); closeLayerUI(k);
  if (i !== layers.length) return popChain;
  pendingPops++;
  return afterPops(() => new Promise(res => { popWaiters.push(res); history.back(); setTimeout(res, 600); }));
}
async function closeAllLayers() { while (layers.length) await popLayer(); await popChain; }
addEventListener('popstate', e => {
  if (pendingPops) { pendingPops--; const w = popWaiters.shift(); if (w) w(); return; }
  const kind = layers.pop();
  if (kind) closeLayerUI(kind);
  else if (e.state && e.state.den && e.state.view) applyView(e.state.view, false);
});
const VIEW_HASH = { today: 'hoje', inbox: 'entrada', upcoming: 'em-breve', calendar: 'calendario', matrix: 'prioridades', notes: 'notas', search: 'buscar', settings: 'ajustes' };
function hashFor(v) { if (v.type === 'project') return 'projeto-' + v.id; if (v.type === 'tag') return 'etiqueta-' + encodeURIComponent(v.tag); return VIEW_HASH[v.type] || 'hoje'; }
function viewFromHash(h) {
  h = decodeURIComponent((h || '').replace(/^#/, '')); if (!h) return null;
  if (h.startsWith('projeto-')) return { type: 'project', id: h.slice(8) };
  if (h.startsWith('etiqueta-')) return { type: 'tag', tag: h.slice(9) };
  const t = Object.keys(VIEW_HASH).find(k => VIEW_HASH[k] === h); return t ? { type: t } : null;
}

/* ================= toast ================= */
let toastTimer = null, toastFn = null;
function toast(msg, undo, ms) {
  const root = $('#toast-root');
  root.innerHTML = `<div class="toast" role="status"><span></span>${undo ? '<button data-a="undo">Desfazer</button>' : ''}</div>`;
  root.firstChild.firstChild.textContent = msg;
  toastFn = undo || null;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { root.innerHTML = ''; toastFn = null; }, ms || (undo ? 6000 : 2600));
}

/* ================= criar tarefa ================= */
function buildComposer(cfgC) {
  const el = document.createElement('form'); el.className = 'composer'; el.autocomplete = 'off';
  const projOpts = `<option value="">Entrada</option>` + projects().map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
  el.innerHTML = `<label class="sr" for="c-title">Nome da tarefa</label>
    <input class="c-title" id="c-title" placeholder="Ex.: Ligar pro dentista sexta às 10 p2 #saúde" enterkeyhint="done">
    <textarea class="c-desc" id="c-desc" rows="1" placeholder="Descrição" aria-label="Descrição"></textarea>
    <div class="c-parse"></div>
    <div class="c-row">
      <label class="chip" title="Data">${ic('cal', 'sm')}<input type="date" id="c-due" aria-label="Data"></label>
      <label class="chip" title="Hora">${ic('timer', 'sm')}<input type="time" id="c-time" aria-label="Hora"></label>
      <label class="chip" title="Prioridade">${ic('flag', 'sm')}<select id="c-pri" aria-label="Prioridade"><option value="1">P1</option><option value="2">P2</option><option value="3">P3</option><option value="4">P4</option></select></label>
      <label class="chip" title="Projeto">${ic('inbox', 'sm')}<select id="c-proj" aria-label="Projeto">${projOpts}</select></label>
      <span class="grow"></span>
      <button type="button" class="icon-btn" data-c="mic" aria-label="Adicionar por voz">${I.mic}</button>
      <button type="button" class="btn ghost" data-c="cancel">Cancelar</button>
      <button type="submit" class="btn primary" disabled>Adicionar</button>
    </div>`;
  const ti = $('#c-title', el), de = $('#c-desc', el), du = $('#c-due', el), tm = $('#c-time', el), pr = $('#c-pri', el), pj = $('#c-proj', el), sub = $('[type=submit]', el), parse = $('.c-parse', el);
  const P = cfgC.preset || {};
  let manualDue = P.due || '', manualTime = '', manualPri = P.priority || 4;
  pj.value = P.project || '';
  const update = () => {
    const q = parseQuick(ti.value);
    du.value = q.due || manualDue; tm.value = q.time || manualTime; pr.value = String(q.priority || manualPri);
    parse.innerHTML = q.found.map(f => `<span>${esc(f)}</span>`).join('');
    sub.disabled = !q.title;
  };
  ti.addEventListener('input', update);
  du.addEventListener('change', () => { manualDue = du.value; });
  tm.addEventListener('change', () => { manualTime = tm.value; if (tm.value && !du.value) { manualDue = today(); du.value = manualDue; } });
  pr.addEventListener('change', () => { manualPri = +pr.value; });
  de.addEventListener('input', () => { de.style.height = 'auto'; de.style.height = de.scrollHeight + 'px'; });
  el.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); cfgC.onClose(); } });
  $('[data-c=cancel]', el).addEventListener('click', () => cfgC.onClose());
  $('[data-c=mic]', el).addEventListener('click', () => { Promise.resolve(cfgC.onClose()).then(() => openRamble()); });
  el.addEventListener('submit', e => {
    e.preventDefault();
    const q = parseQuick(ti.value); if (!q.title) return;
    const now = Date.now();
    const t = { id: uid('t'), kind: 'task', title: q.title, desc: de.value.trim(), due: du.value || null, time: tm.value || null, deadline: q.deadline || P.deadline || null, priority: +pr.value || 4, project: pj.value || null, status: P.status || 'todo', done: false, createdAt: now, reminders: [] };
    if (t.due && t.time) t.reminders = [{ at: new Date(`${t.due}T${t.time}`).toISOString(), label: 'Na hora' }];
    put(t);
    toast('Tarefa adicionada' + (t.due ? ' para ' + dueLabel(t.due, t.time).toLowerCase() : ''));
    if (cfgC.closeOnAdd) { cfgC.onClose(); return; }
    ti.value = ''; de.value = ''; de.style.height = ''; manualPri = P.priority || 4; manualTime = ''; update(); ti.focus();
  });
  update();
  return el;
}
function openInlineComposer(key, preset) {
  if (isMobile()) { openQuickAdd(preset); return; }
  S.composerKey = key;
  composerEl = buildComposer({ preset, onClose: () => { S.composerKey = null; composerEl = null; render(); } });
  render(); $('#c-title', composerEl)?.focus();
}
function defaultPreset() {
  const v = S.view;
  if (v.type === 'today') return { due: today() };
  if (v.type === 'project') return { project: v.id };
  if (v.type === 'calendar') return { due: S.calSel };
  return {};
}
function openQuickAdd(preset = defaultPreset()) {
  openSheet(`<div class="qa-wrap"></div>`, 'Adicionar tarefa', 'qa');
  const c = buildComposer({ preset, closeOnAdd: true, onClose: closeOverlay });
  $('.qa-wrap').appendChild(c); $('#c-title', c).focus();
}

/* ================= sobreposições (modal no computador, folha no celular) ================= */
let lastFocus = null;
function openSheet(inner, label, cls = '') {
  const wasOpen = !!$('#overlay').firstChild;
  if (!wasOpen) lastFocus = document.activeElement;
  $('#overlay').innerHTML = `<div class="scrim" data-a="close-overlay"><div class="dialog ${cls}" role="dialog" aria-modal="true" aria-label="${esc(label)}" tabindex="-1"><div class="grabber" aria-hidden="true"></div>${inner}</div></div>`;
  document.body.classList.add('modal-open');
  if (!wasOpen) { pushLayer('overlay'); if (!$('#overlay').contains(document.activeElement)) $('#overlay .dialog').focus({ preventScroll: true }); }
}
let dialogTask = null, dlgTimer = null, dlgConfirm = false, remCustom = false;
function closeOverlay() { return $('#overlay').firstChild ? popLayer('overlay') : popChain; }
function closeOverlayNow() {
  if (!$('#overlay').firstChild) return;
  if (dialogTask && dlgTimer) { clearTimeout(dlgTimer); const cur = get(dialogTask); if (cur) put(cur, { silent: true }); }
  $('#overlay').innerHTML = ''; dialogTask = null; dlgTimer = null; document.body.classList.remove('modal-open');
  if (ramble.rec) stopListening();
  if (lastFocus && document.contains(lastFocus)) try { lastFocus.focus({ preventScroll: true }); } catch {}
  lastFocus = null;
}

/* ---------- detalhes da tarefa ---------- */
function openTask(id) { dialogTask = id; dlgConfirm = false; remCustom = false; renderDialog(); }
const remLabel = r => { const d = new Date(r.at); return `${WD_SHORT[d.getDay()]}, ${d.getDate()} ${MO[d.getMonth()]} · ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
function renderDialog() {
  const t = get(dialogTask);
  if (!t || t.deleted) { closeOverlay(); return; }
  const p = projById(t.project); const note = t.noteId && get(t.noteId);
  const keepScroll = $('#overlay .dlg-body')?.scrollTop || 0;
  const projOpts = `<option value="">Entrada</option>` + projects().map(x => `<option value="${esc(x.id)}"${x.id === t.project ? ' selected' : ''}>${esc(x.name)}</option>`).join('');
  const statusOpts = STATUSES.filter(s => s[0] !== 'done').map(([k, l]) => `<option value="${k}"${(t.status || 'todo') === k ? ' selected' : ''}>${l}</option>`).join('');
  const base = t.due ? new Date(`${t.due}T${t.time || '09:00'}`) : null;
  const rems = (t.reminders || []).slice().sort((a, b) => a.at.localeCompare(b.at));
  const pomoDone = t.pomos || 0, goal = t.pomoGoal || 0;
  const ring = goal ? Math.min(1, pomoDone / goal) : 0;
  const ns = notifState();
  const inner = `
    <div class="dlg-head">${p ? `<i class="pdot" style="background:${esc(p.color)}"></i>${esc(p.name)}` : `${ic('inbox', 'sm')} Entrada`}<span class="grow"></span>
      ${dlgConfirm ? `<span class="confirm">Apagar tarefa? <button class="btn danger" data-a="d-del-yes">Apagar</button><button class="btn ghost" data-a="d-del-no">Manter</button></span>` : `<button class="icon-btn" data-a="d-del" aria-label="Apagar tarefa">${I.trash}</button>`}
      <button class="icon-btn" data-a="close-overlay" aria-label="Fechar">${I.x}</button></div>
    <div class="dlg-body">
      <div class="dlg-main">
        <div class="dlg-title-row"><button class="check p${t.priority || 4}${t.done ? ' is-done' : ''}" data-a="d-toggle" aria-label="${t.done ? 'Marcar como não feita' : 'Concluir tarefa'}">${I.check}</button>
        <textarea class="dlg-title" id="d-title" rows="1" aria-label="Nome da tarefa">${esc(t.title)}</textarea></div>
        <textarea class="dlg-desc" id="d-desc" placeholder="Descrição. Markdown e #etiquetas funcionam aqui." aria-label="Descrição">${esc(t.desc || '')}</textarea>
        ${note && !note.deleted ? `<button class="dlg-link" data-a="open-note" data-id="${esc(note.id)}">${ic('notes', 'sm')} Da nota: ${esc(noteTitle(note))}</button>` : ''}
        <div class="pomo-card">
          <svg width="48" height="48" viewBox="0 0 48 48" class="pomo-ring"><circle cx="24" cy="24" r="19" class="trk"/><circle cx="24" cy="24" r="19" class="bar" stroke-dasharray="119.4" stroke-dashoffset="${(119.4 * (1 - ring)).toFixed(1)}"/></svg>
          <div class="grow"><b>Pomodoros: ${pomoDone}${goal ? ' de ' + goal : ''}</b><span class="muted small">${t.focusMin ? `${t.focusMin} min de foco` : 'Nenhuma sessão ainda'}</span></div>
          <div class="pomo-goal"><span class="muted small">Meta</span><button class="stepper" data-a="d-goal" data-d="-1" aria-label="Diminuir meta">−</button><b>${goal || '–'}</b><button class="stepper" data-a="d-goal" data-d="1" aria-label="Aumentar meta">+</button></div>
          <button class="btn primary" data-a="focus-start" data-id="${esc(t.id)}">${ic('play', 'sm')}Iniciar foco</button>
        </div>
      </div>
      <div class="dlg-side">
        <div class="field"><label for="d-due">Data e hora</label><div class="row2"><input type="date" id="d-due" value="${esc(t.due || '')}"><input type="time" id="d-time" value="${esc(t.time || '')}" aria-label="Hora"></div>
          <div class="quick-dates"><button data-a="d-due" data-d="0">Hoje</button><button data-a="d-due" data-d="1">Amanhã</button><button data-a="d-due" data-d="next">Próx. semana</button><button data-a="d-due" data-d="">Sem data</button></div></div>
        <div class="field"><label for="d-deadline">Prazo</label><input type="date" id="d-deadline" value="${esc(t.deadline || '')}">
          ${t.deadline ? `<span class="muted small">${(() => { const n = diff(today(), t.deadline); return n < 0 ? 'Prazo vencido' : n === 0 ? 'Vence hoje' : `Faltam ${n} dia${n === 1 ? '' : 's'}`; })()}</span>` : '<span class="muted small">Quando precisa estar pronto</span>'}</div>
        <div class="field"><span class="flabel">Lembretes</span>
          ${rems.map((r, i) => `<div class="rem">${ic('bell', 'sm')}<span class="grow">${remLabel(r)}</span><span class="muted small">${esc(r.label || '')}</span><button class="icon-btn sm" data-a="rem-del" data-i="${(t.reminders || []).indexOf(r)}" aria-label="Remover lembrete">${I.x}</button></div>`).join('')}
          ${remCustom ? `<div class="row2"><input type="datetime-local" id="rem-custom" value="${base ? `${t.due}T${t.time || '09:00'}` : ''}"><button class="btn primary" data-a="rem-add-custom">Adicionar</button></div>`
            : `<select id="rem-add" aria-label="Adicionar lembrete"><option value="">+ Adicionar lembrete</option>${base ? '<option value="0">Na hora</option><option value="10">10 min antes</option><option value="30">30 min antes</option><option value="60">1 hora antes</option><option value="1440">1 dia antes</option>' : ''}<option value="custom">Escolher data e hora…</option></select>`}
          ${!base ? '<span class="muted small">Defina uma data para usar os atalhos.</span>' : ''}
          ${rems.length && ns === 'default' ? '<button class="link-btn" data-a="enable-notif">Ativar notificações neste aparelho</button>' : ''}
          ${rems.length && ns === 'unsupported' && !standalone() ? '<span class="muted small">No iPhone, instale o Den na Tela de Início para receber notificações.</span>' : ''}
        </div>
        <div class="field"><span class="flabel">Prioridade</span><div class="prios">${[1, 2, 3, 4].map(n => `<button class="q${n}${(t.priority || 4) === n ? ' on' : ''}" data-a="d-prio" data-p="${n}" aria-label="Prioridade ${n}">${ic('flag', 'sm')}P${n}</button>`).join('')}</div></div>
        <div class="field"><label for="d-proj">Projeto</label><select id="d-proj">${projOpts}</select></div>
        <div class="field"><label for="d-status">Etapa no quadro</label><select id="d-status">${statusOpts}</select></div>
      </div>
    </div>`;
  if ($('#overlay .task-dialog')) { $('#overlay .task-dialog').innerHTML = '<div class="grabber" aria-hidden="true"></div>' + inner; }
  else openSheet(inner, 'Detalhes da tarefa', 'task-dialog');
  $('#overlay .dlg-body').scrollTop = keepScroll;
  const ti = $('#d-title'), de = $('#d-desc');
  const grow = el => { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; };
  grow(ti);
  const save = () => { clearTimeout(dlgTimer); dlgTimer = setTimeout(() => { dlgTimer = null; const cur = get(t.id); if (cur) put(cur, { silent: true }); renderMainSoft(); }, 500); };
  ti.addEventListener('input', () => { grow(ti); const cur = get(t.id); cur.title = ti.value.replace(/\n/g, ' '); save(); });
  ti.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); de.focus(); } });
  de.addEventListener('input', () => { const cur = get(t.id); cur.desc = de.value; save(); });
  $('#d-proj').addEventListener('change', e => updateTask(t.id, { project: e.target.value || null }));
  $('#d-status').addEventListener('change', e => updateTask(t.id, { status: e.target.value }));
  $('#d-due').addEventListener('change', e => updateTask(t.id, retime(t, e.target.value || null, t.time)));
  $('#d-time').addEventListener('change', e => updateTask(t.id, retime(t, t.due || (e.target.value ? today() : null), e.target.value || null)));
  $('#d-deadline').addEventListener('change', e => updateTask(t.id, { deadline: e.target.value || null }));
  $('#rem-add')?.addEventListener('change', e => {
    const v = e.target.value; if (!v) return;
    if (v === 'custom') { remCustom = true; renderDialog(); return; }
    const at = new Date(base.getTime() - (+v) * 60e3);
    addReminder(t.id, at, { 0: 'Na hora', 10: '10 min antes', 30: '30 min antes', 60: '1 hora antes', 1440: '1 dia antes' }[v]);
  });
}
// Ao mudar a data/hora, lembretes relativos acompanham.
function retime(t, due, time) {
  const patch = { due, time };
  if (t.due && (t.reminders || []).length) {
    const oldBase = new Date(`${t.due}T${t.time || '09:00'}`).getTime();
    if (due) { const nb = new Date(`${due}T${time || '09:00'}`).getTime(); patch.reminders = t.reminders.map(r => r.label && r.label !== 'Personalizado' ? { ...r, at: new Date(nb - (oldBase - Date.parse(r.at))).toISOString() } : r); }
  } else if (due && time && !(t.reminders || []).length) patch.reminders = [{ at: new Date(`${due}T${time}`).toISOString(), label: 'Na hora' }];
  return patch;
}
function addReminder(id, at, label) {
  const t = get(id); if (!t) return;
  if (at.getTime() < Date.now()) { toast('Esse horário já passou. Escolha um horário futuro.'); renderDialog(); return; }
  const iso = at.toISOString();
  if ((t.reminders || []).some(r => r.at === iso)) { renderDialog(); return; }
  remCustom = false;
  updateTask(id, { reminders: [...(t.reminders || []), { at: iso, label }] });
  if (notifState() === 'default') toast('Lembrete criado. Ative as notificações para recebê-lo.');
}
function updateTask(id, patch) {
  const cur = get(id); if (!cur) return;
  put({ ...cur, ...patch });
  if (dialogTask === id) renderDialog();
}
let softTimer = null;
function renderMainSoft() { clearTimeout(softTimer); softTimer = setTimeout(() => { renderSide(); if (layoutOf() !== 'notes') renderMain(); }, 200); }

function toggleTask(id, rowEl) {
  const t = get(id); if (!t) return;
  const done = !t.done;
  const apply = () => {
    put({ ...t, done, doneAt: done ? Date.now() : null, status: done ? 'done' : (t.status === 'done' ? 'todo' : t.status) });
    if (done) { toast('Tarefa concluída', () => put({ ...get(id), done: false, doneAt: null, status: t.status === 'done' ? 'todo' : (t.status || 'todo') })); try { navigator.vibrate?.(15); } catch {} }
  };
  if (done && rowEl) { rowEl.classList.add('completing'); setTimeout(apply, 260); } else apply();
}

/* ---------- reagendar (deslizar para a esquerda) ---------- */
function openReschedule(id) {
  const t = get(id); if (!t) return;
  openSheet(`<div class="dlg-head"><b>Reagendar</b><span class="grow"></span><button class="icon-btn" data-a="close-overlay" aria-label="Fechar">${I.x}</button></div>
    <div class="resched"><p class="muted">${esc(plainTitle(t.title))}</p>
    ${[['0', 'Hoje'], ['1', 'Amanhã'], ['2', 'Depois de amanhã'], ['next', 'Próxima semana'], ['', 'Sem data']].map(([d, l]) => `<button class="resched-btn" data-a="resched" data-id="${esc(id)}" data-d="${d}">${ic('cal', 'sm')}${l}<span class="muted small">${d === '' ? '' : shortDate(d === 'next' ? nextWeek() : addDays(today(), +d))}</span></button>`).join('')}</div>`, 'Reagendar', 'narrow');
}

/* ================= projetos ================= */
function openProjectDialog(id) {
  const p = id ? projById(id) : null; let color = p ? p.color : PCOLORS[(projects().length * 3 + 6) % PCOLORS.length]; let confirmDel = false;
  const draw = () => {
    const name = $('#p-name')?.value ?? (p ? p.name : '');
    openSheet(`<form id="proj-form"><div class="dlg-head"><b>${p ? 'Editar projeto' : 'Novo projeto'}</b><span class="grow"></span><button type="button" class="icon-btn" data-a="close-overlay" aria-label="Fechar">${I.x}</button></div>
      <div class="form-pad">
        <div class="field"><label for="p-name">Nome</label><input type="text" id="p-name" maxlength="60" value="${esc(name)}" placeholder="Ex.: Casa"></div>
        <div class="field"><span class="flabel">Cor</span><div class="swatches">${PCOLORS.map(c => `<button type="button" class="${c === color ? 'on' : ''}" data-color="${c}" style="background:${c}" aria-label="Cor ${c}"></button>`).join('')}</div></div>
        <div class="form-actions">${p ? (confirmDel ? `<span class="confirm">Apagar? As tarefas vão para a Entrada. <button type="button" class="btn danger" id="p-del-yes">Apagar</button></span>` : `<button type="button" class="btn danger" id="p-del">Apagar</button>`) : ''}<span class="grow"></span><button type="button" class="btn ghost" data-a="close-overlay">Cancelar</button><button class="btn primary" type="submit">${p ? 'Salvar' : 'Criar projeto'}</button></div>
      </div></form>`, p ? 'Editar projeto' : 'Novo projeto', 'narrow');
    const nm = $('#p-name'); if (!isMobile()) { nm.focus(); nm.setSelectionRange(nm.value.length, nm.value.length); }
    $('.swatches').addEventListener('click', e => { const b = e.target.closest('[data-color]'); if (!b) return; color = b.dataset.color; draw(); });
    $('#p-del')?.addEventListener('click', () => { confirmDel = true; draw(); });
    $('#p-del-yes')?.addEventListener('click', () => {
      all('task').filter(t => t.project === p.id).forEach(t => put({ ...t, project: null }, { silent: true }));
      remove(p.id); closeOverlay(); go({ type: 'inbox' }); toast('Projeto apagado');
    });
    $('#proj-form').addEventListener('submit', e => {
      e.preventDefault(); const v = $('#p-name').value.trim(); if (!v) return;
      const now = Date.now();
      if (p) { put({ ...p, name: v, color }); closeOverlay(); }
      else { const np = { id: uid('p'), kind: 'project', name: v, color, order: now, createdAt: now }; put(np); closeOverlay(); go({ type: 'project', id: np.id }); }
    });
  };
  draw();
}

/* ================= Pomodoro ================= */
let F = LS.get('den:focus', null);
let focusOpen = false, focusTick = null;
const saveF = () => LS.set('den:focus', F);
const phaseMin = ph => ph === 'focus' ? prefs.focusMin : ph === 'short' ? prefs.shortMin : prefs.longMin;
const phaseName = ph => ph === 'focus' ? 'Foco' : ph === 'short' ? 'Pausa curta' : 'Pausa longa';
const remaining = () => !F ? 0 : F.running ? Math.max(0, F.endAt - Date.now()) : F.left;
const mmss = ms => { const s = Math.ceil(ms / 1000); return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; };
const focusLog = () => LS.get('den:focuslog', {});

async function serverTimer() {
  if (!F) return;
  if (F.serverId) { store.cancelServerReminder(F.serverId); F.serverId = null; }
  if (F.running) {
    const t = get(F.taskId);
    F.serverId = await store.scheduleServerReminder(F.phase === 'focus' ? `Pomodoro concluído: ${plainTitle(t?.title || '')}` : 'A pausa acabou. Hora de focar!', F.endAt, 'focus:' + F.taskId);
    saveF();
  }
}
function startFocus(taskId) {
  unlockAudio();
  if (F && F.taskId !== taskId && F.serverId) store.cancelServerReminder(F.serverId);
  const cycle = F && F.taskId === taskId ? F.cycle : 0;
  F = { taskId, phase: 'focus', running: true, endAt: Date.now() + prefs.focusMin * 60e3, left: 0, cycle };
  saveF(); serverTimer(); ensureTick();
  closeOverlay().then(() => { focusOpen = true; pushLayer('focus'); renderFocus(); });
}
function ensureTick() { clearInterval(focusTick); if (F) focusTick = setInterval(tick, 1000); }
function tick() {
  if (!F) { clearInterval(focusTick); return; }
  if (F.running && Date.now() >= F.endAt) completePhase();
  if (focusOpen) updateFocusTime(); renderFocusPill();
}
function completePhase() {
  const t = get(F.taskId);
  if (F.phase === 'focus') {
    if (t) put({ ...t, pomos: (t.pomos || 0) + 1, focusMin: (t.focusMin || 0) + prefs.focusMin }, { silent: true });
    const log = focusLog(); log[today()] = (log[today()] || 0) + prefs.focusMin; LS.set('den:focuslog', log);
    F.cycle++;
    F.phase = F.cycle % prefs.longEvery === 0 ? 'long' : 'short';
    F.running = true; F.endAt = Date.now() + phaseMin(F.phase) * 60e3;
    chime(); toast(`Pomodoro concluído! ${phaseName(F.phase)} de ${phaseMin(F.phase)} min.`, null, 5000);
    if (document.visibilityState !== 'visible' && !F.serverId) osNotify('Pomodoro concluído', `${phaseName(F.phase)} de ${phaseMin(F.phase)} min`, 'focus');
  } else {
    F.phase = 'focus'; F.running = false; F.left = prefs.focusMin * 60e3;
    chime(); toast('A pausa acabou. Pronto para o próximo?', null, 5000);
  }
  F.serverId = null; saveF(); serverTimer(); render(); if (focusOpen) renderFocus();
}
function focusAction(a) {
  if (!F) return;
  unlockAudio();
  if (a === 'pause') { F.left = remaining(); F.running = false; }
  else if (a === 'resume') { F.running = true; F.endAt = Date.now() + F.left; }
  else if (a === 'skip') { F.endAt = Date.now(); F.running = true; saveF(); completePhase(); return; }
  else if (a === 'stop') { if (F.serverId) store.cancelServerReminder(F.serverId); F = null; LS.del('den:focus'); if (layers.includes('focus')) popLayer('focus'); focusOpen = false; $('#focus-root').innerHTML = ''; clearInterval(focusTick); render(); return; }
  saveF(); serverTimer(); renderFocus();
}
function renderFocus() {
  const root = $('#focus-root');
  if (!F || !focusOpen) { root.innerHTML = ''; return; }
  const t = get(F.taskId); const p = t && projById(t.project);
  const total = phaseMin(F.phase) * 60e3; const frac = 1 - remaining() / total;
  const dots = Array.from({ length: prefs.longEvery }, (_, i) => `<i class="${i < F.cycle % prefs.longEvery ? 'full' : i === F.cycle % prefs.longEvery && F.phase === 'focus' ? 'cur' : ''}"></i>`).join('');
  const nextPh = F.phase === 'focus' ? ((F.cycle + 1) % prefs.longEvery === 0 ? 'long' : 'short') : 'focus';
  root.innerHTML = `<div class="focus ${F.phase}" role="dialog" aria-label="Foco">
    <div class="focus-top"><button class="icon-btn" data-a="focus-min" aria-label="Minimizar">${I.down}</button><span class="focus-label">${phaseName(F.phase).toUpperCase()}</span><span style="width:44px"></span></div>
    <div class="focus-task"><span class="muted">${p ? esc(p.name) : 'Entrada'}</span><h1>${esc(plainTitle(t?.title || 'Tarefa'))}</h1></div>
    <div class="focus-ring"><svg viewBox="0 0 280 280"><circle cx="140" cy="140" r="126" class="trk"/><circle cx="140" cy="140" r="126" class="bar" id="focus-bar" stroke-dasharray="791.7" stroke-dashoffset="${(791.7 * (1 - frac)).toFixed(1)}"/></svg>
      <div class="focus-time"><span id="focus-time">${mmss(remaining())}</span><small>${F.phase === 'focus' ? `Pomodoro ${(F.cycle % prefs.longEvery) + 1} de ${prefs.longEvery}` : 'Respire, levante, beba água'}</small></div></div>
    <div class="focus-dots" aria-label="Sessões">${dots}</div>
    <div class="focus-ctrls">
      <button class="fbtn" data-a="focus-act" data-f="stop" aria-label="Parar">${I.stop}</button>
      ${F.running ? `<button class="fbtn main" data-a="focus-act" data-f="pause" aria-label="Pausar">${I.pause}</button>` : `<button class="fbtn main" data-a="focus-act" data-f="resume" aria-label="Continuar">${I.play}</button>`}
      <button class="fbtn" data-a="focus-act" data-f="skip" aria-label="Pular">${I.skip}</button></div>
    <div class="focus-stats"><div><b>${focusLog()[today()] || 0} min</b><span>Foco hoje</span></div><div><b>${t?.pomos || 0}${t?.pomoGoal ? '/' + t.pomoGoal : ''}</b><span>Nesta tarefa</span></div><div><b>${phaseMin(nextPh)}:00</b><span>Depois: ${phaseName(nextPh).toLowerCase()}</span></div></div>
  </div>`;
}
function updateFocusTime() {
  const el = $('#focus-time'); if (!el || !F) return;
  el.textContent = mmss(remaining());
  const bar = $('#focus-bar'); if (bar) bar.setAttribute('stroke-dashoffset', (791.7 * (remaining() / (phaseMin(F.phase) * 60e3))).toFixed(1));
}
function renderFocusPill() {
  const el = $('#focus-pill');
  if (!F || focusOpen) { el.hidden = true; return; }
  const t = get(F.taskId);
  el.hidden = false;
  el.innerHTML = `<button class="pill-main" data-a="focus-open">${ic('timer', 'sm')}<b>${mmss(remaining())}</b><span>${F.running ? phaseName(F.phase) : 'Pausado'} · ${esc(plainTitle(t?.title || ''))}</span></button><button class="pill-x" data-a="focus-act" data-f="${F.running ? 'pause' : 'resume'}" aria-label="${F.running ? 'Pausar' : 'Continuar'}">${F.running ? I.pause : I.play}</button>`;
}

/* ================= Ramble (voz) ================= */
const ramble = { rec: null, finalText: '', listening: false, removed: new Set(), wantStop: false, items: null, editing: -1 };
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function openRamble() {
  unlockAudio();
  ramble.finalText = ''; ramble.removed = new Set(); ramble.items = null; ramble.editing = -1;
  openSheet(`<div class="dlg-head"><b>Ramble</b><span class="muted small">Fale à vontade. O Den separa em tarefas.</span><span class="grow"></span><button class="icon-btn" data-a="close-overlay" aria-label="Fechar">${I.x}</button></div>
    <div class="ramble">
      <label class="sr" for="ramble-text">O que você falou</label>
      <button class="link-btn" id="ramble-unfreeze" data-a="ramble-unfreeze" hidden>Editar o texto de novo (descarta as correções)</button>
      <textarea id="ramble-text" class="ramble-text" placeholder="${SR ? 'Toque no microfone e fale, por exemplo: “ligar pro banco amanhã às 10, comprar presente pra Ana até sábado e mandar o relatório pra Marta, é urgente”' : 'Toque no microfone do teclado para ditar, ou escreva. Ex.: ligar pro banco amanhã às 10, comprar presente pra Ana até sábado…'}"></textarea>
      <div class="ramble-found" id="ramble-found"></div>
      <div class="ramble-bottom">
        <div class="wave" id="wave" aria-hidden="true">${Array.from({ length: 24 }, (_, i) => `<i style="animation-delay:${(i * 73) % 600}ms"></i>`).join('')}</div>
        <span class="muted small" id="ramble-status">${SR ? 'Toque no microfone para começar' : 'Use o microfone do teclado para ditar'}</span>
        <div class="ramble-actions">
          ${SR ? `<button class="mic-btn" id="mic-btn" data-a="ramble-mic" aria-label="Começar a ouvir">${I.mic}</button>` : ''}
          <button class="btn dark big grow" id="ramble-add" data-a="ramble-add" disabled>Adicionar tarefas</button>
        </div>
      </div>
    </div>`, 'Ramble', 'ramble-dialog');
  const ta = $('#ramble-text');
  ta.addEventListener('input', () => { ramble.finalText = ta.value; updateRambleFound(); });
  if (SR) startListening(); else setTimeout(() => ta.focus(), 50);
}
function startListening() {
  if (!SR) return;
  try {
    const rec = new SR(); ramble.rec = rec; ramble.wantStop = false;
    rec.lang = prefs.rambleLang; rec.continuous = true; rec.interimResults = true;
    const baseText = () => ($('#ramble-text')?.value || '').trim();
    let committed = baseText();
    rec.onresult = e => {
      let interim = '', fin = '';
      for (let i = e.resultIndex; i < e.results.length; i++) { const r = e.results[i]; if (r.isFinal) fin += r[0].transcript; else interim += r[0].transcript; }
      if (fin) committed = (committed + ' ' + fin).trim();
      const ta = $('#ramble-text'); if (ta) ta.value = (committed + ' ' + interim).trim();
      ramble.finalText = ta ? ta.value : committed; updateRambleFound();
    };
    rec.onerror = e => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { ramble.wantStop = true; setRambleStatus('Sem acesso ao microfone. Use o microfone do teclado ou permita o acesso nos Ajustes.'); }
      else if (e.error === 'no-speech') setRambleStatus('Não ouvi nada. Toque no microfone e tente de novo.');
    };
    rec.onend = () => {
      if (!ramble.wantStop && $('#ramble-text')) { committed = baseText(); try { rec.start(); return; } catch {} }
      ramble.listening = false; ramble.rec = null; setListeningUi();
    };
    rec.start(); ramble.listening = true; setListeningUi();
  } catch (e) { setRambleStatus('Não foi possível usar o microfone. Escreva ou use o ditado do teclado.'); }
}
function stopListening() { ramble.wantStop = true; try { ramble.rec?.stop(); } catch {} ramble.listening = false; setListeningUi(); }
function setRambleStatus(s) { const el = $('#ramble-status'); if (el) el.textContent = s; }
function setListeningUi() {
  $('#wave')?.classList.toggle('on', ramble.listening);
  const b = $('#mic-btn'); if (b) { b.classList.toggle('on', ramble.listening); b.innerHTML = ramble.listening ? I.stop : I.mic; b.setAttribute('aria-label', ramble.listening ? 'Parar de ouvir' : 'Começar a ouvir'); }
  setRambleStatus(ramble.listening ? 'Ouvindo… fale naturalmente' : (ramble.finalText ? 'Revise as tarefas e adicione' : 'Toque no microfone para começar'));
}
function rambleTasks() { return ramble.items || splitRamble(ramble.finalText || '').filter((_, i) => !ramble.removed.has(i)); }
function freezeRamble() {
  if (ramble.items) return;
  ramble.items = rambleTasks().map(t => ({ ...t, project: S.view.type === 'project' ? S.view.id : '' }));
  stopListening();
  const ta = $('#ramble-text'); if (ta) ta.readOnly = true;
  $('#ramble-unfreeze')?.removeAttribute('hidden');
}
const foundMeta = t => [t.due ? dueLabel(t.due, t.time) : '', t.deadline ? 'Prazo ' + shortDate(t.deadline) : '', t.priority < 4 ? 'P' + t.priority : '', t.project && projById(t.project) ? projById(t.project).name : ''].filter(Boolean).map(esc).join(' · ') || 'Entrada';
function updateRambleFound() {
  const el = $('#ramble-found'); if (!el) return;
  const list = ramble.items ? ramble.items.map((t, i) => ({ t, i })) : splitRamble(ramble.finalText || '').map((t, i) => ({ t, i })).filter(x => !ramble.removed.has(x.i));
  const projOpts = cur => `<option value="">Entrada</option>` + projects().map(p => `<option value="${esc(p.id)}"${p.id === cur ? ' selected' : ''}>${esc(p.name)}</option>`).join('');
  el.innerHTML = list.length ? `<div class="mini-h">${list.length} tarefa${list.length === 1 ? '' : 's'} encontrada${list.length === 1 ? '' : 's'} · toque para corrigir</div>` + list.map(({ t, i }) => ramble.items && ramble.editing === i ? `<div class="found edit" data-i="${i}">
      <label class="sr" for="rf-title">Título</label><input id="rf-title" class="rf-in" value="${esc(t.title)}">
      <div class="rf-grid">
        <label><span>Data</span><input type="date" id="rf-due" value="${esc(t.due || '')}"></label>
        <label><span>Hora</span><input type="time" id="rf-time" value="${esc(t.time || '')}"></label>
        <label><span>Prazo</span><input type="date" id="rf-deadline" value="${esc(t.deadline || '')}"></label>
        <label><span>Prioridade</span><select id="rf-pri">${[1, 2, 3, 4].map(n => `<option value="${n}"${t.priority === n ? ' selected' : ''}>P${n}</option>`).join('')}</select></label>
        <label class="wide"><span>Projeto</span><select id="rf-proj">${projOpts(t.project)}</select></label>
      </div>
      <div class="rf-actions"><button class="btn ghost" data-a="ramble-rm" data-i="${i}">Remover</button><button class="btn primary" data-a="ramble-done">Pronto</button></div></div>`
    : `<div class="found"><span class="ring p${t.priority}"></span><button class="found-main" data-a="ramble-edit" data-i="${i}" aria-label="Corrigir ${esc(t.title)}"><b>${esc(t.title)}</b><span class="found-meta">${foundMeta(t)}</span></button>
    <button class="icon-btn" data-a="ramble-rm" data-i="${i}" aria-label="Remover">${I.x}</button></div>`).join('') : '';
  if (ramble.items && ramble.editing >= 0) {
    const t = ramble.items[ramble.editing];
    const bind = (id, k, fn = v => v || null) => $('#' + id)?.addEventListener('input', e => { t[k] = fn(e.target.value); });
    bind('rf-title', 'title', v => v); bind('rf-due', 'due'); bind('rf-time', 'time'); bind('rf-deadline', 'deadline'); bind('rf-pri', 'priority', v => +v); bind('rf-proj', 'project', v => v);
    $('#rf-pri')?.addEventListener('change', e => { t.priority = +e.target.value; }); $('#rf-proj')?.addEventListener('change', e => { t.project = e.target.value; });
  }
  const shown = list;
  const b = $('#ramble-add'); if (b) { b.disabled = !shown.length; b.textContent = shown.length ? `Adicionar ${shown.length} tarefa${shown.length === 1 ? '' : 's'}` : 'Adicionar tarefas'; }
}
function addRambleTasks() {
  const list = rambleTasks().filter(r => (r.title || '').trim()); if (!list.length) return;
  const now = Date.now(); const viewProject = S.view.type === 'project' ? S.view.id : null;
  list.forEach((r, k) => put({ id: uid('t'), kind: 'task', title: r.title.trim(), desc: '', due: r.due || (r.time ? today() : null), time: r.time, deadline: r.deadline, priority: r.priority, project: r.project !== undefined ? (r.project || null) : viewProject, status: 'todo', done: false, createdAt: now + k,
    reminders: r.due && r.time ? [{ at: new Date(`${r.due}T${r.time}`).toISOString(), label: 'Na hora' }] : [] }, { silent: k < list.length - 1 }));
  stopListening(); closeOverlay();
  toast(`${list.length} tarefa${list.length === 1 ? ' adicionada' : 's adicionadas'}`);
}

/* ================= exportar ================= */
function exportData() {
  const data = JSON.stringify({ exportedAt: new Date().toISOString(), items: [...store.state.items.values()].filter(i => !i.deleted) }, null, 2);
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' })); a.download = `den-${today()}.json`; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/* ================= eventos ================= */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]'); if (!el) return;
  const a = el.dataset.a, id = el.dataset.id;
  if (a === 'close-overlay') { if (e.target !== el && el.classList.contains('scrim')) return; closeOverlay(); return; }
  switch (a) {
    case 'nav': {
      if (el.dataset.type === 'more') break;
      const v = { type: el.dataset.type }; if (el.dataset.id) v.id = el.dataset.id; if (el.dataset.tag) v.tag = el.dataset.tag;
      go(v); break;
    }
    case 'tag': e.stopPropagation(); go({ type: 'tag', tag: el.dataset.tag }); break;
    case 'mode': {
      const m = el.dataset.mode;
      if (m === 'calendar' || m === 'matrix') { go({ type: m }); break; }
      if (S.view.type === 'calendar' || S.view.type === 'matrix') { go({ type: LS.get('den:lastList', { type: 'today' }).type, id: LS.get('den:lastList', {}).id }); S.modes[viewKey()] = m; saveView(); render(); break; }
      S.modes[viewKey()] = m; S.composerKey = null; composerEl = null; saveView(); render(); break;
    }
    case 'toggle': e.stopPropagation(); toggleTask(id, el.closest('.task, .card')); break;
    case 'open': openTask(id); break;
    case 'compose': { let p = {}; try { p = JSON.parse(el.dataset.preset || '{}'); } catch {} openInlineComposer(el.dataset.key, p); break; }
    case 'quick-add': closeSide(); openQuickAdd(); break;
    case 'ramble': closeSide(); openRamble(); break;
    case 'new-note': newNote(); break;
    case 'open-note': e.stopPropagation(); openNote(id); break;
    case 'back': if (layers.includes('note')) popLayer('note'); else { cleanupEmptyNote(); S.reading = false; render(); } break;
    case 'note-pin': { const n = get(S.noteId); if (n) put({ ...n, pinned: !n.pinned }); break; }
    case 'note-mode': flushNote(S.noteId); S.noteMode = S.noteMode === 'read' ? 'edit' : 'read'; renderMain(); if (S.noteMode === 'edit') $('#ed-ta')?.focus(); break;
    case 'note-del': delConfirm = true; renderMain(); break;
    case 'note-del-no': delConfirm = false; renderMain(); break;
    case 'note-del-yes': {
      const n = get(S.noteId); delConfirm = false; if (!n) break;
      clearTimeout(noteTimer); dirtyNotes.delete(n.id); remove(n.id);
      const next = currentNotes()[0]; S.noteId = next && !isMobile() ? next.id : null; S.noteMode = 'read'; S.reading = false; render();
      toast('Nota apagada', () => { put({ ...n, deleted: false }); S.noteId = n.id; render(); });
      break;
    }
    case 'chk': {
      const n = get(S.noteId); if (!n) break; const L = n.body.split('\n'); const i = +el.dataset.line;
      L[i] = L[i].replace(/\[( |x|X)\]/, m => m === '[ ]' ? '[x]' : '[ ]');
      put({ ...n, body: L.join('\n') }); break;
    }
    case 'to-inbox': {
      const n = get(S.noteId); if (!n) break; const i = +el.dataset.line;
      const raw = (n.body.split('\n')[i] || '').replace(/^\s*[-*+]\s+\[[ xX]\]\s?/, '').trim(); if (!raw) break;
      const q = parseQuick(raw); const now = Date.now();
      put({ id: uid('t'), kind: 'task', title: q.title || raw, desc: '', due: q.due, time: q.time, deadline: q.deadline, priority: q.priority || 4, project: null, status: 'todo', done: false, noteId: n.id, noteLine: i, createdAt: now, reminders: [] });
      toast('Tarefa criada na Entrada'); break;
    }
    case 'fmt': fmt(el.dataset.f); break;
    case 'new-project': closeSide(); openProjectDialog(); break;
    case 'edit-project': openProjectDialog(id); break;
    case 'show-done': S.showDone = !S.showDone; render(); break;
    case 'move-overdue': { const td = today(); openTasks().filter(t => t.due && t.due < td).forEach(t => put({ ...t, ...retime(t, td, t.time) }, { silent: true })); render(); toast('Tarefas atrasadas movidas para hoje'); break; }
    case 'side-open': openSide(); break;
    case 'side-close': closeSide(); break;
    case 'undo': if (toastFn) { toastFn(); toastFn = null; } $('#toast-root').innerHTML = ''; break;
    case 'd-toggle': { const t = get(dialogTask); if (t) updateTask(t.id, { done: !t.done, doneAt: !t.done ? Date.now() : null, status: !t.done ? 'done' : 'todo' }); break; }
    case 'd-prio': updateTask(dialogTask, { priority: +el.dataset.p }); break;
    case 'd-due': { const d = el.dataset.d; const t = get(dialogTask); const v = d === '' ? null : d === 'next' ? nextWeek() : addDays(today(), +d); updateTask(dialogTask, retime(t, v, v ? t.time : null)); break; }
    case 'd-goal': { const t = get(dialogTask); updateTask(dialogTask, { pomoGoal: Math.max(0, Math.min(20, (t.pomoGoal || 0) + +el.dataset.d)) }); break; }
    case 'd-del': dlgConfirm = true; renderDialog(); break;
    case 'd-del-no': dlgConfirm = false; renderDialog(); break;
    case 'd-del-yes': { const t = get(dialogTask); closeOverlay(); if (t) { remove(t.id); toast('Tarefa apagada', () => put({ ...t, deleted: false })); } break; }
    case 'rem-del': { const t = get(dialogTask); const r = [...(t.reminders || [])]; r.splice(+el.dataset.i, 1); updateTask(t.id, { reminders: r }); break; }
    case 'rem-add-custom': { const v = $('#rem-custom')?.value; if (v) addReminder(dialogTask, new Date(v), 'Personalizado'); break; }
    case 'enable-notif': enableNotifications().then(() => { if (dialogTask) renderDialog(); }); break;
    case 'test-push': store.scheduleServerReminder('Notificação de teste: está funcionando!', Date.now() + 15000, 'test').then(id => toast(id ? 'Enviada. Feche ou bloqueie o app: o aviso chega em até 1 minuto.' : 'Não foi possível agendar o teste. Verifique a internet.', null, 6000)); break;
    case 'theme': prefs.theme = el.dataset.v; savePrefs(); applyTheme(); render(); toast('Tema: ' + THEMES.find(t => t.k === prefs.theme).name); break;
    case 'text-size': prefs.textSize = el.dataset.v; savePrefs(); applyTextSize(); render(); break;
    case 'test-notif': osNotify('Den', 'As notificações estão funcionando.', 'test').then(ok => { if (!ok) toast('Não foi possível mostrar a notificação.'); }); break;
    case 'resched': { const d = el.dataset.d; const t = get(id); const v = d === '' ? null : d === 'next' ? nextWeek() : addDays(today(), +d); if (t) put({ ...t, ...retime(t, v, v ? t.time : null) }); closeOverlay(); toast(v ? 'Reagendada para ' + dueInfo(v).label.toLowerCase() : 'Data removida'); break; }
    case 'cal-prev': case 'cal-next': calShift(a === 'cal-next' ? 1 : -1); break;
    case 'cal-mode': S.calMode = el.dataset.m; LS.set('den:calmode', S.calMode); render(); break;
    case 'cal-today': S.calMonth = today().slice(0, 7); S.calSel = today(); render(); break;
    case 'cal-sel': S.calSel = el.dataset.date; if (S.calSel.slice(0, 7) !== S.calMonth) S.calMonth = S.calSel.slice(0, 7); render(); break;
    case 'cal-add': S.calSel = el.dataset.date; openQuickAdd({ due: el.dataset.date }); break;
    case 'quad-add': { const q = el.dataset.quad; const [, , , imp, urg] = QUADS.find(x => x[0] === q); openQuickAdd({ priority: imp ? 2 : 3, due: urg ? today() : null }); break; }
    case 'focus-start': startFocus(id); break;
    case 'focus-act': focusAction(el.dataset.f); break;
    case 'focus-min': if (layers.includes('focus')) popLayer('focus'); else { focusOpen = false; renderFocus(); renderFocusPill(); } break;
    case 'focus-open': focusOpen = true; pushLayer('focus'); renderFocus(); renderFocusPill(); break;
    case 'ramble-mic': if (ramble.listening) stopListening(); else startListening(); break;
    case 'ramble-rm': if (ramble.items) { ramble.items.splice(+el.dataset.i, 1); ramble.editing = -1; } else ramble.removed.add(+el.dataset.i); updateRambleFound(); break;
    case 'ramble-edit': freezeRamble(); ramble.editing = +el.dataset.i; updateRambleFound(); $('#rf-title')?.focus(); break;
    case 'ramble-done': ramble.editing = -1; updateRambleFound(); break;
    case 'ramble-unfreeze': { ramble.items = null; ramble.editing = -1; ramble.removed = new Set(); const ta = $('#ramble-text'); if (ta) { ta.readOnly = false; ta.focus(); } el.hidden = true; updateRambleFound(); break; }
    case 'hint-ok': LS.set('den:hint-gestures', true); el.closest('.coach')?.remove(); break;
    case 'col-jump': { const col = $('.board')?.children[+el.dataset.i]; col?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', inline: 'start', block: 'nearest' }); break; }
    case 'mv-status': { const t = get(id); const s2 = el.dataset.s; if (t) put({ ...t, status: s2, done: s2 === 'done', doneAt: s2 === 'done' ? (t.doneAt || Date.now()) : null }); closeOverlay(); toast('Movida para ' + STATUSES.find(x => x[0] === s2)[1]); break; }
    case 'mv-quad': { const t = get(id); if (t) { const patch = moveToQuad(t, el.dataset.q); if (Object.keys(patch).length) put({ ...t, ...patch }); } closeOverlay(); toast('Movida para ' + QUADS.find(x => x[0] === el.dataset.q)[1]); break; }
    case 'mv-open': closeOverlay().then(() => openTask(id)); break;
    case 'ramble-add': addRambleTasks(); break;
    case 'settings': go({ type: 'settings' }); break;
    case 'go-auth': LS.del('den:mode'); showAuth(); break;
    case 'sync-now': store.flush().then(() => store.pull(true)).then(() => toast('Sincronizado')); break;
    case 'sign-out': store.signOut().then(() => { LS.del('den:mode'); location.reload(); }); break;
    case 'export': exportData(); break;
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.matches?.('.t-body')) { e.preventDefault(); openTask(e.target.dataset.id); return; }
  if (e.key === 'Escape') { if ($('#overlay').firstChild) { closeOverlay(); return; } if (focusOpen) { if (layers.includes('focus')) popLayer('focus'); else { focusOpen = false; renderFocus(); renderFocusPill(); } return; } closeSide(); }
  // mantém o Tab dentro da janela aberta
  if (e.key === 'Tab' && $('#overlay').firstChild) {
    const f = [...$('#overlay .dialog').querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter(x => !x.disabled && x.offsetParent !== null);
    if (f.length) { const first = f[0], last = f[f.length - 1]; if (e.shiftKey && (document.activeElement === first || document.activeElement === $('#overlay .dialog'))) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
  }
  const typing = e.target.closest?.('input, textarea, select, [contenteditable]');
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e' && S.noteId && layoutOf() === 'notes') { e.preventDefault(); flushNote(S.noteId); S.noteMode = S.noteMode === 'read' ? 'edit' : 'read'; renderMain(); if (S.noteMode === 'edit') $('#ed-ta')?.focus(); return; }
  if (typing || e.metaKey || e.ctrlKey || e.altKey || $('#overlay').firstChild || !S.started) return;
  if (e.key === 'q') { e.preventDefault(); openQuickAdd(); }
  else if (e.key === 'n') { e.preventDefault(); newNote(); }
  else if (e.key === 'v') { e.preventDefault(); openRamble(); }
  else if (e.key === '/') { e.preventDefault(); if (isMobile()) go({ type: 'search' }); else $('#search').focus(); }
});
$('#search').addEventListener('input', e => {
  S.search = e.target.value.trim();
  if (S.view.type !== 'search') { cleanupEmptyNote(); S.view = { type: 'search' }; S.reading = false; S.noteId = null; }
  if (!S.search && !isMobile()) { go(LS.get('den:lastList', { type: 'today' })); return; }
  render();
});
$('#side-settings').addEventListener('click', () => go({ type: 'settings' }));

/* ---------- botão + (toque longo abre o Ramble) ---------- */
(() => {
  const fab = $('#fab'); let timer = null, long = false;
  fab.addEventListener('pointerdown', () => { long = false; timer = setTimeout(() => { long = true; try { navigator.vibrate?.(20); } catch {} openRamble(); }, 450); });
  const cancel = () => clearTimeout(timer);
  fab.addEventListener('pointerup', cancel); fab.addEventListener('pointerleave', cancel); fab.addEventListener('pointercancel', cancel);
  fab.addEventListener('click', e => { if (long) { e.preventDefault(); return; } openQuickAdd(); });
  fab.addEventListener('contextmenu', e => e.preventDefault());
})();

/* ---------- segurar uma tarefa ou cartão para mover ---------- */
let suppressClick = false;
function openMoveSheet(id) {
  const t = get(id); if (!t) return;
  const lay = layoutOf(); const board = lay === 'tasks' && (S.modes[viewKey()] || 'list') === 'board';
  let sec = '';
  if (board) sec += `<h5>Etapa</h5>` + STATUSES.map(([k, l, c]) => `<button class="mv-opt${(t.done ? 'done' : (t.status || 'todo')) === k ? ' cur' : ''}" data-a="mv-status" data-id="${esc(id)}" data-s="${k}"><i style="background:${c}"></i>${l}${(t.done ? 'done' : (t.status || 'todo')) === k ? '<span class="muted small">atual</span>' : ''}</button>`).join('');
  if (lay === 'matrix') sec += `<h5>Quadrante</h5>` + QUADS.map(([k, name, , imp, urg]) => { const cur = isImportant(t) === imp && !!isUrgent(t) === urg; return `<button class="mv-opt${cur ? ' cur' : ''}" data-a="mv-quad" data-id="${esc(id)}" data-q="${k}"><i class="qd-${k}"></i>${name}${cur ? '<span class="muted small">atual</span>' : ''}</button>`; }).join('');
  sec += `<h5>Data</h5><div class="mv-dates">${[['0', 'Hoje'], ['1', 'Amanhã'], ['next', 'Próx. semana'], ['', 'Sem data']].map(([d, l]) => `<button class="quick-btn" data-a="resched" data-id="${esc(id)}" data-d="${d}">${l}</button>`).join('')}</div>`;
  openSheet(`<div class="dlg-head"><b>Mover</b><span class="muted small mv-title">${esc(plainTitle(t.title))}</span><span class="grow"></span><button class="icon-btn" data-a="close-overlay" aria-label="Fechar">${I.x}</button></div>
    <div class="mv">${sec}<button class="mv-opt open" data-a="mv-open" data-id="${esc(id)}">${ic('pen', 'sm')}Abrir detalhes</button></div>`, 'Mover tarefa', 'narrow');
}
(() => {
  const main = $('#main'); let timer = null, sx = 0, sy = 0;
  // um toque novo sempre começa liberado (o clique só é ignorado logo depois de segurar)
  main.addEventListener('pointerdown', () => { suppressClick = false; }, true);
  main.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'touch') return;
    const el = e.target.closest('.task, .card'); if (!el || e.target.closest('.check, a, .t-link')) return;
    sx = e.clientX; sy = e.clientY; clearTimeout(timer);
    timer = setTimeout(() => { timer = null; suppressClick = true; try { navigator.vibrate?.(15); } catch {} openMoveSheet(el.dataset.id); }, 480);
  });
  main.addEventListener('pointermove', e => { if (timer && Math.hypot(e.clientX - sx, e.clientY - sy) > 8) { clearTimeout(timer); timer = null; } });
  const stop = () => { clearTimeout(timer); timer = null; };
  main.addEventListener('pointerup', stop); main.addEventListener('pointercancel', stop);
  main.addEventListener('contextmenu', e => { if (e.target.closest('.task, .card') && touchOnly) e.preventDefault(); });
  main.addEventListener('click', e => { if (suppressClick) { suppressClick = false; e.stopPropagation(); e.preventDefault(); } }, true);
})();

/* ---------- calendário: deslizar para o lado troca de mês ou semana ---------- */
(() => {
  const main = $('#main'); let sx = 0, sy = 0, on = false;
  main.addEventListener('pointerdown', e => { if (e.pointerType !== 'touch' || layoutOf() !== 'calendar' || !e.target.closest('.cal, .week-strip')) return; on = true; sx = e.clientX; sy = e.clientY; });
  main.addEventListener('pointerup', e => {
    if (!on) return; on = false;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) { suppressClick = true; setTimeout(() => { suppressClick = false; }, 350); calShift(dx < 0 ? 1 : -1); }
  });
  main.addEventListener('pointercancel', () => { on = false; });
})();

/* ---------- deslizar tarefas no celular ---------- */
(() => {
  let row = null, sx = 0, sy = 0, dx = 0, active = false;
  const main = $('#main');
  main.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'touch') return;
    // perto da borda o iPhone usa o gesto de voltar: não começa o deslize ali
    if (e.clientX < 24 || e.clientX > innerWidth - 24) return;
    const r = e.target.closest('.task'); if (!r || r.closest('.quad-list') || e.target.closest('.check')) return;
    row = r; sx = e.clientX; sy = e.clientY; dx = 0; active = false;
  });
  main.addEventListener('pointermove', e => {
    if (!row) return;
    const mx = e.clientX - sx, my = e.clientY - sy;
    if (!active) { if (Math.abs(my) > 10 && Math.abs(my) > Math.abs(mx)) { row = null; return; } if (Math.abs(mx) > 12) { active = true; row.classList.add('swiping'); } else return; }
    dx = Math.max(-140, Math.min(140, mx));
    row.querySelector('.task-in').style.transform = `translateX(${dx}px)`;
    row.classList.toggle('sw-right', dx > 0); row.classList.toggle('sw-left', dx < 0); row.classList.toggle('sw-armed', Math.abs(dx) > 80);
  });
  const end = () => {
    if (!row) return;
    const r = row, d = dx; row = null;
    const inner = r.querySelector('.task-in'); inner.style.transition = 'transform .18s ease'; inner.style.transform = '';
    setTimeout(() => { inner.style.transition = ''; r.classList.remove('swiping', 'sw-right', 'sw-left', 'sw-armed'); }, 200);
    if (!active) return;
    const tid = r.dataset.id;
    if (d > 80) toggleTask(tid, r); else if (d < -80) openReschedule(tid);
  };
  main.addEventListener('pointerup', end); main.addEventListener('pointercancel', end);
  // evita abrir a tarefa ao terminar um deslize
  main.addEventListener('click', e => { if (active && e.target.closest('.task')) { e.stopPropagation(); e.preventDefault(); active = false; } }, true);
})();

/* ---------- arrastar e soltar no computador ---------- */
(() => {
  const main = $('#main'); let dragId = null;
  main.addEventListener('dragstart', e => {
    const el = e.target.closest('[draggable="true"]'); if (!el) return;
    dragId = el.dataset.dragId || el.dataset.id; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', dragId); el.classList.add('dragging');
  });
  main.addEventListener('dragend', e => { e.target.closest?.('[draggable]')?.classList.remove('dragging'); main.querySelectorAll('.drop-on').forEach(x => x.classList.remove('drop-on')); dragId = null; });
  main.addEventListener('dragover', e => { const z = e.target.closest('[data-drop]'); if (!z || !dragId) return; e.preventDefault(); main.querySelectorAll('.drop-on').forEach(x => x !== z && x.classList.remove('drop-on')); z.classList.add('drop-on'); });
  main.addEventListener('drop', e => {
    const z = e.target.closest('[data-drop]'); if (!z || !dragId) return; e.preventDefault();
    const t = get(dragId); if (!t) return;
    if (z.dataset.drop === 'status') { const s = z.dataset.status; put({ ...t, status: s, done: s === 'done', doneAt: s === 'done' ? (t.doneAt || Date.now()) : null }); }
    else if (z.dataset.drop === 'day') put({ ...t, ...retime(t, z.dataset.date, t.time) });
    else if (z.dataset.drop === 'quad') { const patch = moveToQuad(t, z.dataset.quad); if (Object.keys(patch).length) put({ ...t, ...patch }); }
  });
})();

/* ================= login ================= */
let authMode = 'in';
function showAuth(msg) {
  S.started = false;
  $('#app').hidden = true; const a = $('#auth'); a.hidden = false;
  a.innerHTML = `<div class="auth-card">
    <div class="brand big"><span class="brand-mark">${I.check}</span>Den</div>
    <h1>${authMode === 'in' ? 'Entrar' : authMode === 'up' ? 'Criar conta' : 'Recuperar senha'}</h1>
    <p class="muted">Tarefas e notas sincronizadas entre seus aparelhos.</p>
    ${authMode !== 'reset' ? `<div class="seg auth-seg"><button class="${authMode === 'in' ? 'on' : ''}" data-auth="in">Entrar</button><button class="${authMode === 'up' ? 'on' : ''}" data-auth="up">Criar conta</button></div>` : ''}
    <form id="auth-form" novalidate>
      <label for="au-email">E-mail</label><input id="au-email" type="email" autocomplete="email" inputmode="email" required>
      ${authMode !== 'reset' ? `<label for="au-pass">Senha</label><input id="au-pass" type="password" autocomplete="${authMode === 'up' ? 'new-password' : 'current-password'}" minlength="6" required>${authMode === 'up' ? '<span class="muted small">Pelo menos 6 caracteres.</span>' : ''}` : ''}
      <p class="auth-msg" id="auth-msg" role="alert">${esc(msg || '')}</p>
      <button class="btn primary big" type="submit">${authMode === 'in' ? 'Entrar' : authMode === 'up' ? 'Criar conta' : 'Enviar link'}</button>
    </form>
    ${authMode === 'in' ? '<button class="link-btn" data-auth="reset">Esqueci minha senha</button>' : authMode === 'reset' ? '<button class="link-btn" data-auth="in">Voltar</button>' : ''}
    <hr><button class="link-btn" id="au-local">Usar sem conta, só neste aparelho</button>
  </div>`;
  a.querySelectorAll('[data-auth]').forEach(b => b.addEventListener('click', () => { authMode = b.dataset.auth; showAuth(); }));
  $('#au-local').addEventListener('click', () => { LS.set('den:mode', 'local'); startSession(null); });
  $('#auth-form').addEventListener('submit', async e => {
    e.preventDefault();
    const email = $('#au-email').value.trim(), pass = $('#au-pass')?.value || '';
    const msgEl = $('#auth-msg'); const btn = e.target.querySelector('[type=submit]');
    if (!/^\S+@\S+\.\S+$/.test(email)) { msgEl.textContent = 'Digite um e-mail válido.'; return; }
    if (authMode !== 'reset' && pass.length < 6) { msgEl.textContent = 'A senha precisa ter pelo menos 6 caracteres.'; return; }
    btn.disabled = true; msgEl.textContent = '';
    try {
      if (authMode === 'in') {
        const { error } = await store.signIn(email, pass);
        if (error) msgEl.textContent = /confirm/i.test(error.message) ? 'Confirme seu e-mail pelo link que enviamos e tente de novo.' : 'E-mail ou senha incorretos.';
      } else if (authMode === 'up') {
        const { data, error } = await store.signUp(email, pass);
        if (error) msgEl.textContent = /registered|exists/i.test(error.message) ? 'Já existe uma conta com esse e-mail. Use Entrar.' : 'Não foi possível criar a conta: ' + error.message;
        else if (!data.session) { authMode = 'in'; showAuth('Conta criada. Abra o link que enviamos para ' + email + ' e depois entre aqui.'); }
      } else {
        const { error } = await store.resetPassword(email);
        msgEl.textContent = error ? 'Não foi possível enviar: ' + error.message : 'Se existir uma conta, enviamos um link para ' + email + '.';
      }
    } catch { msgEl.textContent = 'Sem conexão. Verifique a internet e tente de novo.'; }
    btn.disabled = false;
  });
}

/* ================= conteúdo de exemplo ================= */
function seedExamples() {
  const now = Date.now(), td = today(); const H = 3600e3;
  const items = [
    { id: uid('p'), kind: 'project', name: 'Pessoal', color: '#299438', order: 1, createdAt: now },
    { id: uid('p'), kind: 'project', name: 'Trabalho', color: '#4073ff', order: 2, createdAt: now },
  ];
  const [pp, pw] = items;
  const noteId = uid('n');
  items.push(
    { id: noteId, kind: 'note', pinned: true, createdAt: now, body: `# Bem-vindo ao Den\n\nTarefas como no Todoist, notas como no Bear, e etiquetas ligando tudo. Este conteúdo é só um exemplo: apague quando quiser. #den/dicas\n\n## Notas\n- Escreva em **Markdown**: títulos, *itálico*, ==destaques==, \`código\` e > citações\n- Use \`#etiquetas\` em qualquer lugar, até aninhadas como #den/dicas\n\n## Tarefas a partir de notas\n- [ ] Toque em “Entrada” ao lado de um item para virar tarefa\n- [x] Abra uma etiqueta para ver notas e tarefas juntas\n\n## Atalhos\n- Botão **+**: nova tarefa. Segure para falar (Ramble)\n- Deslize uma tarefa para a direita para concluir, para a esquerda para reagendar` },
    { id: uid('t'), kind: 'task', title: 'Experimente o Ramble: segure o botão + e fale várias tarefas de uma vez', desc: '', due: td, time: null, priority: 2, project: null, status: 'todo', done: false, createdAt: now, reminders: [] },
    { id: uid('t'), kind: 'task', title: 'Planejar a semana #planejamento', desc: 'Use a visão Prioridades para decidir o que vem primeiro.', due: td, time: '18:00', priority: 2, project: pp.id, status: 'todo', done: false, createdAt: now + 1, reminders: [] },
    { id: uid('t'), kind: 'task', title: 'Revisar metas do trimestre #trabalho', desc: '', due: addDays(td, 3), time: '09:00', deadline: addDays(td, 6), priority: 1, project: pw.id, status: 'doing', done: false, createdAt: now + 2, reminders: [], pomoGoal: 4, noteId },
    { id: uid('t'), kind: 'task', title: 'Marcar dentista #saúde', desc: '', due: addDays(td, 1), time: null, priority: 3, project: pp.id, status: 'todo', done: false, createdAt: now + 3, reminders: [] },
  );
  items.forEach(it => put(it, { silent: true }));
  render();
}

/* ================= início ================= */
async function startSession(user) {
  const uidv = user ? user.id : 'local';
  if (S.started && store.state.uid === uidv) return;
  $('#auth').hidden = true; $('#app').hidden = false;
  store.load(uidv, user?.email);
  if (user) store.migrateLocal();
  S.started = true; render();
  if (user) {
    S.loading = !store.state.items.size; if (S.loading) render();
    await store.pull(true);
    S.loading = false; render();
    store.startRealtime(); store.flush();
    ensurePush();
  }
  if (!store.state.items.size && !LS.get(`den:${uidv}:seeded`)) { LS.set(`den:${uidv}:seeded`, true); seedExamples(); }
  if (F) ensureTick();
}
store.on(what => {
  if (what === 'status') { renderSync(); renderNet(); if (S.view.type === 'settings') renderMain(); return; }
  if (!S.started) return;
  render();
  if (dialogTask && !$('#overlay .task-dialog')?.contains(document.activeElement)) renderDialog();
});
mq.addEventListener('change', () => { lastLayout = null; render(); });
setInterval(() => { if (S.started) { checkReminders(); if (!document.activeElement?.closest?.('input, textarea')) renderSide(); } }, 20000);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && S.started) { checkReminders(); tick(); render(); } });
// Guarda a última lista para voltar a ela.
setInterval(() => { if (['inbox', 'today', 'upcoming', 'project'].includes(S.view.type)) LS.set('den:lastList', S.view); }, 1000);

async function boot() {
  const hv = viewFromHash(location.hash); if (hv) S.view = hv;
  history.replaceState({ den: 1, view: S.view }, '', '#' + hashFor(S.view));
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  store.sb.auth.onAuthStateChange((ev, session) => {
    if (ev === 'PASSWORD_RECOVERY') { setTimeout(promptNewPassword, 300); }
    if (session?.user && (ev === 'SIGNED_IN' || ev === 'INITIAL_SESSION')) startSession(session.user);
    if (ev === 'SIGNED_OUT' && store.state.uid !== 'local') { S.started = false; showAuth(); }
  });
  let session = null;
  try { session = await store.getSession(); } catch {}
  if (session) startSession(session.user);
  else if (LS.get('den:mode') === 'local') startSession(null);
  else showAuth();
}
function promptNewPassword() {
  openSheet(`<form id="np-form"><div class="dlg-head"><b>Nova senha</b></div><div class="form-pad"><div class="field"><label for="np-pass">Escolha uma nova senha</label><input id="np-pass" type="password" minlength="6" autocomplete="new-password"></div><p class="auth-msg" id="np-msg"></p><div class="form-actions"><span class="grow"></span><button class="btn primary" type="submit">Salvar senha</button></div></div></form>`, 'Nova senha', 'narrow');
  $('#np-form').addEventListener('submit', async e => {
    e.preventDefault(); const p = $('#np-pass').value;
    if (p.length < 6) { $('#np-msg').textContent = 'Pelo menos 6 caracteres.'; return; }
    const { error } = await store.updatePassword(p);
    if (error) $('#np-msg').textContent = 'Não foi possível salvar: ' + error.message; else { closeOverlay(); toast('Senha alterada'); }
  });
}
boot();
