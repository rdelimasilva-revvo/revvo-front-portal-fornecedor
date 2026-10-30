import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { Button, Card, SearchField, Select, Table } from '../../../ds';
import { useRequisicao } from '../../../hooks/useRequisicao';
import { listarDuplicatas, obterDuplicata } from '../../../services/duplicatasService';
import { ACEITE_LABEL, SITUACAO_DUPLICATA_LABEL } from '../../../services/escrituracao';
import { baixarCsv } from '../../../utils/exportacao';
import { formatCNPJ, formatCurrency, formatDate } from '../../../utils/format';
import StatusBadge from '../../Common/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../../Common/States';
import {
  AcaoDuplicataModal,
  BadgeRegistro,
  BadgeSituacao,
  DetalheDuplicataModal,
  REGISTRO,
  TOM_ACEITE,
  icone
} from './DuplicataModais';

const Container = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
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

const Cards = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const Indicador = styled.div`
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

const Celula = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  span {
    font-size: 12px;
    color: var(--text-muted);
  }
`;

const opcoes = (rotulos) => Object.entries(rotulos).map(([value, label]) => ({ value, label }));

const plural = (quantidade) => `${quantidade} ${quantidade === 1 ? 'duplicata' : 'duplicatas'}`;

const Duplicatas = ({ onNavegar, parametros }) => {
  const [busca, setBusca] = useState('');
  const [situacao, setSituacao] = useState('');
  const [aceite, setAceite] = useState('');
  const [detalhe, setDetalhe] = useState(null);
  const [acao, setAcao] = useState(null);

  const { dados, carregando, erro, recarregar } = useRequisicao(() => listarDuplicatas(), []);
  const duplicatas = dados || [];

  // Vindo de outra tela com uma duplicata específica: abre o detalhe dela uma vez.
  const aberturaFeita = useRef(false);
  useEffect(() => {
    if (!dados || aberturaFeita.current || !parametros?.duplicataId) return;
    aberturaFeita.current = true;
    const alvo = dados.find((duplicata) => duplicata.id === parametros.duplicataId);
    if (alvo) setDetalhe(alvo);
  }, [dados, parametros]);

  const termo = busca.trim().toLowerCase();
  const filtradas = duplicatas.filter(
    (duplicata) =>
      (!situacao || duplicata.situacao === situacao) &&
      (!aceite || duplicata.aceite === aceite) &&
      (!termo ||
        `${duplicata.numeroTitulo} ${duplicata.numeroNF} ${duplicata.sacado.nome} ${duplicata.sacado.cnpj}`
          .toLowerCase()
          .includes(termo))
  );

  const concluirAcao = async () => {
    setAcao(null);
    recarregar();
    setDetalhe(await obterDuplicata(detalhe.id));
  };

  const navegar = (pagina, params) => {
    setDetalhe(null);
    onNavegar?.(pagina, params);
  };

  const exportar = () =>
    baixarCsv(
      'duplicatas',
      [
        { rotulo: 'Título', valor: (linha) => linha.numeroTitulo },
        { rotulo: 'NF', valor: (linha) => linha.numeroNF },
        { rotulo: 'Sacado', valor: (linha) => linha.sacado.nome },
        { rotulo: 'CNPJ do sacado', valor: (linha) => formatCNPJ(linha.sacado.cnpj) },
        { rotulo: 'Emissão', valor: (linha) => formatDate(linha.dataEmissao) },
        { rotulo: 'Vencimento', valor: (linha) => formatDate(linha.vencimento) },
        { rotulo: 'Valor original', valor: (linha) => linha.valorOriginal },
        { rotulo: 'Saldo', valor: (linha) => linha.valor },
        { rotulo: 'Aceite', valor: (linha) => ACEITE_LABEL[linha.aceite] },
        { rotulo: 'Situação', valor: (linha) => SITUACAO_DUPLICATA_LABEL[linha.situacao] },
        { rotulo: 'Registro', valor: (linha) => REGISTRO[linha.statusRegistro]?.label },
        { rotulo: 'Operação', valor: (linha) => linha.operacaoId }
      ],
      filtradas
    );

  const colunas = [
    { key: 'numeroTitulo', label: 'Título' },
    { key: 'numeroNF', label: 'NF' },
    {
      key: 'sacado',
      label: 'Sacado',
      render: (linha) => (
        <Celula>
          {linha.sacado.nome}
          <span>{formatCNPJ(linha.sacado.cnpj)}</span>
        </Celula>
      )
    },
    { key: 'dataEmissao', label: 'Emissão', render: (linha) => formatDate(linha.dataEmissao) },
    { key: 'vencimento', label: 'Vencimento', render: (linha) => formatDate(linha.vencimento) },
    {
      key: 'valorOriginal',
      label: 'Valor original',
      numeric: true,
      align: 'right',
      render: (linha) => formatCurrency(linha.valorOriginal)
    },
    { key: 'valor', label: 'Saldo', numeric: true, align: 'right', render: (linha) => formatCurrency(linha.valor) },
    {
      key: 'aceite',
      label: 'Aceite',
      render: (linha) => <StatusBadge tom={TOM_ACEITE[linha.aceite]}>{ACEITE_LABEL[linha.aceite]}</StatusBadge>
    },
    { key: 'situacao', label: 'Situação', render: (linha) => <BadgeSituacao situacao={linha.situacao} /> },
    { key: 'statusRegistro', label: 'Registro', render: (linha) => <BadgeRegistro status={linha.statusRegistro} /> }
  ];

  const indicador = (rotulo, situacoes, campo = 'valorOriginal') => {
    const lista = duplicatas.filter((duplicata) => situacoes.includes(duplicata.situacao));
    return (
      <Card padding={16}>
        <Indicador>
          <div className="rotulo">{rotulo}</div>
          <div className="valor">{formatCurrency(lista.reduce((soma, duplicata) => soma + duplicata[campo], 0))}</div>
          <div className="contagem">{plural(lista.length)}</div>
        </Indicador>
      </Card>
    );
  };

  const acoesDetalhe = (duplicata) => {
    if (duplicata.situacao === 'em_aberto') {
      return (
        <>
          <Button variant="ghost" onClick={() => setAcao('cancelar')} leftIcon={icone('circle-x')}>Cancelar</Button>
          <Button variant="secondary" onClick={() => setAcao('baixar')} leftIcon={icone('circle-check')}>Baixar</Button>
          <Button variant="secondary" onClick={() => setAcao('parcial')} leftIcon={icone('wallet')}>
            Registrar pagamento parcial
          </Button>
          <Button
            disabled={!duplicata.elegivel}
            onClick={() => navegar('recebiveis', { recebivelIds: [duplicata.id] })}
            leftIcon={icone('zap')}
          >
            Antecipar
          </Button>
        </>
      );
    }
    if (duplicata.operacaoId) {
      return (
        <Button onClick={() => navegar('operacoes', { operacaoId: duplicata.operacaoId })} leftIcon={icone('eye')}>
          Ver operação
        </Button>
      );
    }
    return null;
  };

  return (
    <Container>
      <PageHeader>
        <div>
          <h1>Duplicatas</h1>
          <p>Duplicatas escrituradas e o histórico de cada uma. Clique em uma duplicata para ver os detalhes.</p>
        </div>
        <Button variant="secondary" disabled={filtradas.length === 0} onClick={exportar} leftIcon={icone('download')}>
          Exportar
        </Button>
      </PageHeader>

      {carregando && !dados && <LoadingState linhas={5} altura={40} label="Carregando duplicatas" />}

      {erro && !carregando && (
        <ErrorState titulo="Não foi possível carregar as duplicatas" mensagem={erro.message} onRetry={recarregar} />
      )}

      {dados && !erro && (
        <>
          <Cards>
            {indicador('Em aberto (saldo)', ['em_aberto'], 'valor')}
            {indicador('Cedidas', ['cedido'])}
            {indicador('Liquidadas', ['liquidado'])}
            {indicador('Baixadas ou canceladas', ['baixado', 'cancelado'])}
          </Cards>

          <Filtros>
            <SearchField
              value={busca}
              onChange={setBusca}
              placeholder="Título, NF, sacado ou CNPJ"
              onClear={() => setBusca('')}
            />
            <Select
              label="Situação"
              value={situacao}
              onChange={setSituacao}
              placeholder="Todas"
              options={opcoes(SITUACAO_DUPLICATA_LABEL)}
            />
            <Select label="Aceite" value={aceite} onChange={setAceite} placeholder="Todos" options={opcoes(ACEITE_LABEL)} />
          </Filtros>

          {filtradas.length === 0 ? (
            <EmptyState
              icone="folder-open"
              titulo="Nenhuma duplicata encontrada"
              descricao="Ajuste a busca ou os filtros para ver os resultados."
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <Table columns={colunas} rows={filtradas} rowKey="id" onRowClick={setDetalhe} style={{ minWidth: 1180 }} />
            </div>
          )}
        </>
      )}

      {detalhe && !acao && (
        <DetalheDuplicataModal
          duplicata={detalhe}
          onClose={() => setDetalhe(null)}
          acoes={acoesDetalhe(detalhe)}
          aviso={
            detalhe.situacao === 'em_aberto' && !detalhe.elegivel
              ? `Não pode ser antecipada: ${detalhe.motivoInelegibilidade}.`
              : undefined
          }
        />
      )}
      {detalhe && acao && (
        <AcaoDuplicataModal acao={acao} duplicata={detalhe} onClose={() => setAcao(null)} onConcluir={concluirAcao} />
      )}
    </Container>
  );
};

export default Duplicatas;
