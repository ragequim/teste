// Módulos visuais. Cada módulo devolve { thread(lt,D) -> pontos do fio, draw(lt,D) }.
'use strict';
const M = {};
const head = (s, e, color) => { if (s) ktext(s, 960, 150, 40, e, { w: 700, color: color || C.mut, ls: 2 }); };

// ---- título cinético ----
M.title = cfg => {
  const size = cfg.size || 150, lh = size * 1.08, n = cfg.lines.length;
  const ys = cfg.lines.map((_, i) => CY - (n - 1) * lh / 2 + i * lh + size * 0.36);
  const mw = Math.max(...cfg.lines.map(l => tw(l, size, 900)));
  const uy = ys[n - 1] + (cfg.small ? 50 : 60);
  return {
    thread: () => cfg.dot ? P.circle(960, uy + 10, 14) : cfg.moon ? P.circle(1500, CY - 150, 70) : P.line(960 - mw / 2, uy, 960 + mw / 2, uy),
    draw(lt, D) {
      const e = mkE(lt, D, n + 1, cfg.instant ? -5 : 0.25);
      cfg.lines.forEach((l, i) => ktext(l, 960, ys[i], size, e(i), { color: (cfg.colors && cfg.colors[i]) || C.fg }));
      if (cfg.small) ktext(cfg.small, 960, uy + 70, 38, e(n), { w: 600, color: C.mut, ls: 2 });
      if (cfg.moon) { const p = e(1); ctx.save(); ctx.globalAlpha = p; ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(1500, CY - 150, 70 * p, 0, 7); ctx.fill(); ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(1530, CY - 175, 62 * p, 0, 7); ctx.fill(); ctx.restore(); }
      head(cfg.head, e(0));
    }
  };
};

// ---- rede: centro + satélites (o fio é a própria ligação) ----
M.network = cfg => {
  const cx = 960, cy = CY + 30, k = cfg.sats.length, rx = cfg.rx || 600, ry = cfg.ry || 270;
  const pos = cfg.sats.map((_, i) => { const a = -Math.PI / 2 + (i + 0.5) * 2 * Math.PI / k; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; });
  return {
    thread: () => { const o = [[cx, cy]]; pos.forEach(p => { o.push(p); o.push([cx, cy]); }); return o; },
    draw(lt, D) {
      const e = mkE(lt, D, k + 1);
      pos.forEach((p, i) => { const v = e(i + 1); pill(cfg.sats[i], lerp(cx, p[0], v), lerp(cy, p[1], v), 26, v, { stroke: cfg.satColor || C.teal, fill: C.bg }); });
      const v = e(0);
      ctx.save(); ctx.globalAlpha = v; ctx.fillStyle = C.bg; ctx.strokeStyle = C.fg; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(cx, cy, 120 * lerp(.5, 1, v), 0, 7); ctx.fill(); ctx.stroke(); ctx.restore();
      cfg.center.split('\n').forEach((l, i, a) => text(l, cx, cy + 12 + (i - (a.length - 1) / 2) * 38, 30, { w: 900, a: v }));
      head(cfg.head, e(0));
    }
  };
};

