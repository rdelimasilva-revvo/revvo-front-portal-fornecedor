/**
 * Recebíveis do cedente.
 *
 * Fonte de dados temporária em memória (src/mocks/cedenteData.js). O backend vai
 * substituir o corpo das funções; a assinatura é o contrato com as telas.
 */

import { OPERACOES, RECEBIVEIS, SACADOS } from '../mocks/cedenteData';
import { clone, request } from './mockApi';
import { lerArquivos } from './importacao';
import { avaliarJanela, duplicatasDasOperacoes, enriquecerComEscrituracao, evento } from './escrituracao';

let base = [...enriquecerComEscrituracao(clone(RECEBIVEIS)), ...duplicatasDasOperacoes(clone(OPERACOES))];

/** Mesma base para o duplicatasService: duplicata e recebível são o mesmo título. */
export const lerBase = () => base;
export const gravarBase = (nova) => {
  base = nova;
};

const aplicaFiltros = (itens, filtros = {}) => {
  const { sacadoId, vencimentoDe, vencimentoAte, valorMin, valorMax, statusRegistro, busca } = filtros;

  return itens.filter((item) => {
    if (sacadoId && item.sacado.id !== sacadoId) return false;
    if (statusRegistro && item.statusRegistro !== statusRegistro) return false;
    if (vencimentoDe && item.vencimento < vencimentoDe) return false;
    if (vencimentoAte && item.vencimento > vencimentoAte) return false;
    if (valorMin !== undefined && valorMin !== '' && item.valor < Number(valorMin)) return false;
    if (valorMax !== undefined && valorMax !== '' && item.valor > Number(valorMax)) return false;
    if (busca) {
      const termo = busca.toLowerCase();
      const alvo = `${item.sacado.nome} ${item.sacado.cnpj} ${item.numeroTitulo} ${item.numeroNF}`.toLowerCase();
      if (!alvo.includes(termo)) return false;
    }
    return true;
  });
};

/**
 * Devolve os recebíveis elegíveis já filtrados e, em separado, os inelegíveis
 * agrupados por motivo — é o que alimenta o contador "N títulos não exibidos".
 */
export const listarRecebiveis = (filtros = {}) =>
  request(() => {
    // Cedidas, liquidadas, baixadas e canceladas não são recebíveis a antecipar: ficam só na escrituração.
    const filtrados = aplicaFiltros(base.filter((item) => item.situacao === 'em_aberto'), filtros);
    const elegiveis = filtrados.filter((item) => item.elegivel);
    const inelegiveis = filtrados.filter((item) => !item.elegivel);

    const motivos = inelegiveis.reduce((acumulado, item) => {
      const motivo = item.motivoInelegibilidade || 'Motivo não informado';
      acumulado[motivo] = (acumulado[motivo] || 0) + 1;
      return acumulado;
    }, {});

    return {
      itens: clone(elegiveis),
      naoExibidos: {
        total: inelegiveis.length,
        motivos: Object.entries(motivos).map(([motivo, quantidade]) => ({ motivo, quantidade }))
      }
    };
  });

export const listarSacados = () => request(() => clone(SACADOS));

/** Lê e confere os arquivos escolhidos, sem gravar nada ainda. */
export const importarArquivos = (arquivos) => lerArquivos(arquivos, { recebiveisExistentes: base });

/**
 * Consulta à registradora (CERC): traz duplicatas escriturais do cedente por opt-in.
 * Simulada — depende de integração de backend com a registradora.
 */
export const consultarRegistradora = () =>
  request(
    () => {
      const novos = [
        {
          id: `cerc-${Date.now()}-1`,
          sacado: SACADOS[1],
          numeroTitulo: 'DUP-2299/01',
          numeroNF: '000012402',
          valor: 38400.0,
          vencimento: null,
          statusRegistro: 'registrada',
          origem: 'registradora',
          elegivel: true
        },
        {
          id: `cerc-${Date.now()}-2`,
          sacado: SACADOS[3],
          numeroTitulo: 'DUP-4460/01',
          numeroNF: '000012415',
          valor: 51250.0,
          vencimento: null,
          statusRegistro: 'registrada',
          origem: 'registradora',
          elegivel: true
        }
      ];

      // Vencimentos relativos a hoje para o retorno não envelhecer.
      const comVencimento = novos.map((item, indice) => {
        const data = new Date();
        data.setDate(data.getDate() + 30 + indice * 15);
        return { ...item, vencimento: data.toISOString().slice(0, 10) };
      });

      const existentes = new Set(base.map((item) => `${item.sacado.cnpj}|${item.numeroTitulo}`));
      const ineditos = comVencimento.filter((item) => !existentes.has(`${item.sacado.cnpj}|${item.numeroTitulo}`));

      return {
        lidos: comVencimento.length,
        novos: ineditos,
        duplicados: comVencimento
          .filter((item) => existentes.has(`${item.sacado.cnpj}|${item.numeroTitulo}`))
          .map((item) => ({ ...item, motivo: 'Título já importado anteriormente.' })),
        erros: [],
        pendentesRegistro: 0
      };
    },
    { delay: 900 }
  );

/** Confirma a importação: só aqui os títulos entram na base do cedente. */
export const confirmarImportacao = (titulos) =>
  request(() => {
    const preparados = titulos.map((titulo) =>
      enriquecerComEscrituracao([{ ...titulo, ...avaliarJanela(titulo) }])[0]
    );

    base = [...preparados, ...base];
    return { importados: preparados.length, elegiveis: preparados.filter((item) => item.elegivel).length };
  });

/** Marca como cedidos os títulos que entraram numa operação contratada. */
export const marcarComoCedidos = (ids, operacaoId) => {
  const alvo = new Set(ids);
  base = base.map((item) =>
    alvo.has(item.id)
      ? {
          ...item,
          elegivel: false,
          situacao: 'cedido',
          operacaoId,
          motivoInelegibilidade: operacaoId ? `Título cedido na operação ${operacaoId}` : 'Título já cedido',
          eventos: [...(item.eventos || []), evento('cessao', operacaoId ? `Cedida na operação ${operacaoId}` : 'Cedida')]
        }
      : item
  );
};

export const obterRecebiveis = (ids) => {
  const alvo = new Set(ids);
  return clone(base.filter((item) => alvo.has(item.id)));
};
