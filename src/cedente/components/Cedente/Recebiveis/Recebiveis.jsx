import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

import { Button, Checkbox, Drawer, Input, SearchField, Select, Table } from '../../../ds';
import { useRequisicao } from '../../../hooks/useRequisicao';
import { listarRecebiveis, listarSacados } from '../../../services/recebiveisService';
import { calcularSimulacao } from '../../../services/simulacaoService';
import { formatCNPJ, formatCurrency, formatDate } from '../../../utils/format';
import { ORIGEM_LABEL, STATUS_REGISTRO_LABEL } from '../../../types/entities';
import StatusBadge, { TOM_STATUS_REGISTRO } from '../../Common/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../../Common/States';
import PainelSimulacao from './PainelSimulacao';
import ImportarModal from './ImportarModal';
import ContratacaoModal from '../Contratacao/ContratacaoModal';

const Container = styled.div`
  padding: 24px;
  max-width: 1600px;
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

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: 16px;
  align-items: start;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const Conteudo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
`;

const Filtros = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  padding: 16px;
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  align-items: end;

  /* O botão fecha a última linha, alinhado à direita. */
  > button:last-child {
    grid-column: -2 / -1;
    justify-self: end;
  }

  @media (max-width: 1280px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 700px) {
    grid-template-columns: 1fr;

    > button:last-child {
      grid-column: 1 / -1;
      justify-self: stretch;
    }
  }
`;

const FaixaSelecao = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  background: var(--accent-soft-bg);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  font-size: var(--fs-body-sm);
  color: var(--text-body);
`;

const OrdenarPor = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  padding: 0;
  height: auto;
  font: inherit;
  color: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  cursor: pointer;

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
    border-radius: 2px;
  }
`;

const Rodape = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: var(--fs-caption);
  color: var(--text-muted);
  flex-wrap: wrap;
`;

const NaoExibidos = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: help;

  .tooltip {
    position: absolute;
    bottom: calc(100% + 8px);
    right: 0;
    width: 330px;
    background: var(--surface-inverse);
    color: var(--text-on-brand);
    border-radius: var(--radius-md);
    padding: 10px 12px;
    font-size: 12px;
    line-height: 1.5;
    z-index: var(--z-dropdown);
    box-shadow: var(--shadow-lg);
    text-align: left;

    ul {
      margin: 6px 0 0;
      padding-left: 16px;
    }
  }
`;

const DetalheCampo = styled.div`
  padding: 10px 0;
  border-bottom: 1px solid var(--border-subtle);

  .rotulo {
    font-size: 12px;
    color: var(--text-muted);
  }

  .valor {
    font-size: var(--fs-body-sm);
    color: var(--text-strong);
    margin-top: 2px;
  }
