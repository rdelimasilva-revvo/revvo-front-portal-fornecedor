/**
 * Leitura dos arquivos de entrada de recebíveis: XML de NF-e, CSV e CNAB 400.
 *
 * O parse acontece no navegador — não depende de backend. O que ainda não é real
 * é a checagem de elegibilidade (limite do sacado, ônus, título já cedido), que
 * o backend precisa devolver; aqui ela é inferida de forma otimista.
 */

import { toISODate } from '../utils/format';

const NFE_NAMESPACE_HINT = 'portalfiscal.inf.br/nfe';

/** Busca por nome local, ignorando namespace — NF-e vem com prefixos variados. */
const findAll = (root, localName) => {
  const result = [];
  const walk = (node) => {
    for (const child of node.children || []) {
      if (child.localName === localName) result.push(child);
      walk(child);
    }
  };
  walk(root);
  return result;
};

const findOne = (root, localName) => findAll(root, localName)[0] || null;
const textOf = (root, localName) => {
  const node = findOne(root, localName);
  return node ? node.textContent.trim() : '';
};

const onlyDigits = (value) => String(value || '').replace(/\D/g, '');

const parseValor = (value) => {
  if (value === null || value === undefined || value === '') return NaN;
  // Aceita "1234.56" (padrão NF-e) e "1.234,56" (padrão pt-BR de planilha).
  const normalized = String(value).trim().includes(',')
    ? String(value).trim().replace(/\./g, '').replace(',', '.')
    : String(value).trim();
  return Number(normalized);
};

const parseData = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const br = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  const cnab = raw.match(/^(\d{2})(\d{2})(\d{4})$/); // ddmmaaaa
  if (cnab) return `${cnab[3]}-${cnab[2]}-${cnab[1]}`;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : toISODate(parsed);
};

let sequencia = 0;
const novoId = () => {
  sequencia += 1;
  return `imp-${Date.now().toString(36)}-${sequencia}`;
};

const erro = (arquivo, referencia, motivo) => ({ arquivo, referencia, motivo });

/**
 * Lê um XML de NF-e e devolve um título por duplicata declarada em <cobr>.
 * NF-e sem bloco de cobrança não gera recebível — é erro de conferência, não silêncio.
 */
export const parseNFeXml = (texto, arquivo) => {
  const titulos = [];
  const erros = [];

  let doc;
  try {
    doc = new DOMParser().parseFromString(texto, 'application/xml');
  } catch {
    return { titulos, erros: [erro(arquivo, arquivo, 'Arquivo não pôde ser lido como XML.')] };
  }

  if (doc.querySelector('parsererror')) {
    return { titulos, erros: [erro(arquivo, arquivo, 'XML inválido ou corrompido.')] };
  }

  const infNFeList = findAll(doc.documentElement, 'infNFe');
  const raizEhInfNFe = doc.documentElement.localName === 'infNFe';
  const notas = raizEhInfNFe ? [doc.documentElement] : infNFeList;

  if (notas.length === 0) {
    const pista = texto.includes(NFE_NAMESPACE_HINT)
      ? 'O arquivo é uma NF-e, mas não foi possível localizar o bloco infNFe.'
      : 'O arquivo não é um XML de NF-e (bloco infNFe não encontrado).';
    return { titulos, erros: [erro(arquivo, arquivo, pista)] };
  }

  notas.forEach((infNFe) => {
    const ide = findOne(infNFe, 'ide');
    const dest = findOne(infNFe, 'dest');
    const numeroNF = ide ? textOf(ide, 'nNF') : '';
    const sacadoNome = dest ? textOf(dest, 'xNome') : '';
    const sacadoCNPJ = dest ? onlyDigits(textOf(dest, 'CNPJ') || textOf(dest, 'CPF')) : '';
    const referencia = numeroNF ? `NF ${numeroNF}` : arquivo;

    if (!sacadoCNPJ) {
      erros.push(erro(arquivo, referencia, 'Destinatário (sacado) sem CNPJ/CPF no XML.'));
      return;
    }

    const duplicatas = findAll(infNFe, 'dup');

    if (duplicatas.length === 0) {
      erros.push(erro(arquivo, referencia, 'NF-e sem bloco de cobrança (<dup>): não há duplicata a antecipar.'));
      return;
    }

    duplicatas.forEach((dup, index) => {
      const nDup = textOf(dup, 'nDup') || String(index + 1).padStart(3, '0');
      const vencimento = parseData(textOf(dup, 'dVenc'));
      const valor = parseValor(textOf(dup, 'vDup'));

      if (!vencimento) {
        erros.push(erro(arquivo, `${referencia} · parcela ${nDup}`, 'Data de vencimento ausente ou inválida.'));
        return;
      }
      if (!Number.isFinite(valor) || valor <= 0) {
        erros.push(erro(arquivo, `${referencia} · parcela ${nDup}`, 'Valor da duplicata ausente ou inválido.'));
        return;
      }

      titulos.push({
        id: novoId(),
        sacado: { id: `sac-${sacadoCNPJ}`, nome: sacadoNome || 'Sacado não identificado', cnpj: sacadoCNPJ },
        numeroTitulo: `${numeroNF || 'NF'}/${nDup}`,
        numeroNF: numeroNF || '—',
        valor,
        vencimento,
        statusRegistro: 'nao_registrada',
        origem: 'xml',
        elegivel: true,
        arquivo
      });
    });
  });

  return { titulos, erros };
};

