import React from 'react';
import styled from 'styled-components';

import { Alert, Button, EmptyState as EmptyStateDS, Skeleton } from '../../ds';

/**
 * Estados obrigatórios de tela: carregando, vazio (com CTA) e erro (com retry).
 * São wrappers finos sobre o design system — as telas não falam com o DS
 * diretamente para esses três casos, então o comportamento é igual em todas.
 */

const Empilhado = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px 0;
`;

const BlocoErro = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  > div {
    width: 100%;
    max-width: 560px;
  }
`;

export const LoadingState = ({ linhas = 4, altura = 44, label = 'Carregando informações' }) => (
  <Empilhado role="status" aria-live="polite" aria-busy="true">
    <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
      {label}
    </span>
    {Array.from({ length: linhas }).map((_, indice) => (
      <Skeleton key={indice} variant="rect" height={altura} />
    ))}
  </Empilhado>
);

export const EmptyState = ({ titulo, descricao, acaoLabel, onAcao, icone = 'inbox' }) => (
  <EmptyStateDS
    icon={icone}
    title={titulo}
    description={descricao}
    action={acaoLabel && onAcao ? <Button onClick={onAcao}>{acaoLabel}</Button> : undefined}
    style={{ padding: '40px 24px' }}
  />
);

export const ErrorState = ({ titulo = 'Não foi possível carregar', mensagem, onRetry }) => (
  <BlocoErro>
    <Alert kind="danger" title={titulo}>
      {mensagem || 'Ocorreu uma falha inesperada. Tente novamente em alguns instantes.'}
    </Alert>
    {onRetry && (
      <Button variant="secondary" onClick={onRetry} leftIcon={<i data-lucide="rotate-cw" style={{ width: 15, height: 15 }} />}>
        Tentar novamente
      </Button>
    )}
  </BlocoErro>
);
