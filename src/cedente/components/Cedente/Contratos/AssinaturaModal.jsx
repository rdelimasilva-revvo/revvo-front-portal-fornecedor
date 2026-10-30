import React, { useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';

import { Alert, Button, Checkbox, Input, Modal, Table } from '../../../ds';
import { TermoCessao } from '../../../domain/termoCessao';
import { CODIGO_2FA_SIMULADO } from '../../../services/cadastroService';
import { assinarTermos } from '../../../services/termosService';
import { formatCurrency } from '../../../utils/format';

const Secao = styled.div`
  margin-top: 16px;

  h4 {
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-semibold);
    color: var(--text-strong);
    margin: 0 0 8px;
  }
`;

const Total = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  font-size: var(--fs-body-sm);
  color: var(--text-muted);

  strong {
    color: var(--text-strong);
    font-variant-numeric: tabular-nums;
  }
`;

const CampoCodigo = styled.div`
  margin-top: 16px;
  max-width: 220px;

  .dica {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 6px;
  }
`;

const Lista = styled.ul`
  margin: 0;
  padding-left: 18px;
  line-height: 1.7;
`;

const COLUNAS = [
  { key: 'operacaoId', label: 'Operação' },
  { key: 'quantidadeTitulos', label: 'Títulos', align: 'right' },
  { key: 'bruto', label: 'Valor bruto', numeric: true, align: 'right', render: (linha) => formatCurrency(linha.valorBruto) },
  { key: 'liquido', label: 'Valor líquido', numeric: true, align: 'right', render: (linha) => formatCurrency(linha.valorLiquido) }
];

const soma = (termos, campo) => termos.reduce((total, termo) => total + termo[campo], 0);

/**
 * Assinatura de um ou vários termos. O texto aparece uma vez só porque é o mesmo
 * instrumento para todos: um aceite cobre o lote.
 */
const AssinaturaModal = ({ termos, onFechar, onConcluido }) => {
  const [leuTermo, setLeuTermo] = useState(false);
  const [aceitou, setAceitou] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const emLote = termos.length > 1;
  const podeConfirmar = leuTermo && aceitou && codigo.length === 6 && !enviando;

  const confirmar = async () => {
    setEnviando(true);
    try {
      const retorno = await assinarTermos(termos.map((termo) => termo.id), codigo);
      setResultado(retorno);
      onConcluido();
      if (retorno.falhas.length === 0) {
        toast.success(retorno.assinados.length === 1 ? 'Termo assinado.' : `${retorno.assinados.length} termos assinados.`);
      }
    } catch (falha) {
      toast.error(falha.message || 'Não foi possível assinar.');
    } finally {
      setEnviando(false);
    }
  };

  const rodape = resultado ? (
    <Button onClick={onFechar}>Concluir</Button>
  ) : (
    <>
      <Button variant="secondary" onClick={onFechar} disabled={enviando}>
        Cancelar
      </Button>
      <Button
        onClick={confirmar}
        disabled={!podeConfirmar}
        leftIcon={<i data-lucide="pen-line" style={{ width: 14, height: 14 }} />}
      >
        {enviando ? 'Assinando…' : emLote ? `Assinar ${termos.length} termos` : 'Assinar termo'}
      </Button>
    </>
  );

  return (
    <Modal
      open
      onClose={enviando ? undefined : onFechar}
      closeOnScrim={!enviando && !resultado}
      title={emLote ? 'Assinar termos de cessão' : `Assinar termo ${termos[0].id}`}
      footer={rodape}
      size="lg"
      style={{ maxWidth: 760 }}
    >
      {resultado ? (
        <>
          {resultado.assinados.length > 0 && (
            <Alert kind="success" title={`${resultado.assinados.length} termo(s) assinado(s)`}>
              As operações {resultado.assinados.map((termo) => termo.operacaoId).join(', ')} seguiram para o aceite
              do sacado.
            </Alert>
          )}
          {resultado.falhas.length > 0 && (
            <Alert
              kind="danger"
              title={`${resultado.falhas.length} termo(s) não assinado(s)`}
              style={{ marginTop: resultado.assinados.length > 0 ? 12 : 0 }}
            >
              <Lista>
                {resultado.falhas.map((falha) => (
                  <li key={falha.id}>
                    {falha.id}: {falha.motivo}
                  </li>
                ))}
              </Lista>
            </Alert>
          )}
        </>
      ) : (
        <>
          <TermoCessao onLido={setLeuTermo} altura={260} />

          {!leuTermo && (
            <Alert kind="info" style={{ marginTop: 12 }}>
              Role o termo até o fim para habilitar o aceite.
            </Alert>
          )}

          <Secao>
            <h4>{emLote ? `Operações abrangidas (${termos.length})` : 'Operação abrangida'}</h4>
            <div style={{ maxHeight: 200, overflow: 'auto' }}>
              <Table columns={COLUNAS} rows={termos} rowKey="id" dense />
            </div>
            {emLote && (
              <Total>
                <span>Total do lote · {soma(termos, 'quantidadeTitulos')} títulos</span>
                <span>
                  Bruto <strong>{formatCurrency(soma(termos, 'valorBruto'))}</strong> · Líquido{' '}
                  <strong>{formatCurrency(soma(termos, 'valorLiquido'))}</strong>
                </span>
              </Total>
            )}
          </Secao>

          <Secao>
            <Checkbox
              id="aceite-termos"
              checked={aceitou}
              disabled={!leuTermo}
              onChange={setAceitou}
              label={
                emLote
                  ? 'Li integralmente o termo de cessão e aceito as suas condições para todas as operações listadas, em nome da empresa cedente.'
                  : 'Li integralmente o termo de cessão e aceito as suas condições em nome da empresa cedente.'
              }
            />
          </Secao>

          <CampoCodigo>
            <Input
              id="codigo-2fa-assinatura"
              label="Código de verificação enviado para o seu celular"
              inputMode="numeric"
              maxLength={6}
              value={codigo}
              onChange={(evento) => setCodigo(evento.target.value.replace(/\D/g, ''))}
              disabled={!aceitou}
              placeholder="000000"
              leftIcon={<i data-lucide="lock" style={{ width: 15, height: 15 }} />}
            />
            <div className="dica">Ambiente de demonstração: use o código {CODIGO_2FA_SIMULADO}.</div>
          </CampoCodigo>
        </>
      )}
    </Modal>
  );
};

export default AssinaturaModal;
