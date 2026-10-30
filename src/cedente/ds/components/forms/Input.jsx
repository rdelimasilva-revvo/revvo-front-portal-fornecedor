import React from 'react';

function groupFormat(digits, groups, seps) {
  let out = '', i = 0;
  for (let g = 0; g < groups.length; g++) {
    const chunk = digits.slice(i, i + groups[g]);
    if (!chunk) break;
    out += (g > 0 ? seps[g - 1] : '') + chunk;
    i += groups[g];
  }
  return out;
}

const maskFns = {
  currency: (digits) => {
    const n = (parseInt(digits || '0', 10) / 100).toFixed(2);
    const [int, dec] = n.split('.');
    return 'R$ ' + int.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + dec;
  },
  percent: (digits) => (parseInt(digits || '0', 10) / 100).toFixed(2).replace('.', ',') + '%',
  cnpj: (digits) => groupFormat(digits.slice(0, 14), [2, 3, 3, 4, 2], ['.', '.', '/', '-']),
  cpf: (digits) => groupFormat(digits.slice(0, 11), [3, 3, 3, 2], ['.', '.', '-']),
};

export function Input({
  label, hint, error, leftIcon, prefix, size = 'md', disabled = false,
  mask, value, onChange, id, style, ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || React.useId();
  const h = size === 'sm' ? 36 : size === 'lg' ? 50 : 44;
  const borderColor = error ? 'var(--danger-500)' : focus ? 'var(--border-focus)' : 'var(--border-default)';
  const fn = mask && maskFns[mask];

  const handleChange = (e) => {
    if (!fn) { onChange && onChange(e); return; }
    const digits = e.target.value.replace(/\D/g, '');
    onChange && onChange({ target: { value: fn(digits) }, currentTarget: { value: fn(digits) } });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--font-sans)', ...style }}>
      {label && <label htmlFor={inputId} style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>{label}</label>}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, height: h, padding: '0 14px',
        background: disabled ? 'var(--surface-sunken)' : 'var(--surface-card)',
        border: `1.5px solid ${borderColor}`, borderRadius: 'var(--radius-sm)',
        boxShadow: focus && !error ? 'var(--focus-ring)' : 'none',
        transition: 'border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)',
      }}>
        {leftIcon && <span style={{ display: 'inline-flex', color: 'var(--text-muted)', flex: 'none' }}>{leftIcon}</span>}
        {prefix && <span style={{ fontSize: 14, color: 'var(--text-muted)', flex: 'none' }}>{prefix}</span>}
        <input
          id={inputId}
          disabled={disabled}
          value={value}
          onChange={handleChange}
          inputMode={fn ? (mask === 'currency' || mask === 'percent' ? 'decimal' : 'numeric') : undefined}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
            fontSize: 14, fontFamily: 'var(--font-sans)', color: 'var(--text-strong)',
            fontVariantNumeric: fn ? 'tabular-nums' : 'normal',
          }}
          {...rest}
        />
      </div>
      {error ? (
        <span style={{ fontSize: 12, color: 'var(--text-danger)' }}>{error}</span>
      ) : hint ? (
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{hint}</span>
      ) : null}
    </div>
  );
}
