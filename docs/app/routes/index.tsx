import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomePage,
});

const FRAMEWORK_CARDS = [
  {
    to: '/components' as const,
    label: 'Framework_01',
    color: '#dd0031',
    title: 'Angular Atelier',
    desc: 'Standalone components with signals support, built for Angular 17+ and the modern reactive paradigm.',
  },
  {
    to: '/components' as const,
    label: 'Framework_02',
    color: '#61dafb',
    title: 'React Atelier',
    desc: 'High-performance hooks and atomic components optimized for Next.js and Vite environments.',
  },
  {
    to: '/components' as const,
    label: 'Framework_03',
    color: '#42b883',
    title: 'Vue Canvas',
    desc: 'Composition API ready components with seamless state management for enterprise dashboards.',
  },
];

const WORKSHOP_STEPS = [
  'Configure architectural shell',
  'Inject shared design tokens',
  'Auto-generate component registry',
];

const ECOSYSTEM_LINKS = [
  { to: '/install' as const, icon: '📦', label: 'Installation', desc: 'npm install in 30 seconds' },
  { to: '/design-principles' as const, icon: '🧠', label: 'LLM-Optimized APIs', desc: 'How components are designed for AI' },
  { to: '/patterns' as const, icon: '🍳', label: 'Cookbook Patterns', desc: 'Copy-paste recipes for common tasks' },
];

