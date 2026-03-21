import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ALL_COMPONENTS } from '../component-data';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <div className="docs-hero">
        <h1 className="docs-hero-title">
          <img src="/logo.png" alt="Atelier Logo" className="docs-hero-logo" />
          Atelier
        </h1>
        <p className="docs-hero-subtitle">
          An LLM-Optimized UI Component Library built to showcase development
          with AI, Storybook, and Figma. Battle-tested React and Angular
          components with predictable APIs and accessible defaults.
        </p>
        <div className="docs-hero-actions">
          <Link to="/components" className="docs-btn docs-btn-primary">
            Browse Components →
          </Link>
          <a href="https://github.com/DominikPieper/atelier-ui" className="docs-btn docs-btn-outline">
            GitHub
          </a>
        </div>
      </div>

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

      <div className="docs-section">
        <div
          className="docs-component-grid"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            marginTop: '2rem',
          }}
        >
          <Link
            to="/philosophy"
            className="docs-component-card"
            style={{ padding: '2rem', height: 'auto' }}
          >
            <div
              className="docs-feature-icon"
              style={{ marginBottom: '1rem', fontSize: '2rem' }}
            >
              🤖
            </div>
            <div
              className="docs-feature-title"
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--ui-color-text)',
                marginBottom: '0.5rem',
              }}
            >
              Core Philosophy
            </div>
            <div
              className="docs-feature-desc"
              style={{ color: 'var(--ui-color-text-muted)' }}
            >
              Read about the AI-first design approach, predictability, and
              signals in the core philosophy.
            </div>
          </Link>

          <Link
            to="/design-principles"
            className="docs-component-card"
            style={{ padding: '2rem', height: 'auto' }}
          >
            <div
              className="docs-feature-icon"
              style={{ marginBottom: '1rem', fontSize: '2rem' }}
            >
              📐
            </div>
            <div
              className="docs-feature-title"
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--ui-color-text)',
                marginBottom: '0.5rem',
              }}
            >
              Design Principles
            </div>
            <div
              className="docs-feature-desc"
              style={{ color: 'var(--ui-color-text-muted)' }}
            >
              Explore the rules of physical authenticity, purposeful motion, and
              accessibility by default.
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
