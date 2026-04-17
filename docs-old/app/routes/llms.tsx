import React, { useState } from 'react';
import type { Lang } from '../shared/code-block';
import { createFileRoute } from '@tanstack/react-router';
import { CodeBlock } from '../shared/code-block';

export const Route = createFileRoute('/llms')({
  component: LlmsPage,
});

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
    <div style={{
      background: 'var(--ui-color-surface-raised)',
      borderRadius: 'var(--ui-radius-md)',
      padding: '1.1rem 1.25rem',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '1.25rem',
      flexWrap: 'wrap',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.92rem', color: 'var(--ui-color-primary)' }}>
            {filename}
          </span>
          <span style={{
            fontFamily: 'monospace',
            fontSize: '0.65rem',
            fontWeight: 600,
            color: 'var(--docs-secondary, #89ceff)',
            background: 'rgba(137,206,255,0.08)',
            padding: '0.1rem 0.35rem',
            borderRadius: '3px',
          }}>
            {size}
          </span>
        </div>
        <p style={{ margin: '0 0 0.4rem', fontSize: '0.82rem', color: 'var(--ui-color-text-muted)', lineHeight: '1.6' }}>
          {description}
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '0.75rem',
            color: 'var(--ui-color-text-muted)',
            textDecoration: 'none',
            fontFamily: 'monospace',
            opacity: 0.7,
          }}
        >
          {url}
        </a>
      </div>
      <button
        onClick={copy}
        style={{
          flexShrink: 0,
          padding: '0.3rem 0.75rem',
          border: 'none',
          borderRadius: 'var(--ui-radius-sm)',
          background: copied
            ? 'rgba(68,218,218,0.15)'
            : 'linear-gradient(135deg, var(--ui-color-primary) 0%, var(--docs-secondary, #89ceff) 100%)',
          color: copied ? 'var(--ui-color-primary)' : '#09141d',
          fontSize: '0.72rem',
          fontWeight: 700,
          fontFamily: 'monospace',
          cursor: 'pointer',
          transition: 'opacity 0.15s',
          whiteSpace: 'nowrap',
        }}
      >
        {copied ? '✓ copied' : 'copy url'}
      </button>
    </div>
  );
}

function StepBadge({ n }: { n: number }) {
  return (
    <span style={{
      fontFamily: 'monospace',
      fontSize: '0.62rem',
      fontWeight: '700',
      color: 'var(--ui-color-primary)',
      background: 'rgba(68,218,218,0.1)',
      padding: '0.1rem 0.4rem',
      borderRadius: '3px',
      letterSpacing: '0.04em',
      flexShrink: 0,
    }}>
      {String(n).padStart(2, '0')}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: '0.95rem', fontWeight: '700', letterSpacing: '-0.02em', margin: '0 0 1rem', color: 'var(--ui-color-text)' }}>
      {children}
    </h2>
  );
}

