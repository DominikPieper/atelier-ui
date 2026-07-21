import type { Meta, StoryObj } from '@storybook/vue3-vite';
import AtlChat from './atl-chat.vue';
import AtlChatHeader from './atl-chat-header.vue';
import AtlChatMessages from './atl-chat-messages.vue';
import AtlChatMessage from './atl-chat-message.vue';
import AtlChatTyping from './atl-chat-typing.vue';
import AtlChatSuggestion from './atl-chat-suggestion.vue';
import AtlChatInput from './atl-chat-input.vue';
import AtlAvatar from '../avatar/atl-avatar.vue';
import AtlBadge from '../badge/atl-badge.vue';
import AtlAlert from '../alert/atl-alert.vue';
import AtlCodeBlock from '../code-block/atl-code-block.vue';

import { metadata } from '@atelier-ui/spec/metadata/chat.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';
const figmaNode = (nodeId: string) => ({ type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` });

const COMPONENTS = {
  AtlChat, AtlChatHeader, AtlChatMessages, AtlChatMessage,
  AtlChatTyping, AtlChatSuggestion, AtlChatInput,
  AtlAvatar, AtlBadge, AtlAlert, AtlCodeBlock,
};

const codeSample = `<atl-input\n  formField={f.email}\n  type="email"\n  placeholder="Email" />`;
const storiesCodeSample = `export default {\n  title: 'AI/AtlChat',\n  component: AtlChat,\n  args: { variant: 'drawer' }\n};\n\nexport const Drawer = { args: { variant: 'drawer' } };`;

const meta: Meta<typeof AtlChat> = {
  title: 'Components/AI/AtlChat',
  component: AtlChat,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['drawer', 'popup', 'inline'] },
    status: { control: 'select', options: ['idle', 'streaming', 'error'] },
    open: { control: 'boolean' },
  },
  args: { variant: 'drawer', status: 'idle', open: true },
  parameters: { design: figmaNode('507-2953'), docs: { description: { component: metadata.purpose } } },
};

export default meta;
type Story = StoryObj<typeof AtlChat>;

// ─────────────────────────────────────────────────────────────────────────────
// DRAWER
// ─────────────────────────────────────────────────────────────────────────────

export const DrawerDefault: Story = {
  parameters: { design: figmaNode('507-2950') },
  args: { variant: 'drawer', status: 'idle', open: true },
  render: (args) => ({
    components: COMPONENTS,
    setup() { return { args, codeSample }; },
    template: `
      <AtlChat v-bind="args">
        <AtlChatHeader>
          <AtlAvatar size="sm" name="AI" />
          <span>AI Assistant</span>
          <AtlBadge variant="success" size="sm">Online</AtlBadge>
        </AtlChatHeader>
        <AtlChatMessages>
          <AtlChatMessage role="assistant">Hi! I'm your AI assistant. How can I help you today?</AtlChatMessage>
          <AtlChatMessage role="user">Show me a minimal Angular form using AtlInput.</AtlChatMessage>
          <AtlChatMessage role="assistant">
            Sure, here you go:
            <AtlCodeBlock language="typescript" filename="form.html" :code="codeSample" />
          </AtlChatMessage>
          <AtlChatMessage role="user">Thanks!</AtlChatMessage>
        </AtlChatMessages>
        <AtlChatInput />
      </AtlChat>
    `,
  }),
};

export const DrawerEmpty: Story = {
  parameters: { design: figmaNode('507-2950') },
  args: { variant: 'drawer', status: 'idle', open: true },
  render: (args) => ({
    components: COMPONENTS,
    setup() { return { args }; },
    template: `
      <AtlChat v-bind="args">
        <AtlChatHeader>
          <AtlAvatar size="sm" name="AI" />
          <span>AI Assistant</span>
          <AtlBadge variant="success" size="sm">Online</AtlBadge>
        </AtlChatHeader>
        <AtlChatMessages>
          <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;padding:2rem 0;">
            <AtlAvatar size="xl" name="AI" />
            <div style="font-weight:600;font-size:1.125rem;margin-top:0.5rem;">How can I help today?</div>
            <div style="color:var(--ui-color-text-muted);font-size:0.875rem;">Pick a suggestion or ask anything.</div>
          </div>
          <AtlChatSuggestion label="Explain a code snippet" hint="Tap to start →" />
          <AtlChatSuggestion label="Generate an Angular form layout" hint="Tap to start →" />
          <AtlChatSuggestion label="Suggest test cases for a component" hint="Tap to start →" />
        </AtlChatMessages>
        <AtlChatInput />
      </AtlChat>
    `,
  }),
};

export const DrawerStreaming: Story = {
  parameters: { design: figmaNode('507-2950') },
  args: { variant: 'drawer', status: 'streaming', open: true },
  render: (args) => ({
    components: COMPONENTS,
    setup() { return { args }; },
    template: `
      <AtlChat v-bind="args">
        <AtlChatHeader>
          <AtlAvatar size="sm" name="AI" />
          <span>AI Assistant</span>
          <AtlBadge variant="warning" size="sm">Thinking…</AtlBadge>
        </AtlChatHeader>
        <AtlChatMessages>
          <AtlChatMessage role="assistant">Hi! How can I help?</AtlChatMessage>
          <AtlChatMessage role="user">Write a small sorting function for my user list (by name, asc).</AtlChatMessage>
          <AtlChatMessage role="assistant">Sure! Here's a one-liner using Array.prototype.sort with a<AtlChatTyping :inline="true" /></AtlChatMessage>
        </AtlChatMessages>
        <AtlChatInput />
      </AtlChat>
    `,
  }),
};

export const DrawerError: Story = {
  parameters: { design: figmaNode('507-2950') },
  args: { variant: 'drawer', status: 'error', open: true },
  render: (args) => ({
    components: COMPONENTS,
    setup() { return { args }; },
    template: `
      <AtlChat v-bind="args">
        <AtlChatHeader>
          <AtlAvatar size="sm" name="AI" />
          <span>AI Assistant</span>
          <AtlBadge variant="danger" size="sm">Disconnected</AtlBadge>
        </AtlChatHeader>
        <AtlChatMessages>
          <AtlChatMessage role="assistant">Hi! How can I help?</AtlChatMessage>
          <AtlChatMessage role="user">Refactor my AtlCard usage in the dashboard.</AtlChatMessage>
          <AtlChatMessage role="assistant" :failed="true">Couldn't reach the assistant. No response received.</AtlChatMessage>
          <AtlAlert variant="danger">Connection lost. Check your network and try again.</AtlAlert>
        </AtlChatMessages>
        <AtlChatInput />
      </AtlChat>
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
    components: COMPONENTS,
    setup() { return { args }; },
    template: `
      <AtlChat v-bind="args">
        <AtlChatHeader>
          <AtlAvatar size="sm" name="AI" />
          <span>AI Assistant</span>
          <AtlBadge variant="success" size="sm">Online</AtlBadge>
        </AtlChatHeader>
        <AtlChatMessages>
          <AtlChatMessage role="assistant">Hi! How can I help you today?</AtlChatMessage>
          <AtlChatMessage role="user">Can you summarize this dashboard?</AtlChatMessage>
          <AtlChatMessage role="assistant">You're tracking 12 KPIs. Three are below target: Conversion (-8%), CTR (-12%), and Sessions (-3%).</AtlChatMessage>
          <AtlChatMessage role="user">Show me CTR.</AtlChatMessage>
        </AtlChatMessages>
        <AtlChatInput />
      </AtlChat>
    `,
  }),
};

