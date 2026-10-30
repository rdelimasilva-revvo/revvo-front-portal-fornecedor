import type { FC, ReactNode } from 'react';

export type PaginaCedente =
  | 'home'
  | 'recebiveis'
  | 'operacoes'
  | 'cadastro'
  | 'notificacoes'
  | 'criar-duplicatas'
  | 'duplicatas'
  | 'acordos'
  | 'liquidacoes'
  | 'contratos'
  | 'extrato';

export type ParametrosNavegacao = {
  operacaoId?: string;
  recebivelIds?: string[];
  duplicataId?: string;
  termoId?: string;
};

type Navegar = (pagina: PaginaCedente, params?: ParametrosNavegacao | null) => void;
type Tela = FC<{ onNavegar: Navegar; parametros?: ParametrosNavegacao }>;

export { Toaster } from 'react-hot-toast';
export const Home: Tela;
export const Recebiveis: Tela;
export const Operacoes: FC<{ onNavegar: Navegar; operacaoIdInicial?: string }>;
export const Cadastro: FC;
export const Notificacoes: Tela;
export const Liquidacoes: Tela;
export const Extrato: Tela;
export const GestaoDuplicatas: Tela;
export const Duplicatas: Tela;
export const Contratos: Tela;
export const AcordosComerciais: Tela;
export const Login: FC<{ onEntrar: () => void }>;
export const Layout: FC<{
  children?: ReactNode;
  currentPage: string;
  setCurrentPage: (secao: string) => void;
  onSair: () => void;
  semPadding?: boolean;
}>;
