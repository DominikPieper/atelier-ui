import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/workshop')({
  component: WorkshopPage,
});

const SITE_URL = 'https://atelier-ui.netlify.app';

function Code({ children }: { children: string }) {
  return (
    <div className="docs-demo-code" style={{ borderRadius: '8px', marginBottom: '1rem' }}>
      <pre style={{ margin: 0, fontFamily: "'Menlo','Monaco','Courier New',monospace", fontSize: '0.8rem', lineHeight: 1.6, overflowX: 'auto', color: '#cdd6f4' }}>
        {children}
      </pre>
    </div>
  );
}

const muted: React.CSSProperties = {
  lineHeight: '1.6',
  marginBottom: '1rem',
  color: 'var(--ui-color-text-muted)',
};

function WorkshopPage() {
  return (
    <div className="docs-page" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div className="docs-page-header">
        <h1 className="docs-page-title">Workshop Setup</h1>
        <p className="docs-page-description">
          Spin up a fully-configured Atelier UI workspace in one command — framework selection,
          library install, and MCP server wired up automatically.
        </p>
      </div>

      {/* Quick start */}
      <div className="docs-section">
        <h2 className="docs-section-title">Quick start</h2>
        <p style={muted}>Run the following command, then follow the prompts:</p>
        <Code>npx create-atelier-ui-workspace</Code>
        <p style={muted}>
          You will be asked for a workspace name and which frameworks you want to use.
          Select one or more from Angular, React, and Vue.
        </p>
        <Code>{`? Workspace name: › my-workshop
? Which framework(s) do you want to use?
  ◉ Angular
  ◉ React
  ◉ Vue`}</Code>
        <p style={muted}>
          You can also pass the workspace name directly to skip the first prompt:
        </p>
        <Code>npx create-atelier-ui-workspace my-workshop</Code>
      </div>

      {/* What gets created */}
      <div className="docs-section">
        <h2 className="docs-section-title">What gets created</h2>
        <p style={muted}>
          Based on your framework selection the preset scaffolds one application per framework,
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

        <p style={muted}>The generated workspace also includes:</p>
        <ul style={{ ...muted, paddingLeft: '1.5rem' }}>
          <li>
            <strong>.claude/settings.json</strong> — MCP servers for all selected frameworks
            pre-configured, so Claude Code connects automatically on first open.
          </li>
          <li>
            <strong>README.md</strong> — Quick-start instructions for the workspace.
          </li>
        </ul>
      </div>

      {/* After setup */}
      <div className="docs-section">
        <h2 className="docs-section-title">After setup</h2>
        <p style={muted}>Install dependencies and serve an app:</p>
        <Code>{`cd my-workshop
npm install
npx nx serve workshop-angular`}</Code>
        <p style={muted}>
          Open the workspace in VS Code or any editor that supports Claude Code. The MCP
          servers connect automatically — your AI assistant can look up component props,
          variants, and usage examples directly from Storybook without any extra setup.
        </p>
      </div>

      {/* MCP */}
      <div className="docs-section">
        <h2 className="docs-section-title">MCP configuration</h2>
        <p style={muted}>
          The generated <code>.claude/settings.json</code> wires up the Nx MCP and hosted
          Storybook MCP servers for each selected framework. For example, if you selected all three:
        </p>
        <Code>{`{
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
}`}</Code>
        <p style={muted}>
          You can also add these manually to any existing project. See the{' '}
          <a href="/storybook">Storybook page</a> for all three MCP endpoint URLs.
        </p>
      </div>

      {/* Advanced */}
      <div className="docs-section">
        <h2 className="docs-section-title">Advanced: use the preset directly</h2>
        <p style={muted}>
          If you prefer to integrate the preset into your own <code>create-nx-workspace</code>{' '}
          workflow, pass it via the <code>--preset</code> flag:
        </p>
        <Code>npx create-nx-workspace my-workshop --preset=@atelier-ui/create-workspace</Code>
        <p style={muted}>
          Additional options can be passed as flags:
        </p>
        <Code>npx create-nx-workspace my-workshop --preset=@atelier-ui/create-workspace --frameworks=angular,react,vue</Code>
      </div>
    </div>
  );
}
