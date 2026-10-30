/**
 * Escrituração de duplicatas: criação, envio à registradora e ciclo de vida.
 *
 * Opera sobre a mesma base do recebiveisService. Uma duplicata registrada e
 * dentro da janela de prazo aparece em Recebíveis sem nenhuma cópia.
 */

import { SACADOS } from '../mocks/cedenteData';
import { clone, request } from './mockApi';
import { gravarBase, lerBase } from './recebiveisService';
import { avaliarJanela, enriquecerComEscrituracao, evento } from './escrituracao';

// Tempo simulado até a registradora confirmar o registro.
const TEMPO_REGISTRO_MS = 4000;

let sequencia = 0;

const atualizar = (id, alterar) => {
  let alterada = null;
  gravarBase(
    lerBase().map((item) => {
      if (item.id !== id) return item;
      alterada = alterar(item);
      return alterada;
    })
  );
  if (!alterada) throw new Error('Duplicata não encontrada.');
  return clone(alterada);
};

const exigirEmAberto = (item, acao) => {
  if (item.situacao !== 'em_aberto') {
    throw new Error(`Não é possível ${acao}: a duplicata ${item.numeroTitulo} está ${item.situacao.replace('_', ' ')}.`);
  }
};

/** Todas as duplicatas, inclusive cedidas e encerradas, para a tela de escrituração. */
export const listarDuplicatas = (filtros = {}) =>
  request(() => {
    const { busca, situacao, criadasNoPortal } = filtros;
    const termo = busca?.trim().toLowerCase();
    return clone(
      lerBase()
        .filter((item) => (criadasNoPortal ? item.criadaNoPortal : item.statusRegistro !== 'nao_registrada'))
        .filter((item) => (situacao ? item.situacao === situacao : true))
        .filter((item) =>
          termo
            ? `${item.numeroTitulo} ${item.numeroNF} ${item.sacado.nome} ${item.sacado.cnpj}`.toLowerCase().includes(termo)
            : true
        )
        .sort((a, b) => b.dataEmissao.localeCompare(a.dataEmissao))
    );
  });

export const obterDuplicata = (id) =>
  request(() => {
    const item = lerBase().find((duplicata) => duplicata.id === id);
    if (!item) throw new Error('Duplicata não encontrada.');
    return clone(item);
  });

export const listarSacadosConhecidos = () => clone(SACADOS);

/**
 * Cria a duplicata no portal. Ela nasce sem registro e só vira recebível depois
 * de enviada e confirmada pela registradora.
 */
export const criarDuplicata = ({ sacadoNome, sacadoCnpj, numeroNF, valor, vencimento, dataEmissao, origem = 'manual' }) =>
  request(() => {
    const cnpj = String(sacadoCnpj).replace(/\D/g, '');
    if (cnpj.length !== 14) throw new Error('Informe um CNPJ válido para o sacado.');
    if (!(Number(valor) > 0)) throw new Error('Informe um valor maior que zero.');
    if (!vencimento) throw new Error('Informe o vencimento.');

    const sacado = SACADOS.find((item) => item.cnpj === cnpj) || { id: `sac-${cnpj}`, nome: sacadoNome, cnpj };
    sequencia += 1;
    const numeroNFLimpo = String(numeroNF).replace(/\D/g, '').padStart(9, '0');

    const [nova] = enriquecerComEscrituracao([
      {
        id: `dup-${Date.now()}-${sequencia}`,
        sacado,
        numeroTitulo: `DUP-${numeroNFLimpo.slice(-4)}/${String(sequencia).padStart(2, '0')}`,
        numeroNF: numeroNFLimpo,
        valor: Number(valor),
        vencimento,
        dataEmissao: dataEmissao || new Date().toISOString().slice(0, 10),
        statusRegistro: 'nao_registrada',
        origem,
        elegivel: false,
        motivoInelegibilidade: 'Aguardando envio à registradora',
        criadaNoPortal: true
      }
    ]);

    gravarBase([nova, ...lerBase()]);
    return clone(nova);
  });

