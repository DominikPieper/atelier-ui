import { render, screen, waitFor } from '@testing-library/vue';
import { userEvent } from '@testing-library/user-event';
import { covers } from '../../testing/behavior';
import AtlTooltip from './atl-tooltip.vue';

describe('AtlTooltip', () => {
  covers('tooltip', 'hidden-initially')('does not show tooltip by default', () => {
    render(AtlTooltip, {
      props: { atlTooltip: 'Tooltip text', atlTooltipShowDelay: 0 },
      slots: { default: '<button>Hover me</button>' },
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  covers('tooltip', 'show-on-hover')('shows tooltip on mouseenter after delay', async () => {
    const user = userEvent.setup();
    render(AtlTooltip, {
      props: { atlTooltip: 'Helpful hint', atlTooltipShowDelay: 0 },
      slots: { default: '<button>Hover me</button>' },
    });
    await user.hover(screen.getByText('Hover me'));
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByRole('tooltip')).toHaveTextContent('Helpful hint');
    });
  });

  covers('tooltip', 'hide-on-leave')('hides tooltip on mouseleave', async () => {
    const user = userEvent.setup();
    render(AtlTooltip, {
      props: { atlTooltip: 'Helpful hint', atlTooltipShowDelay: 0, atlTooltipHideDelay: 0 },
      slots: { default: '<button>Hover me</button>' },
    });
    await user.hover(screen.getByText('Hover me'));
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument());
    await user.unhover(screen.getByText('Hover me'));
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  covers('tooltip', 'disabled-no-show')('does not show tooltip when disabled', async () => {
    const user = userEvent.setup();
    render(AtlTooltip, {
      props: { atlTooltip: 'Disabled tip', atlTooltipDisabled: true, atlTooltipShowDelay: 0 },
      slots: { default: '<button>Hover me</button>' },
    });
    await user.hover(screen.getByText('Hover me'));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('applies position class', async () => {
    const user = userEvent.setup();
    render(AtlTooltip, {
      props: { atlTooltip: 'Below tooltip', atlTooltipPosition: 'below', atlTooltipShowDelay: 0 },
      slots: { default: '<button>Hover me</button>' },
    });
    await user.hover(screen.getByText('Hover me'));
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveClass('position-below');
    });
  });
});
