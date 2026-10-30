/**
 * Regras da duplicata escritural compartilhadas entre recebíveis e escrituração.
 *
 * Um título só existe uma vez na base: a escrituração cuida do ciclo de vida
 * (emissão, registro, aceite, baixa) e os recebíveis mostram os que podem ser
 * antecipados. Os campos abaixo complementam o shape de Recebivel.
 *
 * @typedef {'em_aberto'|'cedido'|'liquidado'|'baixado'|'cancelado'} SituacaoDuplicata
 * @typedef {'pendente'|'aceito'|'recusado'} AceiteSacado
 *
 * @typedef {Object} EventoDuplicata
 * @property {string} tipo        emissao | envio | registro | aceite | cessao | abatimento | pagamento_parcial | baixa | cancelamento | liquidacao | domicilio
 * @property {string} descricao
 * @property {string} dataHora    ISO completo
 */

import { PARAMETROS_OPERACAO } from '../mocks/cedenteData';
import { daysUntil } from '../utils/format';

export const SITUACAO_DUPLICATA_LABEL = {
  em_aberto: 'Em aberto',
  cedido: 'Cedida',
  liquidado: 'Liquidada',
  baixado: 'Baixada',
  cancelado: 'Cancelada'
};

export const ACEITE_LABEL = {
  pendente: 'Aceite pendente',
  aceito: 'Aceita pelo sacado',
  recusado: 'Recusada pelo sacado'
};

const STATUS_COM_ACEITE = ['aceite_sacado', 'registro', 'credito', 'liquidada'];

export const evento = (tipo, descricao, dataHora = new Date().toISOString()) => ({ tipo, descricao, dataHora });

const somarDias = (iso, dias) => {
  const data = new Date(`${iso}T12:00:00Z`);
  data.setUTCDate(data.getUTCDate() + dias);
  return data.toISOString();
};

/** Elegibilidade pela janela de prazo contratada com o financiador. */
export const avaliarJanela = (titulo) => {
  const prazo = daysUntil(titulo.vencimento);
  const { prazoMinimoDias, prazoMaximoDias } = PARAMETROS_OPERACAO;
  if (prazo >= prazoMinimoDias && prazo <= prazoMaximoDias) return { elegivel: true, motivoInelegibilidade: undefined };
  return {
    elegivel: false,
    motivoInelegibilidade: `Vencimento fora da janela contratada (${prazoMinimoDias} a ${prazoMaximoDias} dias)`
  };
};

const montarEventos = (titulo, dataEmissao, aceite, operacao, situacao) => {
  const eventos = [evento('emissao', `Duplicata emitida a partir da NF ${titulo.numeroNF}`, somarDias(dataEmissao, 0))];
  if (titulo.statusRegistro === 'registrada' || titulo.statusRegistro === 'pendente') {
    eventos.push(evento('envio', 'Enviada à registradora', somarDias(dataEmissao, 1)));
  }
  if (titulo.statusRegistro === 'registrada') {
    eventos.push(evento('registro', 'Registrada na CERC', somarDias(dataEmissao, 1)));
  }
  if (aceite === 'aceito') eventos.push(evento('aceite', 'Aceite eletrônico do sacado', somarDias(dataEmissao, 3)));
  if (operacao) eventos.push(evento('cessao', `Cedida na operação ${operacao.id}`, operacao.dataCriacao));
  if (situacao === 'liquidado') eventos.push(evento('liquidacao', 'Paga pelo sacado no vencimento', somarDias(titulo.vencimento, 0)));
  return eventos.sort((a, b) => a.dataHora.localeCompare(b.dataHora));
};

/** Completa títulos ainda livres com o que a escrituração precisa: emissão, valor original, aceite e eventos. */
export const enriquecerComEscrituracao = (titulos) =>
  titulos.map((titulo) => {
    if (titulo.eventos) return titulo;
    const dataEmissao = (titulo.dataEmissao || somarDias(titulo.vencimento, -60)).slice(0, 10);
    const aceite = titulo.aceite || 'pendente';
    return {
      ...titulo,
      dataEmissao,
      valorOriginal: titulo.valorOriginal ?? titulo.valor,
      situacao: titulo.situacao || 'em_aberto',
      aceite,
      eventos: montarEventos(titulo, dataEmissao, aceite, null, 'em_aberto')
    };
  });

/**
 * Duplicatas que já foram cedidas: uma por título das operações não recusadas.
 * Quando o mesmo número aparece em mais de uma operação (aditivo), vale a mais recente.
 */
export const duplicatasDasOperacoes = (operacoes) => {
  const porNumero = new Map();
  [...operacoes]
    .filter((operacao) => operacao.status !== 'recusada')
    .sort((a, b) => a.dataCriacao.localeCompare(b.dataCriacao))
    .forEach((operacao) => operacao.titulos.forEach((titulo) => porNumero.set(titulo.numeroTitulo, { operacao, titulo })));

  return [...porNumero.values()].map(({ operacao, titulo }) => {
    const situacao = operacao.status === 'liquidada' ? 'liquidado' : 'cedido';
    const aceite = STATUS_COM_ACEITE.includes(operacao.status) ? 'aceito' : 'pendente';
    const base = {
      id: `${operacao.id}:${titulo.numeroTitulo}`,
      sacado: titulo.sacado,
      numeroTitulo: titulo.numeroTitulo,
      numeroNF: `0000${titulo.numeroTitulo.replace(/\D/g, '').slice(0, 5)}`,
      valor: titulo.valorBruto,
      vencimento: titulo.vencimento,
      statusRegistro: 'registrada',
      origem: 'xml',
      elegivel: false,
      motivoInelegibilidade: `Título cedido na operação ${operacao.id}`
    };
    const dataEmissao = somarDias(titulo.vencimento, -60).slice(0, 10);
    return {
      ...base,
      dataEmissao,
      valorOriginal: titulo.valorBruto,
      situacao,
      aceite,
      operacaoId: operacao.id,
      eventos: montarEventos(base, dataEmissao, aceite, operacao, situacao)
    };
  });
};
