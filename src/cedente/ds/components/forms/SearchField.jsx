import React from 'react';

export function SearchField({
  value, onChange, onSubmit, placeholder = 'Buscar', disabled = false,
  size = 'md', id, onClear, style,
}) {
  const [internal, setInternal] = React.useState('');
  const [focus, setFocus] = React.useState(false);
  const controlled = value !== undefined;
  const val = controlled ? value : internal;
  const sid = id || React.useId();
  React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); }, [val, focus]);
  const set = (v) => { if (!controlled) setInternal(v); onChange && onChange(v); };
  const clear = () => { set(''); onClear && onClear(); };
  const h = size === 'sm' ? 34 : 40;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8, width: '100%', height: h, boxSizing: 'border-box',
      padding: '0 12px', background: disabled ? 'var(--surface-sunken)' : 'var(--surface-card)',
      border: `1.5px solid ${focus ? 'var(--soft-blue-400)' : 'var(--border-default)'}`, borderRadius: 'var(--radius-sm)',
      boxShadow: focus ? 'var(--focus-ring)' : 'none', fontFamily: 'var(--font-sans)',
      transition: 'border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)', ...style,
    }}>
      <i data-lucide="search" style={{ width: 17, height: 17, color: 'var(--text-muted)', flex: 'none' }}></i>
      <input
        id={sid} type="search" value={val} placeholder={placeholder} disabled={disabled}
        onChange={(e) => set(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onKeyDown={(e) => { if (e.key === 'Enter' && onSubmit) onSubmit(val); }}
        style={{
          flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
          fontSize: size === 'sm' ? 13 : 14, fontFamily: 'inherit', color: 'var(--text-strong)',
        }}
      />
      {val && !disabled && (
        <button type="button" onClick={clear} aria-label="Limpar busca" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, flex: 'none',
          padding: 0, border: 'none', cursor: 'pointer', borderRadius: '50%', background: 'transparent', color: 'var(--text-muted)',
        }}>
          <i data-lucide="x" style={{ width: 15, height: 15 }}></i>
        </button>
      )}
    </div>
  );
}
