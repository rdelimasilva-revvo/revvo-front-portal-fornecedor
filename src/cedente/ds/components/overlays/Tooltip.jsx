import React from 'react';

const placements = {
  top: { bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
  bottom: { top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
  left: { right: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)' },
  right: { left: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)' },
};

export function Tooltip({ label, children, placement = 'top', style }) {
  const id = React.useId();
  const [visible, setVisible] = React.useState(false);
  const pos = placements[placement] || placements.top;
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', ...style }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {React.cloneElement(children, { 'aria-describedby': id })}
      <span
        id={id} role="tooltip"
        style={{
          position: 'absolute', ...pos, zIndex: 'var(--z-tooltip)',
          background: 'var(--tooltip-bg)', color: 'var(--tooltip-fg)', fontFamily: 'var(--font-sans)',
          fontSize: 12, fontWeight: 500, padding: '6px 10px', borderRadius: 'var(--radius-sm)',
          whiteSpace: 'nowrap', boxShadow: 'var(--shadow-md)', pointerEvents: 'none',
          opacity: visible ? 1 : 0, visibility: visible ? 'visible' : 'hidden',
          transition: 'opacity var(--duration-fast) var(--ease-out)',
        }}
      >{label}</span>
    </span>
  );
}
