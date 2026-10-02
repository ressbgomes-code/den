// Markdown no estilo Bear, #etiquetas e utilidades de texto.

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const TAG_RE = /(^|[\s(])#([\p{L}\p{N}_][\p{L}\p{N}_\-\/]*[\p{L}\p{N}_]|[\p{L}\p{N}_])/gu;

export function tagsOf(text) {
  const out = new Set(); if (!text) return out;
  const clean = text.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
  for (const m of clean.matchAll(TAG_RE)) out.add(m[2].toLowerCase());
  return out;
}

export function inline(src) {
  const codes = [];
  let s = esc(src).replace(/`([^`\n]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  s = s.replace(/(^|[\s(])(https?:\/\/[^\s<]+[^\s<.,;:!?)])/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
  s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*\w])\*([^*\s][^*\n]*?)\*(?!\*)/g, '$1<em>$2</em>');
  s = s.replace(/(^|[\s(])_([^_\n]+)_(?=$|[\s).,!?:;])/g, '$1<em>$2</em>');
  s = s.replace(/~~([^~\n]+)~~/g, '<del>$1</del>');
  s = s.replace(/==([^=\n]+)==/g, '<mark>$1</mark>');
  s = s.replace(TAG_RE, (_, pre, t) => `${pre}<a class="tag" data-a="tag" data-tag="${esc(t.toLowerCase())}">#${t}</a>`);
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[i]}</code>`);
}

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7"/></svg>';

export function renderMd(body, sentLines, sendIcon) {
  const lines = body.split('\n'); let html = '', i = 0, para = [], list = null;
  const flushP = () => { if (para.length) { html += `<p>${para.join('<br>')}</p>`; para = []; } };
  const flushL = () => { if (list) { html += `<${list.t}>${list.items.join('')}</${list.t}>`; list = null; } };
  const flush = () => { flushP(); flushL(); };
  while (i < lines.length) {
    const line = lines[i]; let m;
    if (/^```/.test(line)) {
      flush(); const buf = []; i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      html += `<pre><code>${esc(buf.join('\n'))}</code></pre>`; i++; continue;
    }
    if ((m = line.match(/^(#{1,6})\s+(.*)$/))) { flush(); const n = Math.min(m[1].length, 3); html += `<h${n}>${inline(m[2])}</h${n}>`; }
    else if ((m = line.match(/^\s*[-*+]\s+\[( |x|X)\]\s?(.*)$/))) {
      flush(); const done = m[1] !== ' ';
      const extra = done ? '' : sentLines.has(i) ? '<span class="sent">Na Entrada</span>' : `<button class="to-inbox" data-a="to-inbox" data-line="${i}" title="Criar tarefa na Entrada">${sendIcon}Entrada</button>`;
      html += `<div class="chk${done ? ' x' : ''}"><button class="box" data-a="chk" data-line="${i}" aria-label="${done ? 'Desmarcar' : 'Marcar'}">${CHECK}</button><span class="txt">${inline(m[2])}</span>${extra}</div>`;
    }
    else if ((m = line.match(/^\s*[-*+]\s+(.*)$/))) { flushP(); if (!list || list.t !== 'ul') { flushL(); list = { t: 'ul', items: [] }; } list.items.push(`<li>${inline(m[1])}</li>`); }
    else if ((m = line.match(/^\s*\d+[.)]\s+(.*)$/))) { flushP(); if (!list || list.t !== 'ol') { flushL(); list = { t: 'ol', items: [] }; } list.items.push(`<li>${inline(m[1])}</li>`); }
    else if ((m = line.match(/^>\s?(.*)$/))) { flush(); const buf = [inline(m[1])]; while (i + 1 < lines.length && /^>/.test(lines[i + 1])) buf.push(inline(lines[++i].replace(/^>\s?/, ''))); html += `<blockquote>${buf.join('<br>')}</blockquote>`; }
    else if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) { flush(); html += '<hr>'; }
    else if (!line.trim()) { flush(); }
    else { flushL(); para.push(inline(line)); }
    i++;
  }
  flush();
  return html || '<p class="muted">Esta nota está vazia.</p>';
}

export const noteTitle = n => {
  const l = (n.body || '').split('\n').find(x => x.trim());
  return l ? l.replace(/^#+\s*/, '').replace(/[*_=~`]/g, '').trim() || 'Sem título' : 'Sem título';
};
export const noteSnippet = n => {
  const ls = (n.body || '').split('\n').filter(x => x.trim());
  return ls.slice(1).map(l => l.replace(/^#+\s+|^\s*[-*+]\s+(\[[ xX]\]\s*)?|^\s*\d+[.)]\s+|^>\s?|[*_=~`]/g, '').trim()).filter(Boolean).join(' · ').slice(0, 220);
};
