import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import {
  LlmChat,
  LlmChatHeader,
  LlmChatInput,
  LlmChatMessage,
  LlmChatMessages,
  LlmChatSuggestion,
  LlmChatTyping,
} from './llm-chat';
import { LlmAvatar } from '../avatar/llm-avatar';
import { LlmBadge } from '../badge/llm-badge';
import { LlmAlert } from '../alert/llm-alert';
import { LlmCodeBlock } from '../code-block/llm-code-block';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: 'figma'; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const CHAT_IMPORTS = [
  LlmChat,
  LlmChatHeader,
  LlmChatMessages,
  LlmChatMessage,
  LlmChatTyping,
  LlmChatSuggestion,
  LlmChatInput,
  LlmAvatar,
  LlmBadge,
  LlmAlert,
  LlmCodeBlock,
];

const meta: Meta<LlmChat> = {
  title: 'Components/AI/LlmChat',
  component: LlmChat,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: CHAT_IMPORTS })],
  argTypes: {
    variant: { control: 'select', options: ['drawer', 'popup', 'inline'] },
    status: { control: 'select', options: ['idle', 'streaming', 'error'] },
    open: { control: 'boolean' },
  },
  args: {
    variant: 'drawer',
    status: 'idle',
    open: true,
  },
  parameters: {
    design: figmaNode('507-2953'),
  },
};

export default meta;
type Story = StoryObj<LlmChat>;

// ─────────────────────────────────────────────────────────────────────────────
// DRAWER
// ─────────────────────────────────────────────────────────────────────────────

export const DrawerDefault: Story = {
  parameters: { design: figmaNode('507-2950') },
  args: { variant: 'drawer', status: 'idle', open: true },
  render: (args) => ({
    props: args,
    template: `
      <llm-chat [variant]="variant" [status]="status" [(open)]="open">
        <llm-chat-header>
          <llm-avatar size="sm" name="AI" />
          <span>AI Assistant</span>
          <llm-badge variant="success" size="sm">Online</llm-badge>
        </llm-chat-header>
        <llm-chat-messages>
          <llm-chat-message role="assistant">Hi! I'm your AI assistant. How can I help you today?</llm-chat-message>
          <llm-chat-message role="user">Show me a minimal Angular form using LlmInput.</llm-chat-message>
          <llm-chat-message role="assistant">
            Sure, here you go:
            <llm-code-block
              language="typescript"
              filename="form.html"
              [code]="codeSample" />
          </llm-chat-message>
          <llm-chat-message role="user">Thanks!</llm-chat-message>
        </llm-chat-messages>
        <llm-chat-input />
      </llm-chat>
    `,
    moduleMetadata: { imports: CHAT_IMPORTS },
    applicationConfig: {},
    userDefinedTemplate: true,
    props: {
      ...args,
      codeSample: `<llm-input\n  [formField]="f.email"\n  type="email"\n  placeholder="Email" />`,
    },
  }),
};

export const DrawerEmpty: Story = {
  parameters: { design: figmaNode('507-2950') },
  args: { variant: 'drawer', status: 'idle', open: true },
  render: (args) => ({
    props: args,
    template: `
      <llm-chat [variant]="variant" [status]="status" [(open)]="open">
        <llm-chat-header>
          <llm-avatar size="sm" name="AI" />
          <span>AI Assistant</span>
          <llm-badge variant="success" size="sm">Online</llm-badge>
        </llm-chat-header>
        <llm-chat-messages>
          <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;padding:2rem 0;">
            <llm-avatar size="xl" name="AI" />
            <div style="font-weight:600;font-size:1.125rem;margin-top:0.5rem;">How can I help today?</div>
            <div style="color:var(--ui-color-text-muted);font-size:0.875rem;">Pick a suggestion or ask anything.</div>
          </div>
          <llm-chat-suggestion label="Explain a code snippet" hint="Tap to start →" />
          <llm-chat-suggestion label="Generate an Angular form layout" hint="Tap to start →" />
          <llm-chat-suggestion label="Suggest test cases for a component" hint="Tap to start →" />
        </llm-chat-messages>
        <llm-chat-input />
      </llm-chat>
    `,
  }),
};

