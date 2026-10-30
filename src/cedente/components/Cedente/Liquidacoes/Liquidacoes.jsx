import React, { useState } from 'react';
import styled from 'styled-components';

import { Button, Card, SearchField, Select, Table } from '../../../ds';
import { useRequisicao } from '../../../hooks/useRequisicao';
import { listarOperacoes } from '../../../services/operacoesService';
import { baixarCsv } from '../../../utils/exportacao';
import { daysUntil, formatCurrency, formatDate } from '../../../utils/format';
import StatusBadge from '../../Common/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../../Common/States';
import OperacaoDetalhe from '../Operacoes/OperacaoDetalhe';
import TratarTitulo from './TratarTitulo';

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
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
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
  grid-template-columns: 2fr 1fr;
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

// Antecipada = o valor líquido já foi creditado ao cedente.
const STATUS_ANTECIPADA = ['credito', 'liquidada'];

const SITUACOES = {
  liquidado: { label: 'Liquidado', tom: 'verde' },
  a_vencer: { label: 'A vencer', tom: 'azul' },
  vencido: { label: 'Vencido', tom: 'vermelho' },
  em_cobranca: { label: 'Em cobrança', tom: 'amarelo' },
  recomprado: { label: 'Recomprado', tom: 'neutro' }
};

const TRATAVEIS = ['vencido', 'em_cobranca'];

// A tratativa do título vem antes do status da operação: uma recompra também liquida a operação.
const situacaoDo = (operacao, titulo) => {
  if (titulo.status === 'Recomprado') return 'recomprado';
  if (titulo.status === 'Em cobrança') return 'em_cobranca';
  if (titulo.status === 'Liquidado' || operacao.status === 'liquidada') return 'liquidado';
  return daysUntil(titulo.vencimento) < 0 ? 'vencido' : 'a_vencer';
};

const somar = (titulos, situacoes) => {
  const daSituacao = titulos.filter((titulo) => situacoes.includes(titulo.situacao));
  return { total: daSituacao.reduce((soma, titulo) => soma + titulo.valorBruto, 0), quantidade: daSituacao.length };
};

