import React, { useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';

import { Button, Input, Select } from '../../../ds';
import { listarSacadosConhecidos } from '../../../services/duplicatasService';
import { formatCNPJ } from '../../../utils/format';

const Titulo = styled.h3`
  font-size: var(--fs-h3);
  font-weight: var(--fw-semibold);
  margin: 0 0 16px;
`;

const Campos = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 12px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Acoes = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-subtle);
`;

const icone = (nome) => <i data-lucide={nome} style={{ width: 14, height: 14 }} />;

const FORMULARIO_VAZIO = {
  numeroNF: '',
  dataEmissao: '',
  vencimento: '',
  sacadoNome: '',
  sacadoCnpj: '',
  valor: ''
};

const SACADOS = listarSacadosConhecidos();

const EntradaManual = ({ onCriar }) => {
  const [formulario, setFormulario] = useState(FORMULARIO_VAZIO);
  const [salvando, setSalvando] = useState(false);

  const atualizar = (nome, valor) => setFormulario((atual) => ({ ...atual, [nome]: valor }));
  const campo = (nome) => ({ value: formulario[nome], onChange: (evento) => atualizar(nome, evento.target.value) });

  const sacadoConhecido = SACADOS.find((sacado) => sacado.cnpj === formulario.sacadoCnpj.replace(/\D/g, ''))?.id || '';
  const escolherSacado = (id) => {
    const sacado = SACADOS.find((item) => item.id === id);
    if (sacado) setFormulario((atual) => ({ ...atual, sacadoNome: sacado.nome, sacadoCnpj: formatCNPJ(sacado.cnpj) }));
  };

  const adicionar = async (evento) => {
    evento.preventDefault();
    if (formulario.dataEmissao && formulario.vencimento < formulario.dataEmissao) {
      toast.error('O vencimento deve ser igual ou posterior à emissão.');
      return;
    }
    setSalvando(true);
    const { criadas, falhas } = await onCriar([{ ...formulario, valor: Number(formulario.valor) }], 'manual');
    setSalvando(false);
    if (falhas.length) {
      toast.error(falhas[0]);
      return;
    }
    toast.success(`Duplicata ${criadas[0].numeroTitulo} criada.`);
    setFormulario(FORMULARIO_VAZIO);
  };

  return (
    <form onSubmit={adicionar}>
      <Titulo>Criar nova duplicata</Titulo>
      <Campos>
        <Input label="Número da NF *" placeholder="Ex.: 123456" required {...campo('numeroNF')} />
        <Input label="Data de emissão *" type="date" required {...campo('dataEmissao')} />
        <Input label="Data de vencimento *" type="date" required {...campo('vencimento')} />
      </Campos>
      <Campos>
        <Select
          label="Sacado conhecido"
          value={sacadoConhecido}
          onChange={escolherSacado}
          placeholder="Selecione ou preencha ao lado"
          options={SACADOS.map((sacado) => ({ value: sacado.id, label: sacado.nome }))}
        />
        <Input label="Sacado (razão social) *" placeholder="Ex.: Hospital São Lucas" required {...campo('sacadoNome')} />
        <Input label="CNPJ do sacado *" mask="cnpj" placeholder="00.000.000/0000-00" required {...campo('sacadoCnpj')} />
      </Campos>
      <Campos>
        <Input label="Valor (R$) *" type="number" step="0.01" min="0.01" placeholder="0,00" required {...campo('valor')} />
      </Campos>
      <Acoes>
        <Button variant="secondary" onClick={() => setFormulario(FORMULARIO_VAZIO)} leftIcon={icone('x')}>
          Limpar
        </Button>
        <Button type="submit" disabled={salvando} leftIcon={icone('plus')}>
          {salvando ? 'Criando...' : 'Adicionar duplicata'}
        </Button>
      </Acoes>
    </form>
  );
};

export default EntradaManual;
