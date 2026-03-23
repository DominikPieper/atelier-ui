import { useState, useRef } from 'react';
import { tokenizeJson } from './mcp.utils';

const COLLAPSE_LINES = 20;

export function CodeBlock({ code, collapsible }: { code: string; collapsible?: boolean }) {
  const tokens = tokenizeJson(code);
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lines = code.split('\n');
  const totalLines = lines.length;
  const shouldCollapse = collapsible && totalLines > COLLAPSE_LINES;
  const hiddenLines = totalLines - COLLAPSE_LINES;

  const visibleCode = shouldCollapse && collapsed
    ? lines.slice(0, COLLAPSE_LINES).join('\n')
    : code;
  const visibleTokens = shouldCollapse && collapsed ? tokenizeJson(visibleCode) : tokens;

  function handleCopy() {
    if (copyTimer.current) clearTimeout(copyTimer.current);
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{ position: 'relative' }}>
      <div className="docs-demo-code">
        <pre>{visibleTokens.map((t, i) => <span key={i} style={{ color: t.color }}>{t.text}</span>)}</pre>
      </div>
      <button
        onClick={handleCopy}
        title="Copy to clipboard"
        style={{
          position: 'absolute', top: '0.5rem', right: '0.5rem',
          padding: '0.2rem 0.55rem', borderRadius: 'var(--ui-radius-sm)',
          border: '1px solid var(--ui-color-border)',
          background: 'var(--ui-color-surface-raised)',
          color: copied ? '#059669' : 'var(--ui-color-text-muted)',
          cursor: 'pointer', fontSize: '0.72rem', fontFamily: 'monospace',
          transition: 'color 0.15s',
        }}
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
      {shouldCollapse && (
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            display: 'block', width: '100%', marginTop: '0.25rem',
            padding: '0.3rem', border: '1px solid var(--ui-color-border)',
            borderRadius: 'var(--ui-radius-sm)', background: 'transparent',
            color: 'var(--ui-color-text-muted)', cursor: 'pointer',
            fontSize: '0.75rem', textAlign: 'center', transition: 'color 0.15s',
          }}
        >
          {collapsed ? `▼ Show ${hiddenLines} more lines` : '▲ Collapse'}
        </button>
      )}
    </div>
  );
}
