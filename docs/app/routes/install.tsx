import React from 'react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/install')({
  component: InstallPage,
});

// ─── Syntax highlighter ───────────────────────────────────────────────────────
// Colours are taken from the existing .docs-demo-code palette used across the
// component docs pages so everything stays visually consistent.

type Token = { text: string; color?: string };

function tokenize(code: string, lang: 'ts' | 'shell' | 'css' | 'jsx'): Token[] {
  const tokens: Token[] = [];

  if (lang === 'shell') {
    // npm / command keyword  +  package name
    const m = code.match(/^(npm\s+install)\s+(.+)$/);
    if (m) {
      tokens.push({ text: m[1], color: '#7c3aed' }); // keyword
      tokens.push({ text: ' ' });
      tokens.push({ text: m[2], color: '#059669' }); // package
      return tokens;
    }
  }

  if (lang === 'css') {
    // @import 'path';
    const m = code.match(/^(@import)\s+(['"][^'"]+['"])(;?)$/);
    if (m) {
      tokens.push({ text: m[1], color: '#7c3aed' });
      tokens.push({ text: ' ' });
      tokens.push({ text: m[2], color: '#059669' });
      tokens.push({ text: m[3], color: '#cdd6f4' });
      return tokens;
    }
  }

  if (lang === 'jsx') {
    // Simple line-by-line JSX tokenizer
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) tokens.push({ text: '\n' });
      tokenizeJsxLine(lines[i], tokens);
    }
    return tokens;
  }

  if (lang === 'ts') {
    // Multi-line TypeScript import block
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) tokens.push({ text: '\n' });
      tokenizeTsLine(lines[i], tokens);
    }
    return tokens;
  }

  tokens.push({ text: code });
  return tokens;
}

function tokenizeTsLine(line: string, tokens: Token[]) {
  // import keyword
  let rest = line;
  const importMatch = rest.match(/^(import)\s*/);
  if (importMatch) {
    tokens.push({ text: 'import', color: '#7c3aed' });
    rest = rest.slice(importMatch[0].length);
  }

  // from keyword
  const fromIdx = rest.lastIndexOf(' from ');
  if (fromIdx !== -1) {
    const before = rest.slice(0, fromIdx);
    const after = rest.slice(fromIdx + 6); // after ' from '

    // brace section
    tokenizeBraces(before, tokens);

    tokens.push({ text: ' from ', color: '#7c3aed' });

    // string literal (possibly with trailing semicolon)
    const semiIdx = after.lastIndexOf(';');
    if (semiIdx !== -1) {
      tokens.push({ text: after.slice(0, semiIdx), color: '#059669' });
      tokens.push({ text: ';', color: '#6c7086' });
    } else {
      tokens.push({ text: after, color: '#059669' });
    }
    return;
  }

  tokens.push({ text: line, color: '#cdd6f4' });
}

function tokenizeBraces(segment: string, tokens: Token[]) {
  // segment looks like: "{ Foo, Bar,\n  Baz }"
  let i = 0;
  while (i < segment.length) {
    const ch = segment[i];
    if (ch === '{' || ch === '}' || ch === ',' || ch === '\n') {
      tokens.push({ text: ch, color: '#6c7086' });
      i++;
    } else if (ch === ' ') {
      tokens.push({ text: ch });
      i++;
    } else {
      // identifier
      let end = i;
      while (end < segment.length && !/[{},\s]/.test(segment[end])) end++;
      const word = segment.slice(i, end);
      tokens.push({ text: word, color: '#00bebe' }); // primary teal for component names
      i = end;
    }
  }
}

function tokenizeJsxLine(line: string, tokens: Token[]) {
  // handles:  <LlmFoo>...</LlmFoo>  or  <App />  plain text etc.
  let rest = line;
  while (rest.length) {
    if (rest[0] === '<') {
      // find closing >
      const closeIdx = rest.indexOf('>');
      const tag = closeIdx !== -1 ? rest.slice(0, closeIdx + 1) : rest;
      tokenizeJsxTag(tag, tokens);
      rest = closeIdx !== -1 ? rest.slice(closeIdx + 1) : '';
    } else {
      // plain text until next <
      const ltIdx = rest.indexOf('<');
      const text = ltIdx !== -1 ? rest.slice(0, ltIdx) : rest;
      tokens.push({ text, color: '#cdd6f4' });
      rest = ltIdx !== -1 ? rest.slice(ltIdx) : '';
    }
  }
}

function tokenizeJsxTag(tag: string, tokens: Token[]) {
  // tag is the full  <...>  including angle brackets
  tokens.push({ text: '<', color: '#6c7086' });
  const inner = tag.slice(1, tag.endsWith('/>') ? -2 : -1).trimEnd();
  const slash = tag.endsWith('/>') ? '/>' : '>';

  const spaceIdx = inner.indexOf(' ');
  const name = spaceIdx === -1 ? inner : inner.slice(0, spaceIdx);
  const attrs = spaceIdx === -1 ? '' : inner.slice(spaceIdx);

  const isClose = name.startsWith('/');
  if (isClose) {
    tokens.push({ text: '/', color: '#6c7086' });
    tokens.push({ text: name.slice(1), color: '#00bebe' });
  } else {
    tokens.push({ text: name, color: '#00bebe' });
  }

  if (attrs) tokens.push({ text: attrs, color: '#cdd6f4' });
  tokens.push({ text: slash, color: '#6c7086' });
}

