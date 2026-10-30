/**
 * Operações de antecipação do cedente.
 */

import { ETAPAS_OPERACAO } from '../types/entities';
import { LIMITE, OPERACOES } from '../mocks/cedenteData';
import { clone, request } from './mockApi';
import { marcarComoCedidos } from './recebiveisService';
import { obterUsuarioAtualSync, podeAssinar } from './cadastroService';
import { registrarTermo } from './termosService';

let base = clone(OPERACOES);
let sequencia = base.length;

const dentroDoPeriodo = (operacao, de, ate) => {
  const data = operacao.dataCriacao.slice(0, 10);
  if (de && data < de) return false;
  if (ate && data > ate) return false;
  return true;
};

export const listarOperacoes = (filtros = {}) =>
  request(() => {
    const { status, de, ate, busca } = filtros;

    const itens = base
      .filter((operacao) => (status ? operacao.status === status : true))
      .filter((operacao) => dentroDoPeriodo(operacao, de, ate))
      .filter((operacao) => {
        if (!busca) return true;
        const termo = busca.toLowerCase();
        const alvo = `${operacao.id} ${operacao.titulos.map((titulo) => titulo.sacado.nome).join(' ')}`.toLowerCase();
        return alvo.includes(termo);
      })
      .sort((a, b) => b.dataCriacao.localeCompare(a.dataCriacao));

    return clone(itens);
  });

export const obterOperacao = (id) =>
  request(() => {
    const operacao = base.find((item) => item.id === id);
    if (!operacao) throw new Error(`Operação ${id} não encontrada.`);
    return clone(operacao);
  });

/** Resumo consumido pela Home. */
export const obterResumo = () =>
  request(() => {
    // 'aguardando_assinatura' conta como em andamento: o limite já está
    // comprometido e a operação já existe. Fora desta lista ela desaparece do
    // card da Home sem erro nenhum.
    const emAndamento = base.filter((operacao) =>
      ['aguardando_assinatura', 'enviada', 'aceite_sacado', 'registro', 'credito'].includes(operacao.status)
    );
    const liquidadas = base.filter((operacao) => operacao.status === 'liquidada');

    const proximasLiquidacoes = base
      .filter((operacao) => operacao.status !== 'recusada')
      .flatMap((operacao) => operacao.titulos.map((titulo) => ({ ...titulo, operacaoId: operacao.id })))
      .filter((titulo) => {
        const dias = Math.round((new Date(`${titulo.vencimento}T12:00:00Z`) - new Date()) / 86400000);
        return dias >= 0 && dias <= 7;
      })
      .sort((a, b) => a.vencimento.localeCompare(b.vencimento));

    // O limite consumido é o que está em operação: assim o card da Home acompanha
    // cada contratação nova em vez de mostrar um número congelado.
    const utilizado = emAndamento.reduce((total, operacao) => total + operacao.valorBruto, 0);

    return {
      limite: {
        total: LIMITE.total,
        utilizado,
        disponivel: Math.max(LIMITE.total - utilizado, 0)
      },
      emAndamento: {
        quantidade: emAndamento.length,
        valor: emAndamento.reduce((total, operacao) => total + operacao.valorBruto, 0)
      },
      liquidadas: {
        quantidade: liquidadas.length,
        valor: liquidadas.reduce((total, operacao) => total + operacao.valorLiquido, 0)
      },
      proximasLiquidacoes: clone(proximasLiquidacoes),
      ultimasOperacoes: clone(
        [...base].sort((a, b) => b.dataCriacao.localeCompare(a.dataCriacao)).slice(0, 5)
      )
    };
  });

/**
 * Contrata a operação a partir de uma simulação aceita.
 * O segundo fator já foi validado na tela de contratação. Quem não tem alçada
 * contrata, mas o termo fica pendente em Contratos até um aprovador assinar.
 */
