import React from 'react';

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function parseBR(str) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(str || '');
  if (!m) return null;
  const d = new Date(+m[3], +m[2] - 1, +m[1]);
  return isNaN(d.getTime()) ? null : d;
}
function formatBR(date) {
  const p = (n) => String(n).padStart(2, '0');
  return `${p(date.getDate())}/${p(date.getMonth() + 1)}/${date.getFullYear()}`;
}
function maskDate(digits) {
  digits = digits.slice(0, 8);
  let out = digits.slice(0, 2);
  if (digits.length > 2) out += '/' + digits.slice(2, 4);
  if (digits.length > 4) out += '/' + digits.slice(4, 8);
  return out;
}
function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }

export function DatePicker({ label, value, onChange, hint, error, disabled = false, id, style }) {
  const [open, setOpen] = React.useState(false);
  const [focus, setFocus] = React.useState(false);
  const parsed = parseBR(value);
  const [viewDate, setViewDate] = React.useState(parsed || new Date());
  const ref = React.useRef(null);
  const inputId = id || React.useId();

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);
  React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); }, [open, viewDate]);

  const handleInput = (e) => {
    const digits = e.target.value.replace(/\D/g, '');
    onChange && onChange(maskDate(digits));
  };

  const y = viewDate.getFullYear(), m = viewDate.getMonth();
  const firstDow = new Date(y, m, 1).getDay();
  const total = daysInMonth(y, m);
  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];

  const pick = (day) => {
    onChange && onChange(formatBR(new Date(y, m, day)));
    setOpen(false);
  };

  const borderColor = error ? 'var(--danger-500)' : (focus || open) ? 'var(--soft-blue-400)' : 'var(--light-40)';

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--font-sans)', position: 'relative', ...style }}>
      {label && <label htmlFor={inputId} style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>{label}</label>}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 10px 0 14px',
        background: disabled ? 'var(--surface-sunken)' : 'var(--surface-card)',
        border: `1.5px solid ${borderColor}`, borderRadius: 'var(--radius-sm)',
        boxShadow: (focus || open) && !error ? 'var(--focus-ring)' : 'none',
        transition: 'border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)',
      }}>
        <input id={inputId} disabled={disabled} value={value || ''} placeholder="dd/mm/aaaa"
          onChange={handleInput} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          inputMode="numeric" style={{
            flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
            fontSize: 14, fontFamily: 'var(--font-sans)', color: 'var(--text-strong)', fontVariantNumeric: 'tabular-nums',
          }} />
        <button type="button" aria-label="Abrir calendário" disabled={disabled}
          onClick={() => { setOpen((o) => !o); setViewDate(parsed || new Date()); }}
          style={{ border: 'none', background: 'transparent', cursor: disabled ? 'not-allowed' : 'pointer', color: 'var(--text-muted)', display: 'inline-flex', padding: 4 }}>
          <i data-lucide="calendar" style={{ width: 17, height: 17 }}></i>
        </button>
      </div>
      {error ? (
        <span style={{ fontSize: 12, color: 'var(--danger-700)' }}>{error}</span>
      ) : hint ? (
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{hint}</span>
      ) : null}

      {open && (
        <div role="dialog" aria-label="Selecionar data" style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 'var(--z-dropdown)', width: 268,
          background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', padding: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <button type="button" aria-label="Mês anterior" onClick={() => setViewDate(new Date(y, m - 1, 1))}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'inline-flex' }}>
              <i data-lucide="chevron-left" style={{ width: 16, height: 16 }}></i>
            </button>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-strong)' }}>{MONTHS[m]} {y}</span>
            <button type="button" aria-label="Próximo mês" onClick={() => setViewDate(new Date(y, m + 1, 1))}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'inline-flex' }}>
              <i data-lucide="chevron-right" style={{ width: 16, height: 16 }}></i>
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 4 }}>
            {WEEKDAYS.map((d, i) => (
              <span key={i} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', padding: '4px 0' }}>{d}</span>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
            {cells.map((day, i) => {
              if (!day) return <span key={i}></span>;
              const isSel = parsed && parsed.getFullYear() === y && parsed.getMonth() === m && parsed.getDate() === day;
              return (
                <button key={i} type="button" onClick={() => pick(day)} style={{
                  height: 30, border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  fontSize: 13, fontVariantNumeric: 'tabular-nums', fontWeight: isSel ? 700 : 500,
                  background: isSel ? 'var(--revvo-blue-500)' : 'transparent', color: isSel ? '#fff' : 'var(--text-body)',
                }}>{day}</button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
