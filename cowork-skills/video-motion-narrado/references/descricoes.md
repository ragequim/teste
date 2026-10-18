# Modelos de descrição, tags e textos dos cortes

## Vídeo longo — estrutura da descrição
```
[1–2 frases: a promessa do vídeo com a palavra-chave principal logo no começo]

Neste vídeo:
• [5–7 tópicos concretos, com os números reais do roteiro]

⏱️ CAPÍTULOS
0:00 [título do gancho]
m:ss [capítulo]            ← tempos de `python mix.py chapters <ids>` (início real de cada cena)

💬 [pergunta/CTA de comentários, igual ao final do roteiro]
👍 Se curtiu, deixa o like e se inscreve no canal.
▶️ [vídeo anterior relacionado: título + link curto youtu.be/ID]
⚠️ Relato da experiência pessoal. Não representa a posição oficial de nenhuma instituição.

#hashtag1 #hashtag2 #hashtag3
```
Regras: capítulos começam em 0:00, no mínimo 3, cada um com ≥ 10 s. Links sempre no formato curto
`https://youtu.be/ID` (remova `?si=`/`?is=`). Números iguais aos do roteiro — nunca invente.

## Tags (campo de tags do YouTube)
- Até 500 caracteres no total, separadas por vírgula.
- Ordem: frase exata do título → variações de busca → tema amplo → termos técnicos citados → público (estudante de medicina) → cidade/instituição se citadas.
- Exemplo usado: `um dia na vida de um cirurgião, rotina de cirurgião, residência de cirurgia geral, residência médica, cirurgia geral, rotina de residente, dia na vida residente, plantão de 24 horas, plantão médico, R1 cirurgia geral, residente de cirurgia, como é ser cirurgião, vida de cirurgião, centro cirúrgico, videolaparoscopia, abdome agudo, enfermaria, como escolher residência médica, prova de residência, medicina, estudante de medicina, cirurgião geral, uberlândia`
- Cortes: `residência cirurgia geral, cirurgia geral, residência médica, rotina de residente, plantão, R1, medicina, shorts`

## Cortes verticais — modelo por corte
```
Título: [gancho em forma de pergunta ou número, ≤ 60 caracteres, 1 emoji opcional]

[2–3 frases com o conteúdo real do trecho, números exatos]
[opcional nos cortes polêmicos/honestos: pergunta que gera comentário — "Você aguentaria? Comenta aí 👇"]

🎥 Vídeo completo: https://youtu.be/ID

#hashtag1 #hashtag2 #hashtag3 #medicina
```
Dicas que sempre vão junto:
- YouTube Shorts: preencher **"Vídeo relacionado"** com o vídeo longo (é o link clicável).
- Reels/TikTok: trocar a linha 🎥 por "link na bio".
- Ordem de postagem: começar pelos ganchos mais fortes (números e polêmica honesta), intercalar os curtos.
- Subir o `.srt` em Legendas → Português no YouTube Studio.

## Como escolher os cortes (cuts.py)
Bons cortes têm 1 ideia, 12–50 s, começam e terminam em frase completa e têm um destes ganchos:
número concreto ("200+ cirurgias no R1"), pergunta prática ("quanto dura uma cirurgia?"),
decisão ("operar agora ou esperar?"), honestidade/limitação ("a verdade do plantão de 24h"),
tensão ("até uma parada"), conselho final ("como escolher"). O gancho do topo tem 2 linhas curtas
(linha 2 em verde-azulado). Faça 6–8 cortes para um vídeo de ~7 min.
