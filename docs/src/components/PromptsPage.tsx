import { useState } from 'react';

type Framework = 'react' | 'angular' | 'vue';

const DOCS_URL = 'https://atelier.pieper.io/llms-full.txt';

interface PromptCard {
  title: string;
  description: string;
  prompt: (fw: Framework) => string;
}

interface PromptSection {
  title: string;
  cards: PromptCard[];
}

const FRAMEWORK_LABELS: Record<Framework, string> = { react: 'React', angular: 'Angular', vue: 'Vue' };
const FRAMEWORK_COLORS: Record<Framework, string> = { angular: '#e23237', react: '#61dafb', vue: '#42b883' };

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
        prompt: (fw) => `Fetch the Atelier UI API reference first:\n${DOCS_URL}\n\nBuild a chat interface using Atelier UI components. ${fwNote(fw)}\n\nRequirements:\n- Message list with user and assistant message bubbles (different alignment/background)\n- LlmInput with autoResize for the chat input field\n- LlmButton (primary, "Send") to submit the message\n- LlmSkeleton (3 rows) shown while the assistant response is loading\n- LlmCard wrapping the whole chat panel\n- Keyboard shortcut: pressing Enter submits the message\n\nState to manage:\n- messages: Array<{ role: 'user' | 'assistant'; content: string }>\n- inputValue: string\n- isLoading: boolean\n\nDo not call a real API — use a 1.5s setTimeout to simulate a response.`,
      },
      {
        title: 'Generated code output',
        description: 'Displays AI-generated code with a LlmCodeBlock inside a LlmCard, with a regenerate button.',
        prompt: (fw) => `Fetch the Atelier UI API reference first:\n${DOCS_URL}\n\nBuild a "generated code" panel using Atelier UI components. ${fwNote(fw)}\n\nRequirements:\n- LlmCard with a header ("Generated Component") and content area\n- LlmCodeBlock showing a hardcoded TypeScript snippet (language="typescript", filename="component.ts", showLineNumbers=true)\n- A "Regenerate" LlmButton (variant="outline") below the code block\n- A LlmBadge (variant="success") in the card header showing "Ready"\n- While "regenerating" (simulate with 1.2s timeout), show LlmSkeleton with 4 rows instead of the code block and change the badge to variant="warning" with text "Generating…"`,
      },
    ],
  },
  {
    title: 'Forms',
    cards: [
      {
        title: 'Login form',
        description: 'Email + password fields in a card, with a submit button and basic validation feedback.',
        prompt: (fw) => `Fetch the Atelier UI API reference first:\n${DOCS_URL}\n\nBuild a login form using Atelier UI components. ${fwNote(fw)}\n\nRequirements:\n- LlmCard (max-width 400px, centered) containing:\n  - Card header: "Sign in to your account"\n  - LlmInput (type="email", label "Email", required)\n  - LlmInput (type="password", label "Password", required)\n  - LlmButton (variant="primary", full width, "Sign in")\n  - LlmButton (variant="outline", full width, "Continue with Google")\n- Show LlmAlert (variant="danger") above the form if both fields are empty on submit\n- Show loading state on the Sign in button while submitting (simulate 1.5s)`,
      },
      {
        title: 'Settings page',
        description: 'Profile and notification settings inside cards with save feedback via a toast or alert.',
        prompt: (fw) => `Fetch the Atelier UI API reference first:\n${DOCS_URL}\n\nBuild a settings page using Atelier UI components. ${fwNote(fw)}\n\nRequirements:\n- Page title "Settings"\n- Two LlmCard sections:\n\n  Profile card:\n  - LlmInput for "Display name" (type="text")\n  - LlmInput for "Email" (type="email")\n  - LlmSelect with options: "UTC", "US/Eastern", "US/Pacific", "Europe/London"\n  - LlmButton (primary, "Save profile") — show loading for 1s, then show LlmAlert (variant="success", "Profile saved!")\n\n  Notifications card:\n  - LlmToggle labeled "Email notifications"\n  - LlmToggle labeled "Weekly digest"\n  - LlmToggle labeled "Product updates"\n  - LlmButton (outline, "Save preferences")`,
      },
    ],
  },
  {
    title: 'Data Display',
    cards: [
      {
        title: 'Stats dashboard',
        description: 'Three metric cards with numbers, labels, and status badges in a responsive grid.',
        prompt: (fw) => `Fetch the Atelier UI API reference first:\n${DOCS_URL}\n\nBuild a stats dashboard using Atelier UI components. ${fwNote(fw)}\n\nRequirements:\n- Page title "Dashboard"\n- Responsive grid (3 columns on desktop, 1 on mobile) of LlmCard components:\n  1. "Total Requests" — value: 12,847 — LlmBadge (variant="success") "+12% this week"\n  2. "Avg Latency" — value: 342ms — LlmBadge (variant="warning") "p95: 890ms"\n  3. "Error Rate" — value: 0.3% — LlmBadge (variant="success") "Below threshold"\n- Each card: large bold metric number, muted label below it, badge in card header\n- LlmProgress bar below each metric (values: 78, 34, 8 out of 100)`,
      },
      {
        title: 'Data table with pagination',
        description: 'A sortable table of users with status badges, and pagination controls below.',
        prompt: (fw) => `Fetch the Atelier UI API reference first:\n${DOCS_URL}\n\nBuild a data table using Atelier UI components. ${fwNote(fw)}\n\nRequirements:\n- Hardcode 20 users: { id, name, email, role: 'admin'|'editor'|'viewer', status: 'active'|'inactive' }\n- LlmTable with columns: Name, Email, Role, Status, Actions\n- Status column: LlmBadge — variant="success" for active, variant="default" for inactive\n- Role column: LlmBadge — variant="info" for admin, no variant for others\n- Actions column: LlmButton (size="sm", variant="outline", "Edit") per row\n- LlmPagination below the table — show 5 users per page\n- LlmInput above the table for filtering by name (client-side)`,
      },
    ],
  },
  {
    title: 'Navigation',
    cards: [
      {
        title: 'Multi-step form wizard',
        description: 'A 3-step wizard using LlmStepper with back/next buttons and validation gating.',
        prompt: (fw) => `Fetch the Atelier UI API reference first:\n${DOCS_URL}\n\nBuild a multi-step form wizard using Atelier UI components. ${fwNote(fw)}\n\nRequirements:\n- LlmStepper with 3 steps: "Account", "Profile", "Review"\n- Step 1 — Account: LlmInput (email, required), LlmInput (password, required)\n- Step 2 — Profile: LlmInput (display name), LlmSelect (timezone), LlmToggle (marketing emails)\n- Step 3 — Review: Read-only summary of entered values in a LlmCard\n- Navigation: LlmButton (outline, "Back") + LlmButton (primary, "Next" / "Submit" on last step)\n- Validate required fields before allowing Next — show LlmAlert (variant="warning") if invalid\n- On Submit: show LlmAlert (variant="success", "Account created!") and reset to step 0`,
      },
      {
        title: 'Tabbed content panel',
        description: 'Three tabs (Overview, Analytics, Settings) each with different content.',
        prompt: (fw) => `Fetch the Atelier UI API reference first:\n${DOCS_URL}\n\nBuild a tabbed panel using Atelier UI components. ${fwNote(fw)}\n\nRequirements:\n- LlmTabGroup with 3 tabs:\n  1. Overview — LlmCard with a paragraph of placeholder text and an LlmBadge (variant="success", "Active")\n  2. Analytics — Three LlmProgress bars labeled "Impressions", "Clicks", "Conversions" (values 82, 47, 23)\n  3. Settings — LlmToggle ("Public visibility"), LlmInput ("Custom domain"), LlmButton (primary, "Save")\n- LlmCard wrapping the entire panel`,
      },
    ],
  },
];

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
    <div style={{ borderRadius: 'var(--ui-radius-md)', overflow: 'hidden', background: 'var(--ui-color-surface-raised)' }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: '1rem', padding: '0.9rem 1.1rem',
        background: 'rgba(68,218,218,0.04)', borderBottom: '1px solid rgba(64,72,93,0.2)',
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem', color: 'var(--ui-color-text)' }}>
            {card.title}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--ui-color-text-muted)', lineHeight: '1.55' }}>
            {card.description}
          </div>
        </div>
        <button
          onClick={copy}
          style={{
            flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.3rem 0.75rem', border: 'none', borderRadius: 'var(--ui-radius-sm)',
            background: copied
              ? 'rgba(68,218,218,0.15)'
              : 'linear-gradient(135deg, var(--ui-color-primary) 0%, var(--docs-secondary, #89ceff) 100%)',
            color: copied ? 'var(--ui-color-primary)' : '#09141d',
            fontSize: '0.72rem', fontWeight: 700, fontFamily: 'monospace', cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          {copied ? '✓ copied' : 'copy prompt'}
        </button>
      </div>
      <div className="docs-code-block" style={{ borderRadius: 0 }}>
        <div className="docs-code-block-header"><span className="docs-code-block-lang">markdown</span></div>
        <pre style={{ maxHeight: '260px', overflow: 'auto' }}><code>{prompt}</code></pre>
      </div>
    </div>
  );
}

