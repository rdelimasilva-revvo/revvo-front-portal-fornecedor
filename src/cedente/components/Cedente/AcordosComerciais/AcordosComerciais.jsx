import React, { useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';

import { Button, Tabs } from '../../../ds';
import { useRequisicao } from '../../../hooks/useRequisicao';
import { decidirAcordo, listarAcordos } from '../../../services/acordosService';
import { formatCurrency } from '../../../utils/format';
import { ErrorState, LoadingState } from '../../Common/States';
import Controle from './Controle';
import EmAndamento from './EmAndamento';

const Container = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const PageHeader = styled.div`
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

const avisarAprovacao = (alvo, duplicata, onNavegar) => {
  if (!duplicata) {
    toast.success(`Abatimento da ${alvo.notaFiscal} aprovado.`);
    return;
  }
  toast.success(
    (t) => (
      <span>
        Abatimento aprovado. O saldo da {duplicata.numeroTitulo} passou para {formatCurrency(duplicata.valor)}.{' '}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            toast.dismiss(t.id);
            onNavegar?.('duplicatas', { duplicataId: duplicata.id });
          }}
          style={{ padding: '0 6px' }}
        >
          Ver duplicata
        </Button>
      </span>
    ),
    { duration: 8000 }
  );
};

const AcordosComerciais = ({ onNavegar }) => {
  const [aba, setAba] = useState('controle');
  const { dados, carregando, erro, recarregar } = useRequisicao(() => listarAcordos(), []);

  const abatimentos = dados || [];
  const pendentes = abatimentos.filter((abatimento) => abatimento.status === 'pendente');

  const decidir = async (alvo, status) => {
    try {
      const { duplicataAtualizada } = await decidirAcordo(alvo.id, status);
      if (status === 'aprovado') avisarAprovacao(alvo, duplicataAtualizada, onNavegar);
      else toast(`Abatimento da ${alvo.notaFiscal} rejeitado.`);
    } catch (falha) {
      toast.error(falha.message);
    }
    recarregar();
  };

  return (
    <Container>
      <PageHeader>
        <h1>Acordos comerciais</h1>
        <p>Acompanhe os abatimentos negociados com seus clientes e aprove os que aguardam o seu aceite.</p>
      </PageHeader>

      <Tabs
        tabs={[
          { value: 'controle', label: 'Controle' },
          { value: 'andamento', label: 'Em andamento', count: pendentes.length }
        ]}
        value={aba}
        onChange={setAba}
        style={{ marginBottom: 20 }}
      />

      {carregando && !dados ? (
        <LoadingState linhas={5} altura={60} label="Carregando acordos" />
      ) : erro ? (
        <ErrorState titulo="Não foi possível carregar os acordos" mensagem={erro.message} onRetry={recarregar} />
      ) : aba === 'controle' ? (
        <Controle abatimentos={abatimentos} onVerPendentes={() => setAba('andamento')} />
      ) : (
        <EmAndamento pendentes={pendentes} onDecidir={decidir} />
      )}
    </Container>
  );
};

export default AcordosComerciais;
