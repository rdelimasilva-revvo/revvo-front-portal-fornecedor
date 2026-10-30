import React from 'react';

export function Slider({ min = 0, max = 100, step = 1, value, defaultValue, onChange, range = false, label, format, showValue = true, disabled = false, style }) {
  const isRange = range || Array.isArray(value) || Array.isArray(defaultValue);
  const [internal, setInternal] = React.useState(defaultValue != null ? defaultValue : (isRange ? [min, max] : min));
  const val = value != null ? value : internal;
  const trackRef = React.useRef(null);
  const fmt = format || ((n) => n.toLocaleString('pt-BR'));

  const clamp = (n) => {
    const stepped = Math.round((n - min) / step) * step + min;
    return Math.min(max, Math.max(min, Math.round(stepped * 1e6) / 1e6));
  };
  const set = (v) => { if (value == null) setInternal(v); onChange && onChange(v); };
  const lo = isRange ? val[0] : min;
  const hi = isRange ? val[1] : val;
  const pct = (n) => ((n - min) / (max - min)) * 100;

  const posFrom = (clientX) => {
    const r = trackRef.current.getBoundingClientRect();
    return clamp(min + Math.min(1, Math.max(0, (clientX - r.left) / r.width)) * (max - min));
  };
  const commit = (which, nv) => {
    if (!isRange) return set(nv);
    if (which === 'lo') set([Math.min(nv, hi), hi]);
    else set([lo, Math.max(nv, lo)]);
  };
  const startDrag = (which) => (e) => {
    if (disabled) return;
    e.preventDefault();
    const move = (ev) => commit(which, posFrom(ev.clientX ?? (ev.touches && ev.touches[0].clientX)));
    const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
    move(e);
  };
  const onKey = (which) => (e) => {
    if (disabled) return;
    const cur = which === 'lo' ? lo : hi;
    let nv = cur;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') nv = clamp(cur + step);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') nv = clamp(cur - step);
    else if (e.key === 'Home') nv = min;
    else if (e.key === 'End') nv = max;
    else return;
    e.preventDefault();
    commit(which, nv);
  };

  const thumb = (which, n) => (
    <span role="slider" tabIndex={disabled ? -1 : 0}
      aria-valuemin={min} aria-valuemax={max} aria-valuenow={n} aria-label={label}
      onPointerDown={startDrag(which)} onKeyDown={onKey(which)}
      style={{
        position: 'absolute', top: '50%', left: `${pct(n)}%`, transform: 'translate(-50%,-50%)',
        width: 18, height: 18, borderRadius: '50%', background: 'var(--surface-card)',
        border: '2px solid var(--revvo-blue-500)', boxShadow: 'var(--shadow-sm)',
        cursor: disabled ? 'not-allowed' : 'grab', touchAction: 'none', outline: 'none',
      }} />
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'var(--font-sans)', opacity: disabled ? 0.5 : 1, ...style }}>
      {(label || showValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
          {label && <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>{label}</label>}
          {showValue && <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-body)', fontVariantNumeric: 'tabular-nums' }}>{isRange ? `${fmt(lo)} – ${fmt(hi)}` : fmt(hi)}</span>}
        </div>
      )}
      <div ref={trackRef} style={{ position: 'relative', height: 18 }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 6, transform: 'translateY(-50%)', background: 'var(--surface-sunken)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-pill)' }} />
        <div style={{ position: 'absolute', top: '50%', height: 6, transform: 'translateY(-50%)', left: `${isRange ? pct(lo) : 0}%`, right: `${100 - pct(hi)}%`, background: 'var(--revvo-blue-500)', borderRadius: 'var(--radius-pill)' }} />
        {isRange && thumb('lo', lo)}
        {thumb('hi', hi)}
      </div>
    </div>
  );
}
