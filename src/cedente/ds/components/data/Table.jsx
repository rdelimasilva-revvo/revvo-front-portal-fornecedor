import React from 'react';

export function Table({ columns = [], rows = [], rowKey, onRowClick, dense = false, zebra = false, empty = 'Nenhum registro encontrado.', style }) {
  const getKey = (row, i) => (rowKey ? (typeof rowKey === 'function' ? rowKey(row) : row[rowKey]) : i);
  const cellPad = dense ? '10px 14px' : '14px 16px';
  const baseBg = (i) => (zebra && i % 2 === 1 ? 'var(--table-zebra-bg)' : 'var(--surface-card)');
  return (
    <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', fontFamily: 'var(--font-sans)', ...style }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--table-header-bg)' }}>
            {columns.map((c) => (
              <th key={c.key} scope="col" style={{
                textAlign: c.align || 'left', padding: cellPad, fontSize: 12, fontWeight: 700,
                letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--table-header-fg)',
                borderBottom: '1px solid var(--table-header-border)', width: c.width, whiteSpace: 'nowrap',
              }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>{empty}</td></tr>
          )}
          {rows.map((row, i) => (
            <tr key={getKey(row, i)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onMouseEnter={onRowClick ? (e) => { e.currentTarget.style.background = 'var(--table-row-hover)'; } : undefined}
              onMouseLeave={onRowClick ? (e) => { e.currentTarget.style.background = baseBg(i); } : undefined}
              style={{ background: baseBg(i), cursor: onRowClick ? 'pointer' : 'default', transition: 'background var(--duration-fast) var(--ease-out)' }}
            >
              {columns.map((c) => (
                <td key={c.key} style={{
                  padding: cellPad, fontSize: 14, color: 'var(--text-body)', textAlign: c.align || 'left',
                  borderTop: i === 0 ? 'none' : '1px solid var(--table-row-border)',
                  fontVariantNumeric: c.numeric ? 'tabular-nums' : 'normal', fontWeight: c.numeric ? 600 : 400,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{c.render ? c.render(row) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
