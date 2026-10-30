import React from 'react';

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function FileUpload({ label, hint, accept, multiple = false, files = [], onChange, onRemove, disabled = false, style }) {
  const [dragOver, setDragOver] = React.useState(false);
  const inputRef = React.useRef(null);
  React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); }, [files, dragOver]);

  const handleFiles = (fileList) => {
    const arr = Array.from(fileList || []);
    if (arr.length) onChange && onChange(multiple ? arr : arr.slice(0, 1));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'var(--font-sans)', ...style }}>
      {label && <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>{label}</div>}
      <div
        onClick={() => !disabled && inputRef.current && inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); if (!disabled) handleFiles(e.dataTransfer.files); }}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '28px 16px',
          border: `1.5px dashed ${dragOver ? 'var(--soft-blue-400)' : 'var(--border-strong)'}`,
          borderRadius: 'var(--radius-md)', background: dragOver ? 'var(--surface-hover)' : 'var(--surface-sunken)',
          cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1,
          transition: 'border-color var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out)',
        }}
      >
        <i data-lucide="upload-cloud" style={{ width: 26, height: 26, color: 'var(--text-muted)' }}></i>
        <div style={{ fontSize: 13, color: 'var(--text-body)', textAlign: 'center' }}>
          <span style={{ color: 'var(--text-link)', fontWeight: 600 }}>Clique para enviar</span> ou arraste o arquivo aqui
        </div>
        {hint && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{hint}</div>}
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} disabled={disabled}
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
          style={{ display: 'none' }} />
      </div>
      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {files.map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
              background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
            }}>
              <i data-lucide="file-text" style={{ width: 16, height: 16, color: 'var(--text-muted)', flex: 'none' }}></i>
              <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: 'var(--text-strong)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', flex: 'none' }}>{formatSize(f.size ?? 0)}</span>
              {onRemove && (
                <button type="button" aria-label={`Remover ${f.name}`} onClick={() => onRemove(i)}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', display: 'inline-flex', flex: 'none' }}>
                  <i data-lucide="x" style={{ width: 15, height: 15 }}></i>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
