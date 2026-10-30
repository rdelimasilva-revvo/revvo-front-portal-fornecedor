import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';

import { Button, Card, List, ListItem, Switch, Table, Tabs } from '../../../ds';
import { useRequisicao } from '../../../hooks/useRequisicao';
import {
  listarNotificacoes,
  marcarComoLida,
  marcarTodasComoLidas,
  obterPreferencias,
  salvarPreferencias
} from '../../../services/notificacoesService';
import { formatDateTime } from '../../../utils/format';
import { EVENTOS_NOTIFICACAO } from '../../../types/entities';
import { EmptyState, ErrorState, LoadingState } from '../../Common/States';

const Container = styled.div`
  padding: 24px;
  max-width: 1100px;
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

const BarraAcoes = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  font-size: var(--fs-body-sm);
  color: var(--text-muted);
`;

const Mensagem = styled.span`
  display: block;
  font-size: var(--fs-caption);
  color: var(--text-muted);
  margin-top: 2px;
`;

const RodapePreferencias = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
`;

const ICONE_EVENTO = {
  operacao_aprovada: 'send',
  operacao_recusada: 'circle-x',
  credito_realizado: 'circle-check',
  titulo_vencido: 'calendar-clock',
  registro_pendente: 'clock'
};

const COR_EVENTO = {
  operacao_aprovada: 'var(--revvo-blue-500)',
  operacao_recusada: 'var(--danger-500)',
  credito_realizado: 'var(--revvo-green-600)',
  titulo_vencido: 'var(--warning-500)',
  registro_pendente: 'var(--warning-500)'
};

const Notificacoes = ({ onNavegar }) => {
  const [aba, setAba] = useState('central');
  const [preferencias, setPreferencias] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const central = useRequisicao(() => listarNotificacoes(), []);
  const preferenciasRequisicao = useRequisicao(() => obterPreferencias(), []);

  useEffect(() => {
    if (preferenciasRequisicao.dados) setPreferencias(preferenciasRequisicao.dados);
  }, [preferenciasRequisicao.dados]);

  const notificacoes = central.dados || [];
  const naoLidas = notificacoes.filter((notificacao) => !notificacao.lida).length;

  const abrir = async (notificacao) => {
    if (!notificacao.lida) {
      try {
        const atualizadas = await marcarComoLida(notificacao.id);
        central.setDados(atualizadas);
      } catch {
        // Falha ao marcar como lida não impede a navegação.
      }
    }
    if (notificacao.operacaoId) onNavegar('operacoes', { operacaoId: notificacao.operacaoId });
  };

  const marcarTodas = async () => {
    try {
      const atualizadas = await marcarTodasComoLidas();
      central.setDados(atualizadas);
    } catch (falha) {
      toast.error(falha.message || 'Não foi possível marcar como lidas.');
    }
  };

  const alternarCanal = (evento, canal) =>
    setPreferencias((atuais) => ({
      ...atuais,
      [evento]: { ...atuais[evento], [canal]: !atuais[evento][canal] }
    }));

  const salvar = async () => {
    setSalvando(true);
    try {
      await salvarPreferencias(preferencias);
      toast.success('Preferências salvas.');
    } catch (falha) {
      toast.error(falha.message || 'Não foi possível salvar as preferências.');
    } finally {
      setSalvando(false);
    }
  };

  const colunasPreferencias = [
    { key: 'label', label: 'Evento' },
    {
      key: 'email',
      label: 'E-mail',
      align: 'center',
      width: 140,
      render: (linha) => (
        <Switch
          checked={preferencias?.[linha.id]?.email || false}
          onChange={() => alternarCanal(linha.id, 'email')}
          id={`email-${linha.id}`}
        />
      )
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      align: 'center',
      width: 140,
      render: (linha) => (
        <Switch
          checked={preferencias?.[linha.id]?.whatsapp || false}
          onChange={() => alternarCanal(linha.id, 'whatsapp')}
          id={`whatsapp-${linha.id}`}
        />
      )
    }
  ];

  return (
    <Container>
      <PageHeader>
        <h1>Notificações</h1>
        <p>Avisos das suas operações e por onde você quer ser avisado.</p>
      </PageHeader>

      <Tabs
        tabs={[
          { value: 'central', label: 'Central de avisos', count: naoLidas || undefined },
          { value: 'preferencias', label: 'Preferências' }
        ]}
        value={aba}
        onChange={setAba}
        style={{ marginBottom: 20 }}
      />

      {aba === 'central' && (
        <>
          <BarraAcoes>
            <span>{naoLidas === 0 ? 'Tudo lido' : `${naoLidas} aviso(s) não lido(s)`}</span>
            {naoLidas > 0 && (
              <Button variant="ghost" size="sm" onClick={marcarTodas}>
                Marcar todas como lidas
              </Button>
            )}
          </BarraAcoes>

          {central.carregando && <LoadingState linhas={4} altura={64} label="Carregando avisos" />}

          {central.erro && !central.carregando && (
            <ErrorState mensagem={central.erro.message} onRetry={central.recarregar} />
          )}

          {!central.carregando && !central.erro && notificacoes.length === 0 && (
            <EmptyState
              icone="bell-off"
              titulo="Nenhum aviso por aqui"
              descricao="Assim que houver movimentação nas suas operações, os avisos aparecem nesta lista."
              acaoLabel="Ver operações"
              onAcao={() => onNavegar('operacoes')}
            />
          )}

          {!central.carregando && !central.erro && notificacoes.length > 0 && (
            <List>
              {notificacoes.map((notificacao) => (
                <ListItem
                  key={notificacao.id}
                  selected={!notificacao.lida}
                  onClick={() => abrir(notificacao)}
                  leading={
                    <i
                      data-lucide={ICONE_EVENTO[notificacao.evento] || 'info'}
                      style={{ width: 18, height: 18, color: COR_EVENTO[notificacao.evento] }}
                    />
                  }
                  title={notificacao.titulo}
                  subtitle={<Mensagem>{notificacao.mensagem}</Mensagem>}
                  meta={formatDateTime(notificacao.dataHora)}
                  trailing={notificacao.operacaoId}
                />
              ))}
            </List>
          )}
        </>
      )}

      {aba === 'preferencias' && (
        <Card padding={24}>
          {preferenciasRequisicao.carregando && <LoadingState linhas={3} altura={40} label="Carregando preferências" />}

          {preferenciasRequisicao.erro && (
            <ErrorState mensagem={preferenciasRequisicao.erro.message} onRetry={preferenciasRequisicao.recarregar} />
          )}

          {preferencias && !preferenciasRequisicao.carregando && (
            <>
              <Table columns={colunasPreferencias} rows={EVENTOS_NOTIFICACAO} rowKey="id" dense />
              <RodapePreferencias>
                <Button onClick={salvar} disabled={salvando}>
                  {salvando ? 'Salvando…' : 'Salvar preferências'}
                </Button>
              </RodapePreferencias>
            </>
          )}
        </Card>
      )}
    </Container>
  );
};

export default Notificacoes;
