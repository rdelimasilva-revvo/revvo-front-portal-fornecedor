import React, { useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';

import { Button, Input, Modal, Select, Stepper, Textarea } from '../../../ds';
import { baixarDuplicata, cancelarDuplicata, registrarPagamentoParcial } from '../../../services/duplicatasService';
import { ACEITE_LABEL, SITUACAO_DUPLICATA_LABEL } from '../../../services/escrituracao';
import { formatCNPJ, formatCurrency, formatDate, formatDateTime } from '../../../utils/format';
import StatusBadge from '../../Common/StatusBadge';

export const TOM_SITUACAO = {
  em_aberto: 'azul',
  cedido: 'amarelo',
  liquidado: 'verde',
  baixado: 'neutro',
  cancelado: 'vermelho'
};

export const TOM_ACEITE = { pendente: 'amarelo', aceito: 'verde', recusado: 'vermelho' };

export const REGISTRO = {
  nao_registrada: { label: 'Pendente de envio', tom: 'amarelo' },
  pendente: { label: 'Registro em andamento', tom: 'azul' },
  registrada: { label: 'Registrada', tom: 'verde' },
  recusada: { label: 'Recusada', tom: 'vermelho' }
};

export const ORIGENS = { xml: 'XML', sefaz: 'SEFAZ', erp: 'ERP', planilha: 'Planilha', manual: 'Manual' };

export const BadgeSituacao = ({ situacao }) => (
  <StatusBadge tom={TOM_SITUACAO[situacao]}>{SITUACAO_DUPLICATA_LABEL[situacao]}</StatusBadge>
);

export const BadgeRegistro = ({ status }) => (
  <StatusBadge tom={REGISTRO[status]?.tom}>{REGISTRO[status]?.label || status}</StatusBadge>
);

const Resumo = styled.dl`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px 20px;
  margin: 0 0 20px;
  padding: 16px;
  background: var(--surface-page);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);

  dt {
    font-size: 12px;
    color: var(--text-muted);
  }

  dd {
    margin: 2px 0 0;
    font-weight: var(--fw-semibold);
    color: var(--text-strong);
    font-variant-numeric: tabular-nums;
  }
`;

const Titulo = styled.h3`
  font-size: 15px;
  font-weight: var(--fw-semibold);
  color: var(--text-strong);
  margin: 0 0 14px;
`;

const Aviso = styled.p`
  margin: 0 0 16px;
  font-size: var(--fs-body-sm);
  color: var(--text-muted);
`;

const Formulario = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const icone = (nome) => <i data-lucide={nome} style={{ width: 14, height: 14 }} />;

const item = (rotulo, valor) => (
  <div key={rotulo}>
    <dt>{rotulo}</dt>
    <dd>{valor}</dd>
  </div>
);

/** Campos da duplicata e histórico de eventos, usados nas duas telas de escrituração. */
export const DetalheDuplicataModal = ({ duplicata, onClose, acoes, aviso }) => {
  const eventos = [...(duplicata.eventos || [])].sort((a, b) => a.dataHora.localeCompare(b.dataHora));
  const passos = eventos.map((evento) => ({ label: evento.descricao, description: formatDateTime(evento.dataHora) }));

  return (
    <Modal
      open
      onClose={onClose}
      title={`Duplicata ${duplicata.numeroTitulo}`}
      size="lg"
      // Em aberto o rodapé tem cinco botões e não cabe nos 720px do tamanho lg.
      style={{ maxWidth: 860 }}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Fechar</Button>
          {acoes}
        </>
      }
    >
      <Resumo>
        {item('Sacado', duplicata.sacado.nome)}
        {item('CNPJ do sacado', formatCNPJ(duplicata.sacado.cnpj))}
        {item('Nota fiscal', duplicata.numeroNF)}
        {item('Emissão', formatDate(duplicata.dataEmissao))}
        {item('Vencimento', formatDate(duplicata.vencimento))}
        {item('Valor original', formatCurrency(duplicata.valorOriginal))}
        {item('Saldo', formatCurrency(duplicata.valor))}
        {item('Situação', <BadgeSituacao situacao={duplicata.situacao} />)}
        {item('Registro', <BadgeRegistro status={duplicata.statusRegistro} />)}
        {item('Aceite', <StatusBadge tom={TOM_ACEITE[duplicata.aceite]}>{ACEITE_LABEL[duplicata.aceite]}</StatusBadge>)}
        {item('Origem', ORIGENS[duplicata.origem] || duplicata.origem)}
        {duplicata.operacaoId && item('Operação', duplicata.operacaoId)}
      </Resumo>
      {aviso && <Aviso>{aviso}</Aviso>}
      <Titulo>Histórico</Titulo>
      <Stepper variant="vertical" steps={passos} activeStep={passos.length} />
    </Modal>
  );
};

