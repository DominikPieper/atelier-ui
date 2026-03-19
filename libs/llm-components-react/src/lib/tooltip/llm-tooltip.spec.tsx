import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LlmTooltip } from './llm-tooltip';

describe('LlmTooltip', () => {
  it('does not show tooltip initially', () => {
    render(
      <LlmTooltip llmTooltip="Save your changes" llmTooltipShowDelay={0}>
        <button>Save</button>
      </LlmTooltip>
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on hover after delay', async () => {
    const user = userEvent.setup();
    render(
      <LlmTooltip llmTooltip="Save your changes" llmTooltipShowDelay={0}>
        <button>Save</button>
      </LlmTooltip>
    );
    await user.hover(screen.getByText('Save'));
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByRole('tooltip')).toHaveTextContent('Save your changes');
  });

  it('hides tooltip on mouse leave', async () => {
    const user = userEvent.setup();
    render(
      <LlmTooltip llmTooltip="Save your changes" llmTooltipShowDelay={0} llmTooltipHideDelay={0}>
        <button>Save</button>
      </LlmTooltip>
    );
    await user.hover(screen.getByText('Save'));
    await act(async () => { await new Promise(r => setTimeout(r, 10)); });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    await user.unhover(screen.getByText('Save'));
    await act(async () => { await new Promise(r => setTimeout(r, 10)); });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('does not show tooltip when disabled', async () => {
    const user = userEvent.setup();
    render(
      <LlmTooltip llmTooltip="Save your changes" llmTooltipDisabled llmTooltipShowDelay={0}>
        <button>Save</button>
      </LlmTooltip>
    );
    await user.hover(screen.getByText('Save'));
    await act(async () => { await new Promise(r => setTimeout(r, 10)); });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('applies position class based on position prop', async () => {
    const user = userEvent.setup();
    render(
      <LlmTooltip llmTooltip="Help text" llmTooltipPosition="right" llmTooltipShowDelay={0}>
        <button>Info</button>
      </LlmTooltip>
    );
    await user.hover(screen.getByText('Info'));
    await act(async () => { await new Promise(r => setTimeout(r, 10)); });
    expect(screen.getByRole('tooltip')).toHaveClass('position-right');
  });

  it('has role="tooltip" on the tooltip element', async () => {
    const user = userEvent.setup();
    render(
      <LlmTooltip llmTooltip="Tooltip text" llmTooltipShowDelay={0}>
        <button>Hover me</button>
      </LlmTooltip>
    );
    await user.hover(screen.getByText('Hover me'));
    await act(async () => { await new Promise(r => setTimeout(r, 10)); });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });
});
