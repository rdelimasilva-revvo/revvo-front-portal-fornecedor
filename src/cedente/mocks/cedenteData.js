/**
 * Dados simulados do portal do cedente.
 *
 * Tudo aqui é temporário: existe só para as telas terem o shape definido em
 * src/types/entities.js enquanto o backend não existe. As datas são geradas a
 * partir de "hoje" para o mock não envelhecer.
 */

import { toISODate, today } from '../utils/format';

const addDays = (days) => {
  const date = new Date(today());
  date.setDate(date.getDate() + days);
  return toISODate(date);
};

const addHours = (hours) => {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date.toISOString();
};

export const SACADOS = [
  { id: 'sac-1', nome: 'Hospital São Lucas S/A', cnpj: '12345678000190' },
  { id: 'sac-2', nome: 'Rede Farma Distribuidora Ltda', cnpj: '98765432000121' },
  { id: 'sac-3', nome: 'Construtora Horizonte S/A', cnpj: '45678912000134' },
  { id: 'sac-4', nome: 'Supermercados Bom Preço Ltda', cnpj: '32165498000177' },
  { id: 'sac-5', nome: 'Indústria Metalúrgica Vega S/A', cnpj: '78912345000156' }
];

const recebivel = (id, sacadoIdx, numero, nf, valor, dias, statusRegistro, origem, elegivel, motivo) => ({
  id,
  sacado: SACADOS[sacadoIdx],
  numeroTitulo: numero,
  numeroNF: nf,
  valor,
  vencimento: addDays(dias),
  statusRegistro,
  origem,
  elegivel,
  ...(motivo ? { motivoInelegibilidade: motivo } : {})
});

export const RECEBIVEIS = [
  recebivel('rec-001', 0, 'DUP-6042/01', '000012045', 48750.0, 28, 'registrada', 'xml', true),
  recebivel('rec-002', 0, 'DUP-6042/02', '000012045', 48750.0, 58, 'registrada', 'xml', true),
  recebivel('rec-003', 1, 'DUP-7210/01', '000012088', 22400.5, 15, 'registrada', 'registradora', true),
  recebivel('rec-004', 1, 'DUP-7210/02', '000012088', 22400.5, 45, 'pendente', 'registradora', true),
  recebivel('rec-005', 2, 'DUP-8390/01', '000012102', 156000.0, 33, 'registrada', 'arquivo', true),
  recebivel('rec-006', 2, 'DUP-8390/02', '000012102', 156000.0, 63, 'pendente', 'arquivo', true),
  recebivel('rec-007', 3, 'DUP-9411/01', '000012133', 9820.75, 21, 'registrada', 'xml', true),
  recebivel('rec-008', 3, 'DUP-9411/02', '000012133', 9820.75, 51, 'registrada', 'xml', true),
  recebivel('rec-009', 4, 'DUP-6520/01', '000012170', 74300.0, 40, 'registrada', 'registradora', true),
  recebivel('rec-010', 4, 'DUP-6520/02', '000012170', 74300.0, 70, 'nao_registrada', 'registradora', true),
  recebivel('rec-011', 0, 'DUP-6043/01', '000012201', 31200.0, 12, 'registrada', 'xml', true),
  recebivel('rec-012', 1, 'DUP-7211/01', '000012233', 18900.0, 26, 'registrada', 'xml', true),
  recebivel('rec-013', 2, 'DUP-8391/01', '000012260', 92500.0, 36, 'pendente', 'arquivo', true),
  recebivel('rec-014', 3, 'DUP-9412/01', '000012288', 45600.0, 49, 'registrada', 'registradora', true),
  recebivel('rec-015', 4, 'DUP-6521/01', '000012311', 67800.0, 55, 'registrada', 'xml', true),
  // Inelegíveis: não entram na lista principal, alimentam o contador "N títulos não exibidos".
  recebivel('rec-016', 0, 'DUP-6039/01', '000011980', 25000.0, 18, 'registrada', 'registradora', false, 'Título já cedido a outro financiador'),
  recebivel('rec-017', 1, 'DUP-7205/03', '000011992', 41000.0, 24, 'registrada', 'registradora', false, 'Título com ônus registrado na CERC'),
  recebivel('rec-018', 2, 'DUP-8385/01', '000012001', 12500.0, 4, 'registrada', 'xml', false, 'Vencimento fora da janela contratada (mínimo 10 dias)'),
  recebivel('rec-019', 3, 'DUP-9405/02', '000012010', 88000.0, 38, 'registrada', 'arquivo', false, 'Limite do sacado esgotado'),
  recebivel('rec-020', 4, 'DUP-6515/01', '000012022', 15300.0, 240, 'registrada', 'xml', false, 'Vencimento fora da janela contratada (máximo 180 dias)')
];