// ---- linha do tempo ----
M.timeline = cfg => {
  const x0 = 200, x1 = 1720, y = cfg.y || 600, X = f => lerp(x0, x1, f);
  return {
    thread: () => P.line(x0, y, x1, y),
    draw(lt, D) {
      const items = (cfg.segs || []).length + (cfg.marks || []).length + (cfg.ticks ? 1 : 0);
      const e = mkE(lt, D, items + 1);
      let i = 1;
      if (cfg.ticks) { const v = e(i++); cfg.ticks.forEach(([f, l]) => { polyline([[X(f), y], [X(f), y + 18]], C.fg, 3, v); text(l, X(f), y + 60, 28, { w: 700, color: C.mut, a: v }); }); }
      (cfg.segs || []).forEach(sg => {
        const v = e(i++), a = X(sg.a), b = lerp(a, X(sg.b), v), h = sg.h || 76, top = y - 30 - h;
        ctx.save(); ctx.globalAlpha = v;
        rr(a, top, Math.max(2, b - a), h, 14);
        if (sg.dash) { ctx.setLineDash([14, 12]); ctx.lineWidth = 4; ctx.strokeStyle = sg.color || C.mut; ctx.stroke(); }
        else { ctx.fillStyle = sg.color || C.fg; ctx.fill(); }
        ctx.restore();
        text(sg.label, (a + X(sg.b)) / 2, top + h / 2 + 12, sg.size || 30, { w: 800, color: sg.dash ? (sg.color || C.mut) : C.bg, a: v });
      });
      (cfg.marks || []).forEach(m => {
        const v = e(i++), x = X(m.f);
        polyline([[x, y], [x, y - lerp(0, m.h || 230, v)]], m.color || C.teal, 4, v);
        pill(m.label, x, y - (m.h || 230) - 34, 26, v, { stroke: m.color || C.teal, fill: C.bg, color: m.color || C.teal });
      });
      head(cfg.head, e(0));
    }
  };
};

// ---- pessoas ----
M.people = cfg => {
  const s = cfg.scale || 1.6, sp = cfg.sp || (cfg.groups.some(g => g.tags) ? 330 : 150 * s / 1.6), gap = 260;
  const groups = cfg.groups; let tot = 0;
  groups.forEach((g, k) => { tot += (g.n - 1) * sp + (k ? gap : 0); });
  let x = 960 - tot / 2; const y = cfg.y || 600, xs = [];
  groups.forEach((g, k) => { if (k) x += gap; const row = []; for (let j = 0; j < g.n; j++) { row.push(x); if (j < g.n - 1) x += sp; } xs.push(row); });
  const flat = xs.flat(), xa = Math.min(...flat) - 90, xb = Math.max(...flat) + 90;
  return {
    thread: () => P.line(xa, y + 62, xb, y + 62),
    draw(lt, D) {
      const nTot = flat.length; const e = mkE(lt, D, nTot + groups.length + (cfg.card ? 2 : 0) + 1);
      let i = 1;
      groups.forEach((g, k) => {
        xs[k].forEach((px, j) => {
          const v = e(i++); const c = (g.colors && g.colors[j]) || g.color || C.fg;
          person(px, y + (1 - v) * 60, s, c, v);
          if (g.tags && g.tags[j]) pill(g.tags[j], px, y - 150 * s / 1.25 - 40, 26, v, { stroke: c, fill: C.bg, color: c });
          if (g.ring === j) { ctx.save(); ctx.globalAlpha = v; ctx.strokeStyle = C.teal; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(px, y - 20, 105 * s / 1.25 * v, 0, 7); ctx.stroke(); ctx.restore(); }
        });
      });
      groups.forEach((g, k) => { const v = e(i++); const mid = (xs[k][0] + xs[k][xs[k].length - 1]) / 2; if (g.label) ktext(g.label, mid, y + 140, 34, v, { w: 800, color: g.lcolor || C.fg, ls: 1 }); });
      if (cfg.big) ktext(cfg.big, 960, 290, 120, e(0), { color: cfg.bigColor || C.teal });
      if (cfg.card) {
        // cartão do caso viajando de uma pessoa para outra
        const v = e(i++), mv = eio((lt - e.at(i)) / 1.2);
        const fx = flat[cfg.card.from], tx = flat[cfg.card.to], cx = lerp(fx, tx, mv), cy = y - 250 - Math.sin(mv * Math.PI) * 60;
        ctx.save(); ctx.globalAlpha = v; rr(cx - 80, cy - 50, 160, 100, 14); ctx.fillStyle = C.fg; ctx.fill();
        ctx.fillStyle = C.bg; [0, 1, 2].forEach(r => ctx.fillRect(cx - 55, cy - 28 + r * 22, r === 2 ? 60 : 110, 10)); ctx.restore();
        text('CASO', cx, cy - 66, 24, { w: 800, color: C.amber, a: v, ls: 2 });
      }
      head(cfg.head, e(0));
    }
  };
};

