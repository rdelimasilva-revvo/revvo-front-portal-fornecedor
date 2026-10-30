import React, { useState } from 'react';
import styled from 'styled-components';

import { Button, Card, SearchField, Select, Table } from '../../../ds';
import { baixarCsv } from '../../../utils/exportacao';
import { formatCurrency, formatDate, formatPercent } from '../../../utils/format';
import StatusBadge from '../../Common/StatusBadge';
import { Secao } from './EmAndamento';
import { BarrasHorizontais, Colunas } from './Graficos';
import { MOTIVOS, STATUS_ABATIMENTO } from '../../../mocks/acordosData';

const Cards = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Indicador = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;

  .rotulo {
    font-size: 12px;
    color: var(--text-muted);
  }

  .valor {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    margin-top: 2px;
  }

  .contagem {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 2px;
  }

  .acao {
    margin-top: auto;
    padding-top: 8px;
  }
`;

const Graficos = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }

  h3 {
    font-size: 15px;
    font-weight: var(--fw-semibold);
    color: var(--text-strong);
    margin: 0;
  }

  .subtitulo {
    font-size: 12px;
    color: var(--text-muted);
    margin: 2px 0 18px;
  }
`;

const Filtros = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 12px;
  padding: 16px;
  margin-bottom: 12px;
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  align-items: end;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const NOMES_MES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const somar = (lista, campo = 'abatimento') => lista.reduce((soma, item) => soma + item[campo], 0);
const quantos = (n, singular, plural) => `${n} ${n === 1 ? singular : plural}`;
const diasEntre = (de, ate) => Math.round((new Date(`${ate}T12:00:00Z`) - new Date(`${de}T12:00:00Z`)) / 86400000);
const moedaCurta = (valor) => (valor >= 1000 ? `R$ ${(valor / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil` : formatCurrency(valor));

