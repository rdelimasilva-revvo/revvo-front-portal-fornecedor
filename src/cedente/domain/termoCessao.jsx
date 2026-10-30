import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

import { formatCurrency, formatDate, formatPercent } from '../utils/format';

/**
 * Texto do termo de cessão, único para a contratação e para a central de Contratos.
 * O documento tem valor jurídico: uma cópia em cada tela acabaria divergindo.
 *
 * `dados` é a simulação da contratação. Sem ela (assinatura na central, inclusive
 * em lote), os valores remetem ao anexo de cada operação abrangida.
 */
export const clausulasTermo = (dados) => {
  const comValor = (formatar, valor, generico) => (dados && valor !== undefined ? formatar(valor) : generico);

  return [
    {
      titulo: null,
      texto:
        'Pelo presente instrumento particular, a CEDENTE, qualificada em seus dados cadastrais, cede e transfere ao ' +
        'CESSIONÁRIO, em caráter definitivo e sem coobrigação salvo nas hipóteses previstas na cláusula quinta, os ' +
        'direitos creditórios relacionados no anexo desta operação, totalizando ' +
        `${comValor(formatCurrency, dados?.valorBruto, 'o valor bruto indicado no anexo')} em valor de face.`
    },
    {
      titulo: 'Cláusula primeira — Do objeto',
      texto:
        `A cessão abrange ${comValor(String, dados?.quantidade, 'os')} título(s) de crédito` +
        `${dados?.prazoMedio !== undefined ? `, com prazo médio de ${dados.prazoMedio} dias` : ''}, devidamente ` +
        'identificados por número, sacado e data de vencimento no anexo que integra este termo.'
    },
    {
      titulo: 'Cláusula segunda — Do preço',
      texto:
        `O preço da cessão corresponde a ${comValor(formatCurrency, dados?.valorLiquido, 'o valor líquido indicado no anexo')}, ` +
        `já deduzidos o desconto calculado à taxa de ${comValor(formatPercent, dados?.taxaMensal, 'juros contratada')} ao mês, ` +
        `o IOF de ${comValor(formatCurrency, dados?.iof, 'acordo com a legislação vigente')} e as tarifas de ` +
        `${comValor(formatCurrency, dados?.tarifas, 'acordo com a tabela vigente')}, a ser creditado na conta de ` +
        `titularidade da CEDENTE em ${comValor(formatDate, dados?.dataCredito, 'até um dia útil após o registro')}.`
    },
    {
      titulo: 'Cláusula terceira — Do registro',
      texto:
        'A CEDENTE autoriza o registro da presente cessão perante entidade registradora autorizada pelo Banco Central do ' +
        'Brasil, nos termos da Resolução CMN nº 4.734/2019, para constituição e oponibilidade da titularidade dos direitos ' +
        'creditórios cedidos.'
    },
    {
      titulo: 'Cláusula quarta — Das declarações da cedente',
      texto:
        'A CEDENTE declara que os créditos cedidos são legítimos, existentes, líquidos e certos, livres de quaisquer ônus, ' +
        'gravames ou cessões anteriores, e que decorrem de operações mercantis efetivamente realizadas com os sacados indicados.'
    },
    {
      titulo: 'Cláusula quinta — Da responsabilidade',
      texto:
        'A CEDENTE responde pela existência e legitimidade dos créditos, bem como por vícios de origem, divergências de ' +
        'valor, devoluções de mercadoria ou qualquer fato que impeça o adimplemento do título pelo sacado, hipóteses em que ' +
        'fica obrigada à recompra do crédito correspondente.'
    },
    {
      titulo: 'Cláusula sexta — Do aceite eletrônico',
      texto:
        'As partes reconhecem a validade do aceite eletrônico com autenticação de segundo fator como forma de manifestação ' +
        'de vontade, nos termos do art. 10, §2º, da MP nº 2.200-2/2001, produzindo todos os efeitos jurídicos de assinatura.'
    },
    {
      titulo: 'Cláusula sétima — Do foro',
      texto:
        'Fica eleito o foro da comarca de São Paulo/SP para dirimir quaisquer controvérsias oriundas deste termo, com ' +
        'renúncia a qualquer outro, por mais privilegiado que seja.'
    }
  ];
};

const Caixa = styled.div`
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  height: ${(props) => props.$altura}px;
  overflow-y: auto;
  padding: 16px;
  font-size: var(--fs-body-sm);
  line-height: 1.7;
  color: var(--text-body);
  background: var(--surface-sunken);

  h3 {
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-semibold);
    color: var(--text-strong);
    margin: 16px 0 6px;
  }

  p {
    margin: 0 0 8px;
  }
`;

/** Termo rolável: chama `onLido(true)` quando a leitura chega ao fim (tolerância de 24px). */
export const TermoCessao = ({ dados, onLido, altura = 300 }) => {
  const ref = useRef(null);

  const chegouAoFim = (elemento) =>
    elemento && elemento.scrollTop + elemento.clientHeight >= elemento.scrollHeight - 24;

  // Em telas altas o termo pode caber inteiro e nunca gerar rolagem: sem isto o
  // aceite ficaria travado esperando um evento de scroll que jamais acontece.
  useEffect(() => {
    const verificar = () => {
      if (chegouAoFim(ref.current)) onLido?.(true);
    };
    verificar();
    window.addEventListener('resize', verificar);
    return () => window.removeEventListener('resize', verificar);
  }, [onLido]);

  return (
    <Caixa
      ref={ref}
      $altura={altura}
      onScroll={(evento) => chegouAoFim(evento.target) && onLido?.(true)}
      tabIndex={0}
      aria-label="Termo de cessão de crédito"
    >
      <h3>TERMO DE CESSÃO DE CRÉDITOS</h3>
      {clausulasTermo(dados).map((clausula, indice) => (
        <React.Fragment key={indice}>
          {clausula.titulo && <h3>{clausula.titulo}</h3>}
          <p>{clausula.texto}</p>
        </React.Fragment>
      ))}
      <p style={{ marginTop: 24, fontWeight: 600 }}>Fim do termo.</p>
    </Caixa>
  );
};
