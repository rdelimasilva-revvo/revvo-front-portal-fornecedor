import React from 'react';

import { Badge } from '../../ds';

/** Tons internos do portal mapeados para os tons do design system. */
const TONS_DS = {
  neutro: 'neutral',
  azul: 'blue',
  verde: 'success',
  amarelo: 'warning',
  vermelho: 'danger'
};

const StatusBadge = ({ tom = 'neutro', children, title }) => (
  <span title={title}>
    <Badge tone={TONS_DS[tom] || 'neutral'} dot>
      {children}
    </Badge>
  </span>
);

export const TOM_STATUS_REGISTRO = {
  registrada: 'verde',
  pendente: 'amarelo',
  nao_registrada: 'neutro',
  recusada: 'vermelho'
};

export const TOM_STATUS_OPERACAO = {
  aguardando_assinatura: 'amarelo',
  enviada: 'azul',
  aceite_sacado: 'azul',
  registro: 'azul',
  credito: 'azul',
  liquidada: 'verde',
  recusada: 'vermelho'
};

export const TOM_STATUS_TERMO = {
  pendente: 'amarelo',
  assinado: 'verde',
  cancelado: 'neutro'
};

export default StatusBadge;