export const contratarOperacao = ({ simulacao }) =>
  request(
    () => {
      sequencia += 1;
      const numero = `OP-2026-${String(184 + sequencia).padStart(4, '0')}`;
      const agora = new Date().toISOString();
      const usuario = obterUsuarioAtualSync();
      const assinaAgora = podeAssinar(usuario);

      const operacao = {
        id: numero,
        dataCriacao: agora,
        valorBruto: simulacao.valorBruto,
        valorLiquido: simulacao.valorLiquido,
        taxaMensal: simulacao.taxaMensal,
        status: assinaAgora ? 'enviada' : 'aguardando_assinatura',
        titulos: simulacao.titulos.map((titulo) => ({
          recebivelId: titulo.recebivelId,
          numeroTitulo: titulo.numeroTitulo,
          sacado: titulo.sacado,
          valorBruto: titulo.valorBruto,
          valorLiquido: titulo.valorLiquido,
          vencimento: titulo.vencimento,
          status: 'Aguardando aceite'
        })),
        etapas: ETAPAS_OPERACAO.map((nome, indice) => {
          const ativa = assinaAgora ? 1 : 0;
          return {
            nome,
            situacao: indice < ativa ? 'concluida' : indice === ativa ? 'em_andamento' : 'pendente',
            ...(indice === 0 && assinaAgora ? { dataHora: agora, evidenciaUrl: '#', evidenciaLabel: 'Termo assinado' } : {})
          };
        })
      };

      base = [operacao, ...base];
      marcarComoCedidos(simulacao.titulos.map((titulo) => titulo.recebivelId), numero);
      registrarTermo({ operacao, criadoPor: usuario, assinarAgora: assinaAgora });

      return clone(operacao);
    },
    { delay: 1200 }
  );

/** Chamada pelo termosService quando os termos das operações são assinados em Contratos. */
export const concluirAssinatura = (operacaoIds) => {
  const alvo = new Set(operacaoIds);
  const agora = new Date().toISOString();
  base = base.map((operacao) => {
    if (!alvo.has(operacao.id) || operacao.status !== 'aguardando_assinatura') return operacao;
    return {
      ...operacao,
      status: 'enviada',
      etapas: operacao.etapas.map((etapa, indice) =>
        indice === 0
          ? { ...etapa, situacao: 'concluida', dataHora: agora, evidenciaUrl: '#', evidenciaLabel: 'Termo assinado' }
          : indice === 1
            ? { ...etapa, situacao: 'em_andamento' }
            : etapa
      )
    };
  });
};

export const TRATATIVAS_VENCIDO = {
  recompra: 'Recompra pelo cedente',
  prorrogacao: 'Prorrogação do vencimento',
  cobranca: 'Cobrança do sacado'
};

// Tarifa simulada de prorrogação, cobrada no extrato.
export const TARIFA_PRORROGACAO = 35;

/**
 * Tratativa de um título cedido que venceu sem pagamento. Na recompra o
 * cedente devolve o valor de face ao financiador, e a operação liquida se
 * não restar título em aberto.
 */
export const tratarTituloVencido = ({ operacaoId, numeroTitulo, acao, novoVencimento }) =>
  request(() => {
    const operacao = base.find((item) => item.id === operacaoId);
    if (!operacao) throw new Error(`Operação ${operacaoId} não encontrada.`);
    const titulo = operacao.titulos.find((item) => item.numeroTitulo === numeroTitulo);
    if (!titulo) throw new Error(`Título ${numeroTitulo} não encontrado na operação.`);
    if (titulo.tratativa?.acao === 'recompra') throw new Error('Este título já foi recomprado.');
    if (acao === 'prorrogacao' && !(novoVencimento > new Date().toISOString().slice(0, 10))) {
      throw new Error('Escolha um novo vencimento depois de hoje.');
    }

    const agora = new Date().toISOString();
    const tratativa = {
      acao,
      dataHora: agora,
      ...(acao === 'prorrogacao' ? { vencimentoAnterior: titulo.vencimento, tarifa: TARIFA_PRORROGACAO } : {}),
      ...(acao === 'recompra' ? { valor: titulo.valorBruto } : {})
    };

    const titulos = operacao.titulos.map((item) =>
      item.numeroTitulo !== numeroTitulo
        ? item
        : {
            ...item,
            tratativa,
            ...(acao === 'prorrogacao' ? { vencimento: novoVencimento, status: 'Prorrogado' } : {}),
            ...(acao === 'recompra' ? { status: 'Recomprado' } : {}),
            ...(acao === 'cobranca' ? { status: 'Em cobrança' } : {})
          }
    );
    const encerrada = titulos.every((item) => item.status === 'Recomprado' || item.status === 'Liquidado');
    const atualizada = {
      ...operacao,
      titulos,
      ...(encerrada
        ? {
            status: 'liquidada',
            etapas: operacao.etapas.map((etapa) =>
              etapa.nome === 'Liquidada' ? { ...etapa, situacao: 'concluida', dataHora: agora } : etapa
            )
          }
        : {})
    };

    base = base.map((item) => (item.id === operacaoId ? atualizada : item));
    return clone(atualizada);
  });

