import type { Meta, StoryObj } from '@storybook/react-vite';
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

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';
const figmaNode = (nodeId: string) => ({
  type: 'figma' as const,
  url: `${FIGMA_FILE}?node-id=${nodeId}`,
});

const meta: Meta<typeof LlmChat> = {
  title: 'Components/AI/LlmChat',
  component: LlmChat,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['drawer', 'popup', 'inline'] },
    status: { control: 'select', options: ['idle', 'streaming', 'error'] },
    open: { control: 'boolean' },
  },
  args: { variant: 'drawer', status: 'idle', open: true },
  parameters: { design: figmaNode('453-1758') },
};

export default meta;
type Story = StoryObj<typeof LlmChat>;

const codeSample = `<llm-input\n  formField={f.email}\n  type="email"\n  placeholder="Email" />`;

const storiesCodeSample = `export default {\n  title: 'AI/LlmChat',\n  component: LlmChat,\n  args: { variant: 'drawer' }\n};\n\nexport const Drawer = { args: { variant: 'drawer' } };`;

// ─────────────────────────────────────────────────────────────────────────────
// DRAWER
// ─────────────────────────────────────────────────────────────────────────────

export const DrawerDefault: Story = {
  parameters: { design: figmaNode('453-1760') },
  args: { variant: 'drawer', status: 'idle', open: true },
  render: (args) => (
    <LlmChat {...args}>
      <LlmChatHeader>
        <LlmAvatar size="sm" name="AI" />
        <span>AI Assistant</span>
        <LlmBadge variant="success" size="sm">Online</LlmBadge>
      </LlmChatHeader>
      <LlmChatMessages>
        <LlmChatMessage role="assistant">Hi! I&apos;m your AI assistant. How can I help you today?</LlmChatMessage>
        <LlmChatMessage role="user">Show me a minimal Angular form using LlmInput.</LlmChatMessage>
        <LlmChatMessage role="assistant">
          Sure, here you go:
          <LlmCodeBlock language="typescript" filename="form.html" code={codeSample} />
        </LlmChatMessage>
        <LlmChatMessage role="user">Thanks!</LlmChatMessage>
      </LlmChatMessages>
      <LlmChatInput />
    </LlmChat>
  ),
};

export const DrawerEmpty: Story = {
  parameters: { design: figmaNode('453-1766') },
  args: { variant: 'drawer', status: 'idle', open: true },
  render: (args) => (
    <LlmChat {...args}>
      <LlmChatHeader>
        <LlmAvatar size="sm" name="AI" />
        <span>AI Assistant</span>
        <LlmBadge variant="success" size="sm">Online</LlmBadge>
      </LlmChatHeader>
      <LlmChatMessages>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '2rem 0' }}>
          <LlmAvatar size="xl" name="AI" />
          <div style={{ fontWeight: 600, fontSize: '1.125rem', marginTop: '0.5rem' }}>How can I help today?</div>
          <div style={{ color: 'var(--ui-color-text-muted)', fontSize: '0.875rem' }}>Pick a suggestion or ask anything.</div>
        </div>
        <LlmChatSuggestion label="Explain a code snippet" hint="Tap to start →" />
        <LlmChatSuggestion label="Generate an Angular form layout" hint="Tap to start →" />
        <LlmChatSuggestion label="Suggest test cases for a component" hint="Tap to start →" />
      </LlmChatMessages>
      <LlmChatInput />
    </LlmChat>
  ),
};

export const DrawerStreaming: Story = {
  parameters: { design: figmaNode('453-1772') },
  args: { variant: 'drawer', status: 'streaming', open: true },
  render: (args) => (
    <LlmChat {...args}>
      <LlmChatHeader>
        <LlmAvatar size="sm" name="AI" />
        <span>AI Assistant</span>
        <LlmBadge variant="warning" size="sm">Thinking…</LlmBadge>
      </LlmChatHeader>
      <LlmChatMessages>
        <LlmChatMessage role="assistant">Hi! How can I help?</LlmChatMessage>
        <LlmChatMessage role="user">Write a small sorting function for my user list (by name, asc).</LlmChatMessage>
        <LlmChatMessage role="assistant">Sure! Here&apos;s a one-liner using Array.prototype.sort with a<LlmChatTyping inline /></LlmChatMessage>
      </LlmChatMessages>
      <LlmChatInput />
    </LlmChat>
  ),
};

