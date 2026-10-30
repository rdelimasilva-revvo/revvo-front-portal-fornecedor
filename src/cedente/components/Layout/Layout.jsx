import React from 'react';
import styled from 'styled-components';
import TopBar from './TopBar';
import Sidebar, { LARGURA_SIDEBAR, LARGURA_SIDEBAR_RECOLHIDA } from './Sidebar';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  background: var(--background);
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  position: relative;
`;

// As telas do fornecedor já trazem o próprio respiro; as do cedente contam com o padding daqui.
const Main = styled.main`
  flex: 1;
  margin-left: ${(props) => (props.$sidebarRecolhida ? LARGURA_SIDEBAR_RECOLHIDA : LARGURA_SIDEBAR)}px;
  transition: margin-left var(--duration-base) var(--ease-out);
  padding: ${(props) => (props.$semPadding ? '0' : '24px')};
  overflow-x: hidden;
  overflow-y: auto;
  height: calc(100vh - 48px);

  @media (max-width: 768px) {
    margin-left: 0;
    padding: ${(props) => (props.$semPadding ? '0' : '24px 16px')};
    width: 100%;
  }
`;

const Layout = ({ children, currentPage, setCurrentPage, onSair, semPadding }) => {
  const [isFolded, setIsFolded] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  // Trocar de usuário muda a alçada: a tela aberta remonta para reler quem pode assinar.
  const [versaoUsuario, setVersaoUsuario] = React.useState(0);

  return (
    <Container>
      <TopBar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onAbrirNotificacoes={() => setCurrentPage('cedente-notificacoes')}
        onAbrirPerfil={() => setCurrentPage('cedente-cadastro')}
        onUsuarioAlterado={() => setVersaoUsuario((versao) => versao + 1)}
        onSair={onSair}
      />
      <Content>
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          isFolded={isFolded}
          setIsFolded={setIsFolded}
        />
        <Main key={versaoUsuario} $sidebarRecolhida={isFolded} $semPadding={semPadding}>
          {children}
        </Main>
      </Content>
    </Container>
  );
};

export default Layout;