// ---- organograma sem preceptor ----
M.org = cfg => {
  const yb = 660, rx = [430, 560, 690, 820], px = [1100, 1230, 1360, 1490, 1620];
  return {
    thread: () => P.line(430, yb - 210, 1620, yb - 210),
    draw(lt, D) {
      const e = mkE(lt, D, 6);
      const v0 = e(0); pill('PRECEPTOR ACADÊMICO FIXO', 960, 200, 30, v0, { stroke: C.mut, color: C.mut, fill: C.bg });
      const v1 = e(1); if (v1 > 0) { const w = tw('PRECEPTOR ACADÊMICO FIXO', 30, 800, 1) + 60; polyline([[960 - w / 2, 200], [lerp(960 - w / 2, 960 + w / 2, v1), 200]], C.coral, 7, v1); }
      const v2 = e(2); rx.forEach(x => person(x, yb + (1 - v2) * 50, 1.05, C.teal, v2)); ktext('RESIDENTES', 625, yb + 130, 32, v2, { w: 800, color: C.teal });
      const v3 = e(3); px.forEach(x => person(x, yb + (1 - v3) * 50, 1.05, C.fg, v3)); ktext('PLANTONISTAS DE CIRURGIA GERAL', 1360, yb + 130, 32, v3, { w: 800 });
      const v4 = e(4); for (let k = 0; k < 4; k++) polyline(partial([[rx[k], yb - 140], [rx[k], yb - 210], [px[k + 1], yb - 210], [px[k + 1], yb - 140]], v4), C.teal, 3, v4 * 0.7);
      ktext('CONVIVÊNCIA DIRETA', 1060, yb - 240, 30, e(5), { w: 800, color: C.teal, ls: 2 });
    }
  };
};

// ---- grade de leitos ----
M.grid = cfg => {
  const cols = cfg.cols || 8, rows = cfg.rows || 3, cw = 150, ch = 92, g = 26;
  const gw = cols * cw + (cols - 1) * g, gh = rows * ch + (rows - 1) * g, x0 = (cfg.cx || 960) - gw / 2, y0 = (cfg.cy || CY + 40) - gh / 2;
  const cell = i => [x0 + (i % cols) * (cw + g), y0 + Math.floor(i / cols) * (ch + g)];
  const cat = cfg.cats || [];
  return {
    thread: () => P.rect(x0 - 34, y0 - 34, gw + 68, gh + 68),
    draw(lt, D) {
      const n = cols * rows, e = mkE(lt, D, 4 + (cfg.legend ? cfg.legend.length : 0));
      for (let i = 0; i < n; i++) {
        const v = cl(e(1) * 1.6 - (i % cols) * 0.06 - Math.floor(i / cols) * 0.1);
        const [x, y] = cell(i), c = cfg.colors ? (cfg.colors[cat[i]] || C.fg) : C.fg;
        ctx.save(); ctx.globalAlpha = v; ctx.translate(x + cw / 2, y + ch / 2); ctx.scale(lerp(.6, 1, v), lerp(.6, 1, v));
        rr(-cw / 2, -ch / 2, cw, ch, 14); ctx.lineWidth = 4; ctx.strokeStyle = c; ctx.stroke();
        rr(-cw / 2 + 14, -ch / 2 + 16, 34, ch - 32, 8); ctx.fillStyle = c; ctx.fill();
        ctx.restore();
      }
      if (cfg.split) { const v = e(2); cfg.split.forEach(k => { const x = x0 + k * (cw + g) - g / 2; polyline(partial([[x, y0 - 50], [x, y0 + gh + 50]], v), C.amber, 5, v, [16, 12]); }); }
      if (cfg.splitLabels) { const v = e(3); cfg.splitLabels.forEach(([f, l]) => pill(l, x0 + f * gw, y0 - 70, 24, v, { stroke: C.amber, color: C.amber, fill: C.bg })); }
      if (cfg.route) {
        const v = e(2), pts = cfg.route.map(i => { const [x, y] = cell(i); return [x + cw / 2, y + ch / 2]; });
        const f = eio((lt - e.at(2)) / Math.max(1, D - 2.5));
        polyline(partial(pts, f), C.teal, 6, v);
        cfg.route.forEach((idx, k) => { const [x, y] = cell(idx); icon('check', x + cw - 10, y + 8, 22, cl((f * (cfg.route.length - 1) - k + 0.5) * 2) * v); });
      }
      if (cfg.legend) { const ly = y0 + gh + 110; let lx = 960 - (cfg.legend.length - 1) * 150; cfg.legend.forEach(([l, ci], k) => { const v = e(3 + k); icon(cfg.colors[ci], lx + k * 300 - 70, ly - 10, 30, v); ktext(l, lx + k * 300 - 40, ly, 28, v, { w: 800, align: 'left', color: cfg.colors[ci] }); }); }
      if (cfg.clock) { const v = e(0); text(cfg.clock, 1720, 150, 56, { w: 900, color: C.amber, align: 'right', a: v }); }
      head(cfg.head, e(0));
    }
  };
};