export const DrawerError: Story = {
  parameters: { design: figmaNode('453-1778') },
  args: { variant: 'drawer', status: 'error', open: true },
  render: (args) => (
    <LlmChat {...args}>
      <LlmChatHeader>
        <LlmAvatar size="sm" name="AI" />
        <span>AI Assistant</span>
        <LlmBadge variant="danger" size="sm">Disconnected</LlmBadge>
      </LlmChatHeader>
      <LlmChatMessages>
        <LlmChatMessage role="assistant">Hi! How can I help?</LlmChatMessage>
        <LlmChatMessage role="user">Refactor my LlmCard usage in the dashboard.</LlmChatMessage>
        <LlmChatMessage role="assistant" failed>Couldn&apos;t reach the assistant. No response received.</LlmChatMessage>
        <LlmAlert variant="danger">Connection lost. Check your network and try again.</LlmAlert>
      </LlmChatMessages>
      <LlmChatInput />
    </LlmChat>
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// POPUP
// ─────────────────────────────────────────────────────────────────────────────

export const PopupDefault: Story = {
  parameters: { design: figmaNode('453-1762') },
  args: { variant: 'popup', status: 'idle', open: true },
  render: (args) => (
    <LlmChat {...args}>
      <LlmChatHeader>
        <LlmAvatar size="sm" name="AI" />
        <span>AI Assistant</span>
        <LlmBadge variant="success" size="sm">Online</LlmBadge>
      </LlmChatHeader>
      <LlmChatMessages>
        <LlmChatMessage role="assistant">Hi! How can I help you today?</LlmChatMessage>
        <LlmChatMessage role="user">Can you summarize this dashboard?</LlmChatMessage>
        <LlmChatMessage role="assistant">You&apos;re tracking 12 KPIs. Three are below target: Conversion (-8%), CTR (-12%), and Sessions (-3%).</LlmChatMessage>
        <LlmChatMessage role="user">Show me CTR.</LlmChatMessage>
      </LlmChatMessages>
      <LlmChatInput />
    </LlmChat>
  ),
};

export const PopupEmpty: Story = {
  parameters: { design: figmaNode('453-1768') },
  args: { variant: 'popup', status: 'idle', open: true },
  render: (args) => (
    <LlmChat {...args}>
      <LlmChatHeader>
        <LlmAvatar size="sm" name="AI" />
        <span>AI Assistant</span>
        <LlmBadge variant="success" size="sm">Online</LlmBadge>
      </LlmChatHeader>
      <LlmChatMessages>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', padding: '1.5rem 0' }}>
          <LlmAvatar size="lg" name="AI" />
          <div style={{ fontWeight: 600, fontSize: '1rem', marginTop: '0.5rem' }}>Hi there</div>
          <div style={{ color: 'var(--ui-color-text-muted)', fontSize: '0.75rem' }}>I can help with code, content, and Q&amp;A.</div>
        </div>
        <LlmChatSuggestion label="Summarize this page" />
        <LlmChatSuggestion label="Generate sample data" />
        <LlmChatSuggestion label="Explain a function" />
      </LlmChatMessages>
      <LlmChatInput />
    </LlmChat>
  ),
};

export const PopupStreaming: Story = {
  parameters: { design: figmaNode('453-1774') },
  args: { variant: 'popup', status: 'streaming', open: true },
  render: (args) => (
    <LlmChat {...args}>
      <LlmChatHeader>
        <LlmAvatar size="sm" name="AI" />
        <span>AI Assistant</span>
        <LlmBadge variant="warning" size="sm">Thinking…</LlmBadge>
      </LlmChatHeader>
      <LlmChatMessages>
        <LlmChatMessage role="assistant">Hi! How can I help?</LlmChatMessage>
        <LlmChatMessage role="user">Draft a release note for v3.</LlmChatMessage>
        <LlmChatMessage role="assistant">Sure! Here&apos;s a draft: ## v3.0 — What&apos;s new * New LlmChat component for AI…<LlmChatTyping inline /></LlmChatMessage>
      </LlmChatMessages>
      <LlmChatInput />
    </LlmChat>
  ),
};

export const PopupError: Story = {
  parameters: { design: figmaNode('453-1780') },
  args: { variant: 'popup', status: 'error', open: true },
  render: (args) => (
    <LlmChat {...args}>
      <LlmChatHeader>
        <LlmAvatar size="sm" name="AI" />
        <span>AI Assistant</span>
        <LlmBadge variant="danger" size="sm">Disconnected</LlmBadge>
      </LlmChatHeader>
      <LlmChatMessages>
        <LlmChatMessage role="assistant">Hi! How can I help?</LlmChatMessage>
        <LlmChatMessage role="user">Translate to French.</LlmChatMessage>
        <LlmChatMessage role="assistant" failed>Couldn&apos;t reach the assistant.</LlmChatMessage>
        <LlmAlert variant="danger">Connection lost. Check your network and try again.</LlmAlert>
      </LlmChatMessages>
      <LlmChatInput />
    </LlmChat>
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// INLINE
// ─────────────────────────────────────────────────────────────────────────────

export const InlineDefault: Story = {
  parameters: { design: figmaNode('453-1764') },
  args: { variant: 'inline', status: 'idle', open: true },
  render: (args) => (
    <div style={{ height: 540, width: 720 }}>
      <LlmChat {...args}>
        <LlmChatHeader>
          <LlmAvatar size="sm" name="AI" />
          <span>Atelier Assistant</span>
          <LlmBadge variant="success" size="sm">Online · GPT-4o</LlmBadge>
        </LlmChatHeader>
        <LlmChatMessages>
          <LlmChatMessage role="assistant">Welcome back, Dominik. I see you&apos;re working in the Atelier UI repo. How can I help today?</LlmChatMessage>
          <LlmChatMessage role="user">Help me write a Storybook story for the new LlmChat component, with all 3 variants.</LlmChatMessage>
          <LlmChatMessage role="assistant">
            Sure — here&apos;s a starting point:
            <LlmCodeBlock language="typescript" filename="llm-chat.stories.ts" code={storiesCodeSample} />
          </LlmChatMessage>
        </LlmChatMessages>
        <LlmChatInput />
      </LlmChat>
    </div>
  ),
};

export const InlineEmpty: Story = {
  parameters: { design: figmaNode('453-1770') },
  args: { variant: 'inline', status: 'idle', open: true },
  render: (args) => (
    <div style={{ height: 540, width: 720 }}>
      <LlmChat {...args}>
        <LlmChatHeader>
          <LlmAvatar size="sm" name="AI" />
          <span>Atelier Assistant</span>
          <LlmBadge variant="success" size="sm">Online · GPT-4o</LlmBadge>
        </LlmChatHeader>
        <LlmChatMessages>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '2.5rem 0' }}>
            <LlmAvatar size="xl" name="AI" />
            <div style={{ fontWeight: 600, fontSize: '1.375rem', marginTop: '0.5rem' }}>How can I help today?</div>
            <div style={{ color: 'var(--ui-color-text-muted)', fontSize: '0.875rem' }}>Ask a question, generate code, or pick a starter below.</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <LlmChatSuggestion label="Write a Storybook story" hint="Generate stories for any component" />
            <LlmChatSuggestion label="Explain a snippet" hint="Walk through a piece of code" />
            <LlmChatSuggestion label="Suggest test cases" hint="Spec, edge cases, accessibility" />
            <LlmChatSuggestion label="Refactor for signals" hint="Migrate from CVA to Signal Forms" />
          </div>
        </LlmChatMessages>
        <LlmChatInput />
      </LlmChat>
    </div>
  ),
};

export const InlineStreaming: Story = {
  parameters: { design: figmaNode('453-1776') },
  args: { variant: 'inline', status: 'streaming', open: true },
  render: (args) => (
    <div style={{ height: 540, width: 720 }}>
      <LlmChat {...args}>
        <LlmChatHeader>
          <LlmAvatar size="sm" name="AI" />
          <span>Atelier Assistant</span>
          <LlmBadge variant="warning" size="sm">Thinking…</LlmBadge>
        </LlmChatHeader>
        <LlmChatMessages>
          <LlmChatMessage role="assistant">Welcome back. What would you like to work on?</LlmChatMessage>
          <LlmChatMessage role="user">Generate test cases for LlmChat — cover keyboard, screen reader, and streaming behavior.</LlmChatMessage>
          <LlmChatMessage role="assistant">
            {`Here are the test cases I'm drafting:
1. Renders all three variants without runtime errors
2. Tab moves focus into the input area first
3. Escape closes drawer/popup variants
4. Streaming state announces with`}
            <LlmChatTyping inline />
          </LlmChatMessage>
        </LlmChatMessages>
        <LlmChatInput />
      </LlmChat>
    </div>
  ),
};

export const InlineError: Story = {
  parameters: { design: figmaNode('453-1782') },
  args: { variant: 'inline', status: 'error', open: true },
  render: (args) => (
    <div style={{ height: 540, width: 720 }}>
      <LlmChat {...args}>
        <LlmChatHeader>
          <LlmAvatar size="sm" name="AI" />
          <span>Atelier Assistant</span>
          <LlmBadge variant="danger" size="sm">Disconnected</LlmBadge>
        </LlmChatHeader>
        <LlmChatMessages>
          <LlmChatMessage role="assistant">Welcome back. What would you like to work on?</LlmChatMessage>
          <LlmChatMessage role="user">Refactor my dashboard to use Signal Forms throughout.</LlmChatMessage>
          <LlmChatMessage role="assistant" failed>Couldn&apos;t reach the assistant. The server returned no response.</LlmChatMessage>
          <LlmAlert variant="danger">Connection lost — couldn&apos;t reach the assistant. Check your network or try again later.</LlmAlert>
        </LlmChatMessages>
        <LlmChatInput />
      </LlmChat>
    </div>
  ),
};
