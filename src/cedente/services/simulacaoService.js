/**
 * Simulação da antecipação.
 *
 * O cálculo roda no front para o painel responder instantaneamente à seleção.
 * Quando o backend entrar, ele passa a ser a fonte da verdade (taxa por sacado,
 * política de tarifas, feriados) e este módulo vira o fallback otimista.
 */

import { PARAMETROS_OPERACAO } from '../mocks/cedenteData';
import { daysUntil, toISODate, today } from '../utils/format';

const arredonda = (valor) => Math.round(valor * 100) / 100;

/**
 * Próximo dia útil a partir de hoje (D+1), ignorando sábado e domingo.
 * Feriados bancários dependem do backend.
 */
const proximaDataCredito = () => {
  const data = new Date(today());
  data.setDate(data.getDate() + 1);
  while (data.getDay() === 0 || data.getDay() === 6) {
    data.setDate(data.getDate() + 1);
  }
  return toISODate(data);
};

/**
 * @param {import('../types/entities').Recebivel[]} recebiveis
 * @param {object} [parametros]
 * @returns {import('../types/entities').Simulacao}
 */
export const calcularSimulacao = (recebiveis, parametros = PARAMETROS_OPERACAO) => {
  const { taxaMensal, iofDiario, iofAdicional, tarifaPorTitulo, tarifaMinima } = parametros;
  const taxaDiaria = taxaMensal / 100 / 30;

  const titulos = recebiveis.map((recebivel) => {
    const prazoDias = Math.max(daysUntil(recebivel.vencimento) ?? 0, 0);
    const desconto = arredonda(recebivel.valor * taxaDiaria * prazoDias);
    const iof = arredonda(recebivel.valor * (iofDiario * prazoDias + iofAdicional));

    return {
      recebivelId: recebivel.id,
      numeroTitulo: recebivel.numeroTitulo,
      sacado: recebivel.sacado,
      vencimento: recebivel.vencimento,
      valorBruto: recebivel.valor,
      prazoDias,
      desconto,
      iof,
      valorLiquido: arredonda(recebivel.valor - desconto - iof)
    };
  });

  const valorBruto = arredonda(titulos.reduce((total, titulo) => total + titulo.valorBruto, 0));
  const descontoTotal = arredonda(titulos.reduce((total, titulo) => total + titulo.desconto, 0));
  const iofTotal = arredonda(titulos.reduce((total, titulo) => total + titulo.iof, 0));
  const tarifas = titulos.length === 0 ? 0 : arredonda(Math.max(titulos.length * tarifaPorTitulo, tarifaMinima));

  // Prazo médio ponderado pelo valor: é o que define o custo real da operação.
  const prazoMedio =
    valorBruto === 0
      ? 0
      : Math.round(titulos.reduce((total, titulo) => total + titulo.prazoDias * titulo.valorBruto, 0) / valorBruto);

  return {
    titulos,
    quantidade: titulos.length,
    valorBruto,
    taxaMensal,
    prazoMedio,
    desconto: descontoTotal,
    iof: iofTotal,
    tarifas,
    valorLiquido: arredonda(valorBruto - descontoTotal - iofTotal - tarifas),
    dataCredito: proximaDataCredito()
  };
};
