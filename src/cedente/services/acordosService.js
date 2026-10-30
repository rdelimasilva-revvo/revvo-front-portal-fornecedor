/**
 * Acordos comerciais: abatimentos pedidos pelos sacados sobre as duplicatas.
 *
 * Aprovar um abatimento reduz o saldo da duplicata na escrituração, e o novo
 * valor é o que aparece em Recebíveis e entra numa antecipação.
 */

import { ABATIMENTOS } from '../mocks/acordosData';
import { clone, request } from './mockApi';
import { aplicarAbatimento } from './duplicatasService';

let base = clone(ABATIMENTOS);

export const listarAcordos = () => request(() => clone(base));

export const contarAcordosPendentes = () => base.filter((acordo) => acordo.status === 'pendente').length;

export const decidirAcordo = (id, status) =>
  request(() => {
    const acordo = base.find((item) => item.id === id);
    if (!acordo) throw new Error('Acordo não encontrado.');
    if (acordo.status !== 'pendente') throw new Error('Este acordo já foi decidido.');

    const decidido = { ...acordo, status, dataDecisao: new Date().toISOString().slice(0, 10) };
    base = base.map((item) => (item.id === id ? decidido : item));

    const duplicata =
      status === 'aprovado' ? aplicarAbatimento(acordo.duplicata, acordo.abatimento, acordo.justificativa) : null;

    return { acordo: clone(decidido), duplicataAtualizada: duplicata };
  });
