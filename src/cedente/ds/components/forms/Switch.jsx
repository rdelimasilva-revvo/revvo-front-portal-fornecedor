import React from 'react';

export function Switch({ checked, onChange, disabled = false, label, id }) {
  const switchId = id || React.useId();
  const on = !!checked;
  return (
    <label htmlFor={switchId} style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      fontFamily: 'var(--font-sans)', cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
    }}>
      <input id={switchId} type="checkbox" checked={on} disabled={disabled}
        onChange={(e) => onChange && onChange(e.target.checked)}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
      <span
        role="switch"
        aria-checked={on}
        onClick={() => !disabled && onChange && onChange(!on)}
        style={{
          position: 'relative', width: 40, height: 24, flex: 'none', borderRadius: 999,
          background: on ? 'var(--revvo-green-400)' : 'var(--control-track-off)',
          transition: 'background var(--duration-base) var(--ease-out)',
        }}
      >
        <span style={{
          position: 'absolute', top: 2, left: on ? 18 : 2, width: 20, height: 20,
          borderRadius: '50%', background: '#fff', boxShadow: 'var(--shadow-sm)',
          transition: 'left var(--duration-base) var(--ease-out)',
        }} />
      </span>
      {label && <span style={{ fontSize: 14, color: 'var(--text-body)' }}>{label}</span>}
    </label>
  );
}
