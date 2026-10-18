#!/usr/bin/env bash
# Cria um projeto novo a partir do template. Uso: bash novo_projeto.sh <pasta_destino>
set -euo pipefail
SKILL="$(cd "$(dirname "$0")/.." && pwd)"; DEST="${1:?pasta destino}"
mkdir -p "$DEST"/{audio,shorts,thumb,fonts}
cp -Rn "$SKILL"/template/. "$DEST"/ 2>/dev/null || true
echo "Projeto criado em $DEST — edite script.py, anchors.py, scenes.js e cuts.py"
