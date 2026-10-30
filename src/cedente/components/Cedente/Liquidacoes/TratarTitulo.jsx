import React, { useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';

import { Alert, Button, Input, Modal, Radio } from '../../../ds';
import { TARIFA_PRORROGACAO, TRATATIVAS_VENCIDO, tratarTituloVencido } from '../../../services/operacoesService';
import { formatCurrency, formatDate, toISODate, today } from '../../../utils/format';

const Opcoes = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
`;

const Opcao = styled.div`
  padding: 14px 16px;
  border: 1px solid ${({ $ativa }) => ($ativa ? 'var(--revvo-blue-500)' : 'var(--border-subtle)')};
  border-radius: var(--radius-md);
  background: var(--surface-card);

  .detalhe {
    margin: 8px 0 0 30px;
    font-size: 13px;
    color: var(--text-muted);
  }

  .destaque {
    font-weight: var(--fw-semibold);
    color: var(--text-strong);
    font-variant-numeric: tabular-nums;
  }
`;

const Resumo = styled.p`
  margin: 0;
  font-size: 14px;
  color: var(--text-body);
`;

const TratarTitulo = ({ titulo, onFechar, onConcluir, onNavegar }) => {
  const [acao, setAcao] = useState('recompra');
  const [novoVencimento, setNovoVencimento] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [falha, setFalha] = useState(null);

  const hoje = toISODate(today());
  const dataValida = novoVencimento > hoje;
  const podeConfirmar = acao !== 'prorrogacao' || dataValida;

  const confirmar = async () => {
    setEnviando(true);
    setFalha(null);
    try {
      await tratarTituloVencido({
        operacaoId: titulo.operacaoId,
        numeroTitulo: titulo.numeroTitulo,
        acao,
        ...(acao === 'prorrogacao' ? { novoVencimento } : {})
      });
      if (acao === 'recompra') {
        toast.success(
          (t) => (
            <span>
              {titulo.numeroTitulo} recomprado. {formatCurrency(titulo.valorBruto)} debitados no extrato.{' '}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  toast.dismiss(t.id);
                  onNavegar?.('extrato');
                }}
                style={{ padding: '0 6px' }}
              >
                Ver no extrato
              </Button>
            </span>
          ),
          { duration: 8000 }
        );
      } else if (acao === 'prorrogacao') {
        toast.success(`${titulo.numeroTitulo} prorrogado para ${formatDate(novoVencimento)}.`);
      } else {
        toast.success(`Cobrança da ${titulo.numeroTitulo} enviada ao sacado.`);
      }
      onConcluir();
    } catch (erro) {
      setFalha(erro.message);
      setEnviando(false);
    }
  };

  const opcao = (valor, detalhe) => (
    <Opcao $ativa={acao === valor}>
      <Radio name="tratativa" value={valor} checked={acao === valor} onChange={setAcao} label={TRATATIVAS_VENCIDO[valor]} />
      {acao === valor && <div className="detalhe">{detalhe}</div>}
    </Opcao>
  );

  return (
    <Modal
      open
      onClose={onFechar}
      title="Tratar título vencido"
      footer={
        <>
          <Button variant="secondary" onClick={onFechar} disabled={enviando}>
            Cancelar
          </Button>
          <Button onClick={confirmar} disabled={!podeConfirmar || enviando}>
            {enviando ? 'Confirmando...' : 'Confirmar'}
          </Button>
        </>
      }
    >
      <Resumo>
        {titulo.numeroTitulo} · {titulo.sacado.nome} · venceu em {formatDate(titulo.vencimento)} ·{' '}
        {formatCurrency(titulo.valorBruto)}
      </Resumo>

      <Opcoes>
        {opcao(
          'recompra',
          <>
            Você devolve o valor do título ao financiador:{' '}
            <span className="destaque">{formatCurrency(titulo.valorBruto)}</span>. O valor é debitado no extrato.
          </>
        )}
        {opcao(
          'prorrogacao',
          <>
            <Input
              label="Novo vencimento"
              type="date"
              min={hoje}
              value={novoVencimento}
              onChange={(e) => setNovoVencimento(e.target.value)}
              error={novoVencimento && !dataValida ? 'Escolha uma data depois de hoje.' : undefined}
              size="sm"
            />
            <div style={{ marginTop: 8 }}>
              Tarifa de prorrogação: <span className="destaque">{formatCurrency(TARIFA_PRORROGACAO)}</span>, debitada no
              extrato.
            </div>
          </>
        )}
        {opcao('cobranca', 'O financiador cobra o sacado diretamente. Você acompanha o pagamento por aqui.')}
      </Opcoes>

      {falha && (
        <Alert kind="danger" title="Não foi possível tratar o título" style={{ marginTop: 16 }}>
          {falha}
        </Alert>
      )}
    </Modal>
  );
};

export default TratarTitulo;