export const PopupEmpty: Story = {
  parameters: { design: figmaNode('507-2951') },
  args: { variant: 'popup', status: 'idle', open: true },
  render: (args) => ({
    components: COMPONENTS,
    setup() { return { args }; },
    template: `
      <AtlChat v-bind="args">
        <AtlChatHeader>
          <AtlAvatar size="sm" name="AI" />
          <span>AI Assistant</span>
          <AtlBadge variant="success" size="sm">Online</AtlBadge>
        </AtlChatHeader>
        <AtlChatMessages>
          <div style="display:flex;flex-direction:column;align-items:center;gap:0.25rem;padding:1.5rem 0;">
            <AtlAvatar size="lg" name="AI" />
            <div style="font-weight:600;font-size:1rem;margin-top:0.5rem;">Hi there</div>
            <div style="color:var(--ui-color-text-muted);font-size:0.75rem;">I can help with code, content, and Q&amp;A.</div>
          </div>
          <AtlChatSuggestion label="Summarize this page" />
          <AtlChatSuggestion label="Generate sample data" />
          <AtlChatSuggestion label="Explain a function" />
        </AtlChatMessages>
        <AtlChatInput />
      </AtlChat>
    `,
  }),
};

export const PopupStreaming: Story = {
  parameters: { design: figmaNode('507-2951') },
  args: { variant: 'popup', status: 'streaming', open: true },
  render: (args) => ({
    components: COMPONENTS,
    setup() { return { args }; },
    template: `
      <AtlChat v-bind="args">
        <AtlChatHeader>
          <AtlAvatar size="sm" name="AI" />
          <span>AI Assistant</span>
          <AtlBadge variant="warning" size="sm">Thinking…</AtlBadge>
        </AtlChatHeader>
        <AtlChatMessages>
          <AtlChatMessage role="assistant">Hi! How can I help?</AtlChatMessage>
          <AtlChatMessage role="user">Draft a release note for v3.</AtlChatMessage>
          <AtlChatMessage role="assistant">Sure! Here's a draft: ## v3.0 — What's new * New AtlChat component for AI…<AtlChatTyping :inline="true" /></AtlChatMessage>
        </AtlChatMessages>
        <AtlChatInput />
      </AtlChat>
    `,
  }),
};

