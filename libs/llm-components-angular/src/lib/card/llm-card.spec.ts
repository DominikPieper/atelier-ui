import { render, screen } from '@testing-library/angular';
import { LlmCard, LlmCardContent, LlmCardFooter, LlmCardHeader } from './llm-card';

const imports = [LlmCard, LlmCardHeader, LlmCardContent, LlmCardFooter];

describe('LlmCard', () => {
  it('renders without error with default inputs', async () => {
    await render('<llm-card>Content</llm-card>', { imports });
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  describe('variant classes', () => {
    it.each(['elevated', 'outlined', 'flat'] as const)(
      'applies variant-%s class to host',
      async (variant) => {
        const { container } = await render(
          `<llm-card variant="${variant}">Card</llm-card>`,
          { imports }
        );
        expect(container.querySelector('llm-card')).toHaveClass(`variant-${variant}`);
      }
    );
  });

  describe('padding classes', () => {
    it.each(['none', 'sm', 'md', 'lg'] as const)(
      'applies padding-%s class to host',
      async (padding) => {
        const { container } = await render(
          `<llm-card padding="${padding}">Card</llm-card>`,
          { imports }
        );
        expect(container.querySelector('llm-card')).toHaveClass(`padding-${padding}`);
      }
    );
  });

  describe('content projection', () => {
    it('projects content via llm-card-header', async () => {
      await render(
        '<llm-card><llm-card-header>My Title</llm-card-header></llm-card>',
        { imports }
      );
      expect(screen.getByText('My Title')).toBeInTheDocument();
    });

    it('projects content via llm-card-content', async () => {
      await render(
        '<llm-card><llm-card-content>Body text</llm-card-content></llm-card>',
        { imports }
      );
      expect(screen.getByText('Body text')).toBeInTheDocument();
    });

    it('projects content via llm-card-footer', async () => {
      await render(
        '<llm-card><llm-card-footer>Footer actions</llm-card-footer></llm-card>',
        { imports }
      );
      expect(screen.getByText('Footer actions')).toBeInTheDocument();
    });

    it('renders full composition with all sub-components', async () => {
      await render(
        `<llm-card>
          <llm-card-header>Title</llm-card-header>
          <llm-card-content>Body</llm-card-content>
          <llm-card-footer>Footer</llm-card-footer>
        </llm-card>`,
        { imports }
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Body')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });
});
