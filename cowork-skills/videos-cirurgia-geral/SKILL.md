---
name: videos-cirurgia-geral
description: Automação de vídeos de YouTube sobre qualquer tema de cirurgia geral — técnica cirúrgica, doenças e abdome agudo, anatomia, residência e rotina, carreira, dicas de prova — no estilo motion design aprovado pelo canal (fundo preto, fonte Inter, um fio que se transforma em cada cena, legendas palavra por palavra, trilha a 120 BPM). Do tema ou roteiro até o pacote completo: roteiro (quando só há tema), narração, prévia obrigatória para aprovação, render 1080p60, cortes verticais para Shorts/Reels/TikTok, descrição com capítulos, tags, textos dos cortes e thumbnail com a foto do usuário. Use sempre que o usuário pedir um vídeo (ou "um vídeo no mesmo estilo") sobre cirurgia, residência ou medicina para o canal, enviar um roteiro/tema, ou pedir cortes, descrição, tags ou thumbnail desses vídeos.
---

# Vídeos de cirurgia geral (pipeline completo do canal)

Automatiza o que foi construído nos vídeos do canal ("Residência no Municipal" e "Um dia na vida de um cirurgião",
este último com o estilo aprovado). Serve para **qualquer tema de cirurgia geral**: escolha a receita em
`references/temas.md`. Converse em português. **A prévia (etapa 7) é um portão obrigatório**: nunca faça o render
final sem aprovação explícita do usuário.

## Arquivos
```
scripts/novo_projeto.sh  scripts/setup.sh
template/  script.py anchors.py scenes.js cuts.py   ← mudam a cada vídeo
           engine.js modules.js modules_cg.js custom.js main.js audio.js index.html   ← motor
           narrate.py align.py timing.py stills.mjs music.mjs render.mjs mix.py shorts.py pw.mjs edge_say.py
           thumb/thumb.html thumb/shot.mjs  fonts/  Inter-latin.woff2
references/temas.md        receitas de cenas por tipo de vídeo + regras de conteúdo médico
references/modulos.md      catálogo de módulos visuais (genéricos, cirúrgicos, específicos) e como criar novos
references/ferramentas.md  narração, legendas, visual, trilha, render — o que funciona e o que foi reprovado
references/descricoes.md   modelos de descrição, capítulos, tags, textos dos cortes, critérios de corte
references/brief_design.md regras de motion design
references/exemplo_*       roteiro + cenas completos de "Um dia na vida de um cirurgião"
```

## Sistema de design (estilo aprovado — manter em todos os vídeos)
- **Conceito em 1 linha** antes de começar: *um único fio que nunca sai da tela e vira a forma-base de cada cena*. Metáfora padrão: fio de sutura. Adapte ao tema (ex.: em vídeo de vias biliares, o fio "é" o ducto).
- **Inter** como única fonte. Cores: fundo `#0A0A0A`, branco `#F4F2EC`, verde-azulado `#19C39D` (principal), coral `#FF5A47` (alerta, sangue, urgência), âmbar `#FFB627` (tempo, noite, destaque).
- Câmera única (aproximação lenta), 120 BPM, trocas de cena na batida, algo se move em todo tempo; último quadro = primeiro (loop).
- Cobrir: tipografia cinética, morph, momento 2D→3D, momento de dados/interface, título final.
- **Proibido**: partículas, glows, lens flare, tremida, RGB split, crossfade, gradiente genérico, easing elástico, pausa parada > 0,5 s.
- Legendas palavra por palavra (até 6 por página, palavra atual em verde-azulado). Etiqueta de capítulo em âmbar.

## Etapas

### 0. Projeto
`bash <SKILL>/scripts/novo_projeto.sh <pasta>` e `bash <SKILL>/scripts/setup.sh <pasta>`. Rode tudo de dentro da pasta.
Renders longos sempre em segundo plano.

### 1. Roteiro
- **Usuário mandou roteiro**: use o texto **exatamente** como escrito (vira legenda) em `script.py` (1 item por parágrafo).
  Trecho enviado depois (ex.: abertura) → insira no lugar e refaça as etapas 2–5.
- **Usuário mandou só o tema**: escreva o roteiro com a skill `lite-cge-scriptwriter` (gancho + promessa nas 2 primeiras frases,
  frase de curtida, CTA de comentários no fim), confira os fatos com `livros-cirurgia-geral`, use `[FILL IN: ...]` para o que
  faltar e **mostre o roteiro para aprovação** antes de narrar.
