import React from 'react';

export function Radio({ checked, onChange, disabled = false, label, value, name, id }) {
  const rid = id || React.useId();
  const on = !!checked;
  return (
    <label htmlFor={rid} style={{
      display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-sans)',
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
    }}>
      <input id={rid} type="radio" name={name} value={value} checked={on} disabled={disabled}
        onChange={() => onChange && onChange(value)}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
      <span
        role="radio"
        aria-checked={on}
        onClick={() => !disabled && onChange && onChange(value)}
        style={{
          width: 20, height: 20, flex: 'none', borderRadius: '50%',
          border: on ? '1.5px solid var(--revvo-blue-500)' : '1.5px solid var(--control-border-off)',
          background: 'var(--control-bg-off)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          transition: 'border-color var(--duration-fast) var(--ease-out)',
        }}
      >
        {on && <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--revvo-blue-500)' }} />}
      </span>
      {label && <span style={{ fontSize: 14, color: 'var(--text-body)' }}>{label}</span>}
    </label>
  );
}

export function RadioGroup({ options = [], value, onChange, name, disabled = false, orientation = 'vertical', label, style }) {
  const gname = name || React.useId();
  const items = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  return (
    <div role="radiogroup" aria-label={label} style={{
      display: 'flex', flexDirection: orientation === 'horizontal' ? 'row' : 'column',
      gap: orientation === 'horizontal' ? 22 : 12, fontFamily: 'var(--font-sans)', ...style,
    }}>
      {items.map((it) => (
        <Radio key={it.value} name={gname} value={it.value} label={it.label}
          checked={value === it.value} disabled={disabled || it.disabled}
          onChange={onChange} />
      ))}
    </div>
  );
}
