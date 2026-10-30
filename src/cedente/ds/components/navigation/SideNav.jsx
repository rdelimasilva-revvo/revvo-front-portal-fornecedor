import React from 'react';

/* Reusable sidebar navigation with one level of submenus — the product shell
   pattern (Visão geral · Garantias › … · Recebíveis › …). Tokenizes what the
   Fiori kit demonstrated by hand: active parent+child highlight together, a
   vertical guide rail on children, chevron expand/collapse, and pinned footer
   items. One nesting level by design (see Menu & Submenus guideline).

   Responsive: `collapsed` renders an icon-only rail (labels + submenus move to
   a hover/focus flyout); `offCanvas` + `open`/`onClose` render it as a mobile
   drawer over a scrim (Esc + scrim + selecting a route close it). */

function findParentOf(items, activeId) {
  for (const it of items) {
    if (it.children && it.children.some((c) => c.id === activeId)) return it.id;
  }
  return null;
}

export function SideNav({
  items = [], footerItems = [], activeId, onSelect, style,
  collapsed = false, offCanvas = false, open = false, onClose,
  // Cabecalho de grupo estatico acima dos itens, que ficam recuados sob ele —
  // padrao do shell dos portais Revvo. { label, icon }
  grupo = null,
}) {
  const allItems = [...items, ...footerItems];
  const [expanded, setExpanded] = React.useState(() => {
    const parent = findParentOf(allItems, activeId);
    return new Set(parent ? [parent] : []);
  });
  const [flyout, setFlyout] = React.useState(null); // rail-mode open flyout id
  const navRef = React.useRef(null);

  React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); }, [items, footerItems, expanded, activeId, collapsed, flyout, open]);

  // Esc closes the off-canvas drawer.
  React.useEffect(() => {
    if (!offCanvas || !open) return;
    const onKey = (e) => { if (e.key === 'Escape' && onClose) onClose(); };
    document.addEventListener('keydown', onKey);
    if (navRef.current) navRef.current.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [offCanvas, open, onClose]);

  // Outside-click / Esc close the rail flyout.
  React.useEffect(() => {
    if (!collapsed || flyout == null) return;
    const onDoc = (e) => { if (navRef.current && !navRef.current.contains(e.target)) setFlyout(null); };
    const onKey = (e) => { if (e.key === 'Escape') setFlyout(null); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [collapsed, flyout]);

  const toggle = (id) => setExpanded((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const select = (id) => {
    onSelect && onSelect(id);
    setFlyout(null);
    if (offCanvas && onClose) onClose();
  };

  const icon = (name, size = 16) => name
    ? (typeof name === 'string'
        ? <i data-lucide={name} style={{ width: size, height: size, flex: 'none' }}></i>
        : <span style={{ display: 'inline-flex', width: size, height: size, flex: 'none' }}>{name}</span>)
    : null;

  const leafStyle = (on) => ({
    // Metricas alinhadas ao portal do financiador para as sidebars ficarem
    // identicas em tamanho e tipografia: linha de 37px (21 de texto + 8+8 de
    // padding), icone 16, raio 8 e peso 400 tambem no item ativo.
    display: 'flex', alignItems: 'center', gap: 8, width: '100%', height: 37, padding: '8px 12px',
    border: 'none', borderRadius: 'var(--radius-sm)', background: on ? 'var(--sidenav-active-bg)' : 'transparent',
    color: on ? 'var(--sidenav-active-fg)' : 'var(--text-body)', fontFamily: 'inherit', fontSize: 14,
    fontWeight: 400, textAlign: 'left', cursor: 'pointer', position: 'relative', boxSizing: 'border-box',
    transition: 'background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)',
  });

  const childBtnStyle = (con) => ({
    display: 'flex', alignItems: 'center', gap: 8, width: '100%', minHeight: 34, padding: '6px 10px',
    border: 'none', borderRadius: 'var(--radius-sm)', background: con ? 'var(--sidenav-active-bg)' : 'transparent',
    color: con ? 'var(--sidenav-active-fg)' : 'var(--text-muted)', fontFamily: 'inherit', fontSize: 13.5,
    fontWeight: con ? 600 : 500, textAlign: 'left', cursor: 'pointer', boxSizing: 'border-box',
    transition: 'background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)',
  });

  const renderChild = (c) => {
    const con = activeId === c.id;
    return (
      <button key={c.id} onClick={() => select(c.id)} aria-current={con ? 'page' : undefined} style={childBtnStyle(con)}
        onMouseEnter={(e) => { if (!con) e.currentTarget.style.background = 'var(--surface-hover)'; }}
        onMouseLeave={(e) => { if (!con) e.currentTarget.style.background = 'transparent'; }}>
        <span style={{ flex: 1 }}>{c.label}</span>
        {c.badge != null && <span style={badgeStyle}>{c.badge}</span>}
      </button>
    );
  };

  /* ---- expanded (default + off-canvas) item ---- */
  const renderItem = (item) => {
    const hasKids = item.children && item.children.length > 0;
    const childActive = hasKids && item.children.some((c) => c.id === activeId);
    const on = activeId === item.id || childActive;
    const isOpen = expanded.has(item.id);
    if (!hasKids) {
      return (
        <button key={item.id} className="sidenav-item" onClick={() => select(item.id)}
          aria-current={activeId === item.id ? 'page' : undefined} style={leafStyle(activeId === item.id)}
          onMouseEnter={(e) => { if (activeId !== item.id) e.currentTarget.style.background = 'var(--surface-hover)'; }}
          onMouseLeave={(e) => { if (activeId !== item.id) e.currentTarget.style.background = 'transparent'; }}>
          {icon(item.icon)}
          <span style={{ flex: 1 }}>{item.label}</span>
          {item.badge != null && <span style={badgeStyle}>{item.badge}</span>}
          {activeId === item.id && item.badge == null && (
            <span aria-hidden="true" style={{
              width: 6, height: 6, flex: 'none', borderRadius: '50%', background: 'var(--sidenav-active-fg)',
            }}></span>
          )}
        </button>
      );
    }
    return (
      <div key={item.id}>
        <button onClick={() => toggle(item.id)} aria-expanded={isOpen} style={leafStyle(on)}
          onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = 'var(--surface-hover)'; }}
          onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = 'transparent'; }}>
          {icon(item.icon)}
          <span style={{ flex: 1 }}>{item.label}</span>
          <i data-lucide="chevron-down" style={{
            width: 15, height: 15, flex: 'none', color: 'var(--text-muted)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform var(--duration-fast) var(--ease-out)',
          }}></i>
        </button>
        <div style={{ display: 'grid', gridTemplateRows: isOpen ? '1fr' : '0fr', transition: 'grid-template-rows var(--duration-base) var(--ease-out)' }}>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ position: 'relative', margin: '2px 0 2px 25px', paddingLeft: 14 }}>
              <span style={{ position: 'absolute', left: 0, top: 4, bottom: 4, width: 2, background: 'var(--border-default)', borderRadius: 2 }}></span>
              {item.children.map(renderChild)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ---- collapsed rail item (icon + hover/focus flyout) ---- */
  const renderRailItem = (item) => {
    const hasKids = item.children && item.children.length > 0;
    const childActive = hasKids && item.children.some((c) => c.id === activeId);
    const on = activeId === item.id || childActive;
    const isFly = flyout === item.id;
    const openFly = () => setFlyout(item.id);
    return (
      <div key={item.id} style={{ position: 'relative' }}
        onMouseEnter={openFly} onMouseLeave={() => setFlyout((f) => (f === item.id ? null : f))}>
        <button
          onClick={() => (hasKids ? setFlyout((f) => (f === item.id ? null : item.id)) : select(item.id))}
          onFocus={openFly}
          aria-current={activeId === item.id ? 'page' : undefined}
          aria-haspopup={hasKids ? 'menu' : undefined} aria-expanded={hasKids ? isFly : undefined}
          aria-label={typeof item.label === 'string' ? item.label : undefined}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, padding: 0,
            border: 'none', borderRadius: 'var(--radius-md)', background: on ? 'var(--sidenav-active-bg)' : 'transparent',
            color: on ? 'var(--sidenav-active-fg)' : 'var(--text-body)', cursor: 'pointer', position: 'relative', boxSizing: 'border-box',
            transition: 'background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)',
          }}
          onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = 'var(--surface-hover)'; }}
          onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = 'transparent'; }}>
          {icon(item.icon, 20) || <span style={{ fontSize: 15, fontWeight: 700 }}>{String(item.label).slice(0, 1)}</span>}
          {item.badge != null && <span style={railDotStyle} />}
          {hasKids && <span style={railKidsDotStyle} />}
        </button>
        {isFly && (
          hasKids ? (
            <div role="menu" style={flyoutPanelStyle}>
              <div style={flyoutHeadStyle}>{item.label}</div>
              {item.children.map(renderChild)}
            </div>
          ) : (
            <div style={flyoutTipStyle}>{item.label}</div>
          )
        )}
      </div>
    );
  };

  const railNav = (extra) => (
    <nav ref={navRef} aria-label="Navegação principal" tabIndex={-1} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 64, height: '100%', boxSizing: 'border-box',
      padding: '12px 10px', background: 'var(--surface-card)', borderRight: '1px solid var(--border-subtle)',
      fontFamily: 'var(--font-sans)', ...style, ...extra,
    }}>
      {items.map(renderRailItem)}
      {footerItems.length > 0 && (
        <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border-subtle)', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          {footerItems.map(renderRailItem)}
        </div>
      )}
    </nav>
  );

  const fullNav = (extra) => (
    <nav ref={navRef} aria-label="Navegação principal" tabIndex={-1} style={{
      display: 'flex', flexDirection: 'column', gap: 0, width: 300, height: '100%', boxSizing: 'border-box',
      padding: 12, background: 'var(--surface-card)', borderRight: '1px solid var(--border-subtle)',
      fontFamily: 'var(--font-sans)', ...style, ...extra,
    }}>
      {grupo && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '36px 4px 24px 16px',
          fontSize: 14, fontWeight: 400, color: 'var(--text-body)',
        }}>
          {icon(grupo.icon)}
          <span>{grupo.label}</span>
        </div>
      )}
      {grupo ? <div style={{ paddingLeft: 28 }}>{items.map(renderItem)}</div> : items.map(renderItem)}
      {footerItems.length > 0 && (
        <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {footerItems.map(renderItem)}
        </div>
      )}
    </nav>
  );

  /* ---- off-canvas drawer ---- */
  if (offCanvas) {
    return (
      <div aria-hidden={!open} style={{
        position: 'absolute', inset: 0, zIndex: 'var(--z-modal)', pointerEvents: open ? 'auto' : 'none',
      }}>
        <div onClick={onClose} style={{
          position: 'absolute', inset: 0, background: 'var(--scrim)', opacity: open ? 1 : 0,
          transition: 'opacity var(--duration-base) var(--ease-out)',
        }} />
        <div role="dialog" aria-modal="true" aria-label="Navegação principal" style={{
          position: 'absolute', top: 0, left: 0, height: '100%', boxShadow: 'var(--shadow-lg)',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform var(--duration-base) var(--ease-out)',
        }}>
          {fullNav({ borderRight: '1px solid var(--border-subtle)' })}
        </div>
      </div>
    );
  }

  return collapsed ? railNav() : fullNav();
}