const etapa = (nome, situacao, horasAtras, evidenciaLabel, motivo) => ({
  nome,
  situacao,
  ...(horasAtras !== null && horasAtras !== undefined ? { dataHora: addHours(-horasAtras) } : {}),
  ...(evidenciaLabel ? { evidenciaUrl: '#', evidenciaLabel } : {}),
  ...(motivo ? { motivo } : {})
});

const tituloOperacao = (recebivelId, numeroTitulo, sacadoIdx, valorBruto, valorLiquido, dias, status, motivo) => ({
  recebivelId,
  numeroTitulo,
  sacado: SACADOS[sacadoIdx],
  valorBruto,
  valorLiquido,
  vencimento: addDays(dias),
  status,
  ...(motivo ? { motivo } : {})
});

const MOTIVO_RECUSA_0182 =
  'Sacado não reconheceu a duplicata DUP-2210/02: divergência entre o valor da nota fiscal e o valor do título apresentado.';

export const OPERACOES = [
  {
    id: 'OP-2026-0184',
    dataCriacao: addHours(-6),
    valorBruto: 97500.0,
    valorLiquido: 94836.12,
    taxaMensal: 1.32,
    status: 'aceite_sacado',
    titulos: [
      tituloOperacao('rec-001', 'DUP-1042/01', 0, 48750.0, 47461.28, 28, 'Aguardando aceite'),
      tituloOperacao('rec-002', 'DUP-1042/02', 0, 48750.0, 47374.84, 58, 'Aguardando aceite')
    ],
    etapas: [
      etapa('Assinatura do termo', 'concluida', 7, 'Termo assinado'),
      etapa('Enviada', 'concluida', 6, 'Protocolo de envio'),
      etapa('Aceite do sacado', 'em_andamento', null),
      etapa('Registro na registradora', 'pendente', null),
      etapa('Crédito em conta', 'pendente', null),
      etapa('Liquidada', 'pendente', null)
    ]
  },
  {
    id: 'OP-2026-0183',
    dataCriacao: addHours(-30),
    valorBruto: 312000.0,
    valorLiquido: 303187.4,
    taxaMensal: 1.28,
    status: 'credito',
    titulos: [
      tituloOperacao('rec-005', 'DUP-3390/01', 2, 156000.0, 151980.2, 33, 'Creditado'),
      tituloOperacao('rec-006', 'DUP-3390/02', 2, 156000.0, 151207.2, 63, 'Creditado')
    ],
    etapas: [
      etapa('Assinatura do termo', 'concluida', 31, 'Termo assinado'),
      etapa('Enviada', 'concluida', 30, 'Protocolo de envio'),
      etapa('Aceite do sacado', 'concluida', 28, 'Aceite eletrônico'),
      etapa('Registro na registradora', 'concluida', 26, 'Protocolo CERC 8829104-22'),
      etapa('Crédito em conta', 'concluida', 24, 'Comprovante de crédito'),
      etapa('Liquidada', 'pendente', null)
    ]
  },
  {
    id: 'OP-2026-0182',
    dataCriacao: addHours(-54),
    valorBruto: 44802.0,
    valorLiquido: 43650.9,
    taxaMensal: 1.35,
    status: 'recusada',
    motivoRecusa: MOTIVO_RECUSA_0182,
    titulos: [
      tituloOperacao('rec-003', 'DUP-2210/01', 1, 22400.5, 21860.4, 15, 'Recusado', 'Título vinculado à operação recusada'),
      tituloOperacao('rec-004', 'DUP-2210/02', 1, 22401.5, 21790.5, 45, 'Recusado', 'Divergência de valor com a nota fiscal')
    ],
    etapas: [
      etapa('Assinatura do termo', 'concluida', 55, 'Termo assinado'),
      etapa('Enviada', 'concluida', 54, 'Protocolo de envio'),
      etapa('Aceite do sacado', 'recusada', 50, null, MOTIVO_RECUSA_0182),
      etapa('Registro na registradora', 'pendente', null),
      etapa('Crédito em conta', 'pendente', null),
      etapa('Liquidada', 'pendente', null)
    ]
  },
  {
    id: 'OP-2026-0183-B',
    dataCriacao: addHours(-72),
    valorBruto: 57200.0,
    valorLiquido: 55890.44,
    taxaMensal: 1.3,
    status: 'credito',
    titulos: [
      tituloOperacao('rec-012', 'DUP-2211/01', 1, 28600.0, 27980.22, 3, 'Creditado'),
      tituloOperacao('rec-014', 'DUP-4412/01', 3, 28600.0, 27910.22, 6, 'Creditado')
    ],
    etapas: [
      etapa('Assinatura do termo', 'concluida', 73, 'Termo assinado'),
      etapa('Enviada', 'concluida', 72, 'Protocolo de envio'),
      etapa('Aceite do sacado', 'concluida', 70, 'Aceite eletrônico'),
      etapa('Registro na registradora', 'concluida', 68, 'Protocolo CERC 8835221-09'),
      etapa('Crédito em conta', 'concluida', 66, 'Comprovante de crédito'),
      etapa('Liquidada', 'pendente', null)
    ]
  },
  {
    id: 'OP-2026-0181',
    dataCriacao: addHours(-120),
    valorBruto: 19641.5,
    valorLiquido: 19122.33,
    taxaMensal: 1.3,
    status: 'liquidada',
    titulos: [
      tituloOperacao('rec-007', 'DUP-4411/01', 3, 9820.75, 9570.11, -2, 'Liquidado'),
      tituloOperacao('rec-008', 'DUP-4411/02', 3, 9820.75, 9552.22, -1, 'Liquidado')
    ],
    etapas: [
      etapa('Assinatura do termo', 'concluida', 121, 'Termo assinado'),
      etapa('Enviada', 'concluida', 120, 'Protocolo de envio'),
      etapa('Aceite do sacado', 'concluida', 118, 'Aceite eletrônico'),
      etapa('Registro na registradora', 'concluida', 116, 'Protocolo CERC 8811077-04'),
      etapa('Crédito em conta', 'concluida', 114, 'Comprovante de crédito'),
      etapa('Liquidada', 'concluida', 24, 'Extrato de liquidação')
    ]
  },
  {
    id: 'OP-2026-0180',
    dataCriacao: addHours(-200),
    valorBruto: 148600.0,
    valorLiquido: 144312.8,
    taxaMensal: 1.29,
    status: 'liquidada',
    titulos: [
      tituloOperacao('rec-009', 'DUP-5520/01', 4, 74300.0, 72156.4, -6, 'Liquidado'),
      tituloOperacao('rec-010', 'DUP-5520/02', 4, 74300.0, 72156.4, -4, 'Liquidado')
    ],
    etapas: [
      etapa('Assinatura do termo', 'concluida', 201, 'Termo assinado'),
      etapa('Enviada', 'concluida', 200, 'Protocolo de envio'),
      etapa('Aceite do sacado', 'concluida', 198, 'Aceite eletrônico'),
      etapa('Registro na registradora', 'concluida', 196, 'Protocolo CERC 8790155-71'),
      etapa('Crédito em conta', 'concluida', 194, 'Comprovante de crédito'),
      etapa('Liquidada', 'concluida', 96, 'Extrato de liquidação')
    ]
  },
  {
    id: 'OP-2026-0179',
    dataCriacao: addHours(-320),
    valorBruto: 63400.0,
    valorLiquido: 61688.2,
    taxaMensal: 1.31,
    status: 'liquidada',
    titulos: [tituloOperacao('rec-011', 'DUP-1041/01', 0, 63400.0, 61688.2, -12, 'Liquidado')],
    etapas: [
      etapa('Assinatura do termo', 'concluida', 321, 'Termo assinado'),
      etapa('Enviada', 'concluida', 320, 'Protocolo de envio'),
      etapa('Aceite do sacado', 'concluida', 318, 'Aceite eletrônico'),
      etapa('Registro na registradora', 'concluida', 316, 'Protocolo CERC 8712900-38'),
      etapa('Crédito em conta', 'concluida', 314, 'Comprovante de crédito'),
      etapa('Liquidada', 'concluida', 288, 'Extrato de liquidação')
    ]
  },
  {
    id: 'OP-2026-0178',
    dataCriacao: addHours(-4),
    valorBruto: 64200.0,
    valorLiquido: 62480.55,
    taxaMensal: 1.32,
    status: 'aguardando_assinatura',
    titulos: [
      tituloOperacao('rec-011', 'DUP-5520/01', 4, 34200.0, 33290.1, 40, 'Aguardando assinatura'),
      tituloOperacao('rec-012', 'DUP-5520/02', 4, 30000.0, 29190.45, 70, 'Aguardando assinatura')
    ],
    etapas: [
      etapa('Assinatura do termo', 'em_andamento', null),
      etapa('Enviada', 'pendente', null),
      etapa('Aceite do sacado', 'pendente', null),
      etapa('Registro na registradora', 'pendente', null),
      etapa('Crédito em conta', 'pendente', null),
      etapa('Liquidada', 'pendente', null)
    ]
  },
  {
    id: 'OP-2026-0177',
    dataCriacao: addHours(-10),
    valorBruto: 38200.0,
    valorLiquido: 37260.4,
    taxaMensal: 1.3,
    status: 'aguardando_assinatura',
    titulos: [
      tituloOperacao('rec-003', 'DUP-2210/01', 1, 22400.0, 21860.4, 15, 'Aguardando assinatura'),
      tituloOperacao('rec-004', 'DUP-2210/02', 1, 15800.0, 15400.0, 45, 'Aguardando assinatura')
    ],
    etapas: [
      etapa('Assinatura do termo', 'em_andamento', null),
      etapa('Enviada', 'pendente', null),
      etapa('Aceite do sacado', 'pendente', null),
      etapa('Registro na registradora', 'pendente', null),
      etapa('Crédito em conta', 'pendente', null),
      etapa('Liquidada', 'pendente', null)
    ]
  },
  {
    id: 'OP-2026-0176',
    dataCriacao: addHours(-18),
    valorBruto: 41300.0,
    valorLiquido: 40312.6,
    taxaMensal: 1.27,
    status: 'aguardando_assinatura',
    titulos: [tituloOperacao('rec-014', 'DUP-4415/01', 3, 41300.0, 40312.6, 49, 'Aguardando assinatura')],
    etapas: [
      etapa('Assinatura do termo', 'em_andamento', null),
      etapa('Enviada', 'pendente', null),
      etapa('Aceite do sacado', 'pendente', null),
      etapa('Registro na registradora', 'pendente', null),
      etapa('Crédito em conta', 'pendente', null),
      etapa('Liquidada', 'pendente', null)
    ]
  },
  {
    id: 'OP-2026-0176-B',
    dataCriacao: addHours(-16),
    valorBruto: 22400.0,
    valorLiquido: 21821.9,
    taxaMensal: 1.31,
    status: 'enviada',
    titulos: [tituloOperacao('rec-015', 'DUP-5521/01', 4, 22400.0, 21821.9, 55, 'Aguardando aceite')],
    etapas: [
      etapa('Assinatura do termo', 'concluida', 17, 'Termo assinado'),
      etapa('Enviada', 'concluida', 16, 'Protocolo de envio'),
      etapa('Aceite do sacado', 'pendente', null),
      etapa('Registro na registradora', 'pendente', null),
      etapa('Crédito em conta', 'pendente', null),
      etapa('Liquidada', 'pendente', null)
    ]
  },
  {
    id: 'OP-2026-0175',
    dataCriacao: addHours(-40),
    valorBruto: 92500.0,
    valorLiquido: 90128.7,
    taxaMensal: 1.34,
    status: 'enviada',
    titulos: [tituloOperacao('rec-013', 'DUP-3391/01', 2, 92500.0, 90128.7, 36, 'Aguardando aceite')],
    etapas: [
      etapa('Assinatura do termo', 'concluida', 41, 'Termo assinado'),
      etapa('Enviada', 'concluida', 40, 'Protocolo de envio'),
      etapa('Aceite do sacado', 'pendente', null),
      etapa('Registro na registradora', 'pendente', null),
      etapa('Crédito em conta', 'pendente', null),
      etapa('Liquidada', 'pendente', null)
    ]
  },
  {
    id: 'OP-2026-0174',
    dataCriacao: addHours(-620),
    valorBruto: 88400.0,
    valorLiquido: 85990.2,
    taxaMensal: 1.36,
    status: 'recusada',
    motivoRecusa:
      'Sacado não reconheceu a duplicata DUP-3391/04: nota fiscal cancelada na SEFAZ após a emissão do título.',
    titulos: [
      tituloOperacao('rec-018', 'DUP-3391/04', 2, 88400.0, 85990.2, 22, 'Recusado', 'Nota fiscal cancelada')
    ],
    etapas: [
      etapa('Assinatura do termo', 'concluida', 621, 'Termo assinado'),
      etapa('Enviada', 'concluida', 620, 'Protocolo de envio'),
      etapa(
        'Aceite do sacado',
        'recusada',
        612,
        null,
        'Sacado não reconheceu a duplicata: nota fiscal cancelada na SEFAZ.'
      ),
      etapa('Registro na registradora', 'pendente', null),
      etapa('Crédito em conta', 'pendente', null),
      etapa('Liquidada', 'pendente', null)
    ]
  },
  {
    id: 'OP-2026-0173',
    dataCriacao: addHours(-65),
    valorBruto: 58900.0,
    valorLiquido: 57193.9,
    taxaMensal: 1.33,
    status: 'enviada',
    titulos: [tituloOperacao('rec-015', 'DUP-5525/01', 4, 58900.0, 57193.9, 55, 'Aguardando aceite')],
    etapas: [
      etapa('Assinatura do termo', 'concluida', 66, 'Termo assinado'),
      etapa('Enviada', 'concluida', 65, 'Protocolo de envio'),
      etapa('Aceite do sacado', 'pendente', null),
      etapa('Registro na registradora', 'pendente', null),
      etapa('Crédito em conta', 'pendente', null),
      etapa('Liquidada', 'pendente', null)
    ]
  },
  {
    id: 'OP-2026-0172',
    dataCriacao: addHours(-90),
    valorBruto: 48750.0,
    valorLiquido: 47461.28,
    taxaMensal: 1.32,
    status: 'enviada',
    titulos: [tituloOperacao('rec-001', 'DUP-1042/01', 0, 48750.0, 47461.28, 28, 'Aguardando aceite')],
    etapas: [
      etapa('Assinatura do termo', 'concluida', 91, 'Termo assinado'),
      etapa('Enviada', 'concluida', 90, 'Protocolo de envio'),
      etapa('Aceite do sacado', 'pendente', null),
      etapa('Registro na registradora', 'pendente', null),
      etapa('Crédito em conta', 'pendente', null),
      etapa('Liquidada', 'pendente', null)
    ]
  },
  {
    id: 'OP-2026-0171',
    dataCriacao: addHours(-1680),
    valorBruto: 208000.0,
    valorLiquido: 202410.8,
    taxaMensal: 1.24,
    status: 'liquidada',
    titulos: [tituloOperacao('rec-020', 'DUP-4411/07', 3, 208000.0, 202410.8, -18, 'Liquidado')],
    etapas: [
      etapa('Assinatura do termo', 'concluida', 1681, 'Termo assinado'),
      etapa('Enviada', 'concluida', 1680, 'Protocolo de envio'),
      etapa('Aceite do sacado', 'concluida', 1676, 'Aceite eletrônico'),
      etapa('Registro na registradora', 'concluida', 1670, 'Protocolo CERC 7710233-45'),
      etapa('Crédito em conta', 'concluida', 1668, 'Comprovante de crédito'),
      etapa('Liquidada', 'concluida', 432, 'Comprovante de liquidação')
    ]
  },
  {
    id: 'OP-2026-0170',
    dataCriacao: addHours(-100),
    valorBruto: 18900.0,
    valorLiquido: 18402.5,
    taxaMensal: 1.3,
    status: 'aceite_sacado',
    titulos: [tituloOperacao('rec-012', 'DUP-2211/01', 1, 18900.0, 18402.5, 26, 'Aceito pelo sacado')],
    etapas: [
      etapa('Assinatura do termo', 'concluida', 101, 'Termo assinado'),
      etapa('Enviada', 'concluida', 100, 'Protocolo de envio'),
      etapa('Aceite do sacado', 'em_andamento', null),
      etapa('Registro na registradora', 'pendente', null),
      etapa('Crédito em conta', 'pendente', null),
      etapa('Liquidada', 'pendente', null)
    ]
  },
  {
    id: 'OP-2026-0169',
    dataCriacao: addHours(-130),
    valorBruto: 52900.0,
    valorLiquido: 51471.7,
    taxaMensal: 1.33,
    status: 'aceite_sacado',
    titulos: [tituloOperacao('rec-014', 'DUP-4420/01', 3, 52900.0, 51471.7, 49, 'Aceito pelo sacado')],
    etapas: [
      etapa('Assinatura do termo', 'concluida', 131, 'Termo assinado'),
      etapa('Enviada', 'concluida', 130, 'Protocolo de envio'),
      etapa('Aceite do sacado', 'em_andamento', null),
      etapa('Registro na registradora', 'pendente', null),
      etapa('Crédito em conta', 'pendente', null),
      etapa('Liquidada', 'pendente', null)
    ]
  },
  {
    id: 'OP-2026-0168',
    dataCriacao: addHours(-150),
    valorBruto: 79400.0,
    valorLiquido: 77335.6,
    taxaMensal: 1.26,
    status: 'aceite_sacado',
    titulos: [tituloOperacao('rec-015', 'DUP-5518/01', 4, 79400.0, 77335.6, 55, 'Aceito pelo sacado')],
    etapas: [
      etapa('Assinatura do termo', 'concluida', 151, 'Termo assinado'),
      etapa('Enviada', 'concluida', 150, 'Protocolo de envio'),
      etapa('Aceite do sacado', 'em_andamento', null),
      etapa('Registro na registradora', 'pendente', null),
      etapa('Crédito em conta', 'pendente', null),
      etapa('Liquidada', 'pendente', null)
    ]
  },
  {
    id: 'OP-2026-0167',
    dataCriacao: addHours(-180),
    valorBruto: 31200.0,
    valorLiquido: 30392.8,
    taxaMensal: 1.28,
    status: 'registro',
    titulos: [tituloOperacao('rec-011', 'DUP-1043/01', 0, 31200.0, 30392.8, 12, 'Registrado')],
    etapas: [
      etapa('Assinatura do termo', 'concluida', 181, 'Termo assinado'),
      etapa('Enviada', 'concluida', 180, 'Protocolo de envio'),
      etapa('Aceite do sacado', 'concluida', 176, 'Aceite eletrônico'),
      etapa('Registro na registradora', 'em_andamento', null),
      etapa('Crédito em conta', 'pendente', null),
      etapa('Liquidada', 'pendente', null)
    ]
  },
  {
    id: 'OP-2026-0166',
    dataCriacao: addHours(-220),
    valorBruto: 156000.0,
    valorLiquido: 151980.2,
    taxaMensal: 1.28,
    status: 'registro',
    titulos: [tituloOperacao('rec-005', 'DUP-3390/01', 2, 156000.0, 151980.2, 33, 'Registrado')],
    etapas: [
      etapa('Assinatura do termo', 'concluida', 221, 'Termo assinado'),
      etapa('Enviada', 'concluida', 220, 'Protocolo de envio'),
      etapa('Aceite do sacado', 'concluida', 216, 'Aceite eletrônico'),
      etapa('Registro na registradora', 'em_andamento', null),
      etapa('Crédito em conta', 'pendente', null),
      etapa('Liquidada', 'pendente', null)
    ]
  },
  {
    id: 'OP-2026-0165',
    dataCriacao: addHours(-260),
    valorBruto: 36750.0,
    valorLiquido: 35960.9,
    taxaMensal: 1.24,
    status: 'registro',
    titulos: [tituloOperacao('rec-014', 'DUP-4408/01', 3, 36750.0, 35960.9, 49, 'Registrado')],
    etapas: [
      etapa('Assinatura do termo', 'concluida', 261, 'Termo assinado'),
      etapa('Enviada', 'concluida', 260, 'Protocolo de envio'),
      etapa('Aceite do sacado', 'concluida', 256, 'Aceite eletrônico'),
      etapa('Registro na registradora', 'em_andamento', null),
      etapa('Crédito em conta', 'pendente', null),
      etapa('Liquidada', 'pendente', null)
    ]
  },
  {
    id: 'OP-2026-0164',
    dataCriacao: addHours(-300),
    valorBruto: 74300.0,
    valorLiquido: 72156.4,
    taxaMensal: 1.29,
    status: 'credito',
    titulos: [tituloOperacao('rec-009', 'DUP-5520/01', 4, 74300.0, 72156.4, 40, 'Creditado')],
    etapas: [
      etapa('Assinatura do termo', 'concluida', 301, 'Termo assinado'),
      etapa('Enviada', 'concluida', 300, 'Protocolo de envio'),
      etapa('Aceite do sacado', 'concluida', 296, 'Aceite eletrônico'),
      etapa('Registro na registradora', 'concluida', 290, 'Protocolo CERC 8845560-31'),
      etapa('Crédito em conta', 'concluida', 286, 'Comprovante de crédito'),
      etapa('Liquidada', 'pendente', null)
    ]
  },
  {
    id: 'OP-2026-0163',
    dataCriacao: addHours(-340),
    valorBruto: 22400.5,
    valorLiquido: 21860.4,
    taxaMensal: 1.35,
    status: 'credito',
    // Vencido e não pago: dá à tela de Liquidações um caso para tratar.
    titulos: [tituloOperacao('rec-003', 'DUP-2210/01', 1, 22400.5, 21860.4, -6, 'Creditado')],
    etapas: [
      etapa('Assinatura do termo', 'concluida', 341, 'Termo assinado'),
      etapa('Enviada', 'concluida', 340, 'Protocolo de envio'),
      etapa('Aceite do sacado', 'concluida', 336, 'Aceite eletrônico'),
      etapa('Registro na registradora', 'concluida', 330, 'Protocolo CERC 8845678-04'),
      etapa('Crédito em conta', 'concluida', 326, 'Comprovante de crédito'),
      etapa('Liquidada', 'pendente', null)
    ]
  }
];

