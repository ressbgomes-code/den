// Datas, rótulos e leitura de linguagem natural (português e inglês).

export const pad = n => String(n).padStart(2, '0');
export const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const pd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const today = () => ymd(new Date());
export const addDays = (s, n) => { const d = pd(s); d.setDate(d.getDate() + n); return ymd(d); };
export const diff = (a, b) => Math.round((pd(b) - pd(a)) / 864e5);
export const nextWeek = () => { const d = new Date().getDay(); return addDays(today(), ((8 - d) % 7) || 7); };

export const WD = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
export const WD_SHORT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
export const MO = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
export const MO_LONG = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export function shortDate(s) {
  const d = pd(s);
  const y = d.getFullYear() !== new Date().getFullYear() ? ' ' + d.getFullYear() : '';
  return `${d.getDate()} ${MO[d.getMonth()]}${y}`;
}
export const longDate = s => { const d = pd(s); return `${WD_SHORT[d.getDay()]}, ${d.getDate()} ${MO[d.getMonth()]}`; };

export function dueInfo(s) {
  const n = diff(today(), s);
  if (n < 0) return { cls: 'overdue', label: n === -1 ? 'Ontem' : shortDate(s) };
  if (n === 0) return { cls: 'today', label: 'Hoje' };
  if (n === 1) return { cls: 'tomorrow', label: 'Amanhã' };
  if (n < 7) return { cls: 'week', label: WD[pd(s).getDay()] };
  return { cls: '', label: shortDate(s) };
}
export const dueLabel = (date, time) => date ? dueInfo(date).label + (time ? ' ' + time : '') : (time || '');

/* ---------- leitura de datas ---------- */

const END = '(?=$|[\\s,.;!?])';
const PRE = '(^|[\\s,(])';
const MONTHS = {
  janeiro: 0, jan: 0, january: 0, fevereiro: 1, fev: 1, feb: 1, february: 1, 'março': 2, marco: 2, mar: 2, march: 2,
  abril: 3, abr: 3, apr: 3, april: 3, maio: 4, mai: 4, may: 4, junho: 5, jun: 5, june: 5, julho: 6, jul: 6, july: 6,
  agosto: 7, ago: 7, aug: 7, august: 7, setembro: 8, set: 8, sep: 8, sept: 8, september: 8, outubro: 9, out: 9, oct: 9, october: 9,
  novembro: 10, nov: 10, november: 10, dezembro: 11, dez: 11, dec: 11, december: 11,
};
const MON_RE = '(janeiro|fevereiro|mar[çc]o|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|january|february|march|april|june|july|august|september|october|november|december|jan|fev|feb|mar|abr|apr|mai|may|jun|jul|ago|aug|set|sept?|out|oct|nov|dez|dec)';
const WEEKDAYS = {
  domingo: 0, segunda: 1, 'terça': 2, terca: 2, quarta: 3, quinta: 4, sexta: 5, 'sábado': 6, sabado: 6,
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
};
const WD_RE = '(?:(?:na|no|nesta|neste|próxima|proxima|próximo|proximo|next|on|this)\\s+)?(domingo|segunda|ter[çc]a|quarta|quinta|sexta|s[áa]bado|sunday|monday|tuesday|wednesday|thursday|friday|saturday|sun|mon|tue|wed|thu|fri|sat)(?:-feira)?';

function dayMonth(day, monIdx) {
  const t = new Date(); let d = new Date(t.getFullYear(), monIdx, +day);
  if (d.getMonth() !== monIdx) return null;
  if (ymd(d) < today()) d = new Date(t.getFullYear() + 1, monIdx, +day);
  return ymd(d);
}
const monIdx = name => MONTHS[name.toLowerCase()];