const MOTIVOS_BAIXA = ['Pagamento direto ao cedente', 'Devolução de mercadoria', 'Outro'];

const ACOES = {
  parcial: { titulo: 'Registrar pagamento parcial', botao: 'Registrar pagamento', sucesso: (numero) => `Pagamento registrado na duplicata ${numero}.` },
  baixar: { titulo: 'Baixar duplicata', botao: 'Baixar', sucesso: (numero) => `Duplicata ${numero} baixada.` },
  cancelar: { titulo: 'Cancelar duplicata', botao: 'Cancelar duplicata', sucesso: (numero) => `Duplicata ${numero} cancelada.` }
};

/** Confirmação das ações de uma duplicata em aberto, com o campo que cada uma exige. */
export const AcaoDuplicataModal = ({ acao, duplicata, onClose, onConcluir }) => {
  const [valor, setValor] = useState('');
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const config = ACOES[acao];

  // A máscara de moeda devolve "R$ 1.234,56".
  const valorPago = Number(valor.replace(/[^\d,]/g, '').replace(',', '.'));
  const erroValor = valorPago > duplicata.valor ? 'O valor não pode ser maior que o saldo.' : undefined;
  const valido = acao === 'parcial' ? valorPago > 0 && !erroValor : motivo.trim().length > 0;

  const confirmar = async () => {
    setEnviando(true);
    try {
      if (acao === 'parcial') await registrarPagamentoParcial(duplicata.id, valorPago);
      if (acao === 'baixar') await baixarDuplicata(duplicata.id, motivo);
      if (acao === 'cancelar') await cancelarDuplicata(duplicata.id, motivo.trim());
      toast.success(config.sucesso(duplicata.numeroTitulo));
      onConcluir();
    } catch (falha) {
      toast.error(falha.message);
      setEnviando(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={config.titulo}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Voltar</Button>
          <Button variant={acao === 'cancelar' ? 'danger' : 'primary'} disabled={!valido || enviando} onClick={confirmar}>
            {enviando ? 'Salvando...' : config.botao}
          </Button>
        </>
      }
    >
      <Formulario>
        <Aviso style={{ margin: 0 }}>
          Duplicata {duplicata.numeroTitulo} · {duplicata.sacado.nome} · saldo de {formatCurrency(duplicata.valor)}
        </Aviso>
        {acao === 'parcial' && (
          <Input
            label="Valor recebido *"
            mask="currency"
            value={valor}
            onChange={(evento) => setValor(evento.target.value)}
            error={erroValor}
            hint="Se o valor quitar o saldo, a duplicata é baixada."
          />
        )}
        {acao === 'baixar' && (
          <Select
            label="Motivo da baixa *"
            value={motivo}
            onChange={setMotivo}
            placeholder="Selecione"
            options={MOTIVOS_BAIXA}
          />
        )}
        {acao === 'cancelar' && (
          <Textarea
            label="Motivo do cancelamento *"
            rows={3}
            value={motivo}
            onChange={(evento) => setMotivo(evento.target.value)}
            placeholder="Explique por que a duplicata será cancelada"
          />
        )}
      </Formulario>
    </Modal>
  );
};
