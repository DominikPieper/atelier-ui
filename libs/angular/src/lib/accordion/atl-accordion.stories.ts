import type { Meta, StoryObj } from '@storybook/angular';
import { userEvent, expect, waitFor } from 'storybook/test';
import {
  AtlAccordionGroup,
  AtlAccordionItem,
  AtlAccordionHeader,
} from './atl-accordion';

import { metadata } from '@atelier-ui/spec/metadata/accordion.metadata';
import { contract } from '@atelier-ui/spec/contracts/accordion-group.contract';
const IMPORTS = [AtlAccordionGroup, AtlAccordionItem, AtlAccordionHeader];

const FIGMA_FILE =
  'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: 'figma'; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<AtlAccordionGroup> = {
  title: 'Components/Feedback/AtlAccordionGroup',
  component: AtlAccordionGroup,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'bordered', 'separated'],
    },
  },
  args: {
    variant: 'default',
  },
  parameters: {
    design: figmaNode('55-127'),
    docs: { description: { component: metadata.purpose } },
    contract,
  },
};

export default meta;
type Story = StoryObj<AtlAccordionGroup>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: IMPORTS },
    template: `
      <atl-accordion-group [variant]="variant">
        <atl-accordion-item>
          <span atlAccordionHeader>What is this component library?</span>
          A set of accessible, LLM-optimized Angular components built with modern signals and design tokens.
        </atl-accordion-item>
        <atl-accordion-item>
          <span atlAccordionHeader>How do I install it?</span>
          Install via npm and import the components you need. All components are standalone.
        </atl-accordion-item>
        <atl-accordion-item>
          <span atlAccordionHeader>Does it support dark mode?</span>
          Yes! All components use CSS custom properties that automatically adapt to dark mode.
        </atl-accordion-item>
      </atl-accordion-group>
    `,
  }),
  parameters: { design: figmaNode('55-124') },
};

export const MultiExpand: Story = {
  render: (args) => ({
    props: { ...args, multi: true },
    moduleMetadata: { imports: IMPORTS },
    template: `
      <atl-accordion-group [variant]="variant" [multi]="true">
        <atl-accordion-item>
          <span atlAccordionHeader>First Section</span>
          Multiple sections can be open at the same time in multi mode.
        </atl-accordion-item>
        <atl-accordion-item>
          <span atlAccordionHeader>Second Section</span>
          Try clicking multiple headers — they all stay open.
        </atl-accordion-item>
        <atl-accordion-item>
          <span atlAccordionHeader>Third Section</span>
          Each item toggles independently.
        </atl-accordion-item>
      </atl-accordion-group>
    `,
  }),
};

export const Disabled: Story = {
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: IMPORTS },
    template: `
      <atl-accordion-group [variant]="variant">
        <atl-accordion-item>
          <span atlAccordionHeader>Enabled Item</span>
          This item can be toggled.
        </atl-accordion-item>
        <atl-accordion-item [disabled]="true">
          <span atlAccordionHeader>Disabled Item</span>
          This item cannot be toggled.
        </atl-accordion-item>
        <atl-accordion-item>
          <span atlAccordionHeader>Another Enabled Item</span>
          This item can also be toggled.
        </atl-accordion-item>
      </atl-accordion-group>
    `,
  }),
};

export const Bordered: Story = {
  render: () => ({
    moduleMetadata: { imports: IMPORTS },
    template: `
      <atl-accordion-group variant="bordered">
        <atl-accordion-item>
          <span atlAccordionHeader>Account Settings</span>
          Manage your account details, profile picture, and display name.
        </atl-accordion-item>
        <atl-accordion-item>
          <span atlAccordionHeader>Privacy & Security</span>
          Configure two-factor authentication, manage sessions, and privacy settings.
        </atl-accordion-item>
        <atl-accordion-item>
          <span atlAccordionHeader>Notifications</span>
          Choose which notifications you receive and how they are delivered.
        </atl-accordion-item>
      </atl-accordion-group>
    `,
  }),
  parameters: { design: figmaNode('55-125') },
};

export const Separated: Story = {
  render: () => ({
    moduleMetadata: { imports: IMPORTS },
    template: `
      <atl-accordion-group variant="separated">
        <atl-accordion-item>
          <span atlAccordionHeader>Getting Started</span>
          Follow the quick start guide to set up your first project in minutes.
        </atl-accordion-item>
        <atl-accordion-item>
          <span atlAccordionHeader>API Reference</span>
          Browse the full API documentation for all available endpoints.
        </atl-accordion-item>
        <atl-accordion-item>
          <span atlAccordionHeader>Troubleshooting</span>
          Find solutions to common issues and how to report bugs.
        </atl-accordion-item>
      </atl-accordion-group>
    `,
  }),
  parameters: { design: figmaNode('55-126') },
};

