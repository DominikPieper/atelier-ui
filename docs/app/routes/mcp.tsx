import React, { useState, useEffect, useRef } from 'react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/mcp')({
  component: McpPage,
});

// ─── Types ─────────────────────────────────────────────────────────────────────

interface McpTool {
  name: string;
  signature: string;
  description: string;
}

interface CodeExample {
  lang: 'ts' | 'jsx' | 'vue';
  code: string;
}

interface Prompt {
  id: string;
  question: string;
  toolCall: { name: string; params: Record<string, unknown> };
  toolResult: Record<string, unknown>;
  assistantText: string;
  codeExample?: CodeExample;
}

interface McpServer {
  id: string;
  label: string;
  packageName: string;
  tools: McpTool[];
  prompts: Prompt[];
}

// ─── Shared Tools (same shape across all 3 servers) ────────────────────────────

const TOOLS: McpTool[] = [
  { name: 'list_components', signature: '()', description: 'Returns all component names and categories' },
  { name: 'get_component_docs', signature: '(component: string)', description: 'Full API — inputs, outputs, types, defaults' },
  { name: 'search_components', signature: '(query: string)', description: 'Fuzzy-search components by keyword' },
  { name: 'get_stories', signature: '(component: string)', description: 'Storybook usage examples for a component' },
  { name: 'get_theming_guide', signature: '()', description: 'CSS custom properties, tokens, dark mode docs' },
];

// ─── Scripted Server Data ──────────────────────────────────────────────────────

