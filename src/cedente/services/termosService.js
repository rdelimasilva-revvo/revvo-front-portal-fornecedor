/**
 * Termos de cessão e suas assinaturas.
 *
 * Coleção própria, ligada à operação por operacaoId. O status do termo não vive
 * dentro da operação de propósito: duas fontes de verdade para o mesmo fato
 * divergem na primeira falha parcial de lote.
 */

import { TERMOS_CESSAO } from '../mocks/cedenteData';
import { clone, request } from './mockApi';
import { CODIGO_2FA_SIMULADO, MOTIVO_SEM_ALCADA, obterUsuarioAtualSync, podeAssinar } from './cadastroService';
import { concluirAssinatura } from './operacoesService';

let base = clone(TERMOS_CESSAO);

/**
 * Quem assina, informado pela tela antes de chamar assinarTermos.
 * A alçada é verificada na tela (podeAssinar); aqui só registramos a evidência.
 */
let assinanteAtual = null;

export const definirAssinante = (usuario) => {
  assinanteAtual = usuario ? { id: usuario.id, nome: usuario.nome, papel: usuario.papel } : null;
};

const hashDoTermo = (operacaoId) =>
  `sha256:${operacaoId.replace(/\D/g, '')}${'a3f9c1e7b2d84056'}`.slice(0, 32);

export const listarTermos = (filtros = {}) =>
  request(() => {
    const { status, busca } = filtros;

    const itens = base
      .filter((item) => (status ? item.status === status : true))
      .filter((item) => {
        if (!busca) return true;
        const alvo = `${item.id} ${item.operacaoId}`.toLowerCase();
        return alvo.includes(busca.toLowerCase());
      })
      // Pendente primeiro: é uma fila de trabalho, não um arquivo.
      .sort((a, b) => {
        if (a.status === 'pendente' && b.status !== 'pendente') return -1;
        if (b.status === 'pendente' && a.status !== 'pendente') return 1;
        return b.criadoEm.localeCompare(a.criadoEm);
      });

    return clone(itens);
  });

export const obterTermoPorOperacao = (operacaoId) =>
  request(() => {
    const termo = base.find((item) => item.operacaoId === operacaoId);
    return termo ? clone(termo) : null;
  });

export const contarPendentes = () =>
  request(() => base.filter((item) => item.status === 'pendente').length, { delay: 120 });

/** Síncrona: chamada pela contratação, que já está dentro de uma requisição. */
export const registrarTermo = ({ operacao, criadoPor, assinarAgora }) => {
    const novo = {
      id: `TC-${operacao.id.replace('OP-', '')}`,
      operacaoId: operacao.id,
      status: assinarAgora ? 'assinado' : 'pendente',
      criadoEm: new Date().toISOString(),
      criadoPor: { id: criadoPor.id, nome: criadoPor.nome, papel: criadoPor.papel },
      quantidadeTitulos: operacao.titulos.length,
      valorBruto: operacao.valorBruto,
      valorLiquido: operacao.valorLiquido,
      assinatura: assinarAgora
        ? {
            assinadoPor: { id: criadoPor.id, nome: criadoPor.nome, papel: criadoPor.papel },
            assinadoEm: new Date().toISOString(),
            metodo: 'aceite_eletronico_2fa',
            hash: hashDoTermo(operacao.id),
            ip: '177.32.14.80'
          }
        : null
    };

    base = [novo, ...base];
    return clone(novo);
};

/**
 * Assina um ou vários termos.
 *
 * Deliberadamente NÃO transacional: cada termo é assinado por conta própria e o
 * resultado reporta o que passou e o que falhou. Todo-ou-nada faria o cedente
 * perder assinaturas válidas por causa de um item problemático no lote.
 *
 * O segundo fator é validado uma vez para o lote: o aceite cobre o conjunto.
 */
export const assinarTermos = (ids, codigo) =>
  request(
    () => {
      const assinante = assinanteAtual || obterUsuarioAtualSync();
      if (!podeAssinar(assinante)) throw new Error(MOTIVO_SEM_ALCADA);
      if (String(codigo).trim() !== CODIGO_2FA_SIMULADO) {
        throw new Error('Código de verificação inválido. Confira o código enviado para o seu celular.');
      }
      if (!ids || ids.length === 0) {
        throw new Error('Selecione ao menos um termo para assinar.');
      }

      const assinados = [];
      const falhas = [];

      ids.forEach((id) => {
        const termo = base.find((item) => item.id === id);

        if (!termo) {
          falhas.push({ id, motivo: 'Termo não encontrado.' });
          return;
        }
        if (termo.status === 'assinado') {
          falhas.push({ id, motivo: 'Este termo já foi assinado.' });
          return;
        }
        if (termo.status === 'cancelado') {
          falhas.push({ id, motivo: 'Termo cancelado não pode ser assinado.' });
          return;
        }

        termo.status = 'assinado';
        termo.assinatura = {
          assinadoPor: { id: assinante.id, nome: assinante.nome, papel: assinante.papel },
          assinadoEm: new Date().toISOString(),
          metodo: 'aceite_eletronico_2fa',
          hash: hashDoTermo(termo.operacaoId),
          ip: '177.32.14.80'
        };
        assinados.push(clone(termo));
      });

      concluirAssinatura(assinados.map((termo) => termo.operacaoId));
      return { assinados, falhas };
    },
    { delay: 900 }
  );

/**
 * Não existe função de cancelar termo em runtime, de propósito: o portal do cedente
 * não tem nenhuma ação que recuse uma operação — a recusa vem do financiador, que
 * não existe neste front. As operações `recusada` já nascem com termo `cancelado`
 * pela derivação do mock. Criar um `cancelarTermoDaOperacao` sem chamador seria
 * código morto.
 */
