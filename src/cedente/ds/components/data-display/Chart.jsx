import React from 'react';

const SERIES = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)'];
const fmt = (n) => new Intl.NumberFormat('pt-BR').format(n);

function niceMax(max) {
  if (max <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(max)));
  const step = pow / 2;
  return Math.ceil(max / step) * step;
}

function Legend({ names, style }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px', padding: '12px 0 0 40px', fontFamily: 'var(--font-sans)', ...style }}>
      {names.map((n, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--text-body)' }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: SERIES[i % SERIES.length], flex: 'none' }} />{n}
        </span>
      ))}
    </div>
  );
}

function LineChart({ data, w, h, area, showValues }) {
  const padL = 40, padB = 24, padT = 12, padR = 12;
  const iw = w - padL - padR, ih = h - padB - padT;
  const max = niceMax(Math.max(...data.map((d) => d.value), 0));
  const stepX = data.length > 1 ? iw / (data.length - 1) : 0;
  const x = (i) => padL + i * stepX;
  const y = (v) => padT + ih - (v / max) * ih;
  const pts = data.map((d, i) => `${x(i)},${y(d.value)}`).join(' ');
  const ticks = [0, 0.5, 1].map((t) => max * t);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ display: 'block', fontFamily: 'var(--font-sans)' }}>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={padL} x2={w - padR} y1={y(t)} y2={y(t)} stroke="var(--chart-grid)" strokeWidth="1" />
          <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--chart-axis)">{fmt(t)}</text>
        </g>
      ))}
      {area && <polygon points={`${padL},${y(0)} ${pts} ${x(data.length - 1)},${y(0)}`} fill="var(--chart-area)" />}
      <polyline points={pts} fill="none" stroke="var(--chart-1)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(d.value)} r="3.5" fill="var(--surface-card)" stroke="var(--chart-1)" strokeWidth="2" />
          {showValues && <text x={x(i)} y={y(d.value) - 10} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-body)">{fmt(d.value)}</text>}
          <text x={x(i)} y={h - 6} textAnchor="middle" fontSize="11" fill="var(--chart-axis)">{d.label}</text>
        </g>
      ))}
    </svg>
  );
}

function MultiLineChart({ series, w, h }) {
  const padL = 40, padB = 24, padT = 12, padR = 12;
  const iw = w - padL - padR, ih = h - padB - padT;
  const labels = series[0]?.data.map((d) => d.label) || [];
  const max = niceMax(Math.max(...series.flatMap((s) => s.data.map((d) => d.value)), 0));
  const stepX = labels.length > 1 ? iw / (labels.length - 1) : 0;
  const x = (i) => padL + i * stepX;
  const y = (v) => padT + ih - (v / max) * ih;
  const ticks = [0, 0.5, 1].map((t) => max * t);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ display: 'block', fontFamily: 'var(--font-sans)' }}>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={padL} x2={w - padR} y1={y(t)} y2={y(t)} stroke="var(--chart-grid)" strokeWidth="1" />
          <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--chart-axis)">{fmt(t)}</text>
        </g>
      ))}
      {labels.map((lb, i) => <text key={i} x={x(i)} y={h - 6} textAnchor="middle" fontSize="11" fill="var(--chart-axis)">{lb}</text>)}
      {series.map((s, si) => {
        const color = SERIES[si % SERIES.length];
        const pts = s.data.map((d, i) => `${x(i)},${y(d.value)}`).join(' ');
        return (
          <g key={si}>
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            {s.data.map((d, i) => <circle key={i} cx={x(i)} cy={y(d.value)} r="3.5" fill="var(--surface-card)" stroke={color} strokeWidth="2" />)}
          </g>
        );
      })}
    </svg>
  );
}

