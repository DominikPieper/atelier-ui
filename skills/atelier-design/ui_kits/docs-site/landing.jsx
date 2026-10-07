/* global React */
const { useState } = React;

/* ─────────────────────────────── Icons ─────────────────────────────── */
const Icon = ({ name, ...props }) => {
  const paths = {
    figma: (
      <>
        <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z" />
        <path d="M12 2h3.5a3.5 3.5 0 0 1 0 7H12V2z" />
        <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z" />
        <path d="M12 9h3.5a3.5 3.5 0 0 1 0 7H12V9z" />
        <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z" />
      </>
    ),
    book: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </>
    ),
    sparkles: (
      <>
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </>
    ),
    moon: (
      <>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </>
    ),
    github: (
      <>
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </>
    ),
    arrow: (
      <>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </>
    ),
    check: (
      <>
        <circle cx="12" cy="12" r="9" />
        <polyline points="8 12.5 11 15.5 16 9.5" />
      </>
    ),
    terminal: (
      <>
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" {...props}>
      {paths[name]}
    </svg>
  );
};

/* ─────────────────────────────── Topbar ─────────────────────────────── */
const Topbar = ({ theme, onToggleTheme }) => (
  <header className="topbar">
    <a href="#" className="brand">
      <img className="brand-mark" src="../../assets/logo.png" alt="Atelier" />
      <div className="brand-stack">
        <span className="brand-name">ATELIER</span>
        <span className="brand-attr">By Dominik Pieper</span>
      </div>
    </a>
    <nav className="topbar-nav" aria-label="Primary">
      <a href="#" className="active">
        Workshop
      </a>
      <a href="#">Components</a>
      <a href="#">MCP setup</a>
      <a href="#">Spec</a>
      <a href="#">Changelog</a>
    </nav>
    <div className="topbar-actions">
      <button className="icon-btn" aria-label="Search">
        <Icon name="search" />
      </button>
      <button
        className="icon-btn"
        aria-label="Toggle theme"
        onClick={onToggleTheme}
      >
        <Icon name="moon" />
      </button>
      <button className="icon-btn" aria-label="GitHub">
        <Icon name="github" />
      </button>
    </div>
  </header>
);

/* ─────────────────────────────── Loop ───────────────────────────────
 * The design-to-code loop drawn as a spec sheet. Mirrors
 * docs/src/components/LoopDiagram.astro: an ordered list of four steps,
 * each with its real artefact; token names are annotated with leader
 * lines. Leaders, connectors and rails are decorative (aria-hidden or CSS).
 */
const Leader = () => <span className="loop-leader" aria-hidden="true"></span>;

