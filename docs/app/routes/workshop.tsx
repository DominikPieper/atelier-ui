import React, { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { CodeBlock } from '../shared/code-block';

export const Route = createFileRoute('/workshop')({
  component: WorkshopPage,
});

const SITE_URL = 'https://atelier.pieper.io';

const FRAMEWORKS = ['Angular', 'React', 'Vue'] as const;
type Framework = typeof FRAMEWORKS[number];

const SERVE_CMD: Record<Framework, string> = {
  Angular: 'npx nx serve workshop-angular',
  React: 'npx nx serve workshop-react',
  Vue: 'npx nx serve workshop-vue',
};

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

function WorkshopPage() {
  const [activeFramework, setActiveFramework] = useState<Framework>('Angular');

  return (
    <div className="docs-inline-page">
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
          Workshop Setup
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--ui-color-text-muted)', margin: 0, maxWidth: '520px', lineHeight: '1.65' }}>
          Spin up a fully-configured Atelier UI workspace in one command — framework selection,
          library install, and MCP server wired up automatically.
        </p>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', marginBottom: '2.5rem' }}>
        <StepRow n="01" title="Run the workspace generator">
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: 'var(--ui-color-text-muted)', lineHeight: '1.6' }}>
            Run the following command, then follow the prompts to choose your workspace name and frameworks:
          </p>
          <CodeBlock lang="shell" code="npx create-atelier-ui-workspace" />
          <CodeBlock lang="text" code={`? Workspace name: › my-workshop
? Which framework(s) do you want to use?
  ◉ Angular
  ◉ React
  ◉ Vue`} />
          <p style={{ margin: '0.75rem 0 0.75rem', fontSize: '0.82rem', color: 'var(--ui-color-text-muted)', lineHeight: '1.6' }}>
            Or pass the name directly to skip the first prompt:
          </p>
          <CodeBlock lang="shell" code="npx create-atelier-ui-workspace my-workshop" />
        </StepRow>

        <StepRow n="02" title="Install dependencies">
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: 'var(--ui-color-text-muted)', lineHeight: '1.6' }}>
            Navigate into your workspace and install npm dependencies:
          </p>
          <CodeBlock lang="shell" code={`cd my-workshop\nnpm install`} />
        </StepRow>

        <StepRow n="03" title="Serve your app">
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: 'var(--ui-color-text-muted)', lineHeight: '1.6' }}>
            Start the dev server for your chosen framework:
          </p>
          <div className="docs-multi-code-tabs" style={{ borderRadius: '8px 8px 0 0', marginBottom: 0 }}>
            {FRAMEWORKS.map(fw => (
              <button
                key={fw}
                className={`docs-multi-code-tab${activeFramework === fw ? ' active' : ''}`}
                onClick={() => setActiveFramework(fw)}
              >
                {fw}
              </button>
            ))}
          </div>
          <CodeBlock lang="shell" code={SERVE_CMD[activeFramework]} />
        </StepRow>

        <StepRow n="04" title="Open in Claude Code">
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: 'var(--ui-color-text-muted)', lineHeight: '1.6' }}>
            Open the workspace in VS Code or any editor with Claude Code. The MCP servers
            connect automatically — your AI assistant can look up component props, variants,
            and usage examples directly from Storybook without any extra setup.
          </p>
          <div style={{
            padding: '1rem 1.25rem',
            background: 'rgba(68,218,218,0.05)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(68,218,218,0.1)',
            borderRadius: 'var(--ui-radius-md)',
          }}>
            <p style={{ margin: '0 0 0.35rem', fontSize: '0.82rem', fontWeight: '700', color: 'var(--ui-color-text)' }}>MCP auto-configuration</p>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--ui-color-text-muted)', lineHeight: '1.6' }}>
              The generated <code style={{ fontFamily: 'monospace' }}>.claude/settings.json</code> wires up the Nx MCP and hosted
              Storybook MCP servers for all selected frameworks automatically.
            </p>
          </div>
        </StepRow>
      </div>

      {/* What gets created */}
      <div className="docs-section" style={{ marginTop: '2.5rem' }}>
        <h2 className="docs-section-title">What gets created</h2>
        <p style={{ color: 'var(--ui-color-text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
          Based on your framework selection the preset scaffolds one app per framework,
          installs the matching Atelier UI package, and pre-configures Claude Code's MCP servers.
        </p>
        <table className="docs-props-table" style={{ marginBottom: '1.5rem' }}>
          <thead>
            <tr>
              <th>Framework</th>
              <th>App</th>
              <th>Package</th>
              <th>MCP</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Angular</td>
              <td><code>workshop-angular</code></td>
              <td><code>@atelier-ui/angular</code></td>
              <td><code>storybook-angular</code></td>
            </tr>
            <tr>
              <td>React</td>
              <td><code>workshop-react</code></td>
              <td><code>@atelier-ui/react</code></td>
              <td><code>storybook-react</code></td>
            </tr>
            <tr>
              <td>Vue</td>
              <td><code>workshop-vue</code></td>
              <td><code>@atelier-ui/vue</code></td>
              <td><code>storybook-vue</code></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* MCP config */}
      <div className="docs-section">
        <h2 className="docs-section-title">MCP configuration</h2>
        <p style={{ color: 'var(--ui-color-text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
          The generated <code>.claude/settings.json</code> wires up the Nx MCP and hosted
          Storybook MCP servers for each selected framework:
        </p>
        <CodeBlock lang="json" code={`{
  "mcpServers": {
    "nx-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["nx", "mcp"]
    },
    "storybook-angular": {
      "type": "http",
      "url": "${SITE_URL}/storybook-angular/mcp"
    },
    "storybook-react": {
      "type": "http",
      "url": "${SITE_URL}/storybook-react/mcp"
    },
    "storybook-vue": {
      "type": "http",
      "url": "${SITE_URL}/storybook-vue/mcp"
    }
  }
}`} />
      </div>

      {/* Next steps */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', marginTop: '2.5rem' }}>
        {[
          { to: '/mcp', label: 'Next', title: 'MCP Explorer', icon: '⬡' },
          { to: '/components', label: 'Explore', title: 'Browse Components', icon: '🧩' },
          { to: '/install', label: 'Reference', title: 'Installation Guide', icon: '📦' },
        ].map(({ to, label, title, icon }) => (
          <Link
            key={to}
            to={to}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.9rem 1rem',
              background: 'var(--ui-color-surface-raised)',
              borderRadius: 'var(--ui-radius-md)',
              textDecoration: 'none',
            }}
          >
            <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{icon}</span>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ui-color-text-muted)', marginBottom: '0.15rem' }}>{label}</div>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--ui-color-text)' }}>{title}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
