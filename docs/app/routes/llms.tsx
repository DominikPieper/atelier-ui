import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { CodeBlock } from '../shared/code-block';

export const Route = createFileRoute('/llms')({
  component: LlmsPage,
});

const muted: React.CSSProperties = {
  lineHeight: '1.65',
  color: 'var(--ui-color-text-muted)',
};

const tag: React.CSSProperties = {
  display: 'inline-block',
  padding: '0.15rem 0.5rem',
  borderRadius: 'var(--ui-radius-sm)',
  fontSize: '0.72rem',
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  background: 'var(--ui-color-primary-light)',
  color: 'var(--ui-color-primary)',
  verticalAlign: 'middle',
};

function FileCard({
  filename,
  url,
  description,
  size,
}: {
  filename: string;
  url: string;
  description: string;
  size: string;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div
      style={{
        border: '1px solid var(--ui-color-border)',
        borderRadius: 'var(--ui-radius-md)',
        padding: '1.25rem 1.5rem',
        background: 'var(--ui-color-surface-raised)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '1.5rem',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <span style={{ fontFamily: 'var(--ui-font-mono, monospace)', fontWeight: 600, fontSize: '0.95rem' }}>
            {filename}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--ui-color-text-muted)' }}>{size}</span>
        </div>
        <p style={{ margin: 0, fontSize: '0.875rem', ...muted }}>{description}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            marginTop: '0.5rem',
            fontSize: '0.8rem',
            color: 'var(--ui-color-primary)',
            textDecoration: 'none',
            fontFamily: 'var(--ui-font-mono, monospace)',
          }}
        >
          {url}
        </a>
      </div>
      <button
        onClick={copy}
        style={{
          flexShrink: 0,
          padding: '0.4rem 0.9rem',
          border: '1px solid var(--ui-color-border)',
          borderRadius: 'var(--ui-radius-sm)',
          background: copied ? 'var(--ui-color-primary-light)' : 'var(--ui-color-background)',
          color: copied ? 'var(--ui-color-primary)' : 'var(--ui-color-text-muted)',
          fontSize: '0.8rem',
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'background 0.15s, color 0.15s',
          whiteSpace: 'nowrap',
        }}
      >
        {copied ? '✓ Copied' : 'Copy URL'}
      </button>
    </div>
  );
}

function StepBadge({ n }: { n: number }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '1.4rem',
        height: '1.4rem',
        borderRadius: '50%',
        background: 'var(--ui-color-primary)',
        color: '#fff',
        fontSize: '0.75rem',
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {n}
    </span>
  );
}

