import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { CodeBlock, type Lang } from '../shared/code-block';

export const Route = createFileRoute('/design-principles')({
  component: DesignPrinciplesPage,
});

const muted: React.CSSProperties = {
  lineHeight: '1.65',
  color: 'var(--ui-color-text-muted)',
};

function Rule({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      gap: '0.6rem',
      padding: '0.5rem 0.75rem',
      background: 'rgba(0,190,190,0.04)',
      border: '1px solid rgba(0,190,190,0.15)',
      borderRadius: 'var(--ui-radius-sm)',
      fontSize: '0.82rem',
      color: 'var(--ui-color-text-muted)',
      lineHeight: '1.5',
      marginTop: '0.75rem',
    }}>
      <span style={{ color: 'var(--ui-color-primary)', fontWeight: '700', flexShrink: 0 }}>Rule</span>
      <span>{children}</span>
    </div>
  );
}

function CodeCompare({ bad, good, lang = 'jsx' }: { bad: string; good: string; lang?: Lang }) {
  return (
    <div className="docs-comparison">
      <div className="docs-comparison-bad">
        <div className="docs-comparison-label">Unpredictable</div>
        <CodeBlock lang={lang} code={bad} />
      </div>
      <div className="docs-comparison-good">
        <div className="docs-comparison-label">LLM-optimized</div>
        <CodeBlock lang={lang} code={good} />
      </div>
    </div>
  );
}

function DesignPrinciplesPage() {
  return (
    <>
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
          LLM-Optimized API Design
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--ui-color-text-muted)', margin: 0, maxWidth: '520px', lineHeight: '1.65' }}>
          Why Atelier UI is structured the way it is — and what makes a component
          library easy for AI to use correctly on the first attempt.
        </p>
      </div>

      <p style={{ ...muted, marginBottom: '2rem' }}>
        Traditional component libraries are designed for humans who browse docs, copy examples,
        and tweak. An LLM-optimized library flips the priorities: the model needs to infer
        correct usage from minimal context and produce working code without looking anything up.
        These are the principles that make that possible.
      </p>

      {/* Principle 1 */}
      <div className="docs-section">
        <h2 className="docs-section-title">1. One name for one concept — everywhere</h2>
        <p style={muted}>
          If <code>LlmButton</code> takes a <code>variant</code> prop, then <code>LlmBadge</code>,{' '}
          <code>LlmAlert</code>, and <code>LlmCard</code> use <code>variant</code> too.
          If <code>size</code> controls scale on a button, it controls scale on every component
          that has scale. No synonyms, no renamings.
        </p>
        <p style={{ ...muted, marginTop: '0.75rem' }}>
          The model only needs to learn the pattern once. Every subsequent component is a variation
          on the same schema — so the inference cost is near zero and hallucination risk drops
          to near zero.
        </p>
        <CodeCompare
          bad={`// Three components, three different names
<Button kind="filled" scale="lg" />
<Badge type="success" />
<Alert level="warning" />`}
          good={`// One pattern, every component
<LlmButton variant="primary" size="lg" />
<LlmBadge variant="success" />
<LlmAlert variant="warning" />`}
        />
        <Rule>Every component with variants uses <code>variant</code>. Every component with sizes uses <code>size</code>. No exceptions.</Rule>
      </div>

      {/* Principle 2 */}
      <div className="docs-section">
        <h2 className="docs-section-title">2. Narrow literal types, not wide strings</h2>
        <p style={muted}>
          A prop typed as <code>string</code> gives the model nothing to work with. It has to guess
          valid values from context, documentation, or training data — all unreliable. A prop typed
          as <code>'primary' | 'secondary' | 'outline'</code> is self-documenting: the model reads
          the type and knows exactly what to write.
        </p>
        <CodeCompare
          lang="ts"
          bad={`// What values are valid here?
variant: string
size: string
position: string`}
          good={`// Self-documenting — no guessing needed
variant: 'primary' | 'secondary' | 'outline'
size: 'sm' | 'md' | 'lg'
position: 'top' | 'bottom' | 'left' | 'right'`}
        />
        <Rule>Use string literal union types everywhere. Never <code>string</code>, never numeric codes, never enums — they compile away and disappear from type information.</Rule>
      </div>

      {/* Principle 3 */}
      <div className="docs-section">
        <h2 className="docs-section-title">3. Sensible defaults so bare usage always works</h2>
        <p style={muted}>
          Every input has a default. <code>&lt;llm-button&gt;Click&lt;/llm-button&gt;</code> renders
          a correct, styled, accessible button without a single prop. This matters for AI output
          because the model can scaffold something working first and add customization in the next
          turn — instead of needing every prop correct on the first attempt.
        </p>
        <CodeCompare
          bad={`// Crashes or renders nothing without required props
<Button />
<Card type="?" padding="?">...</Card>`}
          good={`// Always works — customize only what you need
<llm-button>Click</llm-button>
<llm-card>Content</llm-card>`}
        />
        <Rule>Every prop must have a sensible default. Required props are only allowed when there is no reasonable default (e.g., a data array that must come from the consumer).</Rule>
      </div>

      {/* Principle 4 */}
      <div className="docs-section">
        <h2 className="docs-section-title">4. A single reactivity model per framework</h2>
        <p style={muted}>
          Mixing patterns forces the model to decide which approach to use — and it will sometimes
          guess wrong. Atelier UI picks one and uses it everywhere.
        </p>
        <ul style={{ ...muted, paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
          <li><strong>Angular:</strong> Signals only — <code>input()</code>, <code>output()</code>, <code>model()</code>. No legacy <code>@Input</code>/<code>@Output</code> decorators.</li>
          <li><strong>React:</strong> Props + callbacks. No class components, no legacy ref patterns.</li>
          <li><strong>Vue:</strong> Composition API + <code>defineProps</code>/<code>defineEmits</code>. No Options API.</li>
        </ul>
        <Rule>One mental model per framework. The model learns the pattern from the first component and applies it to every other one.</Rule>
      </div>

      {/* Principle 5 */}
      <div className="docs-section">
        <h2 className="docs-section-title">5. The MCP server closes the loop</h2>
        <p style={muted}>
          Even a perfectly designed API has details the model can't infer: exact default values,
          which props interact, what the output event payload looks like. The MCP server provides
          this at runtime — so the model queries it instead of guessing.
        </p>
        <p style={{ ...muted, marginTop: '0.75rem' }}>
          The five tools cover the full workflow: <code>list_components</code> for discovery,{' '}
          <code>search_components</code> for intent matching, <code>get_component_docs</code> for
          the full API, <code>get_stories</code> for usage patterns, and{' '}
          <code>get_theming_guide</code> for design token names. Together they mean the model never
          has to rely on training data for component-specific facts.
        </p>
        <Rule>The library design reduces guessing. The MCP server eliminates it.</Rule>
      </div>
    </>
  );
}
