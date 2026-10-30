import React from 'react';

/* Revvo adopts Lucide as its official icon set. This wrapper tokenizes the
   sizes (16/18/20/24), defaults to currentColor so icons inherit text color,
   and standardizes accessibility (decorative by default; pass `label` for a
   meaningful icon). Any Lucide icon name works; see Icon.prompt.md for the
   recommended Revvo set. Requires the lucide UMD script on the host page. */

const SIZES = { sm: 16, md: 18, lg: 20, xl: 24 };

export function Icon({ name, size = 'md', color = 'currentColor', strokeWidth = 2, label, style, ...rest }) {
  const px = typeof size === 'number' ? size : (SIZES[size] || 20);
  React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); }, [name, px, strokeWidth]);
  return (
    <i
      key={`${name}-${px}`}
      data-lucide={name}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      style={{
        display: 'inline-flex', width: px, height: px, color,
        strokeWidth, flex: 'none', verticalAlign: 'middle', ...style,
      }}
      {...rest}
    ></i>
  );
}
