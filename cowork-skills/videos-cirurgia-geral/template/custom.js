'use strict';
// projeção 3D simples (câmera fixa, rotação do objeto)
function proj(x, y, z, rx, ry, cx = 960, cy = CY + 30, f = 1500) {
  let X = x, Y = y, Z = z;
  const cyr = Math.cos(ry), syr = Math.sin(ry); [X, Z] = [X * cyr + Z * syr, -X * syr + Z * cyr];
  const cxr = Math.cos(rx), sxr = Math.sin(rx); [Y, Z] = [Y * cxr - Z * sxr, Y * sxr + Z * cxr];
  const s = f / (f + Z); return [cx + X * s, cy + Y * s, s];
}
function poly(pts, fill, stroke, a = 1, lw = 3) {
  if (a <= 0.001) return; ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke(); } ctx.restore();
}

// manhã -> tarde: o mesmo cirurgião
M.dayArc = cfg => {
  const cx = 960, cy = CY + 230, r = 560;
  return {
    thread: () => P.circle(cx, cy, r, Math.PI, Math.PI),
    draw(lt, D) {
      const e = mkE(lt, D, 5), m = eio((lt - 1.0) / Math.max(1.5, D - 3));
      const a = Math.PI + Math.PI * m, sx = cx + r * Math.cos(a), sy = cy + r * Math.sin(a);
      icon(C.amber, sx, sy, 60, e(0));
      person(cx - r, cy + 30, 1.1, C.teal, e(1)); ktext('MANHÃ', cx - r, cy + 150, 34, e(1), { w: 800, color: C.amber });
      person(cx + r, cy + 30, 1.1, C.teal, e(2) * (m > 0.85 ? 1 : 0.35)); ktext('TARDE', cx + r, cy + 150, 34, e(2), { w: 800, color: C.amber });
      ktext('QUEM VÊ DE MANHÃ', 960, CY - 10, 70, e(3)); ktext('OPERA À TARDE', 960, CY + 75, 70, e(4), { color: C.teal });
    }
  };
};

// operando e prescrevendo ao mesmo tempo
M.split = cfg => ({
  thread: () => P.line(960, 200, 960, 820),
  draw(lt, D) {
    const e = mkE(lt, D, 6);
    // esquerda: sala cirúrgica esquemática
    const v = e(0);
    poly([[300, 560], [720, 560], [720, 600], [300, 600]], C.fg, null, v);
    poly([[490, 600], [530, 600], [530, 720], [490, 720]], C.mut, null, v);
    ctx.save(); ctx.globalAlpha = v; ctx.fillStyle = C.amber; ctx.beginPath(); ctx.ellipse(510, 330, 120, 36, 0, 0, 7); ctx.fill(); ctx.restore();
    polyline([[510, 200], [510, 295]], C.mut, 6, v);
    ktext('CENTRO CIRÚRGICO', 510, 800, 34, e(1), { w: 800 });
    // direita: prescrição sendo digitada
    const v2 = e(2); ctx.save(); ctx.globalAlpha = v2; rr(1060, 240, 600, 470, 24); ctx.fillStyle = '#141414'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.teal; ctx.stroke(); ctx.restore();
    ktext('EVOLUÇÃO + PRESCRIÇÃO', 1100, 300, 30, v2, { w: 800, align: 'left', color: C.teal });
    const typed = cl((lt - e.at(3)) / Math.max(1, D - 3));
    [0.9, 0.7, 0.8, 0.55, 0.75].forEach((w, i) => { const f = cl(typed * 5 - i); ctx.globalAlpha = v2; ctx.fillStyle = C.fg; rr(1100, 350 + i * 64, 520 * w * f, 18, 9); ctx.fill(); ctx.globalAlpha = 1; });
    ktext('ENFERMARIA', 1360, 800, 34, e(4), { w: 800 });
    ktext('ENTRE UM CASO E OUTRO', 960, 150, 40, e(5), { w: 700, color: C.mut, ls: 2 });
  }
});

