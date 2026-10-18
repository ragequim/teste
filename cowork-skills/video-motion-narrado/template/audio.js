'use strict';
// Trilha sintetizada em código: 120 BPM, Lá menor (Am–F–C–G), kick em todo tempo,
// hit em cada troca de cena, riser entrando no título final.
window.renderMusic = async function () {
  const sr = 44100, total = DATA.total, ac = new OfflineAudioContext(2, Math.ceil(sr * total), sr);
  const master = ac.createGain(); master.gain.value = 0.55;
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 3;
  master.connect(comp).connect(ac.destination);
  const noise = ac.createBuffer(1, sr, sr); { const d = noise.getChannelData(0); let s = 12345; for (let i = 0; i < sr; i++) { s = (s * 16807) % 2147483647; d[i] = (s / 2147483647) * 2 - 1; } }
  const env = (g, t, a, peak, dec) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); };
  const kick = t => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(115, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.13); env(g, t, 0.004, 0.75, 0.32); o.connect(g).connect(master); o.start(t); o.stop(t + 0.4); };
  const hat = (t, v = 0.07) => { const s = ac.createBufferSource(); s.buffer = noise; const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7500; const g = ac.createGain(); env(g, t, 0.002, v, 0.05); s.connect(f).connect(g).connect(master); s.start(t, (t * 7.13) % 0.5, 0.08); };
  const ROOT = [55, 43.65, 65.41, 49.0], CH = [[220, 261.6, 329.6], [174.6, 220, 261.6], [196, 261.6, 329.6], [196, 246.9, 293.7]];
  const bass = (t, f) => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 360; const g = ac.createGain(); env(g, t, 0.01, 0.16, 0.2); o.connect(lp).connect(g).connect(master); o.start(t); o.stop(t + 0.25); };
  const pad = (t, chord) => { chord.forEach(f => { const o = ac.createOscillator(); o.type = 'triangle'; o.frequency.value = f; const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400; const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.03, t + 0.5); g.gain.setValueAtTime(0.03, t + 1.6); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.1); o.connect(lp).connect(g).connect(master); o.start(t); o.stop(t + 2.2); }); };
  const hit = (t, big) => { const s = ac.createBufferSource(); s.buffer = noise; const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = big ? 900 : 2200; bp.Q.value = 0.8; const g = ac.createGain(); env(g, t, 0.002, big ? 0.5 : 0.22, big ? 0.6 : 0.16); s.connect(bp).connect(g).connect(master); s.start(t, 0.1, 0.8);
    const o = ac.createOscillator(), g2 = ac.createGain(); o.frequency.setValueAtTime(big ? 180 : 320, t); o.frequency.exponentialRampToValueAtTime(big ? 50 : 120, t + 0.2); env(g2, t, 0.003, big ? 0.5 : 0.18, big ? 0.5 : 0.15); o.connect(g2).connect(master); o.start(t); o.stop(t + 0.7); };
  const endStart = DATA.scenes[DATA.scenes.length - 1].start;
  const beats = Math.floor(total / 0.5);
  for (let b = 0; b < beats; b++) {
    const t = b * 0.5, bar = Math.floor(b / 4), k = bar % 4;
    if (t >= endStart + 1.5) continue;           // última meia-batida limpa para o loop
    kick(t); hat(t + 0.25); if (b % 2) hat(t + 0.375, 0.035);
    bass(t, ROOT[k]); bass(t + 0.25, ROOT[k] * (b % 4 === 3 ? 1.5 : 2));
    if (b % 4 === 0) pad(t, CH[k]);
  }
  const CHS = CHAPTERS.map(c => c[0]).concat(['end']);
  DATA.scenes.forEach(s => { if (s.start > 0) hit(s.start, CHS.includes(s.id)); });
  // riser no último compasso antes do título final
  { const t0 = endStart - 2, s = ac.createBufferSource(); s.buffer = noise; s.loop = true; const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 2; bp.frequency.setValueAtTime(300, t0); bp.frequency.exponentialRampToValueAtTime(6000, endStart); const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.35, endStart - 0.02); g.gain.setValueAtTime(0.0001, endStart); s.connect(bp).connect(g).connect(master); s.start(t0); s.stop(endStart + 0.05); }
  const buf = await ac.startRendering();
  const L = buf.getChannelData(0), Rr = buf.getChannelData(1), n = L.length, pcm = new Int16Array(n * 2);
  for (let i = 0; i < n; i++) { pcm[2 * i] = Math.max(-1, Math.min(1, L[i])) * 32767; pcm[2 * i + 1] = Math.max(-1, Math.min(1, Rr[i])) * 32767; }
  window._pcm = pcm; return { sr, frames: n };
};
window.pcmChunk = function (k, size) {
  const bytes = new Uint8Array(window._pcm.buffer, k * size * 2, Math.min(size, window._pcm.length - k * size) * 2);
  let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
};
