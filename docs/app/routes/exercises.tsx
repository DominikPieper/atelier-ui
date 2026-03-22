import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/exercises')({
  component: ExercisesPage,
});

const muted: React.CSSProperties = {
  color: 'var(--ui-color-text-muted)',
  lineHeight: '1.65',
};

const EXERCISES = [
  {
    id: 1,
    title: 'Login Form',
    difficulty: 'starter',
    difficultyLabel: 'Starter',
    objective:
      'Get Claude to build a complete login form using the component library. Watch how the MCP server provides exact input names, types, and validation states — so the generated code works on the first attempt.',
    components: ['llm-input / LlmInput', 'llm-button / LlmButton', 'llm-alert / LlmAlert'],
    prompt: `Build a login form using the Atelier UI component library.

The form should have:
- An email field and a password field
- A "Sign in" button (primary variant, full width)
- An error alert that shows when credentials are wrong (use variant="danger")
- A loading state on the button while submitting

Use the MCP server to look up the component APIs before writing any code.`,
    observe: [
      'Claude calls get_component_docs("input") and get_component_docs("button") before writing',
      'The generated selector/element names match exactly — no invented attributes',
      'Invalid state and loading state are used correctly because the MCP returned the prop types',
    ],
    stretch:
      'Add a "Forgot password?" link below the form. Ask Claude to show an inline success message after a successful reset request using LlmAlert variant="success".',
  },
  {
    id: 2,
    title: 'Settings Panel',
    difficulty: 'intermediate',
    difficultyLabel: 'Intermediate',
    objective:
      'Compose multiple components into a realistic settings page. See how Claude uses search_components to discover relevant components and then drills into each API.',
    components: [
      'llm-tabs / LlmTabGroup',
      'llm-toggle / LlmToggle',
      'llm-select / LlmSelect',
      'llm-input / LlmInput',
      'llm-button / LlmButton',
    ],
    prompt: `Build a settings page using the Atelier UI component library.

Structure it with three tabs: "Profile", "Notifications", and "Appearance".

Profile tab:
- Display name input and email input (read-only)
- A "Save changes" button

Notifications tab:
- Email notifications toggle (on by default)
- Push notifications toggle (off by default)
- A select for notification frequency: "Immediately", "Daily digest", "Weekly summary"

Appearance tab:
- Theme select: "System", "Light", "Dark"
- A toggle for compact mode

Use the MCP server to look up available components before writing any code.`,
    observe: [
      'Claude likely calls list_components or search_components("form") first to survey available inputs',
      'Then drills into get_component_docs for each component it selects',
      'Toggle and Select APIs come back with the exact model/v-model binding convention for the framework',
    ],
    stretch:
      'Add form validation: the "Save changes" button should be disabled when Display name is empty. Ask Claude to use the invalid prop on the input when the field has been touched but is empty.',
  },
  {
    id: 3,
    title: 'User List',
    difficulty: 'intermediate',
    difficultyLabel: 'Intermediate',
    objective:
      'Build a data display page that combines display and overlay components. Focus on how Claude assembles multi-component layouts and handles interactive states like loading and empty states.',
    components: [
      'llm-card / LlmCard',
      'llm-avatar / LlmAvatar',
      'llm-badge / LlmBadge',
      'llm-skeleton / LlmSkeleton',
      'llm-menu / LlmMenu',
      'llm-pagination / LlmPagination',
    ],
    prompt: `Build a user management list using the Atelier UI component library.

Show a list of 5 users. Each row should use a Card and include:
- An Avatar (use the name prop for initials)
- The user's name and email
- A Badge showing their role: "Admin" (primary variant), "Member" (default), or "Guest" (info)
- A Menu with actions: "Edit", "Deactivate", and "Remove" (use danger styling for Remove)

Add a loading state: show Skeleton placeholders for 3 rows while data loads.
Add pagination at the bottom (current page 1, 10 total pages).

Use the MCP server to look up component APIs.`,
    observe: [
      'get_stories("card") or get_stories("avatar") may be called to check real-world usage patterns',
      'The Skeleton API returns variant options (text/circular/rectangular) — Claude uses them correctly for the avatar placeholder vs text placeholder',
      'Menu items come back with the separator and disabled options documented',
    ],
    stretch:
      'Add a confirmation dialog before removing a user. Ask Claude to wire up the Dialog so it opens when "Remove" is clicked and closes on Cancel or Confirm.',
  },
  {
    id: 4,
    title: 'Dashboard',
    difficulty: 'advanced',
    difficultyLabel: 'Advanced',
    objective:
      'Compose a full-page dashboard with stats, activity feed, and a side drawer. This exercise shows how Claude handles a complex prompt by decomposing it into targeted MCP calls — one component at a time.',
    components: [
      'llm-card / LlmCard',
      'llm-badge / LlmBadge',
      'llm-progress / LlmProgress',
      'llm-alert / LlmAlert',
      'llm-drawer / LlmDrawer',
      'llm-accordion / LlmAccordionGroup',
      'llm-button / LlmButton',
    ],
    prompt: `Build an analytics dashboard using the Atelier UI component library.

Top row — four stat cards (use Card variant="elevated"):
- Total Users: 1,284 with a Badge "↑ 12%" (success)
- Active Sessions: 342 with a Badge "↑ 5%" (success)
- Error Rate: 2.1% with a Badge "↑ 0.4%" (danger)
- Uptime: 99.8% with a Progress bar at value=99.8

Middle row — an activity feed using Accordion (3 items with timestamps and descriptions).

Bottom — a dismissible Alert (variant="warning") about scheduled maintenance.

Add a "Details" button in the header that opens a Drawer on the right with additional metrics inside.

Use the MCP server to look up all component APIs before writing.`,
    observe: [
      'Claude makes many targeted MCP calls — count how many get_component_docs calls it takes to build this page',
      'get_theming_guide may be called if Claude decides to add custom token-based spacing',
      'The Drawer API returns position and size options — Claude picks "right" without guessing',
      'Complex layouts reveal how the AI decomposes a big prompt into a sequence of focused tool calls',
    ],
    stretch:
      'Ask Claude to add a dark mode toggle in the dashboard header that switches the entire page between light and dark themes using the data-theme attribute. Hint: ask it to check the theming guide first.',
  },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  starter: '#059669',
  intermediate: '#7c3aed',
  advanced: '#00bebe',
};

