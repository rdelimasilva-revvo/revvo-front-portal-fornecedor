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
function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function atMidnight(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

export function DateRangePicker({ label, value, onChange, hint, error, presets = true, disabled = false, style }) {
  const [open, setOpen] = React.useState(false);
  const start = parseBR(value && value.start);
  const end = parseBR(value && value.end);
  const [viewDate, setViewDate] = React.useState(start || new Date());
  const [draftStart, setDraftStart] = React.useState(null);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setDraftStart(null); } };
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); setDraftStart(null); } };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);
  React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); }, [open, viewDate]);

  const commit = (s, e) => onChange && onChange({ start: s ? formatBR(s) : '', end: e ? formatBR(e) : '' });

  const pick = (day) => {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (!draftStart) { setDraftStart(d); commit(d, null); return; }
    if (d < draftStart) { setDraftStart(d); commit(d, null); return; }
    commit(draftStart, d);
    setDraftStart(null);
    setOpen(false);
  };

  const applyPreset = (s, e) => { commit(s, e); setViewDate(s); setDraftStart(null); setOpen(false); };
  const today = atMidnight(new Date());
  const presetList = [
    { label: 'Hoje', get: () => [today, today] },
    { label: '7 dias', get: () => [new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6), today] },
    { label: 'Este mês', get: () => [new Date(today.getFullYear(), today.getMonth(), 1), new Date(today.getFullYear(), today.getMonth() + 1, 0)] },
    { label: 'Trimestre', get: () => [new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1), today] },
  ];

  const y = viewDate.getFullYear(), m = viewDate.getMonth();
  const firstDow = new Date(y, m, 1).getDay();
  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth(y, m) }, (_, i) => i + 1)];
  const rangeStart = draftStart || start;
  const borderColor = error ? 'var(--danger-500)' : open ? 'var(--soft-blue-400)' : 'var(--light-40)';
  const display = start && end ? `${formatBR(start)} – ${formatBR(end)}` : start ? `${formatBR(start)} – …` : '';

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--font-sans)', position: 'relative', ...style }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>{label}</label>}
      <button type="button" disabled={disabled} onClick={() => { setOpen((o) => !o); setViewDate(start || new Date()); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 12px 0 14px', width: '100%',
          background: disabled ? 'var(--surface-sunken)' : 'var(--surface-card)', textAlign: 'left',
          border: `1.5px solid ${borderColor}`, borderRadius: 'var(--radius-sm)', cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: open && !error ? 'var(--focus-ring)' : 'none',
          transition: 'border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)',
        }}>
        <span style={{ flex: 1, fontSize: 14, color: display ? 'var(--text-strong)' : 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{display || 'dd/mm/aaaa – dd/mm/aaaa'}</span>
        <i data-lucide="calendar" style={{ width: 17, height: 17, color: 'var(--text-muted)' }}></i>
      </button>
      {error ? <span style={{ fontSize: 12, color: 'var(--danger-700)' }}>{error}</span>
        : hint ? <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{hint}</span> : null}

      {open && (
        <div role="dialog" aria-label="Selecionar período" style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 'var(--z-dropdown)', display: 'flex',
          background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
        }}>
          {presets && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 10, borderRight: '1px solid var(--border-subtle)', minWidth: 108 }}>
              {presetList.map((p) => (
                <button key={p.label} type="button" onClick={() => { const [s, e] = p.get(); applyPreset(s, e); }}
                  style={{ border: 'none', background: 'transparent', textAlign: 'left', padding: '8px 10px', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--text-body)', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>{p.label}</button>
              ))}
            </div>
          )}
          <div style={{ padding: 12, width: 268 }}>
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
              {WEEKDAYS.map((d, i) => <span key={i} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', padding: '4px 0' }}>{d}</span>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px 0' }}>
              {cells.map((day, i) => {
                if (!day) return <span key={i}></span>;
                const d = new Date(y, m, day);
                const isStart = rangeStart && d.getTime() === atMidnight(rangeStart).getTime();
                const isEnd = end && !draftStart && d.getTime() === atMidnight(end).getTime();
                const inRange = start && end && !draftStart && d > atMidnight(start) && d < atMidnight(end);
                const isEdge = isStart || isEnd;
                return (
                  <button key={i} type="button" onClick={() => pick(day)} style={{
                    height: 32, border: 'none', cursor: 'pointer', fontSize: 13, fontVariantNumeric: 'tabular-nums',
                    fontWeight: isEdge ? 700 : 500,
                    background: isEdge ? 'var(--revvo-blue-500)' : inRange ? 'var(--surface-sunken)' : 'transparent',
                    color: isEdge ? '#fff' : 'var(--text-body)',
                    borderRadius: isEdge ? 'var(--radius-sm)' : inRange ? 0 : 'var(--radius-sm)',
                  }}>{day}</button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