export const DrawerStreaming: Story = {
  parameters: { design: figmaNode('507-2950') },
  args: { variant: 'drawer', status: 'streaming', open: true },
  render: (args) => ({
    props: args,
    template: `
      <llm-chat [variant]="variant" [status]="status" [(open)]="open">
        <llm-chat-header>
          <llm-avatar size="sm" name="AI" />
          <span>AI Assistant</span>
          <llm-badge variant="warning" size="sm">Thinking…</llm-badge>
        </llm-chat-header>
        <llm-chat-messages>
          <llm-chat-message role="assistant">Hi! How can I help?</llm-chat-message>
          <llm-chat-message role="user">Write a small sorting function for my user list (by name, asc).</llm-chat-message>
          <llm-chat-message role="assistant">Sure! Here's a one-liner using Array.prototype.sort with a<llm-chat-typing inline /></llm-chat-message>
        </llm-chat-messages>
        <llm-chat-input />
      </llm-chat>
    `,
  }),
};

export const DrawerError: Story = {
  parameters: { design: figmaNode('507-2950') },
  args: { variant: 'drawer', status: 'error', open: true },
  render: (args) => ({
    props: args,
    template: `
      <llm-chat [variant]="variant" [status]="status" [(open)]="open">
        <llm-chat-header>
          <llm-avatar size="sm" name="AI" />
          <span>AI Assistant</span>
          <llm-badge variant="danger" size="sm">Disconnected</llm-badge>
        </llm-chat-header>
        <llm-chat-messages>
          <llm-chat-message role="assistant">Hi! How can I help?</llm-chat-message>
          <llm-chat-message role="user">Refactor my LlmCard usage in the dashboard.</llm-chat-message>
          <llm-chat-message role="assistant" [failed]="true">Couldn't reach the assistant. No response received.</llm-chat-message>
          <llm-alert variant="danger">Connection lost. Check your network and try again.</llm-alert>
        </llm-chat-messages>
        <llm-chat-input />
      </llm-chat>
    `,
  }),
};

// ─────────────────────────────────────────────────────────────────────────────
// POPUP
// ─────────────────────────────────────────────────────────────────────────────

export const PopupDefault: Story = {
  parameters: { design: figmaNode('507-2951') },
  args: { variant: 'popup', status: 'idle', open: true },
  render: (args) => ({
    props: args,
    template: `
      <llm-chat [variant]="variant" [status]="status" [(open)]="open">
        <llm-chat-header>
          <llm-avatar size="sm" name="AI" />
          <span>AI Assistant</span>
          <llm-badge variant="success" size="sm">Online</llm-badge>
        </llm-chat-header>
        <llm-chat-messages>
          <llm-chat-message role="assistant">Hi! How can I help you today?</llm-chat-message>
          <llm-chat-message role="user">Can you summarize this dashboard?</llm-chat-message>
          <llm-chat-message role="assistant">You're tracking 12 KPIs. Three are below target: Conversion (-8%), CTR (-12%), and Sessions (-3%).</llm-chat-message>
          <llm-chat-message role="user">Show me CTR.</llm-chat-message>
        </llm-chat-messages>
        <llm-chat-input />
      </llm-chat>
    `,
  }),
};

