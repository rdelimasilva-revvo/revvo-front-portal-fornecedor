import React, { useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';

import { Alert, Button, Card, Input, Select, Table, Tabs } from '../../../ds';
import { useRequisicao } from '../../../hooks/useRequisicao';
import {
  CODIGO_2FA_SIMULADO,
  alterarPapelUsuario,
  alternarIntegracao,
  convidarUsuario,
  obterCedente,
  solicitarAlteracaoConta,
  validarSegundoFator
} from '../../../services/cadastroService';
import { formatCNPJ } from '../../../utils/format';
import StatusBadge from '../../Common/StatusBadge';
import { ErrorState, LoadingState } from '../../Common/States';

const Container = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 20px;

  h1 {
    font-size: var(--fs-h1);
    font-weight: var(--fw-display);
    letter-spacing: -0.02em;
    margin: 0;
  }

  p {
    font-size: var(--fs-body-sm);
    color: var(--text-muted);
    margin: 4px 0 0;
  }
`;

const Painel = styled.div`
  margin-bottom: 16px;

  h2 {
    font-size: var(--fs-h3);
    font-weight: var(--fw-semibold);
    margin: 0 0 4px;
  }

  .descricao {
    font-size: var(--fs-body-sm);
    color: var(--text-muted);
    margin: 0 0 16px;
  }
`;

const Campos = styled.div`
  display: grid;
  grid-template-columns: repeat(${(props) => props.$colunas || 3}, 1fr);
  gap: 16px;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const CampoLeitura = styled.div`
  .rotulo {
    font-size: 12px;
    color: var(--text-muted);
    margin-bottom: 4px;
  }

  .valor {
    font-size: var(--fs-body-sm);
    color: var(--text-strong);
    padding: 8px 0;
    border-bottom: 1px solid var(--border-subtle);
  }
`;

const Acoes = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  flex-wrap: wrap;
`;

const CaixaSeguranca = styled.div`
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 16px;
  margin-top: 16px;
  background: var(--surface-sunken);
  max-width: 320px;

  h3 {
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-semibold);
    margin: 0 0 4px;
  }

  p {
    font-size: var(--fs-caption);
    color: var(--text-muted);
    margin: 0 0 12px;
  }

  .dica {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 8px;
  }
`;

const LayoutArquivo = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  code {
    flex: 1;
    background: var(--surface-sunken);
    border: 1px solid var(--border-subtle);
    padding: 10px 12px;
    border-radius: var(--radius-sm);
    font-size: 13px;
  }
`;

const ABAS = [
  { value: 'empresa', label: 'Dados da empresa' },
  { value: 'conta', label: 'Conta de crédito' },
  { value: 'integracao', label: 'Integração' },
  { value: 'usuarios', label: 'Usuários e permissões' }
];

const LAYOUT_CSV = 'sacado;cnpj;titulo;nf;valor;vencimento';

const Leitura = ({ rotulo, children }) => (
  <CampoLeitura>
    <div className="rotulo">{rotulo}</div>
    <div className="valor">{children}</div>
  </CampoLeitura>
);