const SERVERS: McpServer[] = [
  {
    id: 'angular',
    label: 'Angular',
    packageName: '@atelier-ui/angular',
    tools: TOOLS,
    prompts: [
      {
        id: 'button',
        question: 'How do I use the Button?',
        toolCall: { name: 'get_component_docs', params: { component: 'button' } },
        toolResult: {
          component: 'button',
          selector: 'llm-button',
          package: '@atelier-ui/angular',
          inputs: {
            variant: "'primary' | 'secondary' | 'outline'",
            size: "'sm' | 'md' | 'lg'",
            disabled: 'boolean',
            loading: 'boolean',
          },
          outputs: { click: 'EventEmitter<void>' },
          content_projection: 'Default slot — button label',
        },
        assistantText:
          'The Button has three `variant` options: `primary`, `secondary`, and `outline`. Import it as a standalone component and use it directly in any template.\n\nBind `[loading]="isSaving"` for async actions — it disables interaction and shows a spinner automatically.',
        codeExample: {
          lang: 'ts',
          code: `import { LlmButton } from '@atelier-ui/angular';

// template:
// <llm-button variant="primary">Save</llm-button>
// <llm-button variant="outline" [loading]="saving">Submit</llm-button>
// <llm-button variant="secondary" [disabled]="true">Cancel</llm-button>`,
        },
      },
      {
        id: 'form-inputs',
        question: 'What form inputs exist?',
        toolCall: { name: 'search_components', params: { query: 'form inputs' } },
        toolResult: {
          matches: [
            { name: 'Input', selector: 'llm-input', description: 'Text field — integrates with Signal Forms' },
            { name: 'Textarea', selector: 'llm-textarea', description: 'Multi-line text with optional autoResize' },
            { name: 'Checkbox', selector: 'llm-checkbox', description: 'Boolean toggle — uses FormCheckboxControl' },
            { name: 'Toggle', selector: 'llm-toggle', description: 'Switch-style boolean input' },
            { name: 'Select', selector: 'llm-select', description: 'Dropdown with keyboard navigation' },
            { name: 'RadioGroup', selector: 'llm-radio-group', description: 'Mutually exclusive option set' },
          ],
        },
        assistantText:
          'Six form inputs are available, all compatible with Angular Signal Forms — no `ControlValueAccessor` boilerplate required.\n\nFor text entry use `llm-input` or `llm-textarea` (with optional `autoResize`). For toggles use `llm-checkbox` or `llm-toggle`. For selection use `llm-select` or `llm-radio-group`.',
        codeExample: {
          lang: 'ts',
          code: `import {
  LlmInput,
  LlmSelect,
  LlmCheckbox,
  LlmToggle,
} from '@atelier-ui/angular';`,
        },
      },
      {
        id: 'theming',
        question: 'How do I customize the theme?',
        toolCall: { name: 'get_theming_guide', params: {} },
        toolResult: {
          approach: 'CSS custom properties',
          setup: "@import '@atelier-ui/angular/styles/tokens.css';",
          key_tokens: {
            '--ui-color-primary': '#00bebe',
            '--ui-color-surface': '#ffffff',
            '--ui-color-text': '#0f172a',
            '--ui-radius-md': '0.5rem',
            '--ui-spacing-4': '1rem',
          },
          dark_mode: "Set data-theme='dark' on <html> — or rely on prefers-color-scheme",
        },
        assistantText:
          'Theming is pure CSS — no config files, no build step. Import `tokens.css` once in your root stylesheet, then override any `--ui-*` variable on `:root` or any scoped selector.\n\nDark mode is built in. Either set `data-theme="dark"` on the `<html>` element programmatically, or let the automatic `prefers-color-scheme` detection handle it.',
        codeExample: {
          lang: 'ts',
          code: `/* styles.css */
@import '@atelier-ui/angular/styles/tokens.css';

:root {
  --ui-color-primary: #6366f1;   /* your brand */
  --ui-radius-md: 0.75rem;       /* rounder corners */
}`,
        },
      },
      {
        id: 'dialog',
        question: 'Show me a Dialog example',
        toolCall: { name: 'get_stories', params: { component: 'dialog' } },
        toolResult: {
          component: 'dialog',
          stories: [
            {
              name: 'Confirmation',
              inputs: { open: 'boolean (controlled)', size: "'sm' | 'md' | 'lg'" },
              outputs: { openChange: 'boolean' },
              slots: ['llm-dialog-header', 'default body', 'llm-dialog-footer'],
            },
          ],
        },
        assistantText:
          'The Dialog is fully controlled via `[open]` and `(openChange)`. Use content projection to compose the header, body, and footer — no config objects needed.\n\nStore open state in a signal: `isOpen = signal(false)` and toggle it from a button click.',
        codeExample: {
          lang: 'ts',
          code: `// Component:
isOpen = signal(false);

// Template:
// <llm-button (click)="isOpen.set(true)">Open</llm-button>
//
// <llm-dialog [open]="isOpen()" (openChange)="isOpen.set($event)">
//   <llm-dialog-header>Confirm</llm-dialog-header>
//   <p>This action cannot be undone.</p>
//   <llm-dialog-footer>
//     <llm-button (click)="isOpen.set(false)">Cancel</llm-button>
//     <llm-button variant="primary">Confirm</llm-button>
//   </llm-dialog-footer>
// </llm-dialog>`,
        },
      },
    ],
  },
  {
    id: 'react',
    label: 'React',
    packageName: '@atelier-ui/react',
    tools: TOOLS,
    prompts: [
      {
        id: 'button',
        question: 'How do I use the Button?',
        toolCall: { name: 'get_component_docs', params: { component: 'button' } },
        toolResult: {
          component: 'button',
          element: 'LlmButton',
          package: '@atelier-ui/react',
          props: {
            variant: "'primary' | 'secondary' | 'outline'",
            size: "'sm' | 'md' | 'lg'",
            disabled: 'boolean',
            loading: 'boolean',
            onClick: '() => void',
          },
          children: 'ReactNode — button label',
        },
        assistantText:
          'The React `LlmButton` accepts the same `variant`, `size`, `loading`, and `disabled` props as the Angular version. Pass children as the button label.\n\nUse `loading={isPending}` to show a spinner during async operations — the button disables itself automatically while loading.',
        codeExample: {
          lang: 'jsx',
          code: `import { LlmButton } from '@atelier-ui/react';

function SaveForm() {
  const [saving, setSaving] = useState(false);
  return (
    <LlmButton
      variant="primary"
      loading={saving}
      onClick={handleSave}
    >
      Save changes
    </LlmButton>
  );
}`,
        },
      },
      {
        id: 'badge',
        question: "What's the Badge API?",
        toolCall: { name: 'get_component_docs', params: { component: 'badge' } },
        toolResult: {
          component: 'badge',
          element: 'LlmBadge',
          package: '@atelier-ui/react',
          props: {
            variant: "'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'",
            size: "'sm' | 'md'",
          },
          children: 'ReactNode — badge label text',
        },
        assistantText:
          "The Badge has six `variant` options covering all semantic states. It's purely presentational — no state, no events.\n\nUse `variant=\"success\"` for completed items, `variant=\"warning\"` for pending, `variant=\"danger\"` for errors, and `variant=\"primary\"` for highlighted states.",
        codeExample: {
          lang: 'jsx',
          code: `import { LlmBadge } from '@atelier-ui/react';

<LlmBadge variant="success">Active</LlmBadge>
<LlmBadge variant="warning">Pending</LlmBadge>
<LlmBadge variant="danger">Error</LlmBadge>
<LlmBadge variant="primary">New</LlmBadge>`,
        },
      },
      {
        id: 'dark-mode',
        question: 'How do I enable dark mode?',
        toolCall: { name: 'get_theming_guide', params: {} },
        toolResult: {
          approach: 'CSS custom properties',
          setup: "@import '@atelier-ui/react/styles/tokens.css';",
          dark_mode: {
            automatic: 'Responds to prefers-color-scheme by default',
            explicit: "Set data-theme='dark' on document.documentElement",
            toggle: "document.documentElement.setAttribute('data-theme', 'dark')",
          },
          key_dark_tokens: {
            '--ui-color-surface': '#1e1e2e',
            '--ui-color-text': '#cdd6f4',
            '--ui-color-primary': '#00bebe',
          },
        },
        assistantText:
          "Dark mode works automatically via `prefers-color-scheme`. To add a manual toggle, call `document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')`.\n\nAll 56 design tokens have light and dark values defined — zero extra CSS needed.",
        codeExample: {
          lang: 'jsx',
          code: `function useDarkMode() {
  const [dark, setDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme', dark ? 'dark' : 'light'
    );
  }, [dark]);
  return [dark, () => setDark(d => !d)];
}`,
        },
      },
      {
        id: 'select',
        question: 'Show me the Select component',
        toolCall: { name: 'get_component_docs', params: { component: 'select' } },
        toolResult: {
          component: 'select',
          element: 'LlmSelect',
          package: '@atelier-ui/react',
          props: {
            options: 'Array<{ value: string; label: string }>',
            value: 'string',
            onValueChange: '(value: string) => void',
            placeholder: 'string',
            disabled: 'boolean',
            invalid: 'boolean',
          },
          features: ['keyboard navigation', 'searchable', 'ARIA combobox pattern'],
        },
        assistantText:
          'The Select is controlled via `value` and `onValueChange`. Pass a flat `options` array — no option JSX children needed.\n\nIt implements the ARIA combobox pattern with full keyboard navigation and is searchable by default.',
        codeExample: {
          lang: 'jsx',
          code: `import { LlmSelect } from '@atelier-ui/react';

const FRAMEWORKS = [
  { value: 'angular', label: 'Angular' },
  { value: 'react',   label: 'React'   },
  { value: 'vue',     label: 'Vue'     },
];

function FrameworkPicker() {
  const [value, setValue] = useState('');
  return (
    <LlmSelect
      options={FRAMEWORKS}
      value={value}
      onValueChange={setValue}
      placeholder="Choose framework…"
    />
  );
}`,
        },
      },
    ],
  },
  {
    id: 'vue',
    label: 'Vue',
    packageName: '@atelier-ui/vue',
    tools: TOOLS,
    prompts: [
      {
        id: 'list',
        question: 'What components are available?',
        toolCall: { name: 'list_components', params: {} },
        toolResult: {
          total: 26,
          categories: {
            Inputs: ['Button', 'Input', 'Textarea', 'Checkbox', 'Toggle', 'RadioGroup', 'Select'],
            Display: ['Badge', 'Card', 'Avatar', 'Skeleton', 'Progress'],
            Navigation: ['Breadcrumbs', 'Tabs', 'Pagination', 'Menu'],
            Overlay: ['Dialog', 'Drawer', 'Tooltip', 'Toast'],
            Layout: ['Accordion', 'Alert'],
          },
        },
        assistantText:
          '26 components across 5 categories. All share the same API contract as the Angular and React versions — same prop names, same variants, same design tokens.\n\nEvery component is a separate import, so your bundle only includes what you use.',
        codeExample: {
          lang: 'vue',
          code: `import {
  LlmButton,
  LlmCard,
  LlmBadge,
  LlmDialog,
} from '@atelier-ui/vue';`,
        },
      },
      {
        id: 'card',
        question: 'How do I use the Card?',
        toolCall: { name: 'get_component_docs', params: { component: 'card' } },
        toolResult: {
          component: 'card',
          element: 'LlmCard',
          package: '@atelier-ui/vue',
          props: {
            variant: "'flat' | 'raised' | 'outlined'",
            padding: "'none' | 'sm' | 'md' | 'lg'",
            interactive: 'boolean — adds hover lift and pointer cursor',
          },
          slots: ['default (card body)', 'header (optional)', 'footer (optional)'],
        },
        assistantText:
          'The Card is a layout primitive with three `variant` styles. Use `variant="raised"` for elevated surfaces, `variant="outlined"` for bordered cards, and `variant="flat"` for subtle grouping.\n\nSet `:interactive="true"` for clickable cards — the hover lift and pointer cursor are added automatically.',
        codeExample: {
          lang: 'vue',
          code: `<script setup>
import { LlmCard, LlmBadge, LlmButton } from '@atelier-ui/vue';
</script>

<template>
  <LlmCard variant="raised" :interactive="true">
    <template #header>
      <LlmBadge variant="success">Active</LlmBadge>
    </template>
    <p>Card body content goes here.</p>
    <template #footer>
      <LlmButton variant="outline" size="sm">Details</LlmButton>
    </template>
  </LlmCard>
</template>`,
        },
      },
      {
        id: 'alert',
        question: 'Show me the Alert variants',
        toolCall: { name: 'get_stories', params: { component: 'alert' } },
        toolResult: {
          component: 'alert',
          stories: [
            { name: 'Info', variant: 'info', description: 'Neutral informational message' },
            { name: 'Success', variant: 'success', description: 'Positive outcome confirmation' },
            { name: 'Warning', variant: 'warning', description: 'Non-blocking caution message' },
            { name: 'Danger', variant: 'danger', description: 'Error or destructive action warning' },
          ],
          props: {
            variant: "'info' | 'success' | 'warning' | 'danger'",
            dismissible: 'boolean — shows a close button',
          },
        },
        assistantText:
          'Alert has four semantic variants covering all common notification states. Each applies the right colors from the design token system automatically.\n\nAdd `dismissible` to show a close button. The `@dismiss` event fires when the user closes it — use it to remove the alert from your state.',
        codeExample: {
          lang: 'vue',
          code: `<script setup>
import { LlmAlert } from '@atelier-ui/vue';
const show = ref(true);
</script>

<template>
  <LlmAlert
    v-if="show"
    variant="warning"
    :dismissible="true"
    @dismiss="show = false"
  >
    Your session expires in 5 minutes.
  </LlmAlert>
</template>`,
        },
      },
      {
        id: 'form-inputs',
        question: 'How do I use form inputs?',
        toolCall: { name: 'search_components', params: { query: 'inputs' } },
        toolResult: {
          matches: [
            { name: 'Input', element: 'LlmInput', description: 'Text field — controlled via v-model:value' },
            { name: 'Textarea', element: 'LlmTextarea', description: 'Multi-line text with optional autoResize' },
            { name: 'Checkbox', element: 'LlmCheckbox', description: 'Boolean v-model:checked binding' },
            { name: 'Toggle', element: 'LlmToggle', description: 'Switch-style v-model:checked binding' },
            { name: 'Select', element: 'LlmSelect', description: 'Dropdown — v-model:value with options array' },
          ],
        },
        assistantText:
          "All form inputs use Vue's `v-model` pattern with consistent binding names. Text fields use `v-model:value`, checkboxes and toggles use `v-model:checked`.\n\nEvery input has `invalid` and `disabled` props for validation states — wire them to your form validation logic.",
        codeExample: {
          lang: 'vue',
          code: `<script setup>
import { LlmInput, LlmCheckbox, LlmSelect } from '@atelier-ui/vue';
const email   = ref('');
const agreed  = ref(false);
const plan    = ref('');
</script>

<template>
  <LlmInput    v-model:value="email"   placeholder="you@example.com" />
  <LlmCheckbox v-model:checked="agreed" label="I agree to terms" />
  <LlmSelect   v-model:value="plan"    :options="plans" />
</template>`,
        },
      },
    ],
  },
];

