import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { AtlTooltip } from './atl-tooltip';
import { AtlButton } from '../button/atl-button';
import { OverlayModule } from '@angular/cdk/overlay';
import { covers } from '../../testing/behavior';

const TOOLTIP_IMPORTS = [AtlTooltip, AtlButton, OverlayModule];

describe('AtlTooltip', () => {
  afterEach(() => {
    // Clean up any overlay containers left by CDK
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  it('renders the host element', async () => {
    await render(
      '<atl-button atlTooltip="Save changes">Save</atl-button>',
      { imports: TOOLTIP_IMPORTS },
    );
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  covers('tooltip', 'hidden-initially')('does not show tooltip initially', async () => {
    await render(
      '<atl-button atlTooltip="Save changes">Save</atl-button>',
      { imports: TOOLTIP_IMPORTS },
    );
    expect(document.querySelector('.atl-tooltip')).not.toBeInTheDocument();
  });

  it('does not have aria-describedby initially', async () => {
    const { container } = await render(
      '<atl-button atlTooltip="Save changes">Save</atl-button>',
      { imports: TOOLTIP_IMPORTS },
    );
    expect(container.querySelector('[aria-describedby]')).toBeNull();
  });

  covers('tooltip', 'show-on-hover')('shows tooltip on mouseenter after delay', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    await render(
      '<atl-button atlTooltip="Save changes" [atlTooltipShowDelay]="0">Save</atl-button>',
      { imports: TOOLTIP_IMPORTS },
    );

    await user.hover(screen.getByText('Save'));
    vi.advanceTimersByTime(1);

    const tooltip = document.querySelector('.atl-tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip?.textContent).toBe('Save changes');

    vi.useRealTimers();
  });

  it('sets role="tooltip" on the tooltip content', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    await render(
      '<atl-button atlTooltip="Help text" [atlTooltipShowDelay]="0">Help</atl-button>',
      { imports: TOOLTIP_IMPORTS },
    );

    await user.hover(screen.getByText('Help'));
    vi.advanceTimersByTime(1);

    expect(document.querySelector('[role="tooltip"]')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('sets aria-describedby on the host when tooltip is visible', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    await render(
      '<atl-button atlTooltip="Info" [atlTooltipShowDelay]="0">Btn</atl-button>',
      { imports: TOOLTIP_IMPORTS },
    );

    const button = screen.getByText('Btn');
    await user.hover(button);
    vi.advanceTimersByTime(1);

    const tooltip = document.querySelector('.atl-tooltip');
    const tooltipId = tooltip?.getAttribute('id');
    expect(tooltipId).toBeTruthy();

    const hostWithDescribedBy = button.closest('[aria-describedby]');
    expect(hostWithDescribedBy?.getAttribute('aria-describedby')).toBe(tooltipId);

    vi.useRealTimers();
  });

  covers('tooltip', 'disabled-no-show')('does not show tooltip when disabled', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    await render(
      '<atl-button atlTooltip="Hidden" [atlTooltipDisabled]="true" [atlTooltipShowDelay]="0">Btn</atl-button>',
      { imports: TOOLTIP_IMPORTS },
    );

    await user.hover(screen.getByText('Btn'));
    vi.advanceTimersByTime(1);

    expect(document.querySelector('.atl-tooltip')).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  covers('tooltip', 'hide-on-leave')('hides tooltip on mouseleave', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    await render(
      '<atl-button atlTooltip="Temp" [atlTooltipShowDelay]="0" [atlTooltipHideDelay]="0">Btn</atl-button>',
      { imports: TOOLTIP_IMPORTS },
    );

    const btn = screen.getByText('Btn');
    await user.hover(btn);
    vi.advanceTimersByTime(1);
    expect(document.querySelector('.atl-tooltip')).toBeInTheDocument();

    await user.unhover(btn);
    vi.advanceTimersByTime(1);
    expect(document.querySelector('.atl-tooltip')).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it('does not show tooltip when text is empty', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    await render(
      `<atl-button [atlTooltip]="text" [atlTooltipShowDelay]="0">Btn</atl-button>`,
      {
        imports: TOOLTIP_IMPORTS,
        componentProperties: { text: '' },
      },
    );

    await user.hover(screen.getByText('Btn'));
    vi.advanceTimersByTime(1);

    expect(document.querySelector('.atl-tooltip')).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