function HomePage() {
  return (
    <>
      {/* Hero */}
      <div className="docs-hero docs-hero--v2">
        <div className="docs-hero-glow" />
        <img src="/logo.png" alt="Atelier" className="docs-hero-logo-standalone" />
        <span className="docs-hero-badge">Workshop Ready</span>
        <h1 className="docs-hero-title docs-hero-title--v2">ATELIER</h1>
        <p className="docs-hero-subtitle">
          The ultimate developer atelier for constructing high-precision interfaces.
          Seamlessly bridge the gap between architectural logic and creative soul.
        </p>
        <div className="docs-hero-actions">
          <Link to="/workshop" className="docs-btn docs-btn-primary">
            Launch Workshop <span aria-hidden="true">🚀</span>
          </Link>
          <a
            href="https://github.com/DominikPieper/atelier-ui"
            className="docs-btn docs-btn-outline"
          >
            GitHub
          </a>
        </div>
      </div>

      {/* Framework Bento Cards */}
      <div className="docs-framework-bento">
        {FRAMEWORK_CARDS.map(({ to, label, color, title, desc }) => (
          <Link key={title} to={to} className="docs-framework-card">
            <div className="docs-framework-card-top">
              <div
                className="docs-framework-card-icon"
                style={{ background: `${color}20`, color }}
              >
                ⬡
              </div>
              <span className="docs-framework-card-label">{label}</span>
            </div>
            <h3 className="docs-framework-card-title">{title}</h3>
            <p className="docs-framework-card-desc">{desc}</p>
            <div className="docs-framework-card-cta" style={{ color }}>
              Initialize Package <span aria-hidden="true">→</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Stats — Asymmetric */}
      <div className="docs-stats-asymmetric">
        <div className="docs-stats-desc">
          <span className="docs-stats-overline">Library Benchmarks</span>
          <p>
            Continuous optimization across all interface modules, ensuring peak
            performance for modern engineering teams.
          </p>
        </div>
        <div className="docs-stats-numbers">
          <div className="docs-stat-large">
            <span className="docs-stat-large-number">3</span>
            <span className="docs-stat-large-label">Frameworks</span>
          </div>
          <div className="docs-stat-large-divider" />
          <div className="docs-stat-large">
            <span className="docs-stat-large-number">25+</span>
            <span className="docs-stat-large-label">Components</span>
          </div>
          <div className="docs-stat-large-divider" />
          <div className="docs-stat-large">
            <span className="docs-stat-large-number">5</span>
            <span className="docs-stat-large-label">MCP Tools</span>
          </div>
          <div className="docs-stat-large-divider" />
          <div className="docs-stat-large">
            <span className="docs-stat-large-number">0</span>
            <span className="docs-stat-large-label">Runtime Deps</span>
          </div>
        </div>
      </div>

      {/* Workflow Anchors — Asymmetric Bento */}
      <div className="docs-section">
        <h2 className="docs-section-title docs-section-title--editorial">
          Workflow Anchors
        </h2>
        <div className="docs-workflow-bento">
          {/* Workshop Setup — large card */}
          <div className="docs-workflow-main">
            <div className="docs-workflow-main-inner">
              <div>
                <h3 className="docs-workflow-title">Workshop Setup</h3>
                <div className="docs-workflow-tags">
                  <span className="docs-workflow-tag docs-workflow-tag--primary">
                    v2.0.0-core
                  </span>
                  <span className="docs-workflow-tag">Ready for Deployment</span>
                </div>
                <div className="docs-workflow-steps">
                  {WORKSHOP_STEPS.map((step, i) => (
                    <div key={i} className="docs-workflow-step">
                      <div className="docs-workflow-step-num">{i + 1}</div>
                      <p className="docs-workflow-step-text">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
              <Link to="/workshop" className="docs-btn docs-btn-primary docs-btn-fit">
                Initialize Workshop
              </Link>
            </div>
          </div>

          {/* Storybook + MCP — stacked */}
          <div className="docs-workflow-stack">
            <Link to="/storybook" className="docs-workflow-side docs-workflow-side--storybook">
              <div className="docs-workflow-side-header">
                <span className="docs-workflow-side-icon" style={{ color: '#ff4785' }}>
                  📖
                </span>
                <span className="docs-workflow-side-meta">Isolated Environment</span>
              </div>
              <h4 className="docs-workflow-side-title">Storybook Atelier</h4>
              <p className="docs-workflow-side-desc">
                Visual documentation and interaction testing for your atomic library.
              </p>
              <span className="docs-workflow-side-cta" style={{ color: '#ff4785' }}>
                Open Library →
              </span>
            </Link>

            <Link to="/mcp" className="docs-workflow-side docs-workflow-side--mcp">
              <div className="docs-workflow-side-header">
                <span
                  className="docs-workflow-side-icon"
                  style={{ color: 'var(--ui-color-primary)' }}
                >
                  ⬡
                </span>
                <span className="docs-workflow-side-meta">AI Protocol</span>
              </div>
              <h4 className="docs-workflow-side-title">MCP Playground</h4>
              <p className="docs-workflow-side-desc">
                Test and debug Model Context Protocol integrations in real-time.
              </p>
              <span
                className="docs-workflow-side-cta"
                style={{ color: 'var(--ui-color-primary)' }}
              >
                Connect Host →
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Terminal Block */}
      <div className="docs-terminal">
        <div className="docs-terminal-bar">
          <div className="docs-terminal-dots">
            <span className="docs-terminal-dot docs-terminal-dot--red" />
            <span className="docs-terminal-dot docs-terminal-dot--yellow" />
            <span className="docs-terminal-dot docs-terminal-dot--green" />
          </div>
          <span className="docs-terminal-title">terminal — atelier-init — 80x24</span>
          <div style={{ width: '2.5rem' }} />
        </div>
        <div className="docs-terminal-body">
          <div>
            <span className="docs-term-prompt">➜</span>{' '}
            <span className="docs-term-cmd">atelier</span> init --framework angular
          </div>
          <div className="docs-term-muted">Initializing Atelier workspace...</div>
          <div className="docs-term-row">
            <span className="docs-term-tag">[STAGE]</span>
            <span>Fetch Component Registry.</span>
            <span className="docs-term-ok">DONE</span>
          </div>
          <div className="docs-term-row">
            <span className="docs-term-tag">[STAGE]</span>
            <span>Inject Design Tokens.......</span>
            <span className="docs-term-ok">DONE</span>
          </div>
          <div className="docs-term-row">
            <span className="docs-term-tag">[STAGE]</span>
            <span>Wire MCP Server...........</span>
            <span className="docs-term-running">RUNNING (87%)</span>
          </div>
          <div className="docs-terminal-success">
            <div className="docs-term-success-msg">
              Success! Workspace created at ./my-workshop
            </div>
            <div className="docs-term-muted">
              Start dev server:{' '}
              <span className="docs-term-cmd">nx serve my-workshop</span>
            </div>
          </div>
          <div className="docs-term-cursor">
            <span className="docs-term-prompt">➜</span>{' '}
            <span className="docs-term-blink">█</span>
          </div>
        </div>
      </div>

      {/* Ecosystem links */}
      <div className="docs-section" style={{ marginTop: '2.5rem' }}>
        <h2 className="docs-section-title docs-section-title--editorial">The Ecosystem</h2>
        <div className="docs-ecosystem">
          {ECOSYSTEM_LINKS.map(({ to, icon, label, desc }) => (
            <Link key={to} to={to} className="docs-ecosystem-card">
              <span className="docs-ecosystem-icon">{icon}</span>
              <div>
                <div className="docs-ecosystem-label">{label}</div>
                <div className="docs-ecosystem-desc">{desc}</div>
              </div>
              <span className="docs-ecosystem-arrow">→</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Spacer for command bar */}
      <div style={{ height: '5rem' }} />

      {/* Command Bar */}
      <div className="docs-command-bar">
        <div className="docs-command-bar-inner">
          <div className="docs-command-bar-label">
            <span aria-hidden="true">⌨</span>
            <span className="docs-command-bar-title">Quick Command</span>
          </div>
          <div className="docs-command-bar-divider" />
          <div className="docs-command-bar-actions">
            <Link to="/components" className="docs-command-bar-action">
              <span aria-hidden="true">＋</span>
              <span>Components</span>
            </Link>
            <Link to="/workshop" className="docs-command-bar-action">
              <span aria-hidden="true">⚙</span>
              <span>Workshop</span>
            </Link>
            <Link to="/install" className="docs-command-bar-action">
              <span aria-hidden="true">↗</span>
              <span>Install</span>
            </Link>
          </div>
          <div className="docs-command-bar-divider" />
          <span className="docs-command-bar-hint">Press ⌘K to search</span>
        </div>
      </div>
    </>
  );
}
