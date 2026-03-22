import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <>
      {/* Hero */}
      <div className="docs-hero">
        <h1 className="docs-hero-title">
          <img src="/logo.png" alt="Atelier Logo" className="docs-hero-logo" />
          Atelier
        </h1>
        <p className="docs-hero-subtitle">
          A workshop toolkit for hands-on AI development training. Spin up a
          fully-wired workspace in one command, explore components live in
          Storybook, and experiment with the MCP server to see exactly how AI
          reasons about your component library.
        </p>
        <div className="docs-hero-actions">
          <Link to="/workshop" className="docs-btn docs-btn-primary">
            Start a Workshop →
          </Link>
          <a
            href="https://github.com/DominikPieper/atelier-ui"
            className="docs-btn docs-btn-outline"
          >
            GitHub
          </a>
        </div>
      </div>

      {/* Three pillars */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
          padding: '0 1rem',
        }}
      >
        <Link
          to="/workshop"
          className="docs-component-card"
          style={{ padding: '2rem', height: 'auto', borderTop: '3px solid var(--ui-color-primary)', textDecoration: 'none' }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🛠</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ui-color-text)', marginBottom: '0.5rem' }}>
            Workshop Setup
          </div>
          <div style={{ color: 'var(--ui-color-text-muted)', lineHeight: 1.6, fontSize: '0.9rem' }}>
            Run one command and get a fully-configured workspace — framework of
            your choice, library installed, MCP server wired up and ready to go.
          </div>
        </Link>

        <Link
          to="/storybook"
          className="docs-component-card"
          style={{ padding: '2rem', height: 'auto', borderTop: '3px solid #7c3aed', textDecoration: 'none' }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📚</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ui-color-text)', marginBottom: '0.5rem' }}>
            Storybook
          </div>
          <div style={{ color: 'var(--ui-color-text-muted)', lineHeight: 1.6, fontSize: '0.9rem' }}>
            Browse all 22 components live with interactive controls and real
            usage examples — the reference participants reach for during exercises.
          </div>
        </Link>

        <Link
          to="/mcp"
          className="docs-component-card"
          style={{ padding: '2rem', height: 'auto', borderTop: '3px solid #059669', textDecoration: 'none' }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔌</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ui-color-text)', marginBottom: '0.5rem' }}>
            MCP Playground
          </div>
          <div style={{ color: 'var(--ui-color-text-muted)', lineHeight: 1.6, fontSize: '0.9rem' }}>
            Call the component library MCP server and inspect the structured
            data AI tools receive — makes the protocol tangible and teachable.
          </div>
        </Link>
      </div>

      {/* Stats */}
      <div className="docs-stats" style={{ padding: '0 1rem', marginBottom: '2.5rem' }}>
        <div className="docs-stat">
          <div className="docs-stat-number">3</div>
          <div className="docs-stat-label">Frameworks</div>
        </div>
        <div className="docs-stat">
          <div className="docs-stat-number">22</div>
          <div className="docs-stat-label">Components</div>
        </div>
        <div className="docs-stat">
          <div className="docs-stat-number">5</div>
          <div className="docs-stat-label">MCP Tools</div>
        </div>
        <div className="docs-stat">
          <div className="docs-stat-number">0</div>
          <div className="docs-stat-label">Runtime Deps</div>
        </div>
      </div>

      {/* Secondary: The Library */}
      <div className="docs-section" style={{ padding: '0 1rem' }}>
        <h2 className="docs-section-title">The component library</h2>
        <p style={{ color: 'var(--ui-color-text-muted)', lineHeight: 1.65, marginBottom: '1.25rem', maxWidth: '600px' }}>
          22 LLM-optimized components across Angular, React, and Vue — built
          with predictable APIs, accessible defaults, and consistent design
          tokens. Designed to be easy for AI to reason about and humans to learn from.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/install" className="docs-btn docs-btn-outline">Installation</Link>
          <Link to="/components" className="docs-btn docs-btn-outline">Browse Components →</Link>
        </div>
      </div>
    </>
  );
}
