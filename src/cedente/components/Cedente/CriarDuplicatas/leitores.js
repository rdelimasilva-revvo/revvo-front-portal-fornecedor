/**
 * Leitura de arquivos no navegador: XML de NF-e e planilha CSV.
 * Devolvem os dados no formato de criarDuplicata, sem a origem.
 */

export const COLUNAS_PLANILHA = ['cnpj_sacado', 'nome_sacado', 'numero_nf', 'valor', 'vencimento'];

export const somarDias = (iso, dias) => {
  const data = new Date(`${iso}T12:00:00Z`);
  data.setUTCDate(data.getUTCDate() + dias);
  return data.toISOString().slice(0, 10);
};

// Busca pelo nome local: o XML da NF-e usa namespace padrão e às vezes prefixo.
const nos = (raiz, nome) => (raiz ? [...raiz.getElementsByTagNameNS('*', nome)] : []);
const texto = (raiz, nome) => nos(raiz, nome)[0]?.textContent.trim() || '';

export const lerNfe = (conteudo) => {
  const documento = new DOMParser().parseFromString(conteudo, 'application/xml');
  if (documento.getElementsByTagName('parsererror').length) throw new Error('XML inválido.');

  const ide = nos(documento, 'ide')[0];
  const dest = nos(documento, 'dest')[0];
  if (!ide || !dest) throw new Error('O arquivo não parece ser uma NF-e.');

  const sacadoCnpj = texto(dest, 'CNPJ');
  if (!sacadoCnpj) throw new Error('Destinatário sem CNPJ.');
  const base = {
    sacadoNome: texto(dest, 'xNome'),
    sacadoCnpj,
    numeroNF: texto(ide, 'nNF'),
    dataEmissao: (texto(ide, 'dhEmi') || texto(ide, 'dEmi')).slice(0, 10) || undefined
  };

  const parcelas = nos(nos(documento, 'cobr')[0], 'dup');
  if (parcelas.length) {
    return parcelas.map((dup) => ({
      ...base,
      valor: Number(texto(dup, 'vDup')),
      vencimento: texto(dup, 'dVenc')
    }));
  }

  const total = Number(texto(nos(documento, 'ICMSTot')[0], 'vNF'));
  if (!total) throw new Error('NF-e sem duplicatas e sem valor total.');
  const emissao = base.dataEmissao || new Date().toISOString().slice(0, 10);
  return [{ ...base, valor: total, vencimento: somarDias(emissao, 30) }];
};

const lerValor = (bruto) => {
  const limpo = bruto.replace(/[R$\s]/g, '');
  // Com vírgula, é formato brasileiro: ponto separa milhar.
  return Number(limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo);
};

const lerData = (bruto) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(bruto)) return bruto;
  const partes = bruto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return partes ? `${partes[3]}-${partes[2]}-${partes[1]}` : null;
};

/**
 * shortcut: não trata campos entre aspas com separador dentro; usar um parser
 * de CSV de verdade se os arquivos dos clientes vierem assim.
 */
export const lerPlanilha = (conteudo) => {
  const linhas = conteudo.replace(/^﻿/, '').split(/\r?\n/).filter((linha) => linha.trim());
  if (linhas.length < 2) throw new Error('A planilha não tem linhas de dados.');

  const separador = linhas[0].includes(';') ? ';' : ',';
  const cabecalho = linhas[0].split(separador).map((coluna) => coluna.trim().toLowerCase());
  const faltando = COLUNAS_PLANILHA.filter((coluna) => !cabecalho.includes(coluna));
  if (faltando.length) throw new Error(`Colunas ausentes: ${faltando.join(', ')}.`);

  const validas = [];
  const erros = [];
  linhas.slice(1).forEach((linha, indice) => {
    const celulas = linha.split(separador).map((celula) => celula.trim().replace(/^"|"$/g, ''));
    const campo = (nome) => celulas[cabecalho.indexOf(nome)] || '';
    const vencimento = lerData(campo('vencimento'));
    const valor = lerValor(campo('valor'));
    const numero = indice + 2;
    if (!vencimento) erros.push(`Linha ${numero}: vencimento inválido.`);
    else if (!(valor > 0)) erros.push(`Linha ${numero}: valor inválido.`);
    else {
      validas.push({
        sacadoCnpj: campo('cnpj_sacado'),
        sacadoNome: campo('nome_sacado'),
        numeroNF: campo('numero_nf'),
        valor,
        vencimento
      });
    }
  });
  return { validas, erros };
};
