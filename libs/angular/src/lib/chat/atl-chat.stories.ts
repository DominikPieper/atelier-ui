import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import {
  AtlChat,
  AtlChatHeader,
  AtlChatInput,
  AtlChatMessage,
  AtlChatMessages,
  AtlChatSuggestion,
  AtlChatTyping,
} from './atl-chat';
import { AtlAvatar } from '../avatar/atl-avatar';
import { AtlBadge } from '../badge/atl-badge';
import { AtlAlert } from '../alert/atl-alert';
import { AtlCodeBlock } from '../code-block/atl-code-block';

import { metadata } from '@atelier-ui/spec/metadata/chat.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: 'figma'; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const CHAT_IMPORTS = [
  AtlChat,
  AtlChatHeader,
  AtlChatMessages,
  AtlChatMessage,
  AtlChatTyping,
  AtlChatSuggestion,
  AtlChatInput,
  AtlAvatar,
  AtlBadge,
  AtlAlert,
  AtlCodeBlock,
];

const meta: Meta<AtlChat> = {
  title: 'Components/AI/AtlChat',
  component: AtlChat,
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
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<AtlChat>;

// ─────────────────────────────────────────────────────────────────────────────
// DRAWER
// ─────────────────────────────────────────────────────────────────────────────

export const DrawerDefault: Story = {
  parameters: { design: figmaNode('507-2950') },
  args: { variant: 'drawer', status: 'idle', open: true },
  render: (args) => ({
    props: args,
    template: `
      <atl-chat [variant]="variant" [status]="status" [(open)]="open">
        <atl-chat-header>
          <atl-avatar size="sm" name="AI" />
          <span>AI Assistant</span>
          <atl-badge variant="success" size="sm">Online</atl-badge>
        </atl-chat-header>
        <atl-chat-messages>
          <atl-chat-message role="assistant">Hi! I'm your AI assistant. How can I help you today?</atl-chat-message>
          <atl-chat-message role="user">Show me a minimal Angular form using AtlInput.</atl-chat-message>
          <atl-chat-message role="assistant">
            Sure, here you go:
            <atl-code-block
              language="typescript"
              filename="form.html"
              [code]="codeSample" />
          </atl-chat-message>
          <atl-chat-message role="user">Thanks!</atl-chat-message>
        </atl-chat-messages>
        <atl-chat-input />
      </atl-chat>
    `,
    moduleMetadata: { imports: CHAT_IMPORTS },
    applicationConfig: {},
    userDefinedTemplate: true,
    props: {
      ...args,
      codeSample: `<atl-input\n  [formField]="f.email"\n  type="email"\n  placeholder="Email" />`,
    },
  }),
};

export const DrawerEmpty: Story = {
  parameters: { design: figmaNode('507-2950') },
  args: { variant: 'drawer', status: 'idle', open: true },
  render: (args) => ({
    props: args,
    template: `
      <atl-chat [variant]="variant" [status]="status" [(open)]="open">
        <atl-chat-header>
          <atl-avatar size="sm" name="AI" />
          <span>AI Assistant</span>
          <atl-badge variant="success" size="sm">Online</atl-badge>
        </atl-chat-header>
        <atl-chat-messages>
          <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;padding:2rem 0;">
            <atl-avatar size="xl" name="AI" />
            <div style="font-weight:600;font-size:1.125rem;margin-top:0.5rem;">How can I help today?</div>
            <div style="color:var(--ui-color-text-muted);font-size:0.875rem;">Pick a suggestion or ask anything.</div>
          </div>
          <atl-chat-suggestion label="Explain a code snippet" hint="Tap to start →" />
          <atl-chat-suggestion label="Generate an Angular form layout" hint="Tap to start →" />
          <atl-chat-suggestion label="Suggest test cases for a component" hint="Tap to start →" />
        </atl-chat-messages>
        <atl-chat-input />
      </atl-chat>
    `,
  }),
};

export const DrawerStreaming: Story = {
  parameters: { design: figmaNode('507-2950') },
  args: { variant: 'drawer', status: 'streaming', open: true },
  render: (args) => ({
    props: args,
    template: `
      <atl-chat [variant]="variant" [status]="status" [(open)]="open">
        <atl-chat-header>
          <atl-avatar size="sm" name="AI" />
          <span>AI Assistant</span>
          <atl-badge variant="warning" size="sm">Thinking…</atl-badge>
        </atl-chat-header>
        <atl-chat-messages>
          <atl-chat-message role="assistant">Hi! How can I help?</atl-chat-message>
          <atl-chat-message role="user">Write a small sorting function for my user list (by name, asc).</atl-chat-message>
          <atl-chat-message role="assistant">Sure! Here's a one-liner using Array.prototype.sort with a<atl-chat-typing inline /></atl-chat-message>
        </atl-chat-messages>
        <atl-chat-input />
      </atl-chat>
    `,
  }),
};

export const DrawerError: Story = {
  parameters: { design: figmaNode('507-2950') },
  args: { variant: 'drawer', status: 'error', open: true },
  render: (args) => ({
    props: args,
    template: `
      <atl-chat [variant]="variant" [status]="status" [(open)]="open">
        <atl-chat-header>
          <atl-avatar size="sm" name="AI" />
          <span>AI Assistant</span>
          <atl-badge variant="danger" size="sm">Disconnected</atl-badge>
        </atl-chat-header>
        <atl-chat-messages>
          <atl-chat-message role="assistant">Hi! How can I help?</atl-chat-message>
          <atl-chat-message role="user">Refactor my AtlCard usage in the dashboard.</atl-chat-message>
          <atl-chat-message role="assistant" [failed]="true">Couldn't reach the assistant. No response received.</atl-chat-message>
          <atl-alert variant="danger">Connection lost. Check your network and try again.</atl-alert>
        </atl-chat-messages>
        <atl-chat-input />
      </atl-chat>
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
      <atl-chat [variant]="variant" [status]="status" [(open)]="open">
        <atl-chat-header>
          <atl-avatar size="sm" name="AI" />
          <span>AI Assistant</span>
          <atl-badge variant="success" size="sm">Online</atl-badge>
        </atl-chat-header>
        <atl-chat-messages>
          <atl-chat-message role="assistant">Hi! How can I help you today?</atl-chat-message>
          <atl-chat-message role="user">Can you summarize this dashboard?</atl-chat-message>
          <atl-chat-message role="assistant">You're tracking 12 KPIs. Three are below target: Conversion (-8%), CTR (-12%), and Sessions (-3%).</atl-chat-message>
          <atl-chat-message role="user">Show me CTR.</atl-chat-message>
        </atl-chat-messages>
        <atl-chat-input />
      </atl-chat>
    `,
  }),
};

export const PopupEmpty: Story = {
  parameters: { design: figmaNode('507-2951') },
  args: { variant: 'popup', status: 'idle', open: true },
  render: (args) => ({
    props: args,
    template: `
      <atl-chat [variant]="variant" [status]="status" [(open)]="open">
        <atl-chat-header>
          <atl-avatar size="sm" name="AI" />
          <span>AI Assistant</span>
          <atl-badge variant="success" size="sm">Online</atl-badge>
        </atl-chat-header>
        <atl-chat-messages>
          <div style="display:flex;flex-direction:column;align-items:center;gap:0.25rem;padding:1.5rem 0;">
            <atl-avatar size="lg" name="AI" />
            <div style="font-weight:600;font-size:1rem;margin-top:0.5rem;">Hi there</div>
            <div style="color:var(--ui-color-text-muted);font-size:0.75rem;">I can help with code, content, and Q&A.</div>
          </div>
          <atl-chat-suggestion label="Summarize this page" />
          <atl-chat-suggestion label="Generate sample data" />
          <atl-chat-suggestion label="Explain a function" />
        </atl-chat-messages>
        <atl-chat-input />
      </atl-chat>
    `,
  }),
};

export const PopupStreaming: Story = {
  parameters: { design: figmaNode('507-2951') },
  args: { variant: 'popup', status: 'streaming', open: true },
  render: (args) => ({
    props: args,
    template: `
      <atl-chat [variant]="variant" [status]="status" [(open)]="open">
        <atl-chat-header>
          <atl-avatar size="sm" name="AI" />
          <span>AI Assistant</span>
          <atl-badge variant="warning" size="sm">Thinking…</atl-badge>
        </atl-chat-header>
        <atl-chat-messages>
          <atl-chat-message role="assistant">Hi! How can I help?</atl-chat-message>
          <atl-chat-message role="user">Draft a release note for v3.</atl-chat-message>
          <atl-chat-message role="assistant">Sure! Here's a draft: ## v3.0 — What's new * New AtlChat component for AI…<atl-chat-typing inline /></atl-chat-message>
        </atl-chat-messages>
        <atl-chat-input />
      </atl-chat>
    `,
  }),
};

export const PopupError: Story = {
  parameters: { design: figmaNode('507-2951') },
  args: { variant: 'popup', status: 'error', open: true },
  render: (args) => ({
    props: args,
    template: `
      <atl-chat [variant]="variant" [status]="status" [(open)]="open">
        <atl-chat-header>
          <atl-avatar size="sm" name="AI" />
          <span>AI Assistant</span>
          <atl-badge variant="danger" size="sm">Disconnected</atl-badge>
        </atl-chat-header>
        <atl-chat-messages>
          <atl-chat-message role="assistant">Hi! How can I help?</atl-chat-message>
          <atl-chat-message role="user">Translate to French.</atl-chat-message>
          <atl-chat-message role="assistant" [failed]="true">Couldn't reach the assistant.</atl-chat-message>
          <atl-alert variant="danger">Connection lost. Check your network and try again.</atl-alert>
        </atl-chat-messages>
        <atl-chat-input />
      </atl-chat>
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
        <atl-chat [variant]="variant" [status]="status" [(open)]="open">
          <atl-chat-header>
            <atl-avatar size="sm" name="AI" />
            <span>Atelier Assistant</span>
            <atl-badge variant="success" size="sm">Online · GPT-4o</atl-badge>
          </atl-chat-header>
          <atl-chat-messages>
            <atl-chat-message role="assistant">Welcome back, Dominik. I see you're working in the Atelier repo. How can I help today?</atl-chat-message>
            <atl-chat-message role="user">Help me write a Storybook story for the new AtlChat component, with all 3 variants.</atl-chat-message>
            <atl-chat-message role="assistant">
              Sure — here's a starting point:
              <atl-code-block
                language="typescript"
                filename="atl-chat.stories.ts"
                [code]="codeSample" />
            </atl-chat-message>
          </atl-chat-messages>
          <atl-chat-input />
        </atl-chat>
      </div>
    `,
    props: {
      ...args,
      codeSample: `export default {\n  title: 'AI/AtlChat',\n  component: AtlChat,\n  args: { variant: 'drawer' }\n};\n\nexport const Drawer = { args: { variant: 'drawer' } };`,
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
        <atl-chat [variant]="variant" [status]="status" [(open)]="open">
          <atl-chat-header>
            <atl-avatar size="sm" name="AI" />
            <span>Atelier Assistant</span>
            <atl-badge variant="success" size="sm">Online · GPT-4o</atl-badge>
          </atl-chat-header>
          <atl-chat-messages>
            <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;padding:2.5rem 0;">
              <atl-avatar size="xl" name="AI" />
              <div style="font-weight:600;font-size:1.375rem;margin-top:0.5rem;">How can I help today?</div>
              <div style="color:var(--ui-color-text-muted);font-size:0.875rem;">Ask a question, generate code, or pick a starter below.</div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
              <atl-chat-suggestion label="Write a Storybook story" hint="Generate stories for any component" />
              <atl-chat-suggestion label="Explain a snippet" hint="Walk through a piece of code" />
              <atl-chat-suggestion label="Suggest test cases" hint="Spec, edge cases, accessibility" />
              <atl-chat-suggestion label="Refactor for signals" hint="Migrate from CVA to Signal Forms" />
            </div>
          </atl-chat-messages>
          <atl-chat-input />
        </atl-chat>
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
        <atl-chat [variant]="variant" [status]="status" [(open)]="open">
          <atl-chat-header>
            <atl-avatar size="sm" name="AI" />
            <span>Atelier Assistant</span>
            <atl-badge variant="warning" size="sm">Thinking…</atl-badge>
          </atl-chat-header>
          <atl-chat-messages>
            <atl-chat-message role="assistant">Welcome back. What would you like to work on?</atl-chat-message>
            <atl-chat-message role="user">Generate test cases for AtlChat — cover keyboard, screen reader, and streaming behavior.</atl-chat-message>
            <atl-chat-message role="assistant">Here are the test cases I'm drafting:
1. Renders all three variants without runtime errors
2. Tab moves focus into the input area first
3. Escape closes drawer/popup variants
4. Streaming state announces with<atl-chat-typing inline /></atl-chat-message>
          </atl-chat-messages>
          <atl-chat-input />
        </atl-chat>
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
        <atl-chat [variant]="variant" [status]="status" [(open)]="open">
          <atl-chat-header>
            <atl-avatar size="sm" name="AI" />
            <span>Atelier Assistant</span>
            <atl-badge variant="danger" size="sm">Disconnected</atl-badge>
          </atl-chat-header>
          <atl-chat-messages>
            <atl-chat-message role="assistant">Welcome back. What would you like to work on?</atl-chat-message>
            <atl-chat-message role="user">Refactor my dashboard to use Signal Forms throughout.</atl-chat-message>
            <atl-chat-message role="assistant" [failed]="true">Couldn't reach the assistant. The server returned no response.</atl-chat-message>
            <atl-alert variant="danger">Connection lost — couldn't reach the assistant. Check your network or try again later.</atl-alert>
          </atl-chat-messages>
          <atl-chat-input />
        </atl-chat>
      </div>
    `,
  }),
};
