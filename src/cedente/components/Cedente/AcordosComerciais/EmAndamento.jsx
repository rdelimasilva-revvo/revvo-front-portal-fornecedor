import React, { useState } from 'react';
import styled from 'styled-components';

import { Badge, Button, Card, Modal } from '../../../ds';
import { formatCurrency, formatDate } from '../../../utils/format';
import { EmptyState } from '../../Common/States';
import { MOTIVOS } from '../../../mocks/acordosData';

export const Secao = styled.section`
  margin-bottom: 24px;

  h2 {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--fs-h3);
    font-weight: var(--fw-semibold);
    margin: 0 0 12px;
  }

  .lista {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .rolagem {
    overflow-x: auto;
  }
`;

const Pendente = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;

  @media (max-width: 900px) {
    flex-direction: column;
  }

  .corpo {
    flex: 1;
    min-width: 0;
  }

  .titulo {
    font-weight: var(--fw-semibold);
    color: var(--text-strong);
  }

  .subtitulo {
    font-size: 13px;
    color: var(--text-muted);
    margin-top: 2px;
  }

  dl {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin: 16px 0;

    @media (max-width: 600px) {
      grid-template-columns: 1fr;
    }
  }

  dt {
    font-size: 12px;
    color: var(--text-muted);
  }

  dd {
    margin: 2px 0 0;
    font-weight: var(--fw-semibold);
    font-variant-numeric: tabular-nums;
  }

  .desconto {
    color: var(--text-danger);
  }

  .justificativa {
    font-size: 13px;
    color: var(--text-body);
    padding: 12px 16px;
    background: var(--surface-sunken);
    border-radius: var(--radius-md);
  }

  .acoes {
    display: flex;
    gap: 8px;
  }
`;

const icone = (nome) => <i data-lucide={nome} style={{ width: 14, height: 14 }} />;

const EmAndamento = ({ pendentes, onDecidir }) => {
  const [rejeicaoDe, setRejeicaoDe] = useState(null);

  const confirmarRejeicao = () => {
    onDecidir(rejeicaoDe, 'rejeitado');
    setRejeicaoDe(null);
  };

  return (
    <Secao>
      <h2>
        Aguardando o seu aceite
        <Badge tone="neutral">{pendentes.length}</Badge>
      </h2>

      {pendentes.length === 0 ? (
        <Card padding={0}>
          <EmptyState
            icone="circle-check"
            titulo="Nenhum abatimento pendente"
            descricao="Todos os abatimentos solicitados já foram revisados."
          />
        </Card>
      ) : (
        <div className="lista">
          {pendentes.map((abatimento) => (
            <Card key={abatimento.id} padding={20}>
              <Pendente>
                <div className="corpo">
                  <div className="titulo">{abatimento.notaFiscal}</div>
                  <div className="subtitulo">
                    {abatimento.cliente} · Duplicata {abatimento.duplicata} · {formatDate(abatimento.data)} ·{' '}
                    {MOTIVOS[abatimento.motivo]}
                  </div>
                  <dl>
                    <div>
                      <dt>Valor original</dt>
                      <dd>{formatCurrency(abatimento.valorOriginal)}</dd>
                    </div>
                    <div>
                      <dt>Abatimento solicitado</dt>
                      <dd className="desconto">-{formatCurrency(abatimento.abatimento)}</dd>
                    </div>
                    <div>
                      <dt>Valor final</dt>
                      <dd>{formatCurrency(abatimento.valorOriginal - abatimento.abatimento)}</dd>
                    </div>
                  </dl>
                  <div className="justificativa">
                    <strong>Justificativa:</strong> {abatimento.justificativa}
                  </div>
                </div>
                <div className="acoes">
                  <Button size="sm" variant="secondary" onClick={() => setRejeicaoDe(abatimento)} leftIcon={icone('circle-x')}>
                    Rejeitar
                  </Button>
                  <Button size="sm" onClick={() => onDecidir(abatimento, 'aprovado')} leftIcon={icone('circle-check')}>
                    Aprovar
                  </Button>
                </div>
              </Pendente>
            </Card>
          ))}
        </div>
      )}

      {rejeicaoDe && (
        <Modal
          open
          onClose={() => setRejeicaoDe(null)}
          title="Rejeitar abatimento"
          footer={
            <>
              <Button variant="secondary" onClick={() => setRejeicaoDe(null)}>Cancelar</Button>
              <Button variant="danger" onClick={confirmarRejeicao} leftIcon={icone('circle-x')}>Rejeitar</Button>
            </>
          }
        >
          Rejeitar o abatimento de {formatCurrency(rejeicaoDe.abatimento)} solicitado na {rejeicaoDe.notaFiscal}? A
          duplicata {rejeicaoDe.duplicata} mantém o valor original de {formatCurrency(rejeicaoDe.valorOriginal)}.
        </Modal>
      )}
    </Secao>
  );
};

export default EmAndamento;
