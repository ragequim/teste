# Contexto do projeto: vídeos de YouTube de cirurgia geral

Arquivo de passagem para continuar o trabalho no Claude Cowork (projeto "vídeos para YT de cirurgia geral").
Coloque este arquivo na pasta do projeto ou nas instruções do projeto e instale a skill **videos-cirurgia-geral** (substitui a antiga `video-motion-narrado`).

## Quem é o criador
Residente R1 de cirurgia geral no Hospital Municipal Dr. Odelmo Leão Carneiro (Uberlândia‑MG).
Canal de YouTube sobre rotina e residência de cirurgia geral. Público: estudantes de medicina e quem vai escolher residência.
Conversa sempre em português do Brasil.

## Vídeos já publicados
| Vídeo | Link | Formato |
|---|---|---|
| Residência de cirurgia geral no Hospital Municipal de Uberlândia (vale a pena?) | https://youtu.be/FdLb_qoNn8A | ilustrações esquemáticas + Remotion (OpenMontage), ~4 min |
| Um dia na vida de um cirurgião (24h sem filtro) | https://youtu.be/wG1eW0xufOU | motion design (estilo aprovado), 7min38s |

Arquivos (vídeos, .srt, cortes verticais): repositório GitHub `ragequim/teste`, branch `claude/video-residencia-municipal`, pasta `videos/`.

## Estilo aprovado ("gostei desse jeito") → skill `videos-cirurgia-geral`
- Motion design em fundo preto `#0A0A0A`, fonte única **Inter**, cores: verde‑azulado `#19C39D` (principal), coral `#FF5A47` (alerta), âmbar `#FFB627` (tempo/noite), branco `#F4F2EC`.
- Conceito: **um único fio (de sutura) que nunca sai da tela e vira cada cena**; cada cena nasce da anterior; último quadro = primeiro (loop).
- 120 BPM, trocas de cena na batida; trilha gerada em código (kick, baixo, pad, hits nas trocas, riser no final), abaixada sob a voz.
- Legendas palavra por palavra (palavra atual em verde‑azulado), etiqueta de capítulo no canto.
- Proibido: partículas, glows, lens flare, tremida de câmera, RGB split, crossfade, gradiente genérico, easing elástico, pausas paradas > 0,5 s.

## Preferências e decisões do criador
- **Sempre entregar uma PRÉVIA (baixa resolução, com áudio) antes do render final** e esperar aprovação/edições.
- Narração: voz **edge‑tts pt‑BR‑AntonioNeural (+6%)**. A voz Piper foi **reprovada** ("falha, fanhosa").
  ElevenLabs só com créditos (a conta esgotou; sempre estimar antes e gerar 1 versão por trecho, não 4).
- Usar o roteiro **exatamente** como escrito (vira legenda).
- Entregas de cada vídeo: MP4 1080p60, `.srt`, **6–8 cortes verticais** (Shorts/Reels/TikTok) com gancho no topo,
  **descrição com capítulos**, **tags** (≤ 500 caracteres), **descrição de cada corte** com link do vídeo completo
  (`https://youtu.be/ID`, sem `?si=`/`?is=`), **thumbnail** pelo método da skill *lite‑cge‑holy‑trifecta*.
- Thumbnail com a **foto do criador operando** (videolaparoscopia), recortando o paciente; não publicar o rosto em repositório público.
  Última thumbnail: "24H DE CIRURGIÃO" + linha do tempo 05:00 → 04:00 + foto à direita.
- Links clicáveis: em Shorts usar o campo "Vídeo relacionado"; em Reels/TikTok "link na bio".

## Fatos usados nos vídeos (não inventar outros)
- R1 com 200+ cirurgias, 20+ como cirurgião principal (vídeo 2); vídeo 1: 40+ colecistectomias por vídeo (8 como principal), 30 apendicectomias (14 como principal), 220+ cirurgias por residente.
- Turma retomando a residência: eu + 3 colegas; sem preceptor acadêmico fixo, convivência direta com plantonistas.
- Serviço não tem trauma (estágio na UFU); enfermaria mista; urgências à tarde; plantão até 19h ou 24h.

## Outras skills do criador úteis aqui
`lite-cge-holy-trifecta` (título/thumbnail/intro), `lite-cge-scriptwriter`, `lite-cge-video-idea-finder`, `lite-cge-settings`
(pós‑upload), `livros-cirurgia-geral` (Zollinger/Skandalakis/Sabiston para conteúdo técnico).

## Próximo vídeo (como pedir)
Qualquer tema de cirurgia geral (técnica, doença, anatomia, residência, prova):
- Com roteiro: "Faz um vídeo no mesmo estilo com este roteiro: …"
- Só com tema: "Faz um vídeo sobre colecistectomia videolaparoscópica" → a skill escreve o roteiro (sem inventar dados), mostra para aprovar,
  monta conceito + storyboard, gera a prévia, espera aprovação, renderiza, corta os shorts e entrega descrição, tags e thumbnail.
