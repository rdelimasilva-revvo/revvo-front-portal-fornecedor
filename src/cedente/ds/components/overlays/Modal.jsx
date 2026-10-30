import React from 'react';

const sizes = { sm: 400, md: 520, lg: 720 };

export function Modal({ open, onClose, title, children, footer, size = 'md', closeOnScrim = true, style }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    document.addEventListener('keydown', onKey);
    ref.current && ref.current.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
  if (!open) return null;
  return (
    <div
      onClick={closeOnScrim ? onClose : undefined}
      style={{
        position: 'fixed', inset: 0, zIndex: 'var(--z-modal)', background: 'var(--scrim)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        backdropFilter: 'var(--backdrop-blur)',
      }}
    >
      <div
        ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: sizes[size] || sizes.md, maxHeight: '85vh',
          // Coluna flex com overflow contido: header e rodape ficam fixos e so o
          // corpo rola. Com 'overflow: auto' na raiz, conteudo alto empurrava o
          // rodape abaixo da dobra e o botao de acao ficava cortado/inclicavel.
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
          fontFamily: 'var(--font-sans)', outline: 'none', ...style,
        }}
      >
        {title && (
          <div style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--text-strong)', margin: 0 }}>{title}</h2>
            <button onClick={onClose} aria-label="Fechar" style={{
              border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18, padding: 4, lineHeight: 1,
            }}>✕</button>
          </div>
        )}
        <div style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', padding: 24, fontSize: 14, color: 'var(--text-body)', lineHeight: 1.6 }}>{children}</div>
        {footer && (
          <div style={{ flex: 'none', display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 24px', borderTop: '1px solid var(--border-subtle)' }}>{footer}</div>
        )}
      </div>
    </div>
  );
}
