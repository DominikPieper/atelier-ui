import { createFileRoute } from '@tanstack/react-router';
import { CodeBlock } from '../shared/code-block';

export const Route = createFileRoute('/storybook')({
  component: StorybookPage,
});

const SITE_URL = 'https://atelier-ui.netlify.app';

const MCP_CONFIG = `{
  "mcpServers": {
    "storybook-react": {
      "type": "http",
      "url": "${SITE_URL}/storybook-react/mcp"
    },
    "storybook-angular": {
      "type": "http",
      "url": "${SITE_URL}/storybook-angular/mcp"
    },
    "storybook-vue": {
      "type": "http",
      "url": "${SITE_URL}/storybook-vue/mcp"
    }
  }
}`;

const FW_COLORS: Record<string, string> = {
  React: '#61dafb',
  Angular: '#e23237',
  Vue: '#42b883',
};

const STORYBOOK_LINKS = [
  { name: 'React', pkg: '@atelier-ui/react', href: `${SITE_URL}/storybook-react/` },
  { name: 'Angular', pkg: '@atelier-ui/angular', href: `${SITE_URL}/storybook-angular/` },
  { name: 'Vue', pkg: '@atelier-ui/vue', href: `${SITE_URL}/storybook-vue/` },
];

function StepRow({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
      <span style={{
        fontFamily: 'monospace',
        fontSize: '0.62rem',
        fontWeight: 700,
        color: 'var(--ui-color-primary)',
        background: 'rgba(68,218,218,0.1)',
        padding: '0.1rem 0.4rem',
        borderRadius: '3px',
        letterSpacing: '0.04em',
        flexShrink: 0,
        marginTop: '3px',
      }}>{n}</span>
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: '0 0 0.4rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--ui-color-text)' }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

function StorybookPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem 2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '800',
          letterSpacing: '-0.04em',
          lineHeight: 1.1,
          margin: '0 0 0.6rem',
          background: 'linear-gradient(135deg, var(--ui-color-primary) 0%, var(--docs-secondary, #89ceff) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Storybook
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--ui-color-text-muted)', margin: 0, maxWidth: '520px', lineHeight: '1.65' }}>
          Interactive component explorers for Angular, React, and Vue. Browse stories, inspect props, and test accessibility in isolation.
        </p>
      </div>

      {/* Framework cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem', marginBottom: '3rem' }}>
        {STORYBOOK_LINKS.map(({ name, pkg, href }) => {
          const color = FW_COLORS[name];
          return (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                padding: '1.1rem 1.1rem 0.9rem',
                background: 'var(--ui-color-surface-raised)',
                borderRadius: 'var(--ui-radius-md)',
                textDecoration: 'none',
                borderLeft: `3px solid ${color}`,
                transition: 'background 0.12s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <img src="/storybook-logo.svg" alt="Storybook" style={{ height: '18px', width: 'auto', opacity: 0.8 }} />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color }}>
                  {name}
                </span>
              </div>
              <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--ui-color-text-muted)' }}>
                {pkg}
              </span>
              <span style={{ fontSize: '0.75rem', color, fontWeight: 600, letterSpacing: '0.01em', marginTop: '0.1rem' }}>
                Open →
              </span>
            </a>
          );
        })}
      </div>

      {/* MCP section */}
      <div>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 0.5rem', color: 'var(--ui-color-text)' }}>
          MCP Server
        </h2>
        <p style={{ margin: '0 0 1.75rem', fontSize: '0.85rem', color: 'var(--ui-color-text-muted)', lineHeight: '1.65' }}>
          All three Storybook instances expose a hosted MCP endpoint so AI coding assistants can read component documentation directly — no local setup required.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <StepRow n="01" title="Add the MCP server to your project">
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: 'var(--ui-color-text-muted)', lineHeight: '1.6' }}>
              In your AI assistant's MCP configuration (e.g. <code style={{ fontFamily: 'monospace' }}>.claude/settings.json</code> for Claude Code) add one or more servers:
            </p>
            <CodeBlock lang="json" code={MCP_CONFIG} />
          </StepRow>

          <StepRow n="02" title="Use it in your prompts">
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: 'var(--ui-color-text-muted)', lineHeight: '1.6' }}>
              Once connected, your AI assistant can look up component props, variants, and usage examples directly from Storybook:
            </p>
            <CodeBlock lang="text" code={"Build a settings page using @atelier-ui/react components.\nUse the storybook-react MCP to check available props."} />
          </StepRow>

          <StepRow n="03" title="Framework Parity">
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: 'var(--ui-color-text-muted)', lineHeight: '1.6' }}>
              All frameworks support prop documentation and component search. Story previews and Vitest integration are currently React and Vue only.
            </p>
            <table className="docs-props-table">
              <thead>
                <tr><th>Feature</th><th>React</th><th>Vue</th><th>Angular</th></tr>
              </thead>
              <tbody>
                <tr><td>Prop Documentation</td><td>✅ Full</td><td>✅ Full</td><td>✅ Full</td></tr>
                <tr><td>Component Search</td><td>✅ Full</td><td>✅ Full</td><td>✅ Full</td></tr>
                <tr><td>Story Previews</td><td>✅ Full</td><td>✅ Full</td><td>⏳ Limited</td></tr>
                <tr><td>Vitest Integration</td><td>✅ Full</td><td>✅ Full</td><td>⏳ Planned</td></tr>
              </tbody>
            </table>
          </StepRow>

          <StepRow n="04" title="Endpoints">
            <table className="docs-props-table" style={{ marginTop: '0.25rem' }}>
              <thead>
                <tr><th>Library</th><th>URL</th></tr>
              </thead>
              <tbody>
                <tr><td><code>@atelier-ui/react</code></td><td><code>{SITE_URL}/storybook-react/mcp</code></td></tr>
                <tr><td><code>@atelier-ui/angular</code></td><td><code>{SITE_URL}/storybook-angular/mcp</code></td></tr>
                <tr><td><code>@atelier-ui/vue</code></td><td><code>{SITE_URL}/storybook-vue/mcp</code></td></tr>
              </tbody>
            </table>
          </StepRow>
        </div>
      </div>
    </div>
  );
}
