import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AtlTooltip } from './atl-tooltip';
import { covers } from '../../testing/behavior';

describe('AtlTooltip', () => {
  covers('tooltip', 'hidden-initially')('does not show tooltip initially', () => {
    render(
      <AtlTooltip atlTooltip="Save your changes" atlTooltipShowDelay={0}>
        <button>Save</button>
      </AtlTooltip>
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  covers('tooltip', 'show-on-hover')('shows tooltip on hover after delay', async () => {
    const user = userEvent.setup();
    render(
      <AtlTooltip atlTooltip="Save your changes" atlTooltipShowDelay={0}>
        <button>Save</button>
      </AtlTooltip>
    );
    await user.hover(screen.getByText('Save'));
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByRole('tooltip')).toHaveTextContent('Save your changes');
  });

  covers('tooltip', 'hide-on-leave')('hides tooltip on mouse leave', async () => {
    const user = userEvent.setup();
    render(
      <AtlTooltip atlTooltip="Save your changes" atlTooltipShowDelay={0} atlTooltipHideDelay={0}>
        <button>Save</button>
      </AtlTooltip>
    );
    await user.hover(screen.getByText('Save'));
    await act(async () => { await new Promise(r => setTimeout(r, 10)); });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    await user.unhover(screen.getByText('Save'));
    await act(async () => { await new Promise(r => setTimeout(r, 10)); });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  covers('tooltip', 'disabled-no-show')('does not show tooltip when disabled', async () => {
    const user = userEvent.setup();
    render(
      <AtlTooltip atlTooltip="Save your changes" atlTooltipDisabled atlTooltipShowDelay={0}>
        <button>Save</button>
      </AtlTooltip>
    );
    await user.hover(screen.getByText('Save'));
    await act(async () => { await new Promise(r => setTimeout(r, 10)); });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('applies position class based on position prop', async () => {
    const user = userEvent.setup();
    render(
      <AtlTooltip atlTooltip="Help text" atlTooltipPosition="right" atlTooltipShowDelay={0}>
        <button>Info</button>
      </AtlTooltip>
    );
    await user.hover(screen.getByText('Info'));
    await act(async () => { await new Promise(r => setTimeout(r, 10)); });
    expect(screen.getByRole('tooltip')).toHaveClass('position-right');
  });

  it('has role="tooltip" on the tooltip element', async () => {
    const user = userEvent.setup();
    render(
      <AtlTooltip atlTooltip="Tooltip text" atlTooltipShowDelay={0}>
        <button>Hover me</button>
      </AtlTooltip>
    );
    await user.hover(screen.getByText('Hover me'));
    await act(async () => { await new Promise(r => setTimeout(r, 10)); });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });
});
