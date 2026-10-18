import { launch } from '../pw.mjs';
const b = await launch();
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
await p.goto('file://' + process.argv[2]); await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: process.argv[3] }); await b.close();
