import { useState } from 'react';

const FRAMEWORKS = ['Angular', 'React', 'Vue'] as const;
type Framework = (typeof FRAMEWORKS)[number];

const PKG_MANAGERS = ['npm', 'pnpm', 'yarn'] as const;
type PkgManager = (typeof PKG_MANAGERS)[number];

const INSTALL_CMD: Record<Framework, Record<PkgManager, string>> = {
  Angular: {
    npm: 'npm install @atelier-ui/angular',
    pnpm: 'pnpm add @atelier-ui/angular',
    yarn: 'yarn add @atelier-ui/angular',
  },
  React: {
    npm: 'npm install @atelier-ui/react',
    pnpm: 'pnpm add @atelier-ui/react',
    yarn: 'yarn add @atelier-ui/react',
  },
  Vue: {
    npm: 'npm install @atelier-ui/vue',
    pnpm: 'pnpm add @atelier-ui/vue',
    yarn: 'yarn add @atelier-ui/vue',
  },
};

const TOKEN_IMPORT: Record<Framework, string> = {
  Angular: "@import '@atelier-ui/angular/styles/tokens.css';",
  React: "@import '@atelier-ui/react/styles/tokens.css';",
  Vue: "@import '@atelier-ui/vue/styles/tokens.css';",
};

const COMPONENT_IMPORT: Record<Framework, string> = {
  Angular: `import {\n  LlmButton, LlmCard, LlmInput, LlmTextarea,\n  LlmCheckbox, LlmToggle, LlmBadge, LlmAlert,\n  LlmSelect, LlmOption, LlmDialog, LlmTabGroup,\n  LlmTab, LlmAccordionGroup, LlmMenu, LlmMenuItem,\n  LlmTooltip, LlmToast, LlmSkeleton, LlmAvatar\n} from '@atelier-ui/angular';`,
  React: `import {\n  LlmButton, LlmCard, LlmInput, LlmTextarea,\n  LlmCheckbox, LlmToggle, LlmBadge, LlmAlert,\n  LlmSelect, LlmOption, LlmDialog, LlmTabGroup,\n  LlmTab, LlmAccordionGroup, LlmMenu, LlmMenuItem,\n  LlmTooltip, LlmToastProvider, useLlmToast,\n  LlmSkeleton, LlmAvatar, LlmAvatarGroup\n} from '@atelier-ui/react';`,
  Vue: `import {\n  LlmButton, LlmCard, LlmInput, LlmTextarea,\n  LlmCheckbox, LlmToggle, LlmBadge, LlmAlert,\n  LlmSelect, LlmOption, LlmDialog, LlmTabGroup,\n  LlmTab, LlmAccordionGroup, LlmMenu, LlmMenuItem,\n  LlmTooltip, LlmSkeleton, LlmAvatar, LlmAvatarGroup\n} from '@atelier-ui/vue';`,
};

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="docs-code-block">
      <div className="docs-code-block-header">
        <span className="docs-code-block-lang">{lang}</span>
        <button className="docs-code-block-copy" onClick={copy}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  );
}

export default function InstallTabs() {
  const [fw, setFw] = useState<Framework>('Angular');
  const [pm, setPm] = useState<PkgManager>('npm');

  return (
    <div className="docs-inline-page">
      {/* Framework selector */}
      <div className="docs-multi-code-tabs" style={{ borderRadius: '8px', marginBottom: '2rem', width: 'fit-content' }}>
        {FRAMEWORKS.map(f => (
          <button key={f} className={`docs-multi-code-tab${fw === f ? ' active' : ''}`} onClick={() => setFw(f)}>
            {f}
          </button>
        ))}
      </div>

      {/* Step 1 */}
      <div className="docs-section">
        <h2 className="docs-section-title">1. Install the package</h2>
        <div className="docs-multi-code-tabs" style={{ borderRadius: '8px 8px 0 0', marginBottom: 0 }}>
          {PKG_MANAGERS.map(p => (
            <button key={p} className={`docs-multi-code-tab${pm === p ? ' active' : ''}`} onClick={() => setPm(p)}>
              {p}
            </button>
          ))}
        </div>
        <CodeBlock lang="shell" code={INSTALL_CMD[fw][pm]} />
      </div>

      {/* Step 2 */}
      <div className="docs-section">
        <h2 className="docs-section-title">2. Import design tokens</h2>
        <p style={{ color: 'var(--ui-color-text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
          Add the token stylesheet to your global styles file:
        </p>
        <CodeBlock lang="css" code={TOKEN_IMPORT[fw]} />
        <div style={{
          padding: '1rem 1.25rem',
          background: 'var(--ui-color-primary-light)',
          border: '1px solid color-mix(in srgb, var(--ui-color-primary) 20%, transparent)',
          borderRadius: 'var(--ui-radius-md)',
          marginTop: '1rem',
        }}>
          <p style={{ margin: '0 0 0.3rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--ui-color-text)' }}>CSS Variables</p>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--ui-color-text-muted)', lineHeight: 1.6 }}>
            Atelier UI uses CSS custom properties for all design tokens, enabling dynamic
            theme switching between light and dark mode with zero JavaScript.
          </p>
        </div>
      </div>

      {/* Step 3 */}
      <div className="docs-section">
        <h2 className="docs-section-title">3. Import components</h2>
        <p style={{ color: 'var(--ui-color-text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
          Import only the components you need — all are tree-shakeable:
        </p>
        <CodeBlock lang="ts" code={COMPONENT_IMPORT[fw]} />
      </div>

      {/* Features */}
      <div className="docs-section">
        <h2 className="docs-section-title">What's included</h2>
        <ul className="docs-checklist">
          <li>25+ components with identical APIs across Angular, React, and Vue</li>
          <li>CSS custom property token system — no runtime dependency</li>
          <li>Dark and light mode built in</li>
          <li>WCAG AA accessible defaults</li>
          <li>LLM-optimized flat APIs — no deep nesting</li>
          <li>MCP server for AI-assisted component discovery</li>
        </ul>
      </div>

      {/* Next steps */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', marginTop: '2.5rem' }}>
        {[
          { to: '/workshop', label: 'Next', title: 'Workshop Setup', icon: '⚙' },
          { to: '/components', label: 'Browse', title: 'Components', icon: '🧩' },
          { to: '/design-principles', label: 'Read', title: 'LLM-Optimized APIs', icon: '🧠' },
        ].map(({ to, label, title, icon }) => (
          <a key={to} href={to} style={{
            display: 'flex', alignItems: 'center', gap: '0.85rem',
            padding: '0.9rem 1rem', background: 'var(--ui-color-surface-raised)',
            borderRadius: 'var(--ui-radius-md)', textDecoration: 'none', color: 'inherit',
            border: '1px solid var(--ui-color-border)', transition: 'border-color 0.15s',
          }}>
            <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{icon}</span>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ui-color-text-muted)', marginBottom: '0.15rem' }}>{label}</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--ui-color-text)' }}>{title}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
