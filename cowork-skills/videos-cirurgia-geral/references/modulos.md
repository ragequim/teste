# Catálogo de módulos visuais (scenes.js)

Cada cena é `id: () => M.<modulo>({...params})`. Todo módulo define a **forma do fio** (thread) e o **desenho**.
O fio se transforma da forma da cena anterior para a da próxima (é isso que faz "cada cena nascer da anterior").
Elementos entram em tempos musicais (grade de 1/16) e recolhem ao fio nos últimos 0,42 s da cena.

Cores: `T` verde-azulado (principal), `R` coral (alerta/urgência), `A` âmbar (tempo/noite/destaque), `F` branco, `C.mut` cinza.
Área útil: y ≈ 120–900 (embaixo ficam as legendas). Centro vertical `CY = 470`.

## Genéricos (servem para qualquer tema)

| Módulo | Use para | Parâmetros |
|---|---|---|
| `title` | gancho, frases de efeito, títulos de capítulo, título final | `lines[]`, `colors[]`, `size` (150), `small` (linha de apoio), `head`, `instant` (já montado no quadro 0), `noExit` (não recolhe: título final), `dot` (fio vira um ponto), `moon` |
| `network` | "um centro ligado a vários itens" (hub, rede, encaminhamentos) | `center` (aceita `\n`), `sats[]` (até ~6), `satColor`, `rx`, `ry`, `head` |
| `timeline` | sequência no tempo, blocos de agenda, fases | `segs[{a,b,label,color,dash,h,size}]` (a,b de 0 a 1), `marks[{f,label,color,h}]`, `ticks[[f,'07h']]`, `head` |
| `people` | equipes, comparação de quantidades, papéis | `groups[{n,color,colors[],label,lcolor,tags[],ring}]`, `big` (texto grande acima), `scale` (1.6), `sp`, `card:{from,to}` (cartão viaja entre pessoas) |
| `grid` | leitos/itens em grade, categorias, rotas | `cols`,`rows`, `colors[]`+`cats[]`, `legend[[label,idxCor]]`, `split[]`+`splitLabels[[f,label]]`, `route[]` (índices visitados com ✓), `clock` |
| `card` | checklist, interface, "passos" | `title`, `titleColor`, `rows[[icone,texto]]` (ícone: `check`, `open`, `x`, `dot` ou cor), `w` |
| `bars` | comparar números/tempos | `max`, `rows[{label('\n'),b,a?,val,valSize,color}]` (com `a`: faixa de a até b), `ticks[]` |
| `clock` | horários, plantões, madrugada | `from:'HH:MM'`, `hours` (quanto o ponteiro anda), `sweep`, `sweepColor`, `sweepDur`, `big` ou `bigFn(m)`, `sub`, `sub2`, `sub2Color`, `moon` |
| `tree` | decisões, caminhos, "se X então Y" | `root`, `branches[{label,color,child}]` (1–3 ramos) |
| `ecg` | monitor: instabilidade, estabilizar, parada | `mode:'stabilize'|'arrest'|'normal'`, `labels[[t0,texto,cor]]` |
| `counter` | número grande contando + grade de pontos | `n`, `hi` (quantos destacar), `sub`, `big2` |
| `notif` | pilha de notificações/chamados | `items[[texto,cor?]]`, `head` |
| `flow` | A → B rápido (com rastro de movimento) | `a`, `b`, `bColor`, `label`, `labelColor` |
| `lanes` | trabalho em paralelo, escalas, revezamento | `lanes[{label,color,blocks[[a,b]],tag}]`, `scroll`, `speed` |

## Conteúdo técnico de cirurgia geral (modules_cg.js)

| Módulo | Use para | Parâmetros |
|---|---|---|
| `organ` | anatomia, local da doença | `organs: [[nome, cor, dx, dy, escala], ...]` ou `organ: 'nome'`; nomes: `vesicula`, `apendice`, `figado`, `estomago`, `colon`, `hernia`, `intestino`, `pancreas`, `rim`; `labels: [[texto, x, y, cor], ...]` (x,y relativos ao centro do órgão); `title`, `cx`, `scale` |
| `steps` | passo a passo de técnica, conduta, protocolo | `items[]` (até 7), `active` (destaca 1 passo), `title`, `titleColor` |
| `compare` | A × B (vídeo × aberta, indicação × contraindicação, pegadinha × resposta) | `left/right: {title, items[], color, icon}`, `title` |
| `define` | conceito-chave, definição, critério | `term`, `text` (quebra linha sozinho), `head`, `color`, `size` |
| `image` | figura de livro, foto, exame | `src` (declare também em `const IMAGES = [...]` no scenes.js), `caption`, `source` (fonte), `title`, `w`, `h` |

Para adicionar um órgão: crie `ORGANS.nome = (cor) => { ...desenho com ctx centrado em 0,0 ... }` em `modules_cg.js`.

## Específicos (criados para os vídeos de residência — reutilize ou adapte)

| Módulo | O que mostra |
|---|---|
| `dayArc` | arco manhã → tarde, mesma pessoa nas pontas |
| `split` | centro cirúrgico à esquerda + prescrição sendo digitada à direita |
| `orTop` | **2D → 3D**: sala vista de cima que inclina; equipe "levanta" do chão |
| `lapView` | visão circular de videolaparoscopia |
| `convert` | 3 portais viram incisão mediana (conversão) |
| `ct` | anel de tomografia + fatias que viram pilha 3D + barra de laudo |
| `calendar` | 7 dias com marcador (ex.: vaga zero) |
| `battery` | bateria descarregando (cansaço) |
| `base3d` | **momento mais forte**: blocos 3D empilhando (base sólida) |
| `comments` | balão de comentário (CTA final) |
| `org` | organograma fixo (sem preceptor → convivência direta) — muito específico |

## Criando um módulo novo (custom.js)
```js
M.meuModulo = cfg => ({
  dynamic: false,                       // true se a forma do fio muda com o tempo
  thread: (lt, D) => P.line(200, 600, 1720, 600),   // pontos do fio (P.line, P.circle, P.rect ou lista [[x,y],...])
  draw(lt, D) {
    const e = mkE(lt, D, 3);            // 3 elementos entrando em tempos musicais; e(i) = 0..1 (já inclui saída)
    ktext('TEXTO', 960, 300, 80, e(0));               // tipografia cinética
    pill('ETIQUETA', 960, 500, 28, e(1), { stroke: C.teal });
    icon('check', 960, 650, 30, e(2));
  }
});
```
Ajudantes: `ktext`, `text`, `pill`, `person`, `icon`, `polyline`, `partial`, `rr` (retângulo arredondado),
`proj(x,y,z,rx,ry)` + `poly` (3D simples), easings `eo/ei/eio/spr` (mola sem quique).
