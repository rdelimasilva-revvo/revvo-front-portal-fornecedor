import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { Alert, Button, Card, Checkbox, SearchField, Select, Table } from '../../../ds';
import { useRequisicao } from '../../../hooks/useRequisicao';
import { MOTIVO_SEM_ALCADA, obterUsuarioAtual, podeAssinar } from '../../../services/cadastroService';
import { listarTermos } from '../../../services/termosService';
import { STATUS_TERMO_LABEL } from '../../../types/entities';
import { formatCurrency, formatDateTime } from '../../../utils/format';
import StatusBadge, { TOM_STATUS_TERMO } from '../../Common/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../../Common/States';
import AssinaturaModal from './AssinaturaModal';
import EvidenciaModal from './EvidenciaModal';

const Container = styled.div`
  padding: 24px;
  max-width: 1400px;
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

const Cards = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Indicador = styled.div`
  .rotulo {
    font-size: 12px;
    color: var(--text-muted);
  }

  .valor {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    margin-top: 2px;
  }

  .detalhe {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 2px;
  }
`;

const Filtros = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  gap: 12px;
  padding: 16px;
  margin-bottom: 16px;
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  align-items: end;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const BarraSelecao = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  font-size: var(--fs-body-sm);
  color: var(--text-muted);
`;

const LinkOperacao = styled.button`
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  font-weight: var(--fw-semibold);
  color: var(--revvo-blue-500);
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const Papel = styled.span`
  display: block;
  font-size: 12px;
  color: var(--text-muted);
