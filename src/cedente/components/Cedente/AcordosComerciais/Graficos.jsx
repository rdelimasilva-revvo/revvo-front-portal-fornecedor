import React from 'react';
import styled from 'styled-components';

// Gráficos de uma série só, numa cor só. O Chart do DS pinta cada barra de uma cor e não tem tooltip.

const Dica = styled.span`
  position: absolute;
  z-index: 2;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  background: var(--tooltip-bg, var(--dark-100));
  color: var(--tooltip-fg, #fff);
  font-size: 12px;
  line-height: 1.4;
  white-space: nowrap;
  box-shadow: var(--shadow-md);
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out);
`;

const Linhas = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;

  li {
    position: relative;
  }

  li:hover ${Dica} {
    opacity: 1;
  }

  .cabeca {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 13px;
    color: var(--text-body);
    margin-bottom: 6px;
  }

  .valor {
    font-weight: var(--fw-semibold);
    color: var(--text-strong);
    font-variant-numeric: tabular-nums;
  }

  .trilho {
    height: 10px;
    border-radius: 4px;
    background: var(--surface-sunken);
  }

  .barra {
    height: 100%;
    border-radius: 4px;
    background: var(--chart-1);
  }

  ${Dica} {
    top: -34px;
    right: 0;
  }
`;

/** Barras horizontais ordenadas: itens = [{ rotulo, valor, dica }]. */
export const BarrasHorizontais = ({ itens, formatar, descricao }) => {
  const maximo = Math.max(...itens.map((item) => item.valor), 1);
  return (
    <Linhas role="img" aria-label={descricao}>
      {itens.map((item) => (
        <li key={item.rotulo}>
          <div className="cabeca">
            <span>{item.rotulo}</span>
            <span className="valor">{formatar(item.valor)}</span>
          </div>
          <div className="trilho">
            <div className="barra" style={{ width: `${(item.valor / maximo) * 100}%` }} />
          </div>
          {item.dica && <Dica>{item.dica}</Dica>}
        </li>
      ))}
    </Linhas>
  );
};

const AREA = 160;

const Grade = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 12px;
  align-items: end;
  height: ${AREA + 44}px;
  border-bottom: 1px solid var(--chart-grid);

  .coluna {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    height: 100%;
  }

  .coluna:hover ${Dica} {
    opacity: 1;
  }

  .valor {
    font-size: 12px;
    font-weight: var(--fw-semibold);
    color: var(--text-strong);
    font-variant-numeric: tabular-nums;
    margin-bottom: 6px;
  }

  .barra {
    width: min(44px, 70%);
    border-radius: 4px 4px 0 0;
    background: var(--chart-1);
  }

  ${Dica} {
    bottom: calc(100% - 20px);
  }
`;

const Eixo = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 12px;
  margin-top: 8px;
  font-size: 12px;
  color: var(--chart-axis);
  text-align: center;
`;

/** Colunas por período: itens = [{ rotulo, valor, dica }]. */
export const Colunas = ({ itens, formatar, formatarCurto = formatar, descricao }) => {
  const maximo = Math.max(...itens.map((item) => item.valor), 1);
  return (
    <div role="img" aria-label={descricao}>
      <Grade>
        {itens.map((item) => (
          <div className="coluna" key={item.rotulo}>
            <span className="valor">{formatarCurto(item.valor)}</span>
            <div className="barra" style={{ height: Math.max((item.valor / maximo) * AREA, item.valor > 0 ? 4 : 0) }} />
            {item.dica && <Dica>{item.dica}</Dica>}
          </div>
        ))}
      </Grade>
      <Eixo>
        {itens.map((item) => (
          <span key={item.rotulo}>{item.rotulo}</span>
        ))}
      </Eixo>
    </div>
  );
};