// ---- cartão de interface ----
M.card = cfg => {
  const w = cfg.w || 1000, rows = cfg.rows, h = 120 + rows.length * 100 + 20, x = 960 - w / 2, y = CY + 20 - h / 2;
  return {
    thread: () => P.rect(x, y, w, h),
    draw(lt, D) {
      const e = mkE(lt, D, rows.length + 1);
      const v0 = e(0); ctx.save(); ctx.globalAlpha = v0 * 0.9; rr(x, y, w, h, 28); ctx.fillStyle = '#141414'; ctx.fill(); ctx.restore();
      ktext(cfg.title, x + 56, y + 82, 40, v0, { w: 900, align: 'left', color: cfg.titleColor || C.amber, ls: 1 });
      rows.forEach(([kind, label], i) => {
        const v = e(i + 1), ry = y + 140 + i * 100;
        polyline([[x + 40, ry - 30], [lerp(x + 40, x + w - 40, v), ry - 30]], C.dim, 2, v);
        icon(kind, x + 84, ry + 22, 24, v);
        ktext(label, x + 132, ry + 34, 36, v, { w: 700, align: 'left' });
      });
      head(cfg.head, e(0));
    }
  };
};

// ---- barras horizontais ----
M.bars = cfg => {
  const ax = cfg.ax || 760, maxW = 860, unit = maxW / cfg.max, rows = cfg.rows, rh = 170;
  const top = CY + 30 - (rows.length - 1) * rh / 2;
  return {
    thread: () => [[ax, top - 120], [ax, top + (rows.length - 1) * rh + 110], [ax + maxW + 60, top + (rows.length - 1) * rh + 110]],
    draw(lt, D) {
      const e = mkE(lt, D, rows.length * 2 + 1);
      rows.forEach((r, i) => {
        const y = top + i * rh, v = e(1 + i * 2), g = eo((lt - e.at(1 + i * 2) - 0.25) / 1.0) * (1 - e.q);
        r.label.split('\n').forEach((l, j, a) => ktext(l, ax - 40, y + 14 + (j - (a.length - 1) / 2) * 44, 34, v, { w: 800, align: 'right' }));
        const a = ax + (r.a || 0) * unit, b = ax + r.b * unit;
        ctx.save(); ctx.globalAlpha = v * (r.a ? 0.45 : 1); rr(ax, y - 36, Math.max(4, lerp(0, b - ax, g)), 72, 12); ctx.fillStyle = r.color || C.teal; ctx.fill();
        if (r.a) { ctx.globalAlpha = v; rr(ax, y - 36, Math.max(4, lerp(0, a - ax, g)), 72, 12); ctx.fill(); }
        ctx.restore();
        ktext(r.val, lerp(ax, b, g) + 30, y + 22, r.valSize || 64, e(2 + i * 2), { w: 900, align: 'left', color: r.color || C.teal });
      });
      if (cfg.ticks) { const v = e(0); cfg.ticks.forEach(k => text(k + 'h', ax + k * unit, top + (rows.length - 1) * rh + 160, 26, { w: 700, color: C.mut, a: v })); }
      head(cfg.head, e(0));
    }
  };
};

