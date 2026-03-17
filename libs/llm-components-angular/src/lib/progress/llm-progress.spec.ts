import { render } from '@testing-library/angular';
import { LlmProgress } from './llm-progress';

describe('LlmProgress', () => {
  it('has role="progressbar"', async () => {
    const { container } = await render('<llm-progress />', { imports: [LlmProgress] });
    expect(container.querySelector('llm-progress')).toHaveAttribute('role', 'progressbar');
  });

  it('sets aria-valuemin to 0', async () => {
    const { container } = await render('<llm-progress />', { imports: [LlmProgress] });
    expect(container.querySelector('llm-progress')).toHaveAttribute('aria-valuemin', '0');
  });

  it('sets aria-valuenow to the current value', async () => {
    const { container } = await render('<llm-progress [value]="60" />', {
      imports: [LlmProgress],
    });
    expect(container.querySelector('llm-progress')).toHaveAttribute('aria-valuenow', '60');
  });

  it('sets aria-valuemax to the max', async () => {
    const { container } = await render('<llm-progress [max]="200" [value]="100" />', {
      imports: [LlmProgress],
    });
    expect(container.querySelector('llm-progress')).toHaveAttribute('aria-valuemax', '200');
  });

  it('clamps negative values to 0', async () => {
    const { container } = await render('<llm-progress [value]="-10" />', {
      imports: [LlmProgress],
    });
    expect(container.querySelector('llm-progress')).toHaveAttribute('aria-valuenow', '0');
  });

  it('clamps values exceeding max to max', async () => {
    const { container } = await render('<llm-progress [value]="150" />', {
      imports: [LlmProgress],
    });
    expect(container.querySelector('llm-progress')).toHaveAttribute('aria-valuenow', '100');
  });

  it('sets fill width to correct percentage', async () => {
    const { container } = await render('<llm-progress [value]="50" />', {
      imports: [LlmProgress],
    });
    const fill = container.querySelector('.fill') as HTMLElement;
    expect(fill.style.width).toBe('50%');
  });

  it('sets fill width to 0% at value=0', async () => {
    const { container } = await render('<llm-progress [value]="0" />', {
      imports: [LlmProgress],
    });
    const fill = container.querySelector('.fill') as HTMLElement;
    expect(fill.style.width).toBe('0%');
  });

  it('sets fill width to 100% at max value', async () => {
    const { container } = await render('<llm-progress [value]="100" />', {
      imports: [LlmProgress],
    });
    const fill = container.querySelector('.fill') as HTMLElement;
    expect(fill.style.width).toBe('100%');
  });

  describe('variant classes', () => {
    for (const variant of ['default', 'success', 'warning', 'danger'] as const) {
      it(`applies variant-${variant} class`, async () => {
        const { container } = await render(`<llm-progress variant="${variant}" />`, {
          imports: [LlmProgress],
        });
        expect(container.querySelector('llm-progress')).toHaveClass(`variant-${variant}`);
      });
    }
  });

  describe('size classes', () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      it(`applies size-${size} class`, async () => {
        const { container } = await render(`<llm-progress size="${size}" />`, {
          imports: [LlmProgress],
        });
        expect(container.querySelector('llm-progress')).toHaveClass(`size-${size}`);
      });
    }
  });

  describe('indeterminate', () => {
    it('adds is-indeterminate class', async () => {
      const { container } = await render('<llm-progress [indeterminate]="true" />', {
        imports: [LlmProgress],
      });
      expect(container.querySelector('llm-progress')).toHaveClass('is-indeterminate');
    });

    it('does not set aria-valuenow when indeterminate', async () => {
      const { container } = await render('<llm-progress [indeterminate]="true" />', {
        imports: [LlmProgress],
      });
      expect(container.querySelector('llm-progress')).not.toHaveAttribute('aria-valuenow');
    });

    it('does not set aria-valuemax when indeterminate', async () => {
      const { container } = await render('<llm-progress [indeterminate]="true" />', {
        imports: [LlmProgress],
      });
      expect(container.querySelector('llm-progress')).not.toHaveAttribute('aria-valuemax');
    });

    it('does not add is-indeterminate class by default', async () => {
      const { container } = await render('<llm-progress />', { imports: [LlmProgress] });
      expect(container.querySelector('llm-progress')).not.toHaveClass('is-indeterminate');
    });
  });
});
