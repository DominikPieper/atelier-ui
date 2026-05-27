import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { flushPromises } from '@vue/test-utils';
import LlmTabGroup from './llm-tab-group.vue';
import LlmTab from './llm-tab.vue';

const TabsFixture = {
  components: { LlmTabGroup, LlmTab },
  template: `
    <LlmTabGroup>
      <LlmTab label="Tab One">Content One</LlmTab>
      <LlmTab label="Tab Two">Content Two</LlmTab>
      <LlmTab label="Tab Three">Content Three</LlmTab>
    </LlmTabGroup>
  `,
};

describe('LlmTabGroup', () => {
  it('renders tab buttons', async () => {
    render(TabsFixture);
    await flushPromises();
    expect(screen.getByRole('tab', { name: 'Tab One' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab Two' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab Three' })).toBeInTheDocument();
  });

  // @behavior keyboard-nav
  // Vue tabs use automatic activation: ArrowRight selects the next tab
  // (React/Angular use manual activation — arrow moves focus, Enter selects).
  it('ArrowRight activates the next tab', async () => {
    const user = userEvent.setup();
    render(TabsFixture);
    await flushPromises();
    screen.getByRole('tab', { name: 'Tab One' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Tab Two' })).toHaveAttribute('aria-selected', 'true');
  });

  // @behavior home-end
  it('Home activates the first tab and End the last', async () => {
    const user = userEvent.setup();
    render(TabsFixture);
    await flushPromises();
    screen.getByRole('tab', { name: 'Tab One' }).focus();
    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Tab Three' })).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Tab One' })).toHaveAttribute('aria-selected', 'true');
  });

  // @behavior wrap
  it('ArrowRight wraps from the last tab to the first', async () => {
    const user = userEvent.setup();
    render(TabsFixture);
    await flushPromises();
    await user.click(screen.getByRole('tab', { name: 'Tab Three' }));
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Tab One' })).toHaveAttribute('aria-selected', 'true');
  });

  // @behavior skip-disabled
  it('arrow navigation skips disabled tabs', async () => {
    const user = userEvent.setup();
    render({
      components: { LlmTabGroup, LlmTab },
      template: `
        <LlmTabGroup>
          <LlmTab label="Active">Active</LlmTab>
          <LlmTab label="Disabled" :disabled="true">Disabled</LlmTab>
          <LlmTab label="Last">Last</LlmTab>
        </LlmTabGroup>
      `,
    });
    await flushPromises();
    screen.getByRole('tab', { name: 'Active' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Last' })).toHaveAttribute('aria-selected', 'true');
  });

  // @behavior first-tab-default
  it('first tab is selected by default', async () => {
    render(TabsFixture);
    await flushPromises();
    expect(screen.getByRole('tab', { name: 'Tab One' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Tab Two' })).toHaveAttribute('aria-selected', 'false');
  });

  it('shows first tab content by default', async () => {
    render(TabsFixture);
    await flushPromises();
    const panels = screen.getAllByRole('tabpanel', { hidden: true });
    expect(panels[0]).not.toHaveAttribute('hidden');
    expect(panels[1]).toHaveAttribute('hidden');
  });

  // @behavior switch-on-click
  it('switches active tab on click', async () => {
    const user = userEvent.setup();
    render(TabsFixture);
    await flushPromises();
    await user.click(screen.getByRole('tab', { name: 'Tab Two' }));
    expect(screen.getByRole('tab', { name: 'Tab Two' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Tab One' })).toHaveAttribute('aria-selected', 'false');
  });

  it('shows panel content for active tab', async () => {
    const user = userEvent.setup();
    render(TabsFixture);
    await flushPromises();
    await user.click(screen.getByRole('tab', { name: 'Tab Two' }));
    const panels = screen.getAllByRole('tabpanel', { hidden: true });
    expect(panels[1]).not.toHaveAttribute('hidden');
    expect(panels[0]).toHaveAttribute('hidden');
  });

  // @behavior variant-class
  it('applies variant class', () => {
    const { container } = render({
      components: { LlmTabGroup, LlmTab },
      template: `<LlmTabGroup variant="pills"><LlmTab label="A">A</LlmTab></LlmTabGroup>`,
    });
    expect(container.querySelector('.llm-tab-group')).toHaveClass('variant-pills');
  });

  // @behavior disabled-tab-noop
  it('disabled tab cannot be selected', async () => {
    render({
      components: { LlmTabGroup, LlmTab },
      template: `
        <LlmTabGroup>
          <LlmTab label="Active">Active</LlmTab>
          <LlmTab label="Disabled" :disabled="true">Disabled</LlmTab>
        </LlmTabGroup>
      `,
    });
    await flushPromises();
    const disabledTab = screen.getByRole('tab', { name: 'Disabled' });
    expect(disabledTab).toBeDisabled();
  });
});