function BarChart({ data, w, h, showValues }) {
  const padL = 40, padB = 24, padT = 12, padR = 12;
  const iw = w - padL - padR, ih = h - padB - padT;
  const max = niceMax(Math.max(...data.map((d) => d.value), 0));
  const slot = iw / data.length;
  const bw = Math.min(46, slot * 0.6);
  const y = (v) => padT + ih - (v / max) * ih;
  const ticks = [0, 0.5, 1].map((t) => max * t);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ display: 'block', fontFamily: 'var(--font-sans)' }}>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={padL} x2={w - padR} y1={y(t)} y2={y(t)} stroke="var(--chart-grid)" strokeWidth="1" />
          <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--chart-axis)">{fmt(t)}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const cx = padL + slot * i + slot / 2;
        const bh = (d.value / max) * ih;
        return (
          <g key={i}>
            <rect x={cx - bw / 2} y={y(d.value)} width={bw} height={Math.max(0, bh)} rx="4" fill={SERIES[i % SERIES.length]} />
            {showValues && <text x={cx} y={y(d.value) - 7} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-body)">{fmt(d.value)}</text>}
            <text x={cx} y={h - 6} textAnchor="middle" fontSize="11" fill="var(--chart-axis)">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function MultiBarChart({ series, w, h, stacked }) {
  const padL = 40, padB = 24, padT = 12, padR = 12;
  const iw = w - padL - padR, ih = h - padB - padT;
  const labels = series[0]?.data.map((d) => d.label) || [];
  const n = series.length;
  const max = niceMax(stacked
    ? Math.max(...labels.map((_, i) => series.reduce((s, ser) => s + (ser.data[i]?.value || 0), 0)), 0)
    : Math.max(...series.flatMap((s) => s.data.map((d) => d.value)), 0));
  const slot = iw / labels.length;
  const y = (v) => padT + ih - (v / max) * ih;
  const ticks = [0, 0.5, 1].map((t) => max * t);
  const groupW = Math.min(slot * 0.72, n * 42);
  const barW = stacked ? Math.min(46, slot * 0.55) : groupW / n;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ display: 'block', fontFamily: 'var(--font-sans)' }}>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={padL} x2={w - padR} y1={y(t)} y2={y(t)} stroke="var(--chart-grid)" strokeWidth="1" />
          <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--chart-axis)">{fmt(t)}</text>
        </g>
      ))}
      {labels.map((lb, i) => {
        const center = padL + slot * i + slot / 2;
        let stackAcc = 0;
        return (
          <g key={i}>
            {series.map((s, si) => {
              const v = s.data[i]?.value || 0;
              const bh = (v / max) * ih;
              if (stacked) {
                const yTop = padT + ih - stackAcc - bh; stackAcc += bh;
                return <rect key={si} x={center - barW / 2} y={yTop} width={barW} height={Math.max(0, bh)} rx="3" fill={SERIES[si % SERIES.length]} />;
              }
              const bx = center - groupW / 2 + si * barW;
              return <rect key={si} x={bx + barW * 0.12} y={y(v)} width={barW * 0.76} height={Math.max(0, bh)} rx="3" fill={SERIES[si % SERIES.length]} />;
            })}
            <text x={center} y={h - 6} textAnchor="middle" fontSize="11" fill="var(--chart-axis)">{lb}</text>
          </g>
        );
      })}
    </svg>
  );
}

function DonutChart({ data, w, h }) {
  const size = Math.min(w, h);
  const cx = size / 2, cy = size / 2;
  const r = size / 2 - 6, rin = r * 0.62;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let acc = -Math.PI / 2;
  const arc = (frac) => {
    const a0 = acc, a1 = acc + frac * Math.PI * 2; acc = a1;
    const large = frac > 0.5 ? 1 : 0;
    const p = (ang, rad) => `${cx + rad * Math.cos(ang)},${cy + rad * Math.sin(ang)}`;
    return `M ${p(a0, r)} A ${r} ${r} 0 ${large} 1 ${p(a1, r)} L ${p(a1, rin)} A ${rin} ${rin} 0 ${large} 0 ${p(a0, rin)} Z`;
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontFamily: 'var(--font-sans)' }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ flex: 'none' }}>
        {data.map((d, i) => <path key={i} d={arc(d.value / total)} fill={SERIES[i % SERIES.length]} />)}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-body)' }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: SERIES[i % SERIES.length], flex: 'none' }} />
            <span style={{ flex: 1 }}>{d.label}</span>
            <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Chart({ type = 'line', data = [], series = null, stacked = false, legend = true, width = 480, height = 220, area = false, showValues = false, style }) {
  const multi = Array.isArray(series) && series.length > 0;
  let body;
  if (type === 'donut') {
    body = <DonutChart data={data} w={Math.min(width, height * 1.6)} h={height} />;
  } else if (type === 'bar') {
    body = multi ? <MultiBarChart series={series} w={width} h={height} stacked={stacked} /> : <BarChart data={data} w={width} h={height} showValues={showValues} />;
  } else {
    body = multi ? <MultiLineChart series={series} w={width} h={height} /> : <LineChart data={data} w={width} h={height} area={area} showValues={showValues} />;
  }
  return (
    <div role="img" style={{ width: '100%', ...style }}>
      {body}
      {multi && legend && type !== 'donut' && <Legend names={series.map((s) => s.name)} />}
    </div>
  );
}
