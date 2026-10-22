// Módulos para conteúdo técnico de cirurgia geral (técnica, doença, anatomia, conduta).
'use strict';

// ---------- texto com quebra de linha ----------
function wrap(s, maxW, size, w = 600) {
  const words = s.split(' '), lines = []; let cur = '';
  words.forEach(v => { const t = cur ? cur + ' ' + v : v; if (tw(t, size, w) > maxW && cur) { lines.push(cur); cur = v; } else cur = t; });
  if (cur) lines.push(cur); return lines;
}

// ---------- biblioteca de órgãos esquemáticos (desenho plano, centro em 0,0, escala ~1 = 300px) ----------
const ORGANS = {
  vesicula: (c) => { ctx.fillStyle = c || C.teal; ctx.beginPath(); ctx.moveTo(-20, -120); ctx.bezierCurveTo(80, -120, 110, 0, 90, 70); ctx.bezierCurveTo(70, 150, -80, 150, -95, 60); ctx.bezierCurveTo(-110, -10, -80, -70, -40, -95); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = c || C.teal; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-20, -115); ctx.bezierCurveTo(-20, -170, 30, -200, 80, -215); ctx.stroke(); },
  apendice: (c) => { ctx.fillStyle = C.mut; ctx.globalAlpha *= 0.6; ctx.beginPath(); ctx.roundRect(-140, -170, 230, 230, 60); ctx.fill(); ctx.globalAlpha /= 0.6;
    ctx.strokeStyle = c || C.coral; ctx.lineWidth = 34; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-30, 50); ctx.bezierCurveTo(-30, 120, 30, 150, 80, 190); ctx.stroke(); },
  figado: (c) => { ctx.fillStyle = c || C.coral; ctx.beginPath(); ctx.moveTo(-230, -60); ctx.bezierCurveTo(-200, -150, 120, -170, 230, -110); ctx.bezierCurveTo(250, -60, 180, 20, 60, 60); ctx.bezierCurveTo(-60, 100, -200, 80, -240, 20); ctx.closePath(); ctx.fill(); },
  estomago: (c) => { ctx.strokeStyle = c || C.amber; ctx.lineWidth = 90; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-60, -200); ctx.bezierCurveTo(-180, -80, -160, 140, 20, 150); ctx.bezierCurveTo(140, 155, 200, 80, 220, 20); ctx.stroke(); },
  colon: (c) => { ctx.strokeStyle = c || C.amber; ctx.lineWidth = 60; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-200, 200); ctx.lineTo(-200, -150); ctx.quadraticCurveTo(-200, -200, -150, -200); ctx.lineTo(150, -200); ctx.quadraticCurveTo(200, -200, 200, -150); ctx.lineTo(200, 120); ctx.quadraticCurveTo(200, 200, 120, 200); ctx.lineTo(20, 200); ctx.stroke(); },
  hernia: (c) => { ctx.strokeStyle = C.fg; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-220, 60); ctx.lineTo(-60, 60); ctx.moveTo(60, 60); ctx.lineTo(220, 60); ctx.stroke();
    ctx.fillStyle = c || C.amber; ctx.beginPath(); ctx.moveTo(-60, 60); ctx.bezierCurveTo(-80, -120, 80, -120, 60, 60); ctx.closePath(); ctx.fill(); },
  intestino: (c) => { ctx.strokeStyle = c || C.coral; ctx.lineWidth = 40; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-200, -140);
    for (let k = 0; k < 4; k++) { const y = -140 + k * 90; ctx.bezierCurveTo(-60, y - 40, 60, y + 40, 200, y); ctx.bezierCurveTo(240, y + 30, 240, y + 60, 200, y + 90); ctx.bezierCurveTo(60, y + 50, -60, y + 130, -200, y + 90); } ctx.stroke(); },
  pancreas: (c) => { ctx.fillStyle = c || C.amber; ctx.beginPath(); ctx.moveTo(-220, 40); ctx.bezierCurveTo(-240, -40, -160, -60, -100, -30); ctx.bezierCurveTo(0, 0, 120, -60, 230, -50); ctx.bezierCurveTo(240, -20, 200, 0, 120, 10); ctx.bezierCurveTo(20, 30, -80, 90, -180, 90); ctx.closePath(); ctx.fill(); },
  rim: (c) => { ctx.fillStyle = c || C.coral; ctx.beginPath(); ctx.moveTo(0, -170); ctx.bezierCurveTo(130, -170, 150, 170, 0, 170); ctx.bezierCurveTo(-60, 170, -90, 100, -40, 40); ctx.bezierCurveTo(-20, 10, -20, -10, -40, -40); ctx.bezierCurveTo(-90, -100, -60, -170, 0, -170); ctx.closePath(); ctx.fill(); },
};

