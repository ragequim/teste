import { launch, FFMPEG } from './pw.mjs';
import fs from 'fs';
const [, , outDir, mode, ...rest] = process.argv;
fs.mkdirSync(outDir, { recursive: true });
const b = await launch();
const p = await b.newPage({ viewport: { width: 960, height: 540 } });
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + process.cwd() + '/index.html'); await p.evaluate(() => window.ready);
const scenes = await p.evaluate(() => window.SCENES);
let times = [];
if (mode === 'mid') times = scenes.map(s => [s.id, s.start + Math.min((s.end - s.start) * 0.62, s.end - s.start - 0.6)]);
else times = rest.map(x => ['t' + x, Number(x)]);
for (const [id, t] of times) { await p.evaluate(t => window.seek(t), t); await p.screenshot({ path: `${outDir}/${id}.jpg`, type: 'jpeg', quality: 85 }); }
console.log('frames', times.length, 'errors', errs.length, errs.slice(0, 5).join(' | '));
await b.close();