const Cadastro = () => {
  const [aba, setAba] = useState('empresa');
  const { dados, carregando, erro, recarregar, setDados } = useRequisicao(() => obterCedente(), []);

  const [editandoConta, setEditandoConta] = useState(false);
  const [formConta, setFormConta] = useState(null);
  const [codigo, setCodigo] = useState('');
  const [salvandoConta, setSalvandoConta] = useState(false);

  const [novoUsuario, setNovoUsuario] = useState({ nome: '', email: '', papel: 'operador' });
  const [convidando, setConvidando] = useState(false);

  if (carregando) {
    return (
      <Container>
        <LoadingState linhas={5} altura={60} label="Carregando cadastro" />
      </Container>
    );
  }

  if (erro) {
    return (
      <Container>
        <ErrorState titulo="Não foi possível carregar o cadastro" mensagem={erro.message} onRetry={recarregar} />
      </Container>
    );
  }

  const cedente = dados;

  const iniciarEdicaoConta = () => {
    setFormConta({ ...cedente.contaBancaria });
    setCodigo('');
    setEditandoConta(true);
  };

  const salvarConta = async () => {
    setSalvandoConta(true);
    try {
      await validarSegundoFator(codigo);
      const conta = await solicitarAlteracaoConta(formConta);
      setDados({ ...cedente, contaBancaria: conta });
      setEditandoConta(false);
      toast.success('Alteração enviada para aprovação. A conta atual segue valendo até a aprovação.');
    } catch (falha) {
      toast.error(falha.message || 'Não foi possível solicitar a alteração.');
    } finally {
      setSalvandoConta(false);
    }
  };

  const trocarPapel = async (usuarioId, papel) => {
    try {
      const usuarios = await alterarPapelUsuario(usuarioId, papel);
      setDados({ ...cedente, usuarios });
      toast.success('Permissão atualizada.');
    } catch (falha) {
      toast.error(falha.message || 'Não foi possível atualizar a permissão.');
    }
  };

  const convidar = async (evento) => {
    evento.preventDefault();
    setConvidando(true);
    try {
      const usuarios = await convidarUsuario(novoUsuario);
      setDados({ ...cedente, usuarios });
      setNovoUsuario({ nome: '', email: '', papel: 'operador' });
      toast.success('Convite enviado.');
    } catch (falha) {
      toast.error(falha.message || 'Não foi possível enviar o convite.');
    } finally {
      setConvidando(false);
    }
  };

  const alternar = async (integracaoId) => {
    try {
      const integracoes = await alternarIntegracao(integracaoId);
      setDados({ ...cedente, integracoes });
    } catch (falha) {
      toast.error(falha.message || 'Não foi possível alterar a integração.');
    }
  };

  const colunasIntegracoes = [
    { key: 'nome', label: 'Integração' },
    { key: 'tipo', label: 'Tipo', render: (linha) => (linha.tipo === 'api' ? 'API' : 'Arquivo') },
    {
      key: 'status',
      label: 'Situação',
      render: (linha) => (
        <StatusBadge
          tom={linha.status === 'conectada' ? 'verde' : linha.status === 'erro' ? 'vermelho' : 'neutro'}
        >
          {linha.status === 'conectada' ? 'Conectada' : linha.status === 'erro' ? 'Com erro' : 'Desconectada'}
        </StatusBadge>
      )
    },
    { key: 'detalhe', label: 'Detalhe' },
    {
      key: 'acao',
      label: 'Ação',
      align: 'center',
      render: (linha) => (
        <Button variant="secondary" size="sm" onClick={() => alternar(linha.id)}>
          {linha.status === 'conectada' ? 'Desconectar' : 'Conectar'}
        </Button>
      )
    }
  ];

  const colunasUsuarios = [
    { key: 'nome', label: 'Nome' },
    { key: 'email', label: 'E-mail' },
    {
      key: 'papel',
      label: 'Papel',
      width: 180,
      render: (linha) => (
        <Select
          value={linha.papel}
          onChange={(valor) => trocarPapel(linha.id, valor)}
          options={[
            { value: 'operador', label: 'Operador' },
            { value: 'aprovador', label: 'Aprovador' }
          ]}
        />
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (linha) => (
        <StatusBadge tom={linha.status === 'ativo' ? 'verde' : linha.status === 'convidado' ? 'amarelo' : 'neutro'}>
          {linha.status === 'ativo' ? 'Ativo' : linha.status === 'convidado' ? 'Convite pendente' : 'Inativo'}
        </StatusBadge>
      )
    }
  ];

  return (
    <Container>
      <PageHeader>
        <h1>Cadastro</h1>
        <p>Dados da empresa, conta de crédito, integrações e quem pode operar no portal.</p>
      </PageHeader>

      <Tabs tabs={ABAS} value={aba} onChange={setAba} style={{ marginBottom: 20 }} />

      {aba === 'empresa' && (
        <Painel>
          <Card padding={24}>
            <h2>Dados da empresa</h2>
            <p className="descricao">
              Somente leitura: o cadastro foi aprovado pelo financiador e mudanças exigem nova análise cadastral.
            </p>
            <Campos $colunas={2}>
              <Leitura rotulo="Razão social">{cedente.razaoSocial}</Leitura>
              <Leitura rotulo="Nome fantasia">{cedente.nomeFantasia}</Leitura>
              <Leitura rotulo="CNPJ">{formatCNPJ(cedente.cnpj)}</Leitura>
              <Leitura rotulo="Situação cadastral">
                <StatusBadge tom={cedente.situacaoCadastral === 'aprovado' ? 'verde' : 'amarelo'}>
                  {cedente.situacaoCadastral === 'aprovado' ? 'Aprovado' : 'Em análise'}
                </StatusBadge>
              </Leitura>
              <div style={{ gridColumn: '1 / -1' }}>
                <Leitura rotulo="Endereço">{cedente.endereco}</Leitura>
              </div>
            </Campos>
          </Card>
        </Painel>
      )}

      {aba === 'conta' && (
        <Painel>
          <Card padding={24}>
            <h2>Conta bancária de crédito</h2>
            <p className="descricao">
              É nesta conta que o valor líquido das operações é creditado. Alterações exigem nova autenticação e passam
              por aprovação antes de valer.
            </p>

            {cedente.contaBancaria.situacao === 'em_aprovacao' && (
              <Alert kind="warning" title="Alteração em aprovação" style={{ marginBottom: 16 }}>
                Até a aprovação, os créditos continuam sendo feitos na conta anterior.
              </Alert>
            )}

            {!editandoConta ? (
              <>
                <Campos>
                  <Leitura rotulo="Banco">
                    {cedente.contaBancaria.codigoBanco} · {cedente.contaBancaria.banco}
                  </Leitura>
                  <Leitura rotulo="Agência">{cedente.contaBancaria.agencia}</Leitura>
                  <Leitura rotulo="Conta">{cedente.contaBancaria.conta}</Leitura>
                  <Leitura rotulo="Tipo">{cedente.contaBancaria.tipo}</Leitura>
                  <Leitura rotulo="Titular">{cedente.contaBancaria.titular}</Leitura>
                  <Leitura rotulo="CNPJ do titular">{formatCNPJ(cedente.contaBancaria.cnpjTitular)}</Leitura>
                </Campos>
                <Acoes>
                  <Button variant="secondary" onClick={iniciarEdicaoConta}>
                    Alterar conta de crédito
                  </Button>
                </Acoes>
              </>
            ) : (
              <>
                <Campos>
                  <Input
                    label="Banco"
                    value={formConta.banco}
                    onChange={(evento) => setFormConta({ ...formConta, banco: evento.target.value })}
                  />
                  <Input
                    label="Código do banco"
                    value={formConta.codigoBanco}
                    onChange={(evento) => setFormConta({ ...formConta, codigoBanco: evento.target.value })}
                  />
                  <Input
                    label="Agência"
                    value={formConta.agencia}
                    onChange={(evento) => setFormConta({ ...formConta, agencia: evento.target.value })}
                  />
                  <Input
                    label="Conta"
                    value={formConta.conta}
                    onChange={(evento) => setFormConta({ ...formConta, conta: evento.target.value })}
                  />
                  <Select
                    label="Tipo"
                    value={formConta.tipo}
                    onChange={(valor) => setFormConta({ ...formConta, tipo: valor })}
                    options={[
                      { value: 'Conta corrente', label: 'Conta corrente' },
                      { value: 'Conta poupança', label: 'Conta poupança' },
                      { value: 'Conta de pagamento', label: 'Conta de pagamento' }
                    ]}
                  />
                </Campos>

                <CaixaSeguranca>
                  <h3>Confirmação de segurança</h3>
                  <p>Informe o código enviado para o celular cadastrado para solicitar a alteração.</p>
                  <Input
                    label="Código de verificação"
                    inputMode="numeric"
                    maxLength={6}
                    value={codigo}
                    onChange={(evento) => setCodigo(evento.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    leftIcon={<i data-lucide="lock" style={{ width: 15, height: 15 }} />}
                  />
                  <div className="dica">Ambiente de demonstração: use o código {CODIGO_2FA_SIMULADO}.</div>
                </CaixaSeguranca>

                <Acoes>
                  <Button variant="secondary" onClick={() => setEditandoConta(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={salvarConta} disabled={salvandoConta || codigo.length !== 6}>
                    {salvandoConta ? 'Enviando…' : 'Solicitar alteração'}
                  </Button>
                </Acoes>
              </>
            )}
          </Card>
        </Painel>
      )}

      {aba === 'integracao' && (
        <>
          <Painel>
            <Card padding={24}>
              <h2>Integrações</h2>
              <p className="descricao">Conexões de API com o seu ERP e envio de arquivos de recebíveis.</p>
              <Table columns={colunasIntegracoes} rows={cedente.integracoes} rowKey="id" dense />
            </Card>
          </Painel>

          <Painel>
            <Card padding={24}>
              <h2>Layout de arquivo</h2>
              <p className="descricao">
                Formato aceito na importação por arquivo. O CNAB 400 segue o layout padrão de remessa.
              </p>
              <LayoutArquivo>
                <code>{LAYOUT_CSV}</code>
                <Button
                  variant="secondary"
                  onClick={() => {
                    navigator.clipboard?.writeText(LAYOUT_CSV);
                    toast.success('Layout copiado.');
                  }}
                  leftIcon={<i data-lucide="copy" style={{ width: 15, height: 15 }} />}
                >
                  Copiar
                </Button>
              </LayoutArquivo>
              <p className="descricao" style={{ marginTop: 12, marginBottom: 0 }}>
                Valores aceitos com ponto ou vírgula decimal. Datas em dd/mm/aaaa ou aaaa-mm-dd. No CNAB 400: CNPJ do
                sacado nas posições 4-17, número do título em 111-120, vencimento em 121-126 e valor em 127-139.
              </p>
            </Card>
          </Painel>
        </>
      )}

      {aba === 'usuarios' && (
        <>
          <Painel>
            <Card padding={24}>
              <h2>Usuários e permissões</h2>
              <p className="descricao">
                Operador importa recebíveis e monta a simulação. Aprovador é quem pode contratar a operação e
                solicitar alteração de conta bancária.
              </p>
              <Table columns={colunasUsuarios} rows={cedente.usuarios} rowKey="id" dense />
            </Card>
          </Painel>

          <Painel>
            <Card padding={24}>
              <form onSubmit={convidar}>
                <h2>Convidar usuário</h2>
                <p className="descricao">O convidado recebe um e-mail para definir a senha e acessar o portal.</p>
                <Campos>
                  <Input
                    label="Nome"
                    required
                    value={novoUsuario.nome}
                    onChange={(evento) => setNovoUsuario({ ...novoUsuario, nome: evento.target.value })}
                  />
                  <Input
                    label="E-mail"
                    type="email"
                    required
                    value={novoUsuario.email}
                    onChange={(evento) => setNovoUsuario({ ...novoUsuario, email: evento.target.value })}
                  />
                  <Select
                    label="Papel"
                    value={novoUsuario.papel}
                    onChange={(valor) => setNovoUsuario({ ...novoUsuario, papel: valor })}
                    options={[
                      { value: 'operador', label: 'Operador' },
                      { value: 'aprovador', label: 'Aprovador' }
                    ]}
                  />
                </Campos>
                <Acoes>
                  <Button
                    type="submit"
                    disabled={convidando}
                    leftIcon={<i data-lucide="user-plus" style={{ width: 15, height: 15 }} />}
                  >
                    {convidando ? 'Enviando…' : 'Enviar convite'}
                  </Button>
                </Acoes>
              </form>
            </Card>
          </Painel>
        </>
      )}
    </Container>
  );
};

export default Cadastro;
