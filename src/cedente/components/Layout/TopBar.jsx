import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { HelpCircle, Bell, User, LogOut, Menu, Repeat } from 'lucide-react';

import { definirUsuarioAtual, listarUsuariosParaTroca, obterUsuarioAtual } from '../../services/cadastroService';

const TopHeader = styled.div`
  height: 48px;
  background: white;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0 16px;
  position: sticky;
  top: 0;
  z-index: 1000;

  .mobile-menu-button {
    display: none;
    margin-right: 12px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    color: var(--secondary-text);
    transition: color 0.3s ease, transform 0.2s ease;
    z-index: 1001;

    &:hover {
      color: var(--primary-text);
    }

    &:active {
      transform: scale(0.9);
    }
  }

  @media (max-width: 768px) {
    padding-right: 0px;

    .mobile-menu-button {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
`;

const HeaderRight = styled.div`
  position: absolute;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 24px;

  .icons {
    display: flex;
    align-items: center;
    gap: 16px;
    color: var(--secondary-text);

    @media (max-width: 768px) {
      gap: 8px;

      span {
        display: none;
      }
    }

    button {
      border: none;
      background: none;
      padding: 0;
      height: auto;
      color: inherit;
      cursor: pointer;
      display: flex;
      align-items: center;

      &:hover {
        color: var(--primary-text);
      }
    }
  }
`;

const UserMenu = styled.div`
  position: absolute;
  top: 48px;
  right: 16px;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 200px;
  z-index: 1000;
  overflow: hidden;
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  width: 100%;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--primary-text);

  &:hover {
    background: var(--hover-bg);
  }

  &:not(:last-child) {
    border-bottom: 1px solid var(--border-color);
  }
`;

const Identidade = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);

  .nome {
    font-weight: var(--fw-semibold);
    color: var(--primary-text);
  }

  .papel {
    font-size: 12px;
    color: var(--secondary-text);
  }
`;

const PAPEL_LABEL = { aprovador: 'Aprovador: assina termos', operador: 'Operador: contrata, não assina' };

// A troca de usuário existe porque o portal é de demonstração: é o jeito de ver as duas alçadas.
const TopBar = ({ isSidebarOpen, setIsSidebarOpen, onAbrirNotificacoes, onAbrirPerfil, onUsuarioAlterado, onSair }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [outros, setOutros] = useState([]);
  const menuRef = useRef(null);

  useEffect(() => {
    obterUsuarioAtual().then(setUsuario).catch(() => setUsuario(null));
    listarUsuariosParaTroca().then(setOutros).catch(() => setOutros([]));
  }, []);

  const trocarPara = async (id) => {
    setShowUserMenu(false);
    try {
      const novo = await definirUsuarioAtual(id);
      setUsuario(novo);
      onUsuarioAlterado();
      toast.success(`Agora você está como ${novo.nome}.`);
    } catch (erro) {
      toast.error(erro.message);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <TopHeader>
      <button
        className="mobile-menu-button"
        onClick={() => setIsSidebarOpen && setIsSidebarOpen(!isSidebarOpen)}
        style={isSidebarOpen ? { color: 'var(--primary-blue)' } : {}}
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>

      <HeaderRight>
        <div className="icons">
          <button aria-label="Ajuda">
            <HelpCircle size={20} />
          </button>
          <button aria-label="Notificações" onClick={onAbrirNotificacoes}>
            <Bell size={20} />
          </button>
          <button onClick={() => setShowUserMenu(!showUserMenu)} style={{ gap: '8px' }} aria-haspopup="menu">
            <User size={20} />
            {usuario?.nome && <span style={{ fontSize: '14px' }}>{usuario.nome}</span>}
          </button>
        </div>

        {showUserMenu && (
          <UserMenu ref={menuRef} style={{ width: 260 }}>
            {usuario && (
              <Identidade>
                <div className="nome">{usuario.nome}</div>
                <div className="papel">{PAPEL_LABEL[usuario.papel] || usuario.papel}</div>
              </Identidade>
            )}
            {outros
              .filter((item) => item.id !== usuario?.id)
              .map((item) => (
                <MenuItem key={item.id} onClick={() => trocarPara(item.id)}>
                  <Repeat size={16} />
                  Entrar como {item.nome.split(' ')[0]} ({item.papel})
                </MenuItem>
              ))}
            <MenuItem
              onClick={() => {
                setShowUserMenu(false);
                onAbrirPerfil();
              }}
            >
              <User size={16} />
              Meu perfil
            </MenuItem>
            <MenuItem
              onClick={() => {
                setShowUserMenu(false);
                onSair();
              }}
            >
              <LogOut size={16} />
              Sair
            </MenuItem>
          </UserMenu>
        )}
      </HeaderRight>
    </TopHeader>
  );
};

export default TopBar;