export const PopupEmpty: Story = {
  parameters: { design: figmaNode('507-2951') },
  args: { variant: 'popup', status: 'idle', open: true },
  render: (args) => ({
    props: args,
    template: `
      <llm-chat [variant]="variant" [status]="status" [(open)]="open">
        <llm-chat-header>
          <llm-avatar size="sm" name="AI" />
          <span>AI Assistant</span>
          <llm-badge variant="success" size="sm">Online</llm-badge>
        </llm-chat-header>
        <llm-chat-messages>
          <div style="display:flex;flex-direction:column;align-items:center;gap:0.25rem;padding:1.5rem 0;">
            <llm-avatar size="lg" name="AI" />
            <div style="font-weight:600;font-size:1rem;margin-top:0.5rem;">Hi there</div>
            <div style="color:var(--ui-color-text-muted);font-size:0.75rem;">I can help with code, content, and Q&A.</div>
          </div>
          <llm-chat-suggestion label="Summarize this page" />
          <llm-chat-suggestion label="Generate sample data" />
          <llm-chat-suggestion label="Explain a function" />
        </llm-chat-messages>
        <llm-chat-input />
      </llm-chat>
    `,
  }),
};

export const PopupStreaming: Story = {
  parameters: { design: figmaNode('507-2951') },
  args: { variant: 'popup', status: 'streaming', open: true },
  render: (args) => ({
    props: args,
    template: `
      <llm-chat [variant]="variant" [status]="status" [(open)]="open">
        <llm-chat-header>
          <llm-avatar size="sm" name="AI" />
          <span>AI Assistant</span>
          <llm-badge variant="warning" size="sm">Thinking…</llm-badge>
        </llm-chat-header>
        <llm-chat-messages>
          <llm-chat-message role="assistant">Hi! How can I help?</llm-chat-message>
          <llm-chat-message role="user">Draft a release note for v3.</llm-chat-message>
          <llm-chat-message role="assistant">Sure! Here's a draft: ## v3.0 — What's new * New LlmChat component for AI…<llm-chat-typing inline /></llm-chat-message>
        </llm-chat-messages>
        <llm-chat-input />
      </llm-chat>
    `,
  }),
};

export const PopupError: Story = {
  parameters: { design: figmaNode('507-2951') },
  args: { variant: 'popup', status: 'error', open: true },
  render: (args) => ({
    props: args,
    template: `
      <llm-chat [variant]="variant" [status]="status" [(open)]="open">
        <llm-chat-header>
          <llm-avatar size="sm" name="AI" />
          <span>AI Assistant</span>
          <llm-badge variant="danger" size="sm">Disconnected</llm-badge>
        </llm-chat-header>
        <llm-chat-messages>
          <llm-chat-message role="assistant">Hi! How can I help?</llm-chat-message>
          <llm-chat-message role="user">Translate to French.</llm-chat-message>
          <llm-chat-message role="assistant" [failed]="true">Couldn't reach the assistant.</llm-chat-message>
          <llm-alert variant="danger">Connection lost. Check your network and try again.</llm-alert>
        </llm-chat-messages>
        <llm-chat-input />
      </llm-chat>
    `,
  }),
};

// ─────────────────────────────────────────────────────────────────────────────
// INLINE
// ─────────────────────────────────────────────────────────────────────────────

export const InlineDefault: Story = {
  parameters: { design: figmaNode('507-2952') },
  args: { variant: 'inline', status: 'idle', open: true },
  render: (args) => ({
    props: args,
    template: `
      <div style="height:540px;width:720px;">
        <llm-chat [variant]="variant" [status]="status" [(open)]="open">
          <llm-chat-header>
            <llm-avatar size="sm" name="AI" />
            <span>Atelier Assistant</span>
            <llm-badge variant="success" size="sm">Online · GPT-4o</llm-badge>
          </llm-chat-header>
          <llm-chat-messages>
            <llm-chat-message role="assistant">Welcome back, Dominik. I see you're working in the Atelier repo. How can I help today?</llm-chat-message>
            <llm-chat-message role="user">Help me write a Storybook story for the new LlmChat component, with all 3 variants.</llm-chat-message>
            <llm-chat-message role="assistant">
              Sure — here's a starting point:
              <llm-code-block
                language="typescript"
                filename="llm-chat.stories.ts"
                [code]="codeSample" />
            </llm-chat-message>
          </llm-chat-messages>
          <llm-chat-input />
        </llm-chat>
      </div>
    `,
    props: {
      ...args,
      codeSample: `export default {\n  title: 'AI/LlmChat',\n  component: LlmChat,\n  args: { variant: 'drawer' }\n};\n\nexport const Drawer = { args: { variant: 'drawer' } };`,
    },
  }),
};