const CSV_COLUNAS = ['sacado', 'cnpj', 'titulo', 'nf', 'valor', 'vencimento'];

/** CSV com cabeçalho: sacado;cnpj;titulo;nf;valor;vencimento (aceita , ou ; como separador). */
export const parseCsv = (texto, arquivo) => {
  const titulos = [];
  const erros = [];
  const linhas = texto.split(/\r?\n/).filter((linha) => linha.trim() !== '');

  if (linhas.length < 2) {
    return { titulos, erros: [erro(arquivo, arquivo, 'Arquivo vazio ou sem linhas de dados.')] };
  }

  const separador = (linhas[0].match(/;/g) || []).length >= (linhas[0].match(/,/g) || []).length ? ';' : ',';
  const cabecalho = linhas[0].split(separador).map((coluna) => coluna.trim().toLowerCase());
  const faltantes = CSV_COLUNAS.filter((coluna) => !cabecalho.includes(coluna));

  if (faltantes.length > 0) {
    return {
      titulos,
      erros: [erro(arquivo, arquivo, `Cabeçalho inválido. Colunas ausentes: ${faltantes.join(', ')}.`)]
    };
  }

  const indice = Object.fromEntries(CSV_COLUNAS.map((coluna) => [coluna, cabecalho.indexOf(coluna)]));

  linhas.slice(1).forEach((linha, posicao) => {
    const celulas = linha.split(separador).map((celula) => celula.trim());
    const referencia = `Linha ${posicao + 2}`;
    const cnpj = onlyDigits(celulas[indice.cnpj]);
    const valor = parseValor(celulas[indice.valor]);
    const vencimento = parseData(celulas[indice.vencimento]);
    const numeroTitulo = celulas[indice.titulo];

    if (!numeroTitulo) {
      erros.push(erro(arquivo, referencia, 'Número do título em branco.'));
      return;
    }
    if (cnpj.length !== 14) {
      erros.push(erro(arquivo, referencia, `CNPJ do sacado inválido: "${celulas[indice.cnpj] || ''}".`));
      return;
    }
    if (!Number.isFinite(valor) || valor <= 0) {
      erros.push(erro(arquivo, referencia, `Valor inválido: "${celulas[indice.valor] || ''}".`));
      return;
    }
    if (!vencimento) {
      erros.push(erro(arquivo, referencia, `Vencimento inválido: "${celulas[indice.vencimento] || ''}".`));
      return;
    }

    titulos.push({
      id: novoId(),
      sacado: { id: `sac-${cnpj}`, nome: celulas[indice.sacado] || 'Sacado não identificado', cnpj },
      numeroTitulo,
      numeroNF: celulas[indice.nf] || '—',
      valor,
      vencimento,
      statusRegistro: 'nao_registrada',
      origem: 'arquivo',
      elegivel: true,
      arquivo
    });
  });

  return { titulos, erros };
};

/**
 * CNAB 400 — layout configurado em Cadastro > Integração.
 * Registros de detalhe (posição 1 = '1'), com os campos nas posições do layout padrão.
 */