// ---- relógio ----
const ang = s => { const [h, m] = s.split(':').map(Number); return ((h % 12) + m / 60) / 12 * Math.PI * 2 - Math.PI / 2; };
M.clock = cfg => {
  const cx = cfg.cx || 640, cy = CY + 20, r = 240;
  return {
    thread: () => P.circle(cx, cy, r),
    draw(lt, D) {
      const e = mkE(lt, D, 4);
      const v0 = e(0);
      for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; polyline([[cx + Math.cos(a) * (r - 30), cy + Math.sin(a) * (r - 30)], [cx + Math.cos(a) * (r - 12), cy + Math.sin(a) * (r - 12)]], C.fg, k % 3 ? 3 : 6, v0); }
      // tempo corrido: de -> até (pode passar de 12h, em voltas)
      const span = cfg.hours || 0, mv = eio((lt - 0.6) / Math.max(1, Math.min(D - 2, cfg.sweepDur || 2.5)));
      const a0 = ang(cfg.from), aT = a0 + span / 12 * Math.PI * 2 * mv;
      if (cfg.sweep) { ctx.save(); ctx.globalAlpha = 0.9 * v0; ctx.strokeStyle = cfg.sweepColor || C.amber; ctx.lineWidth = 22; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.arc(cx, cy, r - 62, a0, aT, false); ctx.stroke(); ctx.restore(); }
      const minA = -Math.PI / 2 + (span * 12 * mv % 12) / 12 * Math.PI * 2 + (Number(cfg.from.split(':')[1]) / 60) * Math.PI * 2;
      polyline([[cx, cy], [cx + Math.cos(aT) * r * 0.48, cy + Math.sin(aT) * r * 0.48]], C.fg, 12, v0);
      polyline([[cx, cy], [cx + Math.cos(minA) * r * 0.72, cy + Math.sin(minA) * r * 0.72]], C.fg, 6, v0);
      icon(C.amber, cx, cy, 20, v0);
      const v1 = e(1);
      const big = cfg.bigFn ? cfg.bigFn(mv) : cfg.big;
      ktext(big, 1040, CY - 10, cfg.bigSize || 170, v1, { align: 'left', color: cfg.bigColor || C.fg });
      if (cfg.sub) ktext(cfg.sub, 1046, CY + 80, 40, e(2), { w: 700, align: 'left', color: C.mut });
      if (cfg.sub2) ktext(cfg.sub2, 1046, CY + 140, 40, e(3), { w: 800, align: 'left', color: cfg.sub2Color || C.teal });
      if (cfg.moon) { const p = e(1); ctx.save(); ctx.globalAlpha = p; ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(1640, 210, 58 * p, 0, 7); ctx.fill(); ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(1666, 190, 52 * p, 0, 7); ctx.fill(); ctx.restore(); }
      head(cfg.head, e(0));
    }
  };
};

// ---- árvore de decisão ----
M.tree = cfg => {
  const rx = 330, ry = CY + 30, bx = 860, cxl = 1440, br = cfg.branches, sp = br.length > 1 ? 300 : 0;
  const bys = br.map((_, i) => ry - sp * (br.length - 1) / 2 + i * sp);
  const path = [];
  br.forEach((b, i) => { path.push([rx + 120, ry], [bx - 160, ry], [bx - 160, bys[i]], [bx - 120, bys[i]]); if (b.child) path.push([cxl - 200, bys[i]]); path.push([bx - 160, bys[i]], [bx - 160, ry]); });
  return {
    thread: () => path,
    draw(lt, D) {
      const e = mkE(lt, D, 1 + br.length * 2);
      pill(cfg.root, rx, ry, 30, e(0), { fill: C.fg, stroke: C.fg, color: C.bg });
      br.forEach((b, i) => {
        const v = e(1 + i * 2); pill(b.label, bx, bys[i], 28, v, { stroke: b.color || C.fg, color: b.color || C.fg, fill: C.bg });
        if (b.child) { const v2 = e(2 + i * 2); pill(b.child, cxl, bys[i], 28, v2, { fill: b.color || C.teal, stroke: b.color || C.teal, color: C.bg }); }
      });
      head(cfg.head, e(0));
    }
  };
};