function DifficultyBadge({ difficulty, label }: { difficulty: string; label: string }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.15rem 0.6rem',
      borderRadius: '9999px',
      fontSize: '0.72rem',
      fontWeight: '600',
      background: `${DIFFICULTY_COLORS[difficulty]}18`,
      color: DIFFICULTY_COLORS[difficulty],
      border: `1px solid ${DIFFICULTY_COLORS[difficulty]}30`,
    }}>
      {label}
    </span>
  );
}

function ComponentChip({ name }: { name: string }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.15rem 0.55rem',
      borderRadius: 'var(--ui-radius-sm)',
      fontSize: '0.72rem',
      fontFamily: 'monospace',
      background: 'rgba(0,190,190,0.06)',
      color: 'var(--ui-color-primary)',
      border: '1px solid rgba(0,190,190,0.15)',
    }}>
      {name}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }
  return (
    <button
      onClick={copy}
      style={{
        padding: '0.3rem 0.75rem',
        borderRadius: 'var(--ui-radius-sm)',
        border: '1px solid var(--ui-color-border)',
        background: copied ? 'rgba(5,150,105,0.08)' : 'transparent',
        color: copied ? '#059669' : 'var(--ui-color-text-muted)',
        cursor: 'pointer',
        fontSize: '0.72rem',
        fontWeight: '600',
        transition: 'all 0.15s',
      }}
    >
      {copied ? '✓ Copied' : 'Copy prompt'}
    </button>
  );
}

