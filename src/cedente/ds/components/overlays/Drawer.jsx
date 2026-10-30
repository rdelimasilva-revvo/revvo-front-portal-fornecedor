import React from 'react';

export function Drawer({ open, onClose, side = 'right', title, children, footer, width = 440, closeOnScrim = true, style }) {
  const ref = React.useRef(null);
  const [render, setRender] = React.useState(open);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setRender(true);
      const r = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(r);
    }
    setShown(false);
    const t = setTimeout(() => setRender(false), 280);
    return () => clearTimeout(t);
  }, [open]);

  React.useEffect(() => {
    if (!render) return;
    const prev = document.activeElement;
    const onKey = (e) => {
      if (e.key === 'Escape') { onClose && onClose(); return; }
      if (e.key === 'Tab' && ref.current) {
        const f = ref.current.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    const rf = requestAnimationFrame(() => ref.current && ref.current.focus());
    return () => { document.removeEventListener('keydown', onKey); cancelAnimationFrame(rf); prev && prev.focus && prev.focus(); };
  }, [render]);

  if (!render) return null;
  const hidden = side === 'right' ? 'translateX(100%)' : 'translateX(-100%)';

  return (
    <div onClick={closeOnScrim ? onClose : undefined} style={{
      position: 'fixed', inset: 0, zIndex: 'var(--z-modal)', background: 'var(--scrim)',
      backdropFilter: 'var(--backdrop-blur)', opacity: shown ? 1 : 0,
      transition: 'opacity var(--duration-base) var(--ease-out)',
    }}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute', top: 0, bottom: 0, [side]: 0, width: '100%', maxWidth: width,
          background: 'var(--surface-card)', boxShadow: 'var(--shadow-lg)', outline: 'none',
          display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-sans)',
          transform: shown ? 'translateX(0)' : hidden,
          transition: 'transform var(--duration-base) var(--ease-out)', ...style,
        }}>
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '18px 22px', borderBottom: '1px solid var(--border-subtle)', flex: 'none' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: 'var(--text-strong)', margin: 0 }}>{title}</h2>
            <button onClick={onClose} aria-label="Fechar" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18, padding: 4, lineHeight: 1 }}>✕</button>
          </div>
        )}
        <div style={{ flex: 1, overflow: 'auto', padding: 22, fontSize: 14, color: 'var(--text-body)', lineHeight: 1.6 }}>{children}</div>
        {footer && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 22px', borderTop: '1px solid var(--border-subtle)', flex: 'none' }}>{footer}</div>
        )}
      </div>
    </div>
  );
}
