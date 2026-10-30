import React from 'react';

export function Textarea({
  label, hint, error, rows = 4, disabled = false, value, onChange, id,
  maxLength, showCount = false, resize = 'vertical', style, ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const taId = id || React.useId();
  const borderColor = error ? 'var(--danger-500)' : focus ? 'var(--soft-blue-400)' : 'var(--border-default)';
  const len = (value || '').length;
  const counter = showCount || maxLength != null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--font-sans)', ...style }}>
      {label && <label htmlFor={taId} style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>{label}</label>}
      <div style={{
        background: disabled ? 'var(--surface-sunken)' : 'var(--surface-card)',
        border: `1.5px solid ${borderColor}`, borderRadius: 'var(--radius-sm)', padding: '10px 14px',
        boxShadow: focus && !error ? 'var(--focus-ring)' : 'none',
        transition: 'border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)',
      }}>
        <textarea
          id={taId} rows={rows} disabled={disabled} value={value} maxLength={maxLength}
          onChange={onChange}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            width: '100%', display: 'block', border: 'none', outline: 'none', background: 'transparent',
            resize, fontSize: 14, fontFamily: 'var(--font-sans)', color: 'var(--text-strong)', lineHeight: 1.55,
          }}
          {...rest}
        />
      </div>
      {(error || hint || counter) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontSize: 12, color: error ? 'var(--danger-700)' : 'var(--text-muted)' }}>{error || hint || ''}</span>
          {counter && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', flex: 'none' }}>
              {len}{maxLength != null ? `/${maxLength}` : ''}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
