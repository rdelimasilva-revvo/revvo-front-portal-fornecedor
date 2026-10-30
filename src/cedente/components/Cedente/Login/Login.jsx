import React, { useState } from 'react';
import styled from 'styled-components';

import { Alert, Button, Card, Input } from '../../../ds';
import logoRevvo from '../../../ds/assets/logo-revvo-cor.svg';
import { definirUsuarioAtual, listarUsuariosParaTroca } from '../../../services/cadastroService';

const Fundo = styled.main`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--surface-page);
`;

const Caixa = styled.div`
  width: 100%;
  max-width: 400px;

  .marca {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    margin-bottom: 24px;
  }

  .marca img {
    height: 40px;
  }

  .produto {
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-semibold);
    color: var(--text-strong);
  }

  h1 {
    font-size: var(--fs-h3);
    font-weight: var(--fw-semibold);
    margin: 0 0 4px;
  }

  .subtitulo {
    font-size: var(--fs-body-sm);
    color: var(--text-muted);
    margin: 0 0 20px;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
`;

// shortcut: login simulado, sem senha conferida; troca pela autenticação do backend (Keycloak).
const Login = ({ onEntrar }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [entrando, setEntrando] = useState(false);

  const enviar = async (evento) => {
    evento.preventDefault();
    setErro('');
    if (!email.trim() || !senha) {
      setErro('Informe o e-mail e a senha.');
      return;
    }

    setEntrando(true);
    try {
      const usuarios = await listarUsuariosParaTroca();
      const usuario = usuarios.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
      if (!usuario) {
        setErro('E-mail não encontrado entre os usuários ativos do cedente.');
        return;
      }
      await definirUsuarioAtual(usuario.id);
      onEntrar();
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setEntrando(false);
    }
  };

  return (
    <Fundo>
      <Caixa>
        <div className="marca">
          <img src={logoRevvo} alt="Revvo" />
          <span className="produto">Trade - Portal do Cedente</span>
        </div>

        <Card padding={28}>
          <h1>Entrar</h1>
          <p className="subtitulo">Acesse a escrituração e a antecipação das suas duplicatas.</p>

          <form onSubmit={enviar} noValidate>
            <Input
              label="E-mail"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Senha"
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            {erro && <Alert kind="danger">{erro}</Alert>}
            <Button type="submit" fullWidth disabled={entrando}>
              {entrando ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>
        </Card>

        <Alert kind="info" title="Ambiente de demonstração" style={{ marginTop: 16 }}>
          Entre com mariana@andradedist.com.br (aprovador, assina termos) ou carlos@andradedist.com.br (operador). A
          senha não é conferida.
        </Alert>
      </Caixa>
    </Fundo>
  );
};

export default Login;
