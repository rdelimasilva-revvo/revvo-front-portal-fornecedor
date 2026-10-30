/**
 * Infra da camada de serviço simulada.
 *
 * Todas as telas do cedente conversam com src/services/* e nunca com os mocks
 * diretamente. Quando o backend existir, basta trocar o corpo das funções de
 * serviço por chamadas HTTP — as telas não mudam.
 *
 * Para exercitar o estado de erro das telas, no console do navegador:
 *   localStorage.setItem('mockApiFailRate', '1')   // toda chamada falha
 *   localStorage.removeItem('mockApiFailRate')     // volta ao normal
 */

const DEFAULT_DELAY = 450;

export class ApiError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ApiError';
  }
}

const failRate = () => {
  try {
    return Number(localStorage.getItem('mockApiFailRate')) || 0;
  } catch {
    return 0;
  }
};

/** Simula latência de rede e, quando ligado, falhas para testar o estado de erro. */
export const request = async (resolver, { delay = DEFAULT_DELAY } = {}) => {
  await new Promise((resolve) => setTimeout(resolve, delay));

  if (Math.random() < failRate()) {
    throw new ApiError('Não foi possível concluir a operação. Verifique sua conexão e tente novamente.');
  }

  return typeof resolver === 'function' ? resolver() : resolver;
};

/** Cópia defensiva: evita que uma tela mutar o "banco" em memória sem passar pelo serviço. */
export const clone = (value) => JSON.parse(JSON.stringify(value));