`;

const ORDENAVEIS = {
  sacado: (item) => item.sacado.nome,
  titulo: (item) => item.numeroTitulo,
  valor: (item) => item.valor,
  vencimento: (item) => item.vencimento,
  registro: (item) => item.statusRegistro
};

const FILTROS_VAZIOS = {
  busca: '',
  sacadoId: '',
  vencimentoDe: '',
  vencimentoAte: '',
  valorMin: '',
  valorMax: '',
  statusRegistro: ''
};

const Recebiveis = ({ onNavegar, parametros }) => {
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS);
  const [ordenacao, setOrdenacao] = useState({ coluna: 'vencimento', direcao: 'asc' });
  const [selecionados, setSelecionados] = useState(() => new Set(parametros?.recebivelIds || []));
  const [detalhe, setDetalhe] = useState(null);
  const [mostrarImportar, setMostrarImportar] = useState(false);
  const [mostrarContratacao, setMostrarContratacao] = useState(false);
  const [tooltipAberto, setTooltipAberto] = useState(false);

  const filtrosAplicados = useMemo(() => filtros, [filtros]);
  const { dados, carregando, erro, recarregar } = useRequisicao(
    () => listarRecebiveis(filtrosAplicados),
    [JSON.stringify(filtrosAplicados)]
  );
  const sacados = useRequisicao(() => listarSacados(), []);

  // A pré-seleção vem de outra tela: na primeira carga, descarta o que não está na lista.
  const preSelecaoAjustada = useRef(false);
  useEffect(() => {
    if (!dados?.itens || preSelecaoAjustada.current || !parametros?.recebivelIds?.length) return;
    preSelecaoAjustada.current = true;
    const carregados = new Set(dados.itens.map((item) => item.id));
    setSelecionados((atuais) => new Set([...atuais].filter((id) => carregados.has(id))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dados]);

  const ordenados = useMemo(() => {
    const itens = dados?.itens || [];
    const valorDe = ORDENAVEIS[ordenacao.coluna];
    if (!valorDe) return itens;

    return [...itens].sort((a, b) => {
      const valorA = valorDe(a);
      const valorB = valorDe(b);
      const comparacao =
        typeof valorA === 'number' && typeof valorB === 'number'
          ? valorA - valorB
          : String(valorA).localeCompare(String(valorB), 'pt-BR');
      return ordenacao.direcao === 'asc' ? comparacao : -comparacao;
    });
  }, [dados, ordenacao]);

  const selecionadosVisiveis = ordenados.filter((item) => selecionados.has(item.id));
  const simulacao = useMemo(
    () => (selecionadosVisiveis.length > 0 ? calcularSimulacao(selecionadosVisiveis) : null),
    [selecionadosVisiveis]
  );

  const todosSelecionados = ordenados.length > 0 && ordenados.every((item) => selecionados.has(item.id));

  const alternarSelecao = (id) =>
    setSelecionados((atuais) => {
      const novo = new Set(atuais);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });

  const alternarTodos = () =>
    setSelecionados((atuais) => {
      const novo = new Set(atuais);
      if (todosSelecionados) ordenados.forEach((item) => novo.delete(item.id));
      else ordenados.forEach((item) => novo.add(item.id));
      return novo;
    });

  const ordenarPor = (coluna) =>
    setOrdenacao((atual) => ({
      coluna,
      direcao: atual.coluna === coluna && atual.direcao === 'asc' ? 'desc' : 'asc'
    }));

  const cabecalho = (coluna, texto) => (
    <OrdenarPor type="button" onClick={() => ordenarPor(coluna)}>
      {texto}
      {ordenacao.coluna === coluna && (
        <i
          data-lucide={ordenacao.direcao === 'asc' ? 'chevron-up' : 'chevron-down'}
          style={{ width: 12, height: 12 }}
        />
      )}
    </OrdenarPor>
  );

  const colunas = [
    {
      key: 'selecao',
      width: 44,
      label: (
        <Checkbox checked={todosSelecionados} onChange={alternarTodos} id="selecionar-todos-recebiveis" />
      ),
      render: (item) => (
        <Checkbox
          checked={selecionados.has(item.id)}
          onChange={() => alternarSelecao(item.id)}
          id={`selecionar-${item.id}`}
        />
      )
    },
    { key: 'sacado', label: cabecalho('sacado', 'Sacado'), render: (item) => item.sacado.nome },
    {
      key: 'titulo',
      label: cabecalho('titulo', 'Nº título / NF'),
      render: (item) => (
        <>
          {item.numeroTitulo}
          <span style={{ color: 'var(--text-muted)' }}> · NF {item.numeroNF}</span>
        </>
      )
    },
    {
      key: 'valor',
      label: cabecalho('valor', 'Valor'),
      numeric: true,
      render: (item) => formatCurrency(item.valor)
    },
    {
      key: 'vencimento',
      label: cabecalho('vencimento', 'Vencimento'),
      render: (item) => formatDate(item.vencimento)
    },
    {
      key: 'registro',
      label: cabecalho('registro', 'Status de registro'),
      render: (item) => (
        <StatusBadge tom={TOM_STATUS_REGISTRO[item.statusRegistro]}>
          {STATUS_REGISTRO_LABEL[item.statusRegistro]}
        </StatusBadge>
      )
    },
    {
      key: 'acoes',
      label: 'Ações',
      width: 80,
      align: 'center',
      render: (item) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDetalhe(item)}
          aria-label={`Ver detalhes do título ${item.numeroTitulo}`}
        >
          <i data-lucide="eye" style={{ width: 15, height: 15 }} />
        </Button>
      )
    }
  ];

  const atualizarFiltro = (campo, valor) => setFiltros((atuais) => ({ ...atuais, [campo]: valor }));

  const valorTotalSelecionado = selecionadosVisiveis.reduce((total, item) => total + item.valor, 0);

  const aoContratar = (operacao) => {
    setMostrarContratacao(false);
    setSelecionados(new Set());
    recarregar();
    onNavegar('operacoes', { operacaoId: operacao.id });
  };

  return (
    <Container>
      <PageHeader>
        <div>
          <h1>Recebíveis</h1>
          <p>Só aparecem aqui os títulos de sacados aprovados pelo financiador e disponíveis para antecipação.</p>
        </div>
        <Button
          onClick={() => setMostrarImportar(true)}
          leftIcon={<i data-lucide="file-up" style={{ width: 16, height: 16 }} />}
        >
          Importar
        </Button>
      </PageHeader>

      <Layout>
        <Conteudo>
          <Filtros>
            <SearchField
              value={filtros.busca}
              onChange={(valor) => atualizarFiltro('busca', valor)}
              placeholder="Sacado, CNPJ, título ou NF"
              onClear={() => atualizarFiltro('busca', '')}
            />

            <Select
              label="Sacado"
              value={filtros.sacadoId}
              onChange={(valor) => atualizarFiltro('sacadoId', valor)}
              placeholder="Todos"
              options={(sacados.dados || []).map((sacado) => ({ value: sacado.id, label: sacado.nome }))}
            />

            <Select
              label="Status de registro"
              value={filtros.statusRegistro}
              onChange={(valor) => atualizarFiltro('statusRegistro', valor)}
              placeholder="Todos"
              options={Object.entries(STATUS_REGISTRO_LABEL).map(([value, label]) => ({ value, label }))}
            />

            <Input
              label="Vencimento de"
              type="date"
              value={filtros.vencimentoDe}
              onChange={(evento) => atualizarFiltro('vencimentoDe', evento.target.value)}
            />

            <Input
              label="Vencimento até"
              type="date"
              value={filtros.vencimentoAte}
              onChange={(evento) => atualizarFiltro('vencimentoAte', evento.target.value)}
            />

            <Input
              label="Valor mínimo"
              type="number"
              min="0"
              placeholder="0,00"
              value={filtros.valorMin}
              onChange={(evento) => atualizarFiltro('valorMin', evento.target.value)}
            />

            <Input
              label="Valor máximo"
              type="number"
              min="0"
              placeholder="0,00"
              value={filtros.valorMax}
              onChange={(evento) => atualizarFiltro('valorMax', evento.target.value)}
            />

            <Button variant="secondary" onClick={() => setFiltros(FILTROS_VAZIOS)}>
              Limpar
            </Button>
          </Filtros>

          {selecionados.size > 0 && (
            <FaixaSelecao>
              <span>
                {selecionados.size} título(s) selecionado(s) · {formatCurrency(valorTotalSelecionado)}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setSelecionados(new Set())}>
                Limpar seleção
              </Button>
            </FaixaSelecao>
          )}

          {carregando && <LoadingState linhas={6} altura={40} label="Carregando recebíveis" />}

          {erro && !carregando && (
            <ErrorState
              titulo="Não foi possível carregar os recebíveis"
              mensagem={erro.message}
              onRetry={recarregar}
            />
          )}

          {!carregando && !erro && ordenados.length === 0 && (
            <EmptyState
              icone="inbox"
              titulo="Nenhum recebível disponível"
              descricao="Importe títulos por XML de NF-e, arquivo CSV/CNAB ou consulta à registradora para começar."
              acaoLabel="Importar recebíveis"
              onAcao={() => setMostrarImportar(true)}
            />
          )}

          {!carregando && !erro && ordenados.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <Table columns={colunas} rows={ordenados} rowKey="id" dense style={{ minWidth: 900 }} />
            </div>
          )}

          <Rodape>
            <span>
              {ordenados.length} título(s) exibido(s)
              {selecionados.size > 0 && ` · ${selecionados.size} selecionado(s)`}
            </span>

            {dados?.naoExibidos?.total > 0 && (
              <NaoExibidos
                onMouseEnter={() => setTooltipAberto(true)}
                onMouseLeave={() => setTooltipAberto(false)}
                onFocus={() => setTooltipAberto(true)}
                onBlur={() => setTooltipAberto(false)}
                tabIndex={0}
                role="note"
                aria-label={`${dados.naoExibidos.total} títulos não exibidos`}
              >
                <i data-lucide="info" style={{ width: 14, height: 14 }} />
                {dados.naoExibidos.total} título(s) não exibido(s)
                {tooltipAberto && (
                  <div className="tooltip">
                    Não estão disponíveis para antecipação:
                    <ul>
                      {dados.naoExibidos.motivos.map((item) => (
                        <li key={item.motivo}>
                          {item.quantidade} — {item.motivo}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </NaoExibidos>
            )}
          </Rodape>
        </Conteudo>

        <PainelSimulacao simulacao={simulacao} onContratar={() => setMostrarContratacao(true)} />
      </Layout>

      <Drawer
        open={!!detalhe}
        onClose={() => setDetalhe(null)}
        title={detalhe ? `Título ${detalhe.numeroTitulo}` : ''}
        width={420}
      >
        {detalhe && (
          <div>
            <DetalheCampo>
              <div className="rotulo">Sacado</div>
              <div className="valor">{detalhe.sacado.nome}</div>
            </DetalheCampo>
            <DetalheCampo>
              <div className="rotulo">CNPJ do sacado</div>
              <div className="valor">{formatCNPJ(detalhe.sacado.cnpj)}</div>
            </DetalheCampo>
            <DetalheCampo>
              <div className="rotulo">Nota fiscal</div>
              <div className="valor">{detalhe.numeroNF}</div>
            </DetalheCampo>
            <DetalheCampo>
              <div className="rotulo">Valor</div>
              <div className="valor">{formatCurrency(detalhe.valor)}</div>
            </DetalheCampo>
            <DetalheCampo>
              <div className="rotulo">Vencimento</div>
              <div className="valor">{formatDate(detalhe.vencimento)}</div>
            </DetalheCampo>
            <DetalheCampo>
              <div className="rotulo">Origem</div>
              <div className="valor">{ORIGEM_LABEL[detalhe.origem]}</div>
            </DetalheCampo>
            <DetalheCampo>
              <div className="rotulo">Status de registro</div>
              <div className="valor">
                <StatusBadge tom={TOM_STATUS_REGISTRO[detalhe.statusRegistro]}>
                  {STATUS_REGISTRO_LABEL[detalhe.statusRegistro]}
                </StatusBadge>
              </div>
            </DetalheCampo>
          </div>
        )}
      </Drawer>

      {mostrarImportar && (
        <ImportarModal
          onFechar={() => setMostrarImportar(false)}
          onImportado={() => {
            setMostrarImportar(false);
            recarregar();
          }}
        />
      )}

      {mostrarContratacao && simulacao && (
        <ContratacaoModal
          simulacao={simulacao}
          onFechar={() => setMostrarContratacao(false)}
          onContratado={aoContratar}
        />
      )}
    </Container>
  );
};

export default Recebiveis;
