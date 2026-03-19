# Storybook MCPs: The Future of Frontend Engineering

**Format:** 30-minute conference talk

---

## Section 1: The Problem — The Context Gap

AI-generated Storybook stories have a consistent set of failure modes. An AI model only knows what fits inside its "context window" (its short-term memory). If it can't see your specific codebase, it guesses. This leads to code that compiles and runs, but tells you nothing.

### The "happy path only" trap
Ask an AI to write a story for a button and you get one story. Missing: `Disabled`, `Loading`, `Error` — every state that actually breaks in production.

### The version tax
Storybook 9 changed import paths (e.g., `storybook/test` vs `@storybook/test`). AI models guess based on old training data and fail.

### The Hallucination tax
"Hallucination" is when the AI confidently invents code or APIs that don't actually exist in your project. It generates generic Tailwind or Material UI because it doesn't know your internal library exists. It creates "new" components instead of using your established ones.

---

## Section 2: What is Storybook and what is a Story?

Before diving into how AI interacts with Storybook, let's establish what it is. Storybook is a frontend workshop for building UI components and pages in isolation.

### What is a "Story"?
A "story" captures a single, specific state of a UI component. Instead of clicking through a complex application to see what a button looks like when it's disabled, you write a story for it.

### Example: The LLMButton
Here is what a story looks like in code. We define the default component, and then export different "stories" (states) like `Primary`, `Small`, or `Disabled`:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { LlmButton } from './llm-button';

const meta: Meta<typeof LlmButton> = {
  title: 'Components/LlmButton',
  component: LlmButton,
};
export default meta;

type Story = StoryObj<typeof LlmButton>;

// Story: The primary variant of the button
export const Primary: Story = { 
  args: { variant: 'primary' } 
};

// Story: The button in a disabled state
export const Disabled: Story = { 
  args: { disabled: true } 
};

// Story: The button in a loading state
export const Loading: Story = { 
  args: { loading: true } 
};
```
By isolating components, we give both humans and AI a clear sandbox to build, test, and document UI.

---

## Section 3: What is MCP?

Model Context Protocol (MCP) is the **"USB-C port for AI context"**. It replaces brittle, custom API integrations with a unified, bi-directional communication layer.

![MCP Architecture](./mcp-architecture.png)

### The Architecture: Client-Server-Host

- **AI Host:** The main application (e.g., Claude Desktop, Cursor) that coordinates the user session.
- **MCP Client:** The standard-compliant component within the host.
- **MCP Server:** A lightweight service that exposes capabilities through **Tools**, **Resources**, and **Prompts**.

- **Stdio Transport:** Local, zero-network communication.
- **JSON-RPC 2.0:** Deterministic, structured messaging.
- **Local-First:** Your source code never leaves your machine.

---

## Section 4: The Full Design-to-Code Cycle

True power comes from combining **Design Intent** with **Implementation Reality**.

![Full Design-to-Code Cycle](./complete-workflow.png)

### The Bridge: Intent vs. Reality

1. **Extraction (Figma MCP):** Figma is the industry-standard collaborative tool where designers visually create the UI. The AI connects to it and reads raw tokens and auto-layout directly. No more guessing from screenshots.
2. **Discovery (Storybook MCP):** The AI scans your component library to see what's already built.
3. **Generation:** The AI maps Figma "intent" to your "real" components.
4. **Validation:** The AI runs tests and captures screenshots to ensure parity.

---

## Section 5: Figma Console MCP — The Design Truth

![Figma Console MCP](./figma-mcp.png)

The Figma Console MCP gives the AI a direct API into your design files.

### Design Discovery API (`figma_get_design_system_kit`)
The AI extracts the entire design system in one optimized call:
- **Tokens:** Named variables for design choices (e.g., `color-brand-blue = #0052cc`) that keep design and code in sync for colors, spacing, and typography.
- **Components:** Metadata, properties, and variants.
- **Styles:** Effect and grid definitions.

### Implementation Support (`figma_get_component_for_development`)
Returns technical specs optimized for coding:
- **Layout:** Exact CSS-like values for padding, gap, and size.
- **Typography:** Font weight, family, and line height.
- **Image Preview:** A 2x PNG rendering for visual reference.

### Audit & Validation (`figma_check_design_parity`)
The AI compares the design system truth against your code:
- **Parity Score:** 0-100% match.
- **Discrepancy Report:** Missing props, color mismatches, or layout drifts.
- **Actionable Fixes:** Suggested code or design changes to restore parity.

