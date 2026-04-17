import { useState } from 'react';

const SITE_URL = 'https://atelier.pieper.io';

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <div className="docs-code-block">
      <div className="docs-code-block-header">
        <span className="docs-code-block-lang">{lang}</span>
        <button className="docs-code-block-copy" onClick={copy}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  );
}

function FileCard({ filename, url, description, size }: { filename: string; url: string; description: string; size: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div style={{
      background: 'var(--ui-color-surface-raised)', borderRadius: 'var(--ui-radius-md)',
      padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'flex-start',
      justifyContent: 'space-between', gap: '1.25rem', flexWrap: 'wrap',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.92rem', color: 'var(--ui-color-primary)' }}>
            {filename}
          </span>
          <span style={{
            fontFamily: 'monospace', fontSize: '0.65rem', fontWeight: 600,
            color: 'var(--docs-secondary, #89ceff)', background: 'rgba(137,206,255,0.08)',
            padding: '0.1rem 0.35rem', borderRadius: '3px',
          }}>{size}</span>
        </div>
        <p style={{ margin: '0 0 0.4rem', fontSize: '0.82rem', color: 'var(--ui-color-text-muted)', lineHeight: '1.6' }}>
          {description}
        </p>
        <a href={url} target="_blank" rel="noopener noreferrer" style={{
          fontSize: '0.75rem', color: 'var(--ui-color-text-muted)',
          textDecoration: 'none', fontFamily: 'monospace', opacity: 0.7,
        }}>{url}</a>
      </div>
      <button onClick={copy} style={{
        flexShrink: 0, padding: '0.3rem 0.75rem', border: 'none',
        borderRadius: 'var(--ui-radius-sm)',
        background: copied
          ? 'rgba(68,218,218,0.15)'
          : 'linear-gradient(135deg, var(--ui-color-primary) 0%, var(--docs-secondary, #89ceff) 100%)',
        color: copied ? 'var(--ui-color-primary)' : '#09141d',
        fontSize: '0.72rem', fontWeight: 700, fontFamily: 'monospace', cursor: 'pointer', whiteSpace: 'nowrap',
      }}>
        {copied ? '✓ copied' : 'copy url'}
      </button>
    </div>
  );
}

export default function LlmsPage() {
  return (
    <div className="docs-inline-page">
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
          <h1 style={{
            fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.04em', lineHeight: 1.1, margin: 0,
            background: 'linear-gradient(135deg, var(--ui-color-primary) 0%, var(--docs-secondary, #89ceff) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>llms.txt</h1>
          <span style={{
            fontFamily: 'monospace', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', background: 'rgba(68,218,218,0.1)', color: 'var(--ui-color-primary)',
            padding: '0.15rem 0.5rem', borderRadius: '3px',
          }}>Standard</span>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--ui-color-text-muted)', margin: 0, maxWidth: '520px', lineHeight: '1.65' }}>
          Machine-readable API reference you can paste directly into any LLM context window.
        </p>
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 1rem', color: 'var(--ui-color-text)' }}>
          What is llms.txt?
        </h2>
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: 'var(--ui-color-text-muted)', lineHeight: '1.65' }}>
          <code style={{ fontFamily: 'monospace', color: 'var(--ui-color-primary)' }}>llms.txt</code> is a proposed open standard — analogous to <code style={{ fontFamily: 'monospace' }}>robots.txt</code> — for helping LLMs understand a project. It lives at the root of a site, uses plain Markdown, and provides a short structured index with links to deeper content.
        </p>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ui-color-text-muted)', lineHeight: '1.65' }}>
          Atelier UI provides two files: a short index (<code style={{ fontFamily: 'monospace' }}>llms.txt</code>) and a comprehensive reference (<code style={{ fontFamily: 'monospace' }}>llms-full.txt</code>) containing every component's props, types, defaults, and framework-specific usage examples across Angular, React, and Vue.
        </p>
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 1rem', color: 'var(--ui-color-text)' }}>
          The Files
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <FileCard
            filename="llms.txt"
            url={`${SITE_URL}/llms.txt`}
            description="Short index: component list with one-line prop summaries and links to docs. Use this when your context window is limited or you just need component names and key props."
            size="~2 KB"
          />
          <FileCard
            filename="llms-full.txt"
            url={`${SITE_URL}/llms-full.txt`}
            description="Full reference: every component with all props (name, type, default, description), framework-specific usage examples for Angular, React and Vue, design token system, and accessibility notes."
            size="~12 KB"
          />
        </div>
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 1rem', color: 'var(--ui-color-text)' }}>
          How to Use It
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {[
            {
              n: 1,
              title: 'Paste into your LLM context',
              desc: `Copy the URL of llms-full.txt and ask your LLM to fetch it, or paste the file contents directly. The file is plain text optimised for token efficiency — no HTML, no markup noise.`,
              code: `Here is the full API reference for the Atelier UI component library:\n\n<paste contents of llms-full.txt here>\n\nUsing this library, build a settings page with a card containing\nname (Input), email (Input), and notification preference (Toggle).`,
              lang: 'markdown',
            },
            {
              n: 2,
              title: 'Reference via MCP',
              desc: 'The Atelier UI MCP server provides structured access to component docs so your LLM can look up components on demand without consuming your entire context window upfront.',
              code: `{\n  "mcpServers": {\n    "atelier-ui": {\n      "url": "${SITE_URL}/storybook-angular/mcp"\n    }\n  }\n}`,
              lang: 'json',
            },
            {
              n: 3,
              title: 'Add to CLAUDE.md or .cursorrules',
              desc: `For persistent project-level context, reference llms.txt from your project's AI instructions file so every session starts with component awareness.`,
              code: `# UI Components\n\nThis project uses Atelier UI. Full API reference:\n${SITE_URL}/llms-full.txt\n\nKey import pattern:\nimport { LlmButton, LlmInput, LlmCard } from '@atelier-ui/react';`,
              lang: 'markdown',
            },
          ].map(({ n, title, desc, code, lang }) => (
            <div key={n} style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
              <div style={{ marginTop: '2px' }}>
                <span style={{
                  fontFamily: 'monospace', fontSize: '0.62rem', fontWeight: 700,
                  color: 'var(--ui-color-primary)', background: 'rgba(68,218,218,0.1)',
                  padding: '0.1rem 0.4rem', borderRadius: '3px', letterSpacing: '0.04em', flexShrink: 0,
                }}>
                  {String(n).padStart(2, '0')}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 0.4rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--ui-color-text)' }}>{title}</h3>
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: 'var(--ui-color-text-muted)', lineHeight: '1.6' }}>{desc}</p>
                <CodeBlock lang={lang} code={code} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 1rem', color: 'var(--ui-color-text)' }}>
          Why Plain Text?
        </h2>
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

      <div>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 0.85rem', color: 'var(--ui-color-text)' }}>Preview</h2>
        <p style={{ margin: '0 0 0.85rem', fontSize: '0.82rem', color: 'var(--ui-color-text-muted)', lineHeight: '1.6' }}>
          A snapshot of what an LLM sees when you share the reference file:
        </p>
        <CodeBlock lang="markdown" code={`# Atelier UI — Full API Reference\n\n> Complete component API for LLM consumption. 24 accessible components\n> for Angular, React, and Vue with consistent prop naming.\n\n---\n\n### LlmButton\n\n  Props:\n    variant   'primary' | 'secondary' | 'outline'   'primary'   Visual style\n    size      'sm' | 'md' | 'lg'                     'md'        Size\n    disabled  boolean                                 false       Prevents interaction\n    loading   boolean                                 false       Shows spinner\n\n  Angular:  <llm-button variant="primary" [loading]="isSaving">Save</llm-button>\n  React:    <LlmButton variant="primary" loading={isSaving}>Save</LlmButton>\n  Vue:      <LlmButton variant="primary" :loading="isSaving">Save</LlmButton>\n\n---\n\n### LlmCombobox\n\n  Props:\n    value        string               ''    Selected option value\n    options      LlmComboboxOption[]  []    Array of {value, label, disabled?}\n    placeholder  string               ''    Input placeholder\n    disabled     boolean              false Disables the combobox\n    invalid      boolean              false Error styling\n\n  React:\n    const options = [\n      { value: 'us', label: 'United States' },\n      { value: 'ca', label: 'Canada' },\n    ];\n    <LlmCombobox value={country} onValueChange={setCountry}\n      options={options} placeholder="Search..." />\n\n...and 22 more components`} />
      </div>
    </div>
  );
}
