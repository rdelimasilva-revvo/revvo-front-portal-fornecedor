import React from 'react';

const sizes = {
  sm: { height: 34, padding: '0 14px', fontSize: 13, radius: 'var(--radius-sm)', gap: 6 },
  md: { height: 42, padding: '0 18px', fontSize: 14, radius: 'var(--radius-sm)', gap: 8 },
  lg: { height: 50, padding: '0 24px', fontSize: 16, radius: 'var(--radius-md)', gap: 8 },
};

const variants = {
  primary: {
    background: 'var(--revvo-blue-500)', color: '#fff', border: '1.5px solid transparent',
    hover: 'var(--revvo-blue-600)', active: 'var(--revvo-blue-700)', shadow: 'var(--shadow-sm)',
  },
  accent: {
    background: 'var(--revvo-green-400)', color: 'var(--dark-100)', border: '1.5px solid transparent',
    hover: 'var(--revvo-green-500)', active: 'var(--revvo-green-600)', shadow: 'var(--shadow-accent)',
  },
  secondary: {
    background: 'var(--btn-neutral-bg)', color: 'var(--btn-neutral-fg)', border: '1.5px solid var(--btn-neutral-border)',
    hover: 'var(--btn-neutral-hover)', active: 'var(--btn-neutral-active)', shadow: 'none',
  },
  ghost: {
    background: 'transparent', color: 'var(--btn-neutral-fg)', border: '1.5px solid transparent',
    hover: 'var(--btn-ghost-hover)', active: 'var(--btn-ghost-active)', shadow: 'none',
  },
  danger: {
    background: 'var(--danger-500)', color: '#fff', border: '1.5px solid transparent',
    hover: '#cf4843', active: '#bb413c', shadow: 'var(--shadow-sm)',
  },
};

export function Button({
  children, variant = 'primary', size = 'md', disabled = false,
  fullWidth = false, leftIcon, rightIcon, type = 'button', onClick, style, ...rest
}) {
  const s = sizes[size] || sizes.md;
  const v = variants[variant] || variants.primary;
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);

  const bg = disabled ? 'var(--btn-disabled-bg)' : active ? v.active : hover ? v.hover : v.background;
  const color = disabled ? 'var(--btn-disabled-fg)' : v.color;

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: s.gap,
        height: s.height, padding: s.padding, fontSize: s.fontSize, fontWeight: 600,
        fontFamily: 'var(--font-sans)', lineHeight: 1, letterSpacing: '-0.005em',
        background: bg, color, border: disabled ? '1.5px solid transparent' : v.border,
        borderRadius: s.radius, cursor: disabled ? 'not-allowed' : 'pointer',
        width: fullWidth ? '100%' : 'auto', boxShadow: disabled ? 'none' : (active ? 'none' : v.shadow),
        transform: active && !disabled ? 'translateY(1px)' : 'none',
        transition: 'background var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)',
        outline: 'none', whiteSpace: 'nowrap', ...style,
      }}
      {...rest}
    >
      {leftIcon && <span style={{ display: 'inline-flex', flex: 'none' }}>{leftIcon}</span>}
      {children}
      {rightIcon && <span style={{ display: 'inline-flex', flex: 'none' }}>{rightIcon}</span>}
    </button>
  );
}