// ---- monitor (ECG): o fio vira a própria onda ----
function ecgY(x, ph, amp, chaos, flat) {
  const P0 = 300, u = ((x + ph) % P0 + P0) % P0 / P0;
  let y = 0;
  y += -18 * Math.exp(-Math.pow((u - 0.18) / 0.035, 2));
  y += 22 * Math.exp(-Math.pow((u - 0.36) / 0.012, 2)) - 150 * Math.exp(-Math.pow((u - 0.40) / 0.012, 2)) + 40 * Math.exp(-Math.pow((u - 0.44) / 0.014, 2));
  y += -34 * Math.exp(-Math.pow((u - 0.66) / 0.05, 2));
  const ch = Math.sin((x + ph) * 0.031) * 60 + Math.sin((x + ph) * 0.071 + 1.3) * 40 + Math.sin((x + ph) * 0.013) * 30;
  return (lerp(y * amp, ch, chaos)) * (1 - flat);
}
M.ecg = cfg => {
  const x0 = 200, x1 = 1720, y = CY + 20;
  const state = (lt, D) => {
    const u = cl(lt / D);
    if (cfg.mode === 'stabilize') return { amp: lerp(1.6, 1, eio((u - 0.3) / 0.4)), chaos: lerp(0.7, 0, eio((u - 0.2) / 0.5)), flat: 0 };
    if (cfg.mode === 'arrest') return { amp: 1, chaos: eio((u - 0.25) / 0.2), flat: eio((u - 0.6) / 0.15) };
    return { amp: 1, chaos: 0, flat: 0 };
  };
  const wave = (lt, D) => { const s = state(lt, D), o = []; for (let i = 0; i <= 160; i++) { const x = lerp(x0, x1, i / 160); o.push([x, y + ecgY(x, lt * 420, s.amp, s.chaos, s.flat)]); } return o; };
  return {
    dynamic: true,
    thread: wave,
    draw(lt, D) {
      const e = mkE(lt, D, (cfg.labels || []).length + 1);
      (cfg.labels || []).forEach(([t0, s, c], i) => { const v = spr(lt - t0) * (1 - e.q); ktext(s, 960, 250 + (i % 2) * 0, 64, v * (i === cfg.labels.length - 1 || lt < (cfg.labels[i + 1] || [99])[0] ? 1 : 0), { color: c || C.fg }); });
      const s = state(lt, D);
      if (cfg.mode === 'arrest') { const v = s.flat; if (v > 0) { ctx.save(); ctx.globalAlpha = v * (1 - e.q); ctx.strokeStyle = C.coral; ctx.lineWidth = 6; rr(140, 120, 1640, 760, 30); ctx.stroke(); ctx.restore(); } }
      head(cfg.head, e(0));
    }
  };
};