// sala vista de cima que inclina para 3D (momento 2D -> 3D)
M.orTop = cfg => {
  const tilt = lt => eio((lt - 1.2) / 1.6) * 0.95;
  const room = rx => [[-700, -300], [700, -300], [700, 300], [-700, 300], [-700, -299]].map(([x, y]) => { const p = proj(x, y, 0, rx, 0); return [p[0], p[1]]; });
  const team = [['ANESTESISTA', -420, 0, C.fg], ['INSTRUMENTADOR', 120, 200, C.fg], ['CIRCULANTE', 480, -170, C.fg], ['CIRURGIÃO', -60, -190, C.teal], ['CIRURGIÃO', 230, -190, C.teal]];
  return {
    dynamic: true,
    thread: (lt) => room(tilt(lt)),
    draw(lt, D) {
      const e = mkE(lt, D, team.length + 2), rx = tilt(lt) * (1 - e.q);
      const v = e(0);
      // mesa
      const T = [[-260, -70], [260, -70], [260, 70], [-260, 70]].map(([x, y]) => proj(x, y, 0, rx, 0));
      poly(T, C.fg, null, v);
      // paciente (campo)
      poly([[-230, -45], [200, -45], [200, 45], [-230, 45]].map(([x, y]) => proj(x, y, -6, rx, 0)), C.teal, null, v * 0.35);
      team.forEach(([l, x, y, c], i) => {
        const vi = e(i + 1), p = proj(x, y, 0, rx, 0), hp = proj(x, y, -90 * rx, rx, 0);
        // em 3D a pessoa "levanta" do chão
        if (rx > 0.05) polyline([[p[0], p[1]], [hp[0], hp[1]]], c, 22 * p[2], vi);
        icon(c, hp[0], hp[1], 46 * p[2] * 1.6, vi);
        ktext(l, hp[0], hp[1] - 95 * p[2] - 10, 26, vi, { w: 800, color: c });
      });
      ktext('NÚMERO DE CIRURGIÕES VARIA', 960, 860, 36, e(team.length + 1), { w: 800, color: C.teal, ls: 2 });
      head(cfg.head, v);
    }
  };
};

// visão da videolaparoscopia
M.lapView = cfg => {
  const cx = 700, cy = CY + 20, r = 290;
  return {
    thread: () => P.circle(cx, cy, r),
    draw(lt, D) {
      const e = mkE(lt, D, 5), v = e(0), sw = Math.sin(lt * 1.3) * 30;
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r - 4, 0, 7); ctx.clip();
      ctx.globalAlpha = v;
      ctx.fillStyle = '#1A1A1A'; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
      ctx.fillStyle = C.coral; ctx.globalAlpha = v * 0.85; ctx.beginPath(); ctx.ellipse(cx - 40 + sw, cy - 120, 260, 120, -0.2, 0, 7); ctx.fill();
      ctx.fillStyle = C.teal; ctx.globalAlpha = v; ctx.beginPath(); ctx.ellipse(cx + 40 + sw, cy - 20, 60, 90, 0.5, 0, 7); ctx.fill();
      ctx.fillStyle = C.fg; ctx.globalAlpha = v * 0.25; ctx.beginPath(); ctx.ellipse(cx + sw, cy + 170, 280, 90, 0, 0, 7); ctx.fill();
      ctx.globalAlpha = v; polyline([[cx - r, cy + r * 0.8], [cx - 60 + sw, cy + 40]], C.fg, 14, e(1)); polyline([[cx + r, cy + r * 0.7], [cx + 70 + sw, cy + 20]], C.fg, 14, e(2));
      ctx.restore();
      ktext('VIDEOLAPAROSCOPIA', 1080, CY - 60, 62, e(3), { align: 'left' });
      ktext('VISÃO NA DÚVIDA DIAGNÓSTICA', 1084, CY + 10, 36, e(4), { w: 700, align: 'left', color: C.teal });
    }
  };
};

