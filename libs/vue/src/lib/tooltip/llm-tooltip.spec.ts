import { render, screen, waitFor } from '@testing-library/vue';
import { userEvent } from '@testing-library/user-event';
import LlmTooltip from './llm-tooltip.vue';

describe('LlmTooltip', () => {
  it('does not show tooltip by default', () => {
    render(LlmTooltip, {
      props: { llmTooltip: 'Tooltip text', llmTooltipShowDelay: 0 },
      slots: { default: '<button>Hover me</button>' },
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on mouseenter after delay', async () => {
    const user = userEvent.setup();
    render(LlmTooltip, {
      props: { llmTooltip: 'Helpful hint', llmTooltipShowDelay: 0 },
      slots: { default: '<button>Hover me</button>' },
    });
    await user.hover(screen.getByText('Hover me'));
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByRole('tooltip')).toHaveTextContent('Helpful hint');
    });
  });

  it('hides tooltip on mouseleave', async () => {
    const user = userEvent.setup();
    render(LlmTooltip, {
      props: { llmTooltip: 'Helpful hint', llmTooltipShowDelay: 0, llmTooltipHideDelay: 0 },
      slots: { default: '<button>Hover me</button>' },
    });
    await user.hover(screen.getByText('Hover me'));
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument());
    await user.unhover(screen.getByText('Hover me'));
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('does not show tooltip when disabled', async () => {
    const user = userEvent.setup();
    render(LlmTooltip, {
      props: { llmTooltip: 'Disabled tip', llmTooltipDisabled: true, llmTooltipShowDelay: 0 },
      slots: { default: '<button>Hover me</button>' },
    });
    await user.hover(screen.getByText('Hover me'));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('applies position class', async () => {
    const user = userEvent.setup();
    render(LlmTooltip, {
      props: { llmTooltip: 'Below tooltip', llmTooltipPosition: 'below', llmTooltipShowDelay: 0 },
      slots: { default: '<button>Hover me</button>' },
    });
    await user.hover(screen.getByText('Hover me'));
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveClass('position-below');
    });
  });
});