// órgão(s) com rótulos indicados por linhas (anatomia, local da doença)
M.organ = cfg => {
  const cx = cfg.cx || 640, cy = CY + 20, s = cfg.scale || 1.15;
  return {
    thread: () => P.circle(cx, cy, 330 * s * 0.9),
    draw(lt, D) {
      const lab = cfg.labels || [], e = mkE(lt, D, 2 + lab.length);
      const v = e(0);
      ctx.save(); ctx.globalAlpha = v; ctx.translate(cx, cy); ctx.scale(s * lerp(0.7, 1, v), s * lerp(0.7, 1, v));
      (cfg.organs || [cfg.organ]).forEach((o, i) => { const [name, color, dx = 0, dy = 0, sc = 1] = Array.isArray(o) ? o : [o]; ctx.save(); ctx.translate(dx, dy); ctx.scale(sc, sc); (ORGANS[name] || ORGANS.vesicula)(color); ctx.restore(); });
      ctx.restore();
      lab.forEach(([txt, px, py, color], i) => {
        const vi = e(i + 1), ax = cx + px * s, ay = cy + py * s, tx = 1080, ty = 260 + i * 120;
        polyline(partial([[ax, ay], [tx - 20, ty - 12]], vi), color || C.fg, 3, vi);
        icon(color || C.fg, ax, ay, 18, vi);
        ktext(txt, tx, ty, 40, vi, { w: 800, align: 'left', color: color || C.fg });
      });
      if (cfg.title) ktext(cfg.title, 960, 150, 48, e(0));
    }
  };
};

// passo a passo (técnica cirúrgica, conduta)
M.steps = cfg => {
  const n = cfg.items.length, x0 = 470, top = CY + 30 - (n - 1) * 115 / 2, gap = n > 5 ? 100 : 115;
  return {
    thread: () => P.line(x0, top - 40, x0, top + (n - 1) * gap + 40),
    draw(lt, D) {
      const e = mkE(lt, D, n + 1);
      cfg.items.forEach((it, i) => {
        const v = e(i + 1), y = top + i * gap, on = cfg.active === undefined || cfg.active === i;
        ctx.save(); ctx.globalAlpha = v; ctx.fillStyle = on ? C.teal : '#1A1A1A'; ctx.strokeStyle = C.teal; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(x0, y, 34 * lerp(0.5, 1, v), 0, 7); ctx.fill(); ctx.stroke(); ctx.restore();
        text(String(i + 1), x0, y + 12, 34, { w: 900, color: on ? C.bg : C.teal, a: v });
        ktext(it, x0 + 70, y + 14, 40, v, { w: 700, align: 'left', color: on ? C.fg : C.mut });
      });
      if (cfg.title) ktext(cfg.title, 960, 150, 48, e(0), { color: cfg.titleColor || C.fg });
    }
  };
};

// comparação A × B (indicação × contraindicação, aberta × vídeo, antes × depois)
M.compare = cfg => {
  const L = cfg.left, R2 = cfg.right, rows = Math.max(L.items.length, R2.items.length);
  return {
    thread: () => P.line(960, 230, 960, 260 + rows * 100 + 40),
    draw(lt, D) {
      const e = mkE(lt, D, 2 + rows * 2);
      [[L, 480, 0], [R2, 1440, 1]].forEach(([side, x, k]) => {
        const v = e(k); ktext(side.title, x, 220, 56, v, { color: side.color || (k ? C.coral : C.teal) });
        side.items.forEach((it, i) => { const vi = e(2 + i * 2 + k), y = 330 + i * 100;
          icon(side.icon || (k ? 'x' : 'check'), x - 360, y - 12, 24, vi); ktext(it, x - 320, y, 36, vi, { w: 700, align: 'left' }); });
      });
      if (cfg.title) ktext(cfg.title, 960, 120, 34, e(0), { w: 700, color: C.mut, ls: 2 });
    }
  };
};

// definição / conceito-chave (termo grande + explicação curta com quebra de linha)
M.define = cfg => {
  const lines = wrap(cfg.text, 1300, 46, 600), y0 = CY + 30;
  return {
    thread: () => P.line(310, y0 - 40, 1610, y0 - 40),
    draw(lt, D) {
      const e = mkE(lt, D, lines.length + 1);
      ktext(cfg.term, 960, y0 - 90, cfg.size || 110, e(0), { color: cfg.color || C.teal });
      lines.forEach((l, i) => ktext(l, 960, y0 + 40 + i * 64, 46, e(i + 1), { w: 600 }));
      if (cfg.head) ktext(cfg.head, 960, 150, 36, e(0), { w: 700, color: C.mut, ls: 2 });
    }
  };
};

// imagem (figura de livro, foto, exame) com moldura e legenda — declare o arquivo em IMAGES (scenes.js)
const IMG = {};
M.image = cfg => {
  const w = cfg.w || 1100, h = cfg.h || 620, x = (cfg.cx || 960) - w / 2, y = CY + 20 - h / 2;
  return {
    thread: () => P.rect(x - 16, y - 16, w + 32, h + 32),
    draw(lt, D) {
      const e = mkE(lt, D, 3), v = e(0), im = IMG[cfg.src];
      ctx.save(); ctx.globalAlpha = v; rr(x, y, w, h, 18); ctx.clip();
      if (im) { const k = Math.max(w / im.width, h / im.height) * (1 + 0.04 * eio(lt / D)); const iw = im.width * k, ih = im.height * k; ctx.drawImage(im, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih); }
      else { ctx.fillStyle = '#1A1A1A'; ctx.fillRect(x, y, w, h); }
      ctx.restore();
      if (cfg.caption) ktext(cfg.caption, 960, y + h + 70, 34, e(1), { w: 700, color: C.mut });
      if (cfg.source) text(cfg.source, x + w, y + h + 30, 20, { w: 600, color: C.mut, align: 'right', a: e(2) * 0.8 });
      if (cfg.title) ktext(cfg.title, 960, 140, 48, e(0));
    }
  };
};
window.preloadImages = list => Promise.all((list || []).map(src => new Promise(r => { const im = new Image(); im.onload = () => { IMG[src] = im; r(); }; im.onerror = r; im.src = src; })));
