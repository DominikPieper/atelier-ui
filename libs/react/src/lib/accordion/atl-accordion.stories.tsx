import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, expect, waitFor } from 'storybook/test';
import {
  AtlAccordionGroup,
  AtlAccordionItem,
  AtlAccordionHeader,
} from './atl-accordion';

import { metadata } from '@atelier-ui/spec/metadata/accordion.metadata';
import { contract } from '@atelier-ui/spec/contracts/accordion-group.contract';
const FIGMA_FILE =
  'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlAccordionGroup> = {
  title: 'Components/Feedback/AtlAccordionGroup',
  component: AtlAccordionGroup,
  tags: ['autodocs'],
  argTypes: {
    multi: { control: 'boolean' },
    variant: {
      control: 'select',
      options: ['default', 'bordered', 'separated'],
    },
  },
  args: { multi: false, variant: 'default' },
  parameters: {
    design: figmaNode('55-127'),
    docs: { description: { component: metadata.purpose } },
    contract,
  },
};

export default meta;
type Story = StoryObj<typeof AtlAccordionGroup>;

export const Default: Story = {
  render: (args) => (
    <AtlAccordionGroup {...args}>
      <AtlAccordionItem>
        <AtlAccordionHeader>What is this component library?</AtlAccordionHeader>
        A set of accessible, composable UI components designed for use with
        LLM-generated applications.
      </AtlAccordionItem>
      <AtlAccordionItem>
        <AtlAccordionHeader>How do I install it?</AtlAccordionHeader>
        Install via npm and import the components you need.
      </AtlAccordionItem>
      <AtlAccordionItem>
        <AtlAccordionHeader>Is it accessible?</AtlAccordionHeader>
        Yes. All components follow WAI-ARIA patterns with keyboard navigation
        support.
      </AtlAccordionItem>
    </AtlAccordionGroup>
  ),
  parameters: { design: figmaNode('55-124') },
};

export const MultiExpand: Story = {
  args: { multi: true },
  render: (args) => (
    <AtlAccordionGroup {...args}>
      <AtlAccordionItem>
        <AtlAccordionHeader>Section A</AtlAccordionHeader>
        Content for section A. Multiple items can be open at once.
      </AtlAccordionItem>
      <AtlAccordionItem>
        <AtlAccordionHeader>Section B</AtlAccordionHeader>
        Content for section B.
      </AtlAccordionItem>
      <AtlAccordionItem>
        <AtlAccordionHeader>Section C</AtlAccordionHeader>
        Content for section C.
      </AtlAccordionItem>
    </AtlAccordionGroup>
  ),
};

export const Bordered: Story = {
  args: { variant: 'bordered' },
  render: (args) => (
    <AtlAccordionGroup {...args}>
      <AtlAccordionItem>
        <AtlAccordionHeader>Bordered Section 1</AtlAccordionHeader>
        Content inside bordered accordion.
      </AtlAccordionItem>
      <AtlAccordionItem>
        <AtlAccordionHeader>Bordered Section 2</AtlAccordionHeader>
        More content here.
      </AtlAccordionItem>
    </AtlAccordionGroup>
  ),
  parameters: { design: figmaNode('55-125') },
};

export const Separated: Story = {
  args: { variant: 'separated', multi: true },
  render: (args) => (
    <AtlAccordionGroup {...args}>
      <AtlAccordionItem>
        <AtlAccordionHeader>Card Section 1</AtlAccordionHeader>
        Content inside separated card-style accordion.
      </AtlAccordionItem>
      <AtlAccordionItem>
        <AtlAccordionHeader>Card Section 2</AtlAccordionHeader>
        More content here.
      </AtlAccordionItem>
      <AtlAccordionItem>
        <AtlAccordionHeader>Card Section 3</AtlAccordionHeader>
        Even more content.
      </AtlAccordionItem>
    </AtlAccordionGroup>
  ),
  parameters: { design: figmaNode('55-126') },
};

export const WithDisabledItem: Story = {
  render: () => (
    <AtlAccordionGroup>
      <AtlAccordionItem>
        <AtlAccordionHeader>Available Section</AtlAccordionHeader>
        This section is enabled.
      </AtlAccordionItem>
      <AtlAccordionItem disabled>
        <AtlAccordionHeader>Disabled Section</AtlAccordionHeader>
        This content is not accessible.
      </AtlAccordionItem>
      <AtlAccordionItem>
        <AtlAccordionHeader>Another Available Section</AtlAccordionHeader>
        This section is also enabled.
      </AtlAccordionItem>
    </AtlAccordionGroup>
  ),
};

export const PreExpanded: Story = {
  render: () => (
    <AtlAccordionGroup>
      <AtlAccordionItem expanded>
        <AtlAccordionHeader>Pre-expanded Section</AtlAccordionHeader>
        This item starts expanded.
      </AtlAccordionItem>
      <AtlAccordionItem>
        <AtlAccordionHeader>Collapsed Section</AtlAccordionHeader>
        This item starts collapsed.
      </AtlAccordionItem>
    </AtlAccordionGroup>
  ),
};

// ── Behaviour stories (ADR-0121 Decision 2 pilot, 2026-09-12 rework) ───────
// Of the 9 `libs/spec/src/behaviors.json` "accordion" ids, only these two
// earn a dedicated story: both assert real rendered layout
// (grid-template-rows 0fr → 1fr, atl-accordion.css) that atl-accordion.spec.tsx
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
  render: () => (
    <AtlAccordionGroup>
      <AtlAccordionItem>
        <AtlAccordionHeader>Section 1</AtlAccordionHeader>
        Content 1
      </AtlAccordionItem>
      <AtlAccordionItem>
        <AtlAccordionHeader>Section 2</AtlAccordionHeader>
        Content 2
      </AtlAccordionItem>
    </AtlAccordionGroup>
  ),
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
  render: () => (
    <AtlAccordionGroup>
      <AtlAccordionItem>
        <AtlAccordionHeader>Section 1</AtlAccordionHeader>
        Content 1
      </AtlAccordionItem>
      <AtlAccordionItem>
        <AtlAccordionHeader>Section 2</AtlAccordionHeader>
        Content 2
      </AtlAccordionItem>
    </AtlAccordionGroup>
  ),
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
