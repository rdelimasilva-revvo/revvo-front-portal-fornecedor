/**
 * Formatação centralizada do portal do cedente.
 * Regras transversais: valores em BRL, datas dd/mm/aaaa, fuso America/Sao_Paulo.
 */

export const TIMEZONE = 'America/Sao_Paulo';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: TIMEZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: TIMEZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

/** Converte string ISO (yyyy-mm-dd ou completa) ou Date em Date, sem escorregar de dia por fuso. */
const toDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  // Datas puras (yyyy-mm-dd) são lidas como meio-dia UTC para não virar o dia no fuso de SP.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T12:00:00Z`);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatCurrency = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return currencyFormatter.format(Number(value));
};

export const formatDate = (value) => {
  const date = toDate(value);
  return date ? dateFormatter.format(date) : '—';
};

export const formatDateTime = (value) => {
  const date = toDate(value);
  return date ? dateTimeFormatter.format(date) : '—';
};

export const formatPercent = (value, digits = 2) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return `${Number(value).toFixed(digits).replace('.', ',')}%`;
};

export const formatCNPJ = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length !== 14) return value || '—';
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
};

/** Data de hoje no fuso de São Paulo, normalizada para meia-noite. */
export const today = () => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
  return new Date(`${parts}T12:00:00Z`);
};

/** Dias corridos entre hoje e uma data (negativo = vencido). */
export const daysUntil = (value) => {
  const date = toDate(value);
  if (!date) return null;
  return Math.round((date - today()) / (1000 * 60 * 60 * 24));
};

export const toISODate = (value) => {
  const date = toDate(value);
  return date ? date.toISOString().slice(0, 10) : null;
};