export const parseCnab = (texto, arquivo) => {
  const titulos = [];
  const erros = [];
  const linhas = texto.split(/\r?\n/).filter((linha) => linha.trim() !== '');
  const detalhes = linhas.filter((linha) => linha[0] === '1');

  if (detalhes.length === 0) {
    return {
      titulos,
      erros: [erro(arquivo, arquivo, 'Nenhum registro de detalhe (tipo 1) encontrado no arquivo CNAB.')]
    };
  }

  detalhes.forEach((linha, posicao) => {
    const referencia = `Registro ${posicao + 1}`;

    if (linha.length < 220) {
      erros.push(erro(arquivo, referencia, `Registro com ${linha.length} posições — o layout CNAB 400 exige 400.`));
      return;
    }

    const cnpj = onlyDigits(linha.slice(3, 17));
    const numeroTitulo = linha.slice(110, 120).trim();
    // Posições 121-126 trazem ddmmaa; o século vem do intervalo suportado pelo layout.
    const vencimentoCnab = linha.slice(120, 126);
    const vencimento = /^\d{6}$/.test(vencimentoCnab)
      ? parseData(`${vencimentoCnab.slice(0, 4)}20${vencimentoCnab.slice(4, 6)}`)
      : null;
    const valor = parseValor(linha.slice(126, 139)) / 100;
    const sacado = linha.slice(234, 264).trim();

    if (cnpj.length !== 14) {
      erros.push(erro(arquivo, referencia, 'CNPJ do sacado inválido nas posições 4 a 17.'));
      return;
    }
    if (!numeroTitulo) {
      erros.push(erro(arquivo, referencia, 'Número do título em branco nas posições 111 a 120.'));
      return;
    }
    if (!vencimento) {
      erros.push(erro(arquivo, referencia, 'Vencimento inválido nas posições 121 a 126.'));
      return;
    }
    if (!Number.isFinite(valor) || valor <= 0) {
      erros.push(erro(arquivo, referencia, 'Valor inválido nas posições 127 a 139.'));
      return;
    }

    titulos.push({
      id: novoId(),
      sacado: { id: `sac-${cnpj}`, nome: sacado || 'Sacado não identificado', cnpj },
      numeroTitulo,
      numeroNF: '—',
      valor,
      vencimento,
      statusRegistro: 'nao_registrada',
      origem: 'arquivo',
      elegivel: true,
      arquivo
    });
  });

  return { titulos, erros };
};

const lerArquivo = (arquivo) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error(`Não foi possível ler o arquivo ${arquivo.name}.`));
    reader.readAsText(arquivo, 'utf-8');
  });

const parserPara = (nome) => {
  const extensao = nome.toLowerCase().split('.').pop();
  if (extensao === 'xml') return parseNFeXml;
  if (extensao === 'csv' || extensao === 'txt') return parseCsv;
  if (extensao === 'rem' || extensao === 'ret' || extensao === 'cnab') return parseCnab;
  return null;
};

/**
 * Lê os arquivos escolhidos e devolve o material da etapa de conferência.
 * Não persiste nada: quem confirma é o serviço de recebíveis.
 */
export const lerArquivos = async (arquivos, { recebiveisExistentes = [] } = {}) => {
  const titulos = [];
  const erros = [];

  for (const arquivo of arquivos) {
    const parser = parserPara(arquivo.name);

    if (!parser) {
      erros.push(erro(arquivo.name, arquivo.name, 'Extensão não suportada. Use .xml (NF-e), .csv ou .rem/.ret (CNAB).'));
      continue;
    }

    try {
      const conteudo = await lerArquivo(arquivo);
      const resultado = parser(conteudo, arquivo.name);
      titulos.push(...resultado.titulos);
      erros.push(...resultado.erros);
    } catch (falha) {
      erros.push(erro(arquivo.name, arquivo.name, falha.message));
    }
  }

  return conferir(titulos, erros, recebiveisExistentes);
};

const chaveTitulo = (titulo) => `${titulo.sacado.cnpj}|${titulo.numeroTitulo}`;

/** Separa o lote lido em: importáveis, duplicados e pendentes de registro. */
export const conferir = (titulos, erros, recebiveisExistentes = []) => {
  const jaExistentes = new Set(recebiveisExistentes.map(chaveTitulo));
  const vistosNoLote = new Set();
  const novos = [];
  const duplicados = [];

  titulos.forEach((titulo) => {
    const chave = chaveTitulo(titulo);

    if (jaExistentes.has(chave)) {
      duplicados.push({ ...titulo, motivo: 'Título já importado anteriormente.' });
      return;
    }
    if (vistosNoLote.has(chave)) {
      duplicados.push({ ...titulo, motivo: 'Título repetido dentro do mesmo lote.' });
      return;
    }

    vistosNoLote.add(chave);
    novos.push(titulo);
  });

  return {
    lidos: titulos.length,
    novos,
    duplicados,
    erros,
    pendentesRegistro: novos.filter((titulo) => titulo.statusRegistro !== 'registrada').length
  };
};
