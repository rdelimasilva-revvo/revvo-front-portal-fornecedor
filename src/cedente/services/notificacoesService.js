/**
 * Central de notificações e preferências de canal por evento.
 */

import { NOTIFICACOES, PREFERENCIAS_NOTIFICACAO_PADRAO } from '../mocks/cedenteData';
import { clone, request } from './mockApi';

const CHAVE_PREFERENCIAS = 'cedenteNotificacaoPreferencias';

let base = clone(NOTIFICACOES);

const lerPreferencias = () => {
  try {
    const salvo = localStorage.getItem(CHAVE_PREFERENCIAS);
    return salvo ? { ...PREFERENCIAS_NOTIFICACAO_PADRAO, ...JSON.parse(salvo) } : clone(PREFERENCIAS_NOTIFICACAO_PADRAO);
  } catch {
    return clone(PREFERENCIAS_NOTIFICACAO_PADRAO);
  }
};

export const listarNotificacoes = () =>
  request(() => clone([...base].sort((a, b) => b.dataHora.localeCompare(a.dataHora))));

export const contarNaoLidas = () => base.filter((notificacao) => !notificacao.lida).length;

export const marcarComoLida = (id) =>
  request(() => {
    base = base.map((notificacao) => (notificacao.id === id ? { ...notificacao, lida: true } : notificacao));
    return clone(base);
  }, { delay: 150 });

export const marcarTodasComoLidas = () =>
  request(() => {
    base = base.map((notificacao) => ({ ...notificacao, lida: true }));
    return clone(base);
  }, { delay: 200 });

export const obterPreferencias = () => request(() => lerPreferencias());

export const salvarPreferencias = (preferencias) =>
  request(
    () => {
      try {
        localStorage.setItem(CHAVE_PREFERENCIAS, JSON.stringify(preferencias));
      } catch {
        throw new Error('Não foi possível salvar as preferências neste navegador.');
      }
      return clone(preferencias);
    },
    { delay: 400 }
  );