// Cada regra: [fonte da regex sem prefixo, função que recebe os grupos e devolve 'AAAA-MM-DD']
const DATE_RULES = [
  ['(\\d{4})-(\\d{2})-(\\d{2})', m => `${m[1]}-${m[2]}-${m[3]}`],
  ['depois de amanh[ãa]', () => addDays(today(), 2)],
  ['(?:hoje|today|tod)', () => today()],
  ['(?:amanh[ãa]|tomorrow|tmrw?)', () => addDays(today(), 1)],
  ['(?:semana que vem|pr[óo]xima semana|next week)', () => nextWeek()],
  ['(?:em|daqui a|in)\\s+(\\d{1,3})\\s+(?:dias?|days?)', m => addDays(today(), +m[1])],
  ['(?:em|daqui a|in)\\s+(\\d{1,2})\\s+(?:semanas?|weeks?)', m => addDays(today(), 7 * m[1])],
  ['(\\d{1,2})/(\\d{1,2})(?:/(\\d{2,4}))?', m => {
    const day = +m[1], mon = +m[2] - 1; if (mon < 0 || mon > 11) return null;
    if (m[3]) { const y = +m[3] < 100 ? 2000 + +m[3] : +m[3]; const d = new Date(y, mon, day); return d.getMonth() === mon ? ymd(d) : null; }
    return dayMonth(day, mon);
  }],
  ['(?:dia\\s+)?(\\d{1,2})(?:º|st|nd|rd|th)?\\s+(?:de\\s+)?' + MON_RE, m => dayMonth(m[1], monIdx(m[2]))],
  [MON_RE + '\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?', m => {
    const i = monIdx(m[1]); if (['set', 'out', 'mar', 'may', 'mai'].includes(m[1].toLowerCase())) return null;
    return dayMonth(m[2], i);
  }],
  ['dia\\s+(\\d{1,2})', m => {
    const t = new Date(); let d = new Date(t.getFullYear(), t.getMonth(), +m[1]);
    if (ymd(d) < today()) d = new Date(t.getFullYear(), t.getMonth() + 1, +m[1]);
    return d.getDate() === +m[1] ? ymd(d) : null;
  }],
  [WD_RE, m => {
    const target = WEEKDAYS[m[1].toLowerCase()]; const now = new Date().getDay();
    return addDays(today(), ((target - now + 7) % 7) || 7);
  }],
];

function findDate(text, prefix = PRE) {
  for (const [src, fn] of DATE_RULES) {
    const re = new RegExp(prefix + '(?:' + src + ')' + END, 'i');
    const m = text.match(re);
    if (!m) continue;
    const groups = [m[0].slice(m[1] ? m[1].length : 0), ...m.slice(2)];
    const v = fn(groups);
    if (v) return { value: v, match: m[0], lead: m[1] || '' };
  }
  return null;
}

const NUMS = { uma: 1, um: 1, duas: 2, dois: 2, 'três': 3, tres: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9, dez: 10, onze: 11, doze: 12, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 };
const NUM_RE = '(?:uma|um|duas|dois|tr[êe]s|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)';
const TIME_RULES = [
  // às 10, às 10h, às 10:30, as 9h15, at 5
  [PRE + '(?:[àa]s|at)\\s+(\\d{1,2}|' + NUM_RE + ')(?:[:h](\\d{2})|\\s+e\\s+(meia|quinze))?\\s*(?:h|horas?)?(?:\\s+da\\s+(manh[ãa]|tarde|noite))?' + END, m => {
    let h = /^\d/.test(m[2]) ? +m[2] : NUMS[m[2].toLowerCase()];
    if (m[5] && /tarde|noite/i.test(m[5]) && h < 12) h += 12;
    return [h, m[3] || (m[4] ? (m[4].toLowerCase() === 'meia' ? 30 : 15) : 0)];
  }],
  // 3pm, 10:30am
  [PRE + '(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)' + END, m => { let h = +m[2]; if (m[4].toLowerCase() === 'pm' && h < 12) h += 12; if (m[4].toLowerCase() === 'am' && h === 12) h = 0; return [h, m[3]]; }],
  // 10h, 10h30, 14:00
  [PRE + '(\\d{1,2})(?::(\\d{2})|h(\\d{2})?)' + END, m => [m[2], m[3] || m[4]]],
  [PRE + '(?:ao meio-dia|meio-dia|noon)' + END, () => [12, 0]],
];
function findTime(text) {
  for (const [src, fn] of TIME_RULES) {
    const m = text.match(new RegExp(src, 'i'));
    if (!m) continue;
    const [h, min] = fn(m); const hh = +h, mm = +(min || 0);
    if (hh > 23 || mm > 59) continue;
    return { value: `${pad(hh)}:${pad(mm)}`, match: m[0], lead: m[1] || '' };
  }
  return null;
}

const strip = (t, f) => t.replace(f.match, f.lead + ' ');

/**
 * Lê uma frase como "Ligar para o banco amanhã às 10 p2 #pessoal prazo sexta".
 * Devolve título limpo, data, hora, prazo, prioridade e os rótulos reconhecidos.
 */
