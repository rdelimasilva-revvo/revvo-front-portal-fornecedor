import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';

import { Alert, Button, Checkbox, Input, Modal, Stepper, Table } from '../../../ds';
import { contratarOperacao } from '../../../services/operacoesService';
import {
  CODIGO_2FA_SIMULADO,
  MOTIVO_SEM_ALCADA,
  obterCedente,
  obterUsuarioAtual,
  podeAssinar,
  validarSegundoFator
} from '../../../services/cadastroService';
import { TermoCessao } from '../../../domain/termoCessao';
import { formatCurrency, formatDate, formatPercent } from '../../../utils/format';

const Resumo = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const Bloco = styled.div`
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 14px;

  .rotulo {
    font-size: 12px;
    color: var(--text-muted);
  }

  .valor {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: ${(props) => props.$cor || 'var(--text-strong)'};
    margin-top: 2px;
  }

  .detalhe {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 4px;
  }
`;

const Aceite = styled.div`
  margin-top: 16px;
  font-size: var(--fs-body-sm);
  color: ${(props) => (props.$habilitado ? 'var(--text-body)' : 'var(--text-muted)')};
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

const Sucesso = styled.div`
  text-align: center;
  padding: 16px;

  h3 {
    font-size: 18px;
    font-weight: var(--fw-semibold);
    margin: 14px 0 4px;
  }

  .numero {
    font-family: var(--font-display);
    font-size: 26px;
    font-weight: 700;
    color: var(--revvo-blue-500);
    margin: 10px 0;
  }

  p {
    font-size: var(--fs-body-sm);
    color: var(--text-muted);
    margin: 0 auto;
    max-width: 440px;
  }
`;

const RodapeModal = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;

  .aviso {
    font-size: 12px;
    color: var(--text-muted);
    max-width: 360px;
  }

  .acoes {
    display: flex;
    gap: 8px;
  }
`;

const PASSOS = [
  { label: 'Resumo' },
  { label: 'Termo de cessão' },
  { label: 'Confirmação' }
];

const COLUNAS_TITULOS = [
  { key: 'numeroTitulo', label: 'Título' },
  { key: 'sacado', label: 'Sacado', render: (linha) => linha.sacado.nome },
  { key: 'vencimento', label: 'Vencimento', render: (linha) => formatDate(linha.vencimento) },
  { key: 'prazo', label: 'Prazo', render: (linha) => `${linha.prazoDias}d` },
  { key: 'bruto', label: 'Bruto', numeric: true, render: (linha) => formatCurrency(linha.valorBruto) },
  { key: 'liquido', label: 'Líquido', numeric: true, render: (linha) => formatCurrency(linha.valorLiquido) }
];

/**
 * Contratação em 3 passos.
 * O aceite só libera depois da leitura completa do termo; o envio só acontece
 * depois do segundo fator validado.
 */
