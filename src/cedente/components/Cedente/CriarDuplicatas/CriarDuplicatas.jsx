import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';

import { Badge, Button, Card, Checkbox, Modal, SearchField, Table, Tabs } from '../../../ds';
import { useRequisicao } from '../../../hooks/useRequisicao';
import {
  criarDuplicata,
  enviarParaRegistradora,
  excluirDuplicata,
  listarDuplicatas
} from '../../../services/duplicatasService';
import { baixarCsv } from '../../../utils/exportacao';
import { formatCNPJ, formatCurrency, formatDate } from '../../../utils/format';
import { EmptyState, ErrorState, LoadingState } from '../../Common/States';
import { BadgeRegistro, DetalheDuplicataModal, ORIGENS, REGISTRO } from '../DuplicatasEscrituradas/DuplicataModais';
import { AbaCargasExternas, AbaPlanilha, AbaSefaz, AbaXml } from './AbasImportacao';
import EntradaManual from './EntradaManual';

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

const Cards = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 900px) {
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

const Painel = styled.div`
  padding: 20px;
  margin-bottom: 24px;
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);

  .abas {
    overflow-x: auto;
    margin-bottom: 20px;
  }
`;

const Filtros = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto auto;
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

const Secao = styled.section`
  h2 {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--fs-h3);
    font-weight: var(--fw-semibold);
    margin: 0 0 12px;
  }

  .rolagem {
    overflow-x: auto;
  }
`;

const Acoes = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const icone = (nome) => <i data-lucide={nome} style={{ width: 14, height: 14 }} />;

const rotuloAba = (nome, texto) => (
  <>
    {icone(nome)}
    {texto}
  </>
);

const ABAS = [
  { value: 'xml', label: rotuloAba('file-up', 'Upload XML'), Conteudo: AbaXml },
  { value: 'sefaz', label: rotuloAba('cloud-check', 'Busca SEFAZ'), Conteudo: AbaSefaz },
  { value: 'erp', label: rotuloAba('refresh-cw', 'Cargas externas'), Conteudo: AbaCargasExternas },
  { value: 'planilha', label: rotuloAba('file-spreadsheet', 'Upload planilha'), Conteudo: AbaPlanilha },
  { value: 'manual', label: rotuloAba('plus', 'Entrada manual'), Conteudo: EntradaManual }
];

// Intervalo de consulta enquanto a registradora não confirma o registro.
const INTERVALO_REGISTRO_MS = 2000;

const plural = (quantidade, singular, varios) => `${quantidade} ${quantidade === 1 ? singular : varios}`;

const CriarDuplicatas = ({ onNavegar }) => {
  const [aba, setAba] = useState('xml');
  const [busca, setBusca] = useState('');
  const [selecionadas, setSelecionadas] = useState(new Set());
  const [detalheDe, setDetalheDe] = useState(null);
  const [exclusaoDe, setExclusaoDe] = useState(null);
  const [confirmandoEnvio, setConfirmandoEnvio] = useState(false);
  const [processando, setProcessando] = useState(false);

  const { dados, carregando, erro, recarregar } = useRequisicao(() => listarDuplicatas({ criadasNoPortal: true }), []);
  const duplicatas = dados || [];

  const emRegistro = duplicatas.some((duplicata) => duplicata.statusRegistro === 'pendente');
  useEffect(() => {
    if (!emRegistro) return undefined;
    const intervalo = setInterval(recarregar, INTERVALO_REGISTRO_MS);
    return () => clearInterval(intervalo);
  }, [emRegistro, recarregar]);

  const pendentes = duplicatas.filter((duplicata) => duplicata.statusRegistro === 'nao_registrada');
  const enviadas = duplicatas.filter((duplicata) => duplicata.statusRegistro !== 'nao_registrada');
  const selecionadasPendentes = pendentes.filter((duplicata) => selecionadas.has(duplicata.id));
  const paraEnviar = selecionadasPendentes.length ? selecionadasPendentes : pendentes;
  const prontasParaAntecipar = duplicatas.filter(
    (duplicata) => duplicata.statusRegistro === 'registrada' && duplicata.elegivel && duplicata.situacao === 'em_aberto'
  );

  const termo = busca.trim().toLowerCase();
  const filtradas = duplicatas.filter(
    (duplicata) =>
      !termo ||
      `${duplicata.numeroTitulo} ${duplicata.numeroNF} ${duplicata.sacado.nome} ${duplicata.sacado.cnpj}`
        .toLowerCase()
        .includes(termo)
  );

  const criar = async (lista, origem) => {
    const resultados = await Promise.allSettled(lista.map((dados) => criarDuplicata({ ...dados, origem })));
    const criadas = resultados.filter((resultado) => resultado.status === 'fulfilled').map((resultado) => resultado.value);
    const falhas = resultados
      .map((resultado, indice) =>
        resultado.status === 'rejected' ? `NF ${lista[indice].numeroNF || 'sem número'}: ${resultado.reason.message}` : null
      )
      .filter(Boolean);
    if (criadas.length) recarregar();
    return { criadas, falhas };
  };

  const alternar = (id) =>
    setSelecionadas((atuais) => {
      const novo = new Set(atuais);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });

  const excluir = async () => {
    setProcessando(true);
    try {
      await excluirDuplicata(exclusaoDe.id);
      toast.success(`Duplicata ${exclusaoDe.numeroTitulo} excluída.`);
      setExclusaoDe(null);
      recarregar();
    } catch (falha) {
      toast.error(falha.message);
    } finally {
      setProcessando(false);
    }
  };

  const enviar = async () => {
    setProcessando(true);
    try {
      const { enviadas: quantidade } = await enviarParaRegistradora(paraEnviar.map((duplicata) => duplicata.id));
      toast.success(`${plural(quantidade, 'duplicata enviada', 'duplicatas enviadas')} para a registradora.`);
      setSelecionadas(new Set());
      setConfirmandoEnvio(false);
      recarregar();
    } catch (falha) {
      toast.error(falha.message);
    } finally {
      setProcessando(false);
    }
  };

  const exportar = () =>
    baixarCsv(
      'duplicatas-criadas',
      [
        { rotulo: 'Título', valor: (linha) => linha.numeroTitulo },
        { rotulo: 'NF', valor: (linha) => linha.numeroNF },
        { rotulo: 'Sacado', valor: (linha) => linha.sacado.nome },
        { rotulo: 'CNPJ do sacado', valor: (linha) => formatCNPJ(linha.sacado.cnpj) },
        { rotulo: 'Emissão', valor: (linha) => formatDate(linha.dataEmissao) },
        { rotulo: 'Vencimento', valor: (linha) => formatDate(linha.vencimento) },
        { rotulo: 'Valor', valor: (linha) => linha.valorOriginal },
        { rotulo: 'Origem', valor: (linha) => ORIGENS[linha.origem] || linha.origem },
        { rotulo: 'Status', valor: (linha) => REGISTRO[linha.statusRegistro]?.label }
      ],
      filtradas
    );

  const colunas = [
    {
      key: 'selecao',
      width: 44,
      label: '',
      render: (linha) =>
        linha.statusRegistro === 'nao_registrada' && (
          <Checkbox checked={selecionadas.has(linha.id)} onChange={() => alternar(linha.id)} id={`criada-${linha.id}`} />
        )
    },
    { key: 'numeroTitulo', label: 'Título' },
    { key: 'numeroNF', label: 'NF' },
    { key: 'sacado', label: 'Sacado', render: (linha) => linha.sacado.nome },
    { key: 'cnpj', label: 'CNPJ', render: (linha) => formatCNPJ(linha.sacado.cnpj) },
    { key: 'dataEmissao', label: 'Emissão', render: (linha) => formatDate(linha.dataEmissao) },
    { key: 'vencimento', label: 'Vencimento', render: (linha) => formatDate(linha.vencimento) },
    { key: 'valor', label: 'Valor', numeric: true, align: 'right', render: (linha) => formatCurrency(linha.valorOriginal) },
    { key: 'origem', label: 'Origem', render: (linha) => ORIGENS[linha.origem] || linha.origem },
    { key: 'status', label: 'Status', render: (linha) => <BadgeRegistro status={linha.statusRegistro} /> },
    {
      key: 'acoes',
      label: '',
      render: (linha) => (
        <Acoes>
          <Button size="sm" variant="secondary" onClick={() => setDetalheDe(linha)} leftIcon={icone('eye')}>
            Detalhes
          </Button>
          {linha.statusRegistro === 'nao_registrada' && (
            <Button size="sm" variant="ghost" onClick={() => setExclusaoDe(linha)} leftIcon={icone('trash-2')}>
              Excluir
            </Button>
          )}
        </Acoes>
      )
    }
  ];

  const indicador = (rotulo, lista) => (
    <Card padding={16}>
      <Indicador>
        <div className="rotulo">{rotulo}</div>
        <div className="valor">{formatCurrency(lista.reduce((soma, duplicata) => soma + duplicata.valorOriginal, 0))}</div>
        <div className="contagem">{plural(lista.length, 'duplicata', 'duplicatas')}</div>
      </Indicador>
    </Card>
  );

  const { Conteudo } = ABAS.find((item) => item.value === aba);

  return (
    <Container>
      <PageHeader>
        <h1>Criar duplicatas</h1>
        <p>Crie duplicatas a partir de notas fiscais e envie para registro.</p>
      </PageHeader>

      <Cards>
        {indicador('Pendentes de envio', pendentes)}
        {indicador('Enviadas à registradora', enviadas)}
        {indicador('Total criado', duplicatas)}
      </Cards>

      <Painel>
        <div className="abas">
          <Tabs tabs={ABAS} value={aba} onChange={setAba} />
        </div>
        <Conteudo onCriar={criar} />
      </Painel>

      <Filtros>
        <SearchField value={busca} onChange={setBusca} placeholder="Título, NF, sacado ou CNPJ" onClear={() => setBusca('')} />
        <Button variant="secondary" disabled={filtradas.length === 0} onClick={exportar} leftIcon={icone('download')}>
          Exportar
        </Button>
        {prontasParaAntecipar.length > 0 && (
          <Button
            variant="secondary"
            onClick={() => onNavegar?.('recebiveis', { recebivelIds: prontasParaAntecipar.map((duplicata) => duplicata.id) })}
            leftIcon={icone('arrow-right')}
          >
            Ver em recebíveis ({prontasParaAntecipar.length})
          </Button>
        )}
        <Button disabled={pendentes.length === 0} onClick={() => setConfirmandoEnvio(true)} leftIcon={icone('send')}>
          Enviar para registradora ({paraEnviar.length})
        </Button>
      </Filtros>

      <Secao>
        <h2>
          Duplicatas criadas
          <Badge tone="neutral">{filtradas.length}</Badge>
        </h2>
        {carregando && !dados && <LoadingState linhas={4} altura={40} label="Carregando duplicatas" />}
        {erro && !carregando && (
          <ErrorState titulo="Não foi possível carregar as duplicatas" mensagem={erro.message} onRetry={recarregar} />
        )}
        {dados && !erro && filtradas.length === 0 && (
          <EmptyState
            icone="file-text"
            titulo="Nenhuma duplicata encontrada"
            descricao="Use as abas acima para criar duplicatas a partir de diferentes fontes."
          />
        )}
        {dados && !erro && filtradas.length > 0 && (
          <div className="rolagem">
            <Table columns={colunas} rows={filtradas} rowKey="id" style={{ minWidth: 1180 }} />
          </div>
        )}
      </Secao>

      {detalheDe && (
        <DetalheDuplicataModal
          duplicata={duplicatas.find((duplicata) => duplicata.id === detalheDe.id) || detalheDe}
          onClose={() => setDetalheDe(null)}
        />
      )}

      {exclusaoDe && (
        <Modal
          open
          onClose={() => setExclusaoDe(null)}
          title="Excluir duplicata"
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setExclusaoDe(null)}>Voltar</Button>
              <Button variant="danger" disabled={processando} onClick={excluir} leftIcon={icone('trash-2')}>
                Excluir
              </Button>
            </>
          }
        >
          A duplicata {exclusaoDe.numeroTitulo} ainda não foi enviada à registradora e será removida. Deseja continuar?
        </Modal>
      )}

      {confirmandoEnvio && (
        <Modal
          open
          onClose={() => setConfirmandoEnvio(false)}
          title="Enviar para registradora"
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setConfirmandoEnvio(false)}>Voltar</Button>
              <Button disabled={processando} onClick={enviar} leftIcon={icone('send')}>
                Enviar
              </Button>
            </>
          }
        >
          {plural(paraEnviar.length, 'duplicata será enviada', 'duplicatas serão enviadas')} para registro na CERC. Depois
          do envio, elas não podem mais ser excluídas.
        </Modal>
      )}
    </Container>
  );
};

export default CriarDuplicatas;
