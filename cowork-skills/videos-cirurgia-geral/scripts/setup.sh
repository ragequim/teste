#!/usr/bin/env bash
# Instala dependências (idempotente). Uso: bash setup.sh <pasta_do_projeto>
set -euo pipefail
P="${1:?pasta do projeto}"; cd "$P"
command -v ffmpeg >/dev/null || { echo "ERRO: ffmpeg não encontrado"; exit 1; }
ffmpeg -hide_banner -filters 2>/dev/null | grep -q " ass " || echo "AVISO: ffmpeg sem libass (legendas dos cortes verticais)."
command -v node >/dev/null || { echo "ERRO: Node 18+ não encontrado"; exit 1; }
PY=python3; if [ -n "${VENV:-}" ] && [ -x "${VENV}/bin/python" ]; then PY="${VENV}/bin/python"; fi
$PY -m pip install -q faster-whisper edge-tts fonttools brotli numpy 2>&1 | tail -1 || true
node -e "import('playwright').then(()=>process.exit(0)).catch(()=>process.exit(1))" 2>/dev/null \
  || [ -f /opt/node-tools/node_modules/playwright/index.mjs ] \
  || { npm i -s playwright@1 && npx playwright install chromium; }
# certificado do proxy (ambientes com proxy TLS, como o Claude Code na nuvem)
[ -f /root/.ccr/ca-bundle.crt ] && export SSL_CERT_FILE=/root/.ccr/ca-bundle.crt || true
echo "OK: dependências prontas em $P"
