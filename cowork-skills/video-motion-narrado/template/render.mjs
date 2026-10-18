// uso: node render.mjs <out.mp4> <fps> <width> <subframes> <workers> [t0] [t1]
import { launch, FFMPEG } from './pw.mjs';
import { spawn } from 'child_process';
const [, , out, FPS, WIDTH, SUB, WORKERS, T0, T1] = process.argv;
const URL = 'file://' + process.cwd() + '/index.html' + (process.env.NOCAP ? '?nocap=1' : '');
const fps = +FPS, w = +WIDTH, h = Math.round(w * 9 / 16), sub = +SUB, nw = +WORKERS;
const b0 = await launch();
const pg0 = await b0.newPage(); await pg0.goto(URL); await pg0.evaluate(() => window.ready);
const TOTAL = await pg0.evaluate(() => window.TOTAL); await b0.close();
const t0 = T0 ? +T0 : 0, t1 = T1 ? +T1 : TOTAL, nf = Math.round((t1 - t0) * fps);
const per = Math.ceil(nf / nw), started = Date.now();
async function worker(k) {
  const a = k * per, z = Math.min(nf, a + per); if (a >= z) return null;
  const seg = `${out}.part${k}.mp4`;
  const vf = sub > 1 ? `tmix=frames=${sub}:weights='${Array(sub).fill(1).join(' ')}',framestep=${sub},` : '';
  const ff = spawn(FFMPEG, ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps * sub), '-i', '-', '-vf', `${vf}format=yuv420p`, '-r', String(fps), '-c:v', 'libx264', '-crf', '16', '-preset', 'fast', seg], { stdio: ['pipe', 'inherit', 'inherit'] });
  const b = await launch();
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(URL); await p.evaluate(() => window.ready);
  for (let f = a; f < z; f++) {
    for (let s = 0; s < sub; s++) {
      // subquadros centrados no tempo do quadro (obturador de 360°)
      const t = t0 + (f + (s + 0.5) / sub - 0.5) / fps;
      await p.evaluate(t => window.seek(t), Math.max(0, t));
      const buf = await p.screenshot({ type: 'jpeg', quality: 92 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    }
    if (k === 0 && f % (fps * 10) === 0) console.log(`w0 ${((f - a) / (z - a) * 100).toFixed(0)}% ${((Date.now() - started) / 1000).toFixed(0)}s`);
  }
  await b.close(); ff.stdin.end(); await new Promise(r => ff.on('close', r)); return seg;
}
const segs = (await Promise.all([...Array(nw).keys()].map(worker))).filter(Boolean);
const fsm = await import('fs'); fsm.writeFileSync(`${out}.txt`, segs.map(s => `file '${s}'`).join('\n'));
await new Promise(r => spawn(FFMPEG, ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', `${out}.txt`, '-c', 'copy', out], { stdio: 'inherit' }).on('close', r));
segs.forEach(s => fsm.unlinkSync(s)); fsm.unlinkSync(`${out}.txt`);
console.log('done', out, nf, 'frames', ((Date.now() - started) / 1000).toFixed(0), 's');
