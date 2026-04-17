import { useState, useRef } from 'react';
import { tokenizeJson } from './-mcp.utils';

const COLLAPSE_LINES = 20;

export function CodeBlock({
  code,
  collapsible,
  label,
  labelColor,
}: {
  code: string;
  collapsible?: boolean;
  label?: string;
  labelColor?: string;
}) {
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
    <div style={{ borderRadius: 'var(--ui-radius-md)', overflow: 'hidden' }}>
      {/* Header bar with label + copy */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.4rem 0.75rem',
        background: 'var(--ui-color-surface)',
        borderBottom: '1px solid rgba(64,72,93,0.2)',
      }}>
        <span style={{
          fontSize: '0.68rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontFamily: 'monospace',
          color: labelColor ?? 'var(--ui-color-primary)',
        }}>
          {label ?? 'json'}
        </span>
        <button
          onClick={handleCopy}
          title="Copy to clipboard"
          style={{
            padding: '0.15rem 0.5rem',
            borderRadius: 'var(--ui-radius-sm)',
            border: 'none',
            background: 'transparent',
            color: copied ? 'var(--ui-color-primary)' : 'var(--ui-color-text-muted)',
            cursor: 'pointer',
            fontSize: '0.68rem',
            fontFamily: 'monospace',
            transition: 'color 0.15s',
          }}
        >
          {copied ? '✓ copied' : 'copy'}
        </button>
      </div>

      {/* Code body */}
      <div className="docs-demo-code" style={{ borderRadius: 0 }}>
        <pre>{visibleTokens.map((t, i) => <span key={i} style={{ color: t.color }}>{t.text}</span>)}</pre>
      </div>

      {shouldCollapse && (
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            display: 'block',
            width: '100%',
            padding: '0.35rem',
            border: 'none',
            borderTop: '1px solid rgba(64,72,93,0.2)',
            background: 'var(--ui-color-surface)',
            color: 'var(--ui-color-text-muted)',
            cursor: 'pointer',
            fontSize: '0.72rem',
            textAlign: 'center',
            transition: 'color 0.15s',
            fontFamily: 'monospace',
          }}
        >
          {collapsed ? `▼  ${hiddenLines} more lines` : '▲  collapse'}
        </button>
      )}
    </div>
  );
}
