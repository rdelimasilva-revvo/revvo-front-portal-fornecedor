import React, { useState } from 'react';
import styled from 'styled-components';

import { Button, Card, Divider, Table } from '../../../ds';
import { formatCurrency, formatDate, formatPercent } from '../../../utils/format';

const Painel = styled.div`
  position: sticky;
  top: 72px;
  align-self: start;

  @media (max-width: 1100px) {
    position: static;
  }
`;

const Cabecalho = styled.div`
  h2 {
    font-size: var(--fs-h3);
    font-weight: var(--fw-semibold);
    margin: 0;
  }

  .subtitulo {
    font-size: var(--fs-caption);
    color: var(--text-muted);
    margin-top: 2px;
  }
`;

const Destaque = styled.div`
  background: var(--surface-sunken);
  border-radius: var(--radius-md);
  padding: 14px;

  .rotulo {
    font-size: 12px;
    color: var(--text-muted);
  }

  .valor {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 600;
    letter-spacing: -0.01em;
    font-variant-numeric: tabular-nums;
    margin-top: 2px;
  }

  .data {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 4px;
  }
`;

const Linha = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: var(--fs-body-sm);
  padding: 4px 0;

  .rotulo {
    color: var(--text-muted);
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .valor {
    font-weight: ${(props) => (props.$forte ? 600 : 500)};
    color: ${(props) => props.$cor || 'var(--text-strong)'};
    font-variant-numeric: tabular-nums;
  }
`;

const Vazio = styled.p`
  font-size: var(--fs-body-sm);
  color: var(--text-muted);
  margin: 0;
`;

const COLUNAS_DETALHE = [
  { key: 'numeroTitulo', label: 'Título' },
  { key: 'prazo', label: 'Prazo', render: (linha) => `${linha.prazoDias}d` },
  { key: 'bruto', label: 'Bruto', numeric: true, render: (linha) => formatCurrency(linha.valorBruto) },
  { key: 'liquido', label: 'Líquido', numeric: true, render: (linha) => formatCurrency(linha.valorLiquido) }
];

/**
 * Painel de simulação: recalcula a cada mudança de seleção e é o único caminho
 * para a contratação.
 */
const PainelSimulacao = ({ simulacao, onContratar }) => {
  const [detalheAberto, setDetalheAberto] = useState(false);
  const vazio = !simulacao || simulacao.quantidade === 0;

  return (
    <Painel as="aside" aria-label="Simulação da antecipação">
      <Card padding={20} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Cabecalho>
          <h2>Simulação</h2>
          <div className="subtitulo">
            {vazio ? 'Selecione os títulos que quer antecipar' : `${simulacao.quantidade} título(s) selecionado(s)`}
          </div>
        </Cabecalho>

        {vazio ? (
          <>
            <Vazio>
              O cálculo de taxa, IOF, tarifas e valor líquido aparece aqui assim que você marcar ao menos um título.
            </Vazio>
            <Button fullWidth disabled>
              Contratar
            </Button>
          </>
        ) : (
          <>
            <Destaque>
              <div className="rotulo">Valor líquido a receber</div>
              <div className="valor">{formatCurrency(simulacao.valorLiquido)}</div>
              <div className="data">Crédito previsto para {formatDate(simulacao.dataCredito)}</div>
            </Destaque>

            <div>
              <Linha>
                <span className="rotulo">Valor bruto</span>
                <span className="valor">{formatCurrency(simulacao.valorBruto)}</span>
              </Linha>
              <Linha>
                <span className="rotulo">Taxa</span>
                <span className="valor">{formatPercent(simulacao.taxaMensal)} a.m.</span>
              </Linha>
              <Linha>
                <span className="rotulo">Prazo médio</span>
                <span className="valor">{simulacao.prazoMedio} dias</span>
              </Linha>

              <Divider style={{ margin: '8px 0' }} />

              <Linha $cor="var(--danger-700)">
                <span className="rotulo">Desconto</span>
                <span className="valor">- {formatCurrency(simulacao.desconto)}</span>
              </Linha>
              <Linha $cor="var(--danger-700)">
                <span className="rotulo">
                  IOF
                  <i
                    data-lucide="info"
                    style={{ width: 13, height: 13 }}
                    title="IOF diário sobre o prazo de cada título mais IOF adicional."
                  />
                </span>
                <span className="valor">- {formatCurrency(simulacao.iof)}</span>
              </Linha>
              <Linha $cor="var(--danger-700)">
                <span className="rotulo">Tarifas</span>
                <span className="valor">- {formatCurrency(simulacao.tarifas)}</span>
              </Linha>

              <Divider style={{ margin: '8px 0' }} />

              <Linha $forte>
                <span className="rotulo">Valor líquido</span>
                <span className="valor">{formatCurrency(simulacao.valorLiquido)}</span>
              </Linha>
            </div>

            <Button
              variant="secondary"
              fullWidth
              onClick={() => setDetalheAberto(!detalheAberto)}
              aria-expanded={detalheAberto}
              rightIcon={
                <i data-lucide={detalheAberto ? 'chevron-up' : 'chevron-down'} style={{ width: 14, height: 14 }} />
              }
            >
              Breakdown por título
            </Button>

            {detalheAberto && (
              <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                <Table columns={COLUNAS_DETALHE} rows={simulacao.titulos} rowKey="recebivelId" dense />
              </div>
            )}

            <Button fullWidth onClick={onContratar}>
              Contratar
            </Button>
          </>
        )}
      </Card>
    </Painel>
  );
};

export default PainelSimulacao;