export const PopupError: Story = {
  parameters: { design: figmaNode('507-2951') },
  args: { variant: 'popup', status: 'error', open: true },
  render: (args) => ({
    components: COMPONENTS,
    setup() { return { args }; },
    template: `
      <AtlChat v-bind="args">
        <AtlChatHeader>
          <AtlAvatar size="sm" name="AI" />
          <span>AI Assistant</span>
          <AtlBadge variant="danger" size="sm">Disconnected</AtlBadge>
        </AtlChatHeader>
        <AtlChatMessages>
          <AtlChatMessage role="assistant">Hi! How can I help?</AtlChatMessage>
          <AtlChatMessage role="user">Translate to French.</AtlChatMessage>
          <AtlChatMessage role="assistant" :failed="true">Couldn't reach the assistant.</AtlChatMessage>
          <AtlAlert variant="danger">Connection lost. Check your network and try again.</AtlAlert>
        </AtlChatMessages>
        <AtlChatInput />
      </AtlChat>
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
    components: COMPONENTS,
    setup() { return { args, storiesCodeSample }; },
    template: `
      <div style="height:540px;width:720px;">
        <AtlChat v-bind="args">
          <AtlChatHeader>
            <AtlAvatar size="sm" name="AI" />
            <span>Atelier Assistant</span>
            <AtlBadge variant="success" size="sm">Online · GPT-4o</AtlBadge>
          </AtlChatHeader>
          <AtlChatMessages>
            <AtlChatMessage role="assistant">Welcome back, Dominik. I see you're working in the Atelier repo. How can I help today?</AtlChatMessage>
            <AtlChatMessage role="user">Help me write a Storybook story for the new AtlChat component, with all 3 variants.</AtlChatMessage>
            <AtlChatMessage role="assistant">
              Sure — here's a starting point:
              <AtlCodeBlock language="typescript" filename="atl-chat.stories.ts" :code="storiesCodeSample" />
            </AtlChatMessage>
          </AtlChatMessages>
          <AtlChatInput />
        </AtlChat>
      </div>
    `,
  }),
};

export const InlineEmpty: Story = {
  parameters: { design: figmaNode('507-2952') },
  args: { variant: 'inline', status: 'idle', open: true },
  render: (args) => ({
    components: COMPONENTS,
    setup() { return { args }; },
    template: `
      <div style="height:540px;width:720px;">
        <AtlChat v-bind="args">
          <AtlChatHeader>
            <AtlAvatar size="sm" name="AI" />
            <span>Atelier Assistant</span>
            <AtlBadge variant="success" size="sm">Online · GPT-4o</AtlBadge>
          </AtlChatHeader>
          <AtlChatMessages>
            <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;padding:2.5rem 0;">
              <AtlAvatar size="xl" name="AI" />
              <div style="font-weight:600;font-size:1.375rem;margin-top:0.5rem;">How can I help today?</div>
              <div style="color:var(--ui-color-text-muted);font-size:0.875rem;">Ask a question, generate code, or pick a starter below.</div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
              <AtlChatSuggestion label="Write a Storybook story" hint="Generate stories for any component" />
              <AtlChatSuggestion label="Explain a snippet" hint="Walk through a piece of code" />
              <AtlChatSuggestion label="Suggest test cases" hint="Spec, edge cases, accessibility" />
              <AtlChatSuggestion label="Refactor for signals" hint="Migrate from CVA to Signal Forms" />
            </div>
          </AtlChatMessages>
          <AtlChatInput />
        </AtlChat>
      </div>
    `,
  }),
};

export const InlineStreaming: Story = {
  parameters: { design: figmaNode('507-2952') },
  args: { variant: 'inline', status: 'streaming', open: true },
  render: (args) => ({
    components: COMPONENTS,
    setup() { return { args }; },
    template: `
      <div style="height:540px;width:720px;">
        <AtlChat v-bind="args">
          <AtlChatHeader>
            <AtlAvatar size="sm" name="AI" />
            <span>Atelier Assistant</span>
            <AtlBadge variant="warning" size="sm">Thinking…</AtlBadge>
          </AtlChatHeader>
          <AtlChatMessages>
            <AtlChatMessage role="assistant">Welcome back. What would you like to work on?</AtlChatMessage>
            <AtlChatMessage role="user">Generate test cases for AtlChat — cover keyboard, screen reader, and streaming behavior.</AtlChatMessage>
            <AtlChatMessage role="assistant">Here are the test cases I'm drafting: 1. Renders all three variants without runtime errors 2. Tab moves focus into the input area first 3. Escape closes drawer/popup variants 4. Streaming state announces with<AtlChatTyping :inline="true" /></AtlChatMessage>
          </AtlChatMessages>
          <AtlChatInput />
        </AtlChat>
      </div>
    `,
  }),
};

export const InlineError: Story = {
  parameters: { design: figmaNode('507-2952') },
  args: { variant: 'inline', status: 'error', open: true },
  render: (args) => ({
    components: COMPONENTS,
    setup() { return { args }; },
    template: `
      <div style="height:540px;width:720px;">
        <AtlChat v-bind="args">
          <AtlChatHeader>
            <AtlAvatar size="sm" name="AI" />
            <span>Atelier Assistant</span>
            <AtlBadge variant="danger" size="sm">Disconnected</AtlBadge>
          </AtlChatHeader>
          <AtlChatMessages>
            <AtlChatMessage role="assistant">Welcome back. What would you like to work on?</AtlChatMessage>
            <AtlChatMessage role="user">Refactor my dashboard to use Signal Forms throughout.</AtlChatMessage>
            <AtlChatMessage role="assistant" :failed="true">Couldn't reach the assistant. The server returned no response.</AtlChatMessage>
            <AtlAlert variant="danger">Connection lost — couldn't reach the assistant. Check your network or try again later.</AtlAlert>
          </AtlChatMessages>
          <AtlChatInput />
        </AtlChat>
      </div>
    `,
  }),
};