const ContratacaoModal = ({ simulacao, onFechar, onContratado }) => {
  const [passo, setPasso] = useState(1);
  const [leuTermo, setLeuTermo] = useState(false);
  const [aceitou, setAceitou] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [operacao, setOperacao] = useState(null);
  const [conta, setConta] = useState(null);
  // Sem alçada o usuário contrata sem aceite nem segundo fator: quem assina é o aprovador, em Contratos.
  const [assina, setAssina] = useState(true);

  useEffect(() => {
    obterCedente()
      .then((cedente) => setConta(cedente.contaBancaria))
      .catch(() => setConta(null));
    obterUsuarioAtual()
      .then((usuario) => setAssina(podeAssinar(usuario)))
      .catch(() => setAssina(true));
  }, []);

  const contratar = async () => {
    setEnviando(true);
    try {
      if (assina) await validarSegundoFator(codigo);
      const criada = await contratarOperacao({ simulacao });
      setOperacao(criada);
      setPasso(3);
    } catch (falha) {
      toast.error(falha.message || 'Não foi possível concluir a contratação.');
    } finally {
      setEnviando(false);
    }
  };

  const aguardaAssinatura = operacao?.status === 'aguardando_assinatura';
  const podeContratar = assina ? leuTermo && aceitou && codigo.trim().length === 6 : leuTermo;

  const rodape = (
    <RodapeModal>
      <span className="aviso">
        {passo === 1 && 'Confira os títulos antes de seguir para o termo de cessão.'}
        {passo === 2 &&
          (assina
            ? 'O aceite eletrônico com segundo fator tem valor de assinatura.'
            : 'O termo vai para Contratos e só um aprovador pode assiná-lo.')}
        {passo === 3 && 'Você será levado ao detalhe da operação.'}
      </span>

      <div className="acoes">
        {passo === 1 && (
          <>
            <Button variant="secondary" onClick={onFechar}>
              Cancelar
            </Button>
            <Button
              onClick={() => setPasso(2)}
              rightIcon={<i data-lucide="arrow-right" style={{ width: 15, height: 15 }} />}
            >
              Continuar
            </Button>
          </>
        )}

        {passo === 2 && (
          <>
            <Button variant="secondary" onClick={() => setPasso(1)}>
              Voltar
            </Button>
            <Button onClick={contratar} disabled={!podeContratar || enviando}>
              {enviando ? 'Contratando…' : assina ? 'Aceitar e contratar' : 'Enviar para assinatura'}
            </Button>
          </>
        )}

        {passo === 3 && (
          <Button
            onClick={() => onContratado(operacao)}
            rightIcon={<i data-lucide="arrow-right" style={{ width: 15, height: 15 }} />}
          >
            Ver operação
          </Button>
        )}
      </div>
    </RodapeModal>
  );

  return (
    <Modal
      open
      onClose={passo === 3 ? undefined : onFechar}
      closeOnScrim={passo !== 3}
      title="Contratar antecipação"
      footer={rodape}
      size="lg"
      style={{ maxWidth: 800 }}
    >
      <Stepper steps={PASSOS} activeStep={passo - 1} style={{ marginBottom: 20 }} />

      {passo === 1 && (
        <>
          <Resumo>
            <Bloco>
              <div className="rotulo">Títulos selecionados</div>
              <div className="valor">{simulacao.quantidade}</div>
              <div className="detalhe">Prazo médio de {simulacao.prazoMedio} dias</div>
            </Bloco>
            <Bloco>
              <div className="rotulo">Valor bruto</div>
              <div className="valor">{formatCurrency(simulacao.valorBruto)}</div>
              <div className="detalhe">Taxa de {formatPercent(simulacao.taxaMensal)} a.m.</div>
            </Bloco>
            <Bloco $cor="var(--revvo-green-700)">
              <div className="rotulo">Valor líquido</div>
              <div className="valor">{formatCurrency(simulacao.valorLiquido)}</div>
              <div className="detalhe">Crédito previsto em {formatDate(simulacao.dataCredito)}</div>
            </Bloco>
          </Resumo>

          {conta && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 12px' }}>
              O crédito será feito na conta {conta.banco} · ag. {conta.agencia} · c/c {conta.conta}.
            </p>
          )}

          <div style={{ maxHeight: 260, overflow: 'auto' }}>
            <Table columns={COLUNAS_TITULOS} rows={simulacao.titulos} rowKey="recebivelId" dense />
          </div>
        </>
      )}

      {passo === 2 && (
        <>
          <TermoCessao dados={simulacao} onLido={setLeuTermo} />

          {!leuTermo && (
            <Alert kind="info" style={{ marginTop: 12 }}>
              Role o termo até o fim para {assina ? 'habilitar o aceite' : 'continuar'}.
            </Alert>
          )}

          {!assina && (
            <Alert kind="warning" title="Seu usuário não assina termos" style={{ marginTop: 12 }}>
              {MOTIVO_SEM_ALCADA} A operação é criada agora e fica aguardando a assinatura em Contratos.
            </Alert>
          )}

          {assina && (
            <>
              <Aceite $habilitado={leuTermo}>
                <Checkbox
                  id="aceite-termo"
                  checked={aceitou}
                  disabled={!leuTermo}
                  onChange={(valor) => setAceitou(valor)}
                  label="Li integralmente o termo de cessão e aceito as suas condições em nome da empresa cedente."
                />
              </Aceite>
    
              <CampoCodigo>
                <Input
                  id="codigo-2fa"
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
        </>
      )}

      {passo === 3 && operacao && (
        <Sucesso>
          <i data-lucide="circle-check-big" style={{ width: 44, height: 44, color: 'var(--revvo-green-600)' }} />
          <h3>{aguardaAssinatura ? 'Operação criada' : 'Operação contratada'}</h3>
          <div className="numero">{operacao.id}</div>
          <p>
            {operacao.titulos.length} título(s) no valor líquido de {formatCurrency(operacao.valorLiquido)}.{' '}
            {aguardaAssinatura
              ? 'Seu usuário não tem alçada para assinar, então o termo de cessão foi para Contratos. A operação só segue depois que um aprovador assinar.'
              : 'A operação foi enviada e agora aguarda o aceite do sacado. Acompanhe cada etapa no detalhe da operação.'}
          </p>
        </Sucesso>
      )}
    </Modal>
  );
};

export default ContratacaoModal;
