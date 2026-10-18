---
name: video-motion-narrado
description: Produz vídeos de YouTube narrados em motion design no estilo "Um dia na vida de um cirurgião" — fundo preto, fonte Inter, um único fio branco que se transforma em cada cena, legendas palavra por palavra, trilha gerada em código a 120 BPM — a partir de um roteiro do usuário. Inclui prévia obrigatória para aprovação antes do render final, render 1080p60 com motion blur, cortes verticais para Shorts/Reels/TikTok, descrição com capítulos, tags, textos dos cortes e thumbnail com a foto do usuário. Use sempre que o usuário enviar um roteiro/script para virar vídeo, pedir "um vídeo como o anterior", "no mesmo estilo", "com narração e legendas", ou pedir cortes para shorts, descrição, tags ou thumbnail de um vídeo feito com esta skill.
---

# Vídeo motion narrado (estilo "Um dia na vida")

Workflow completo que gerou o vídeo aprovado pelo usuário. Siga as etapas **na ordem**. A etapa 6
(prévia) é um **portão obrigatório**: nunca faça o render final sem o usuário aprovar a prévia.

Converse em português. Use o texto do usuário **exatamente** como ele escreveu (vira legenda).

## Estrutura

```
SKILL/
  scripts/novo_projeto.sh   cria a pasta do projeto a partir do template
  scripts/setup.sh          instala/checa dependências (ffmpeg, node, playwright, faster-whisper, edge-tts)
  template/                 motor do vídeo (copiado para cada projeto)
    script.py   anchors.py   scenes.js   cuts.py      ← o que muda a cada vídeo
    engine.js modules.js custom.js main.js audio.js index.html   ← motor (não precisa mexer)
    narrate.py align.py timing.py stills.mjs music.mjs render.mjs mix.py shorts.py pw.mjs edge_say.py
    thumb/thumb.html thumb/shot.mjs   fonts/Inter-ExtraBold.ttf   Inter-latin.woff2
  references/brief_design.md        regras de design (motion designer)
  references/modulos.md             catálogo de módulos visuais e como criar novos
  references/descricoes.md          modelos de descrição, tags, textos dos cortes
  references/exemplo_*              roteiro e cenas completos do vídeo de referência
```

## Sistema de design (não negociável)
- **Conceito em 1 linha**, dito ao usuário antes de começar. Base: *um único fio que nunca sai da tela e vira a forma-base de cada cena* (no vídeo de cirurgia: "um fio de sutura costura o plantão inteiro"). Adapte a metáfora ao tema.
- **1 fonte**: Inter. **Cores**: fundo `#0A0A0A`, branco `#F4F2EC`, verde-azulado `#19C39D` (principal), coral `#FF5A47` (alerta/urgência), âmbar `#FFB627` (tempo/noite/destaque). Nada além disso.
- **Câmera única**: aproximação lenta em cada cena; o título final se afasta e **o último quadro é igual ao primeiro** (loop).
- **120 BPM**: trocas de cena alinhadas à batida mais próxima da fala; algo se move em todo tempo (ponto que percorre o fio).
- Técnicas a cobrir: tipografia cinética, morph de formas, momento 2D→3D, momento de dados/interface, título final.
- **Proibido**: partículas, glows, lens flares, camera shake, RGB split, crossfades, gradientes genéricos, easing elástico, pausas paradas > 0,5 s, cara de template.
- Legendas: palavra atual em verde-azulado, até 6 palavras por página, faixa inferior; visuais ficam acima de y≈900.
- Etiqueta de capítulo no canto superior esquerdo (âmbar).

## Etapas

### 0. Projeto e dependências
```bash
bash <SKILL>/scripts/novo_projeto.sh <pasta>   # ex.: <pasta do projeto>/videos/AAAA-MM-DD-slug/work
bash <SKILL>/scripts/setup.sh <pasta>
```
Rode todos os comandos de dentro da pasta do projeto. Renders longos: sempre em segundo plano.

### 1. Roteiro → `script.py`
Um item de `PARAGRAPHS` por parágrafo, texto idêntico ao do usuário. Se o usuário mandar um trecho depois
(ex.: abertura que faltou), insira no lugar certo e **refaça as etapas 2–4** (os tempos mudam).

### 2. Narração (`python narrate.py`)
- Padrão: **edge-tts, voz `pt-BR-AntonioNeural`, `+6%`**, um arquivo por parágrafo (prosódia natural). Cache por hash do texto: só regenera o que mudou. Outras vozes: `VOICE=pt-BR-FranciscaNeural python narrate.py`.
- **Piper foi reprovado** pelo usuário (soa fanhoso). Não use.
- ElevenLabs (melhor qualidade) só se o usuário tiver créditos: rode antes com `estimate_only`, use `generations_count: 1` (o padrão de 4 variações já esgotou a conta uma vez) e avise o custo.
- Avise: edge-tts usa o serviço de leitura do Edge, não é API comercial oficial.

### 3. Alinhamento (`python align.py`)
faster-whisper `small` com o texto como referência → `words.json` com tempo de cada palavra.
Meta: ≥ 95% casadas. Se uma palavra sair errada no áudio, teste variações de pontuação (vírgula costuma resolver) — só altere o texto falado se o Whisper mostrar erro real.

