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

        <a
          href="/storybook-vue/"
          target="_blank"
          rel="noopener noreferrer"
          className="docs-storybook-card"
        >
          <img src="/storybook-logo.svg" alt="Storybook" className="docs-storybook-logo" />
          <div className="docs-storybook-card-name">Vue</div>
          <div className="docs-storybook-card-desc">
            Storybook for <code>@atelier-ui/vue</code>
          </div>
          <div className="docs-storybook-card-arrow">Open →</div>
        </a>
      </div>

      <div className="docs-section" style={{ marginTop: '3rem' }}>
        <h2 className="docs-section-title">MCP Server</h2>
        <p style={{ marginBottom: '1.25rem', color: 'var(--ui-color-text-muted)' }}>
          All three Storybook instances expose a hosted{' '}
          <a
            href="https://modelcontextprotocol.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            MCP
          </a>{' '}
          endpoint so AI coding assistants can read component documentation directly — no local
          setup required, just point your AI assistant at the URL.
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
              <CodeBlock lang="json" code={MCP_CONFIG} />
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
              <CodeBlock lang="text" code={"Build a settings page using @atelier-ui/react components.\nUse the storybook-react MCP to check available props."} />
            </div>
          </div>

          <div className="docs-mcp-step">
            <div className="docs-mcp-step-number">3</div>
            <div className="docs-mcp-step-body">
              <div className="docs-mcp-step-title">Framework Parity</div>
              <p className="docs-mcp-step-desc">
                While all frameworks share the same documentation and prop lookup tools, some
                Storybook features like story previews and test runs are currently only
                available for React and Vue.
              </p>
              <table className="docs-props-table" style={{ marginTop: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>React</th>
                    <th>Vue</th>
                    <th>Angular</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Prop Documentation</td>
                    <td>✅ Full</td>
                    <td>✅ Full</td>
                    <td>✅ Full</td>
                  </tr>
                  <tr>
                    <td>Component Search</td>
                    <td>✅ Full</td>
                    <td>✅ Full</td>
                    <td>✅ Full</td>
                  </tr>
                  <tr>
                    <td>Story Previews</td>
                    <td>✅ Full</td>
                    <td>✅ Full</td>
                    <td>⏳ Limited</td>
                  </tr>
                  <tr>
                    <td>Vitest Integration</td>
                    <td>✅ Full</td>
                    <td>✅ Full</td>
                    <td>⏳ Planned</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="docs-mcp-step">
            <div className="docs-mcp-step-number">4</div>
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
                    <td><code>{SITE_URL}/storybook-react/mcp</code></td>
                  </tr>
                  <tr>
                    <td><code>@atelier-ui/angular</code></td>
                    <td><code>{SITE_URL}/storybook-angular/mcp</code></td>
                  </tr>
                  <tr>
                    <td><code>@atelier-ui/vue</code></td>
                    <td><code>{SITE_URL}/storybook-vue/mcp</code></td>
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