/**
 * Extrato da conta de antecipação, derivado das operações: o crédito de cada
 * antecipação, as recompras e as tarifas de prorrogação.
 *
 * @typedef {Object} Lancamento
 * @property {string} id
 * @property {string} dataHora
 * @property {'credito'|'debito'} natureza
 * @property {'antecipacao'|'recompra'|'tarifa'} tipo
 * @property {string} descricao
 * @property {number} valor              sempre positivo; a natureza dá o sinal
 * @property {string} operacaoId
 */
export const listarLancamentos = () =>
  request(() => {
    const lancamentos = base.flatMap((operacao) => {
      const credito = operacao.etapas.find((etapa) => etapa.nome === 'Crédito em conta');
      const itens = [];
      if (credito?.situacao === 'concluida' && credito.dataHora) {
        itens.push({
          id: `${operacao.id}-credito`,
          dataHora: credito.dataHora,
          natureza: 'credito',
          tipo: 'antecipacao',
          descricao: `Crédito da antecipação ${operacao.id} (${operacao.titulos.length} ${operacao.titulos.length === 1 ? 'título' : 'títulos'})`,
          valor: operacao.valorLiquido,
          operacaoId: operacao.id
        });
      }
      operacao.titulos.forEach((titulo) => {
        if (titulo.tratativa?.acao === 'recompra') {
          itens.push({
            id: `${operacao.id}-${titulo.numeroTitulo}-recompra`,
            dataHora: titulo.tratativa.dataHora,
            natureza: 'debito',
            tipo: 'recompra',
            descricao: `Recompra da ${titulo.numeroTitulo} (${titulo.sacado.nome})`,
            valor: titulo.tratativa.valor,
            operacaoId: operacao.id
          });
        }
        if (titulo.tratativa?.acao === 'prorrogacao') {
          itens.push({
            id: `${operacao.id}-${titulo.numeroTitulo}-tarifa`,
            dataHora: titulo.tratativa.dataHora,
            natureza: 'debito',
            tipo: 'tarifa',
            descricao: `Tarifa de prorrogação da ${titulo.numeroTitulo}`,
            valor: titulo.tratativa.tarifa,
            operacaoId: operacao.id
          });
        }
      });
      return itens;
    });

    return clone(lancamentos.sort((a, b) => b.dataHora.localeCompare(a.dataHora)));
  });

/** Exportação da lista em CSV — o navegador monta o arquivo, sem backend. */
export const montarCsvOperacoes = (operacoes) => {
  const cabecalho = ['Operacao', 'Data', 'Titulos', 'Valor bruto', 'Valor liquido', 'Status'];
  const linhas = operacoes.map((operacao) => [
    operacao.id,
    operacao.dataCriacao.slice(0, 10).split('-').reverse().join('/'),
    operacao.titulos.length,
    operacao.valorBruto.toFixed(2).replace('.', ','),
    operacao.valorLiquido.toFixed(2).replace('.', ','),
    operacao.status
  ]);

  return [cabecalho, ...linhas].map((linha) => linha.join(';')).join('\n');
};