// 3 portais viram a incisão mediana (conversão)
M.convert = cfg => {
  const cx = 700, cy = CY + 30;
  const torso = [[cx - 230, cy - 300], [cx + 230, cy - 300], [cx + 260, cy + 40], [cx + 210, cy + 300], [cx - 210, cy + 300], [cx - 260, cy + 40], [cx - 230, cy - 299]];
  const ports = [[cx, cy + 60], [cx - 150, cy - 40], [cx + 150, cy - 40]];
  return {
    thread: () => torso,
    draw(lt, D) {
      const e = mkE(lt, D, 4), m = eio((lt - e.at(1) - 0.6) / 0.9) * (1 - e.q), v = e(0);
      ports.forEach(([x, y], i) => { const tx = cx, ty = lerp(cy - 200, cy + 200, i / 2); const px = lerp(x, tx, m), py = lerp(y, ty, m); icon(C.teal, px, py, 26 * (1 - m * 0.6), v); });
      if (m > 0) polyline([[cx, cy - 210], [cx, lerp(cy - 210, cy + 210, m)]], C.coral, 10, v * m);
      ktext(m < 0.5 ? 'VÍDEO' : 'LAPAROTOMIA', 1080, CY - 30, 80, e(1), { align: 'left', color: m < 0.5 ? C.teal : C.coral });
      ktext('CONVERTER NA HORA, SE PRECISAR', 1084, CY + 40, 36, e(2), { w: 700, align: 'left', color: C.mut });
    }
  };
};

// tomografia: anel + fatias que viram pilha 3D
M.ct = cfg => {
  const cx = 560, cy = CY + 10;
  return {
    thread: () => P.circle(cx, cy, 250),
    draw(lt, D) {
      const e = mkE(lt, D, 5), v = e(0), k3 = eio((lt - 1.5) / 1.5) * (1 - e.q), rx = 0.35 * k3, ry = -1.0 * k3;
      ctx.save(); ctx.globalAlpha = v; ctx.lineWidth = 46; ctx.strokeStyle = '#1C1C1C'; ctx.beginPath(); ctx.arc(cx, cy, 225, 0, 7); ctx.stroke(); ctx.strokeStyle = C.teal; ctx.lineWidth = 46; ctx.beginPath(); ctx.arc(cx, cy, 225, lt * 3, lt * 3 + 0.5); ctx.stroke(); ctx.fillStyle = C.fg; ctx.globalAlpha = v * 0.8; ctx.beginPath(); ctx.ellipse(cx, cy + 40, 140, 70, 0, 0, 7); ctx.fill(); ctx.restore();
      for (let k = 0; k < 7; k++) {
        const z = (k - 3) * 70, vk = cl(v * 1.5 - k * 0.08);
        const q = [[-150, -110], [150, -110], [150, 110], [-150, 110]].map(([x, y]) => proj(x, y, z * k3, rx, ry, 1260, cy));
        poly(q, k === 3 ? C.teal : '#171717', k === 3 ? null : C.fg, vk * (k === 3 ? 0.9 : 0.8), 3);
      }
      const ld = cl((lt - e.at(2)) / Math.max(1.5, D - 3));
      ctx.save(); ctx.globalAlpha = e(2); rr(1060, 760, 400, 20, 10); ctx.fillStyle = C.dim; ctx.fill(); rr(1060, 760, 400 * ld, 20, 10); ctx.fillStyle = C.amber; ctx.fill(); ctx.restore();
      ktext('LAUDO…', 1060, 740, 28, e(2), { w: 800, align: 'left', color: C.amber });
      ktext('TOMOGRAFIA NO HOSPITAL', 960, 150, 44, e(3), { color: C.fg });
    }
  };
};

// calendário: vaga zero todo dia
M.calendar = cfg => {
  const days = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'], x0 = 330, sp = 210, y = CY + 40;
  return {
    thread: () => P.line(x0 - 90, y + 110, x0 + 6 * sp + 90, y + 110),
    draw(lt, D) {
      const e = mkE(lt, D, days.length + 2);
      days.forEach((d, i) => { const v = e(i + 1); ctx.save(); ctx.globalAlpha = v; rr(x0 + i * sp - 80, y - 90, 160, 180, 18); ctx.strokeStyle = C.fg; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); text(d, x0 + i * sp, y - 30, 30, { w: 800, a: v }); icon(C.coral, x0 + i * sp, y + 35, 40, v); });
      ktext('VAGA ZERO', 960, 300, 110, e(0), { color: C.coral });
      ktext('PRATICAMENTE TODO DIA', 960, 860, 38, e(days.length + 1), { w: 700, color: C.mut, ls: 2 });
    }
  };
};