---

## Section 6: Storybook MCP — The Implementation Truth

![Storybook MCP](./storybook-mcp.png)

The Storybook MCP ensures the AI never hallucinates an API.

### Discovery API (`list-all-documentation`)
The AI starts by scanning the entire system to find established components:
```text
- LlmAlert (components-llmalert)
- LlmAvatar (components-llmavatar)
- LlmButton (components-llmbutton)
- LlmCheckbox (components-llmcheckbox)
...
```

### Documentation API (`get-documentation`)
Once a component is selected, the AI reads its **living specification**:
```markdown
# LlmButton (components-llmbutton)

## Props
- variant: 'primary' | 'secondary' | 'outline' (default: 'primary')
- size: 'sm' | 'md' | 'lg' (default: 'md')
- loading: boolean
...

## Real Usage Examples (from existing stories)
```typescript
<LlmButton variant="primary" size="md">Button</LlmButton>
```

---

## Section 7: Mandatory Guardrails (`get-storybook-story-instructions`)

This tool provides the **rules of engagement**. It prevents the "version tax" by telling the AI exactly what you have installed.

### Version-Specific Guidance
```diff
// Storybook 9 forces package consolidation
- import { fn } from '@storybook/test';
+ import { fn } from 'storybook/test';

- import { Meta } from '@storybook/react';
+ import { Meta } from '@storybook/react-vite';
```

### Critical Implementation Rules
- **Mocking Strategy:** When simulating external data or services so a component can run in isolation (mocking), relative imports must use **file extensions**.
- **Play Function Syntax:** Do NOT use `within(canvas)`; `canvas` already has query methods.
- **Coverage Goals:** Happy path, Error, Loading, and Empty states are **required**.

---

## Section 8: Autonomous Verification Loop (`run-story-tests`)

![Autonomous Verification Loop](./autonomous-loop.png)

Stop switching windows to check if it works.

- **The Verification Loop:** If a `play` function fails, the AI sees the stack trace and fixes the bug automatically.
- **Interactive A11y (Accessibility):** Runs accessibility audits (`a11y: true`) during development to ensure the UI is usable for everyone (like screen reader users). It fixes semantic issues (like missing form labels) instantly.

---

## Section 9: Closing the Loop (`preview-stories`)

The feedback loop belongs inside the chat.

- **Props & Globals Override:** Preview "Dark Mode" or "Loading" without writing a new story.
- **Visual Confidence:** The AI includes clickable preview URLs in every response. One click to confirm, zero context switching.

---

## Section 10: Maintaining Parity at Scale

How do we stop visual drift?

- **Continuous Auditing:** Use `figma_check_design_parity` to detect when code and design diverge.
- **Automated Fixes:** The AI generates reports with the exact code changes needed to match the latest design system update.

---

## Section 11: Real Examples (Angular/React)

### Angular Wrapper Pattern
For complex DI or services, the AI learns to use the Wrapper @Component pattern:
```typescript
@Component({ template: `<toast-story-wrapper />` })
class ToastStoryWrapper { ... }
```

### React Controlled State
The AI uses `useState` in story renders to handle complex interactions:
```tsx
const [open, setOpen] = useState(false);
return <LlmDialog open={open} onOpenChange={setOpen} />;
```

---

## Section 12: The Senior Developer's New Role

If the AI does the "translation," what do you do?

1. **Review Intent:** Is the Figma design architecturally sound?
2. **Review High-Level Logic:** Does the generated component follow your team's patterns?
3. **Orchestrate complexity:** Handle the 10% of cases the AI can't reach.
4. **System Maintenance:** Maintain the MCP servers and generator templates.

---

## Section 13: The Full Enforced Workflow (Summary)

```
User: "Implement the login form from Figma"
          │
          ▼
AI: Reads Figma Tokens → Discovers SB Components → Scans SB9 Rules
          │
          ▼
AI: Writes implementation using <LlmInput> & <LlmButton>
          │
          ▼
AI: Runs Story Tests → Performs A11y Audit → Captures Screenshot
          │
          ▼
AI: "Verified. Preview: [Link]. No A11y issues found."
```

---

## Section 14: Closing & Resources

- **Install `@storybook/mcp`** — Get version-correct imports today.
- **Install `figma-console-mcp`** — Connect your AI to your design truth.
- **Add the `CLAUDE.md` rule** — Make it mandatory, not optional.

### Questions?
Find the full source code and these MCP tools in the `angular-llm-components` repo.