/** Exclui uma duplicata que ainda não foi enviada à registradora. */
export const excluirDuplicata = (id) =>
  request(() => {
    const item = lerBase().find((duplicata) => duplicata.id === id);
    if (!item) throw new Error('Duplicata não encontrada.');
    if (item.statusRegistro !== 'nao_registrada') {
      throw new Error('Duplicata já enviada à registradora: use o cancelamento.');
    }
    gravarBase(lerBase().filter((duplicata) => duplicata.id !== id));
    return true;
  });

/**
 * Envia à registradora. O registro é confirmado alguns segundos depois, como
 * a CERC faria de forma assíncrona; a partir daí o título fica elegível.
 */
export const enviarParaRegistradora = (ids) =>
  request(() => {
    const alvo = new Set(ids);
    const enviadas = lerBase().filter((item) => alvo.has(item.id) && item.statusRegistro === 'nao_registrada');
    if (enviadas.length === 0) throw new Error('Nenhuma duplicata pendente de envio foi selecionada.');

    enviadas.forEach((item) =>
      atualizar(item.id, (atual) => ({
        ...atual,
        statusRegistro: 'pendente',
        motivoInelegibilidade: 'Registro pendente na registradora',
        eventos: [...atual.eventos, evento('envio', 'Enviada à registradora')]
      }))
    );

    setTimeout(() => {
      enviadas.forEach((item) => {
        try {
          atualizar(item.id, (atual) => ({
            ...atual,
            statusRegistro: 'registrada',
            ...avaliarJanela(atual),
            eventos: [...atual.eventos, evento('registro', 'Registrada na CERC')]
          }));
        } catch {
          // A duplicata pode ter sido cancelada antes da confirmação.
        }
      });
    }, TEMPO_REGISTRO_MS);

    return { enviadas: enviadas.length };
  }, { delay: 700 });

/** Baixa: o sacado pagou direto ao cedente, fora do fluxo de antecipação. */
export const baixarDuplicata = (id, motivo) =>
  request(() =>
    atualizar(id, (atual) => {
      exigirEmAberto(atual, 'baixar');
      return {
        ...atual,
        situacao: 'baixado',
        elegivel: false,
        motivoInelegibilidade: 'Duplicata baixada',
        eventos: [...atual.eventos, evento('baixa', `Baixada: ${motivo}`)]
      };
    })
  );

export const cancelarDuplicata = (id, motivo) =>
  request(() =>
    atualizar(id, (atual) => {
      exigirEmAberto(atual, 'cancelar');
      return {
        ...atual,
        situacao: 'cancelado',
        elegivel: false,
        motivoInelegibilidade: 'Duplicata cancelada',
        eventos: [...atual.eventos, evento('cancelamento', `Cancelada: ${motivo}`)]
      };
    })
  );

/** Pagamento parcial recebido do sacado: reduz o saldo; zerado, a duplicata é baixada. */
export const registrarPagamentoParcial = (id, valorPago) =>
  request(() =>
    atualizar(id, (atual) => {
      exigirEmAberto(atual, 'registrar pagamento');
      const pago = Number(valorPago);
      if (!(pago > 0)) throw new Error('Informe um valor maior que zero.');
      if (pago > atual.valor) throw new Error('O pagamento não pode ser maior que o saldo da duplicata.');
      const saldo = Math.round((atual.valor - pago) * 100) / 100;
      const quitada = saldo === 0;
      return {
        ...atual,
        valor: saldo,
        situacao: quitada ? 'baixado' : atual.situacao,
        ...(quitada ? { elegivel: false, motivoInelegibilidade: 'Duplicata quitada' } : {}),
        eventos: [
          ...atual.eventos,
          evento(
            'pagamento_parcial',
            `Pagamento de ${pago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} recebido${quitada ? ': duplicata quitada' : ''}`
          )
        ]
      };
    })
  );

/**
 * Abatimento aprovado em acordo comercial. Síncrona: é chamada de dentro do
 * acordosService, que já está numa requisição.
 */
export const aplicarAbatimento = (numeroTitulo, valor, descricao) => {
  const item = lerBase().find((duplicata) => duplicata.numeroTitulo === numeroTitulo);
  if (!item) return null;
  return atualizar(item.id, (atual) => ({
    ...atual,
    valor: Math.max(0, Math.round((atual.valor - valor) * 100) / 100),
    eventos: [
      ...atual.eventos,
      evento('abatimento', `Abatimento de ${valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}: ${descricao}`)
    ]
  }));
};