// bateria do plantão de 24h
M.battery = cfg => {
  const x = 380, y = CY - 130, w = 640, h = 300;
  return {
    thread: () => P.rect(x, y, w, h),
    draw(lt, D) {
      const e = mkE(lt, D, 4), v = e(0), lvl = lerp(1, 0.12, eio((lt - 0.6) / Math.max(1.5, D - 2)));
      ctx.save(); ctx.globalAlpha = v; rr(x + w + 6, y + h / 2 - 50, 34, 100, 10); ctx.fillStyle = C.fg; ctx.fill();
      rr(x + 22, y + 22, (w - 44) * lvl, h - 44, 14); ctx.fillStyle = lvl > 0.35 ? C.teal : C.coral; ctx.fill(); ctx.restore();
      ktext('24H', 1180, CY + 20, 190, e(1), { align: 'left' });
      ktext('CANSAÇO FÍSICO', 1186, CY + 100, 40, e(2), { w: 700, align: 'left', color: C.mut });
      ktext('E MENTAL', 1186, CY + 152, 40, e(3), { w: 700, align: 'left', color: C.mut });
    }
  };
};

// base sólida em 3D (blocos empilhando) — o momento mais forte
M.base3d = cfg => {
  const layers = cfg.layers; // de baixo para cima
  return {
    dynamic: true,
    thread: (lt) => { const r = 0.95, ry = -0.65 + lt * 0.05; return [[-420, -260], [420, -260], [420, 260], [-420, 260], [-420, -259]].map(([x, z]) => { const p = proj(x, 200, z, -r * 0.55, ry, 960, CY + 40); return [p[0], p[1]]; }); },
    draw(lt, D) {
      const e = mkE(lt, D, layers.length + 1), ry = -0.65 + lt * 0.05, rx = -0.95 * 0.55;
      layers.forEach(([label, c], i) => {
        const v = e(i + 1), drop = (1 - v) * -260, y1 = 200 - i * 120 + drop, y0 = y1 - 100, s = 380 - i * 50;
        const P3 = (x, y, z) => { const p = proj(x, y, z, rx, ry, 960, CY + 40); return [p[0], p[1]]; };
        const top = [P3(-s, y0, -s * 0.6), P3(s, y0, -s * 0.6), P3(s, y0, s * 0.6), P3(-s, y0, s * 0.6)];
        const front = [P3(-s, y0, s * 0.6), P3(s, y0, s * 0.6), P3(s, y1, s * 0.6), P3(-s, y1, s * 0.6)];
        const side = [P3(s, y0, s * 0.6), P3(s, y0, -s * 0.6), P3(s, y1, -s * 0.6), P3(s, y1, s * 0.6)];
        poly(side, '#202020', C.fg, v, 2); poly(front, c, null, v); poly(top, '#2A2A2A', C.fg, v, 2);
        const lp = P3(0, (y0 + y1) / 2, s * 0.6);
        text(label, lp[0], lp[1] + 12, 34, { w: 900, color: C.bg, a: v });
      });
      ktext('BASE SÓLIDA', 960, 150, 64, e(0));
    }
  };
};

// comentários + título final
M.comments = cfg => {
  const x = 460, y = CY - 170, w = 1000, h = 300;
  return {
    thread: () => [[x + 40, y], [x + w - 40, y], [x + w, y + 40], [x + w, y + h - 40], [x + w - 40, y + h], [x + 260, y + h], [x + 160, y + h + 90], [x + 180, y + h], [x + 40, y + h], [x, y + h - 40], [x, y + 40], [x + 39, y]],
    draw(lt, D) {
      const e = mkE(lt, D, 4);
      ktext('DEIXA SUA DÚVIDA', 960, y + 120, 72, e(0)); ktext('NOS COMENTÁRIOS', 960, y + 210, 72, e(1), { color: C.teal });
      [0, 1, 2].forEach(k => icon(C.fg, 900 + k * 60, y + h + 110, 22 * (0.6 + 0.4 * Math.abs(Math.sin(lt * 4 + k))), e(2)));
      ktext('EU SOU TODO OUVIDOS', 960, 860, 38, e(3), { w: 700, color: C.mut, ls: 2 });
    }
  };
};