export const PreExpanded: Story = {
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: IMPORTS },
    template: `
      <atl-accordion-group [variant]="variant">
        <atl-accordion-item>
          <span atlAccordionHeader>Collapsed by default</span>
          This section starts closed.
        </atl-accordion-item>
        <atl-accordion-item [expanded]="true">
          <span atlAccordionHeader>Pre-expanded</span>
          This section starts open!
        </atl-accordion-item>
        <atl-accordion-item>
          <span atlAccordionHeader>Also collapsed</span>
          This section starts closed too.
        </atl-accordion-item>
      </atl-accordion-group>
    `,
  }),
};

// ── Behaviour stories (ADR-0121 Decision 2 pilot, 2026-09-12 rework) ───────
// Of the 9 `libs/spec/src/behaviors.json` "accordion" ids, only these two
// earn a dedicated story: both assert real rendered layout
// (grid-template-rows 0fr → 1fr, atl-accordion.css) that atl-accordion.spec.ts
// cannot — its jsdom environment never computes real layout, so
// getBoundingClientRect() is always 0 there regardless of expanded state. The
// other 7 (disabled-no-toggle, multi-expand, single-collapse-other,
// keyboard-nav, home-end, wrap, skip-disabled) would fire the same click/key
// and assert the same ARIA attribute or focus target the spec's
// `covers('accordion', '<id>')` test already asserts — a second, more
// expensive execution of an identical assertion, not new coverage. Deleted
// 2026-09-12 rather than kept as decoration.
//
// `parameters.behaviour: '<subject>/<id>'` is the declaration (ADR-0121
// Decision 2's "the play title is the behaviour id", made checkable): a
// plain string, not `{ subject, id }`, because it is one scalar to grep and
// to read off the Storybook parameters panel, with no second key to
// mis-name. `check-paint.mjs` treats a story carrying this parameter as
// "demonstrates a behaviour, not a Figma variant sample" — it runs no paint,
// geometry or type comparison against it at all, and validates the id
// against `libs/spec/src/behaviors.json` itself: an id the manifest does not
// recognise is a hard, always-blocking `[UNKNOWN-BEHAVIOUR]` error naming the
// story (same tier as `[NO-INDEX-ENTRY]`/`[PLAY-TIMEOUT]` — there is no
// legitimate reason for the id to be wrong, so it is not ratcheted debt like
// skipped-demo/not-rendered/no-probe). That is what makes the exemption a
// claim rather than a mute button: inventing a behaviour to silence a real
// measurement fails the same way inventing a manifest id already does
// elsewhere in this repo. See check-paint.mjs's BEHAVIOUR_NOTE.

export const ExpandOnClick: Story = {
  name: 'expand-on-click',
  parameters: { behaviour: 'accordion/expand-on-click' },
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: IMPORTS },
    template: `
      <atl-accordion-group [variant]="variant">
        <atl-accordion-item>
          <span atlAccordionHeader>Section 1</span>
          Content 1
        </atl-accordion-item>
        <atl-accordion-item>
          <span atlAccordionHeader>Section 2</span>
          Content 2
        </atl-accordion-item>
      </atl-accordion-group>
    `,
  }),
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Section 1' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const wrapper = canvas.getAllByRole('region')[0]
      .parentElement as HTMLElement;
    await waitFor(() =>
      expect(wrapper.getBoundingClientRect().height).toBeGreaterThan(0),
    );
  },
};

export const CollapseOnClick: Story = {
  name: 'collapse-on-click',
  parameters: { behaviour: 'accordion/collapse-on-click' },
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: IMPORTS },
    template: `
      <atl-accordion-group [variant]="variant">
        <atl-accordion-item>
          <span atlAccordionHeader>Section 1</span>
          Content 1
        </atl-accordion-item>
        <atl-accordion-item>
          <span atlAccordionHeader>Section 2</span>
          Content 2
        </atl-accordion-item>
      </atl-accordion-group>
    `,
  }),
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Section 1' });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    const wrapper = canvas.getAllByRole('region')[0]
      .parentElement as HTMLElement;
    await waitFor(() => expect(wrapper.getBoundingClientRect().height).toBe(0));
  },
};
