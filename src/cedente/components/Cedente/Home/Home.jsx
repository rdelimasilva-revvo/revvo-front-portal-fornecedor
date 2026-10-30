import React from 'react';
import styled from 'styled-components';

import { Button, Card, Table } from '../../../ds';
import { useRequisicao } from '../../../hooks/useRequisicao';
import { obterResumo } from '../../../services/operacoesService';
import { listarNotificacoes } from '../../../services/notificacoesService';
import { formatCurrency, formatDate, formatDateTime } from '../../../utils/format';
import { STATUS_OPERACAO_LABEL } from '../../../types/entities';
import StatusBadge, { TOM_STATUS_OPERACAO } from '../../Common/StatusBadge';
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
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;

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

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Cards = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const BarraLimite = styled.div`
  height: 6px;
  border-radius: var(--radius-pill);
  background: var(--surface-sunken);
  margin-top: 12px;
  overflow: hidden;

  span {
    display: block;
    height: 100%;
    background: var(--revvo-blue-500);
  }
`;

const CabecalhoSecao = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;

  h2 {
    font-size: var(--fs-h3);
    font-weight: var(--fw-semibold);
    margin: 0;
  }
`;

const Secao = styled.section`
  margin-bottom: 20px;
`;

const Alerta = styled.button`
  display: flex;
  width: 100%;
  height: auto;
  text-align: left;
  gap: 12px;
  align-items: flex-start;
  padding: 14px;
  border: 1px solid var(--border-subtle);
  border-left: 3px solid ${(props) => props.$cor};
  border-radius: var(--radius-md);
  background: var(--surface-card);
  cursor: pointer;

  & + & {
    margin-top: 8px;
  }

  &:hover {
    background: var(--surface-hover);
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }

  .titulo {
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-semibold);
    color: var(--text-strong);
  }

  .mensagem {
    font-size: var(--fs-caption);
    color: var(--text-muted);
    margin-top: 2px;
    white-space: normal;
  }

  .quando {
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 6px;
  }
