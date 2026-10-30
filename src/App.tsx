import { useState } from 'react';
import { Dashboard } from './components/Dashboard/Dashboard';
import { DuplicataList } from './components/Duplicatas/DuplicataList';
import { XMLUpload } from './components/Upload/XMLUpload';
import { SupplierDashboard } from './components/Suppliers/SupplierDashboard';
import { SupplierDuplicatas } from './components/Suppliers/SupplierDuplicatas';
import { SupplierAntecipacoes } from './components/Suppliers/SupplierAntecipacoes';
import { AutomationRules } from './components/Automation/AutomationRules';
import { AccountsReceivable } from './components/AccountsReceivable/AccountsReceivable';
import { AccountsPayable } from './components/AccountsPayable/AccountsPayable';
import { Escrituracao } from './components/Escrituracao/Escrituracao';
import { PaymentDomicileControl } from './components/PaymentDomicile/PaymentDomicileControl';
import {
  Toaster, Layout, Login, Home, Recebiveis, Operacoes, Cadastro, Notificacoes, GestaoDuplicatas, Duplicatas, Contratos,
  Liquidacoes, Extrato, AcordosComerciais,
  type PaginaCedente, type ParametrosNavegacao
} from './cedente';

// Página pedida por uma tela -> seção do menu.
const SECAO_DA_PAGINA: Record<PaginaCedente, string> = {
  home: 'cedente-home',
  recebiveis: 'cedente-recebiveis',
  operacoes: 'cedente-operacoes',
  cadastro: 'cedente-cadastro',
  notificacoes: 'cedente-notificacoes',
  'criar-duplicatas': 'escrituracao-criar-duplicatas',
  duplicatas: 'escrituracao-duplicatas',
  acordos: 'fornecedor-abatimentos',
  liquidacoes: 'escrituracao-liquidacoes',
  contratos: 'antecipacao-contratos',
  extrato: 'antecipacao-extrato'
};

// shortcut: sessão só no sessionStorage, sem autenticação real; trocar pelo login do backend.
const CHAVE_SESSAO = 'revvo.cedente.sessao';

function App() {
  const [logado, setLogado] = useState(() => sessionStorage.getItem(CHAVE_SESSAO) === '1');
  const [activeSection, setActiveSection] = useState('cedente-home');
  const [parametros, setParametros] = useState<ParametrosNavegacao>({});

  const navegarCedente = (pagina: PaginaCedente, params?: ParametrosNavegacao | null) => {
    setParametros(params || {});
    setActiveSection(SECAO_DA_PAGINA[pagina]);
  };

  const selecionarSecao = (secao: string) => {
    setParametros({});
    setActiveSection(secao);
  };

  const entrar = () => {
    sessionStorage.setItem(CHAVE_SESSAO, '1');
    setActiveSection('cedente-home');
    setLogado(true);
  };

  const sair = () => {
    sessionStorage.removeItem(CHAVE_SESSAO);
    setLogado(false);
  };

  const tela = { onNavegar: navegarCedente, parametros };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'duplicatas':
        return <DuplicataList />;
      case 'upload':
        return <XMLUpload />;
      case 'fornecedor-dashboard':
        return <SupplierDashboard />;
      case 'fornecedor-duplicatas':
        return <SupplierDuplicatas />;
      case 'fornecedor-abatimentos':
        return <AcordosComerciais {...tela} />;
      case 'fornecedor-antecipacoes':
        return <SupplierAntecipacoes />;
      case 'escrituracao-criar-duplicatas':
        return <GestaoDuplicatas {...tela} />;
      case 'escrituracao-duplicatas':
        return <Duplicatas {...tela} />;
      case 'escrituracao-liquidacoes':
        return <Liquidacoes {...tela} />;
      case 'antecipacao-contratos':
        return <Contratos {...tela} />;
      case 'antecipacao-extrato':
        return <Extrato {...tela} />;
      case 'cedente-home':
        return <Home {...tela} />;
      case 'cedente-recebiveis':
        return <Recebiveis {...tela} />;
      case 'cedente-operacoes':
        return <Operacoes operacaoIdInicial={parametros.operacaoId} onNavegar={navegarCedente} />;
      case 'cedente-cadastro':
        return <Cadastro />;
      case 'cedente-notificacoes':
        return <Notificacoes {...tela} />;
      case 'regras':
        return <AutomationRules />;
      case 'contas-pagar':
        return <AccountsPayable />;
      case 'contas-receber':
        return <AccountsReceivable />;
      case 'escrituracao':
        return <Escrituracao />;
      case 'domicilio-bancario':
        return <PaymentDomicileControl />;
      case 'relatorios':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Relatórios e Analytics</h2>
              <p className="text-gray-600">Análise detalhada das operações</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
              <p className="text-gray-500">Módulo de relatórios em desenvolvimento...</p>
            </div>
          </div>
        );
      case 'perfil':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Perfil da Empresa</h2>
              <p className="text-gray-600">Configurações e informações da empresa</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
              <p className="text-gray-500">Módulo de perfil em desenvolvimento...</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  if (!logado) {
    return (
      <>
        <Toaster />
        <Login onEntrar={entrar} />
      </>
    );
  }

  return (
    <>
      <Toaster />
      <Layout
        currentPage={activeSection}
        setCurrentPage={selecionarSecao}
        onSair={sair}
        semPadding={activeSection.startsWith('fornecedor-') && activeSection !== 'fornecedor-abatimentos'}
      >
        {renderContent()}
      </Layout>
    </>
  );
}

export default App;