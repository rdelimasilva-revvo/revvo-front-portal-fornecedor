/**
 * Contratos de dados do portal do cedente.
 *
 * O projeto é JS puro: estes typedefs existem para dar um contrato único às telas
 * e à camada de serviço enquanto o backend não existe. Quando a API real entrar,
 * é este shape que os adapters em src/services precisam devolver.
 */

/**
 * @typedef {'registrada'|'pendente'|'nao_registrada'|'recusada'} StatusRegistro
 * @typedef {'xml'|'arquivo'|'registradora'} OrigemRecebivel
 */

/**
 * @typedef {Object} Sacado
 * @property {string} id
 * @property {string} nome
 * @property {string} cnpj
 */

/**
 * @typedef {Object} Recebivel
 * @property {string} id
 * @property {Sacado} sacado
 * @property {string} numeroTitulo
 * @property {string} numeroNF
 * @property {number} valor
 * @property {string} vencimento          ISO yyyy-mm-dd
 * @property {StatusRegistro} statusRegistro
 * @property {OrigemRecebivel} origem
 * @property {boolean} elegivel
 * @property {string} [motivoInelegibilidade]
 */

/**
 * @typedef {Object} SimulacaoTitulo
 * @property {string} recebivelId
 * @property {number} valorBruto
 * @property {number} prazoDias
 * @property {number} desconto
 * @property {number} iof
 * @property {number} valorLiquido
 */

/**
 * @typedef {Object} Simulacao
 * @property {SimulacaoTitulo[]} titulos
 * @property {number} valorBruto
 * @property {number} taxaMensal
 * @property {number} prazoMedio          dias
 * @property {number} iof
 * @property {number} tarifas
 * @property {number} valorLiquido
 * @property {string} dataCredito         ISO yyyy-mm-dd
 */

/**
 * @typedef {'aguardando_assinatura'|'enviada'|'aceite_sacado'|'registro'|'credito'|'liquidada'|'recusada'} StatusOperacao
 */

/**
 * @typedef {Object} EtapaOperacao
 * @property {string} nome
 * @property {'concluida'|'em_andamento'|'pendente'|'recusada'} situacao
 * @property {string} [dataHora]          ISO completo
 * @property {string} [evidenciaUrl]
 * @property {string} [evidenciaLabel]
 * @property {string} [motivo]            obrigatório quando a etapa é negativa
 */

/**
 * @typedef {Object} TituloOperacao
 * @property {string} recebivelId
 * @property {string} numeroTitulo
 * @property {Sacado} sacado
 * @property {number} valorBruto
 * @property {number} valorLiquido
 * @property {string} vencimento
 * @property {string} status
 * @property {string} [motivo]
 */

/**
 * @typedef {Object} Operacao
 * @property {string} id
 * @property {string} dataCriacao         ISO completo
 * @property {TituloOperacao[]} titulos
 * @property {number} valorBruto
 * @property {number} valorLiquido
 * @property {number} taxaMensal
 * @property {StatusOperacao} status
 * @property {EtapaOperacao[]} etapas
 * @property {string} [motivoRecusa]
 */

/**
 * @typedef {'pendente'|'assinado'|'cancelado'} StatusTermo
 */

/**
 * @typedef {Object} AssinaturaTermo
 * @property {{id: string, nome: string, papel: string}} assinadoPor
 * @property {string} assinadoEm          ISO completo
 * @property {'aceite_eletronico_2fa'} metodo
 * @property {string} hash                SHA-256 simulado do texto do termo
 * @property {string} ip                  simulado
 */

/**
 * @typedef {Object} TermoCessao
 * @property {string} id                  TC-2026-0184
 * @property {string} operacaoId
 * @property {StatusTermo} status
 * @property {string} criadoEm            ISO completo
 * @property {{id: string, nome: string, papel: string}} criadoPor
 * @property {number} quantidadeTitulos   desnormalizado da operação
 * @property {number} valorBruto          desnormalizado da operação
 * @property {number} valorLiquido        desnormalizado da operação
 * @property {AssinaturaTermo|null} assinatura
 */

/**
 * @typedef {Object} ContaBancaria
 * @property {string} banco
 * @property {string} codigoBanco
 * @property {string} agencia
 * @property {string} conta
 * @property {string} tipo
 * @property {string} titular
 * @property {string} cnpjTitular
 * @property {'ativa'|'em_aprovacao'} situacao
 */

/**
 * @typedef {Object} Integracao
 * @property {string} id
 * @property {string} nome
 * @property {'api'|'arquivo'} tipo
 * @property {'conectada'|'desconectada'|'erro'} status
 * @property {string} [detalhe]
 */

/**
 * @typedef {Object} UsuarioCedente
 * @property {string} id
 * @property {string} nome
 * @property {string} email
 * @property {'operador'|'aprovador'} papel
 * @property {'ativo'|'convidado'|'inativo'} status
 */

/**
 * @typedef {Object} Cedente
 * @property {string} razaoSocial
 * @property {string} nomeFantasia
 * @property {string} cnpj
 * @property {string} endereco
 * @property {'aprovado'|'em_analise'} situacaoCadastral
 * @property {ContaBancaria} contaBancaria
 * @property {Integracao[]} integracoes
 * @property {UsuarioCedente[]} usuarios
 */

/**
 * @typedef {Object} Notificacao
 * @property {string} id
 * @property {string} titulo
 * @property {string} mensagem
 * @property {'operacao_aprovada'|'operacao_recusada'|'credito_realizado'|'titulo_vencido'|'registro_pendente'} evento
 * @property {string} dataHora
 * @property {boolean} lida
 * @property {string} [operacaoId]
 */

export const STATUS_REGISTRO_LABEL = {
  registrada: 'Registrada',
  pendente: 'Registro pendente',
  nao_registrada: 'Não registrada',
  recusada: 'Registro recusado'
};

export const ORIGEM_LABEL = {
  xml: 'XML de NF-e',
  arquivo: 'Arquivo',
  registradora: 'Registradora'
};

export const STATUS_OPERACAO_LABEL = {
  aguardando_assinatura: 'Aguardando assinatura',
  enviada: 'Enviada',
  aceite_sacado: 'Aceite do sacado',
  registro: 'Registro na registradora',
  credito: 'Crédito em conta',
  liquidada: 'Liquidada',
  recusada: 'Recusada'
};

export const ETAPAS_OPERACAO = [
  'Assinatura do termo',
  'Enviada',
  'Aceite do sacado',
  'Registro na registradora',
  'Crédito em conta',
  'Liquidada'
];

export const STATUS_TERMO_LABEL = {
  pendente: 'Aguardando assinatura',
  assinado: 'Assinado',
  cancelado: 'Cancelado'
};

export const EVENTOS_NOTIFICACAO = [
  { id: 'operacao_aprovada', label: 'Operação aprovada' },
  { id: 'operacao_recusada', label: 'Operação recusada' },
  { id: 'credito_realizado', label: 'Crédito realizado' },
  { id: 'titulo_vencido', label: 'Título vencido' },
  { id: 'registro_pendente', label: 'Registro pendente' }
];
