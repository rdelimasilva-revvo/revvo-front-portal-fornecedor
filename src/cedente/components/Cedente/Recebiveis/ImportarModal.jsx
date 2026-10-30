import React, { useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';

import { Alert, Button, Card, FileUpload, Modal, Table, Tabs } from '../../../ds';
import { confirmarImportacao, consultarRegistradora, importarArquivos } from '../../../services/recebiveisService';
import { formatCNPJ, formatCurrency, formatDate } from '../../../utils/format';
import { ORIGEM_LABEL } from '../../../types/entities';

const Resumo = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 700px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ItemResumo = styled.div`
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 12px;

  .rotulo {
    font-size: 12px;
    color: var(--text-muted);
  }

  .valor {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: ${(props) => props.$cor || 'var(--text-strong)'};
  }
`;

const Secao = styled.section`
  margin-bottom: 20px;

  h3 {
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-semibold);
    margin: 0 0 8px;
  }

  .rolagem {
    max-height: 260px;
    overflow: auto;
  }
`;

const Consulta = styled.div`
  text-align: center;
  padding: 28px 16px;

  h3 {
    font-size: 15px;
    font-weight: var(--fw-semibold);
    margin: 12px 0 4px;
  }

  p {
    font-size: var(--fs-body-sm);
    color: var(--text-muted);
    margin: 0 auto 16px;
    max-width: 460px;
  }
`;

const RodapeModal = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;

  .contagem {
    font-size: var(--fs-caption);
    color: var(--text-muted);
  }

  .acoes {
    display: flex;
    gap: 8px;
  }
`;

const ORIGENS = [
  { value: 'xml', label: 'XML de NF-e' },
  { value: 'arquivo', label: 'Arquivo CSV/CNAB' },
  { value: 'registradora', label: 'Registradora' }
];

const ACEITE_POR_ORIGEM = {
  xml: '.xml',
  arquivo: '.csv,.txt,.rem,.ret,.cnab'
};

const COLUNAS_ERRO = [
  { key: 'arquivo', label: 'Arquivo' },
  { key: 'referencia', label: 'Referência' },
  { key: 'motivo', label: 'Motivo' }
];

const COLUNAS_DUPLICADO = [
  { key: 'numeroTitulo', label: 'Título' },
  { key: 'sacado', label: 'Sacado', render: (linha) => linha.sacado.nome },
  { key: 'valor', label: 'Valor', numeric: true, render: (linha) => formatCurrency(linha.valor) },
  { key: 'motivo', label: 'Motivo' }
];

/**
 * Importação em duas etapas: escolha da origem e conferência.
 * Nada entra na base do cedente antes de "Confirmar importação".
 */
const ImportarModal = ({ onFechar, onImportado }) => {
  const [origem, setOrigem] = useState('xml');
  const [arquivos, setArquivos] = useState([]);
  const [lendo, setLendo] = useState(false);
  const [conferencia, setConferencia] = useState(null);
  const [descartados, setDescartados] = useState(new Set());
  const [confirmando, setConfirmando] = useState(false);

  const lerSelecionados = async () => {
    if (arquivos.length === 0) return;
    setLendo(true);
    try {
      const resultado = await importarArquivos(arquivos);
      setConferencia(resultado);
      setDescartados(new Set());
    } catch (falha) {
      toast.error(falha.message || 'Não foi possível ler os arquivos.');
    } finally {
      setLendo(false);
    }
  };

  const consultarCerc = async () => {
    setLendo(true);
    try {
      const resultado = await consultarRegistradora();
      setConferencia(resultado);
      setDescartados(new Set());
    } catch (falha) {
      toast.error(falha.message || 'Não foi possível consultar a registradora.');
    } finally {
      setLendo(false);
    }
  };

  const titulosParaImportar = (conferencia?.novos || []).filter((titulo) => !descartados.has(titulo.id));

  const confirmar = async () => {
    setConfirmando(true);
    try {
      const resultado = await confirmarImportacao(titulosParaImportar);
      toast.success(
        `${resultado.importados} título(s) importado(s) · ${resultado.elegiveis} disponível(is) para antecipação`
      );
      onImportado();
    } catch (falha) {
      toast.error(falha.message || 'Não foi possível confirmar a importação.');
    } finally {
      setConfirmando(false);
    }
  };

  const voltar = () => {
    setConferencia(null);
    setDescartados(new Set());
  };

  const colunasNovos = [
    { key: 'numeroTitulo', label: 'Título' },
    { key: 'numeroNF', label: 'NF' },
    { key: 'sacado', label: 'Sacado', render: (linha) => linha.sacado.nome },
    { key: 'cnpj', label: 'CNPJ', render: (linha) => formatCNPJ(linha.sacado.cnpj) },
    { key: 'valor', label: 'Valor', numeric: true, render: (linha) => formatCurrency(linha.valor) },
    { key: 'vencimento', label: 'Vencimento', render: (linha) => formatDate(linha.vencimento) },
    { key: 'origem', label: 'Origem', render: (linha) => ORIGEM_LABEL[linha.origem] },
    {
      key: 'acao',
      label: 'Ação',
      align: 'center',
      render: (linha) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setDescartados((atuais) => {
              const novo = new Set(atuais);
              if (novo.has(linha.id)) novo.delete(linha.id);
              else novo.add(linha.id);
              return novo;
            })
          }
        >
          {descartados.has(linha.id) ? 'Restaurar' : 'Descartar'}
        </Button>
      )
    }
  ];

  const rodape = (
    <RodapeModal>
      <span className="contagem">
        {conferencia
          ? `${titulosParaImportar.length} de ${conferencia.lidos} título(s) serão importados`
          : origem === 'registradora'
            ? 'A consulta não importa nada automaticamente'
            : `${arquivos.length} arquivo(s) selecionado(s)`}
      </span>

      <div className="acoes">
        {conferencia ? (
          <>
            <Button variant="secondary" onClick={voltar}>
              Voltar
            </Button>
            <Button onClick={confirmar} disabled={confirmando || titulosParaImportar.length === 0}>
              {confirmando ? 'Importando…' : 'Confirmar importação'}
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={onFechar}>
              Cancelar
            </Button>
            {origem !== 'registradora' && (
              <Button onClick={lerSelecionados} disabled={lendo || arquivos.length === 0}>
                {lendo ? 'Lendo arquivos…' : 'Conferir títulos'}
              </Button>
            )}
          </>
        )}
      </div>
    </RodapeModal>
  );

  return (
    <Modal
      open
      onClose={onFechar}
      title={conferencia ? 'Conferência da importação' : 'Importar recebíveis'}
      footer={rodape}
      size="lg"
      style={{ maxWidth: 920 }}
    >
      {!conferencia && (
        <>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px' }}>
            Traga seus títulos por XML de NF-e, arquivo CSV/CNAB ou consulta à registradora.
          </p>

          <Tabs
            tabs={ORIGENS}
            value={origem}
            onChange={(valor) => {
              setOrigem(valor);
              setArquivos([]);
            }}
            style={{ marginBottom: 20 }}
          />

          {origem === 'registradora' ? (
            <Consulta>
              <i data-lucide="database" style={{ width: 30, height: 30, color: 'var(--text-muted)' }} />
              <h3>Consultar duplicatas na registradora</h3>
              <p>
                Traz as duplicatas escriturais já registradas em nome do seu CNPJ na CERC. Depende do opt-in concedido
                à registradora — títulos com ônus ou já cedidos não retornam.
              </p>
              <Button onClick={consultarCerc} disabled={lendo}>
                {lendo ? 'Consultando…' : 'Consultar registradora'}
              </Button>
            </Consulta>
          ) : (
            <FileUpload
              multiple
              accept={ACEITE_POR_ORIGEM[origem]}
              files={arquivos}
              onChange={(novos) => setArquivos((atuais) => [...atuais, ...novos])}
              onRemove={(indice) => setArquivos((atuais) => atuais.filter((_, i) => i !== indice))}
              hint={
                origem === 'xml'
                  ? 'Aceita .xml de NF-e, individual ou em lote'
                  : 'Aceita .csv (sacado;cnpj;titulo;nf;valor;vencimento) e .rem/.ret no layout CNAB 400'
              }
            />
          )}
        </>
      )}

      {conferencia && (
        <>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px' }}>
            Revise o que foi lido antes de confirmar. Nada é importado até você confirmar.
          </p>

          <Resumo>
            <ItemResumo>
              <div className="rotulo">Títulos lidos</div>
              <div className="valor">{conferencia.lidos}</div>
            </ItemResumo>
            <ItemResumo $cor="var(--revvo-green-700)">
              <div className="rotulo">Prontos para importar</div>
              <div className="valor">{titulosParaImportar.length}</div>
            </ItemResumo>
            <ItemResumo $cor={conferencia.duplicados.length > 0 ? 'var(--warning-700)' : undefined}>
              <div className="rotulo">Duplicidades</div>
              <div className="valor">{conferencia.duplicados.length}</div>
            </ItemResumo>
            <ItemResumo $cor={conferencia.erros.length > 0 ? 'var(--danger-700)' : undefined}>
              <div className="rotulo">Erros de leitura</div>
              <div className="valor">{conferencia.erros.length}</div>
            </ItemResumo>
          </Resumo>

          {conferencia.pendentesRegistro > 0 && (
            <Secao>
              <Alert kind="warning" title={`${conferencia.pendentesRegistro} título(s) pendente(s) de registro`}>
                Podem ser importados agora, mas só ficam disponíveis para antecipação depois que a registradora
                confirmar o registro.
              </Alert>
            </Secao>
          )}

          {conferencia.erros.length > 0 && (
            <Secao>
              <h3>Títulos com erro</h3>
              <div className="rolagem">
                <Table columns={COLUNAS_ERRO} rows={conferencia.erros} dense />
              </div>
            </Secao>
          )}

          {conferencia.duplicados.length > 0 && (
            <Secao>
              <h3>Duplicidades descartadas</h3>
              <div className="rolagem">
                <Table columns={COLUNAS_DUPLICADO} rows={conferencia.duplicados} rowKey="id" dense />
              </div>
            </Secao>
          )}

          <Secao>
            <h3>Títulos a importar</h3>
            <div className="rolagem">
              <Table
                columns={colunasNovos}
                rows={conferencia.novos}
                rowKey="id"
                dense
                empty="Nenhum título novo encontrado nesta importação."
              />
            </div>
          </Secao>

          {conferencia.novos.length === 0 && conferencia.erros.length === 0 && (
            <Card padding={16}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Nada novo para importar — todos os títulos lidos já existem na sua base.
              </span>
            </Card>
          )}
        </>
      )}
    </Modal>
  );
};

export default ImportarModal;
