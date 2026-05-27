import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LlmTabGroup, LlmTab } from './llm-tabs';

describe('LlmTabGroup', () => {
  it('renders tab buttons with correct labels', () => {
    render(
      <LlmTabGroup>
        <LlmTab label="Tab One">Content One</LlmTab>
        <LlmTab label="Tab Two">Content Two</LlmTab>
      </LlmTabGroup>
    );
    expect(screen.getByRole('tab', { name: 'Tab One' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab Two' })).toBeInTheDocument();
  });

  // @behavior keyboard-nav
  it('ArrowRight moves focus to the next tab', async () => {
    const user = userEvent.setup();
    render(
      <LlmTabGroup>
        <LlmTab label="Tab One">Content One</LlmTab>
        <LlmTab label="Tab Two">Content Two</LlmTab>
      </LlmTabGroup>
    );
    screen.getByRole('tab', { name: 'Tab One' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Tab Two' })).toHaveFocus();
  });

  // @behavior home-end
  it('Home focuses the first tab and End the last', async () => {
    const user = userEvent.setup();
    render(
      <LlmTabGroup>
        <LlmTab label="Tab One">Content One</LlmTab>
        <LlmTab label="Tab Two">Content Two</LlmTab>
        <LlmTab label="Tab Three">Content Three</LlmTab>
      </LlmTabGroup>
    );
    screen.getByRole('tab', { name: 'Tab One' }).focus();
    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Tab Three' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Tab One' })).toHaveFocus();
  });

  // @behavior wrap
  it('ArrowRight wraps from the last tab to the first', async () => {
    const user = userEvent.setup();
    render(
      <LlmTabGroup>
        <LlmTab label="Tab One">Content One</LlmTab>
        <LlmTab label="Tab Two">Content Two</LlmTab>
      </LlmTabGroup>
    );
    await user.click(screen.getByRole('tab', { name: 'Tab Two' }));
    screen.getByRole('tab', { name: 'Tab Two' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Tab One' })).toHaveFocus();
  });

  // @behavior skip-disabled
  it('arrow navigation skips disabled tabs', async () => {
    const user = userEvent.setup();
    render(
      <LlmTabGroup>
        <LlmTab label="Tab One">Content One</LlmTab>
        <LlmTab label="Tab Two" disabled>Content Two</LlmTab>
        <LlmTab label="Tab Three">Content Three</LlmTab>
      </LlmTabGroup>
    );
    screen.getByRole('tab', { name: 'Tab One' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Tab Three' })).toHaveFocus();
  });

  // @behavior first-tab-default
  it('selects the first tab by default', () => {
    render(
      <LlmTabGroup>
        <LlmTab label="Tab One">Content One</LlmTab>
        <LlmTab label="Tab Two">Content Two</LlmTab>
      </LlmTabGroup>
    );
    expect(screen.getByRole('tab', { name: 'Tab One' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Tab Two' })).toHaveAttribute('aria-selected', 'false');
  });

  it('shows first tab panel and hides others', () => {
    render(
      <LlmTabGroup>
        <LlmTab label="Tab One">Content One</LlmTab>
        <LlmTab label="Tab Two">Content Two</LlmTab>
      </LlmTabGroup>
    );
    const panels = screen.getAllByRole('tabpanel', { hidden: true });
    expect(panels[0]).not.toHaveAttribute('hidden');
    expect(panels[1]).toHaveAttribute('hidden');
  });

  // @behavior switch-on-click
  it('switches tab on click', async () => {
    const user = userEvent.setup();
    render(
      <LlmTabGroup>
        <LlmTab label="Tab One">Content One</LlmTab>
        <LlmTab label="Tab Two">Content Two</LlmTab>
      </LlmTabGroup>
    );
    await user.click(screen.getByRole('tab', { name: 'Tab Two' }));
    expect(screen.getByRole('tab', { name: 'Tab Two' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Tab One' })).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onSelectedIndexChange when tab changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <LlmTabGroup onSelectedIndexChange={onChange}>
        <LlmTab label="Tab One">Content One</LlmTab>
        <LlmTab label="Tab Two">Content Two</LlmTab>
      </LlmTabGroup>
    );
    await user.click(screen.getByRole('tab', { name: 'Tab Two' }));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('respects controlled selectedIndex', () => {
    render(
      <LlmTabGroup selectedIndex={1}>
        <LlmTab label="Tab One">Content One</LlmTab>
        <LlmTab label="Tab Two">Content Two</LlmTab>
      </LlmTabGroup>
    );
    expect(screen.getByRole('tab', { name: 'Tab Two' })).toHaveAttribute('aria-selected', 'true');
  });

  // @behavior disabled-tab-noop
  it('does not select a disabled tab on click', async () => {
    const user = userEvent.setup();
    render(
      <LlmTabGroup>
        <LlmTab label="Tab One">Content One</LlmTab>
        <LlmTab label="Tab Two" disabled>Content Two</LlmTab>
      </LlmTabGroup>
    );
    await user.click(screen.getByRole('tab', { name: 'Tab Two' }));
    expect(screen.getByRole('tab', { name: 'Tab One' })).toHaveAttribute('aria-selected', 'true');
  });

  it('navigates with ArrowRight key', async () => {
    const user = userEvent.setup();
    render(
      <LlmTabGroup>
        <LlmTab label="Tab One">Content One</LlmTab>
        <LlmTab label="Tab Two">Content Two</LlmTab>
        <LlmTab label="Tab Three">Content Three</LlmTab>
      </LlmTabGroup>
    );
    screen.getByRole('tab', { name: 'Tab One' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Tab Two' })).toHaveAttribute('aria-selected', 'true');
  });

  it('navigates with ArrowLeft key', async () => {
    const user = userEvent.setup();
    render(
      <LlmTabGroup>
        <LlmTab label="Tab One">Content One</LlmTab>
        <LlmTab label="Tab Two">Content Two</LlmTab>
      </LlmTabGroup>
    );
    // First navigate to tab two with ArrowRight, then go back with ArrowLeft
    screen.getByRole('tab', { name: 'Tab One' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Tab Two' })).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Tab One' })).toHaveAttribute('aria-selected', 'true');
  });

  // @behavior variant-class
  it('applies variant-pills class', () => {
    const { container } = render(
      <LlmTabGroup variant="pills">
        <LlmTab label="Tab One">Content</LlmTab>
      </LlmTabGroup>
    );
    expect(container.firstChild).toHaveClass('variant-pills');
  });

  it('applies variant-default class', () => {
    const { container } = render(
      <LlmTabGroup variant="default">
        <LlmTab label="Tab One">Content</LlmTab>
      </LlmTabGroup>
    );
    expect(container.firstChild).toHaveClass('variant-default');
  });

  it('uses tablist role', () => {
    render(
      <LlmTabGroup>
        <LlmTab label="Tab">Content</LlmTab>
      </LlmTabGroup>
    );
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });
});
