export const MOTIVOS = {
  avaria: 'Avaria',
  atraso: 'Atraso na entrega',
  especificacao: 'Fora da especificação',
  preco: 'Divergência de preço',
  bonificacao: 'Bonificação comercial'
};

// As datas abaixo foram escritas com 16/12/2024 como "hoje" e são deslocadas para
// que essa data vire o dia atual. Sem isso, decidir um acordo agora distorce o tempo médio de resposta.
const REFERENCIA = Date.UTC(2024, 11, 16);
const deslocamento = Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) - REFERENCIA;
const deslocar = (iso) => new Date(Date.parse(`${iso}T00:00:00Z`) + deslocamento).toISOString().slice(0, 10);

const acordo = (id, notaFiscal, duplicata, cliente, valorOriginal, abatimento, motivo, justificativa, data, status, dataDecisao) => ({
  id,
  notaFiscal,
  duplicata,
  cliente,
  valorOriginal,
  abatimento,
  motivo,
  justificativa,
  data: deslocar(data),
  status,
  ...(dataDecisao ? { dataDecisao: deslocar(dataDecisao) } : {})
});

const HORIZONTE = 'Construtora Horizonte S/A';
const BOM_PRECO = 'Supermercados Bom Preço Ltda';
const REDE_FARMA = 'Rede Farma Distribuidora Ltda';
const SAO_LUCAS = 'Hospital São Lucas S/A';

export const ABATIMENTOS = [
  acordo('1', 'NF-000012045', 'DUP-6042/01', SAO_LUCAS, 48750, 2437.5, 'avaria', 'Mercadoria avariada: 5% do lote, conforme acordo comercial', '2024-12-15', 'pendente'),
  acordo('2', 'NF-000012088', 'DUP-7210/01', REDE_FARMA, 22400.5, 1120, 'atraso', 'Atraso na entrega: desconto de 5%, conforme contrato', '2024-12-14', 'pendente'),
  acordo('3', 'NF-001230', 'DUP-003/2024', REDE_FARMA, 12000, 600, 'especificacao', 'Produto fora da especificação, conforme acordo comercial', '2024-12-10', 'aprovado', '2024-12-11'),
  acordo('4', 'NF-000012133', 'DUP-9411/01', BOM_PRECO, 9820.75, 491.04, 'preco', 'Preço faturado acima da tabela negociada', '2024-12-12', 'pendente'),
  acordo('5', 'NF-001219', 'DUP-005/2024', HORIZONTE, 31800, 3180, 'bonificacao', 'Bonificação de 10% pela meta trimestral atingida', '2024-11-28', 'aprovado', '2024-11-29'),
  acordo('6', 'NF-001214', 'DUP-006/2024', BOM_PRECO, 9600, 960, 'avaria', 'Embalagens danificadas no transporte', '2024-11-20', 'aprovado', '2024-11-25'),
  acordo('7', 'NF-001207', 'DUP-007/2024', REDE_FARMA, 14300, 2145, 'atraso', 'Atraso de 12 dias na entrega', '2024-11-12', 'rejeitado', '2024-11-14'),
  acordo('8', 'NF-001199', 'DUP-008/2024', HORIZONTE, 27500, 1375, 'preco', 'Diferença de preço no item 3 do pedido', '2024-10-30', 'aprovado', '2024-10-31'),
  acordo('9', 'NF-001190', 'DUP-009/2024', SAO_LUCAS, 18900, 945, 'especificacao', 'Lote com validade abaixo da exigida', '2024-10-18', 'aprovado', '2024-10-22'),
  acordo('10', 'NF-001182', 'DUP-010/2024', BOM_PRECO, 11200, 1680, 'bonificacao', 'Bonificação de lançamento de produto', '2024-10-05', 'rejeitado', '2024-10-09'),
  acordo('11', 'NF-001171', 'DUP-011/2024', HORIZONTE, 42600, 2130, 'atraso', 'Atraso na entrega: multa contratual de 5%', '2024-09-24', 'aprovado', '2024-09-25'),
  acordo('12', 'NF-001165', 'DUP-012/2024', REDE_FARMA, 8700, 870, 'avaria', 'Avaria em 10% das unidades recebidas', '2024-09-11', 'aprovado', '2024-09-16'),
  acordo('13', 'NF-001150', 'DUP-013/2024', SAO_LUCAS, 25300, 1265, 'preco', 'Preço divergente da proposta comercial', '2024-08-27', 'aprovado', '2024-08-28'),
  acordo('14', 'NF-001142', 'DUP-014/2024', BOM_PRECO, 16400, 820, 'especificacao', 'Gramatura diferente da especificada', '2024-08-08', 'aprovado', '2024-08-12'),
  acordo('15', 'NF-001131', 'DUP-015/2024', HORIZONTE, 35200, 3520, 'bonificacao', 'Bonificação semestral do acordo de volume', '2024-07-30', 'aprovado', '2024-07-31'),
  acordo('16', 'NF-001122', 'DUP-016/2024', REDE_FARMA, 13100, 655, 'atraso', 'Atraso de 4 dias na entrega', '2024-07-16', 'rejeitado', '2024-07-19')
];

export const STATUS_ABATIMENTO = {
  pendente: { label: 'Pendente', tom: 'amarelo' },
  aprovado: { label: 'Aprovado', tom: 'verde' },
  rejeitado: { label: 'Rejeitado', tom: 'vermelho' }
};
