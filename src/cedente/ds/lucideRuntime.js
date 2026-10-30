/**
 * Runtime de ícones para os componentes do Revvo Design System.
 *
 * Os componentes do DS renderizam `<i data-lucide="nome">` e chamam
 * `window.lucide.createIcons()`. O `createIcons` oficial *substitui* o `<i>` por
 * um `<svg>` — o que arranca do DOM um nó que o React considera seu e derruba a
 * página no próximo re-render. Este shim mantém o `<i>` no lugar e desenha o
 * SVG dentro dele, então o React segue dono do elemento e o DS funciona sem
 * alteração no código copiado.
 */

import { createElement } from 'lucide';
import { ICONES } from './lucideIcones';

const ATRIBUTO = 'data-lucide';
const MARCA = 'data-lucide-rendered';

const desenhar = (elemento) => {
  const nome = elemento.getAttribute(ATRIBUTO);
  if (!nome) return;
  if (elemento.getAttribute(MARCA) === nome) return;

  const definicao = ICONES[nome];
  if (!definicao) {
    if (import.meta.env?.DEV) console.warn(`[lucide] ícone não registrado em src/ds/lucideIcones.js: ${nome}`);
    return;
  }

  const svg = createElement(definicao);
  // O <i> já carrega tamanho e cor vindos do componente do DS.
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('stroke', 'currentColor');
  svg.style.display = 'block';

  elemento.replaceChildren(svg);
  elemento.setAttribute(MARCA, nome);
};

export const createIcons = () => {
  document.querySelectorAll(`i[${ATRIBUTO}]`).forEach(desenhar);
};

/**
 * Instala o shim e observa o DOM: componentes do DS que montam depois do
 * primeiro render (modais, linhas de tabela, passos) recebem seus ícones sem
 * precisar chamar createIcons manualmente.
 */
export const instalarLucide = () => {
  if (typeof window === 'undefined') return;

  window.lucide = { createIcons, icons: ICONES, createElement };
  createIcons();

  let agendado = false;
  const observador = new MutationObserver(() => {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(() => {
      agendado = false;
      createIcons();
    });
  });

  observador.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: [ATRIBUTO] });
};
