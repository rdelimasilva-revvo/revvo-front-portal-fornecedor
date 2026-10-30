// Portal do cedente trazido de revvo-desconto-cedente: telas, DS Revvo, services e mocks.
import { instalarLucide } from './ds/lucideRuntime';
import './index.css';

// Os componentes do design system dependem deste runtime de ícones.
instalarLucide();

export { Toaster } from 'react-hot-toast';
export { default as Home } from './components/Cedente/Home/Home';
export { default as Recebiveis } from './components/Cedente/Recebiveis/Recebiveis';
export { default as Operacoes } from './components/Cedente/Operacoes/Operacoes';
export { default as Cadastro } from './components/Cedente/Cadastro/Cadastro';
export { default as Notificacoes } from './components/Cedente/Notificacoes/Notificacoes';
export { default as Liquidacoes } from './components/Cedente/Liquidacoes/Liquidacoes';
export { default as Extrato } from './components/Cedente/Extrato/Extrato';
export { default as Login } from './components/Cedente/Login/Login';
export { default as Layout } from './components/Layout/Layout';

// Escrituração de duplicatas trazida de revvo-risco-sacado. Contratos é a Formalização de lá, refeita com o DS.
export { default as GestaoDuplicatas } from './components/Cedente/CriarDuplicatas/CriarDuplicatas';
export { default as Duplicatas } from './components/Cedente/DuplicatasEscrituradas/Duplicatas';
export { default as Contratos } from './components/Cedente/Contratos/Contratos';
export { default as AcordosComerciais } from './components/Cedente/AcordosComerciais/AcordosComerciais';