### 4. Cenas: `anchors.py` + `scenes.js` → `python timing.py`
- Divida em cenas de ~5–12 s (1 ideia cada). `anchors.py`: `(id, primeiras palavras da cena)`.
- `scenes.js`: um módulo por cena (catálogo em `references/modulos.md`; exemplo completo em `references/exemplo_scenes_um_dia_na_vida.js`). Primeira cena = título com `instant: true`; `end` = mesmo título com `noExit: true`.
- Rótulos curtos, em CAIXA ALTA, fiéis ao roteiro. Números exatos do roteiro.
- `CHAPTERS`: capítulos (também viram "hits" maiores na trilha).
- Mostre ao usuário o **conceito + storyboard por capítulo** (tabela) antes de seguir.

### 5. Revisão por quadros (`node stills.mjs stills mid`)
Gera 1 quadro do meio de cada cena + relata erros JS. Monte folhas de contato (ffmpeg xstack) e **olhe todas**.
Checklist: nada sobreposto, nada saindo do quadro, texto legível, rótulos não colidem com ícones,
pessoas grandes o suficiente, barras com o sentido certo, 3D limpo, nada cortado pela aproximação da câmera.
Também confira quadros de transição (`node stills.mjs t times 23 50 ...`) e que primeiro ≈ último quadro.

### 6. PRÉVIA — portão obrigatório
```bash
node music.mjs                    # trilha em código (≈15 min para 7 min de vídeo; rode em 2º plano)
node render.mjs previa.mp4 24 960 1 3   # 960x540, 24fps, sem motion blur (≈3 min) — em paralelo
python mix.py audio               # narração −16 LUFS + trilha −24 LUFS com ducking → final_mix.wav
python mix.py mux previa.mp4 previa_final.mp4
```
Envie `previa_final.mp4` ao usuário com: o que conferir (textos das cenas, ritmo da trilha, abertura, cenas 3D)
e o pedido de ajustes por minuto/trecho. **Pare e espere.** Aplique as edições (scenes.js / script.py) e,
se mudou algo relevante, gere nova prévia. Só siga com "pode finalizar"/aprovação explícita.

### 7. Render final
```bash
node render.mjs final.mp4 60 1920 3 4    # 1080p60, 3 subquadros + tmix (motion blur). ≈4 min por minuto de vídeo
python mix.py mux final.mp4 <nome>.mp4
python mix.py srt <nome>.srt
```
Valide (ffprobe: 1920x1080, 60fps, duração) e veja 1 quadro.

### 8. Cortes verticais (`cuts.py` → `python shorts.py`)
6–8 cortes de 12–50 s (critérios em `references/descricoes.md`). Cada corte é renderizado sem legenda
(`NOCAP`), montado em 1080x1920: gancho no topo (2 linhas), vídeo no centro sobre fundo desfocado,
legendas grandes em Inter (3 palavras por página), etiqueta `TAG` embaixo. Confira 1 quadro de cada.

### 9. Descrição, capítulos, tags e textos dos cortes
`python mix.py chapters <ids de cena>` dá os tempos reais. Modelos em `references/descricoes.md`.
Peça ao usuário o link do vídeo publicado para os textos dos cortes (use `https://youtu.be/ID`, sem `?si=`/`?is=`).

### 10. Thumbnail
Rode a skill `lite-cge-holy-trifecta` (título, conceito, intro) e monte com `thumb/thumb.html`
(`node thumb/shot.mjs <abs>/thumb/thumb.html <abs>/thumb/thumbnail.png`): texto 3–4 palavras em CAIXA ALTA
com contorno, foto do usuário em `thumb/foto.png` à direita com degradê, elemento do vídeo (fio/linha do tempo)
como foco. Confira em 320x180. **Recorte pacientes da foto** (privacidade) e **não publique o rosto do usuário
em repositório público** sem confirmação.

## Entrega
Salve em `videos/AAAA-MM-DD-slug/` no repositório do projeto (o `.mp4` final, o `.srt` e a pasta `shorts/`). Arquivos de trabalho ficam na pasta `work/`, que não precisa ser versionada.
Envie os arquivos ao usuário (SendUserFile ou equivalente). GitHub rejeita arquivos > 100 MB.

## Armadilhas já resolvidas
- `pkill -f render.mjs` mata o próprio terminal → use `pgrep -f "node (render|music)[.]mjs"` e `kill`.
- edge-tts atrás de proxy TLS: `edge_say.py` usa `SSL_CERT_FILE` (ou `/root/.ccr/ca-bundle.crt`) sem desligar a verificação.
- faster-whisper com erro de `av.open(... metadata_errors)`: passe áudio já decodificado (numpy), como `align.py` faz.
- Legendas ASS precisam de ffmpeg com libass e fonte TTF (`fonts/Inter-ExtraBold.ttf`); `shorts.py` escolhe sozinho um ffmpeg com libass.
- Recorte lateral dos cortes: no máximo 60 px de cada lado, senão corta a etiqueta de capítulo.
- Legendas: nunca deixe duas páginas sobrepostas (o fim de uma palavra é limitado pelo início da próxima).
- Trilha (OfflineAudioContext) demora ~2× a duração do vídeo: dispare cedo, em paralelo à prévia.