const LoopDiagram = () => (
  <figure className="loop">
    <div className="loop-body">
      <ol className="loop-steps" aria-label="The design-to-code loop">
        <li className="loop-step">
          <p className="loop-name">
            <span className="loop-num" aria-hidden="true">
              1
            </span>
            Inspect
          </p>
          <p className="loop-tool">
            figma-console MCP ·{' '}
            <code>
              figma_get_
              <wbr />
              component_for_
              <wbr />
              development
            </code>
          </p>
          <div className="loop-artefact">
            <p className="loop-artefact-title">boundVariables</p>
            <ul className="loop-map">
              <li>
                <span className="loop-prop">fills</span>
                <Leader />
                <code className="loop-token">--ui-color-surface-raised</code>
              </li>
              <li>
                <span className="loop-prop">cornerRadius</span>
                <Leader />
                <code className="loop-token">--ui-radius-xl</code>
              </li>
              <li>
                <span className="loop-prop">paddingLeft</span>
                <Leader />
                <code className="loop-token">--ui-spacing-6</code>
              </li>
            </ul>
          </div>
        </li>

        <li className="loop-step">
          <p className="loop-name">
            <span className="loop-num" aria-hidden="true">
              2
            </span>
            Contract
          </p>
          <p className="loop-tool">Only the mismatches you chose on purpose</p>
          <div className="loop-artefact">
            <p className="loop-artefact-title">
              <code>
                libs/
                <wbr />
                spec/
                <wbr />
                src/
                <wbr />
                contracts/
                <wbr />
                button.contract.ts
              </code>
            </p>
            <p className="loop-note">
              plus one story per variant value, with a <code>play</code> per
              behaviour
            </p>
          </div>
        </li>

        <li className="loop-step">
          <p className="loop-name">
            <span className="loop-num" aria-hidden="true">
              3
            </span>
            Generate
          </p>
          <p className="loop-tool">
            Storybook MCP · <code>docs-show</code>
          </p>
          <div className="loop-artefact">
            <p className="loop-artefact-title">framework-native component</p>
            <div className="loop-spec">
              <code className="loop-code">
                &lt;atl-button variant="primary"&gt;
              </code>
              <div className="loop-sample" aria-hidden="true">
                Save
              </div>
              <ul className="loop-callouts" aria-hidden="true">
                <li>
                  <Leader />
                  <code className="loop-token">--ui-color-primary</code>
                </li>
                <li>
                  <Leader />
                  <code className="loop-token">--ui-radius-md</code>
                </li>
              </ul>
            </div>
          </div>
        </li>

        <li className="loop-step">
          <p className="loop-name">
            <span className="loop-num" aria-hidden="true">
              4
            </span>
            Verify
          </p>
          <p className="loop-tool">
            figma-console MCP ·{' '}
            <code>
              figma_check_
              <wbr />
              design_parity
            </code>
          </p>
          <div className="loop-artefact">
            <p className="loop-result">
              <Icon name="check" className="loop-result-icon" />
              <span>
                <strong>0</strong> discrepancies
              </span>
            </p>
            <p className="loop-note">
              padding, colour and variant drift, checked against the master
            </p>
          </div>
        </li>
      </ol>

      <p className="loop-return">
        <span className="loop-return-rail" aria-hidden="true"></span>
        <span className="loop-return-label">Discrepancies → iterate</span>
      </p>
      <span className="loop-side-rail" aria-hidden="true"></span>
    </div>
  </figure>
);

/* ─────────────────────────────── Hero ─────────────────────────────── */
const Hero = () => (
  <section className="hero">
    <div className="hero-copy">
      <h1 className="hero-title">
        Design to <span className="accent">code</span>, verified.
      </h1>
      <p className="hero-sub">
        A Figma design becomes a working, verified component — in Angular, React
        or Vue.
      </p>
      <div className="hero-actions">
        <a href="#" className="btn btn-primary btn-lg">
          Start the workshop
        </a>
        <a href="#" className="link-primary">
          Browse components
        </a>
      </div>
    </div>
    <LoopDiagram />
    <p className="hero-note">Teaching artifact · not a production library</p>
  </section>
);