- Regras médicas em `references/temas.md` (nada inventado, revisão de afirmações clínicas, aviso educativo, privacidade).

### 2. Narração — `python narrate.py`
Padrão: edge-tts `pt-BR-AntonioNeural` +6%, 1 arquivo por parágrafo. Alternativas e cuidados em `references/ferramentas.md`
(ElevenLabs só com créditos e estimativa antes; Piper reprovado; voz do próprio usuário é aceita).

### 3. Legendas — `python align.py`
Meta ≥ 95% das palavras casadas. Erros de pronúncia → teste pontuação.

### 4. Tipo de vídeo, conceito e storyboard
Escolha a receita em `references/temas.md`. Defina cenas (1 ideia, ~5–12 s) em `anchors.py` e `scenes.js`
(módulos em `references/modulos.md`; exemplo completo em `references/exemplo_scenes_um_dia_na_vida.js`).
Figuras de livro: extraia com `livros-cirurgia-geral`, salve em `figs/` e declare em `IMAGES`.
Mostre ao usuário **conceito + storyboard por capítulo** (tabela) e siga.

### 5. Tempos — `python timing.py`

### 6. Revisão por quadros — `node stills.mjs stills mid`
Folhas de contato de todas as cenas + quadros de transição. Corrija: sobreposição, texto fora do quadro, rótulo colidindo
com ícone, pessoas pequenas, barras invertidas, 3D confuso, corte pela câmera. Confira primeiro ≈ último quadro.

### 7. PRÉVIA — portão obrigatório
```bash
node music.mjs                          # trilha em código (2º plano; ~2× a duração)
node render.mjs previa.mp4 24 960 1 3   # em paralelo
python mix.py audio && python mix.py mux previa.mp4 previa_final.mp4
```
Envie a prévia com o que conferir (textos das cenas, termos técnicos, ritmo da trilha, abertura). **Pare e espere.**
Aplique ajustes; se forem grandes, nova prévia. Só siga com aprovação explícita ("pode finalizar").

### 8. Render final
`node render.mjs final.mp4 60 1920 3 4` → `python mix.py mux final.mp4 <nome>.mp4` → `python mix.py srt <nome>.srt`. Valide (ffprobe + 1 quadro).

### 9. Cortes verticais — `cuts.py` → `python shorts.py`
6–8 cortes de 12–50 s (critérios em `references/descricoes.md`), `TAG` com o tema do canal. Confira 1 quadro de cada.

### 10. Pacote do YouTube
Descrição com capítulos (`python mix.py chapters <ids>`), tags ≤ 500 caracteres, texto de cada corte — modelos em
`references/descricoes.md`. Peça o link após publicar (formato `https://youtu.be/ID`). Em vídeo de doença/conduta, inclua
o aviso educativo; se usou figura/dado de livro, cite a fonte.

### 11. Thumbnail
`lite-cge-holy-trifecta` (título, conceito, intro) + `thumb/thumb.html` com a foto do usuário em `thumb/foto.png`
(`node thumb/shot.mjs <abs>/thumb/thumb.html <abs>/thumb/thumbnail.png`). 3–4 palavras em CAIXA ALTA com contorno, elemento
do vídeo como foco, conferir em 320x180. **Recorte pacientes**; não publique o rosto em repositório público sem confirmação.

## Entrega
`videos/AAAA-MM-DD-slug/` no repositório do usuário: MP4 final, `.srt`, `shorts/`; trabalho em `work/`. GitHub < 100 MB/arquivo.

## Armadilhas já resolvidas
- `pkill -f render.mjs` derruba o próprio terminal → `pgrep -f "node (render|music)[.]mjs"` + `kill`.
- edge-tts atrás de proxy TLS → `edge_say.py` usa o certificado do proxy, sem desligar verificação.
- faster-whisper e `av.open(metadata_errors)` → áudio decodificado em numpy (`align.py`).
- Legendas dos cortes precisam de ffmpeg com libass + Inter TTF (`shorts.py` escolhe o ffmpeg certo).
- Recorte lateral dos cortes ≤ 60 px; páginas de legenda nunca sobrepostas.
- Trilha em código é lenta: dispare cedo, em paralelo à prévia.
- Créditos de ElevenLabs acabam rápido: estimar antes, 1 variação por trecho.