`;

/**
 * Card de resumo com o desenho do StatCard do DS, mas com uma linha de apoio
 * em texto no lugar do delta percentual — que não se aplica a limite e prazos.
 */
const CardResumo = ({ rotulo, icone, valor, tomValor, children }) => (
  <Card padding={20} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>{rotulo}</span>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 34,
          height: 34,
          borderRadius: 'var(--radius-sm)',
          background: 'var(--accent-soft-bg)',
          color: 'var(--accent-soft-fg)'
        }}
      >
        <i data-lucide={icone} style={{ width: 18, height: 18 }} />
      </span>
    </div>
    <span
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: 28,
        fontWeight: 600,
        letterSpacing: '-0.01em',
        fontVariantNumeric: 'tabular-nums',
        color: tomValor || 'var(--text-strong)'
      }}
    >
      {valor}
    </span>
    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{children}</div>
  </Card>
);

const COR_ALERTA = {
  operacao_recusada: 'var(--danger-500)',
  registro_pendente: 'var(--warning-500)',
  titulo_vencido: 'var(--warning-500)',
  credito_realizado: 'var(--revvo-green-400)',
  operacao_aprovada: 'var(--revvo-blue-500)'
};

const ICONE_ALERTA = {
  operacao_recusada: 'circle-x',
  registro_pendente: 'clock',
  titulo_vencido: 'calendar-clock',
  credito_realizado: 'circle-check',
  operacao_aprovada: 'send'
};

const COLUNAS_OPERACOES = [
  { key: 'id', label: 'Operação' },
  { key: 'data', label: 'Data', render: (linha) => formatDate(linha.dataCriacao) },
  { key: 'titulos', label: 'Títulos', numeric: true, render: (linha) => linha.titulos.length },
  { key: 'liquido', label: 'Valor líquido', numeric: true, render: (linha) => formatCurrency(linha.valorLiquido) },
  {
    key: 'status',
    label: 'Status',
    render: (linha) => (
      <StatusBadge tom={TOM_STATUS_OPERACAO[linha.status]}>{STATUS_OPERACAO_LABEL[linha.status]}</StatusBadge>
    )
  }
];

const Home = ({ onNavegar }) => {
  const resumo = useRequisicao(() => obterResumo(), []);
  const notificacoes = useRequisicao(() => listarNotificacoes(), []);

  const alertas = (notificacoes.dados || []).filter((notificacao) => !notificacao.lida);

  return (
    <Container>
      <PageHeader>
        <div>
          <h1>Home</h1>
          <p>Acompanhe seu limite, suas operações em andamento e o que precisa de atenção.</p>
        </div>
        <Button
          onClick={() => onNavegar('recebiveis')}
          leftIcon={<i data-lucide="zap" style={{ width: 16, height: 16 }} />}
        >
          Antecipar recebíveis
        </Button>
      </PageHeader>

      {resumo.carregando && <LoadingState linhas={3} altura={90} label="Carregando resumo" />}

      {resumo.erro && (
        <ErrorState
          titulo="Não foi possível carregar o resumo"
          mensagem={resumo.erro.message}
          onRetry={resumo.recarregar}
        />
      )}

      {resumo.dados && !resumo.carregando && !resumo.erro && (
        <>
          <Cards>
            <CardResumo rotulo="Limite disponível" icone="wallet" valor={formatCurrency(resumo.dados.limite.disponivel)}>
              {formatCurrency(resumo.dados.limite.utilizado)} utilizados de {formatCurrency(resumo.dados.limite.total)}
              <BarraLimite>
                <span
                  style={{
                    width: `${Math.min((resumo.dados.limite.utilizado / resumo.dados.limite.total) * 100, 100)}%`
                  }}
                />
              </BarraLimite>
            </CardResumo>

            <CardResumo
              rotulo="Operações em andamento"
              icone="activity"
              valor={formatCurrency(resumo.dados.emAndamento.valor)}
            >
              {resumo.dados.emAndamento.quantidade}{' '}
              {resumo.dados.emAndamento.quantidade === 1 ? 'operação' : 'operações'} aguardando conclusão
            </CardResumo>

            <CardResumo
              rotulo="Próximas liquidações (7 dias)"
              icone="calendar-check"
              valor={formatCurrency(
                resumo.dados.proximasLiquidacoes.reduce((total, titulo) => total + titulo.valorBruto, 0)
              )}
            >
              {resumo.dados.proximasLiquidacoes.length}{' '}
              {resumo.dados.proximasLiquidacoes.length === 1 ? 'título a vencer' : 'títulos a vencer'}
            </CardResumo>

            <CardResumo
              rotulo="Alertas pendentes"
              icone="bell-ring"
              valor={notificacoes.carregando ? '—' : String(alertas.length)}
              tomValor={alertas.length > 0 ? 'var(--danger-700)' : undefined}
            >
              {alertas.length === 0 ? 'Nada exigindo sua atenção' : 'Avisos não lidos na central'}
            </CardResumo>
          </Cards>

          <Secao>
            <CabecalhoSecao>
              <h2>Últimas operações</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavegar('operacoes')}
                rightIcon={<i data-lucide="arrow-right" style={{ width: 14, height: 14 }} />}
              >
                Ver todas
              </Button>
            </CabecalhoSecao>

            {resumo.dados.ultimasOperacoes.length === 0 ? (
              <Card>
                <EmptyState
                  titulo="Nenhuma operação ainda"
                  descricao="Importe seus recebíveis e contrate a primeira antecipação."
                  acaoLabel="Antecipar recebíveis"
                  onAcao={() => onNavegar('recebiveis')}
                />
              </Card>
            ) : (
              <Table
                columns={COLUNAS_OPERACOES}
                rows={resumo.dados.ultimasOperacoes}
                rowKey="id"
                dense
                onRowClick={(operacao) => onNavegar('operacoes', { operacaoId: operacao.id })}
              />
            )}
          </Secao>
        </>
      )}

      <Secao>
        <CabecalhoSecao>
          <h2>Alertas</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavegar('notificacoes')}
            rightIcon={<i data-lucide="arrow-right" style={{ width: 14, height: 14 }} />}
          >
            Central de notificações
          </Button>
        </CabecalhoSecao>

        {notificacoes.carregando && <LoadingState linhas={2} altura={56} label="Carregando alertas" />}

        {notificacoes.erro && <ErrorState mensagem={notificacoes.erro.message} onRetry={notificacoes.recarregar} />}

        {notificacoes.dados && !notificacoes.carregando && !notificacoes.erro && alertas.length === 0 && (
          <Card>
            <EmptyState
              icone="check-check"
              titulo="Sem alertas pendentes"
              descricao="Você está em dia com as suas operações."
            />
          </Card>
        )}

        {!notificacoes.carregando &&
          !notificacoes.erro &&
          alertas.slice(0, 3).map((alerta) => (
            <Alerta
              key={alerta.id}
              $cor={COR_ALERTA[alerta.evento] || 'var(--revvo-blue-500)'}
              onClick={() =>
                alerta.operacaoId
                  ? onNavegar('operacoes', { operacaoId: alerta.operacaoId })
                  : onNavegar('notificacoes')
              }
            >
              <i
                data-lucide={ICONE_ALERTA[alerta.evento] || 'info'}
                style={{ width: 18, height: 18, color: COR_ALERTA[alerta.evento], flex: 'none', marginTop: 2 }}
              />
              <span style={{ flex: 1 }}>
                <span className="titulo" style={{ display: 'block' }}>
                  {alerta.titulo}
                </span>
                <span className="mensagem" style={{ display: 'block' }}>
                  {alerta.mensagem}
                </span>
                <span className="quando" style={{ display: 'block' }}>
                  {formatDateTime(alerta.dataHora)}
                </span>
              </span>
            </Alerta>
          ))}
      </Secao>
    </Container>
  );
};

export default Home;
