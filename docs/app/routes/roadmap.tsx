import React from 'react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/roadmap')({
  component: RoadmapPage,
});

function RoadmapPage() {
  return (
    <div
      className="docs-page"
      style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}
    >
      <div className="docs-page-header">
        <h1 className="docs-page-title">Roadmap</h1>
        <p className="docs-page-description">
          Development phases and backlog for the LLM-Optimized UI Components.
        </p>
      </div>

      <div className="docs-section">
        <h2 className="docs-section-title">Current Status</h2>
        <ul
          style={{
            paddingLeft: '1.5rem',
            marginBottom: '1.5rem',
            color: 'var(--ui-color-text-muted)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <li>✅ Nx Workspace structure</li>
          <li>✅ Angular 21, Vite, Vitest configuration</li>
          <li>✅ Storybook 10 configuration</li>
          <li>✅ Global Design Tokens & Visual Design Refresh</li>
          <li>
            ✅ Core Components (Button, Card, Badge, Input, Checkbox, Radio,
            Dialog, Tabs, Menu, Tooltip)
          </li>
        </ul>
      </div>

      <div className="docs-section">
        <h2 className="docs-section-title">Phase 5: Publishing & Tooling</h2>
        <p
          style={{
            lineHeight: '1.6',
            marginBottom: '1rem',
            color: 'var(--ui-color-text-muted)',
          }}
        >
          <em>Focus: Make the library consumable and self-documenting.</em>
        </p>
        <ul
          style={{
            paddingLeft: '1.5rem',
            marginBottom: '1.5rem',
            color: 'var(--ui-color-text-muted)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <li>
            <strong>Composition cookbook</strong>: Pre-composed patterns as
            Storybook stories and LLM context snippets.
          </li>
          <li>
            <strong>Auto-generated API reference</strong>: Script that produces
            the CLAUDE.md Component API Reference from types.
          </li>
          <li>
            <strong>npm packaging</strong>: Versioning strategy and publish
            pipeline.
          </li>
          <li>
            <strong>Demo app</strong>: Standalone app showcasing components and
            composition patterns.
          </li>
        </ul>
      </div>

      <div className="docs-section">
        <h2 className="docs-section-title">
          Backlog: CDK Refactoring (Angular)
        </h2>
        <p
          style={{
            lineHeight: '1.6',
            marginBottom: '1rem',
            color: 'var(--ui-color-text-muted)',
          }}
        >
          <code>@angular/cdk</code> is installed but unused in some places.
          Refactoring to CDK will reduce code, improve accessibility, and lower
          maintenance.
        </p>
        <ul
          style={{
            paddingLeft: '1.5rem',
            marginBottom: '1.5rem',
            color: 'var(--ui-color-text-muted)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <li>
            <strong>Select:</strong> Use <code>ActiveDescendantKeyManager</code>
            .
          </li>
          <li>
            <strong>Dialog:</strong> Use <code>cdkTrapFocus</code>.
          </li>
          <li>
            <strong>Accordion:</strong> Use <code>CdkAccordion</code>.
          </li>
        </ul>
      </div>
    </div>
  );
}
