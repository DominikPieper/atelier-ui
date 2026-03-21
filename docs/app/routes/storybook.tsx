import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/storybook')({
  component: StorybookPage,
});

const SITE_URL = 'https://atelier-ui.netlify.app';

const MCP_CONFIG = `{
  "mcpServers": {
    "storybook-react": {
      "transport": "http",
      "url": "${SITE_URL}/mcp/storybook-react"
    },
    "storybook-angular": {
      "transport": "http",
      "url": "${SITE_URL}/mcp/storybook-angular"
    }
  }
}`;

function StorybookPage() {
  return (
    <>
      <div className="docs-page-header">
        <h1 className="docs-page-title">Storybook</h1>
        <p className="docs-page-description">
          Interactive component explorers for both the React and Angular libraries. Browse
          stories, inspect props, and test accessibility in isolation.
        </p>
      </div>

      <div className="docs-storybook-grid">
        <a
          href="/storybook-react/"
          target="_blank"
          rel="noopener noreferrer"
          className="docs-storybook-card"
        >
          <img src="/storybook-logo.svg" alt="Storybook" className="docs-storybook-logo" />
          <div className="docs-storybook-card-name">React</div>
          <div className="docs-storybook-card-desc">
            Storybook for <code>@atelier-ui/react</code>
          </div>
          <div className="docs-storybook-card-arrow">Open →</div>
        </a>

        <a
          href="/storybook-angular/"
          target="_blank"
          rel="noopener noreferrer"
          className="docs-storybook-card"
        >
          <img src="/storybook-logo.svg" alt="Storybook" className="docs-storybook-logo" />
          <div className="docs-storybook-card-name">Angular</div>
          <div className="docs-storybook-card-desc">
            Storybook for <code>@atelier-ui/angular</code>
          </div>
          <div className="docs-storybook-card-arrow">Open →</div>
        </a>
      </div>

      <div className="docs-section" style={{ marginTop: '3rem' }}>
        <h2 className="docs-section-title">MCP Server</h2>
        <p style={{ marginBottom: '1.25rem', color: 'var(--ui-color-text-muted)' }}>
          Both Storybook instances expose an{' '}
          <a
            href="https://modelcontextprotocol.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            MCP
          </a>{' '}
          endpoint so AI coding assistants can read component documentation directly from the
          production deployment — no local Storybook server required.
        </p>

        <div className="docs-mcp-steps">
          <div className="docs-mcp-step">
            <div className="docs-mcp-step-number">1</div>
            <div className="docs-mcp-step-body">
              <div className="docs-mcp-step-title">Add the MCP server to your project</div>
              <p className="docs-mcp-step-desc">
                In your AI assistant's MCP configuration (e.g.{' '}
                <code>.claude/settings.json</code> for Claude Code) add one or both servers:
              </p>
              <div className="docs-demo-code" style={{ borderRadius: 'var(--ui-radius-md, 8px)', borderTop: 'none' }}>
                <pre>{MCP_CONFIG}</pre>
              </div>
            </div>
          </div>

          <div className="docs-mcp-step">
            <div className="docs-mcp-step-number">2</div>
            <div className="docs-mcp-step-body">
              <div className="docs-mcp-step-title">Use it in your prompts</div>
              <p className="docs-mcp-step-desc">
                Once connected, your AI assistant can look up component props, variants, and
                usage examples directly from Storybook. For example:
              </p>
              <div className="docs-demo-code" style={{ borderRadius: 'var(--ui-radius-md, 8px)', borderTop: 'none' }}>
                <pre>{"Build a settings page using @atelier-ui/react components.\nUse the storybook-react MCP to check available props."}</pre>
              </div>
            </div>
          </div>

          <div className="docs-mcp-step">
            <div className="docs-mcp-step-number">3</div>
            <div className="docs-mcp-step-body">
              <div className="docs-mcp-step-title">Endpoints</div>
              <p className="docs-mcp-step-desc">The MCP endpoints are available at:</p>
              <table className="docs-props-table" style={{ marginTop: '0.5rem' }}>
                <thead>
                  <tr>
                    <th>Library</th>
                    <th>URL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>@atelier-ui/react</code></td>
                    <td><code>{SITE_URL}/mcp/storybook-react</code></td>
                  </tr>
                  <tr>
                    <td><code>@atelier-ui/angular</code></td>
                    <td><code>{SITE_URL}/mcp/storybook-angular</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
