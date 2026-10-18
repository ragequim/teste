'use strict';
const NOCAP = new URLSearchParams(location.search).has('nocap');
const SC = DATA.scenes, WORDS = DATA.words, TOTAL = DATA.total;
const built = {};
const mod = i => built[i] || (built[i] = CFG[SC[i].id]());
const sceneAt = t => { let lo = 0, hi = SC.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (SC[m].start <= t) lo = m; else hi = m - 1; } return lo; };
const shapeCache = {};
function shape(i, t) {
  const m = mod(i), lt = t - SC[i].start, D = SC[i].end - SC[i].start;
  if (m.dynamic) return resample(m.thread(cl(lt / D) * D, D));
  return shapeCache[i] || (shapeCache[i] = resample(m.thread(0, D)));
}
function threadAt(t) {
  const i = sceneAt(t), sc = SC[i];
  if (i + 1 < SC.length && t > sc.end - 0.45) { const m = eio((t - (sc.end - 0.45)) / 1.0); return { pts: mix(shape(i, t), shape(i + 1, sc.end), m), morph: true }; }
  if (i > 0 && t < sc.start + 0.55) { const m = eio((t - (sc.start - 0.45)) / 1.0); return { pts: mix(shape(i - 1, sc.start), shape(i, t), m), morph: true }; }
  return { pts: shape(i, t), morph: false };
}
const mix = (a, b, m) => a.map((p, k) => [lerp(p[0], b[k][0], m), lerp(p[1], b[k][1], m)]);

// ---- legendas: páginas curtas, palavra atual destacada ----
const PAGES = [];
(() => { let cur = [];
  WORDS.forEach((w, i) => { cur.push(i); const end = /[,.:;?!]$/.test(w[0]); if (cur.length >= 6 || end || i === WORDS.length - 1) { PAGES.push(cur); cur = []; } });
  PAGES.forEach((p, k) => { const s = WORDS[p[0]][1] - 0.08, e = WORDS[p[p.length - 1]][2]; const nx = k + 1 < PAGES.length ? WORDS[PAGES[k + 1][0]][1] - 0.08 : e + 0.5; p.s = s; p.e = nx - e < 0.8 ? nx : e + 0.4; });
})();
function captions(t) {
  let lo = 0, hi = PAGES.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (PAGES[m].s <= t) lo = m; else hi = m - 1; }
  const pg = PAGES[lo]; if (!pg || t < pg.s || t > pg.e) return;
  const size = 46, sp = tw(' ', size, 700), ws = pg.map(i => tw(WORDS[i][0], size, 700));
  const total = ws.reduce((a, b) => a + b, 0) + sp * (pg.length - 1);
  let x = 960 - total / 2; const rise = (1 - eo((t - pg.s) / 0.18)) * 14, y = 1012 + rise;
  pg.forEach((i, j) => {
    const [w, s, e] = WORDS[i], said = t >= s, now = t >= s && t < e + 0.05;
    text(w, x, y, size, { w: 700, align: 'left', color: now ? C.teal : C.fg, a: said ? 1 : 0.42 });
    x += ws[j] + sp;
  });
}
function chip(t) {
  const si = sceneAt(t); let ch = -1;
  CHAPTERS.forEach(([id], k) => { const idx = SC.findIndex(s => s.id === id); if (idx <= si) ch = k; });
  if (SC[si].id === 'end') return;
  const st = SC[SC.findIndex(s => s.id === CHAPTERS[ch][0])].start;
  const p = spr(t - st - (ch === 0 ? 1.0 : 0.3)) * (ch === 0 && t < 1 ? 0 : 1);
  ctx.save(); ctx.beginPath(); ctx.rect(60, 40, 900, 70); ctx.clip();
  text(CHAPTERS[ch][1], 80, 92 + (1 - p) * 60, 26, { w: 800, color: C.amber, align: 'left', ls: 3 });
  ctx.restore();
}
function drawThread(pts, a = 0.92) { polyline(pts, C.fg, 5, a); }

window.seek = function (t) {
  t = Math.max(0, Math.min(TOTAL, t));
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  const i = sceneAt(t), sc = SC[i], lt = t - sc.start, D = sc.end - sc.start;
  // câmera: um único gesto — aproximação lenta e contínua em cada cena (no título final, ela se afasta e fecha o loop)
  const push = sc.id === 'end' ? 0.025 * (1 - eio(lt / D)) : 0.025 * eio(lt / D);
  ctx.setTransform(1 + push, 0, 0, 1 + push, -960 * push, -CY * push);
  // fio (com rastro durante a transformação = blur direcional pela velocidade)
  const th = threadAt(t);
  if (th.morph) { [0.03, 0.016].forEach((dt, k) => drawThread(threadAt(Math.max(0, t - dt)).pts, 0.18 + 0.12 * k)); }
  drawThread(th.pts);
  // pulso do tempo: um ponto percorre o fio a cada batida (vai e volta, sem saltos)
  const b = Math.floor(t / BEAT), ph = eo(((t % BEAT) / BEAT) / 0.7), u = b % 2 ? 1 - ph : ph;
  const pt = th.pts[Math.round(u * (N - 1))]; icon(C.teal, pt[0], pt[1], 16, 1);
  // cena
  const m = mod(i), noExit = sc.id === 'end';
  m.draw(noExit ? Math.min(lt, D - 0.43) : lt, D);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  chip(t); if (!NOCAP) captions(t);
};
window.TOTAL = TOTAL;
window.SCENES = SC;