/* ─────────────────────────────── MCP Card ─────────────────────────────── */
const McpSection = () => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <section className="section section-alt">
      <div className="section-narrow">
        <div className="mcp-row">
          <div className="mcp-text">
            <h2>One endpoint. One config.</h2>
            <p>
              Drop this into your Claude Code MCP config. Angular is the
              default; React and Vue use{' '}
              <span className="ui-mono">storybook-react</span> and{' '}
              <span className="ui-mono">storybook-vue</span> at the same path
              pattern. Each Storybook endpoint exposes the same three docs tools
              — <span className="ui-mono">docs-list</span>,{' '}
              <span className="ui-mono">docs-show</span>,{' '}
              <span className="ui-mono">docs-show-story</span>.
            </p>
            <ul className="mcp-checklist">
              <li>HTTP transport — no local processes to babysit.</li>
              <li>Hosted alongside the Storybook itself, no extra deploy.</li>
              <li>
                Spec-aware — Claude knows which props exist before suggesting
                code.
              </li>
            </ul>
          </div>
          <div className="code-card">
            <div className="code-head">
              <span className="code-lang">claude_desktop_config.json</span>
              <button className="code-copy" onClick={copy}>
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="code-body">
              {`{
  `}
              <span className="code-name">"mcpServers"</span>
              {`: {
    `}
              <span className="code-name">"storybook-angular"</span>
              {`: {
      `}
              <span className="code-name">"type"</span>
              {`: `}
              <span className="code-str">"http"</span>
              {`,
      `}
              <span className="code-name">"url"</span>
              {`: `}
              <span className="code-str">
                "https://atelier.pieper.io/storybook-angular/mcp"
              </span>
              {`
    }
  }
}`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────── Components grid ─────────────────────────────── */
const COMPONENTS = [
  {
    name: 'AtlButton',
    desc: 'Primary action. 4 variants, 3 sizes.',
    icon: 'B',
    cat: 'Inputs',
  },
  {
    name: 'AtlInput',
    desc: 'Text field with validation states.',
    icon: 'I',
    cat: 'Inputs',
  },
  {
    name: 'AtlTextarea',
    desc: 'Multi-line input. Auto-resize opt-in.',
    icon: 'T',
    cat: 'Inputs',
  },
  {
    name: 'AtlCheckbox',
    desc: 'Boolean input with indeterminate state.',
    icon: '☐',
    cat: 'Inputs',
  },
  {
    name: 'AtlRadio',
    desc: 'Mutually exclusive selection.',
    icon: '◉',
    cat: 'Inputs',
  },
  {
    name: 'AtlSelect',
    desc: 'Single-select dropdown.',
    icon: '▾',
    cat: 'Inputs',
  },
  {
    name: 'AtlCombobox',
    desc: 'Filterable, type-ahead select.',
    icon: '▾',
    cat: 'Inputs',
  },
  { name: 'AtlSwitch', desc: 'Two-state toggle.', icon: '⊙', cat: 'Inputs' },
  {
    name: 'AtlCard',
    desc: 'Composable container — Header, Content, Footer.',
    icon: 'C',
    cat: 'Display',
  },
  { name: 'AtlBadge', desc: 'Inline status pill.', icon: '●', cat: 'Display' },
  {
    name: 'AtlAvatar',
    desc: 'User identity glyph with fallback.',
    icon: '◯',
    cat: 'Display',
  },
  {
    name: 'AtlTable',
    desc: 'Sortable, virtualised data table.',
    icon: '☷',
    cat: 'Display',
  },
  {
    name: 'AtlTabs',
    desc: 'Lazy panel switcher. ARIA tabs.',
    icon: '┉',
    cat: 'Navigation',
  },
  {
    name: 'AtlStepper',
    desc: 'Linear progress through a flow.',
    icon: '⇉',
    cat: 'Navigation',
  },
  {
    name: 'AtlBreadcrumbs',
    desc: 'Hierarchical location.',
    icon: '/',
    cat: 'Navigation',
  },
  {
    name: 'AtlDialog',
    desc: 'Modal surface. Focus-trap, Esc-close.',
    icon: '▢',
    cat: 'Overlay',
  },
  {
    name: 'AtlPopover',
    desc: 'Anchored, dismissable surface.',
    icon: '◆',
    cat: 'Overlay',
  },
  {
    name: 'AtlTooltip',
    desc: 'Pointer-triggered hint.',
    icon: '?',
    cat: 'Overlay',
  },
  {
    name: 'AtlToast',
    desc: 'Transient notification.',
    icon: '!',
    cat: 'Overlay',
  },
  {
    name: 'AtlDropdown',
    desc: 'Action menu with arrow-key nav.',
    icon: '⋮',
    cat: 'Overlay',
  },
  {
    name: 'AtlAccordion',
    desc: 'Collapsible region group.',
    icon: '⌃',
    cat: 'Display',
  },
  {
    name: 'AtlAlert',
    desc: 'Inline status banner.',
    icon: '◭',
    cat: 'Display',
  },
  {
    name: 'AtlProgress',
    desc: 'Determinate + indeterminate.',
    icon: '▰',
    cat: 'Display',
  },
  {
    name: 'AtlSlider',
    desc: 'Single + dual-thumb range.',
    icon: '─',
    cat: 'Inputs',
  },
  {
    name: 'AtlIcon',
    desc: '20-name spec set. label = a11y.',
    icon: '✦',
    cat: 'Display',
  },
  {
    name: 'AtlSkeleton',
    desc: 'Loading placeholder shimmer.',
    icon: '▭',
    cat: 'Display',
  },
  {
    name: 'AtlDivider',
    desc: 'Section separator. Horizontal/vertical.',
    icon: '|',
    cat: 'Display',
  },
];

const CATEGORIES = ['All', 'Inputs', 'Display', 'Navigation', 'Overlay'];

const ComponentsGrid = () => {
  const [cat, setCat] = useState('All');
  const [fw, setFw] = useState('react');
  const filtered =
    cat === 'All' ? COMPONENTS : COMPONENTS.filter((c) => c.cat === cat);
  return (
    <section className="section">
      <div className="section-narrow">
        <div className="section-head">
          <span className="section-eyebrow">The library</span>
          <h2 className="section-title">
            27 components. Three frameworks. One spec.
          </h2>
          <p className="section-sub">
            Same prop names, same variant unions, same tokens — across Angular
            21, React 19, Vue 3.
          </p>
        </div>
        <div className="comp-toolbar">
          <div
            className="pill-group"
            role="tablist"
            aria-label="Filter components"
          >
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`pill ${cat === c ? 'active' : ''}`}
                onClick={() => setCat(c)}
                aria-pressed={cat === c}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="fw-switcher" role="tablist" aria-label="Framework">
            {[
              ['angular', 'Angular'],
              ['react', 'React'],
              ['vue', 'Vue'],
            ].map(([k, l]) => (
              <button
                key={k}
                className={`fw-btn ${fw === k ? 'active' : ''}`}
                onClick={() => setFw(k)}
                aria-pressed={fw === k}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="comp-grid">
          {filtered.map((c) => (
            <article className="comp-card" key={c.name} tabIndex="0">
              <div className="comp-icon">{c.icon}</div>
              <div className="comp-name">{c.name}</div>
              <div className="comp-desc">{c.desc}</div>
              <div className="comp-foot">
                <span className="comp-cta">View story →</span>
                <span className="fw-dots" aria-hidden="true">
                  <span
                    className="fw-dot"
                    style={{ background: '#dd0031' }}
                  ></span>
                  <span
                    className="fw-dot"
                    style={{ background: '#61dafb' }}
                  ></span>
                  <span
                    className="fw-dot"
                    style={{ background: '#42b883' }}
                  ></span>
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────── CTA ─────────────────────────────── */
const Cta = () => (
  <section className="section">
    <div className="section-narrow">
      <div className="cta">
        <h2 className="cta-title">Scaffold a workspace.</h2>
        <p className="cta-sub">
          An Nx workspace with your framework choice, the component library
          wired up, and the MCP config pre-seeded.
        </p>
        <div className="cta-cmd">
          <Icon
            name="terminal"
            style={{
              width: 18,
              height: 18,
              stroke: 'rgba(255,255,255,0.7)',
              strokeWidth: 1.75,
              fill: 'none',
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            }}
          />
          <span className="cta-cmd-prompt">$</span>
          <span className="cta-cmd-text">npx create-atelier-ui-workspace</span>
          <button className="cta-cmd-copy">Copy</button>
        </div>
      </div>
    </div>
  </section>
);

/* ─────────────────────────────── Footer ─────────────────────────────── */
const Footer = () => (
  <footer className="footer">
    <div className="footer-row">
      <div className="footer-meta">
        © 2026 Dominik Pieper · MIT · Teaching artifact
      </div>
      <nav className="footer-links" aria-label="Footer">
        <a href="#">GitHub</a>
        <a href="#">Spec reference</a>
        <a href="#">Changelog</a>
        <a href="#">Workshop</a>
      </nav>
    </div>
  </footer>
);

/* ─────────────────────────────── App ─────────────────────────────── */
const App = () => {
  const [theme, setTheme] = useState('light');
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  return (
    <div data-screen-label="Atelier docs landing">
      <Topbar
        theme={theme}
        onToggleTheme={() =>
          setTheme((t) => (t === 'light' ? 'dark' : 'light'))
        }
      />
      <Hero />
      <McpSection />
      <ComponentsGrid />
      <Cta />
      <Footer />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