export const InlineEmpty: Story = {
  parameters: { design: figmaNode('507-2952') },
  args: { variant: 'inline', status: 'idle', open: true },
  render: (args) => ({
    props: args,
    template: `
      <div style="height:540px;width:720px;">
        <llm-chat [variant]="variant" [status]="status" [(open)]="open">
          <llm-chat-header>
            <llm-avatar size="sm" name="AI" />
            <span>Atelier Assistant</span>
            <llm-badge variant="success" size="sm">Online · GPT-4o</llm-badge>
          </llm-chat-header>
          <llm-chat-messages>
            <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;padding:2.5rem 0;">
              <llm-avatar size="xl" name="AI" />
              <div style="font-weight:600;font-size:1.375rem;margin-top:0.5rem;">How can I help today?</div>
              <div style="color:var(--ui-color-text-muted);font-size:0.875rem;">Ask a question, generate code, or pick a starter below.</div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
              <llm-chat-suggestion label="Write a Storybook story" hint="Generate stories for any component" />
              <llm-chat-suggestion label="Explain a snippet" hint="Walk through a piece of code" />
              <llm-chat-suggestion label="Suggest test cases" hint="Spec, edge cases, accessibility" />
              <llm-chat-suggestion label="Refactor for signals" hint="Migrate from CVA to Signal Forms" />
            </div>
          </llm-chat-messages>
          <llm-chat-input />
        </llm-chat>
      </div>
    `,
  }),
};

export const InlineStreaming: Story = {
  parameters: { design: figmaNode('507-2952') },
  args: { variant: 'inline', status: 'streaming', open: true },
  render: (args) => ({
    props: args,
    template: `
      <div style="height:540px;width:720px;">
        <llm-chat [variant]="variant" [status]="status" [(open)]="open">
          <llm-chat-header>
            <llm-avatar size="sm" name="AI" />
            <span>Atelier Assistant</span>
            <llm-badge variant="warning" size="sm">Thinking…</llm-badge>
          </llm-chat-header>
          <llm-chat-messages>
            <llm-chat-message role="assistant">Welcome back. What would you like to work on?</llm-chat-message>
            <llm-chat-message role="user">Generate test cases for LlmChat — cover keyboard, screen reader, and streaming behavior.</llm-chat-message>
            <llm-chat-message role="assistant">Here are the test cases I'm drafting:
1. Renders all three variants without runtime errors
2. Tab moves focus into the input area first
3. Escape closes drawer/popup variants
4. Streaming state announces with<llm-chat-typing inline /></llm-chat-message>
          </llm-chat-messages>
          <llm-chat-input />
        </llm-chat>
      </div>
    `,
  }),
};

export const InlineError: Story = {
  parameters: { design: figmaNode('507-2952') },
  args: { variant: 'inline', status: 'error', open: true },
  render: (args) => ({
    props: args,
    template: `
      <div style="height:540px;width:720px;">
        <llm-chat [variant]="variant" [status]="status" [(open)]="open">
          <llm-chat-header>
            <llm-avatar size="sm" name="AI" />
            <span>Atelier Assistant</span>
            <llm-badge variant="danger" size="sm">Disconnected</llm-badge>
          </llm-chat-header>
          <llm-chat-messages>
            <llm-chat-message role="assistant">Welcome back. What would you like to work on?</llm-chat-message>
            <llm-chat-message role="user">Refactor my dashboard to use Signal Forms throughout.</llm-chat-message>
            <llm-chat-message role="assistant" [failed]="true">Couldn't reach the assistant. The server returned no response.</llm-chat-message>
            <llm-alert variant="danger">Connection lost — couldn't reach the assistant. Check your network or try again later.</llm-alert>
          </llm-chat-messages>
          <llm-chat-input />
        </llm-chat>
      </div>
    `,
  }),
};
