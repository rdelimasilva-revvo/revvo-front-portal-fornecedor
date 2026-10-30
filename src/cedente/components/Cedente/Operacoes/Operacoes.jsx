import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { Button, Input, SearchField, Select, Table } from '../../../ds';
import { useRequisicao } from '../../../hooks/useRequisicao';
import { listarOperacoes, montarCsvOperacoes } from '../../../services/operacoesService';
import { formatCurrency, formatDate } from '../../../utils/format';
import { STATUS_OPERACAO_LABEL } from '../../../types/entities';
import StatusBadge, { TOM_STATUS_OPERACAO } from '../../Common/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../../Common/States';
import OperacaoDetalhe from './OperacaoDetalhe';

const Container = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
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

const Conteudo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Filtros = styled.div`
  display: grid;
  grid-template-columns: 1.4fr repeat(3, 1fr) auto;
  gap: 12px;
  padding: 16px;
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  align-items: end;

  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const BOM_UTF8 = String.fromCharCode(0xfeff);
const FILTROS_VAZIOS = { busca: '', status: '', de: '', ate: '' };

const Operacoes = ({ operacaoIdInicial, onNavegar }) => {
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS);
  const [operacaoAberta, setOperacaoAberta] = useState(operacaoIdInicial || null);

  useEffect(() => {
    setOperacaoAberta(operacaoIdInicial || null);
  }, [operacaoIdInicial]);

  const filtrosAplicados = useMemo(() => filtros, [filtros]);
  const { dados, carregando, erro, recarregar } = useRequisicao(
    () => listarOperacoes(filtrosAplicados),
    [JSON.stringify(filtrosAplicados)]
  );

  const operacoes = dados || [];

  const exportarCsv = () => {
    const conteudo = montarCsvOperacoes(operacoes);
    // BOM na frente para o Excel abrir o CSV em UTF-8 sem quebrar os acentos.
    const blob = new Blob([BOM_UTF8 + conteudo], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `operacoes-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const atualizarFiltro = (campo, valor) => setFiltros((atuais) => ({ ...atuais, [campo]: valor }));

  const colunas = [
    { key: 'id', label: 'Nº operação' },
    { key: 'data', label: 'Data', render: (linha) => formatDate(linha.dataCriacao) },
    { key: 'titulos', label: 'Títulos', numeric: true, render: (linha) => linha.titulos.length },
    { key: 'bruto', label: 'Valor bruto', numeric: true, render: (linha) => formatCurrency(linha.valorBruto) },
    { key: 'liquido', label: 'Valor líquido', numeric: true, render: (linha) => formatCurrency(linha.valorLiquido) },
    {
      key: 'status',
      label: 'Status',
      render: (linha) => (
        <StatusBadge tom={TOM_STATUS_OPERACAO[linha.status]}>{STATUS_OPERACAO_LABEL[linha.status]}</StatusBadge>
      )
    }
  ];

  if (operacaoAberta) {
    return <OperacaoDetalhe operacaoId={operacaoAberta} onVoltar={() => setOperacaoAberta(null)} />;
  }

  return (
    <Container>
      <PageHeader>
        <div>
          <h1>Operações</h1>
          <p>Acompanhe cada antecipação contratada, do envio à liquidação.</p>
        </div>
        <Button
          variant="secondary"
          onClick={exportarCsv}
          disabled={operacoes.length === 0}
          leftIcon={<i data-lucide="download" style={{ width: 16, height: 16 }} />}
        >
          Exportar CSV
        </Button>
      </PageHeader>

      <Conteudo>
        <Filtros>
          <SearchField
            value={filtros.busca}
            onChange={(valor) => atualizarFiltro('busca', valor)}
            placeholder="Número da operação ou sacado"
            onClear={() => atualizarFiltro('busca', '')}
          />

          <Select
            label="Status"
            value={filtros.status}
            onChange={(valor) => atualizarFiltro('status', valor)}
            placeholder="Todos"
            options={Object.entries(STATUS_OPERACAO_LABEL).map(([value, label]) => ({ value, label }))}
          />

          <Input
            label="Período de"
            type="date"
            value={filtros.de}
            onChange={(evento) => atualizarFiltro('de', evento.target.value)}
          />

          <Input
            label="Período até"
            type="date"
            value={filtros.ate}
            onChange={(evento) => atualizarFiltro('ate', evento.target.value)}
          />

          <Button variant="secondary" onClick={() => setFiltros(FILTROS_VAZIOS)}>
            Limpar
          </Button>
        </Filtros>

        {carregando && <LoadingState linhas={5} altura={40} label="Carregando operações" />}

        {erro && !carregando && (
          <ErrorState titulo="Não foi possível carregar as operações" mensagem={erro.message} onRetry={recarregar} />
        )}

        {!carregando && !erro && operacoes.length === 0 && (
          <EmptyState
            icone="folder-open"
            titulo="Nenhuma operação encontrada"
            descricao="Ajuste os filtros ou contrate sua primeira antecipação a partir dos recebíveis."
            acaoLabel="Ir para recebíveis"
            onAcao={() => onNavegar('recebiveis')}
          />
        )}

        {!carregando && !erro && operacoes.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <Table
              columns={colunas}
              rows={operacoes}
              rowKey="id"
              onRowClick={(operacao) => setOperacaoAberta(operacao.id)}
              style={{ minWidth: 820 }}
            />
          </div>
        )}
      </Conteudo>
    </Container>
  );
};

export default Operacoes;
