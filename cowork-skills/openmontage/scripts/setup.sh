#!/usr/bin/env bash
# Instala ou atualiza o OpenMontage numa pasta persistente.
# Uso: bash setup.sh <pasta-do-openmontage> [--update]
# Idempotente: pode rodar quantas vezes quiser; só refaz o que estiver faltando.
set -uo pipefail

OM="${1:?informe a pasta de destino, ex: ~/Projetos/youtube/OpenMontage}"
UPDATE="${2:-}"
REPO="https://github.com/calesthio/OpenMontage.git"
log() { printf '\n==> %s\n' "$*"; }
fail() { printf '\nERRO: %s\n' "$*" >&2; exit 1; }

# 1. Código
if [ -f "$OM/AGENT_GUIDE.md" ] && [ -d "$OM/.git" ]; then
  if [ "$UPDATE" = "--update" ]; then
    log "Atualizando OpenMontage (git pull)"
    git -C "$OM" pull --ff-only || echo "  [aviso] git pull falhou; seguindo com a versão local"
  fi
else
  log "Clonando OpenMontage em $OM"
  mkdir -p "$(dirname "$OM")"
  GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 "$REPO" "$OM" \
    || fail "não consegui clonar $REPO. Verifique se o acesso à internet (github.com) está liberado nas configurações do Cowork."
fi
cd "$OM" || fail "pasta $OM inacessível"

# 2. Python 3.10+ e venv
PY=""
for c in python3.13 python3.12 python3.11 python3.10 python3; do
  if command -v "$c" >/dev/null 2>&1 && "$c" -c 'import sys; sys.exit(0 if sys.version_info >= (3,10) else 1)'; then PY="$c"; break; fi
done
[ -n "$PY" ] || fail "Python 3.10+ não encontrado."

VENV="$OM/.venv"
if ! "$VENV/bin/python" -c 'import yaml, pydantic, dotenv' >/dev/null 2>&1; then
  log "Criando ambiente Python em $VENV"
  rm -rf "$VENV"
  "$PY" -m venv "$VENV" 2>/dev/null || "$PY" -m venv --copies "$VENV" || fail "não consegui criar o venv"
  "$VENV/bin/python" -m pip install -q --upgrade pip
  "$VENV/bin/python" -m pip install -q -r requirements.txt || fail "pip install -r requirements.txt falhou (rede bloqueada para pypi.org?)"
  "$VENV/bin/python" -m pip install -q piper-tts || echo "  [aviso] piper-tts não instalou; narração gratuita offline indisponível"
fi
export PATH="$VENV/bin:$PATH"

# 3. Node 18+ (fallback: node via pip, dentro do venv)
node_ok() { command -v node >/dev/null 2>&1 && node -e 'process.exit(+process.versions.node.split(".")[0] >= 18 ? 0 : 1)' && npm --version >/dev/null 2>&1; }
if ! node_ok; then
  log "Node 18+ ausente; instalando nodejs-wheel no venv"
  python -m pip install -q nodejs-wheel-binaries || fail "não consegui instalar o Node.js"
  nw=$(python -c 'import nodejs_wheel, os; print(os.path.dirname(nodejs_wheel.__file__))')
  printf '#!/bin/sh\nexec "%s/bin/node" "$@"\n' "$nw" > "$VENV/bin/node"
  for t in npm npx; do printf '#!/bin/sh\nexec "%s/bin/node" "%s/lib/node_modules/npm/bin/%s-cli.js" "$@"\n' "$nw" "$nw" "$t" > "$VENV/bin/$t"; done
  chmod +x "$VENV/bin/node" "$VENV/bin/npm" "$VENV/bin/npx"
  node_ok || fail "Node.js continua indisponível"
fi

# 4. FFmpeg + ffprobe (fallbacks: apt; static-ffmpeg; imageio-ffmpeg + npm ffprobe-static)
link_bin() { ln -sf "$1" "$VENV/bin/$2"; }
if ! command -v ffmpeg >/dev/null 2>&1 || ! command -v ffprobe >/dev/null 2>&1; then
  log "FFmpeg ausente; tentando instalar"
  if command -v sudo >/dev/null 2>&1 && sudo -n true 2>/dev/null && command -v apt-get >/dev/null 2>&1; then
    sudo -n apt-get install -y -qq ffmpeg >/dev/null 2>&1 || true
  fi
  if ! command -v ffmpeg >/dev/null 2>&1 || ! command -v ffprobe >/dev/null 2>&1; then
    python -m pip install -q static-ffmpeg >/dev/null 2>&1 && \
      paths=$(python -c 'import static_ffmpeg.run as r; print(*r.get_or_fetch_platform_executables_else_raise())' 2>/dev/null) && \
      { set -- $paths; link_bin "$1" ffmpeg; link_bin "$2" ffprobe; }
  fi
  if ! command -v ffmpeg >/dev/null 2>&1; then
    python -m pip install -q imageio-ffmpeg && link_bin "$(python -c 'import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())')" ffmpeg
  fi
  if ! command -v ffprobe >/dev/null 2>&1; then
    mkdir -p "$OM/.tools" && (cd "$OM/.tools" && npm install --no-audit --no-fund --loglevel=error ffprobe-static >/dev/null) && \
      link_bin "$(cd "$OM/.tools" && node -p 'require("ffprobe-static").path')" ffprobe
  fi
  { command -v ffmpeg && command -v ffprobe; } >/dev/null 2>&1 || fail "não consegui instalar FFmpeg/ffprobe"
fi

# 5. Remotion
if [ ! -d remotion-composer/node_modules ] || [ "$UPDATE" = "--update" ]; then
  log "Instalando Remotion (npm install)"
  (cd remotion-composer && npm install --no-audit --no-fund --loglevel=error) \
    || fail "npm install falhou (rede bloqueada para registry.npmjs.org?)"
fi

# 6. Voz pt-BR gratuita (Piper)
VOZ="$OM/.piper-models/pt_BR-faber-medium.onnx"
if command -v piper >/dev/null 2>&1 && [ ! -f "$VOZ" ]; then
  log "Baixando voz pt-BR do Piper"
  mkdir -p "$OM/.piper-models" && (cd "$OM/.piper-models" && python -m piper.download_voices pt_BR-faber-medium >/dev/null 2>&1) \
    || echo "  [aviso] não consegui baixar a voz pt-BR (huggingface.co bloqueado?)"
fi

# 7. .env
[ -f .env ] || { cp .env.example .env; log "Criado $OM/.env (preencha as chaves de API que tiver)"; }

# 8. Resumo
log "Pronto"
echo "  python : $(python --version 2>&1)"
echo "  node   : $(node --version)"
echo "  ffmpeg : $(ffmpeg -version 2>/dev/null | head -1 | cut -d' ' -f1-3)"
echo "  voz pt-BR: $([ -f "$VOZ" ] && echo "$VOZ" || echo 'indisponível')"
echo "  chaves preenchidas no .env: $(grep -cE '^[A-Z_]+(KEY|TOKEN)[A-Z_]*=.+' .env || true)"
echo "  Antes de qualquer comando: export PATH=\"$VENV/bin:\$PATH\" && cd \"$OM\""
