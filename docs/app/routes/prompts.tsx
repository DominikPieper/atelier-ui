import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { CodeBlock } from '../shared/code-block';

export const Route = createFileRoute('/prompts')({
  component: PromptsPage,
});

type Framework = 'react' | 'angular' | 'vue';

const DOCS_URL = 'https://atelier-ui.netlify.app/llms-full.txt';

// ─── Prompt definitions ───────────────────────────────────────────────────────

interface PromptCard {
  title: string;
  description: string;
  prompt: (fw: Framework) => string;
}

interface PromptSection {
  title: string;
  cards: PromptCard[];
}

const FRAMEWORK_LABELS: Record<Framework, string> = {
  react: 'React',
  angular: 'Angular',
  vue: 'Vue',
};

function fwNote(fw: Framework): string {
  const labels: Record<Framework, string> = {
    react: 'Use @atelier-ui/react. Use functional components with hooks. Handle state with useState.',
    angular: 'Use @atelier-ui/angular. Use standalone components with signal inputs and OnPush change detection.',
    vue: 'Use @atelier-ui/vue. Use <script setup> with defineProps and ref/computed.',
  };
  return labels[fw];
}

const SECTIONS: PromptSection[] = [
  {
    title: 'AI-Native',
    cards: [
      {
        title: 'Chat interface',
        description: 'A chat UI with message history, a text input, and a send button. Shows a skeleton while the response streams.',
        prompt: (fw) => `Fetch the Atelier UI API reference first:
${DOCS_URL}

Build a chat interface using Atelier UI components. ${fwNote(fw)}

Requirements:
- Message list with user and assistant message bubbles (different alignment/background)
- LlmInput with autoResize for the chat input field
- LlmButton (primary, "Send") to submit the message
- LlmSkeleton (3 rows) shown while the assistant response is loading
- LlmCard wrapping the whole chat panel
- Keyboard shortcut: pressing Enter submits the message

State to manage:
- messages: Array<{ role: 'user' | 'assistant'; content: string }>
- inputValue: string
- isLoading: boolean

Do not call a real API — use a 1.5s setTimeout to simulate a response.`,
      },
      {
        title: 'Generated code output',
        description: 'Displays AI-generated code with a LlmCodeBlock inside a LlmCard, with a regenerate button.',
        prompt: (fw) => `Fetch the Atelier UI API reference first:
${DOCS_URL}

Build a "generated code" panel using Atelier UI components. ${fwNote(fw)}

Requirements:
- LlmCard with a header ("Generated Component") and content area
- LlmCodeBlock showing a hardcoded TypeScript snippet (language="typescript", filename="component.ts", showLineNumbers=true)
- A "Regenerate" LlmButton (variant="outline") below the code block
- A LlmBadge (variant="success") in the card header showing "Ready"
- While "regenerating" (simulate with 1.2s timeout), show LlmSkeleton with 4 rows instead of the code block and change the badge to variant="warning" with text "Generating…"`,
      },
    ],
  },
  {
    title: 'Forms',
    cards: [
      {
        title: 'Login form',
        description: 'Email + password fields in a card, with a submit button and basic validation feedback.',
        prompt: (fw) => `Fetch the Atelier UI API reference first:
${DOCS_URL}

Build a login form using Atelier UI components. ${fwNote(fw)}

Requirements:
- LlmCard (max-width 400px, centered) containing:
  - Card header: "Sign in to your account"
  - LlmInput (type="email", label "Email", required)
  - LlmInput (type="password", label "Password", required)
  - LlmButton (variant="primary", full width, "Sign in")
  - LlmButton (variant="outline", full width, "Continue with Google")
- Show LlmAlert (variant="danger") above the form if both fields are empty on submit
- Show loading state on the Sign in button while submitting (simulate 1.5s)`,
      },
      {
        title: 'Settings page',
        description: 'Profile and notification settings inside cards with save feedback via a toast or alert.',
        prompt: (fw) => `Fetch the Atelier UI API reference first:
${DOCS_URL}

Build a settings page using Atelier UI components. ${fwNote(fw)}

Requirements:
- Page title "Settings"
- Two LlmCard sections:

  Profile card:
  - LlmInput for "Display name" (type="text")
  - LlmInput for "Email" (type="email")
  - LlmSelect with options: "UTC", "US/Eastern", "US/Pacific", "Europe/London"
  - LlmButton (primary, "Save profile") — show loading for 1s, then show LlmAlert (variant="success", "Profile saved!")

  Notifications card:
  - LlmToggle labeled "Email notifications"
  - LlmToggle labeled "Weekly digest"
  - LlmToggle labeled "Product updates"
  - LlmButton (outline, "Save preferences")`,
      },
    ],
  },
  {
    title: 'Data Display',
    cards: [
      {
        title: 'Stats dashboard',
        description: 'Three metric cards with numbers, labels, and status badges in a responsive grid.',
        prompt: (fw) => `Fetch the Atelier UI API reference first:
${DOCS_URL}

Build a stats dashboard using Atelier UI components. ${fwNote(fw)}

Requirements:
- Page title "Dashboard"
- Responsive grid (3 columns on desktop, 1 on mobile) of LlmCard components:
  1. "Total Requests" — value: 12,847 — LlmBadge (variant="success") "+12% this week"
  2. "Avg Latency" — value: 342ms — LlmBadge (variant="warning") "p95: 890ms"
  3. "Error Rate" — value: 0.3% — LlmBadge (variant="success") "Below threshold"
- Each card: large bold metric number, muted label below it, badge in card header
- LlmProgress bar below each metric (values: 78, 34, 8 out of 100)`,
      },
      {
        title: 'Data table with pagination',
        description: 'A sortable table of users with status badges, and pagination controls below.',
        prompt: (fw) => `Fetch the Atelier UI API reference first:
${DOCS_URL}

Build a data table using Atelier UI components. ${fwNote(fw)}

Requirements:
- Hardcode 20 users: { id, name, email, role: 'admin'|'editor'|'viewer', status: 'active'|'inactive' }
- LlmTable with columns: Name, Email, Role, Status, Actions
- Status column: LlmBadge — variant="success" for active, variant="default" for inactive
- Role column: LlmBadge — variant="info" for admin, no variant for others
- Actions column: LlmButton (size="sm", variant="outline", "Edit") per row
- LlmPagination below the table — show 5 users per page
- LlmInput above the table for filtering by name (client-side)`,
      },
    ],
  },
  {
    title: 'Navigation',
    cards: [
      {
        title: 'Multi-step form wizard',
        description: 'A 3-step wizard using LlmStepper with back/next buttons and validation gating.',
        prompt: (fw) => `Fetch the Atelier UI API reference first:
${DOCS_URL}

Build a multi-step form wizard using Atelier UI components. ${fwNote(fw)}

Requirements:
- LlmStepper with 3 steps: "Account", "Profile", "Review"
- Step 1 — Account: LlmInput (email, required), LlmInput (password, required)
- Step 2 — Profile: LlmInput (display name), LlmSelect (timezone), LlmToggle (marketing emails)
- Step 3 — Review: Read-only summary of entered values in a LlmCard
- Navigation: LlmButton (outline, "Back") + LlmButton (primary, "Next" / "Submit" on last step)
- Validate required fields before allowing Next — show LlmAlert (variant="warning") if invalid
- On Submit: show LlmAlert (variant="success", "Account created!") and reset to step 0`,
      },
      {
        title: 'Tabbed content panel',
        description: 'Three tabs (Overview, Analytics, Settings) each with different content.',
        prompt: (fw) => `Fetch the Atelier UI API reference first:
${DOCS_URL}

Build a tabbed panel using Atelier UI components. ${fwNote(fw)}

Requirements:
- LlmTabGroup with 3 tabs:
  1. Overview — LlmCard with a paragraph of placeholder text and an LlmBadge (variant="success", "Active")
  2. Analytics — Three LlmProgress bars labeled "Impressions", "Clicks", "Conversions" (values 82, 47, 23)
  3. Settings — LlmToggle ("Public visibility"), LlmInput ("Custom domain"), LlmButton (primary, "Save")
- LlmCard wrapping the entire panel`,
      },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const muted: React.CSSProperties = {
  color: 'var(--ui-color-text-muted)',
  lineHeight: '1.65',
};

function FrameworkSelector({
  value,
  onChange,
}: {
  value: Framework;
  onChange: (fw: Framework) => void;
}) {
  const frameworks: Framework[] = ['react', 'angular', 'vue'];
  return (
    <div style={{ display: 'inline-flex', gap: '0.25rem', padding: '0.25rem', borderRadius: 'var(--ui-radius-md)', background: 'var(--ui-color-surface-raised)', border: '1px solid var(--ui-color-border)' }}>
      {frameworks.map((fw) => (
        <button
          key={fw}
          onClick={() => onChange(fw)}
          style={{
            padding: '0.3rem 0.85rem',
            borderRadius: 'calc(var(--ui-radius-md) - 2px)',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '0.82rem',
            fontWeight: 600,
            transition: 'background var(--ui-transition-fast), color var(--ui-transition-fast)',
            background: value === fw ? 'var(--ui-color-primary)' : 'transparent',
            color: value === fw ? 'var(--ui-color-text-on-primary, #fff)' : 'var(--ui-color-text-muted)',
          }}
        >
          {FRAMEWORK_LABELS[fw]}
        </button>
      ))}
    </div>
  );
}

function PromptCardView({ card, framework }: { card: PromptCard; framework: Framework }) {
  const prompt = card.prompt(framework);
  const [copied, setCopied] = useState(false);

  function copy() {
    void navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div
      style={{
        border: '1px solid var(--ui-color-border)',
        borderRadius: 'var(--ui-radius-md)',
        overflow: 'hidden',
        background: 'var(--ui-color-surface-raised)',
      }}
    >
      {/* Card header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--ui-color-border)',
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{card.title}</div>
          <div style={{ fontSize: '0.82rem', ...muted }}>{card.description}</div>
        </div>
        <button
          onClick={copy}
          style={{
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.35rem 0.8rem',
            border: '1px solid var(--ui-color-border)',
            borderRadius: 'var(--ui-radius-sm)',
            background: copied ? 'var(--ui-color-primary-light)' : 'var(--ui-color-background)',
            color: copied ? 'var(--ui-color-primary)' : 'var(--ui-color-text-muted)',
            fontSize: '0.78rem',
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'background 0.15s, color 0.15s',
            whiteSpace: 'nowrap',
          }}
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              Copied
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
              Copy prompt
            </>
          )}
        </button>
      </div>

      {/* Prompt body */}
      <CodeBlock lang="markdown" code={prompt} />
    </div>
  );
}

function PromptsPage() {
  const [framework, setFramework] = useState<Framework>('react');

  return (
    <div className="docs-page" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div className="docs-page-header">
        <h1 className="docs-page-title">Prompt Templates</h1>
        <p className="docs-page-description" style={{ marginBottom: 0 }}>
          Pre-written prompts that produce correct Atelier UI code on the first try.
          Paste into Claude, ChatGPT, or any LLM — each prompt instructs the model to
          fetch the full API reference before generating.
        </p>
      </div>

      {/* How to use */}
      <div className="docs-section">
        <h2 className="docs-section-title">How to use</h2>
        <p style={muted}>
          Each prompt below starts by fetching{' '}
          <code style={{ fontSize: '0.85em' }}>llms-full.txt</code> — the complete API
          reference for all Atelier UI components. The LLM reads it before generating,
          so it uses the correct prop names, types, and import paths without hallucinating.
        </p>
        <ol style={{ ...muted, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <li>Select your framework below.</li>
          <li>Click "Copy prompt" on any card.</li>
          <li>Paste into your LLM of choice and send.</li>
        </ol>
      </div>

      {/* Framework selector */}
      <div className="docs-section" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--ui-color-text-muted)' }}>Framework:</span>
        <FrameworkSelector value={framework} onChange={setFramework} />
      </div>

      {/* Prompt sections */}
      {SECTIONS.map((section) => (
        <div key={section.title} className="docs-section">
          <h2 className="docs-section-title">{section.title}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {section.cards.map((card) => (
              <PromptCardView key={card.title} card={card} framework={framework} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