const Liquidacoes = ({ onNavegar }) => {
  const [busca, setBusca] = useState('');
  const [situacao, setSituacao] = useState('');
  const [operacaoAberta, setOperacaoAberta] = useState(null);
  const [tratando, setTratando] = useState(null);

  const { dados, carregando, erro, recarregar } = useRequisicao(() => listarOperacoes(), []);

  if (operacaoAberta) {
    return (
      <OperacaoDetalhe
        operacaoId={operacaoAberta}
        onVoltar={() => setOperacaoAberta(null)}
        rotuloVoltar="Voltar para liquidações"
      />
    );
  }

  const titulos = (dados || [])
    .filter((operacao) => STATUS_ANTECIPADA.includes(operacao.status))
    .flatMap((operacao) =>
      operacao.titulos.map((titulo) => ({
        ...titulo,
        chave: `${operacao.id}-${titulo.recebivelId}`,
        operacaoId: operacao.id,
        dataAntecipacao: operacao.dataCriacao,
        situacao: situacaoDo(operacao, titulo)
      }))
    )
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento));

  const termo = busca.trim().toLowerCase();
  const filtrados = titulos.filter(
    (titulo) =>
      (!situacao || titulo.situacao === situacao) &&
      (!termo || `${titulo.numeroTitulo} ${titulo.sacado.nome} ${titulo.operacaoId}`.toLowerCase().includes(termo))
  );

  const colunas = [
    { key: 'numeroTitulo', label: 'Título' },
    { key: 'sacado', label: 'Sacado', render: (linha) => linha.sacado.nome },
    { key: 'operacaoId', label: 'Operação' },
    { key: 'antecipacao', label: 'Antecipado em', render: (linha) => formatDate(linha.dataAntecipacao) },
    { key: 'vencimento', label: 'Vencimento', render: (linha) => formatDate(linha.vencimento) },
    { key: 'bruto', label: 'Valor do título', numeric: true, align: 'right', render: (linha) => formatCurrency(linha.valorBruto) },
    { key: 'liquido', label: 'Valor antecipado', numeric: true, align: 'right', render: (linha) => formatCurrency(linha.valorLiquido) },
    {
      key: 'situacao',
      label: 'Situação',
      render: (linha) => (
        <>
          <StatusBadge tom={SITUACOES[linha.situacao].tom}>{SITUACOES[linha.situacao].label}</StatusBadge>
          {linha.status === 'Prorrogado' && (
            <span style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Prorrogado</span>
          )}
        </>
      )
    },
    {
      key: 'acoes',
      label: 'Ações',
      render: (linha) =>
        TRATAVEIS.includes(linha.situacao) ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={(evento) => {
              evento.stopPropagation();
              setTratando(linha);
            }}
          >
            Tratar
          </Button>
        ) : null
    }
  ];

  const exportar = () =>
    baixarCsv(
      'liquidacoes',
      [
        { rotulo: 'Título', valor: (linha) => linha.numeroTitulo },
        { rotulo: 'Sacado', valor: (linha) => linha.sacado.nome },
        { rotulo: 'Operação', valor: (linha) => linha.operacaoId },
        { rotulo: 'Antecipado em', valor: (linha) => formatDate(linha.dataAntecipacao) },
        { rotulo: 'Vencimento', valor: (linha) => formatDate(linha.vencimento) },
        { rotulo: 'Valor do título', valor: (linha) => linha.valorBruto },
        { rotulo: 'Valor antecipado', valor: (linha) => linha.valorLiquido },
        { rotulo: 'Situação', valor: (linha) => SITUACOES[linha.situacao].label + (linha.status === 'Prorrogado' ? ' (prorrogado)' : '') }
      ],
      filtrados
    );

  const indicador = (rotulo, chaves) => {
    const { total, quantidade } = somar(titulos, chaves);
    return (
      <Card padding={16}>
        <Indicador>
          <div className="rotulo">{rotulo}</div>
          <div className="valor">{formatCurrency(total)}</div>
          <div className="contagem">{quantidade} {quantidade === 1 ? 'título' : 'títulos'}</div>
        </Indicador>
      </Card>
    );
  };

  return (
    <Container>
      <PageHeader>
        <div>
          <h1>Liquidações</h1>
          <p>Títulos antecipados e o pagamento de cada um pelo sacado. Clique em um título para ver os detalhes.</p>
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

      {carregando && <LoadingState linhas={5} altura={40} label="Carregando liquidações" />}

      {erro && !carregando && (
        <ErrorState titulo="Não foi possível carregar as liquidações" mensagem={erro.message} onRetry={recarregar} />
      )}

      {!carregando && !erro && (
        <>
          <Cards>
            {indicador('Liquidado', ['liquidado'])}
            {indicador('A vencer', ['a_vencer'])}
            {indicador('Vencido ou em cobrança', TRATAVEIS)}
            {indicador('Recomprado', ['recomprado'])}
          </Cards>

          <Filtros>
            <SearchField
              value={busca}
              onChange={setBusca}
              placeholder="Título, sacado ou operação"
              onClear={() => setBusca('')}
            />
            <Select
              label="Situação"
              value={situacao}
              onChange={setSituacao}
              placeholder="Todas"
              options={Object.entries(SITUACOES).map(([value, { label }]) => ({ value, label }))}
            />
          </Filtros>

          {filtrados.length === 0 ? (
            <EmptyState
              icone="folder-open"
              titulo="Nenhum título encontrado"
              descricao="Ajuste a busca ou a situação para ver os títulos antecipados."
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <Table
                columns={colunas}
                rows={filtrados}
                rowKey="chave"
                onRowClick={(titulo) => setOperacaoAberta(titulo.operacaoId)}
                style={{ minWidth: 1080 }}
              />
            </div>
          )}

          {tratando && (
            <TratarTitulo
              titulo={tratando}
              onNavegar={onNavegar}
              onFechar={() => setTratando(null)}
              onConcluir={() => {
                setTratando(null);
                recarregar();
              }}
            />
          )}
        </>
      )}
    </Container>
  );
};

export default Liquidacoes;