`;

const icone = (nome) => <i data-lucide={nome} style={{ width: 14, height: 14 }} />;

// A linha também é clicável: cliques nos controles da célula não podem chegar a ela.
const semPropagar = (conteudo) => <span onClick={(evento) => evento.stopPropagation()}>{conteudo}</span>;

const TRINTA_DIAS_MS = 30 * 24 * 60 * 60 * 1000;
const FILTROS_VAZIOS = { busca: '', status: '' };

const soma = (itens, campo) => itens.reduce((total, item) => total + item[campo], 0);
const plural = (n, singular, varios) => `${n} ${n === 1 ? singular : varios}`;

const Contratos = ({ onNavegar, parametros = {} }) => {
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS);
  const [selecionados, setSelecionados] = useState(new Set());
  const [assinando, setAssinando] = useState(null);
  const [evidencia, setEvidencia] = useState(null);
  const termoInicialTratado = useRef(false);

  const usuario = useRequisicao(() => obterUsuarioAtual(), []);
  const todos = useRequisicao(() => listarTermos(), []);
  const lista = useRequisicao(
    () => listarTermos({ status: filtros.status || undefined, busca: filtros.busca.trim() || undefined }),
    [filtros.status, filtros.busca]
  );

  const pode = podeAssinar(usuario.dados);
  const termosTodos = todos.dados || [];
  const termos = lista.dados || [];
  const pendentesTodos = termosTodos.filter((termo) => termo.status === 'pendente');
  const assinadosRecentes = termosTodos.filter(
    (termo) => termo.status === 'assinado' && Date.now() - new Date(termo.assinatura.assinadoEm).getTime() <= TRINTA_DIAS_MS
  );

  const pendentesVisiveis = termos.filter((termo) => termo.status === 'pendente');
  const selecionadosVisiveis = pendentesVisiveis.filter((termo) => selecionados.has(termo.id));
  const todosSelecionados =
    pendentesVisiveis.length > 0 && pendentesVisiveis.every((termo) => selecionados.has(termo.id));

  useEffect(() => {
    if (termoInicialTratado.current || !parametros.termoId || !todos.dados) return;
    termoInicialTratado.current = true;
    const alvo = todos.dados.find((termo) => termo.id === parametros.termoId);
    if (!alvo) return;
    if (alvo.status === 'assinado') setEvidencia(alvo);
    if (alvo.status === 'pendente') {
      setSelecionados(new Set([alvo.id]));
      setFiltros((atuais) => ({ ...atuais, busca: alvo.id }));
    }
  }, [parametros.termoId, todos.dados]);

  const recarregar = () => {
    setSelecionados(new Set());
    todos.recarregar();
    lista.recarregar();
  };

  const atualizarFiltro = (campo, valor) => setFiltros((atuais) => ({ ...atuais, [campo]: valor }));

  const alternarSelecao = (id) =>
    setSelecionados((atuais) => {
      const novo = new Set(atuais);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });

  const alternarTodos = () =>
    setSelecionados((atuais) => {
      const novo = new Set(atuais);
      pendentesVisiveis.forEach((termo) => (todosSelecionados ? novo.delete(termo.id) : novo.add(termo.id)));
      return novo;
    });

  const verOperacao = (operacaoId) => onNavegar('operacoes', { operacaoId });

  const aoClicarLinha = (termo) => {
    if (termo.status === 'assinado') setEvidencia(termo);
    if (termo.status === 'pendente') alternarSelecao(termo.id);
  };

  const colunas = [
    {
      key: 'selecao',
      width: 44,
      label: pendentesVisiveis.length > 0 && (
        <Checkbox checked={todosSelecionados} onChange={alternarTodos} id="selecionar-todos-termos" />
      ),
      render: (termo) =>
        termo.status === 'pendente' &&
        semPropagar(
          <Checkbox
            checked={selecionados.has(termo.id)}
            onChange={() => alternarSelecao(termo.id)}
            id={`selecionar-${termo.id}`}
          />
        )
    },
    { key: 'id', label: 'Termo', render: (termo) => <strong>{termo.id}</strong> },
    {
      key: 'operacao',
      label: 'Operação',
      render: (termo) =>
        semPropagar(<LinkOperacao onClick={() => verOperacao(termo.operacaoId)}>{termo.operacaoId}</LinkOperacao>)
    },
    { key: 'criadoEm', label: 'Criado em', render: (termo) => formatDateTime(termo.criadoEm) },
    {
      key: 'criadoPor',
      label: 'Criado por',
      render: (termo) => (
        <>
          {termo.criadoPor.nome}
          <Papel>{termo.criadoPor.papel === 'aprovador' ? 'Aprovador' : 'Operador'}</Papel>
        </>
      )
    },
    { key: 'quantidadeTitulos', label: 'Títulos', align: 'right' },
    { key: 'bruto', label: 'Valor bruto', numeric: true, align: 'right', render: (termo) => formatCurrency(termo.valorBruto) },
    { key: 'liquido', label: 'Valor líquido', numeric: true, align: 'right', render: (termo) => formatCurrency(termo.valorLiquido) },
    {
      key: 'status',
      label: 'Status',
      render: (termo) => <StatusBadge tom={TOM_STATUS_TERMO[termo.status]}>{STATUS_TERMO_LABEL[termo.status]}</StatusBadge>
    },
    {
      key: 'acoes',
      label: '',
      align: 'right',
      render: (termo) => (
        <>
          {termo.status === 'pendente' &&
            semPropagar(
              <Button
                size="sm"
                disabled={!pode}
                title={pode ? undefined : MOTIVO_SEM_ALCADA}
                onClick={() => setAssinando([termo])}
                leftIcon={icone('pen-line')}
              >
                Assinar
              </Button>
            )}
          {termo.status === 'assinado' &&
            semPropagar(
              <Button size="sm" variant="secondary" onClick={() => setEvidencia(termo)} leftIcon={icone('file-text')}>
                Ver evidência
              </Button>
            )}
        </>
      )
    }
  ];

  const indicador = (rotulo, valor, detalhe) => (
    <Card padding={16}>
      <Indicador>
        <div className="rotulo">{rotulo}</div>
        <div className="valor">{valor}</div>
        {detalhe && <div className="detalhe">{detalhe}</div>}
      </Indicador>
    </Card>
  );

  const conteudo = () => {
    if (lista.carregando && !lista.dados) return <LoadingState linhas={6} />;
    if (lista.erro) return <ErrorState mensagem={lista.erro.message} onRetry={lista.recarregar} />;
    if (termos.length === 0) {
      return filtros.busca || filtros.status ? (
        <EmptyState
          titulo="Nenhum termo encontrado"
          descricao="Nenhum termo corresponde aos filtros."
          acaoLabel="Limpar filtros"
          onAcao={() => setFiltros(FILTROS_VAZIOS)}
          icone="search"
        />
      ) : (
        <EmptyState titulo="Nada a assinar" descricao="Os termos de cessão aparecem aqui assim que uma operação é contratada." />
      );
    }
    return (
      <>
        <BarraSelecao>
          <span>
            {selecionadosVisiveis.length > 0
              ? `${plural(selecionadosVisiveis.length, 'termo selecionado', 'termos selecionados')} · ${formatCurrency(soma(selecionadosVisiveis, 'valorLiquido'))} líquido`
              : `${plural(termos.length, 'termo', 'termos')} · selecione os pendentes para assinar em lote`}
          </span>
          <Button
            disabled={!pode || selecionadosVisiveis.length === 0}
            title={pode ? undefined : MOTIVO_SEM_ALCADA}
            onClick={() => setAssinando(selecionadosVisiveis)}
            leftIcon={icone('pen-line')}
          >
            Assinar selecionados ({selecionadosVisiveis.length})
          </Button>
        </BarraSelecao>
        <div style={{ overflowX: 'auto' }}>
          <Table columns={colunas} rows={termos} rowKey="id" dense onRowClick={aoClicarLinha} style={{ minWidth: 1080 }} />
        </div>
      </>
    );
  };

  return (
    <Container>
      <PageHeader>
        <h1>Contratos</h1>
        <p>Termos de cessão das suas operações. Assine os pendentes e consulte a evidência dos assinados.</p>
      </PageHeader>

      {todos.dados && (
        <Cards>
          {indicador(
            'Pendentes de assinatura',
            plural(pendentesTodos.length, 'termo', 'termos'),
            `${formatCurrency(soma(pendentesTodos, 'valorBruto'))} em valor bruto`
          )}
          {indicador('Assinados nos últimos 30 dias', plural(assinadosRecentes.length, 'termo', 'termos'))}
          {indicador(
            'Valor líquido aguardando assinatura',
            formatCurrency(soma(pendentesTodos, 'valorLiquido')),
            'A operação só segue depois da assinatura'
          )}
        </Cards>
      )}

      {usuario.dados && !pode && (
        <Alert kind="warning" title="Você não pode assinar termos" style={{ marginBottom: 16 }}>
          {MOTIVO_SEM_ALCADA} Peça a um usuário com papel de aprovador para assinar. Para testar, troque de usuário em
          “Entrar como…”, no menu do topo.
        </Alert>
      )}

      <Filtros>
        <SearchField
          value={filtros.busca}
          onChange={(valor) => atualizarFiltro('busca', valor)}
          placeholder="Termo ou operação"
          onClear={() => atualizarFiltro('busca', '')}
        />
        <Select
          label="Status"
          value={filtros.status}
          onChange={(valor) => atualizarFiltro('status', valor)}
          placeholder="Todos"
          options={Object.entries(STATUS_TERMO_LABEL).map(([value, label]) => ({ value, label }))}
        />
        <Button variant="secondary" onClick={() => setFiltros(FILTROS_VAZIOS)}>
          Limpar
        </Button>
      </Filtros>

      {conteudo()}

      {assinando && (
        <AssinaturaModal termos={assinando} onFechar={() => setAssinando(null)} onConcluido={recarregar} />
      )}
      {evidencia && <EvidenciaModal termo={evidencia} onFechar={() => setEvidencia(null)} onVerOperacao={verOperacao} />}
    </Container>
  );
};

export default Contratos;
