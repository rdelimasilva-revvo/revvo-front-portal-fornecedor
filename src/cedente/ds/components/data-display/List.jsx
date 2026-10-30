import React from 'react';

export function List({ children, bordered = true, style }) {
  const kids = React.Children.toArray(children);
  return (
    <div role="list" style={{
      display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-sans)',
      background: bordered ? 'var(--surface-card)' : 'transparent',
      border: bordered ? '1px solid var(--border-subtle)' : 'none',
      borderRadius: bordered ? 'var(--radius-md)' : 0, overflow: 'hidden', ...style,
    }}>
      {kids.map((c, i) => React.isValidElement(c)
        ? React.cloneElement(c, { _last: i === kids.length - 1 })
        : c)}
    </div>
  );
}

export function ListItem({ leading, title, subtitle, meta, trailing, selected = false, density = 'cozy', onClick, _last = false, style }) {
  const [hover, setHover] = React.useState(false);
  const clickable = !!onClick;
  const pad = density === 'compact' ? '8px 14px' : '13px 16px';
  const bg = selected ? 'var(--sidenav-active-bg)' : (clickable && hover ? 'var(--surface-hover)' : 'transparent');
  return (
    <div role="listitem" onClick={onClick} tabIndex={clickable ? 0 : undefined}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: pad,
        borderBottom: _last ? 'none' : '1px solid var(--border-subtle)',
        background: bg, cursor: clickable ? 'pointer' : 'default',
        transition: 'background var(--duration-fast) var(--ease-out)', ...style,
      }}>
      {leading != null && <span style={{ display: 'inline-flex', flex: 'none', alignItems: 'center', color: 'var(--text-muted)' }}>{leading}</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: selected ? 'var(--revvo-blue-500)' : 'var(--text-strong)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
        {subtitle != null && <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subtitle}</div>}
      </div>
      {meta != null && <span style={{ fontSize: 12.5, color: 'var(--text-muted)', flex: 'none', fontVariantNumeric: 'tabular-nums' }}>{meta}</span>}
      {trailing != null && <span style={{ display: 'inline-flex', flex: 'none', alignItems: 'center' }}>{trailing}</span>}
    </div>
  );
}