function CodeBlock({ code, lang }: { code: string; lang: 'ts' | 'shell' | 'css' | 'jsx' }) {
  const tokens = tokenize(code.trim(), lang);
  return (
    <div className="docs-demo-code" style={{ borderRadius: '8px', marginBottom: '1rem' }}>
      <pre style={{ margin: 0, fontFamily: "'Menlo','Monaco','Courier New',monospace", fontSize: '0.8rem', lineHeight: 1.6, overflowX: 'auto' }}>
        {tokens.map((t, i) =>
          t.color ? (
            <span key={i} style={{ color: t.color }}>
              {t.text}
            </span>
          ) : (
            <span key={i} style={{ color: '#cdd6f4' }}>
              {t.text}
            </span>
          )
        )}
      </pre>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const mutedText: React.CSSProperties = {
  lineHeight: '1.6',
  marginBottom: '1rem',
  color: 'var(--ui-color-text-muted)',
};

const sectionHeadingStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  marginBottom: '1.25rem',
};

const logoStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  objectFit: 'contain',
  borderRadius: '6px',
};

const comingSoonBadge: React.CSSProperties = {
  display: 'inline-block',
  background: 'var(--ui-color-surface-raised)',
  border: '1px solid var(--ui-color-border)',
  borderRadius: 'var(--ui-radius-sm)',
  padding: '0.2rem 0.6rem',
  fontSize: '0.75rem',
  color: 'var(--ui-color-text-muted)',
  marginLeft: '0.5rem',
  verticalAlign: 'middle',
};

function InstallPage() {
  return (
    <div
      className="docs-page"
      style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}
    >
      <div className="docs-page-header">
        <h1 className="docs-page-title">Installation</h1>
        <p className="docs-page-description">
          Get started with Atelier UI in your Angular or React project.
        </p>
      </div>

      {/* Angular */}
      <div className="docs-section">
        <div style={sectionHeadingStyle}>
          <img src="/angular-logo.jpg" alt="Angular" style={logoStyle} />
          <h2 className="docs-section-title" style={{ margin: 0 }}>
            Angular
          </h2>
        </div>
        <p style={mutedText}>Install the Angular component library from npm:</p>
        <CodeBlock lang="shell" code="npm install @atelier-ui/angular" />
        <p style={mutedText}>Import the components you need:</p>
        <CodeBlock
          lang="ts"
          code={`import {
  LlmButton, LlmCard, LlmCardHeader, LlmCardContent, LlmCardFooter,
  LlmInput, LlmTextarea, LlmCheckbox, LlmToggle,
  LlmBadge, LlmAlert, LlmSelect, LlmOption,
  LlmDialog, LlmDialogHeader, LlmDialogContent, LlmDialogFooter,
  LlmTabGroup, LlmTab, LlmAccordionGroup, LlmAccordionItem,
  LlmMenu, LlmMenuItem, LlmMenuSeparator, LlmMenuTrigger,
  LlmTooltip, LlmToast, LlmToastContainer, LlmToastService,
  LlmSkeleton, LlmAvatar, LlmAvatarGroup
} from '@atelier-ui/angular';`}
        />
        <p style={mutedText}>Import the design tokens in your global styles:</p>
        <CodeBlock lang="css" code="@import '@atelier-ui/angular/styles/tokens.css';" />
      </div>

      {/* React */}
      <div className="docs-section">
        <div style={sectionHeadingStyle}>
          <img src="/react-logo.png" alt="React" style={logoStyle} />
          <h2 className="docs-section-title" style={{ margin: 0 }}>
            React
          </h2>
        </div>
        <p style={mutedText}>Install the React component library from npm:</p>
        <CodeBlock lang="shell" code="npm install @atelier-ui/react" />
        <p style={mutedText}>Import the components you need:</p>
        <CodeBlock
          lang="ts"
          code={`import {
  LlmButton, LlmCard, LlmCardHeader, LlmCardContent, LlmCardFooter,
  LlmInput, LlmTextarea, LlmCheckbox, LlmToggle,
  LlmBadge, LlmAlert, LlmSelect, LlmOption,
  LlmDialog, LlmDialogHeader, LlmDialogContent, LlmDialogFooter,
  LlmTabGroup, LlmTab, LlmAccordionGroup, LlmAccordionItem,
  LlmMenu, LlmMenuItem, LlmMenuSeparator, LlmMenuTrigger,
  LlmTooltip, LlmSkeleton, LlmAvatar, LlmAvatarGroup,
  LlmProgress, LlmBreadcrumbs, LlmBreadcrumbItem, LlmPagination,
  LlmDrawer, LlmDrawerHeader, LlmDrawerContent, LlmDrawerFooter,
  LlmToastProvider, LlmToastContainer, LlmToast, useLlmToast
} from '@atelier-ui/react';`}
        />
        <p style={mutedText}>Import the design tokens in your global styles:</p>
        <CodeBlock lang="css" code="@import '@atelier-ui/react/styles/tokens.css';" />
        <p style={mutedText}>
          Wrap your app root with <code>LlmToastProvider</code> to enable toasts:
        </p>
        <CodeBlock
          lang="jsx"
          code={`<LlmToastProvider>
  <App />
  <LlmToastContainer position="bottom-right" />
</LlmToastProvider>`}
        />
      </div>

      {/* Vue */}
      <div className="docs-section">
        <div style={sectionHeadingStyle}>
          <img src="/vue-logo.jpeg" alt="Vue" style={logoStyle} />
          <h2 className="docs-section-title" style={{ margin: 0 }}>
            Vue
            <span style={comingSoonBadge}>Coming Soon</span>
          </h2>
        </div>
        <p style={mutedText}>
          A Vue 3 port of Atelier UI is on the roadmap. Follow the project for updates.
        </p>
      </div>
    </div>
  );
}
