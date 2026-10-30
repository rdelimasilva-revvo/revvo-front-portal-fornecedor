import React from 'react';

export function Card({ children, padding = 24, interactive = false, elevation = 'sm', style, onClick }) {
  const [hover, setHover] = React.useState(false);
  const shadows = { none: 'none', sm: 'var(--shadow-sm)', md: 'var(--shadow-md)' };
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', padding,
        boxShadow: interactive && hover ? 'var(--shadow-md)' : shadows[elevation],
        transform: interactive && hover ? 'translateY(-2px)' : 'none',
        cursor: interactive ? 'pointer' : 'default',
        transition: 'transform var(--duration-base) var(--ease-out), box-shadow var(--duration-base) var(--ease-out)',
        fontFamily: 'var(--font-sans)', ...style,
      }}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ title, subtitle, action, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16, ...style }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--text-strong)' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>}
      </div>
      {action && <div style={{ flex: 'none' }}>{action}</div>}
    </div>
  );
};

Card.Body = function CardBody({ children, style }) {
  return <div style={{ fontSize: 14, color: 'var(--text-body)', lineHeight: 1.6, ...style }}>{children}</div>;
};

Card.Footer = function CardFooter({ children, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-subtle)', ...style }}>
      {children}
    </div>
  );
};
