---
name: openmontage
description: Produz vídeos com o OpenMontage (github.com/calesthio/OpenMontage), sistema open-source de produção de vídeo por agentes — explainers com ilustrações esquemáticas, montagens com imagens/vídeos de banco, documentários, avatar, dublagem, cortes de podcast. Use quando o usuário citar o OpenMontage, pedir o estilo "explainer com ilustrações" do primeiro vídeo do canal (residência no Hospital Municipal), pedir vídeo com imagens/vídeos reais de banco, ou pedir para instalar, atualizar ou checar o OpenMontage. Para o estilo motion design aprovado do canal (fundo preto, fio que se transforma), prefira a skill videos-cirurgia-geral. Instala tudo sozinho na primeira vez e reaproveita a instalação.
---

# OpenMontage no Cowork

O OpenMontage é um pipeline de produção de vídeo guiado por instruções. Ele cuida de pesquisa, roteiro, narração, busca de imagens e vídeos, composição no Remotion ou HyperFrames, legendas, revisão e render final. Quem decide é você, o agente, lendo os manifests e as skills do próprio repositório. Esta skill só garante que ele esteja instalado e diz como usá-lo neste projeto.

## 1. Localizar a pasta do projeto

- Use a pasta do projeto ou workspace que o usuário conectou ao Cowork. É a pasta do computador dele que fica montada na sessão.
- `OM` = `<pasta do projeto>/OpenMontage`
- Vídeos finais vão em `<pasta do projeto>/videos/<AAAA-MM-DD>-<slug>/`
- Se nenhuma pasta estiver conectada, peça ao usuário para escolher uma. Sem pasta, a instalação é perdida ao fim da sessão e cada vídeo exigiria reinstalar tudo, o que leva de 5 a 10 minutos.

## 2. Garantir a instalação (sempre, antes de qualquer trabalho)

```bash
bash "<diretório desta skill>/scripts/setup.sh" "$OM"
```

- O script é idempotente. Se tudo já estiver instalado, termina em segundos. Na primeira vez leva alguns minutos: avise o usuário antes de começar.
- Ele clona o repositório, cria o `.venv`, instala as dependências Python, o Remotion (npm) e o Piper TTS, baixa a voz pt-BR `pt_BR-faber-medium` e cria o `.env`. Se faltar FFmpeg ou Node 18+, instala por conta própria.
- Se o usuário pedir para **atualizar** o OpenMontage, rode o script com `--update` no final.
- Se aparecer erro de rede (github.com, pypi.org, registry.npmjs.org ou huggingface.co bloqueados), explique ao usuário que o acesso à internet precisa estar liberado para esses domínios nas configurações do Cowork. Não tente contornar o bloqueio.

Antes de **todo** comando do OpenMontage:

```bash
export PATH="$OM/.venv/bin:$PATH" && cd "$OM"
```

## 3. Produzir o vídeo

1. **Leia `$OM/AGENT_GUIDE.md` inteiro antes de qualquer coisa** e siga o que ele manda. O principal é a Rule Zero: toda produção passa por um pipeline em `pipeline_defs/`. Para cada etapa, leia antes a skill de diretor correspondente em `skills/pipelines/<pipeline>/`. Não escreva scripts improvisados para chamar as ferramentas diretamente.
2. Para saber o que está disponível de verdade nesta máquina, rode o preflight do registry (está no AGENT_GUIDE) e apresente ao usuário, em português, o que dá para fazer com as chaves que ele tem.
3. Respeite os checkpoints de aprovação do OpenMontage, como roteiro, escolha de pipeline e custos estimados. Não gaste créditos de API pagos sem o usuário aprovar.

### Padrões deste usuário

