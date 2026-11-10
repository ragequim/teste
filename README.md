# teste

Configuração do Claude Code para construir sites com design de verdade: **3 skills + 2 MCPs**.
Basta abrir este repositório no Claude Code (CLI, desktop ou claude.ai/code) que tudo é carregado.

## Skills (`.claude/skills/`)

| Skill | Para que serve | Origem |
|---|---|---|
| `emil-design-eng` | Filosofia de design engineering do Emil Kowalski: acabamento de UI, componentes, decisões de animação e detalhes invisíveis. | [emilkowalski/skills](https://github.com/emilkowalski/skills) (MIT) |
| `impeccable` | Desenhar, redesenhar, criticar, auditar e polir front-ends: layout, tipografia, espaçamento, cor, hierarquia. Comandos: `/impeccable init`, `/impeccable critique`, `/impeccable polish`… | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (Apache 2.0) |
| `design-taste-frontend` (Taste Skill) | "Anti-slop": sites com cara de empresa real, fotos e UI reais em vez de template de IA, com verificação no navegador antes de entregar. | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) (MIT) |

Os subagentes do Impeccable estão em `.claude/agents/`. As skills grill-me e grilling continuam aqui também.

## MCPs (`.mcp.json`)

| MCP | Para que serve | Primeiro uso |
|---|---|---|
| `figma` | Ler e montar designs no Figma (design → código). | Rode `/mcp`, escolha **figma** e faça login com sua conta Figma. |
| `playwright` | Abrir o site num navegador de verdade e testar antes de entregar. | Precisa de Node 18+; o pacote baixa sozinho na primeira vez. |

Na primeira vez que abrir o projeto, o Claude Code pergunta se pode usar os MCPs do `.mcp.json`: aprove os dois.

## Como pedir um site

> Use a Taste Skill e o Impeccable para criar uma landing page para [negócio]. Teste com o Playwright em 1440px e 390px antes de me entregar.

## Opcional: hook automático do Impeccable

O instalador oficial (`npx impeccable install`) também adiciona um hook que verifica o design a cada edição de arquivo.
Ele não foi ativado aqui porque baixa e roda um binário a cada edição. Para ativar, rode o instalador ou copie o bloco
`hooks` de [`.claude/settings.json` do Impeccable](https://github.com/pbakaus/impeccable/blob/main/.claude/settings.json).

## Atualizar

Versões copiadas: emilkowalski/skills `715c180`, pbakaus/impeccable `ec229b4` (v4.8.2), Leonxlnx/taste-skill `f6b7657` (2.5.1).
Para atualizar, copie de novo a pasta da skill do repositório de origem.