const USUARIO_APROVADOR = { id: 'usr-1', nome: 'Mariana Andrade', papel: 'aprovador' };
const USUARIO_OPERADOR = { id: 'usr-2', nome: 'Carlos Nakamura', papel: 'operador' };

/** Hash só para a tela ter o que exibir como evidência. */
const hashSimulado = (operacaoId) =>
  `sha256:${operacaoId.replace(/\D/g, '')}${'a3f9c1e7b2d84056'}`.slice(0, 32);

const termo = (operacaoId, status, horasAtras, criadoPor, assinadoPor) => {
  const operacao = OPERACOES.find((item) => item.id === operacaoId);
  if (!operacao) throw new Error(`Mock inconsistente: operação ${operacaoId} não existe.`);

  return {
    id: `TC-${operacaoId.replace('OP-', '')}`,
    operacaoId,
    status,
    criadoEm: addHours(-horasAtras),
    criadoPor,
    quantidadeTitulos: operacao.titulos.length,
    valorBruto: operacao.valorBruto,
    valorLiquido: operacao.valorLiquido,
    assinatura:
      status === 'assinado'
        ? {
            assinadoPor,
            assinadoEm: addHours(-horasAtras + 1),
            metodo: 'aceite_eletronico_2fa',
            hash: hashSimulado(operacaoId),
            ip: '177.32.14.80'
          }
        : null
  };
};

