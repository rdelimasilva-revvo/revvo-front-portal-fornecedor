import React from 'react';
import styled from 'styled-components';

import { Alert, Button, Card, Stepper, Table } from '../../../ds';
import { useRequisicao } from '../../../hooks/useRequisicao';
import { obterOperacao } from '../../../services/operacoesService';
import { abrirDocumento } from '../../../utils/exportacao';
import { formatCNPJ, formatCurrency, formatDate, formatDateTime, formatPercent } from '../../../utils/format';
import { STATUS_OPERACAO_LABEL } from '../../../types/entities';
import StatusBadge, { TOM_STATUS_OPERACAO } from '../../Common/StatusBadge';
import { ErrorState, LoadingState } from '../../Common/States';

const Container = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Cabecalho = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin: 12px 0 20px;

  h1 {
    font-size: var(--fs-h2);
    font-weight: var(--fw-display);
    letter-spacing: -0.02em;
    margin: 0;
  }

  p {
    font-size: var(--fs-caption);
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
`;

const Secao = styled.section`
  margin-bottom: 16px;

  h2 {
    font-size: var(--fs-h3);
    font-weight: var(--fw-semibold);
    margin: 0 0 14px;
  }

  .rolagem {
    overflow-x: auto;
  }
`;

const DescricaoEtapa = styled.div`
  .motivo {
    color: var(--danger-700);
    margin-top: 4px;
  }
`;

const SITUACAO_ATIVA = ['em_andamento', 'recusada'];

const OperacaoDetalhe = ({ operacaoId, onVoltar, rotuloVoltar = 'Voltar para operações' }) => {
  const { dados, carregando, erro, recarregar } = useRequisicao(() => obterOperacao(operacaoId), [operacaoId]);

  if (carregando) {
    return (
      <Container>
        <LoadingState linhas={5} altura={60} label="Carregando operação" />
      </Container>
    );
  }

  if (erro) {
    return (
      <Container>
        <ErrorState titulo="Não foi possível carregar a operação" mensagem={erro.message} onRetry={recarregar} />
      </Container>
    );
  }

  const operacao = dados;

  const indiceAtivo = Math.max(
    operacao.etapas.findIndex((etapa) => SITUACAO_ATIVA.includes(etapa.situacao)),
    operacao.etapas.filter((etapa) => etapa.situacao === 'concluida').length - 1
  );

  const passos = operacao.etapas.map((etapa) => ({
    label: etapa.nome,
    date: etapa.dataHora ? formatDateTime(etapa.dataHora) : etapa.situacao === 'em_andamento' ? 'Em andamento' : '—',
    description: (
      <DescricaoEtapa>
        {etapa.evidenciaUrl && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              abrirDocumento({
                titulo: etapa.evidenciaLabel,
                subtitulo: `Operação ${operacao.id} · ${etapa.nome}`,
                campos: [
                  ['Operação', operacao.id],
                  ['Etapa', etapa.nome],
                  ['Data e hora', formatDateTime(etapa.dataHora)],
                  ['Evidência', etapa.evidenciaLabel],
                  ['Títulos', operacao.titulos.map((titulo) => titulo.numeroTitulo).join(', ')],
                  ['Valor bruto', formatCurrency(operacao.valorBruto)],
                  ['Valor líquido', formatCurrency(operacao.valorLiquido)],
                  ['Taxa mensal', formatPercent(operacao.taxaMensal)]
                ]
              })
            }
            leftIcon={<i data-lucide="download" style={{ width: 13, height: 13 }} />}
            style={{ padding: '0 6px', height: 26, fontSize: 12 }}
          >
            {etapa.evidenciaLabel}
          </Button>
        )}
        {etapa.motivo && <div className="motivo">{etapa.motivo}</div>}
      </DescricaoEtapa>
    )
  }));

  const colunasTitulos = [
    { key: 'numeroTitulo', label: 'Título' },
    { key: 'sacado', label: 'Sacado', render: (linha) => linha.sacado.nome },
    { key: 'cnpj', label: 'CNPJ', render: (linha) => formatCNPJ(linha.sacado.cnpj) },
    { key: 'vencimento', label: 'Vencimento', render: (linha) => formatDate(linha.vencimento) },
    { key: 'bruto', label: 'Valor bruto', numeric: true, render: (linha) => formatCurrency(linha.valorBruto) },
    { key: 'liquido', label: 'Valor líquido', numeric: true, render: (linha) => formatCurrency(linha.valorLiquido) },
    {
      key: 'status',
      label: 'Status',
      render: (linha) => (
        <span title={linha.motivo || undefined}>
          {linha.status}
          {linha.motivo && (
            <span style={{ display: 'block', fontSize: 12, color: 'var(--danger-700)' }}>{linha.motivo}</span>
          )}
        </span>
      )
    }
  ];

  return (
    <Container>
      <Button
        variant="ghost"
        size="sm"
        onClick={onVoltar}
        leftIcon={<i data-lucide="arrow-left" style={{ width: 14, height: 14 }} />}
        style={{ padding: '0 6px' }}
      >
        {rotuloVoltar}
      </Button>

      <Cabecalho>
        <div>
          <h1>Operação {operacao.id}</h1>
          <p>Contratada em {formatDateTime(operacao.dataCriacao)}</p>
        </div>
        <StatusBadge tom={TOM_STATUS_OPERACAO[operacao.status]}>
          {STATUS_OPERACAO_LABEL[operacao.status]}
        </StatusBadge>
      </Cabecalho>

      {operacao.motivoRecusa && (
        <Alert kind="danger" title="Operação recusada" style={{ marginBottom: 16 }}>
          {operacao.motivoRecusa}
        </Alert>
      )}

      <Cards>
        <Card padding={16}>
          <Indicador>
            <div className="rotulo">Títulos</div>
            <div className="valor">{operacao.titulos.length}</div>
          </Indicador>
        </Card>
        <Card padding={16}>
          <Indicador>
            <div className="rotulo">Valor bruto</div>
            <div className="valor">{formatCurrency(operacao.valorBruto)}</div>
          </Indicador>
        </Card>
        <Card padding={16}>
          <Indicador>
            <div className="rotulo">Valor líquido</div>
            <div className="valor">{formatCurrency(operacao.valorLiquido)}</div>
          </Indicador>
        </Card>
        <Card padding={16}>
          <Indicador>
            <div className="rotulo">Taxa</div>
            <div className="valor">{formatPercent(operacao.taxaMensal)}</div>
          </Indicador>
        </Card>
      </Cards>

      <Secao>
        <Card padding={20}>
          <h2>Acompanhamento</h2>
          <div style={{ overflowX: 'auto' }}>
            <Stepper variant="timeline" steps={passos} activeStep={Math.max(indiceAtivo, 0)} style={{ minWidth: 760 }} />
          </div>
        </Card>
      </Secao>

      <Secao>
        <h2>Títulos da operação</h2>
        <div className="rolagem">
          <Table columns={colunasTitulos} rows={operacao.titulos} rowKey="recebivelId" dense />
        </div>
      </Secao>
    </Container>
  );
};

export default OperacaoDetalhe;
