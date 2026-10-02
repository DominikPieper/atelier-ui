import { render, screen } from '@testing-library/angular';
import {
  AtlCard,
  AtlCardContent,
  AtlCardFooter,
  AtlCardHeader,
} from './atl-card';
import { covers } from '../../testing/behavior';

const imports = [AtlCard, AtlCardHeader, AtlCardContent, AtlCardFooter];

describe('AtlCard', () => {
  it('keeps the static atl-card class alongside the bound variant and padding', async () => {
    // The shared stylesheet (libs/styles) is scoped by `.atl-card`, and the host also
    // binds `[class]`; the two must merge, across input changes too.
    const { container, rerender } = await render(
      '<atl-card [padding]="padding"><atl-card-header>H</atl-card-header></atl-card>',
      { imports, componentProperties: { padding: 'md' } },
    );
    const host = container.querySelector('atl-card') as HTMLElement;
    expect(host).toHaveClass('atl-card', 'variant-elevated', 'padding-md');

    await rerender({ componentProperties: { padding: 'sm' } });
    expect(host).toHaveClass('atl-card', 'padding-sm');
    expect(host).not.toHaveClass('padding-md');
  });

  covers('card', 'renders-content')(
    'renders without error with default inputs',
    async () => {
      await render('<atl-card>Content</atl-card>', { imports });
      expect(screen.getByText('Content')).toBeInTheDocument();
    },
  );

  describe('variant classes', () => {
    it.each(['elevated', 'outlined', 'flat'] as const)(
      'applies variant-%s class to host',
      async (variant) => {
        const { container } = await render(
          `<atl-card variant="${variant}">Card</atl-card>`,
          { imports },
        );
        expect(container.querySelector('atl-card')).toHaveClass(
          `variant-${variant}`,
        );
      },
    );
  });

  describe('padding classes', () => {
    it.each(['none', 'sm', 'md', 'lg'] as const)(
      'applies padding-%s class to host',
      async (padding) => {
        const { container } = await render(
          `<atl-card padding="${padding}">Card</atl-card>`,
          { imports },
        );
        expect(container.querySelector('atl-card')).toHaveClass(
          `padding-${padding}`,
        );
      },
    );
  });

  describe('content projection', () => {
    covers('card', 'header-subcomponent')(
      'projects content via atl-card-header',
      async () => {
        await render(
          '<atl-card><atl-card-header>My Title</atl-card-header></atl-card>',
          { imports },
        );
        expect(screen.getByText('My Title')).toBeInTheDocument();
      },
    );

    covers('card', 'content-subcomponent')(
      'projects content via atl-card-content',
      async () => {
        await render(
          '<atl-card><atl-card-content>Body text</atl-card-content></atl-card>',
          { imports },
        );
        expect(screen.getByText('Body text')).toBeInTheDocument();
      },
    );

    covers('card', 'footer-subcomponent')(
      'projects content via atl-card-footer',
      async () => {
        await render(
          '<atl-card><atl-card-footer>Footer actions</atl-card-footer></atl-card>',
          { imports },
        );
        expect(screen.getByText('Footer actions')).toBeInTheDocument();
      },
    );

    it('renders full composition with all sub-components', async () => {
      await render(
        `<atl-card>
          <atl-card-header>Title</atl-card-header>
          <atl-card-content>Body</atl-card-content>
          <atl-card-footer>Footer</atl-card-footer>
        </atl-card>`,
        { imports },
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Body')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });
});
