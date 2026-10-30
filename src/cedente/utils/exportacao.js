/**
 * Exportações geradas no navegador, sem backend: CSV para planilhas e um
 * documento HTML imprimível para comprovantes e termos.
 */

const BOM_UTF8 = String.fromCharCode(0xfeff);

const baixar = (conteudo, tipo, nomeArquivo) => {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  link.click();
  URL.revokeObjectURL(url);
};

const celulaCsv = (valor) => {
  if (valor === null || valor === undefined) return '';
  const texto = typeof valor === 'number' ? String(valor).replace('.', ',') : String(valor);
  return /[";\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
};

/**
 * Baixa um CSV separado por ponto e vírgula, que o Excel em português abre direto.
 * colunas = [{ rotulo, valor: (linha) => any }]
 */
export const baixarCsv = (nomeBase, colunas, linhas) => {
  const cabecalho = colunas.map((coluna) => celulaCsv(coluna.rotulo)).join(';');
  const corpo = linhas.map((linha) => colunas.map((coluna) => celulaCsv(coluna.valor(linha))).join(';'));
  // BOM na frente para o Excel abrir o CSV em UTF-8 sem quebrar os acentos.
  baixar(BOM_UTF8 + [cabecalho, ...corpo].join('\n'), 'text/csv;charset=utf-8;', `${nomeBase}-${new Date().toISOString().slice(0, 10)}.csv`);
};

const escapar = (texto) =>
  String(texto ?? '').replace(/[&<>"]/g, (caractere) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[caractere]);

/**
 * Abre um documento imprimível numa nova aba (o usuário salva em PDF pelo navegador).
 * campos = [[rotulo, valor]]; paragrafos = textos livres abaixo dos campos.
 */
export const abrirDocumento = ({ titulo, subtitulo, campos = [], paragrafos = [] }) => {
  const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>${escapar(titulo)}</title>
<style>
  body { font-family: 'Onest', system-ui, sans-serif; color: #131E2E; max-width: 720px; margin: 40px auto; padding: 0 24px; line-height: 1.5; }
  h1 { font-size: 22px; margin: 0 0 4px; } .sub { color: #5B6E82; margin: 0 0 24px; font-size: 14px; }
  dl { display: grid; grid-template-columns: 200px 1fr; gap: 8px 16px; padding: 16px; border: 1px solid #E2E8F2; border-radius: 8px; }
  dt { color: #5B6E82; font-size: 13px; } dd { margin: 0; font-weight: 600; font-size: 14px; }
  p { font-size: 13px; } footer { margin-top: 32px; font-size: 12px; color: #5B6E82; }
  @media print { button { display: none; } }
</style></head><body>
<h1>${escapar(titulo)}</h1>${subtitulo ? `<p class="sub">${escapar(subtitulo)}</p>` : ''}
<dl>${campos.map(([rotulo, valor]) => `<dt>${escapar(rotulo)}</dt><dd>${escapar(valor)}</dd>`).join('')}</dl>
${paragrafos.map((texto) => `<p>${escapar(texto)}</p>`).join('')}
<footer>Revvo - Portal do Cedente · documento gerado em ${new Date().toLocaleString('pt-BR')}</footer>
<button onclick="window.print()">Imprimir ou salvar em PDF</button>
</body></html>`;
  const janela = window.open(URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' })), '_blank');
  return Boolean(janela);
};
