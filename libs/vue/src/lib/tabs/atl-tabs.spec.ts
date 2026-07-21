import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { flushPromises } from '@vue/test-utils';
import AtlTabGroup from './atl-tab-group.vue';
import AtlTab from './atl-tab.vue';
import { covers } from '../../testing/behavior';

const TabsFixture = {
  components: { AtlTabGroup, AtlTab },
  template: `
    <AtlTabGroup>
      <AtlTab label="Tab One">Content One</AtlTab>
      <AtlTab label="Tab Two">Content Two</AtlTab>
      <AtlTab label="Tab Three">Content Three</AtlTab>
    </AtlTabGroup>
  `,
};

describe('AtlTabGroup', () => {
  it('renders tab buttons', async () => {
    render(TabsFixture);
    await flushPromises();
    expect(screen.getByRole('tab', { name: 'Tab One' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab Two' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab Three' })).toBeInTheDocument();
  });

  // Vue tabs use automatic activation: ArrowRight selects the next tab
  // (React/Angular use manual activation — arrow moves focus, Enter selects).
  covers('tabs', 'keyboard-nav')('ArrowRight activates the next tab', async () => {
    const user = userEvent.setup();
    render(TabsFixture);
    await flushPromises();
    screen.getByRole('tab', { name: 'Tab One' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Tab Two' })).toHaveAttribute('aria-selected', 'true');
  });

  covers('tabs', 'home-end')('Home activates the first tab and End the last', async () => {
    const user = userEvent.setup();
    render(TabsFixture);
    await flushPromises();
    screen.getByRole('tab', { name: 'Tab One' }).focus();
    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Tab Three' })).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Tab One' })).toHaveAttribute('aria-selected', 'true');
  });

  covers('tabs', 'wrap')('ArrowRight wraps from the last tab to the first', async () => {
    const user = userEvent.setup();
    render(TabsFixture);
    await flushPromises();
    await user.click(screen.getByRole('tab', { name: 'Tab Three' }));
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Tab One' })).toHaveAttribute('aria-selected', 'true');
  });

  covers('tabs', 'skip-disabled')('arrow navigation skips disabled tabs', async () => {
    const user = userEvent.setup();
    render({
      components: { AtlTabGroup, AtlTab },
      template: `
        <AtlTabGroup>
          <AtlTab label="Active">Active</AtlTab>
          <AtlTab label="Disabled" :disabled="true">Disabled</AtlTab>
          <AtlTab label="Last">Last</AtlTab>
        </AtlTabGroup>
      `,
    });
    await flushPromises();
    screen.getByRole('tab', { name: 'Active' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Last' })).toHaveAttribute('aria-selected', 'true');
  });

  covers('tabs', 'first-tab-default')('first tab is selected by default', async () => {
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

  covers('tabs', 'switch-on-click')('switches active tab on click', async () => {
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

  covers('tabs', 'variant-class')('applies variant class', () => {
    const { container } = render({
      components: { AtlTabGroup, AtlTab },
      template: `<AtlTabGroup variant="pills"><AtlTab label="A">A</AtlTab></AtlTabGroup>`,
    });
    expect(container.querySelector('.atl-tab-group')).toHaveClass('variant-pills');
  });

  covers('tabs', 'disabled-tab-noop')('disabled tab cannot be selected', async () => {
    render({
      components: { AtlTabGroup, AtlTab },
      template: `
        <AtlTabGroup>
          <AtlTab label="Active">Active</AtlTab>
          <AtlTab label="Disabled" :disabled="true">Disabled</AtlTab>
        </AtlTabGroup>
      `,
    });
    await flushPromises();
    const disabledTab = screen.getByRole('tab', { name: 'Disabled' });
    expect(disabledTab).toBeDisabled();
  });
});
