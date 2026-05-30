import { render, screen } from '@testing-library/vue';
import LlmProgress from './llm-progress.vue';
import { covers } from '../../testing/behavior';

describe('LlmProgress', () => {
  it('renders with default props', () => {
    render(LlmProgress);
    const bar = screen.getByRole('progressbar');
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveClass('llm-progress', 'variant-default', 'size-md');
  });

  covers('progress', 'aria-value')('sets aria attributes from value and max', () => {
    render(LlmProgress, { props: { value: 40, max: 100 } });
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  covers('progress', 'clamp')('clamps value between 0 and max', () => {
    render(LlmProgress, { props: { value: 150, max: 100 } });
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  covers('progress', 'indeterminate-omits-valuenow')('omits aria-valuenow and aria-valuemax when indeterminate', () => {
    render(LlmProgress, { props: { indeterminate: true } });
    const bar = screen.getByRole('progressbar');
    expect(bar).not.toHaveAttribute('aria-valuenow');
    expect(bar).not.toHaveAttribute('aria-valuemax');
    expect(bar).toHaveClass('is-indeterminate');
  });

  it('applies variant and size classes', () => {
    render(LlmProgress, { props: { variant: 'success', size: 'lg' } });
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveClass('variant-success', 'size-lg');
  });
});
