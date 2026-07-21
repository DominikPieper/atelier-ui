import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AtlAccordionGroup, AtlAccordionItem, AtlAccordionHeader } from './atl-accordion';
import { covers } from '../../testing/behavior';

describe('AtlAccordionGroup', () => {
  it('renders accordion items', () => {
    render(
      <AtlAccordionGroup>
        <AtlAccordionItem>
          <AtlAccordionHeader>Section One</AtlAccordionHeader>
          Content one
        </AtlAccordionItem>
        <AtlAccordionItem>
          <AtlAccordionHeader>Section Two</AtlAccordionHeader>
          Content two
        </AtlAccordionItem>
      </AtlAccordionGroup>
    );
    expect(screen.getByText('Section One')).toBeInTheDocument();
    expect(screen.getByText('Section Two')).toBeInTheDocument();
  });

  it('items are collapsed by default', () => {
    render(
      <AtlAccordionGroup>
        <AtlAccordionItem>
          <AtlAccordionHeader>Section One</AtlAccordionHeader>
          Content one
        </AtlAccordionItem>
      </AtlAccordionGroup>
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });

  covers('accordion', 'keyboard-nav')('ArrowDown moves focus to the next header', async () => {
    const user = userEvent.setup();
    render(
      <AtlAccordionGroup>
        <AtlAccordionItem>
          <AtlAccordionHeader>Section One</AtlAccordionHeader>
          Content one
        </AtlAccordionItem>
        <AtlAccordionItem>
          <AtlAccordionHeader>Section Two</AtlAccordionHeader>
          Content two
        </AtlAccordionItem>
      </AtlAccordionGroup>
    );
    const [first, second] = screen.getAllByRole('button');
    first.focus();
    await user.keyboard('{ArrowDown}');
    expect(second).toHaveFocus();
  });

  covers('accordion', 'home-end')('Home focuses the first header and End the last', async () => {
    const user = userEvent.setup();
    render(
      <AtlAccordionGroup>
        <AtlAccordionItem><AtlAccordionHeader>Section One</AtlAccordionHeader>One</AtlAccordionItem>
        <AtlAccordionItem><AtlAccordionHeader>Section Two</AtlAccordionHeader>Two</AtlAccordionItem>
        <AtlAccordionItem><AtlAccordionHeader>Section Three</AtlAccordionHeader>Three</AtlAccordionItem>
      </AtlAccordionGroup>
    );
    const btns = screen.getAllByRole('button');
    btns[0].focus();
    await user.keyboard('{End}');
    expect(btns[2]).toHaveFocus();
    await user.keyboard('{Home}');
    expect(btns[0]).toHaveFocus();
  });

  covers('accordion', 'wrap')('ArrowDown wraps from the last header to the first', async () => {
    const user = userEvent.setup();
    render(
      <AtlAccordionGroup>
        <AtlAccordionItem><AtlAccordionHeader>Section One</AtlAccordionHeader>One</AtlAccordionItem>
        <AtlAccordionItem><AtlAccordionHeader>Section Two</AtlAccordionHeader>Two</AtlAccordionItem>
      </AtlAccordionGroup>
    );
    const btns = screen.getAllByRole('button');
    btns[1].focus();
    await user.keyboard('{ArrowDown}');
    expect(btns[0]).toHaveFocus();
  });

  covers('accordion', 'skip-disabled')('arrow navigation skips disabled items', async () => {
    const user = userEvent.setup();
    render(
      <AtlAccordionGroup>
        <AtlAccordionItem><AtlAccordionHeader>Section One</AtlAccordionHeader>One</AtlAccordionItem>
        <AtlAccordionItem disabled><AtlAccordionHeader>Section Two</AtlAccordionHeader>Two</AtlAccordionItem>
        <AtlAccordionItem><AtlAccordionHeader>Section Three</AtlAccordionHeader>Three</AtlAccordionItem>
      </AtlAccordionGroup>
    );
    screen.getByRole('button', { name: 'Section One' }).focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Section Three' })).toHaveFocus();
  });

  covers('accordion', 'expand-on-click')('expands an item on click', async () => {
    const user = userEvent.setup();
    render(
      <AtlAccordionGroup>
        <AtlAccordionItem>
          <AtlAccordionHeader>Section One</AtlAccordionHeader>
          Content one
        </AtlAccordionItem>
      </AtlAccordionGroup>
    );
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });

  covers('accordion', 'collapse-on-click')('collapses an expanded item on second click', async () => {
    const user = userEvent.setup();
    render(
      <AtlAccordionGroup>
        <AtlAccordionItem>
          <AtlAccordionHeader>Section One</AtlAccordionHeader>
          Content one
        </AtlAccordionItem>
      </AtlAccordionGroup>
    );
    const btn = screen.getByRole('button');
    await user.click(btn);
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  covers('accordion', 'single-collapse-other')('in single-expand mode, opening one collapses another', async () => {
    const user = userEvent.setup();
    render(
      <AtlAccordionGroup multi={false}>
        <AtlAccordionItem>
          <AtlAccordionHeader>Section One</AtlAccordionHeader>
          Content one
        </AtlAccordionItem>
        <AtlAccordionItem>
          <AtlAccordionHeader>Section Two</AtlAccordionHeader>
          Content two
        </AtlAccordionItem>
      </AtlAccordionGroup>
    );
    const [btn1, btn2] = screen.getAllByRole('button');
    await user.click(btn1);
    expect(btn1).toHaveAttribute('aria-expanded', 'true');
    await user.click(btn2);
    expect(btn1).toHaveAttribute('aria-expanded', 'false');
    expect(btn2).toHaveAttribute('aria-expanded', 'true');
  });

  covers('accordion', 'multi-expand')('in multi mode, multiple items can be open simultaneously', async () => {
    const user = userEvent.setup();
    render(
      <AtlAccordionGroup multi>
        <AtlAccordionItem>
          <AtlAccordionHeader>Section One</AtlAccordionHeader>
          Content one
        </AtlAccordionItem>
        <AtlAccordionItem>
          <AtlAccordionHeader>Section Two</AtlAccordionHeader>
          Content two
        </AtlAccordionItem>
      </AtlAccordionGroup>
    );
    const [btn1, btn2] = screen.getAllByRole('button');
    await user.click(btn1);
    await user.click(btn2);
    expect(btn1).toHaveAttribute('aria-expanded', 'true');
    expect(btn2).toHaveAttribute('aria-expanded', 'true');
  });

  covers('accordion', 'disabled-no-toggle')('does not toggle a disabled item', async () => {
    const user = userEvent.setup();
    render(
      <AtlAccordionGroup>
        <AtlAccordionItem disabled>
          <AtlAccordionHeader>Disabled</AtlAccordionHeader>
          Content
        </AtlAccordionItem>
      </AtlAccordionGroup>
    );
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });

  it('calls onExpandedChange when toggled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <AtlAccordionGroup>
        <AtlAccordionItem onExpandedChange={onChange}>
          <AtlAccordionHeader>Section</AtlAccordionHeader>
          Content
        </AtlAccordionItem>
      </AtlAccordionGroup>
    );
    await user.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it.each(['default', 'bordered', 'separated'] as const)(
    'applies variant-%s class',
    (variant) => {
      const { container } = render(
        <AtlAccordionGroup variant={variant}>
          <AtlAccordionItem>
            <AtlAccordionHeader>Section</AtlAccordionHeader>
          </AtlAccordionItem>
        </AtlAccordionGroup>
      );
      expect(container.firstChild).toHaveClass(`variant-${variant}`);
    }
  );
});
