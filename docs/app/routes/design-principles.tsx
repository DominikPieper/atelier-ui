import React from 'react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/design-principles')({
  component: DesignPrinciplesPage,
});

function DesignPrinciplesPage() {
  return (
    <div
      className="docs-page"
      style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}
    >
      <div className="docs-page-header">
        <h1 className="docs-page-title">Design Principles</h1>
        <p className="docs-page-description">
          The foundational UX and visual design rules for Atelier components.
        </p>
      </div>

      <div className="docs-section">
        <h2 className="docs-section-title">1. Physical Authenticity</h2>
        <p
          style={{
            lineHeight: '1.6',
            marginBottom: '1rem',
            color: 'var(--ui-color-text-muted)',
          }}
        >
          Interactive elements behave as if in physical space. Hover = lift
          (translateY + shadow increase). Active/press = compress (scale down).
          Disabled = faded/unreachable.
          <br />
          <br />
          <strong>Rule:</strong> Use <code>scale(0.97)</code> for active states.
          Pair shadow changes with transforms.
        </p>
      </div>

      <div className="docs-section">
        <h2 className="docs-section-title">2. Purposeful Motion</h2>
        <p
          style={{
            lineHeight: '1.6',
            marginBottom: '1rem',
            color: 'var(--ui-color-text-muted)',
          }}
        >
          Every animation serves exactly one purpose: (a) confirm action, (b)
          orient spatial relationship, or (c) smooth visual transition. No
          decorative animation.
          <br />
          <br />
          <strong>Rule:</strong> If you can't name the purpose, remove it.
        </p>
      </div>

      <div className="docs-section">
        <h2 className="docs-section-title">3. Consistent Timing Hierarchy</h2>
        <p
          style={{
            lineHeight: '1.6',
            marginBottom: '1rem',
            color: 'var(--ui-color-text-muted)',
          }}
        >
          Three tiers only: <code>fast</code> (150ms) for micro-interactions,{' '}
          <code>normal</code> (200ms) for state transitions,
          <code>slow</code> (300ms) for layout changes. No custom durations in
          components.
        </p>
      </div>

      <div className="docs-section">
        <h2 className="docs-section-title">4. Accessible by Default</h2>
        <p
          style={{
            lineHeight: '1.6',
            marginBottom: '1rem',
            color: 'var(--ui-color-text-muted)',
          }}
        >
          Focus meets WCAG 2.4.13. Animations respect{' '}
          <code>prefers-reduced-motion</code>. All states distinguishable
          without color alone. <code>:focus-visible</code> for buttons/links,{' '}
          <code>:focus</code> for form inputs.
          <br />
          <br />
          <strong>Rule:</strong> Global <code>prefers-reduced-motion</code>{' '}
          override zeroes all duration tokens.
        </p>
      </div>

      <div className="docs-section">
        <h2 className="docs-section-title">5. Surface Hierarchy = Depth</h2>
        <p
          style={{
            lineHeight: '1.6',
            marginBottom: '1rem',
            color: 'var(--ui-color-text-muted)',
          }}
        >
          Three layers: sunken (inputs), surface (default), raised
          (cards/dropdowns). Each has distinct background + shadow. Dark mode:
          raised = lighter (closer to light source).
        </p>
      </div>

      <div className="docs-section">
        <h2 className="docs-section-title">6. Typography Creates Rhythm</h2>
        <p
          style={{
            lineHeight: '1.6',
            marginBottom: '1rem',
            color: 'var(--ui-color-text-muted)',
          }}
        >
          Headings: tight letter-spacing (-0.01em). Body: neutral (0). Small
          text: slightly open (0.01em). Larger heading sizes (xl, 2xl) for
          dialogs and cards.
        </p>
      </div>

      <div className="docs-section">
        <h2 className="docs-section-title">7. Dark Mode is First-Class</h2>
        <p
          style={{
            lineHeight: '1.6',
            marginBottom: '1rem',
            color: 'var(--ui-color-text-muted)',
          }}
        >
          No hardcoded <code>#fff</code> or <code>#000</code> in component CSS.
          Every color goes through tokens.
          <code>color-mix()</code> targets must use token-based colors, not{' '}
          <code>#000</code>.
        </p>
      </div>

      <div className="docs-section">
        <h2 className="docs-section-title">
          8. Disabled = Unreachable, Not Hidden
        </h2>
        <p
          style={{
            lineHeight: '1.6',
            marginBottom: '1rem',
            color: 'var(--ui-color-text-muted)',
          }}
        >
          Consistent{' '}
          <code>
            opacity: var(--ui-opacity-disabled); cursor: not-allowed;
            pointer-events: none
          </code>
          across all components. One token, one value.
        </p>
      </div>
    </div>
  );
}