// ─── JSON tokenizer ────────────────────────────────────────────────────────────

type Token = { text: string; color?: string };

function tokenizeJson(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < code.length) {
    const ch = code[i];
    if (ch === '\n') { tokens.push({ text: '\n' }); i++; continue; }
    if (ch === '\r') { i++; continue; }
    if (ch === ' ' || ch === '\t') { tokens.push({ text: ch }); i++; continue; }

    if (ch === '"') {
      let j = i + 1;
      while (j < code.length && code[j] !== '"') {
        if (code[j] === '\\') j++;
        j++;
      }
      const str = code.slice(i, j + 1);
      let k = j + 1;
      while (k < code.length && (code[k] === ' ' || code[k] === '\n')) k++;
      const isKey = code[k] === ':';
      tokens.push({ text: str, color: isKey ? '#00bebe' : '#059669' });
      i = j + 1;
      continue;
    }
    if (/[0-9\-]/.test(ch)) {
      let j = i;
      while (j < code.length && /[0-9.\-e+]/.test(code[j])) j++;
      tokens.push({ text: code.slice(i, j), color: '#7c3aed' });
      i = j;
      continue;
    }
    if (code.slice(i, i + 4) === 'true')  { tokens.push({ text: 'true',  color: '#7c3aed' }); i += 4; continue; }
    if (code.slice(i, i + 5) === 'false') { tokens.push({ text: 'false', color: '#7c3aed' }); i += 5; continue; }
    if (code.slice(i, i + 4) === 'null')  { tokens.push({ text: 'null',  color: '#7c3aed' }); i += 4; continue; }

    tokens.push({ text: ch, color: '#6c7086' });
    i++;
  }
  return tokens;
}

