import React from 'react';

export function Popover({ trigger, children, placement = 'bottom', align = 'start', open: openProp, onOpenChange, width, style }) {
  const [internal, setInternal] = React.useState(false);
  const open = openProp !== undefined ? openProp : internal;
  const setOpen = (v) => { if (openProp === undefined) setInternal(v); onOpenChange && onOpenChange(v); };
  const wrapRef = React.useRef(null);
  const panelRef = React.useRef(null);
  const [side, setSide] = React.useState(placement);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  React.useLayoutEffect(() => {
    if (!open || !wrapRef.current || !panelRef.current) return;
    const t = wrapRef.current.getBoundingClientRect();
    const p = panelRef.current.getBoundingClientRect();
    const gap = 8, vh = window.innerHeight, vw = window.innerWidth;
    let s = placement;
    if (s === 'bottom' && t.bottom + gap + p.height > vh && t.top - gap - p.height > 0) s = 'top';
    else if (s === 'top' && t.top - gap - p.height < 0 && t.bottom + gap + p.height < vh) s = 'bottom';
    else if (s === 'right' && t.right + gap + p.width > vw && t.left - gap - p.width > 0) s = 'left';
    else if (s === 'left' && t.left - gap - p.width < 0 && t.right + gap + p.width < vw) s = 'right';
    setSide(s);
  }, [open, placement]);

  const vertical = side === 'top' || side === 'bottom';
  const posStyle = {
    bottom: { top: 'calc(100% + 8px)' },
    top: { bottom: 'calc(100% + 8px)' },
    left: { right: 'calc(100% + 8px)', top: 0 },
    right: { left: 'calc(100% + 8px)', top: 0 },
  }[side];
  const alignStyle = vertical
    ? (align === 'end' ? { right: 0 } : align === 'center' ? { left: '50%', transform: 'translateX(-50%)' } : { left: 0 })
    : (align === 'end' ? { bottom: 0, top: 'auto' } : align === 'center' ? { top: '50%', transform: 'translateY(-50%)' } : {});

  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'inline-flex', fontFamily: 'var(--font-sans)', ...style }}>
      <span onClick={() => setOpen(!open)}>{trigger}</span>
      {open && (
        <div ref={panelRef} role="dialog" style={{
          position: 'absolute', zIndex: 'var(--z-dropdown)', ...posStyle, ...alignStyle,
          width: width || 'max-content', maxWidth: 340,
          background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', padding: 16,
          fontSize: 14, color: 'var(--text-body)', lineHeight: 1.55,
        }}>
          {children}
        </div>
      )}
    </div>
  );
}
