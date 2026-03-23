import { tokenizeJson } from './mcp.utils';

export function CodeBlock({ code }: { code: string }) {
  const tokens = tokenizeJson(code);
  return (
    <div className="docs-demo-code">
      <pre>{tokens.map((t, i) => <span key={i} style={{ color: t.color }}>{t.text}</span>)}</pre>
    </div>
  );
}
