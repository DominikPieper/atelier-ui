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

  it('applies variant class', () => {
    const { container } = render({
      components: { LlmTabGroup, LlmTab },
      template: `<LlmTabGroup variant="pills"><LlmTab label="A">A</LlmTab></LlmTabGroup>`,
    });
    expect(container.querySelector('.llm-tab-group')).toHaveClass('variant-pills');
  });

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
