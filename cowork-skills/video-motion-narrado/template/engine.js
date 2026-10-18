// Motor de motion design: todo quadro é função pura de t (window.seek).
// Conceito: um único fio de sutura costura o plantão — o fio nunca sai de cena
// e se transforma na forma-base de cada cena.
'use strict';
const W = 1920, H = 1080, CY = 470;
const C = { bg: '#0A0A0A', fg: '#F4F2EC', mut: 'rgba(244,242,236,0.55)', dim: 'rgba(244,242,236,0.18)',
            teal: '#19C39D', coral: '#FF5A47', amber: '#FFB627' };
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');

// ---------- easing / tempo ----------
const cl = x => x < 0 ? 0 : x > 1 ? 1 : x;
const lerp = (a, b, t) => a + (b - a) * t;
const eo = x => { x = cl(x); return x === 1 ? 1 : 1 - Math.pow(2, -10 * x); };
const ei = x => { x = cl(x); return x === 0 ? 0 : Math.pow(2, 10 * x - 10); };
const eio = x => { x = cl(x); if (x === 0 || x === 1) return x; return x < .5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2; };
// mola criticamente amortecida (sem quique)
const spr = (t, w = 13) => t <= 0 ? 0 : 1 - (1 + w * t) * Math.exp(-w * t);
const BEAT = 0.5;

// ---------- geometria do fio ----------
const N = 240;
function resample(pts, n = N) {
  const L = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const tot = L[L.length - 1] || 1, out = [];
  let j = 1;
  for (let k = 0; k < n; k++) {
    const d = tot * k / (n - 1);
    while (j < L.length - 1 && L[j] < d) j++;
    const a = pts[j - 1], b = pts[j], seg = (L[j] - L[j - 1]) || 1, u = cl((d - L[j - 1]) / seg);
    out.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u)]);
  }
  return out;
}
const P = {
  line: (x0, y0, x1, y1) => [[x0, y0], [x1, y1]],
  circle: (cx, cy, r, a0 = -Math.PI / 2, sweep = Math.PI * 2) => { const o = []; for (let i = 0; i <= 120; i++) { const a = a0 + sweep * i / 120; o.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return o; },
  rect: (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y + 0.5]],
};

// ---------- desenho básico ----------
function font(size, w = 800) { ctx.font = `${w} ${size}px Inter`; }
function text(s, x, y, size, o = {}) {
  font(size, o.w || 800); ctx.letterSpacing = (o.ls || 0) + 'px';
  ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = o.color || C.fg; ctx.globalAlpha = (o.a === undefined ? 1 : o.a);
  ctx.fillText(s, x, y); ctx.globalAlpha = 1; ctx.letterSpacing = '0px';
}
function tw(s, size, w = 800, ls = 0) { font(size, w); ctx.letterSpacing = ls + 'px'; const m = ctx.measureText(s).width; ctx.letterSpacing = '0px'; return m; }
// tipografia cinética: cada palavra sobe de trás de uma máscara
function ktext(s, x, y, size, p, o = {}) {
  if (p <= 0.001) return;
  const w = o.w || 900, words = s.split(' '), sp = tw(' ', size, w, o.ls || 0);
  const ws = words.map(v => tw(v, size, w, o.ls || 0));
  const total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  let cx = o.align === 'left' ? x : o.align === 'right' ? x - total : x - total / 2;
  ctx.save();
  ctx.beginPath(); ctx.rect(cx - 20, y - size * 1.0, total + 40, size * 1.32); ctx.clip();
  words.forEach((v, j) => {
    const pj = eo(cl(p * 1.25 - j * 0.25 / words.length));
    text(v, cx, y + (1 - pj) * size * 1.15, size, { w, color: (o.colors && o.colors[j]) || o.color || C.fg, align: 'left', ls: o.ls || 0 });
    cx += ws[j] + sp;
  });
  ctx.restore();
}
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function pill(s, x, y, size, p, o = {}) {
  if (p <= 0.001) return;
  const w = tw(s, size, o.w || 800, o.ls || 1) + size * 1.4, h = size * 1.9;
  const sc = lerp(0.6, 1, p);
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.globalAlpha = p;
  rr(-w / 2, -h / 2, w, h, h / 2);
  if (o.fill) { ctx.fillStyle = o.fill; ctx.fill(); }
  ctx.lineWidth = 3; ctx.strokeStyle = o.stroke || C.fg; ctx.stroke();
  ctx.globalAlpha = 1; ctx.restore();
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  text(s, 0, size * 0.36, size, { w: o.w || 800, color: o.color || C.fg, ls: o.ls || 1, a: p });
  ctx.restore();
  return w;
}
function person(x, y, s, color, a = 1) {
  if (a <= 0.001) return;
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y - 62 * s, 24 * s, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y + 6 * s, 44 * s, Math.PI, 0); ctx.lineTo(x + 44 * s, y + 40 * s); ctx.lineTo(x - 44 * s, y + 40 * s); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function icon(kind, x, y, r, a = 1) {
  if (a <= 0.001) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(lerp(0.4, 1, a), lerp(0.4, 1, a));
  ctx.lineWidth = r * 0.22; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (kind === 'check') { ctx.fillStyle = C.teal; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.strokeStyle = C.bg; ctx.beginPath(); ctx.moveTo(-r * .45, 0); ctx.lineTo(-r * .1, r * .35); ctx.lineTo(r * .5, -r * .35); ctx.stroke(); }
  else if (kind === 'open') { ctx.strokeStyle = C.amber; ctx.beginPath(); ctx.arc(0, 0, r * .85, 0, 7); ctx.stroke(); }
  else if (kind === 'x') { ctx.fillStyle = C.coral; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.strokeStyle = C.bg; ctx.beginPath(); ctx.moveTo(-r * .4, -r * .4); ctx.lineTo(r * .4, r * .4); ctx.moveTo(r * .4, -r * .4); ctx.lineTo(-r * .4, r * .4); ctx.stroke(); }
  else { ctx.fillStyle = kind === 'dot' ? C.fg : kind; ctx.beginPath(); ctx.arc(0, 0, r * .55, 0, 7); ctx.fill(); }
  ctx.restore();
}
function polyline(pts, color, w, a = 1, dash) {
  if (a <= 0.001 || pts.length < 2) return;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke();
  ctx.restore();
}
// parte inicial (fração f) de uma polilinha — usado para "desenhar" traços
function partial(pts, f) {
  const r = resample(pts, 120), k = Math.max(2, Math.round(cl(f) * 119) + 1);
  return r.slice(0, k);
}

// ---------- cronograma de entrada/saída dos elementos ----------
// cada elemento i entra num tempo musical (grade de 1/16) e todos recolhem ao fio no fim da cena
function mkE(lt, D, n, start = 0.35) {
  const raw = (D - 1.5 - start) / Math.max(n, 1);
  const step = Math.min(0.5, Math.max(0.125, Math.floor(raw / 0.125) * 0.125));
  const q = ei((lt - (D - 0.42)) / 0.42);
  const f = i => spr(lt - (start + i * step)) * (1 - q);
  f.q = q; f.at = i => start + i * step; return f;
}