// ---- contador com grade de pontos ----
M.counter = cfg => {
  const n = cfg.n, cols = 20, gx = 220, gy = CY - 170, sp = 34, rows = Math.ceil(n / cols);
  return {
    thread: () => P.line(1150, CY + 120, 1700, CY + 120),
    draw(lt, D) {
      const e = mkE(lt, D, 4), f = eio((lt - 0.4) / Math.max(1.2, D * 0.5)) * (1 - e.q);
      for (let i = 0; i < n; i++) {
        const v = cl(f * n - i), hi = i < (cfg.hi || 0) && f > 0.75;
        ctx.globalAlpha = v; ctx.fillStyle = hi ? C.teal : C.fg; ctx.beginPath(); ctx.arc(gx + (i % cols) * sp, gy + Math.floor(i / cols) * sp, hi ? 11 : 9, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ktext(Math.round(f * n) + '+', 1425, CY + 70, 220, e(0), { color: C.fg });
      ktext(cfg.sub, 1425, CY + 190, 38, e(1), { w: 700, color: C.mut });
      if (cfg.big2) ktext(cfg.big2, 1425, CY + 290, 60, e(2) * (f > 0.75 ? 1 : 0), { color: C.teal });
      head(cfg.head, e(0));
    }
  };
};

// ---- notificações empilhadas ----
M.notif = cfg => {
  const rx = 560, items = cfg.items;
  return {
    thread: () => P.line(rx, 230, rx, 230 + items.length * 140),
    draw(lt, D) {
      const e = mkE(lt, D, items.length + 1);
      items.forEach(([s, c], i) => {
        const v = e(i + 1), y = 250 + i * 140, w = lerp(0, 1060, v);
        ctx.save(); ctx.globalAlpha = v; rr(rx + 30, y, w, 100, 50); ctx.fillStyle = '#151515'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = c || C.fg; ctx.stroke(); ctx.restore();
        icon(c || C.fg, rx + 90, y + 50, 26, v); ktext(s, rx + 130, y + 63, 34, v, { w: 700, align: 'left' });
      });
      head(cfg.head, e(0), C.amber);
    }
  };
};

// ---- fluxo A -> B (movimento rápido com rastro) ----
M.flow = cfg => {
  const ax = 420, bx = 1500, y = CY + 30;
  return {
    thread: () => P.line(ax + 140, y, bx - 140, y),
    draw(lt, D) {
      const e = mkE(lt, D, 4);
      pill(cfg.a, ax, y, 32, e(0), { fill: C.bg }); pill(cfg.b, bx, y, 32, e(1), { fill: cfg.bColor || C.coral, stroke: cfg.bColor || C.coral, color: C.bg });
      const t0 = e.at(2) + 0.2, m = eio((lt - t0) / 0.7), v = e(2);
      // rastro proporcional à velocidade
      const vel = Math.abs(eio((lt - t0 + 0.02) / 0.7) - eio((lt - t0 - 0.02) / 0.7));
      for (let k = 6; k >= 0; k--) { const mm = cl(m - vel * k * 0.9); icon(C.teal, lerp(ax + 150, bx - 150, mm), y, 34, v * (k ? 0.12 : 1)); }
      if (cfg.label) ktext(cfg.label, 960, y - 120, 56, e(3), { color: cfg.labelColor || C.coral });
      head(cfg.head, e(0));
    }
  };
};

// ---- trilhas paralelas ----
M.lanes = cfg => {
  const ls = cfg.lanes, lh = 140, top = CY + 30 - (ls.length - 1) * lh / 2, x0 = 560, x1 = 1720;
  return {
    thread: () => P.line(x0, top - 70, x0, top + (ls.length - 1) * lh + 70),
    draw(lt, D) {
      const e = mkE(lt, D, ls.length + 1);
      ls.forEach((L, i) => {
        const v = e(i + 1), y = top + i * lh;
        ktext(L.label, x0 - 40, y + 14, 32, v, { w: 800, align: 'right', color: L.color || C.fg });
        ctx.save(); ctx.beginPath(); ctx.rect(x0 + 20, y - 50, x1 - x0, 100); ctx.clip();
        const off = (lt * (cfg.speed || 120)) % 1000;
        L.blocks.forEach(([a, b]) => {
          for (let rep = -1; rep <= 1; rep++) {
            const xa = x0 + 20 + a * 1000 - (cfg.scroll ? off : 0) + rep * 1000, xb = xa + (b - a) * 1000;
            ctx.globalAlpha = v; rr(xa, y - 34, Math.max(0, lerp(0, xb - xa, v)), 68, 12); ctx.fillStyle = L.color || C.fg; ctx.fill();
          }
        });
        ctx.restore(); ctx.globalAlpha = 1;
        if (L.tag) pill(L.tag, x1 - 140, y + 82, 24, v, { stroke: L.color, color: L.color, fill: C.bg });
      });
      head(cfg.head, e(0));
    }
  };
};