export default function PromptsPage() {
  const [framework, setFramework] = useState<Framework>('react');

  return (
    <div className="docs-inline-page">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.04em', lineHeight: 1.1,
          margin: '0 0 0.6rem',
          background: 'linear-gradient(135deg, var(--ui-color-primary) 0%, var(--docs-secondary, #89ceff) 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          Prompt Templates
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--ui-color-text-muted)', margin: 0, maxWidth: '560px', lineHeight: '1.65' }}>
          Pre-written prompts that produce correct Atelier UI code on the first try.
          Each prompt instructs the model to fetch the full API reference before generating.
        </p>
      </div>

      <div style={{
        padding: '1rem 1.25rem', background: 'rgba(68,218,218,0.05)',
        border: '1px solid rgba(68,218,218,0.1)', borderRadius: 'var(--ui-radius-md)', marginBottom: '2rem',
      }}>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--ui-color-text)' }}>
          How to use
        </p>
        <p style={{ margin: '0 0 0.65rem', fontSize: '0.82rem', color: 'var(--ui-color-text-muted)', lineHeight: '1.6' }}>
          Each prompt fetches <code style={{ fontFamily: 'monospace', color: 'var(--ui-color-primary)' }}>llms-full.txt</code> first — the complete API reference. The LLM reads it before generating, so it uses the correct prop names and import paths without hallucinating.
        </p>
        <ol style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.82rem', color: 'var(--ui-color-text-muted)', lineHeight: '1.9' }}>
          <li>Select your framework below.</li>
          <li>Click <strong style={{ color: 'var(--ui-color-text)', fontFamily: 'monospace' }}>copy prompt</strong> on any card.</li>
          <li>Paste into your LLM of choice and send.</li>
        </ol>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ui-color-text-muted)' }}>
          Framework
        </span>
        <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
          {(['react', 'angular', 'vue'] as Framework[]).map((fw) => {
            const active = framework === fw;
            const color = FRAMEWORK_COLORS[fw];
            return (
              <button key={fw} onClick={() => setFramework(fw)} style={{
                padding: '0.3rem 0.85rem', borderRadius: 'var(--ui-radius-md)', border: 'none', cursor: 'pointer',
                fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: active ? 700 : 500,
                background: active ? `${color}22` : 'transparent',
                color: active ? color : 'var(--ui-color-text-muted)',
              }}>
                {FRAMEWORK_LABELS[fw]}
              </button>
            );
          })}
        </div>
      </div>

      {SECTIONS.map((section, si) => (
        <div key={section.title} style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <span style={{
              fontFamily: 'monospace', fontSize: '0.62rem', fontWeight: 700,
              color: 'var(--docs-secondary, #89ceff)', background: 'rgba(137,206,255,0.1)',
              padding: '0.1rem 0.4rem', borderRadius: '3px', letterSpacing: '0.04em',
            }}>
              {String(si + 1).padStart(2, '0')}
            </span>
            <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--ui-color-text)', letterSpacing: '-0.02em' }}>
              {section.title}
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {section.cards.map((card) => (
              <PromptCardView key={card.title} card={card} framework={framework} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
