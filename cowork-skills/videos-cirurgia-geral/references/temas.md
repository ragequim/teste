# Guia de temas: receitas de cenas por tipo de vídeo de cirurgia geral

Escolha o tipo de vídeo, use a receita como esqueleto e adapte ao roteiro. Cada linha é uma cena (~5–12 s).
Módulos: `references/modulos.md`. Toda receita começa com `title` (instant) e termina em `end` = mesmo título (loop).

## 1. Técnica cirúrgica (ex.: colecistectomia, apendicectomia, hernioplastia, laparotomia)
| Momento | Módulo |
|---|---|
| Gancho: nome da cirurgia + promessa ("em 5 passos") | `title` |
| Quando indicar | `card` (checklist) ou `tree` (indicação → conduta) |
| Anatomia relevante | `organ` com `labels` (ex.: fígado + vesícula + ducto cístico) |
| Posicionamento/portais | `orTop` (sala 2D→3D) ou `organ` com pontos |
| Passo a passo | `steps` (1 cena com todos os passos, ou 1 cena por passo com `active: i`) |
| Ponto crítico de segurança | `define` (ex.: visão crítica) |
| Vídeo × aberta / conversão | `compare` + `convert` |
| Tempo de cirurgia, números | `bars` / `counter` |
| Complicações | `notif` (lista) ou `tree` |
| Pós-operatório | `timeline` (D0, D1, alta) |
| Figura do livro | `image` (figura extraída com a skill livros-cirurgia-geral; cite a fonte) |

## 2. Doença / caso clínico (ex.: apendicite, colecistite, obstrução intestinal, abdome agudo)
| Momento | Módulo |
|---|---|
| Gancho: pergunta clínica ("dor na fossa ilíaca direita: é apendicite?") | `title` |
| Definição | `define` |
| Onde fica / fisiopatologia | `organ` + `flow` (causa → consequência) |
| Sinais e sintomas | `card` ou `notif` |
| Diagnóstico (exame físico, laboratório, imagem) | `steps` ou `ct` / `image` |
| Classificação / escores | `bars` ou `grid` |
| Conduta | `tree` (ex.: inflamatório → opera cedo; obstrutivo → conservador → decide) |
| Instabilidade, urgência | `ecg` (`stabilize` / `arrest`) |
| Resumo | `card` com 3 checks |

## 3. Residência, rotina e carreira (ex.: "um dia na vida", "vale a pena", "como escolher")
| Momento | Módulo |
|---|---|
| Horários, plantões | `clock` |
| Agenda do dia, eletivas × urgências | `timeline` |
| Equipe, turma, quem faz o quê | `people`, `org` |
| Volume / números do residente | `counter`, `bars` |
| Enfermaria, leitos, divisão | `grid` |
| Trabalho em paralelo, escalas | `lanes` |
| Encaminhamentos, rede | `network` |
| Decisão de carreira | `tree` + `base3d` (momento mais forte) |
| Cansaço, limites honestos | `battery`, `compare` |
| Exemplo completo: `references/exemplo_scenes_um_dia_na_vida.js` |

## 4. Dicas de prova / estudo (ex.: "5 temas que mais caem", "como estudar cirurgia")
`title` → `steps` (lista numerada) → para cada item: `define` + `card` → `compare` (pegadinha × resposta) → `counter` (incidência, se houver fonte) → `comments`.

## Regras de conteúdo médico
- **Nunca invente** números, estatísticas, doses, escores ou citações. Se faltar dado, use `[FILL IN: ...]` no roteiro e pergunte.
- Fatos técnicos: confira com a skill **livros-cirurgia-geral** (Sabiston, Zollinger, Skandalakis) e cite a fonte na descrição quando usar figura ou dado do livro.
- Marque para o usuário revisar qualquer afirmação clínica de que você não tenha certeza **antes** da prévia.
- Vídeos sobre doença/conduta: inclua na descrição "Conteúdo educativo. Não substitui avaliação médica."
- **Privacidade**: nada que identifique pacientes (rosto, nome, prontuário, tela de sistema). Recorte pacientes de fotos. Não mostre o hospital de forma negativa sem o usuário pedir.
