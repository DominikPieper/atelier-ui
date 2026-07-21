import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { covers } from '../../testing/behavior';
import { AtlTabGroup, AtlTab } from './atl-tabs';

describe('AtlTabGroup', () => {
  it('renders tab buttons with correct labels', () => {
    render(
      <AtlTabGroup>
        <AtlTab label="Tab One">Content One</AtlTab>
        <AtlTab label="Tab Two">Content Two</AtlTab>
      </AtlTabGroup>
    );
    expect(screen.getByRole('tab', { name: 'Tab One' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab Two' })).toBeInTheDocument();
  });

  covers('tabs', 'keyboard-nav')('ArrowRight moves focus to the next tab', async () => {
    const user = userEvent.setup();
    render(
      <AtlTabGroup>
        <AtlTab label="Tab One">Content One</AtlTab>
        <AtlTab label="Tab Two">Content Two</AtlTab>
      </AtlTabGroup>
    );
    screen.getByRole('tab', { name: 'Tab One' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Tab Two' })).toHaveFocus();
  });

  covers('tabs', 'home-end')('Home focuses the first tab and End the last', async () => {
    const user = userEvent.setup();
    render(
      <AtlTabGroup>
        <AtlTab label="Tab One">Content One</AtlTab>
        <AtlTab label="Tab Two">Content Two</AtlTab>
        <AtlTab label="Tab Three">Content Three</AtlTab>
      </AtlTabGroup>
    );
    screen.getByRole('tab', { name: 'Tab One' }).focus();
    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Tab Three' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Tab One' })).toHaveFocus();
  });

  covers('tabs', 'wrap')('ArrowRight wraps from the last tab to the first', async () => {
    const user = userEvent.setup();
    render(
      <AtlTabGroup>
        <AtlTab label="Tab One">Content One</AtlTab>
        <AtlTab label="Tab Two">Content Two</AtlTab>
      </AtlTabGroup>
    );
    await user.click(screen.getByRole('tab', { name: 'Tab Two' }));
    screen.getByRole('tab', { name: 'Tab Two' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Tab One' })).toHaveFocus();
  });

  covers('tabs', 'skip-disabled')('arrow navigation skips disabled tabs', async () => {
    const user = userEvent.setup();
    render(
      <AtlTabGroup>
        <AtlTab label="Tab One">Content One</AtlTab>
        <AtlTab label="Tab Two" disabled>Content Two</AtlTab>
        <AtlTab label="Tab Three">Content Three</AtlTab>
      </AtlTabGroup>
    );
    screen.getByRole('tab', { name: 'Tab One' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Tab Three' })).toHaveFocus();
  });

  covers('tabs', 'first-tab-default')('selects the first tab by default', () => {
    render(
      <AtlTabGroup>
        <AtlTab label="Tab One">Content One</AtlTab>
        <AtlTab label="Tab Two">Content Two</AtlTab>
      </AtlTabGroup>
    );
    expect(screen.getByRole('tab', { name: 'Tab One' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Tab Two' })).toHaveAttribute('aria-selected', 'false');
  });

  it('shows first tab panel and hides others', () => {
    render(
      <AtlTabGroup>
        <AtlTab label="Tab One">Content One</AtlTab>
        <AtlTab label="Tab Two">Content Two</AtlTab>
      </AtlTabGroup>
    );
    const panels = screen.getAllByRole('tabpanel', { hidden: true });
    expect(panels[0]).not.toHaveAttribute('hidden');
    expect(panels[1]).toHaveAttribute('hidden');
  });

  covers('tabs', 'switch-on-click')('switches tab on click', async () => {
    const user = userEvent.setup();
    render(
      <AtlTabGroup>
        <AtlTab label="Tab One">Content One</AtlTab>
        <AtlTab label="Tab Two">Content Two</AtlTab>
      </AtlTabGroup>
    );
    await user.click(screen.getByRole('tab', { name: 'Tab Two' }));
    expect(screen.getByRole('tab', { name: 'Tab Two' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Tab One' })).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onSelectedIndexChange when tab changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <AtlTabGroup onSelectedIndexChange={onChange}>
        <AtlTab label="Tab One">Content One</AtlTab>
        <AtlTab label="Tab Two">Content Two</AtlTab>
      </AtlTabGroup>
    );
    await user.click(screen.getByRole('tab', { name: 'Tab Two' }));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('respects controlled selectedIndex', () => {
    render(
      <AtlTabGroup selectedIndex={1}>
        <AtlTab label="Tab One">Content One</AtlTab>
        <AtlTab label="Tab Two">Content Two</AtlTab>
      </AtlTabGroup>
    );
    expect(screen.getByRole('tab', { name: 'Tab Two' })).toHaveAttribute('aria-selected', 'true');
  });

  covers('tabs', 'disabled-tab-noop')('does not select a disabled tab on click', async () => {
    const user = userEvent.setup();
    render(
      <AtlTabGroup>
        <AtlTab label="Tab One">Content One</AtlTab>
        <AtlTab label="Tab Two" disabled>Content Two</AtlTab>
      </AtlTabGroup>
    );
    await user.click(screen.getByRole('tab', { name: 'Tab Two' }));
    expect(screen.getByRole('tab', { name: 'Tab One' })).toHaveAttribute('aria-selected', 'true');
  });

  it('navigates with ArrowRight key', async () => {
    const user = userEvent.setup();
    render(
      <AtlTabGroup>
        <AtlTab label="Tab One">Content One</AtlTab>
        <AtlTab label="Tab Two">Content Two</AtlTab>
        <AtlTab label="Tab Three">Content Three</AtlTab>
      </AtlTabGroup>
    );
    screen.getByRole('tab', { name: 'Tab One' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Tab Two' })).toHaveAttribute('aria-selected', 'true');
  });

  it('navigates with ArrowLeft key', async () => {
    const user = userEvent.setup();
    render(
      <AtlTabGroup>
        <AtlTab label="Tab One">Content One</AtlTab>
        <AtlTab label="Tab Two">Content Two</AtlTab>
      </AtlTabGroup>
    );
    // First navigate to tab two with ArrowRight, then go back with ArrowLeft
    screen.getByRole('tab', { name: 'Tab One' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Tab Two' })).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Tab One' })).toHaveAttribute('aria-selected', 'true');
  });

  covers('tabs', 'variant-class')('applies variant-pills class', () => {
    const { container } = render(
      <AtlTabGroup variant="pills">
        <AtlTab label="Tab One">Content</AtlTab>
      </AtlTabGroup>
    );
    expect(container.firstChild).toHaveClass('variant-pills');
  });

  it('applies variant-default class', () => {
    const { container } = render(
      <AtlTabGroup variant="default">
        <AtlTab label="Tab One">Content</AtlTab>
      </AtlTabGroup>
    );
    expect(container.firstChild).toHaveClass('variant-default');
  });

  it('uses tablist role', () => {
    render(
      <AtlTabGroup>
        <AtlTab label="Tab">Content</AtlTab>
      </AtlTabGroup>
    );
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });
});