const Controle = ({ abatimentos, onVerPendentes }) => {
  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState('');
  const [motivo, setMotivo] = useState('');

  const pendentes = abatimentos.filter((item) => item.status === 'pendente');
  const aprovados = abatimentos.filter((item) => item.status === 'aprovado');
  const decididos = abatimentos.filter((item) => item.dataDecisao);
  const taxaAprovacao = decididos.length ? (aprovados.length / decididos.length) * 100 : 0;
  const tempoMedio = decididos.length
    ? decididos.reduce((soma, item) => soma + diasEntre(item.data, item.dataDecisao), 0) / decididos.length
    : 0;
  const percentualAbatido = aprovados.length ? (somar(aprovados) / somar(aprovados, 'valorOriginal')) * 100 : 0;

  const porMotivo = Object.entries(MOTIVOS)
    .map(([chave, rotulo]) => {
      const doMotivo = aprovados.filter((item) => item.motivo === chave);
      return { rotulo, valor: somar(doMotivo), dica: quantos(doMotivo.length, 'acordo aprovado', 'acordos aprovados') };
    })
    .filter((item) => item.valor > 0)
    .sort((a, b) => b.valor - a.valor);

  const meses = [...new Set(abatimentos.map((item) => item.data.slice(0, 7)))].sort();
  const porMes = meses.map((mes) => {
    const doMes = aprovados.filter((item) => item.data.startsWith(mes));
    const [ano, numero] = mes.split('-');
    return {
      rotulo: `${NOMES_MES[Number(numero) - 1]}/${ano.slice(2)}`,
      valor: somar(doMes),
      dica: `${formatCurrency(somar(doMes))} · ${quantos(doMes.length, 'acordo', 'acordos')}`
    };
  });

  const clientes = [...new Set(abatimentos.map((item) => item.cliente))]
    .map((cliente) => {
      const doCliente = abatimentos.filter((item) => item.cliente === cliente);
      const aprovadosCliente = doCliente.filter((item) => item.status === 'aprovado');
      return {
        cliente,
        acordos: doCliente.length,
        abatido: somar(aprovadosCliente),
        faturado: somar(aprovadosCliente, 'valorOriginal'),
        pendentes: doCliente.filter((item) => item.status === 'pendente').length
      };
    })
    .sort((a, b) => b.abatido - a.abatido);

  const termo = busca.trim().toLowerCase();
  const historico = abatimentos
    .filter(
      (item) =>
        (!status || item.status === status) &&
        (!motivo || item.motivo === motivo) &&
        (!termo || `${item.notaFiscal} ${item.duplicata} ${item.cliente}`.toLowerCase().includes(termo))
    )
    .sort((a, b) => b.data.localeCompare(a.data));

  const exportarHistorico = () =>
    baixarCsv(
      'acordos-comerciais',
      [
        { rotulo: 'Solicitado em', valor: (linha) => formatDate(linha.data) },
        { rotulo: 'Nota fiscal', valor: (linha) => linha.notaFiscal },
        { rotulo: 'Duplicata', valor: (linha) => linha.duplicata },
        { rotulo: 'Cliente', valor: (linha) => linha.cliente },
        { rotulo: 'Motivo', valor: (linha) => MOTIVOS[linha.motivo] },
        { rotulo: 'Valor original', valor: (linha) => linha.valorOriginal },
        { rotulo: 'Abatimento', valor: (linha) => linha.abatimento },
        { rotulo: 'Status', valor: (linha) => STATUS_ABATIMENTO[linha.status].label },
        { rotulo: 'Decidido em', valor: (linha) => (linha.dataDecisao ? formatDate(linha.dataDecisao) : '') },
        { rotulo: 'Justificativa', valor: (linha) => linha.justificativa }
      ],
      historico
    );

  const colunasClientes = [
    { key: 'cliente', label: 'Cliente' },
    { key: 'acordos', label: 'Acordos', numeric: true, align: 'right' },
    { key: 'abatido', label: 'Abatido (aprovado)', numeric: true, align: 'right', render: (linha) => formatCurrency(linha.abatido) },
    {
      key: 'percentual',
      label: '% das notas',
      numeric: true,
      align: 'right',
      render: (linha) => (linha.faturado ? formatPercent((linha.abatido / linha.faturado) * 100, 1) : '—')
    },
    { key: 'pendentes', label: 'Pendentes', numeric: true, align: 'right' }
  ];

  const colunasHistorico = [
    { key: 'data', label: 'Solicitado em', render: (linha) => formatDate(linha.data) },
    { key: 'notaFiscal', label: 'Nota fiscal' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'motivo', label: 'Motivo', render: (linha) => MOTIVOS[linha.motivo] },
    { key: 'abatimento', label: 'Abatimento', numeric: true, align: 'right', render: (linha) => `-${formatCurrency(linha.abatimento)}` },
    {
      key: 'status',
      label: 'Status',
      render: (linha) => <StatusBadge tom={STATUS_ABATIMENTO[linha.status].tom}>{STATUS_ABATIMENTO[linha.status].label}</StatusBadge>
    },
    { key: 'decisao', label: 'Decidido em', render: (linha) => (linha.dataDecisao ? formatDate(linha.dataDecisao) : '—') }
  ];

  return (
    <>
      <Cards>
        <Card padding={16}>
          <Indicador>
            <div className="rotulo">Total abatido</div>
            <div className="valor">{formatCurrency(somar(aprovados))}</div>
            <div className="contagem">
              {formatPercent(percentualAbatido, 1)} do valor das notas · {quantos(aprovados.length, 'acordo', 'acordos')}
            </div>
          </Indicador>
        </Card>
        <Card padding={16}>
          <Indicador>
            <div className="rotulo">Em andamento</div>
            <div className="valor">{formatCurrency(somar(pendentes))}</div>
            <div className="contagem">{quantos(pendentes.length, 'aguardando aceite', 'aguardando aceite')}</div>
            {pendentes.length > 0 && (
              <div className="acao">
                <Button size="sm" variant="ghost" onClick={onVerPendentes} style={{ padding: '0 6px' }}>
                  Ver pendentes
                </Button>
              </div>
            )}
          </Indicador>
        </Card>
        <Card padding={16}>
          <Indicador>
            <div className="rotulo">Taxa de aprovação</div>
            <div className="valor">{formatPercent(taxaAprovacao, 0)}</div>
            <div className="contagem">
              {aprovados.length} de {quantos(decididos.length, 'acordo decidido', 'acordos decididos')}
            </div>
          </Indicador>
        </Card>
        <Card padding={16}>
          <Indicador>
            <div className="rotulo">Tempo médio de resposta</div>
            <div className="valor">{tempoMedio.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} dias</div>
            <div className="contagem">Da solicitação à decisão</div>
          </Indicador>
        </Card>
      </Cards>

      <Graficos>
        <Card padding={20}>
          <h3>Abatido por motivo</h3>
          <p className="subtitulo">Soma dos acordos aprovados</p>
          <BarrasHorizontais itens={porMotivo} formatar={formatCurrency} descricao="Valor abatido por motivo" />
        </Card>
        <Card padding={20}>
          <h3>Abatido por mês</h3>
          <p className="subtitulo">Acordos aprovados, pelo mês da solicitação</p>
          <Colunas itens={porMes} formatar={formatCurrency} formatarCurto={moedaCurta} descricao="Valor abatido por mês" />
        </Card>
      </Graficos>

      <Secao>
        <h2>Por cliente</h2>
        <div className="rolagem">
          <Table columns={colunasClientes} rows={clientes} rowKey="cliente" style={{ minWidth: 720 }} />
        </div>
      </Secao>

      <Secao>
        <h2>
          Histórico de acordos
          <Button
            size="sm"
            variant="secondary"
            onClick={exportarHistorico}
            disabled={historico.length === 0}
            leftIcon={<i data-lucide="download" style={{ width: 14, height: 14 }} />}
            style={{ marginLeft: 'auto' }}
          >
            Exportar CSV
          </Button>
        </h2>
        <Filtros>
          <SearchField value={busca} onChange={setBusca} placeholder="Nota fiscal, duplicata ou cliente" onClear={() => setBusca('')} />
          <Select
            label="Status"
            value={status}
            onChange={setStatus}
            placeholder="Todos"
            options={Object.entries(STATUS_ABATIMENTO).map(([value, { label }]) => ({ value, label }))}
          />
          <Select
            label="Motivo"
            value={motivo}
            onChange={setMotivo}
            placeholder="Todos"
            options={Object.entries(MOTIVOS).map(([value, label]) => ({ value, label }))}
          />
        </Filtros>
        <div className="rolagem">
          <Table
            columns={colunasHistorico}
            rows={historico}
            rowKey="id"
            empty="Nenhum acordo encontrado."
            style={{ minWidth: 960 }}
          />
        </div>
      </Secao>
    </>
  );
};

export default Controle;