// ─── Code tokenizer (TypeScript / JSX / Vue) ──────────────────────────────────

function tokenizeBraces(segment: string, tokens: Token[]) {
  let i = 0;
  while (i < segment.length) {
    const ch = segment[i];
    if (ch === '{' || ch === '}' || ch === ',' || ch === '\n') {
      tokens.push({ text: ch, color: '#6c7086' }); i++;
    } else if (ch === ' ') {
      tokens.push({ text: ch }); i++;
    } else {
      let end = i;
      while (end < segment.length && !/[{},\s]/.test(segment[end])) end++;
      tokens.push({ text: segment.slice(i, end), color: '#00bebe' });
      i = end;
    }
  }
}

function tokenizeLine(line: string, tokens: Token[]) {
  if (line.match(/^\s*\/\//)) {
    tokens.push({ text: line, color: '#6c7086' });
    return;
  }
  let rest = line;
  const importMatch = rest.match(/^(import)\s*/);
  if (importMatch) {
    tokens.push({ text: 'import', color: '#7c3aed' });
    rest = rest.slice(importMatch[0].length);
  }
  const fromIdx = rest.lastIndexOf(' from ');
  if (fromIdx !== -1) {
    tokenizeBraces(rest.slice(0, fromIdx), tokens);
    tokens.push({ text: ' from ', color: '#7c3aed' });
    const after = rest.slice(fromIdx + 6);
    const semiIdx = after.lastIndexOf(';');
    if (semiIdx !== -1) {
      tokens.push({ text: after.slice(0, semiIdx), color: '#059669' });
      tokens.push({ text: ';', color: '#6c7086' });
    } else {
      tokens.push({ text: after, color: '#059669' });
    }
    return;
  }
  tokens.push({ text: rest, color: '#cdd6f4' });
}

function tokenizeCode(code: string): Token[] {
  const tokens: Token[] = [];
  code.split('\n').forEach((line, i) => {
    if (i > 0) tokens.push({ text: '\n' });
    tokenizeLine(line, tokens);
  });
  return tokens;
}

// ─── Rendered text with inline `code` support ─────────────────────────────────

function AssistantText({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, li) => (
        <React.Fragment key={li}>
          {li > 0 && <br />}
          {line.split(/(`[^`]+`)/).map((part, pi) =>
            part.startsWith('`') && part.endsWith('`') ? (
              <code
                key={pi}
                style={{
                  background: 'var(--ui-color-surface-sunken)',
                  color: '#00bebe',
                  padding: '0.1em 0.35em',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '0.875em',
                }}
              >
                {part.slice(1, -1)}
              </code>
            ) : (
              <span key={pi}>{part}</span>
            )
          )}
        </React.Fragment>
      ))}
    </>
  );
}

// ─── Code block ───────────────────────────────────────────────────────────────

function CodeBlock({ code, lang }: { code: string; lang: 'ts' | 'jsx' | 'vue' | 'json' }) {
  const tokens = lang === 'json' ? tokenizeJson(code) : tokenizeCode(code);
  return (
    <div className="docs-demo-code" style={{ marginTop: '0.6rem' }}>
      <pre>
        {tokens.map((t, i) => (
          <span key={i} style={{ color: t.color }}>{t.text}</span>
        ))}
      </pre>
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

const MSG_META = {
  user:        { borderColor: 'var(--ui-color-border)',  labelColor: 'var(--ui-color-text-muted)', label: 'you',         bg: 'var(--ui-color-surface-raised)' },
  tool_call:   { borderColor: '#00bebe',                 labelColor: '#00bebe',                    label: 'tool_call',   bg: 'rgba(0,190,190,0.05)' },
  tool_result: { borderColor: '#059669',                 labelColor: '#059669',                    label: 'tool_result', bg: 'rgba(5,150,105,0.05)' },
  assistant:   { borderColor: '#7c3aed',                 labelColor: '#7c3aed',                    label: 'assistant',   bg: 'rgba(124,58,237,0.05)' },
} as const;

type MsgType = keyof typeof MSG_META;

function Message({ type, visible, children }: { type: MsgType; visible: boolean; children: React.ReactNode }) {
  const m = MSG_META[type];
  return (
    <div
      style={{
        borderRadius: 'var(--ui-radius-md)',
        border: `1px solid ${m.borderColor}`,
        borderLeft: `3px solid ${m.borderColor}`,
        background: m.bg,
        padding: '0.75rem 1rem',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div
        style={{
          fontSize: '0.68rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: m.labelColor,
          marginBottom: '0.35rem',
        }}
      >
        {m.label}
      </div>
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function McpPage() {
  const [serverId, setServerId] = useState('angular');
  const [activePromptId, setActivePromptId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const server = SERVERS.find((s) => s.id === serverId)!;
  const activePrompt = server.prompts.find((p) => p.id === activePromptId) ?? null;

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  function handleServerChange(id: string) {
    clearTimers();
    setServerId(id);
    setActivePromptId(null);
    setStep(0);
  }

  function handlePromptClick(promptId: string) {
    clearTimers();
    setStep(0);
    setActivePromptId(promptId);
    timers.current.push(setTimeout(() => setStep(1), 50));
    timers.current.push(setTimeout(() => setStep(2), 600));
    timers.current.push(setTimeout(() => setStep(3), 1200));
    timers.current.push(setTimeout(() => setStep(4), 1900));
  }

  useEffect(() => () => clearTimers(), []);

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', padding: '2rem' }}>
      <style>{`
        .mcp-grid {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 1.5rem;
          align-items: start;
        }
        @media (max-width: 700px) {
          .mcp-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Header */}
      <div className="docs-page-header">
        <h1 className="docs-page-title">MCP Playground</h1>
        <p className="docs-page-description">
          See how AI uses the component library MCP server. Click a prompt and watch
          the full protocol loop: tool call, structured response, synthesised answer.
        </p>
      </div>

      {/* Server switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--ui-color-text-muted)', marginRight: '0.25rem' }}>Server:</span>
        {SERVERS.map((s) => {
          const active = serverId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => handleServerChange(s.id)}
              style={{
                padding: '0.35rem 0.9rem',
                borderRadius: 'var(--ui-radius-md)',
                border: `2px solid ${active ? 'var(--ui-color-primary)' : 'var(--ui-color-border)'}`,
                background: active ? 'var(--ui-color-primary)' : 'transparent',
                color: active ? 'var(--ui-color-text-on-primary)' : 'var(--ui-color-text)',
                cursor: 'pointer',
                fontWeight: active ? '600' : '400',
                fontSize: '0.875rem',
                transition: 'all 0.15s',
              }}
            >
              {s.label}
            </button>
          );
        })}
        <code style={{ marginLeft: '0.25rem', fontSize: '0.78rem', color: 'var(--ui-color-text-muted)', fontFamily: 'monospace' }}>
          {server.packageName}
        </code>
      </div>

      {/* Two-column layout */}
      <div className="mcp-grid">

        {/* Tools panel */}
        <div
          style={{
            background: 'var(--ui-color-surface-raised)',
            border: '1px solid var(--ui-color-border)',
            borderRadius: 'var(--ui-radius-md)',
            padding: '1rem',
          }}
        >
          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--ui-color-text-muted)',
              marginBottom: '0.75rem',
            }}
          >
            Available Tools
          </div>
          {server.tools.map((tool) => (
            <div key={tool.name} style={{ marginBottom: '0.8rem' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', lineHeight: '1.4' }}>
                <span style={{ color: 'var(--ui-color-primary)', fontWeight: '600' }}>{tool.name}</span>
                <span style={{ color: 'var(--ui-color-text-muted)' }}>{tool.signature}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--ui-color-text-muted)', marginTop: '0.15rem', lineHeight: '1.4' }}>
                {tool.description}
              </div>
            </div>
          ))}
        </div>

        {/* Chat area */}
        <div>
          {/* Prompt chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {server.prompts.map((p) => {
              const active = activePromptId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePromptClick(p.id)}
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: '9999px',
                    border: `1px solid ${active ? 'var(--ui-color-primary)' : 'var(--ui-color-border)'}`,
                    background: active ? 'rgba(0,190,190,0.08)' : 'var(--ui-color-surface-raised)',
                    color: active ? 'var(--ui-color-primary)' : 'var(--ui-color-text)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: active ? '500' : '400',
                    transition: 'all 0.15s',
                  }}
                >
                  {p.question}
                </button>
              );
            })}
          </div>

          {/* Placeholder */}
          {!activePrompt && (
            <div
              style={{
                border: '1px dashed var(--ui-color-border)',
                borderRadius: 'var(--ui-radius-md)',
                padding: '2.5rem',
                textAlign: 'center',
                color: 'var(--ui-color-text-muted)',
                fontSize: '0.9rem',
              }}
            >
              Click a prompt above to see the MCP protocol in action
            </div>
          )}

          {/* Messages */}
          {activePrompt && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Message type="user" visible={step >= 1}>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>{activePrompt.question}</p>
              </Message>

              <Message type="tool_call" visible={step >= 2}>
                <div style={{ fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: '600', color: '#00bebe', marginBottom: '0.1rem' }}>
                  {activePrompt.toolCall.name}
                </div>
                <CodeBlock code={JSON.stringify(activePrompt.toolCall.params, null, 2)} lang="json" />
              </Message>

              <Message type="tool_result" visible={step >= 3}>
                <CodeBlock code={JSON.stringify(activePrompt.toolResult, null, 2)} lang="json" />
              </Message>

              <Message type="assistant" visible={step >= 4}>
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.65', color: 'var(--ui-color-text)' }}>
                  <AssistantText text={activePrompt.assistantText} />
                </p>
                {activePrompt.codeExample && (
                  <CodeBlock code={activePrompt.codeExample.code} lang={activePrompt.codeExample.lang} />
                )}
              </Message>
            </div>
          )}

          {/* Legend */}
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--ui-color-border)',
              display: 'flex',
              gap: '1.25rem',
              flexWrap: 'wrap',
            }}
          >
            {(
              [
                { color: '#00bebe', label: 'tool_call',   desc: 'AI decides which tool to query' },
                { color: '#059669', label: 'tool_result', desc: 'MCP server responds with data'   },
                { color: '#7c3aed', label: 'assistant',   desc: 'AI synthesises the answer'       },
              ] as const
            ).map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color, flexShrink: 0, display: 'inline-block' }} />
                <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: item.color, fontWeight: '600' }}>{item.label}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--ui-color-text-muted)' }}>— {item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