function LlmsPage() {
  return (
    <div className="docs-inline-page">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '800',
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            margin: 0,
            background: 'linear-gradient(135deg, var(--ui-color-primary) 0%, var(--docs-secondary, #89ceff) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            llms.txt
          </h1>
          <span style={{
            fontFamily: 'monospace',
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            background: 'rgba(68,218,218,0.1)',
            color: 'var(--ui-color-primary)',
            padding: '0.15rem 0.5rem',
            borderRadius: '3px',
          }}>
            Standard
          </span>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--ui-color-text-muted)', margin: 0, maxWidth: '520px', lineHeight: '1.65' }}>
          Machine-readable API reference you can paste directly into any LLM context window.
        </p>
      </div>

      {/* What is llms.txt */}
      <div style={{ marginBottom: '2.5rem' }}>
        <SectionTitle>What is llms.txt?</SectionTitle>
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: 'var(--ui-color-text-muted)', lineHeight: '1.65' }}>
          <code style={{ fontFamily: 'monospace', color: 'var(--ui-color-primary)' }}>llms.txt</code> is a proposed open standard — analogous to <code style={{ fontFamily: 'monospace' }}>robots.txt</code> — for helping LLMs understand a project. It lives at the root of a site, uses plain Markdown, and provides a short structured index with links to deeper content.
        </p>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ui-color-text-muted)', lineHeight: '1.65' }}>
          Atelier UI provides two files: a short index (<code style={{ fontFamily: 'monospace' }}>llms.txt</code>) and a comprehensive reference (<code style={{ fontFamily: 'monospace' }}>llms-full.txt</code>) containing every component's props, types, defaults, and framework-specific usage examples across Angular, React, and Vue.
        </p>
      </div>

      {/* The files */}
      <div style={{ marginBottom: '2.5rem' }}>
        <SectionTitle>The Files</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <FileCard
            filename="llms.txt"
            url="https://atelier.pieper.io/llms.txt"
            description="Short index: component list with one-line prop summaries and links to docs. Use this when your context window is limited or you just need component names and key props."
            size="~2 KB"
          />
          <FileCard
            filename="llms-full.txt"
            url="https://atelier.pieper.io/llms-full.txt"
            description="Full reference: every component with all props (name, type, default, description), framework-specific usage examples for Angular, React and Vue, design token system, and accessibility notes."
            size="~12 KB"
          />
        </div>
      </div>

      {/* How to use */}
      <div style={{ marginBottom: '2.5rem' }}>
        <SectionTitle>How to Use It</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {[
            {
              n: 1,
              title: 'Paste into your LLM context',
              desc: <>Copy the URL of <code style={{ fontFamily: 'monospace', color: 'var(--ui-color-primary)' }}>llms-full.txt</code> and ask your LLM to fetch it, or paste the file contents directly. The file is plain text optimised for token efficiency — no HTML, no markup noise.</>,
              code: { lang: 'markdown' as Lang, src: `Here is the full API reference for the Atelier UI component library:\n\n<paste contents of llms-full.txt here>\n\nUsing this library, build a settings page with a card containing\nname (Input), email (Input), and notification preference (Toggle).` },
            },
            {
              n: 2,
              title: 'Reference via MCP',
              desc: 'The Atelier UI MCP server provides structured access to component docs so your LLM can look up components on demand without consuming your entire context window upfront.',
              code: { lang: 'json' as Lang, src: `{\n  "mcpServers": {\n    "atelier-ui": {\n      "url": "https://atelier.pieper.io/storybook-angular/mcp"\n    }\n  }\n}` },
            },
            {
              n: 3,
              title: 'Add to CLAUDE.md or .cursorrules',
              desc: <>For persistent project-level context, reference <code style={{ fontFamily: 'monospace' }}>llms.txt</code> from your project's AI instructions file so every session starts with component awareness.</>,
              code: { lang: 'markdown' as Lang, src: `# UI Components\n\nThis project uses Atelier UI. Full API reference:\nhttps://atelier.pieper.io/llms-full.txt\n\nKey import pattern:\nimport { LlmButton, LlmInput, LlmCard } from '@atelier-ui/react';` },
            },
          ].map(({ n, title, desc, code }) => (
            <div key={n} style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
              <div style={{ marginTop: '2px' }}><StepBadge n={n} /></div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 0.4rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--ui-color-text)' }}>{title}</h3>
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: 'var(--ui-color-text-muted)', lineHeight: '1.6' }}>{desc}</p>
                <CodeBlock lang={code.lang} code={code.src} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why plain text */}
      <div style={{ marginBottom: '2.5rem' }}>
        <SectionTitle>Why Plain Text?</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
          {[
            { title: 'Token efficient', body: 'No HTML tags, no surrounding markup. Every token carries signal.' },
            { title: 'Framework-neutral', body: 'One file covers Angular, React, and Vue side by side for easy comparison.' },
            { title: 'Always fresh', body: 'Generated from source — reflects the current release, not outdated docs.' },
            { title: 'Cacheable', body: 'LLM tools can cache the file across sessions. Fetch once, reference many times.' },
          ].map(({ title, body }) => (
            <div key={title} style={{ padding: '0.9rem 1rem', background: 'var(--ui-color-surface-raised)', borderRadius: 'var(--ui-radius-md)' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.35rem', fontSize: '0.85rem', color: 'var(--ui-color-text)' }}>{title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--ui-color-text-muted)', lineHeight: '1.6' }}>{body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div>
        <SectionTitle>Preview</SectionTitle>
        <p style={{ margin: '0 0 0.85rem', fontSize: '0.82rem', color: 'var(--ui-color-text-muted)', lineHeight: '1.6' }}>
          A snapshot of what an LLM sees when you share the reference file:
        </p>
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
