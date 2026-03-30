import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { CodeBlock } from '../shared/code-block';

export const Route = createFileRoute('/install')({
  component: InstallPage,
});

const FRAMEWORKS = ['Angular', 'React', 'Vue'] as const;
type Framework = typeof FRAMEWORKS[number];

const PKG_MANAGERS = ['npm', 'pnpm', 'yarn'] as const;
type PkgManager = typeof PKG_MANAGERS[number];

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
  Angular: `import {
  LlmButton, LlmCard, LlmCardHeader, LlmCardContent, LlmCardFooter,
  LlmInput, LlmTextarea, LlmCheckbox, LlmToggle,
  LlmBadge, LlmAlert, LlmSelect, LlmOption,
  LlmDialog, LlmTabGroup, LlmTab, LlmAccordionGroup,
  LlmMenu, LlmMenuItem, LlmTooltip, LlmToast, LlmToastContainer,
  LlmSkeleton, LlmAvatar, LlmAvatarGroup
} from '@atelier-ui/angular';`,
  React: `import {
  LlmButton, LlmCard, LlmCardHeader, LlmCardContent, LlmCardFooter,
  LlmInput, LlmTextarea, LlmCheckbox, LlmToggle,
  LlmBadge, LlmAlert, LlmSelect, LlmOption,
  LlmDialog, LlmTabGroup, LlmTab, LlmAccordionGroup,
  LlmMenu, LlmMenuItem, LlmTooltip,
  LlmSkeleton, LlmAvatar, LlmAvatarGroup,
  LlmToastProvider, LlmToastContainer, useLlmToast
} from '@atelier-ui/react';`,
  Vue: `import {
  LlmButton, LlmCard, LlmCardHeader, LlmCardContent, LlmCardFooter,
  LlmInput, LlmTextarea, LlmCheckbox, LlmToggle,
  LlmBadge, LlmAlert, LlmSelect, LlmOption,
  LlmDialog, LlmTabGroup, LlmTab, LlmAccordionGroup,
  LlmMenu, LlmMenuItem, LlmTooltip,
  LlmSkeleton, LlmAvatar, LlmAvatarGroup
} from '@atelier-ui/vue';`,
};

function InstallPage() {
  const [activeFramework, setActiveFramework] = useState<Framework>('Angular');
  const [activePkgMgr, setActivePkgMgr] = useState<PkgManager>('npm');

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
          Installation
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--ui-color-text-muted)', margin: 0, maxWidth: '520px', lineHeight: '1.65' }}>
          Get started with Atelier UI in your Angular, React, or Vue project.
        </p>
      </div>

      {/* Framework selector */}
      <div className="docs-multi-code-tabs" style={{ borderRadius: '8px', marginBottom: '2rem', width: 'fit-content' }}>
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

      {/* Install */}
      <div className="docs-section">
        <h2 className="docs-section-title">1. Install the package</h2>

        {/* Package manager tabs */}
        <div className="docs-multi-code-tabs" style={{ borderRadius: '8px 8px 0 0', marginBottom: 0 }}>
          {PKG_MANAGERS.map(pm => (
            <button
              key={pm}
              className={`docs-multi-code-tab${activePkgMgr === pm ? ' active' : ''}`}
              onClick={() => setActivePkgMgr(pm)}
            >
              {pm}
            </button>
          ))}
        </div>
        <CodeBlock lang="shell" code={INSTALL_CMD[activeFramework][activePkgMgr]} />
      </div>

      {/* Tokens */}
      <div className="docs-section">
        <h2 className="docs-section-title">2. Import design tokens</h2>
        <p style={{ color: 'var(--ui-color-text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
          Add the token stylesheet to your global styles file:
        </p>
        <CodeBlock lang="css" code={TOKEN_IMPORT[activeFramework]} />
        <div style={{
          padding: '1rem 1.25rem',
          background: 'rgba(68,218,218,0.05)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(68,218,218,0.1)',
          borderRadius: 'var(--ui-radius-md)',
          marginTop: '1rem',
        }}>
          <p style={{ margin: '0 0 0.35rem', fontSize: '0.82rem', fontWeight: '700', color: 'var(--ui-color-text)' }}>CSS Variables</p>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--ui-color-text-muted)', lineHeight: '1.6' }}>
            Atelier UI uses CSS custom properties for all design tokens, enabling dynamic
            theme switching between light and dark mode with zero JavaScript.
          </p>
        </div>
      </div>

      {/* Import components */}
      <div className="docs-section">
        <h2 className="docs-section-title">3. Import components</h2>
        <p style={{ color: 'var(--ui-color-text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
          Import only the components you need — all are tree-shakeable:
        </p>
        <CodeBlock lang="ts" code={COMPONENT_IMPORT[activeFramework]} />
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