export function parseQuick(text, opts = {}) {
  let t = ' ' + text + ' '; const out = { title: '', due: null, time: null, deadline: null, priority: null, found: [] };
  const pm = t.match(/(^|\s)(p[1-4])(?=\s|$)/i);
  if (pm) { out.priority = +pm[2][1]; t = t.replace(pm[0], pm[1] + ' '); }
  if (opts.words) {
    const urg = t.match(/(^|[\s,])(?:(?:isso|isto|it'?s|that'?s)\s+(?:é\s+)?)?(?:muito\s+)?(urgente|urgent)(?=$|[\s,.!?])/i);
    if (urg) { out.priority = 1; t = t.replace(urg[0], urg[1] + ' '); }
    const imp = t.match(/(^|[\s,])(?:(?:isso|isto|it'?s|that'?s)\s+(?:é\s+)?)?(importante|important)(?=$|[\s,.!?])/i);
    if (imp && !out.priority) { out.priority = 2; t = t.replace(imp[0], imp[1] + ' '); }
  }
  const dl = findDate(t, '(^|[\\s,(])(?:(?:o\\s+)?prazo(?:\\s+(?:[ée]|at[ée]|para|pra))?|at[ée]|deadline|due|by|entregar\\s+at[ée])\\s*:?\\s+');
  if (dl) { out.deadline = dl.value; t = strip(t, dl); }
  const d = findDate(t);
  if (d) { out.due = d.value; t = strip(t, d); }
  const tm = findTime(t);
  if (tm) { out.time = tm.value; t = strip(t, tm); if (!out.due) out.due = out.deadline || today(); }
  out.title = t.replace(/\s*,(\s*,)+/g, ',').replace(/\s+/g, ' ').replace(/^[\s,.;-]+|[\s,;-]+$/g, '').trim();
  // restos de frases faladas: "…pra Marta, é", "…, isso", "…, e", "…, it's"
  for (let k = 0; k < 3; k++) out.title = out.title.replace(/(?:[\s,;]+|^)(?:isso é|isso|isto é|isto|é|e|o prazo é|o prazo|que é|it'?s|that'?s|is|and)$/i, '').replace(/[\s,;-]+$/, '').trim();
  if (out.due) out.found.push(dueLabel(out.due, out.time));
  if (out.deadline) out.found.push('Prazo ' + dueInfo(out.deadline).label.toLowerCase());
  if (out.priority) out.found.push('P' + out.priority);
  return out;
}

/* ---------- Ramble: fala livre → várias tarefas ---------- */

const VERBS = 'preciso|tenho|lembrar|lembra|comprar|ligar|enviar|mandar|marcar|pagar|fazer|ir|ver|falar|buscar|pegar|agendar|responder|levar|terminar|revisar|escrever|estudar|limpar|organizar|renovar|reservar|confirmar|cancelar|call|buy|send|book|pay|email|finish|write|review|pick|schedule|remember|need|get|check|fix|clean';
const FILLER = /^(?:(?:e|ah|oh|ok|então|entao|tipo|bom|and|so|also|também|tambem)\s+)*(?:eu\s+)?(?:(?:tenho\s+(?:que|de)|preciso(?:\s+de)?|devo|vou|lembrar\s+de|me\s+lembra\s+de|não\s+(?:posso\s+)?esquecer\s+de|i\s+(?:need|have|want)\s+to|need\s+to|have\s+to|remember\s+to|don'?t\s+forget\s+to)\s+)?/i;

export function splitRamble(text) {
  const parts = text
    .replace(/\s+/g, ' ')
    .replace(/(^|[\s,])(?:ah|oh|uh|hum|humm|é\.\.\.|tipo assim)(?=[\s,.!?]|$)/gi, '$1')
    .split(new RegExp(`[.;!?\\n]+|,?\\s+(?:e\\s+também|e\\s+depois|também|depois|além\\s+disso|oh\\s+and|and\\s+also|and\\s+then)\\s+|,\\s+(?:e\\s+)?(?=(?:${VERBS})\\b)|\\s+e\\s+(?=(?:eu\\s+)?(?:${VERBS})\\b)|\\s+and\\s+(?=(?:i\\s+)?(?:${VERBS})\\b)`, 'i'))
    .map(s => (s || '').trim()).filter(Boolean);
  const tasks = [];
  for (const raw of parts) {
    // "isso é urgente" / "é pra sexta" sozinho: aplica à tarefa anterior
    const lone = parseQuick(raw, { words: true });
    const leftover = lone.title.replace(FILLER, '').replace(/^(?:isso|isto|é|e|it'?s|that'?s|for|para|pra)\b\s*/i, '').trim();
    if (tasks.length && leftover.length < 3) {
      const prev = tasks[tasks.length - 1];
      if (lone.priority) prev.priority = lone.priority;
      if (lone.due) prev.due = lone.due;
      if (lone.time) prev.time = lone.time;
      if (lone.deadline) prev.deadline = lone.deadline;
      continue;
    }
    const cleaned = raw.replace(FILLER, '');
    const q = parseQuick(cleaned, { words: true });
    let title = q.title.replace(/^(?:de|que|to)\s+/i, '').replace(/[,\s]+(?:e|and)$/i, '').trim();
    if (title.length < 2) continue;
    title = title[0].toUpperCase() + title.slice(1);
    tasks.push({ title, due: q.due, time: q.time, deadline: q.deadline, priority: q.priority || 4 });
  }
  return tasks;
}
