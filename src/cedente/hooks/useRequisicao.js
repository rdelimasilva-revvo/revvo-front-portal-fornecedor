import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Carrega dados de um serviço mantendo os três estados que toda tela do cedente
 * precisa expor: carregando, erro (com retry) e dados.
 *
 * @param {() => Promise<any>} carregar função que devolve a promessa do serviço
 * @param {any[]} deps dependências que disparam nova carga
 */
export const useRequisicao = (carregar, deps = []) => {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const montado = useRef(true);
  // Só a última carga disparada pode escrever no estado — evita resultado antigo
  // sobrescrever o atual quando o usuário troca o filtro rápido.
  const execucao = useRef(0);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  const executar = useCallback(async () => {
    const atual = execucao.current + 1;
    execucao.current = atual;

    setCarregando(true);
    setErro(null);

    try {
      const resultado = await carregar();
      if (montado.current && execucao.current === atual) setDados(resultado);
    } catch (falha) {
      if (montado.current && execucao.current === atual) setErro(falha);
    } finally {
      if (montado.current && execucao.current === atual) setCarregando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    executar();
  }, [executar]);

  return { dados, carregando, erro, recarregar: executar, setDados };
};