- **Idioma**: converse em português. Roteiro, narração e legendas também em **português do Brasil**, a menos que o usuário peça outro idioma.
- **Narração**: o Piper (voz `pt_BR-faber`) foi **reprovado** pelo usuário ("falha, fanhosa") — não use. Padrão: **edge-tts `pt-BR-AntonioNeural`, `+6%`** (gere fora do OpenMontage, um arquivo por cena/parágrafo; atrás de proxy TLS aponte o `ssl` do edge-tts para o certificado do proxy). ElevenLabs só com créditos: estime antes e gere 1 variação por trecho.
- **Prévia obrigatória**: antes do render final, entregue uma prévia (baixa resolução, com áudio e legendas) e espere a aprovação/edições do usuário.
- **Roteiro**: use o texto do usuário exatamente como escrito (vira legenda). Conteúdo médico: nada inventado; confira com a skill `livros-cirurgia-geral`.
- **Formato YouTube**: vídeo longo em 16:9 1920x1080. Shorts em 9:16 1080x1920 com até 60 s. Se o usuário não disser qual, pergunte.
- **Entrega**: copie o MP4 final, o roteiro e a thumbnail (se houver) para `<pasta do projeto>/videos/<AAAA-MM-DD>-<slug>/` e informe o caminho. Os arquivos intermediários ficam em `$OM/projects/`.

## Receita testada: "explainer com ilustrações" (1º vídeo do canal)
Feito com o pipeline `animated-explainer` + composição `Explainer` do `remotion-composer`:
1. **Cenas**: 1 cena por frase/ideia (~26 cenas para 4 min). Narração por cena → linha do tempo com 0,45 s entre cenas.
2. **Legendas palavra por palavra**: alinhe o áudio com **faster-whisper** (`small`, passando o áudio decodificado em numpy — o `av` dá erro com `metadata_errors`), case com o texto do roteiro e gere `captions` (`{word,startMs,endMs}`) para o `Explainer`. Pronúncia errada → teste pontuação (vírgula).
3. **Ilustrações**: SVG esquemáticos desenhados por cena (fundo azul-marinho, traço claro, cores planas, 1920x1080), rasterizados com Chromium. **Capture a tela mais alta (ex.: 1920x1300) e recorte 1920x1080** — senão sobra uma faixa branca embaixo que vai para o vídeo. Mantenha o conteúdo na área central (escala 0,84): o zoom ken-burns do `ImageScene` chega a 1,22x e corta as bordas.
4. **Legendas maiores**: no `Explainer.tsx` troque `wordsPerPage={6}`/`fontSize={42}` por `props.captionWordsPerPage`/`props.captionFontSize` e use 5/54.
5. **Trilha**: `pixabay_music` (sem chave), duas faixas emendadas com `acrossfade`; voz −16 LUFS, trilha −24 LUFS com `sidechaincompress` (abaixa sob a voz).
6. **Cortes verticais**: renderize trechos **sem legenda** e monte 1080x1920 no ffmpeg (fundo desfocado forte, vídeo no centro, gancho em 2 linhas no topo, legenda ASS grande palavra por palavra; recorte lateral ≤ 60 px; nunca sobreponha páginas de legenda).
7. Pacote do YouTube (descrição com capítulos, tags, textos dos cortes, thumbnail): mesmos modelos da skill `videos-cirurgia-geral` (`references/descricoes.md`).

## 4. Chaves de API

- As chaves ficam em `$OM/.env`, no computador do usuário. **Nunca** exiba, copie ou registre o valor de uma chave. Para saber quais estão preenchidas, liste só os nomes:
  `grep -oE '^[A-Z_]+=.+' "$OM/.env" | cut -d= -f1`
- Sem nenhuma chave, ainda dá para fazer vídeo com narração edge-tts, material de arquivo aberto (Archive.org, NASA, Wikimedia), música da Pixabay, composição no Remotion ou HyperFrames e legendas.
- Quando faltar uma chave para o que o usuário quer, diga qual é e onde conseguir (o `.env.example` traz os links). Para adicionar, o usuário edita `OpenMontage/.env` na pasta do projeto. Chaves gratuitas que valem a pena: `PEXELS_API_KEY` e `PIXABAY_API_KEY`, para vídeos de banco de imagens.

## 5. Avisos

- A licença é AGPLv3. Usar o OpenMontage para gerar vídeos não impõe nada aos vídeos. Só copiar o código dele para outro software publicado é que traria as obrigações da AGPL.
- Renderizar demora. Um vídeo de 1 a 2 minutos pode levar vários minutos no Remotion. Avise o usuário e acompanhe o progresso.
