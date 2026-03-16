import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { LlmTooltip } from './llm-tooltip';
import { LlmButton } from '../button/llm-button';
import { OverlayModule } from '@angular/cdk/overlay';

const TOOLTIP_IMPORTS = [LlmTooltip, LlmButton, OverlayModule];

describe('LlmTooltip', () => {
  afterEach(() => {
    // Clean up any overlay containers left by CDK
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  it('renders the host element', async () => {
    await render(
      '<llm-button llmTooltip="Save changes">Save</llm-button>',
      { imports: TOOLTIP_IMPORTS },
    );
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('does not show tooltip initially', async () => {
    await render(
      '<llm-button llmTooltip="Save changes">Save</llm-button>',
      { imports: TOOLTIP_IMPORTS },
    );
    expect(document.querySelector('.llm-tooltip')).not.toBeInTheDocument();
  });

  it('does not have aria-describedby initially', async () => {
    const { container } = await render(
      '<llm-button llmTooltip="Save changes">Save</llm-button>',
      { imports: TOOLTIP_IMPORTS },
    );
    expect(container.querySelector('[aria-describedby]')).toBeNull();
  });

  it('shows tooltip on mouseenter after delay', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    await render(
      '<llm-button llmTooltip="Save changes" [llmTooltipShowDelay]="0">Save</llm-button>',
      { imports: TOOLTIP_IMPORTS },
    );

    await user.hover(screen.getByText('Save'));
    vi.advanceTimersByTime(1);

    const tooltip = document.querySelector('.llm-tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip?.textContent).toBe('Save changes');

    vi.useRealTimers();
  });

  it('sets role="tooltip" on the tooltip content', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    await render(
      '<llm-button llmTooltip="Help text" [llmTooltipShowDelay]="0">Help</llm-button>',
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
      '<llm-button llmTooltip="Info" [llmTooltipShowDelay]="0">Btn</llm-button>',
      { imports: TOOLTIP_IMPORTS },
    );

    const button = screen.getByText('Btn');
    await user.hover(button);
    vi.advanceTimersByTime(1);

    const tooltip = document.querySelector('.llm-tooltip');
    const tooltipId = tooltip?.getAttribute('id');
    expect(tooltipId).toBeTruthy();

    const hostWithDescribedBy = button.closest('[aria-describedby]');
    expect(hostWithDescribedBy?.getAttribute('aria-describedby')).toBe(tooltipId);

    vi.useRealTimers();
  });

  it('does not show tooltip when disabled', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    await render(
      '<llm-button llmTooltip="Hidden" [llmTooltipDisabled]="true" [llmTooltipShowDelay]="0">Btn</llm-button>',
      { imports: TOOLTIP_IMPORTS },
    );

    await user.hover(screen.getByText('Btn'));
    vi.advanceTimersByTime(1);

    expect(document.querySelector('.llm-tooltip')).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it('hides tooltip on mouseleave', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    await render(
      '<llm-button llmTooltip="Temp" [llmTooltipShowDelay]="0" [llmTooltipHideDelay]="0">Btn</llm-button>',
      { imports: TOOLTIP_IMPORTS },
    );

    const btn = screen.getByText('Btn');
    await user.hover(btn);
    vi.advanceTimersByTime(1);
    expect(document.querySelector('.llm-tooltip')).toBeInTheDocument();

    await user.unhover(btn);
    vi.advanceTimersByTime(1);
    expect(document.querySelector('.llm-tooltip')).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it('does not show tooltip when text is empty', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    await render(
      `<llm-button [llmTooltip]="text" [llmTooltipShowDelay]="0">Btn</llm-button>`,
      {
        imports: TOOLTIP_IMPORTS,
        componentProperties: { text: '' },
      },
    );

    await user.hover(screen.getByText('Btn'));
    vi.advanceTimersByTime(1);

    expect(document.querySelector('.llm-tooltip')).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
