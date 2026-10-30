import React from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { SideNav } from '../../ds';
import logoRevvo from '../../ds/assets/logo-revvo-cor.svg';
import logoSimbolo from '../../ds/assets/logo-symbol.svg';
import { contarNaoLidas } from '../../services/notificacoesService';

// Menu único do portal, em dois blocos: escrituração e antecipação.
// Fora do menu: o Dashboard do fornecedor (a Home é a página inicial), Minhas
// Duplicatas (repetia Duplicatas) e Antecipações, porque o pedido de desconto
// passa por Recebíveis e Operações.
const MENU = [
  { id: 'cedente-home', label: 'Home', icon: 'house' },
  {
    id: 'bloco-escrituracao',
    label: 'Escrituração',
    icon: 'file-text',
    children: [
      { id: 'escrituracao-criar-duplicatas', label: 'Criar Duplicatas' },
      { id: 'escrituracao-duplicatas', label: 'Duplicatas' },
      { id: 'fornecedor-abatimentos', label: 'Acordos Comerciais' },
      { id: 'escrituracao-liquidacoes', label: 'Liquidações' }
    ]
  },
  {
    id: 'bloco-antecipacao',
    label: 'Antecipação',
    icon: 'zap',
    children: [
      { id: 'cedente-recebiveis', label: 'Recebíveis' },
      { id: 'cedente-operacoes', label: 'Operações' },
      { id: 'antecipacao-contratos', label: 'Contratos' },
      { id: 'antecipacao-extrato', label: 'Extrato' }
    ]
  },
  { id: 'cedente-cadastro', label: 'Cadastro', icon: 'building-2' },
  { id: 'cedente-notificacoes', label: 'Notificações', icon: 'bell' }
];

export const LARGURA_SIDEBAR = 300;
export const LARGURA_SIDEBAR_RECOLHIDA = 64;

const Container = styled.div`
  position: fixed;
  top: 48px;
  left: 0;
  bottom: 0;
  width: ${(props) => (props.$recolhida ? LARGURA_SIDEBAR_RECOLHIDA : LARGURA_SIDEBAR)}px;
  display: flex;
  flex-direction: column;
  background: var(--surface-card);
  border-right: 1px solid var(--border-subtle);
  z-index: 998;
  transition: width var(--duration-base) var(--ease-out), transform var(--duration-base) var(--ease-out);

  nav {
    border-right: none;
    flex: 1;
    overflow-y: auto;
  }

  @media (max-width: 768px) {
    width: ${LARGURA_SIDEBAR}px;
    box-shadow: var(--shadow-lg);
    transform: translateX(${(props) => (props.$aberta ? '0' : '-100%')});
  }
`;

const Marca = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  /* Mesmo espacamento do portal do financiador: 16px acima do logo, nada
     abaixo do titulo e sem separador — lá o bloco tem padding 0 e o respiro
     vem do container, que aqui não existe. */
  padding: ${(props) => (props.$recolhida ? '24px 8px' : '48px 16px 0')};

  /* 40px expandido: mesmo tamanho do logo no portal do financiador. */
  img {
    height: ${(props) => (props.$recolhida ? '26px' : '40px')};
    width: auto;
  }

  /* Mesma tipografia do titulo no portal do financiador. */
  .produto {
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-semibold);
    color: var(--text-strong);
    letter-spacing: -0.28px;
    line-height: 1.3;
  }
`;

const Scrim = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: ${(props) => (props.$aberta ? 'block' : 'none')};
    position: fixed;
    inset: 48px 0 0 0;
    background: var(--scrim);
    z-index: 997;
  }
`;

const BotaoRecolher = styled.button`
  position: absolute;
  top: 14px;
  right: -12px;
  width: 24px;
  height: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid var(--border-subtle);
  background: var(--surface-card);
  color: var(--text-muted);
  box-shadow: var(--shadow-xs);
  z-index: 1;

  &:hover {
    color: var(--revvo-blue-500);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const Sidebar = ({
  currentPage,
  setCurrentPage,
  isSidebarOpen,
  setIsSidebarOpen,
  isFolded,
  setIsFolded
}) => {
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth <= 768);

  // Notificações não lidas exibidas como badge no item do menu
  const [notificacoesNaoLidas, setNotificacoesNaoLidas] = React.useState(contarNaoLidas());

  React.useEffect(() => {
    setNotificacoesNaoLidas(contarNaoLidas());
  }, [currentPage]);

  React.useEffect(() => {
    const aoRedimensionar = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', aoRedimensionar);
    return () => window.removeEventListener('resize', aoRedimensionar);
  }, []);

  const selecionar = (id) => {
    setCurrentPage(id);
    if (window.innerWidth <= 768) setIsSidebarOpen(false);
  };

  const itens = MENU.map((item) =>
    item.id === 'cedente-notificacoes' && notificacoesNaoLidas > 0 ? { ...item, badge: notificacoesNaoLidas } : item
  );

  const recolhida = isFolded && !isMobile;

  return (
    <>
      <Scrim $aberta={isSidebarOpen} onClick={() => setIsSidebarOpen(false)} />

      <Container $recolhida={recolhida} $aberta={isSidebarOpen}>
        <BotaoRecolher
          type="button"
          onClick={() => setIsFolded(!isFolded)}
          aria-label={isFolded ? 'Expandir menu' : 'Recolher menu'}
        >
          {isFolded ? <ChevronRight size={12} strokeWidth={3} /> : <ChevronLeft size={12} strokeWidth={3} />}
        </BotaoRecolher>

        <Marca $recolhida={recolhida}>
          <img src={recolhida ? logoSimbolo : logoRevvo} alt="Revvo" />
          {!recolhida && <span className="produto">Trade - Portal do Cedente</span>}
        </Marca>

        <SideNav
          grupo={{ label: 'Visão do Cedente', icon: 'landmark' }}
          items={itens}
          activeId={currentPage}
          onSelect={selecionar}
          collapsed={recolhida}
          style={{ width: '100%' }}
        />
      </Container>
    </>
  );
};

export default Sidebar;