function LlmsPage() {
  return (
    <div className="docs-page" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div className="docs-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <h1 className="docs-page-title" style={{ margin: 0 }}>llms.txt</h1>
          <span style={tag}>Standard</span>
        </div>
        <p className="docs-page-description" style={{ marginBottom: 0 }}>
          Machine-readable API reference you can paste directly into any LLM context window.
        </p>
      </div>

      {/* What is llms.txt */}
      <div className="docs-section">
        <h2 className="docs-section-title">What is llms.txt?</h2>
        <p style={muted}>
          <code>llms.txt</code> is a proposed open standard — analogous to <code>robots.txt</code> — for
          helping LLMs understand a project. It lives at the root of a site, uses plain Markdown, and
          provides a short structured index with links to deeper content.
        </p>
        <p style={muted}>
          Atelier UI provides two files: a short index (<code>llms.txt</code>) and a comprehensive
          reference (<code>llms-full.txt</code>) containing every component's props, types, defaults,
          and framework-specific usage examples across Angular, React, and Vue.
        </p>
      </div>

      {/* The files */}
      <div className="docs-section">
        <h2 className="docs-section-title">The Files</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <FileCard
            filename="llms.txt"
            url="https://atelier-ui.netlify.app/llms.txt"
            description="Short index: component list with one-line prop summaries and links to docs. Use this when your context window is limited or you just need component names and key props."
            size="~2 KB"
          />
          <FileCard
            filename="llms-full.txt"
            url="https://atelier-ui.netlify.app/llms-full.txt"
            description="Full reference: every component with all props (name, type, default, description), framework-specific usage examples for Angular, React and Vue, design token system, and accessibility notes."
            size="~12 KB"
          />
        </div>
      </div>

      {/* How to use */}
      <div className="docs-section">
        <h2 className="docs-section-title">How to Use It</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <StepBadge n={1} />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Paste into your LLM context</h3>
            </div>
            <p style={{ ...muted, marginLeft: '2rem' }}>
              Copy the URL of <code>llms-full.txt</code> and ask your LLM to fetch it, or paste the
              file contents directly. The file is plain text optimised for token efficiency — no HTML,
              no markup noise.
            </p>
            <div style={{ marginLeft: '2rem' }}>
              <CodeBlock
                lang="markdown"
                code={`Here is the full API reference for the Atelier UI component library:

<paste contents of llms-full.txt here>

Using this library, build a settings page with a card containing
name (Input), email (Input), and notification preference (Toggle).`}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <StepBadge n={2} />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Reference via MCP</h3>
            </div>
            <p style={{ ...muted, marginLeft: '2rem' }}>
              The Atelier UI MCP server provides structured access to component docs so your LLM
              can look up components on demand without consuming your entire context window upfront.
            </p>
            <div style={{ marginLeft: '2rem' }}>
              <CodeBlock
                lang="json"
                code={`{
  "mcpServers": {
    "atelier-ui": {
      "url": "https://atelier-ui.netlify.app/storybook-angular/mcp"
    }
  }
}`}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <StepBadge n={3} />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Add to CLAUDE.md or .cursorrules</h3>
            </div>
            <p style={{ ...muted, marginLeft: '2rem' }}>
              For persistent project-level context, reference <code>llms.txt</code> from your
              project's AI instructions file so every session starts with component awareness.
            </p>
            <div style={{ marginLeft: '2rem' }}>
              <CodeBlock
                lang="markdown"
                code={`# UI Components

This project uses Atelier UI. Full API reference:
https://atelier-ui.netlify.app/llms-full.txt

Key import pattern:
import { LlmButton, LlmInput, LlmCard } from '@atelier-ui/react';`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Why plain text */}
      <div className="docs-section">
        <h2 className="docs-section-title">Why Plain Text?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {[
            {
              title: 'Token efficient',
              body: 'No HTML tags, no surrounding markup. Every token carries signal.',
            },
            {
              title: 'Framework-neutral',
              body: 'One file covers Angular, React, and Vue side by side for easy comparison.',
            },
            {
              title: 'Always fresh',
              body: 'The file is generated from source — it reflects the current release, not outdated docs.',
            },
            {
              title: 'Cacheable',
              body: 'LLM tools can cache the file across sessions. Fetch once, reference many times.',
            },
          ].map(({ title, body }) => (
            <div
              key={title}
              style={{
                padding: '1rem',
                border: '1px solid var(--ui-color-border)',
                borderRadius: 'var(--ui-radius-md)',
                background: 'var(--ui-color-surface-raised)',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>{title}</div>
              <div style={{ fontSize: '0.85rem', ...muted }}>{body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="docs-section">
        <h2 className="docs-section-title">Preview</h2>
        <p style={muted}>A snapshot of what an LLM sees when you share the reference file:</p>
        <CodeBlock
          lang="markdown"
          code={`# Atelier UI — Full API Reference

> Complete component API for LLM consumption. 24 accessible components
> for Angular, React, and Vue with consistent prop naming.

---

### LlmButton

  Props:
    variant   'primary' | 'secondary' | 'outline'   'primary'   Visual style
    size      'sm' | 'md' | 'lg'                     'md'        Size
    disabled  boolean                                 false       Prevents interaction
    loading   boolean                                 false       Shows spinner

  Angular:  <llm-button variant="primary" [loading]="isSaving">Save</llm-button>
  React:    <LlmButton variant="primary" loading={isSaving}>Save</LlmButton>
  Vue:      <LlmButton variant="primary" :loading="isSaving">Save</LlmButton>

---

### LlmCombobox

  Props:
    value        string               ''    Selected option value
    options      LlmComboboxOption[]  []    Array of {value, label, disabled?}
    placeholder  string               ''    Input placeholder
    disabled     boolean              false Disables the combobox
    invalid      boolean              false Error styling

  React:
    const options = [
      { value: 'us', label: 'United States' },
      { value: 'ca', label: 'Canada' },
    ];
    <LlmCombobox value={country} onValueChange={setCountry}
      options={options} placeholder="Search..." />

...and 22 more components`}
        />
      </div>
    </div>
  );
}
