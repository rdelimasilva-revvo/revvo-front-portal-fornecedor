import React from 'react';

export function Stepper({ steps = [], activeStep = 0, variant = 'steps', style }) {
  React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); }, [activeStep, steps, variant]);

  if (variant === 'timeline') return <Timeline steps={steps} activeStep={activeStep} style={style} />;
  if (variant === 'vertical') return <Vertical steps={steps} activeStep={activeStep} style={style} />;

  const CIRCLE = 32;
  return (
    <ol style={{ display: 'flex', alignItems: 'flex-start', width: '100%', margin: 0, padding: 0, listStyle: 'none', fontFamily: 'var(--font-sans)', ...style }}>
      {steps.map((step, i) => {
        const done = i < activeStep;
        const active = i === activeStep;
        const last = i === steps.length - 1;
        const circleBg = done ? 'var(--revvo-green-400)' : active ? 'var(--revvo-blue-500)' : 'var(--surface-sunken)';
        const circleFg = done || active ? '#fff' : 'var(--text-muted)';
        const labelColor = active ? 'var(--text-strong)' : done ? 'var(--text-body)' : 'var(--text-muted)';
        return (
          <li key={i} style={{ flex: 1, minWidth: 0, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            {/* Connector runs from this circle's centre to the next circle's centre, BEHIND the circles */}
            {!last && (
              <div style={{
                position: 'absolute', top: CIRCLE / 2 - 1, left: '50%', width: '100%', height: 2,
                background: done ? 'var(--revvo-green-400)' : 'var(--border-default)', zIndex: 0,
              }}></div>
            )}
            <span aria-current={active ? 'step' : undefined} style={{
              position: 'relative', zIndex: 1,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: CIRCLE, height: CIRCLE,
              borderRadius: '50%', background: circleBg, color: circleFg, fontSize: 13, fontWeight: 700,
              border: !done && !active ? '1.5px solid var(--border-default)' : 'none', flex: 'none', boxSizing: 'border-box',
            }}>{done ? <i data-lucide="check" style={{ width: 16, height: 16 }}></i> : i + 1}</span>
            <div style={{ marginTop: 10, padding: '0 8px', maxWidth: 160 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: labelColor, lineHeight: 1.3 }}>{step.label}</div>
              {step.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.3 }}>{step.description}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* Vertical stepper: circles stacked top-to-bottom, connector runs down between
   them, label + description to the right of each node. For side panels, forms
   with a narrow column, or a wizard rail. */
function Vertical({ steps = [], activeStep = 0, style }) {
  const CIRCLE = 30;
  return (
    <ol style={{ display: 'flex', flexDirection: 'column', margin: 0, padding: 0, listStyle: 'none', fontFamily: 'var(--font-sans)', ...style }}>
      {steps.map((step, i) => {
        const done = i < activeStep;
        const active = i === activeStep;
        const last = i === steps.length - 1;
        const circleBg = done ? 'var(--revvo-green-400)' : active ? 'var(--revvo-blue-500)' : 'var(--surface-sunken)';
        const circleFg = done || active ? '#fff' : 'var(--text-muted)';
        const labelColor = active ? 'var(--text-strong)' : done ? 'var(--text-body)' : 'var(--text-muted)';
        return (
          <li key={i} style={{ display: 'flex', gap: 14, minHeight: last ? 'auto' : 56 }}>
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 'none' }}>
              <span aria-current={active ? 'step' : undefined} style={{
                position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: CIRCLE, height: CIRCLE, borderRadius: '50%', background: circleBg, color: circleFg, fontSize: 13, fontWeight: 700,
                border: !done && !active ? '1.5px solid var(--border-default)' : 'none', boxSizing: 'border-box',
              }}>{done ? <i data-lucide="check" style={{ width: 15, height: 15 }}></i> : i + 1}</span>
              {!last && (
                <span style={{ flex: 1, width: 2, marginTop: 4, marginBottom: 4, minHeight: 18,
                  background: done ? 'var(--revvo-green-400)' : 'var(--border-default)' }}></span>
              )}
            </div>
            <div style={{ paddingTop: 5, paddingBottom: last ? 0 : 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: labelColor, lineHeight: 1.3 }}>{step.label}</div>
              {step.description && <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.45 }}>{step.description}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* Horizontal timeline: left-aligned nodes on a continuous baseline, with an
   optional date/eyebrow above the dot and title + description below. Suited to
   event chronologies (lifecycle of a garantia, audit trail) rather than a
   forward-only wizard, which is what the default `steps` variant is for. */
function Timeline({ steps = [], activeStep = 0, style }) {
  const DOT = 16;
  const ROW = 26; /* space reserved above the line for the date/eyebrow */
  return (
    <ol style={{ display: 'flex', width: '100%', margin: 0, padding: 0, listStyle: 'none', fontFamily: 'var(--font-sans)', ...style }}>
      {steps.map((step, i) => {
        const done = i < activeStep;
        const active = i === activeStep;
        const last = i === steps.length - 1;
        const dotBg = done ? 'var(--revvo-green-400)' : active ? 'var(--revvo-blue-500)' : 'var(--surface-card)';
        const dotBorder = done ? 'var(--revvo-green-400)' : active ? 'var(--revvo-blue-500)' : 'var(--border-default)';
        const titleColor = active ? 'var(--text-strong)' : done ? 'var(--text-body)' : 'var(--text-muted)';
        return (
          <li key={i} style={{ flex: 1, minWidth: 0, position: 'relative', paddingRight: last ? 0 : 12 }}>
            {step.date && (
              <div style={{ height: ROW, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                color: active ? 'var(--revvo-blue-500)' : 'var(--text-muted)', lineHeight: `${ROW}px` }}>{step.date}</div>
            )}
            <div style={{ position: 'relative', height: DOT, marginTop: step.date ? 0 : ROW }}>
              {/* continuous baseline, behind the dot; segment coloured up to the active node */}
              {!last && (
                <div style={{ position: 'absolute', top: DOT / 2 - 1, left: DOT / 2, right: 0, height: 2,
                  background: done ? 'var(--revvo-green-400)' : 'var(--border-default)', zIndex: 0 }}></div>
              )}
              <span aria-current={active ? 'step' : undefined} style={{
                position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: DOT, height: DOT, borderRadius: '50%', background: dotBg, border: `2px solid ${dotBorder}`,
                boxShadow: active ? '0 0 0 4px var(--soft-blue-100)' : 'none', boxSizing: 'border-box',
              }}></span>
            </div>
            <div style={{ marginTop: 12, paddingRight: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: titleColor, lineHeight: 1.3 }}>{step.label}</div>
              {step.description && <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.45 }}>{step.description}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
