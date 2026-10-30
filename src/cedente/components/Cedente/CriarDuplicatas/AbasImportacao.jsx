import React, { useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';

import { Alert, Button, FileUpload, Input } from '../../../ds';
import { listarSacadosConhecidos } from '../../../services/duplicatasService';
import { baixarCsv } from '../../../utils/exportacao';
import { COLUNAS_PLANILHA, lerNfe, lerPlanilha, somarDias } from './leitores';

const Titulo = styled.h3`
  font-size: var(--fs-h3);
  font-weight: var(--fw-semibold);
  margin: 0 0 4px;
`;

const Descricao = styled.p`
  font-size: var(--fs-body-sm);
  color: var(--text-muted);
  margin: 0 0 16px;
`;

const Campos = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Acoes = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
`;

const Lista = styled.ul`
  margin: 4px 0 0;
  padding-left: 18px;

  li + li {
    margin-top: 2px;
  }

  code {
    font-size: 12px;
  }
`;

const Resultados = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
`;

const icone = (nome) => <i data-lucide={nome} style={{ width: 14, height: 14 }} />;

const instrucoes = (titulo, itens) => (
  <Alert kind="info" title={titulo} style={{ marginTop: 16 }}>
    <Lista>
      {itens.map((item, indice) => (
        <li key={indice}>{item}</li>
      ))}
    </Lista>
  </Alert>
);

const plural = (quantidade, singular, varios) => `${quantidade} ${quantidade === 1 ? singular : varios}`;

/** Resultado por arquivo: o que foi criado e o que falhou. */
const Relatorio = ({ itens }) =>
  itens.length > 0 && (
    <Resultados>
      {itens.map(({ arquivo, criadas, falhas }) => (
        <Alert
          key={arquivo}
          kind={falhas.length === 0 ? 'success' : criadas === 0 ? 'danger' : 'warning'}
          title={`${arquivo}: ${plural(criadas, 'duplicata criada', 'duplicatas criadas')}`}
        >
          {falhas.length > 0 && (
            <Lista>
              {falhas.map((falha, indice) => (
                <li key={indice}>{falha}</li>
              ))}
            </Lista>
          )}
        </Alert>
      ))}
    </Resultados>
  );

const useImportacao = (onCriar, origem, ler) => {
  const [relatorio, setRelatorio] = useState([]);
  const [processando, setProcessando] = useState(false);

  const importar = async (arquivos) => {
    setProcessando(true);
    const itens = [];
    for (const arquivo of arquivos) {
      try {
        const { validas, erros } = ler(await arquivo.text());
        const { criadas, falhas } = await onCriar(validas, origem);
        itens.push({ arquivo: arquivo.name, criadas: criadas.length, falhas: [...erros, ...falhas] });
      } catch (falha) {
        itens.push({ arquivo: arquivo.name, criadas: 0, falhas: [falha.message] });
      }
    }
    setRelatorio(itens);
    setProcessando(false);
    const total = itens.reduce((soma, item) => soma + item.criadas, 0);
    if (total > 0) toast.success(`${plural(total, 'duplicata criada', 'duplicatas criadas')}.`);
    else toast.error('Nenhuma duplicata foi criada. Veja os detalhes abaixo.');
  };

  return { relatorio, processando, importar };
};

export const AbaXml = ({ onCriar }) => {
  const { relatorio, processando, importar } = useImportacao(onCriar, 'xml', (texto) => ({
    validas: lerNfe(texto),
    erros: []
  }));

  return (
    <>
      <FileUpload
        accept=".xml"
        multiple
        disabled={processando}
        hint={processando ? 'Lendo os arquivos...' : 'Arquivos de NF-e em formato XML'}
        onChange={importar}
      />
      <Relatorio itens={relatorio} />
      {instrucoes('Como funciona o upload de XML', [
        'Cada parcela da cobrança da NF-e vira uma duplicata.',
        'Sem parcelas, a duplicata usa o valor total da nota com vencimento em 30 dias após a emissão.',
        'Revise as duplicatas na tabela abaixo antes de enviar para a registradora.'
      ])}
    </>
  );
};

const baixarModelo = () => {
  const [sacado] = listarSacadosConhecidos();
  baixarCsv(
    'modelo-duplicatas',
    COLUNAS_PLANILHA.map((coluna) => ({ rotulo: coluna, valor: (linha) => linha[coluna] })),
    [
      {
        cnpj_sacado: sacado.cnpj,
        nome_sacado: sacado.nome,
        numero_nf: '123456',
        valor: '15000,00',
        vencimento: somarDias(new Date().toISOString().slice(0, 10), 45)
      }
    ]
  );
};

export const AbaPlanilha = ({ onCriar }) => {
  const { relatorio, processando, importar } = useImportacao(onCriar, 'planilha', lerPlanilha);

  return (
    <>
      <FileUpload
        accept=".csv,.txt"
        multiple
        disabled={processando}
        hint={processando ? 'Lendo os arquivos...' : 'Arquivo CSV separado por ponto e vírgula ou vírgula'}
        onChange={importar}
      />
      <Relatorio itens={relatorio} />
      {instrucoes('Formato da planilha', [
        <>
          A primeira linha deve ter as colunas <code>{COLUNAS_PLANILHA.join(';')}</code>.
        </>,
        'Vencimento no formato aaaa-mm-dd ou dd/mm/aaaa. Valor com vírgula ou ponto decimal.',
        'Cada linha vira uma duplicata pendente de envio.'
      ])}
      <Acoes>
        <Button variant="secondary" onClick={baixarModelo} leftIcon={icone('download')}>
          Baixar modelo
        </Button>
      </Acoes>
    </>
  );
};

const TEMPO_BUSCA_MS = 1500;
const esperar = () => new Promise((resolve) => setTimeout(resolve, TEMPO_BUSCA_MS));
const hoje = () => new Date().toISOString().slice(0, 10);
const numeroNF = () => String(Math.floor(100000 + Math.random() * 900000));

// Entre 5 mil e 60 mil, a faixa das notas da carteira de exemplo.
const valorPlausivel = () => Math.round((5000 + Math.random() * 55000) * 100) / 100;

const notasSimuladas = (sacados, emissao) =>
  sacados.map((sacado, indice) => ({
    sacadoNome: sacado.nome,
    sacadoCnpj: sacado.cnpj,
    numeroNF: numeroNF(),
    valor: valorPlausivel(),
    dataEmissao: emissao,
    vencimento: somarDias(hoje(), 30 + indice * 15)
  }));

const avisarResultado = ({ criadas, falhas }, fonte) => {
  if (criadas.length) toast.success(`${plural(criadas.length, 'duplicata criada', 'duplicatas criadas')} a partir de ${fonte}.`);
  falhas.forEach((falha) => toast.error(falha));
};

export const AbaSefaz = ({ onCriar }) => {
  const [busca, setBusca] = useState({ cnpj: '', dataInicio: '', dataFim: '' });
  const [buscando, setBuscando] = useState(false);

  const atualizar = (campo, valor) => setBusca((atual) => ({ ...atual, [campo]: valor }));

  const buscar = async (evento) => {
    evento.preventDefault();
    const cnpj = busca.cnpj.replace(/\D/g, '');
    if (cnpj.length !== 14) {
      toast.error('Informe um CNPJ válido para o sacado.');
      return;
    }
    if (busca.dataFim < busca.dataInicio) {
      toast.error('A data fim deve ser igual ou posterior à data início.');
      return;
    }
    setBuscando(true);
    await esperar();
    const conhecido = listarSacadosConhecidos().find((sacado) => sacado.cnpj === cnpj);
    const sacado = conhecido || { nome: `Sacado ${busca.cnpj}`, cnpj };
    const quantidade = 1 + Math.round(Math.random());
    const emissao = busca.dataFim > hoje() ? hoje() : busca.dataFim;
    avisarResultado(await onCriar(notasSimuladas(Array(quantidade).fill(sacado), emissao), 'sefaz'), 'notas da SEFAZ');
    setBuscando(false);
  };

  return (
    <form onSubmit={buscar}>
      <Titulo>Buscar notas fiscais na SEFAZ</Titulo>
      <Descricao>Informe o sacado e o período de emissão das notas fiscais.</Descricao>
      <Campos>
        <Input
          label="CNPJ do sacado *"
          mask="cnpj"
          value={busca.cnpj}
          onChange={(evento) => atualizar('cnpj', evento.target.value)}
          placeholder="00.000.000/0000-00"
          required
        />
        <Input
          label="Data início *"
          type="date"
          value={busca.dataInicio}
          onChange={(evento) => atualizar('dataInicio', evento.target.value)}
          required
        />
        <Input
          label="Data fim *"
          type="date"
          value={busca.dataFim}
          onChange={(evento) => atualizar('dataFim', evento.target.value)}
          required
        />
      </Campos>
      <Acoes>
        <Button type="submit" disabled={buscando} leftIcon={icone('cloud-check')}>
          {buscando ? 'Buscando...' : 'Buscar na SEFAZ'}
        </Button>
      </Acoes>
      {instrucoes('Como funciona a busca na SEFAZ', [
        'A busca traz as NF-e emitidas para o sacado no período informado.',
        'Cada nota encontrada vira uma duplicata pendente de envio.',
        'Nesta versão a consulta é simulada.'
      ])}
    </form>
  );
};

export const AbaCargasExternas = ({ onCriar }) => {
  const [sincronizando, setSincronizando] = useState(false);

  const sincronizar = async () => {
    setSincronizando(true);
    await esperar();
    const sacados = [...listarSacadosConhecidos()].sort(() => Math.random() - 0.5).slice(0, 1 + Math.round(Math.random()));
    avisarResultado(await onCriar(notasSimuladas(sacados, hoje()), 'erp'), 'cargas do ERP');
    setSincronizando(false);
  };

  return (
    <>
      <Titulo>Carregar notas fiscais de cargas externas</Titulo>
      <Descricao>Sincronize com o ERP para trazer as notas fiscais faturadas.</Descricao>
      <Button onClick={sincronizar} disabled={sincronizando} leftIcon={icone('refresh-cw')}>
        {sincronizando ? 'Sincronizando...' : 'Sincronizar com cargas externas'}
      </Button>
      {instrucoes('Integração com sistemas externos', [
        'As notas faturadas no ERP desde a última sincronização viram duplicatas pendentes de envio.',
        'Nesta versão a sincronização é simulada.'
      ])}
    </>
  );
};
