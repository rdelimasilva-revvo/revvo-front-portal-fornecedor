import React, { useState } from 'react';
import styled from 'styled-components';

import { Button, Card, Input, SearchField, Select, Table } from '../../../ds';
import { useRequisicao } from '../../../hooks/useRequisicao';
import { listarLancamentos } from '../../../services/operacoesService';
import { abrirDocumento, baixarCsv } from '../../../utils/exportacao';
import { TIMEZONE, formatCurrency, formatDateTime } from '../../../utils/format';
import StatusBadge from '../../Common/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../../Common/States';

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
  align-items: flex-start;
  justify-content: space-between;
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

  .contagem {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 2px;
  }
`;

const Filtros = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 2fr;
  gap: 12px;
  padding: 16px;
  margin-bottom: 12px;
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  align-items: end;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Valor = styled.span`
  font-variant-numeric: tabular-nums;
  color: ${({ $debito }) => ($debito ? 'var(--text-danger)' : 'inherit')};
`;

const TIPOS = {
  antecipacao: { label: 'Antecipação', tom: 'verde' },
  recompra: { label: 'Recompra', tom: 'neutro' },
  tarifa: { label: 'Tarifa', tom: 'amarelo' }
};

// O período é filtrado pelo dia em São Paulo, não pelo dia em UTC.
const diaLocal = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE });

const valorComSinal = (lancamento) =>
  `${lancamento.natureza === 'debito' ? '-' : ''}${formatCurrency(lancamento.valor)}`;

const quantos = (n) => `${n} ${n === 1 ? 'lançamento' : 'lançamentos'}`;

const abrirComprovante = (lancamento) =>
  abrirDocumento({
    titulo: 'Comprovante de lançamento',
    subtitulo: 'Conta de antecipação',
    campos: [
      ['Lançamento', lancamento.id],
      ['Data e hora', formatDateTime(lancamento.dataHora)],
      ['Descrição', lancamento.descricao],
      ['Tipo', TIPOS[lancamento.tipo].label],
      ['Natureza', lancamento.natureza === 'credito' ? 'Crédito' : 'Débito'],
      ['Valor', valorComSinal(lancamento)],
      ['Operação', lancamento.operacaoId]
    ]
  });

const Extrato = ({ onNavegar }) => {
  const [de, setDe] = useState('');
  const [ate, setAte] = useState('');
  const [tipo, setTipo] = useState('');
  const [busca, setBusca] = useState('');

  const { dados, carregando, erro, recarregar } = useRequisicao(() => listarLancamentos(), []);

  const termo = busca.trim().toLowerCase();
  const filtrados = (dados || []).filter((lancamento) => {
    const data = diaLocal.format(new Date(lancamento.dataHora));
    return (
      (!de || data >= de) &&
      (!ate || data <= ate) &&
      (!tipo || lancamento.tipo === tipo) &&
      (!termo || `${lancamento.descricao} ${lancamento.operacaoId}`.toLowerCase().includes(termo))
    );
  });

  const somar = (natureza) => {
    const daNatureza = filtrados.filter((lancamento) => lancamento.natureza === natureza);
    return { total: daNatureza.reduce((soma, lancamento) => soma + lancamento.valor, 0), quantidade: daNatureza.length };
  };
  const creditos = somar('credito');
  const debitos = somar('debito');
  const saldo = creditos.total - debitos.total;

  const exportar = () =>
    baixarCsv(
      'extrato',
      [
        { rotulo: 'Data e hora', valor: (linha) => formatDateTime(linha.dataHora) },
        { rotulo: 'Descrição', valor: (linha) => linha.descricao },
        { rotulo: 'Operação', valor: (linha) => linha.operacaoId },
        { rotulo: 'Tipo', valor: (linha) => TIPOS[linha.tipo].label },
        { rotulo: 'Valor', valor: (linha) => (linha.natureza === 'debito' ? -linha.valor : linha.valor) }
      ],
      filtrados
    );

  const colunas = [
    { key: 'dataHora', label: 'Data e hora', render: (linha) => formatDateTime(linha.dataHora) },
    { key: 'descricao', label: 'Descrição' },
    {
      key: 'operacaoId',
      label: 'Operação',
      render: (linha) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onNavegar?.('operacoes', { operacaoId: linha.operacaoId })}
          style={{ padding: '0 6px' }}
        >
          {linha.operacaoId}
        </Button>
      )
    },
    {
      key: 'tipo',
      label: 'Tipo',
      render: (linha) => <StatusBadge tom={TIPOS[linha.tipo].tom}>{TIPOS[linha.tipo].label}</StatusBadge>
    },
    {
      key: 'valor',
      label: 'Valor',
      numeric: true,
      align: 'right',
      render: (linha) => <Valor $debito={linha.natureza === 'debito'}>{valorComSinal(linha)}</Valor>
    },
    {
      key: 'acoes',
      label: 'Ações',
      render: (linha) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => abrirComprovante(linha)}
          leftIcon={<i data-lucide="file-text" style={{ width: 14, height: 14 }} />}
          style={{ padding: '0 6px' }}
        >
          Comprovante
        </Button>
      )
    }
  ];

  const indicador = (rotulo, valor, contagem, debito) => (
    <Card padding={16}>
      <Indicador>
        <div className="rotulo">{rotulo}</div>
        <div className="valor">
          <Valor $debito={debito}>{valor}</Valor>
        </div>
        <div className="contagem">{contagem}</div>
      </Indicador>
    </Card>
  );

  return (
    <Container>
      <PageHeader>
        <div>
          <h1>Extrato</h1>
          <p>Conta de antecipação: créditos das antecipações, recompras e tarifas.</p>
        </div>
        {!carregando && !erro && (
          <Button
            variant="secondary"
            onClick={exportar}
            disabled={filtrados.length === 0}
            leftIcon={<i data-lucide="download" style={{ width: 14, height: 14 }} />}
          >
            Exportar CSV
          </Button>
        )}
      </PageHeader>

      {carregando && <LoadingState linhas={5} altura={40} label="Carregando extrato" />}

      {erro && !carregando && (
        <ErrorState titulo="Não foi possível carregar o extrato" mensagem={erro.message} onRetry={recarregar} />
      )}

      {!carregando && !erro && (
        <>
          <Cards>
            {indicador('Créditos', formatCurrency(creditos.total), quantos(creditos.quantidade))}
            {indicador('Débitos', `-${formatCurrency(debitos.total)}`, quantos(debitos.quantidade), debitos.total > 0)}
            {indicador('Saldo do período', `${saldo < 0 ? '-' : ''}${formatCurrency(Math.abs(saldo))}`, 'Créditos menos débitos', saldo < 0)}
          </Cards>

          <Filtros>
            <Input label="De" type="date" value={de} onChange={(e) => setDe(e.target.value)} />
            <Input label="Até" type="date" value={ate} onChange={(e) => setAte(e.target.value)} />
            <Select
              label="Tipo"
              value={tipo}
              onChange={setTipo}
              placeholder="Todos"
              options={Object.entries(TIPOS).map(([value, { label }]) => ({ value, label }))}
            />
            <SearchField value={busca} onChange={setBusca} placeholder="Descrição ou operação" onClear={() => setBusca('')} />
          </Filtros>

          {filtrados.length === 0 ? (
            <EmptyState
              icone="receipt"
              titulo="Nenhum lançamento encontrado"
              descricao={
                dados?.length
                  ? 'Ajuste o período, o tipo ou a busca.'
                  : 'Os lançamentos aparecem aqui depois do crédito da primeira antecipação.'
              }
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <Table columns={colunas} rows={filtrados} rowKey="id" style={{ minWidth: 960 }} />
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default Extrato;
