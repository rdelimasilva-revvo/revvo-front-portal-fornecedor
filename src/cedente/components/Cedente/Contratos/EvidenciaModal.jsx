import React from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';

import { Button, Modal } from '../../../ds';
import { clausulasTermo } from '../../../domain/termoCessao';
import { formatCurrency, formatDateTime } from '../../../utils/format';
import { abrirDocumento } from '../../../utils/exportacao';

const Campos = styled.dl`
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 10px 16px;
  margin: 0;
  font-size: var(--fs-body-sm);

  dt {
    color: var(--text-muted);
  }

  dd {
    margin: 0;
    color: var(--text-strong);
    font-weight: var(--fw-semibold);
    overflow-wrap: anywhere;
  }
`;

const METODO_ASSINATURA_LABEL = {
  aceite_eletronico_2fa: 'Aceite eletrônico com segundo fator'
};

const PAPEL_LABEL = { aprovador: 'Aprovador', operador: 'Operador' };

const camposDoTermo = (termo) => {
  const { assinatura } = termo;
  return [
    ['Termo', termo.id],
    ['Operação', termo.operacaoId],
    ['Títulos', String(termo.quantidadeTitulos)],
    ['Valor bruto', formatCurrency(termo.valorBruto)],
    ['Valor líquido', formatCurrency(termo.valorLiquido)],
    ['Assinado por', `${assinatura.assinadoPor.nome} (${PAPEL_LABEL[assinatura.assinadoPor.papel] || assinatura.assinadoPor.papel})`],
    ['Assinado em', formatDateTime(assinatura.assinadoEm)],
    ['Método', METODO_ASSINATURA_LABEL[assinatura.metodo] || assinatura.metodo],
    ['Hash do documento', assinatura.hash],
    ['IP de origem', assinatura.ip]
  ];
};

const EvidenciaModal = ({ termo, onFechar, onVerOperacao }) => {
  const campos = camposDoTermo(termo);

  const baixar = () => {
    const aberto = abrirDocumento({
      titulo: `Termo de cessão ${termo.id}`,
      subtitulo: `Operação ${termo.operacaoId} · assinado eletronicamente com segundo fator`,
      campos,
      paragrafos: [
        'TERMO DE CESSÃO DE CRÉDITOS',
        ...clausulasTermo().map((clausula) => (clausula.titulo ? `${clausula.titulo}. ${clausula.texto}` : clausula.texto))
      ]
    });
    if (!aberto) toast.error('O navegador bloqueou a nova aba. Libere pop-ups para este site e tente de novo.');
  };

  return (
    <Modal
      open
      onClose={onFechar}
      title={`Evidência da assinatura · ${termo.id}`}
      size="lg"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => onVerOperacao(termo.operacaoId)}
            leftIcon={<i data-lucide="eye" style={{ width: 14, height: 14 }} />}
          >
            Ver operação
          </Button>
          <Button onClick={baixar} leftIcon={<i data-lucide="download" style={{ width: 14, height: 14 }} />}>
            Baixar termo assinado
          </Button>
        </>
      }
    >
      <Campos>
        {campos.map(([rotulo, valor]) => (
          <React.Fragment key={rotulo}>
            <dt>{rotulo}</dt>
            <dd>{valor}</dd>
          </React.Fragment>
        ))}
      </Campos>
    </Modal>
  );
};

export default EvidenciaModal;
