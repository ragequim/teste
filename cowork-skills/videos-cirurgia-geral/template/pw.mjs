// Localiza Playwright e Chromium em qualquer ambiente (Cowork, Claude Code na nuvem, máquina local).
import fs from 'fs';
let pw;
try { pw = await import('playwright'); } catch {
  for (const p of ['/opt/node-tools/node_modules/playwright/index.mjs', process.env.PLAYWRIGHT_MODULE].filter(Boolean)) {
    if (fs.existsSync(p)) { pw = await import(p); break; }
  }
}
if (!pw) throw new Error('Playwright não encontrado: rode "npm i playwright" na pasta do projeto (veja setup.sh).');
function chromePath() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  if (fs.existsSync(base)) for (const d of fs.readdirSync(base).sort().reverse()) {
    const c = `${base}/${d}/chrome-linux/chrome`; if (d.startsWith('chromium-') && fs.existsSync(c)) return c;
  }
  return undefined; // Playwright usa o próprio Chromium instalado
}
export const launch = () => pw.chromium.launch({ executablePath: chromePath() });
export const FFMPEG = process.env.FFMPEG || 'ffmpeg';