const badgeStyle = {
  flex: 'none', minWidth: 20, height: 20, padding: '0 6px', borderRadius: 'var(--radius-pill)',
  background: 'var(--badge-neutral-bg)', color: 'var(--badge-neutral-fg)', fontSize: 11, fontWeight: 700,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontVariantNumeric: 'tabular-nums',
};

const railDotStyle = {
  position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: '50%',
  background: 'var(--revvo-green-400)', border: '1.5px solid var(--surface-card)',
};
const railKidsDotStyle = {
  position: 'absolute', right: 5, bottom: 6, width: 3, height: 3, borderRadius: '50%', background: 'currentColor', opacity: 0.5,
};

const flyoutBase = {
  position: 'absolute', left: '100%', marginLeft: 10, zIndex: 'var(--z-dropdown)',
  fontFamily: 'var(--font-sans)',
};
const flyoutTipStyle = {
  ...flyoutBase, top: '50%', transform: 'translateY(-50%)', whiteSpace: 'nowrap',
  background: 'var(--tooltip-bg, var(--dark-100))', color: 'var(--tooltip-fg, #fff)',
  padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 500, boxShadow: 'var(--shadow-md)',
};
const flyoutPanelStyle = {
  ...flyoutBase, top: 0, minWidth: 200, padding: 6,
  background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-lg)',
};
const flyoutHeadStyle = {
  padding: '4px 10px 6px', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
  color: 'var(--text-muted)',
};