function ExerciseCard({ ex }: { ex: typeof EXERCISES[0] }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      background: 'var(--ui-color-surface-raised)',
      border: '1px solid var(--ui-color-border)',
      borderRadius: 'var(--ui-radius-md)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          width: '100%',
          padding: '1.25rem 1.5rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{
          flexShrink: 0,
          width: '2rem',
          height: '2rem',
          borderRadius: 'var(--ui-radius-sm)',
          background: `${DIFFICULTY_COLORS[ex.difficulty]}18`,
          color: DIFFICULTY_COLORS[ex.difficulty],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.8rem',
          fontWeight: '700',
          fontFamily: 'monospace',
        }}>
          {ex.id}
        </span>
        <span style={{ flex: 1, fontWeight: '600', fontSize: '1rem', color: 'var(--ui-color-text)' }}>
          {ex.title}
        </span>
        <DifficultyBadge difficulty={ex.difficulty} label={ex.difficultyLabel} />
        <span style={{ color: 'var(--ui-color-text-muted)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Objective */}
          <p style={{ ...muted, margin: 0 }}>{ex.objective}</p>

          {/* Components */}
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ui-color-text-muted)', marginBottom: '0.5rem' }}>
              Components used
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {ex.components.map(c => <ComponentChip key={c} name={c} />)}
            </div>
          </div>

          {/* Prompt */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ui-color-text-muted)' }}>
                Prompt for Claude
              </div>
              <CopyButton text={ex.prompt} />
            </div>
            <div className="docs-demo-code" style={{ borderRadius: 'var(--ui-radius-sm)' }}>
              <pre style={{ margin: 0, fontSize: '0.8rem', lineHeight: '1.6', color: '#cdd6f4', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {ex.prompt}
              </pre>
            </div>
          </div>

          {/* What to observe */}
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ui-color-text-muted)', marginBottom: '0.5rem' }}>
              What to watch for
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {ex.observe.map((o, i) => (
                <li key={i} style={{ ...muted, fontSize: '0.85rem' }}>{o}</li>
              ))}
            </ul>
          </div>

          {/* Stretch */}
          <div style={{
            padding: '0.75rem 1rem',
            background: 'rgba(0,190,190,0.04)',
            border: '1px solid rgba(0,190,190,0.15)',
            borderRadius: 'var(--ui-radius-sm)',
          }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--ui-color-primary)', marginRight: '0.5rem' }}>
              Stretch goal
            </span>
            <span style={{ ...muted, fontSize: '0.82rem' }}>{ex.stretch}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ExercisesPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div className="docs-page-header">
        <h1 className="docs-page-title">Workshop Exercises</h1>
        <p className="docs-page-description">
          Hands-on tasks for learning AI-assisted UI development with Atelier UI.
          Each exercise gives you a prompt to hand to Claude — then watch which
          MCP tools it calls and how it uses the structured responses.
        </p>
      </div>

      {/* Setup note */}
      <div style={{
        padding: '1rem 1.25rem',
        background: 'var(--ui-color-surface-raised)',
        border: '1px solid var(--ui-color-border)',
        borderRadius: 'var(--ui-radius-md)',
        marginBottom: '2rem',
        fontSize: '0.85rem',
        ...muted,
      }}>
        <strong style={{ color: 'var(--ui-color-text)' }}>Before you start —</strong>{' '}
        make sure your workspace is set up with{' '}
        <code>npx create-atelier-ui-workspace</code> and the MCP server is
        connected. Open Claude Code in VS Code or your editor of choice, then
        paste the exercise prompt directly into the chat.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {EXERCISES.map(ex => <ExerciseCard key={ex.id} ex={ex} />)}
      </div>

      {/* Facilitator tip */}
      <div style={{
        marginTop: '2.5rem',
        padding: '1rem 1.25rem',
        background: 'var(--ui-color-surface-raised)',
        border: '1px solid var(--ui-color-border)',
        borderRadius: 'var(--ui-radius-md)',
        fontSize: '0.82rem',
        ...muted,
      }}>
        <strong style={{ color: 'var(--ui-color-text)' }}>Facilitator tip —</strong>{' '}
        after each exercise, use the{' '}
        <strong>MCP Playground</strong> to replay the tool calls Claude made. It
        makes the protocol tangible: participants can see the exact JSON the AI
        received and understand why the generated code was correct.
      </div>
    </div>
  );
}
