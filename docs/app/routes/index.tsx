import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ALL_COMPONENTS, COMPONENT_CATEGORIES } from '../component-data';

export const Route = createFileRoute('/')({
  component: HomePage,
});

const CATEGORY_ICONS: Record<string, string> = {
  Inputs: '✏️',
  Display: '🎨',
  Navigation: '🧭',
  Overlay: '🪟',
  Layout: '📐',
};

const COMPONENT_ICONS: Record<string, string> = {
  button: '🔘',
  input: '📝',
  textarea: '📄',
  checkbox: '☑️',
  toggle: '🔀',
  'radio-group': '⭕',
  select: '📋',
  badge: '🏷️',
  card: '🃏',
  avatar: '👤',
  skeleton: '💀',
  progress: '📊',
  breadcrumbs: '🍞',
  tabs: '📑',
  pagination: '📄',
  menu: '📂',
  dialog: '🗨️',
  drawer: '🗃️',
  tooltip: '💬',
  toast: '🍞',
  accordion: '🪗',
  alert: '⚠️',
};

function HomePage() {
  return (
    <>
      {/* Hero */}
      <div className="docs-hero">
        <h1 className="docs-hero-title">
          Atelier
        </h1>
        <p className="docs-hero-subtitle">
          Atelier — a component library designed for AI-generated applications.
          Battle-tested React and Angular components with consistent APIs,
          accessible by default, and styled with design tokens.
        </p>
        <div className="docs-hero-actions">
          <Link to="/components" className="docs-btn docs-btn-primary">
            Browse Components →
          </Link>
          <a
            href="https://github.com"
            className="docs-btn docs-btn-outline"
          >
            GitHub
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="docs-stats">
        <div className="docs-stat">
          <div className="docs-stat-number">{ALL_COMPONENTS.length}</div>
          <div className="docs-stat-label">Components</div>
        </div>
        <div className="docs-stat">
          <div className="docs-stat-number">2</div>
          <div className="docs-stat-label">Frameworks</div>
        </div>
        <div className="docs-stat">
          <div className="docs-stat-number">A11Y</div>
          <div className="docs-stat-label">Accessible</div>
        </div>
        <div className="docs-stat">
          <div className="docs-stat-number">0</div>
          <div className="docs-stat-label">Runtime Deps</div>
        </div>
      </div>

      {/* Features */}
      <div className="docs-features">
        <div className="docs-feature">
          <div className="docs-feature-icon">🤖</div>
          <div className="docs-feature-title">AI-First Design</div>
          <div className="docs-feature-desc">
            Component APIs are designed to be predictable and easy for LLMs to
            generate correctly on the first try.
          </div>
        </div>
        <div className="docs-feature">
          <div className="docs-feature-icon">🎨</div>
          <div className="docs-feature-title">Design Tokens</div>
          <div className="docs-feature-desc">
            Consistent <code>--ui-*</code> CSS custom properties for colors,
            spacing, radii, and shadows across both frameworks.
          </div>
        </div>
        <div className="docs-feature">
          <div className="docs-feature-icon">♿</div>
          <div className="docs-feature-title">Accessible by Default</div>
          <div className="docs-feature-desc">
            Proper ARIA roles, keyboard navigation, and focus management. No
            extra configuration needed.
          </div>
        </div>
        <div className="docs-feature">
          <div className="docs-feature-icon">⚡</div>
          <div className="docs-feature-title">Dual Framework</div>
          <div className="docs-feature-desc">
            Identical component APIs for both React and Angular. Same props,
            same tokens, different syntax.
          </div>
        </div>
      </div>

      {/* Component categories */}
      {Object.entries(COMPONENT_CATEGORIES).map(([category, components]) => (
        <div key={category} className="docs-section">
          <h2 className="docs-section-title">
            {CATEGORY_ICONS[category]} {category}
          </h2>
          <div className="docs-component-grid">
            {components.map((name) => (
              <Link
                key={name}
                to="/components/$name"
                params={{ name }}
                className="docs-component-card"
              >
                <div className="docs-component-card-icon">
                  {COMPONENT_ICONS[name] ?? '🧩'}
                </div>
                <div className="docs-component-card-name">
                  {formatComponentName(name)}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* Design tokens */}
      <div className="docs-section">
        <h2 className="docs-section-title">🎨 Brand Tokens</h2>
        <div className="docs-token-grid">
          {[
            { name: '--ui-color-brand-corporate', value: '#00bebe', label: 'Corporate' },
            { name: '--ui-color-brand-agile', value: '#00d296', label: 'Agile Advisory' },
            { name: '--ui-color-brand-architecture', value: '#009696', label: 'Architecture' },
            { name: '--ui-color-brand-development', value: '#00b4ff', label: 'Development' },
          ].map((token) => (
            <div key={token.name} className="docs-token-swatch">
              <div
                className="docs-token-color"
                style={{ background: token.value }}
              />
              <div className="docs-token-info">
                <code className="docs-token-name">{token.name}</code>
                <span className="docs-token-value">{token.value} — {token.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function formatComponentName(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
