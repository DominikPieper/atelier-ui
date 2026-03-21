import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LlmAccordionGroup, LlmAccordionItem, LlmAccordionHeader } from './llm-accordion';

describe('LlmAccordionGroup', () => {
  it('renders accordion items', () => {
    render(
      <LlmAccordionGroup>
        <LlmAccordionItem>
          <LlmAccordionHeader>Section One</LlmAccordionHeader>
          Content one
        </LlmAccordionItem>
        <LlmAccordionItem>
          <LlmAccordionHeader>Section Two</LlmAccordionHeader>
          Content two
        </LlmAccordionItem>
      </LlmAccordionGroup>
    );
    expect(screen.getByText('Section One')).toBeInTheDocument();
    expect(screen.getByText('Section Two')).toBeInTheDocument();
  });

  it('items are collapsed by default', () => {
    render(
      <LlmAccordionGroup>
        <LlmAccordionItem>
          <LlmAccordionHeader>Section One</LlmAccordionHeader>
          Content one
        </LlmAccordionItem>
      </LlmAccordionGroup>
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });

  it('expands an item on click', async () => {
    const user = userEvent.setup();
    render(
      <LlmAccordionGroup>
        <LlmAccordionItem>
          <LlmAccordionHeader>Section One</LlmAccordionHeader>
          Content one
        </LlmAccordionItem>
      </LlmAccordionGroup>
    );
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });

  it('collapses an expanded item on second click', async () => {
    const user = userEvent.setup();
    render(
      <LlmAccordionGroup>
        <LlmAccordionItem>
          <LlmAccordionHeader>Section One</LlmAccordionHeader>
          Content one
        </LlmAccordionItem>
      </LlmAccordionGroup>
    );
    const btn = screen.getByRole('button');
    await user.click(btn);
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  it('in single-expand mode, opening one collapses another', async () => {
    const user = userEvent.setup();
    render(
      <LlmAccordionGroup multi={false}>
        <LlmAccordionItem>
          <LlmAccordionHeader>Section One</LlmAccordionHeader>
          Content one
        </LlmAccordionItem>
        <LlmAccordionItem>
          <LlmAccordionHeader>Section Two</LlmAccordionHeader>
          Content two
        </LlmAccordionItem>
      </LlmAccordionGroup>
    );
    const [btn1, btn2] = screen.getAllByRole('button');
    await user.click(btn1);
    expect(btn1).toHaveAttribute('aria-expanded', 'true');
    await user.click(btn2);
    expect(btn1).toHaveAttribute('aria-expanded', 'false');
    expect(btn2).toHaveAttribute('aria-expanded', 'true');
  });

  it('in multi mode, multiple items can be open simultaneously', async () => {
    const user = userEvent.setup();
    render(
      <LlmAccordionGroup multi>
        <LlmAccordionItem>
          <LlmAccordionHeader>Section One</LlmAccordionHeader>
          Content one
        </LlmAccordionItem>
        <LlmAccordionItem>
          <LlmAccordionHeader>Section Two</LlmAccordionHeader>
          Content two
        </LlmAccordionItem>
      </LlmAccordionGroup>
    );
    const [btn1, btn2] = screen.getAllByRole('button');
    await user.click(btn1);
    await user.click(btn2);
    expect(btn1).toHaveAttribute('aria-expanded', 'true');
    expect(btn2).toHaveAttribute('aria-expanded', 'true');
  });

  it('does not toggle a disabled item', async () => {
    const user = userEvent.setup();
    render(
      <LlmAccordionGroup>
        <LlmAccordionItem disabled>
          <LlmAccordionHeader>Disabled</LlmAccordionHeader>
          Content
        </LlmAccordionItem>
      </LlmAccordionGroup>
    );
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });

  it('calls onExpandedChange when toggled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <LlmAccordionGroup>
        <LlmAccordionItem onExpandedChange={onChange}>
          <LlmAccordionHeader>Section</LlmAccordionHeader>
          Content
        </LlmAccordionItem>
      </LlmAccordionGroup>
    );
    await user.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it.each(['default', 'bordered', 'separated'] as const)(
    'applies variant-%s class',
    (variant) => {
      const { container } = render(
        <LlmAccordionGroup variant={variant}>
          <LlmAccordionItem>
            <LlmAccordionHeader>Section</LlmAccordionHeader>
          </LlmAccordionItem>
        </LlmAccordionGroup>
      );
      expect(container.firstChild).toHaveClass(`variant-${variant}`);
    }
  );
});
