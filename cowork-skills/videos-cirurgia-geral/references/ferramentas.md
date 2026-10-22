# Ferramentas e o que aprendemos com cada uma

## Narração
| Ferramenta | Situação | Como usar |
|---|---|---|
| **edge-tts `pt-BR-AntonioNeural` +6%** | **padrão aprovado** | `narrate.py` (1 arquivo por parágrafo, cache por texto). Femininas: `pt-BR-FranciscaNeural`, `pt-BR-ThalitaMultilingualNeural`. Mande amostras quando o usuário quiser trocar de voz. Não é API comercial oficial (avise). Atrás de proxy TLS, `edge_say.py` usa o certificado do proxy. |
| **ElevenLabs** (conector MCP) | melhor qualidade, **pago** | Sempre `estimate_only` antes; `generations_count: 1`; modelo `eleven_v4` com tags `[excited]`, `[warmly]`; voz pt-BR via `creative_list_voices` (ex.: Fernando Nowvaro). A conta já esgotou uma vez gerando 4 variações por parágrafo. Baixe o áudio por `content_url` (expira em 2 h). |
| Piper (OpenMontage) | **reprovado** ("fanhoso") | Não usar. |
| Voz do próprio usuário | ótima opção | Receba o áudio, rode `align.py` sobre ele (pule `narrate.py`). |

## Legendas e tempos
- **faster-whisper `small`** (`align.py`): passa o áudio decodificado (numpy) — evita erro do `av`. Usa o texto como referência e casa palavra a palavra (≥ 95%).
- Se o Whisper ouvir errado, a TTS provavelmente pronunciou mal: teste variações de **pontuação** (vírgula resolveu "Hoje, irei" e "Fora, a").
- Siglas (R1, UTI, RTU, UFU) e números: a Antonio lê bem o texto original; não "soletre".

## Visual
- **Motor canvas próprio** (este template): estilo aprovado; tudo calculado por `window.seek(t)`; render com Playwright.
- **OpenMontage** (github.com/calesthio/OpenMontage): alternativa de estilo "explainer com ilustrações" (1º vídeo do canal): ilustrações SVG esquemáticas por parágrafo + Remotion (`Explainer`, props com `cuts`, `captions`, `audio`). Ao rasterizar SVG com Chromium, capture mais alto e recorte (evita faixa branca embaixo).
- **Figuras de livros**: skill `livros-cirurgia-geral` extrai figuras dos PDFs do usuário → módulo `image`.
- **ElevenLabs imagem/vídeo**: possível, mas consome créditos; preferir desenho vetorial (mais coerente com o estilo).

## Trilha
- **Gerada em código** (`audio.js`, OfflineAudioContext, 120 BPM, Lá menor): padrão do estilo aprovado; ~2× a duração do vídeo para renderizar.
- **Pixabay** (licença livre, sem atribuição obrigatória): alternativa; ferramenta `pixabay_music` do OpenMontage; emendar 2 faixas com `acrossfade`.
- Mixagem: voz −16 LUFS, trilha −24 LUFS com sidechain (abaixa sob a voz) — `mix.py audio`.

## Render e entrega
- Prévia: `render.mjs` 960 px, 24 fps, sem subquadros (≈ 3 min para 7 min).
- Final: 1920 px, 60 fps, 3 subquadros + `tmix` (≈ 4 min de render por minuto de vídeo com 4 núcleos).
- Cortes verticais: `shorts.py` (ffmpeg com libass + Inter TTF).
- GitHub: arquivos < 100 MB; repositório público → não subir rosto do usuário nem nada de paciente.

## Pacote do YouTube
- Skills do usuário: `lite-cge-holy-trifecta` (título + thumbnail + intro), `lite-cge-scriptwriter` (roteiro a partir de tema),
  `lite-cge-video-idea-finder` (ideias), `lite-cge-settings` (pós-upload), `livros-cirurgia-geral` (conteúdo técnico).
- vidIQ (conector) exige autorização do usuário; útil para pesquisa de palavras-chave e títulos quando estiver ativo.
- Ao usar holy-trifecta: o bloco final de links vem com valores corrompidos no arquivo da skill — não reproduza números quebrados.