export const TERMOS_CESSAO = OPERACOES.map((operacao) => {
  if (operacao.status === 'aguardando_assinatura') {
    return termo(operacao.id, 'pendente', 4, USUARIO_OPERADOR, null);
  }
  if (operacao.status === 'recusada') {
    return termo(operacao.id, 'cancelado', 80, USUARIO_OPERADOR, null);
  }
  return termo(operacao.id, 'assinado', 30, USUARIO_OPERADOR, USUARIO_APROVADOR);
});

export const CEDENTE = {
  razaoSocial: 'Comercial Andrade Distribuição S/A',
  nomeFantasia: 'Andrade Distribuição',
  cnpj: '11222333000181',
  endereco: 'Av. Brigadeiro Faria Lima, 1811 — Jardim Paulistano, São Paulo/SP — 01452-001',
  situacaoCadastral: 'aprovado',
  contaBancaria: {
    banco: 'Banco Itaú Unibanco S.A.',
    codigoBanco: '341',
    agencia: '0710',
    conta: '45892-3',
    tipo: 'Conta corrente',
    titular: 'Comercial Andrade Distribuição S/A',
    cnpjTitular: '11222333000181',
    situacao: 'ativa'
  },
  integracoes: [
    {
      id: 'int-1',
      nome: 'API de recebíveis',
      tipo: 'api',
      status: 'conectada',
      detalhe: 'Chave gerada em 12/08/2026 · último acesso há 2 horas'
    },
    {
      id: 'int-2',
      nome: 'ERP TOTVS Protheus',
      tipo: 'api',
      status: 'desconectada',
      detalhe: 'Nunca conectado'
    },
    {
      id: 'int-3',
      nome: 'Layout de arquivo CNAB 400',
      tipo: 'arquivo',
      status: 'conectada',
      detalhe: 'Layout padrão CNAB 400 · posições 1 a 240'
    }
  ],
  usuarios: [
    { id: 'usr-1', nome: 'Mariana Andrade', email: 'mariana@andradedist.com.br', papel: 'aprovador', status: 'ativo' },
    { id: 'usr-2', nome: 'Carlos Nakamura', email: 'carlos@andradedist.com.br', papel: 'operador', status: 'ativo' },
    { id: 'usr-3', nome: 'Rita Bezerra', email: 'rita@andradedist.com.br', papel: 'operador', status: 'convidado' }
  ]
};

