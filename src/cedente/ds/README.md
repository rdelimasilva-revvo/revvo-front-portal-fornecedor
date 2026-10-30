# Revvo Design System no portal do cedente

Cópia do DS oficial (`NEW Design Team - Revvo Design System`), reduzida ao que o
portal usa.

- `tokens/` + `styles.css` — cores, tipografia, espaçamento e efeitos. Carregado
  uma única vez em `src/main.jsx`. As variáveis herdadas do app
  (`--primary-blue`, `--background`, …) apontam para estes tokens em
  `src/index.css`, então as telas legadas seguem a marca sem reescrita.
- `components/` — componentes do DS, **cópia literal**. Não edite aqui: a
  mudança tem que voltar para o DS oficial e ser recopiada, senão o próximo
  `cp` desfaz o ajuste.
- `index.js` — o que o portal importa (`import { Button, Table } from '../../ds'`).
- `assets/` — fonte Onest (self-hosted, sem CDN) e os logos SVG oficiais.
- `lucideRuntime.js` + `lucideIcones.js` — os componentes do DS renderizam
  `<i data-lucide="nome">` e esperam `window.lucide`. O `createIcons` oficial
  troca o `<i>` por um `<svg>`, arrancando do DOM um nó que o React considera
  seu; o shim daqui desenha o SVG **dentro** do `<i>` e observa o DOM para
  cobrir o que monta depois. Ícone novo precisa ser registrado em
  `lucideIcones.js` — importar o pacote inteiro custa ~700 kB no bundle.

## Pendente

O `SKILL.md` do DS define que sistemas Revvo de produção usam **SAP Fiori**
(`@ui5/webcomponents-react`, base `sap_horizon`) com os tokens Revvo mapeados
para `--sap*`. Este portal usa React + styled-components com os componentes do
DS; migrar para Fiori é uma decisão em aberto.
