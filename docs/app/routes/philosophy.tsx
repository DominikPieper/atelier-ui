import React from 'react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/philosophy')({
  component: PhilosophyPage,
});

function PhilosophyPage() {
  return (
    <div
      className="docs-page"
      style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}
    >
      <div className="docs-page-header">
        <h1 className="docs-page-title">Core Philosophy</h1>
        <p className="docs-page-description">
          LLM-Optimized Angular & React UI Component Library Design Guide.
        </p>
      </div>

      <div className="docs-section">
        <h2 className="docs-section-title">Design Philosophy</h2>
        <p
          style={{
            lineHeight: '1.6',
            marginBottom: '1rem',
            color: 'var(--ui-color-text-muted)',
          }}
        >
          Traditional component libraries are designed for humans browsing docs,
          copying examples, and tweaking. An LLM-optimized library flips the
          priorities: the LLM needs to{' '}
          <strong>infer correct usage from minimal context</strong> and
          <strong>produce working code on the first attempt</strong> without
          browsing a docs site.
        </p>
        <p
          style={{
            lineHeight: '1.6',
            marginBottom: '1.5rem',
            color: 'var(--ui-color-text-muted)',
          }}
        >
          Design for a developer who has perfect pattern recognition but zero
          ability to look things up at generation time. Everything must be
          inferrable from types, conventions, and a small context document.
        </p>
      </div>

      <div className="docs-section">
        <h2 className="docs-section-title">
          1. Maximally Predictable API Surface
        </h2>
        <p
          style={{
            lineHeight: '1.6',
            marginBottom: '1rem',
            color: 'var(--ui-color-text-muted)',
          }}
        >
          Every component must follow identical patterns. If a Button takes{' '}
          <code>variant</code>, <code>size</code>, and <code>disabled</code>,
          then Cards, Alerts, and Badges must use the same property names for
          the same concepts.
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
            Use the same input name for the same concept across all components.
          </li>
          <li>
            Use string literal union types everywhere — never enums, never
            numeric codes.
          </li>
          <li>
            Provide sensible defaults for every input so bare usage always
            works.
          </li>
        </ul>
      </div>

      <div className="docs-section">
        <h2 className="docs-section-title">
          2. Signals as the Single Reactivity Model (Angular)
        </h2>
        <p
          style={{
            lineHeight: '1.6',
            marginBottom: '1rem',
            color: 'var(--ui-color-text-muted)',
          }}
        >
          Use Angular 21 signal primitives exclusively. No <code>@Input()</code>{' '}
          / <code>@Output()</code> decorators. One mental model means one
          pattern for the LLM to follow.
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
            <code>input()</code> for all inputs.
          </li>
          <li>
            <code>output()</code> for all event outputs.
          </li>
          <li>
            <code>model()</code> for two-way bound state.
          </li>
        </ul>
      </div>

      <div className="docs-section">
        <h2 className="docs-section-title">
          3. Self-Describing Components via Types
        </h2>
        <p
          style={{
            lineHeight: '1.6',
            marginBottom: '1rem',
            color: 'var(--ui-color-text-muted)',
          }}
        >
          The LLM reads type signatures, not docs sites. Types must do the heavy
          lifting.
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
            Use narrow literal union types instead of <code>string</code> or{' '}
            <code>number</code>.
          </li>
          <li>
            Use flat inputs with defaults instead of config objects with
            optional fields.
          </li>
          <li>
            Every public member must be understandable from its type signature
            alone.
          </li>
        </ul>
      </div>

      <div className="docs-section">
        <h2 className="docs-section-title">
          4. Composition over Configuration
        </h2>
        <p
          style={{
            lineHeight: '1.6',
            marginBottom: '1rem',
            color: 'var(--ui-color-text-muted)',
          }}
        >
          Prefer content projection (Angular) or <code>children</code> props
          (React) over config objects. LLMs are better at composing templates
          than constructing complex configuration shapes.
        </p>
      </div>

      <div className="docs-section">
        <h2 className="docs-section-title">
          5. Styling: CSS Custom Properties
        </h2>
        <p
          style={{
            lineHeight: '1.6',
            marginBottom: '1rem',
            color: 'var(--ui-color-text-muted)',
          }}
        >
          Components consume a design token layer internally. Users (human or
          LLM) don't think about styling — they pick a <code>variant</code> and
          the tokens handle the rest. All visual decisions are driven by CSS
          custom properties (design tokens).
        </p>
      </div>
    </div>
  );
}
