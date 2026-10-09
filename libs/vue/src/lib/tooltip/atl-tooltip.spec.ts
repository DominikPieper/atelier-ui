import { render, screen, waitFor } from '@testing-library/vue';
import { userEvent } from '@testing-library/user-event';
import { covers } from '../../testing/behavior';
import AtlTooltip from './atl-tooltip.vue';

describe('AtlTooltip', () => {
  covers('tooltip', 'hidden-initially')(
    'does not show tooltip by default',
    () => {
      render(AtlTooltip, {
        props: { atlTooltip: 'Tooltip text', atlTooltipShowDelay: 0 },
        slots: { default: '<button>Hover me</button>' },
      });
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    },
  );

  covers('tooltip', 'show-on-hover')(
    'shows tooltip on mouseenter after delay',
    async () => {
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
    },
  );

  covers('tooltip', 'hide-on-leave')(
    'hides tooltip on mouseleave',
    async () => {
      const user = userEvent.setup();
      render(AtlTooltip, {
        props: {
          atlTooltip: 'Helpful hint',
          atlTooltipShowDelay: 0,
          atlTooltipHideDelay: 0,
        },
        slots: { default: '<button>Hover me</button>' },
      });
      await user.hover(screen.getByText('Hover me'));
      await waitFor(() =>
        expect(screen.getByRole('tooltip')).toBeInTheDocument(),
      );
      await user.unhover(screen.getByText('Hover me'));
      await waitFor(() =>
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument(),
      );
    },
  );

  covers('tooltip', 'disabled-no-show')(
    'does not show tooltip when disabled',
    async () => {
      const user = userEvent.setup();
      render(AtlTooltip, {
        props: {
          atlTooltip: 'Disabled tip',
          atlTooltipDisabled: true,
          atlTooltipShowDelay: 0,
        },
        slots: { default: '<button>Hover me</button>' },
      });
      await user.hover(screen.getByText('Hover me'));
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    },
  );

  // WCAG 1.4.13 (Content on Hover or Focus): content shown on hover must also
  // be reachable by keyboard. Pins down @focusin/@focusout on the wrapper —
  // @focus/@blur don't bubble, so a listener on the wrapper span would never
  // fire when the *slotted* button (a descendant, not the span itself)
  // receives focus, silently breaking this for keyboard/screen-reader users
  // while every hover-only test above kept passing.
  covers('tooltip', 'show-on-focus')(
    'shows tooltip when the slotted trigger receives keyboard focus',
    async () => {
      const user = userEvent.setup();
      render(AtlTooltip, {
        props: { atlTooltip: 'Helpful hint', atlTooltipShowDelay: 0 },
        slots: { default: '<button>Focus me</button>' },
      });
      await user.tab();
      expect(document.activeElement).toBe(screen.getByText('Focus me'));
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    },
  );

  covers('tooltip', 'hide-on-escape')(
    'hides an open tooltip on Escape',
    async () => {
      const user = userEvent.setup();
      render(AtlTooltip, {
        props: { atlTooltip: 'Helpful hint', atlTooltipShowDelay: 0 },
        slots: { default: '<button>Focus me</button>' },
      });
      await user.tab();
      await waitFor(() =>
        expect(screen.getByRole('tooltip')).toBeInTheDocument(),
      );
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    },
  );

  it('applies position class', async () => {
    const user = userEvent.setup();
    render(AtlTooltip, {
      props: {
        atlTooltip: 'Below tooltip',
        atlTooltipPosition: 'below',
        atlTooltipShowDelay: 0,
      },
      slots: { default: '<button>Hover me</button>' },
    });
    await user.hover(screen.getByText('Hover me'));
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveClass('position-below');
    });
  });

  it('points the trigger at the tooltip via aria-describedby while it is shown', async () => {
    const user = userEvent.setup();
    render(AtlTooltip, {
      props: {
        atlTooltip: 'Helpful hint',
        atlTooltipShowDelay: 0,
        atlTooltipHideDelay: 0,
      },
      slots: { default: '<button>Hover me</button>' },
    });
    const trigger = screen.getByText('Hover me');
    expect(trigger).not.toHaveAttribute('aria-describedby');
    await user.hover(trigger);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip.id).not.toBe('');
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
    await user.unhover(trigger);
    await waitFor(() =>
      expect(trigger).not.toHaveAttribute('aria-describedby'),
    );
  });
});