export const NOTIFICACOES = [
  {
    id: 'not-1',
    titulo: 'Operação recusada pelo sacado',
    mensagem:
      'A operação OP-2026-0182 foi recusada: o sacado não reconheceu a duplicata DUP-2210/02 por divergência de valor com a nota fiscal.',
    evento: 'operacao_recusada',
    dataHora: addHours(-50),
    lida: false,
    operacaoId: 'OP-2026-0182'
  },
  {
    id: 'not-2',
    titulo: 'Crédito realizado',
    mensagem:
      'O valor líquido de R$ 303.187,40 da operação OP-2026-0183 foi creditado na conta Itaú 0710 / 45892-3.',
    evento: 'credito_realizado',
    dataHora: addHours(-24),
    lida: false,
    operacaoId: 'OP-2026-0183'
  },
  {
    id: 'not-3',
    titulo: 'Registro pendente na registradora',
    mensagem:
      '3 títulos importados estão com registro pendente na CERC e não podem ser antecipados até a confirmação do registro.',
    evento: 'registro_pendente',
    dataHora: addHours(-30),
    lida: false
  },
  {
    id: 'not-4',
    titulo: 'Operação enviada',
    mensagem:
      'A operação OP-2026-0184 foi enviada e está aguardando o aceite do sacado Hospital São Lucas S/A.',
    evento: 'operacao_aprovada',
    dataHora: addHours(-6),
    lida: true,
    operacaoId: 'OP-2026-0184'
  },
  {
    id: 'not-5',
    titulo: 'Título liquidado',
    mensagem: 'O título DUP-4411/02 venceu ontem e foi liquidado pelo sacado. Nenhuma ação necessária.',
    evento: 'titulo_vencido',
    dataHora: addHours(-28),
    lida: true,
    operacaoId: 'OP-2026-0181'
  }
];

export const PREFERENCIAS_NOTIFICACAO_PADRAO = {
  operacao_aprovada: { email: true, whatsapp: true },
  operacao_recusada: { email: true, whatsapp: true },
  credito_realizado: { email: true, whatsapp: false },
  titulo_vencido: { email: true, whatsapp: false },
  registro_pendente: { email: false, whatsapp: false }
};

export const LIMITE = {
  total: 1500000.0,
  utilizado: 409500.0
};

/** Parâmetros comerciais que o backend vai passar a devolver por cedente/financiador. */
export const PARAMETROS_OPERACAO = {
  taxaMensal: 1.32,
  iofDiario: 0.000082,
  iofAdicional: 0.0038,
  tarifaPorTitulo: 4.9,
  tarifaMinima: 25.0,
  prazoMinimoDias: 10,
  prazoMaximoDias: 180
};
