/**
 * Cadastro do cedente: dados da empresa, conta de crédito, integrações e usuários.
 */

import { CEDENTE } from '../mocks/cedenteData';
import { clone, request } from './mockApi';

let base = clone(CEDENTE);

export const obterCedente = () => request(() => clone(base));

/**
 * Alteração da conta de crédito exige reautenticação (validada na tela) e entra
 * em aprovação — nunca passa a valer na hora.
 */
export const solicitarAlteracaoConta = (conta) =>
  request(
    () => {
      base = {
        ...base,
        contaBancaria: { ...base.contaBancaria, ...conta, situacao: 'em_aprovacao' }
      };
      return clone(base.contaBancaria);
    },
    { delay: 800 }
  );

export const alterarPapelUsuario = (usuarioId, papel) =>
  request(() => {
    base = {
      ...base,
      usuarios: base.usuarios.map((usuario) => (usuario.id === usuarioId ? { ...usuario, papel } : usuario))
    };
    return clone(base.usuarios);
  });

export const convidarUsuario = ({ nome, email, papel }) =>
  request(() => {
    const novo = {
      id: `usr-${Date.now()}`,
      nome,
      email,
      papel,
      status: 'convidado'
    };
    base = { ...base, usuarios: [...base.usuarios, novo] };
    return clone(base.usuarios);
  });

export const alternarIntegracao = (integracaoId) =>
  request(() => {
    base = {
      ...base,
      integracoes: base.integracoes.map((integracao) =>
        integracao.id === integracaoId
          ? {
              ...integracao,
              status: integracao.status === 'conectada' ? 'desconectada' : 'conectada',
              detalhe: integracao.status === 'conectada' ? 'Desconectada agora' : 'Conectada agora'
            }
          : integracao
      )
    };
    return clone(base.integracoes);
  });

/** Segundo fator simulado. O código válido é fixo enquanto não há backend. */
export const CODIGO_2FA_SIMULADO = '123456';

export const validarSegundoFator = (codigo) =>
  request(
    () => {
      if (String(codigo).trim() !== CODIGO_2FA_SIMULADO) {
        throw new Error('Código de verificação inválido. Confira o código enviado para o seu celular.');
      }
      return { validado: true };
    },
    { delay: 700 }
  );

/**
 * Usuário logado do portal.
 *
 * Front-only: não há sessão real no portal do cedente. Começa no aprovador
 * para a fila de assinatura ter ação disponível na primeira visita.
 */
let usuarioAtualId = 'usr-1';

/** Para serviços que já estão dentro de uma requisição e precisam saber quem age. */
export const obterUsuarioAtualSync = () => clone(base.usuarios.find((item) => item.id === usuarioAtualId));

export const obterUsuarioAtual = () =>
  request(() => {
    const usuario = base.usuarios.find((item) => item.id === usuarioAtualId);
    if (!usuario) throw new Error(`Usuário ${usuarioAtualId} não encontrado.`);
    return clone(usuario);
  }, { delay: 120 });

export const definirUsuarioAtual = (id) =>
  request(() => {
    const usuario = base.usuarios.find((item) => item.id === id);
    if (!usuario) throw new Error(`Usuário ${id} não encontrado.`);
    if (usuario.status !== 'ativo') {
      throw new Error(`${usuario.nome} não está ativo e não pode operar o portal.`);
    }
    usuarioAtualId = id;
    return clone(usuario);
  }, { delay: 120 });

export const listarUsuariosParaTroca = () =>
  request(() => clone(base.usuarios.filter((item) => item.status === 'ativo')), { delay: 120 });

/**
 * Alçada de assinatura: só o aprovador assina termo de cessão.
 *
 * Síncrona de propósito — a UI consulta a cada render para decidir se habilita
 * o botão, e um await aqui causaria piscada entre habilitado e bloqueado.
 */
export const podeAssinar = (usuario) => usuario?.papel === 'aprovador';

export const MOTIVO_SEM_ALCADA =
  'Só usuários com papel de aprovador podem assinar o termo de cessão.';
