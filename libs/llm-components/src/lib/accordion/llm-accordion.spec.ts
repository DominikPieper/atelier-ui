import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { LlmAccordionGroup, LlmAccordionItem, LlmAccordionHeader } from './llm-accordion';

const IMPORTS = [LlmAccordionGroup, LlmAccordionItem, LlmAccordionHeader];

const BASIC_TEMPLATE = `
  <llm-accordion-group>
    <llm-accordion-item>
      <span llmAccordionHeader>Section 1</span>
      Content 1
    </llm-accordion-item>
    <llm-accordion-item>
      <span llmAccordionHeader>Section 2</span>
      Content 2
    </llm-accordion-item>
    <llm-accordion-item>
      <span llmAccordionHeader>Section 3</span>
      Content 3
    </llm-accordion-item>
  </llm-accordion-group>
`;

const MULTI_TEMPLATE = `
  <llm-accordion-group [multi]="true">
    <llm-accordion-item>
      <span llmAccordionHeader>Section 1</span>
      Content 1
    </llm-accordion-item>
    <llm-accordion-item>
      <span llmAccordionHeader>Section 2</span>
      Content 2
    </llm-accordion-item>
  </llm-accordion-group>
`;

const WITH_DISABLED = `
  <llm-accordion-group>
    <llm-accordion-item>
      <span llmAccordionHeader>Section 1</span>
      Content 1
    </llm-accordion-item>
    <llm-accordion-item [disabled]="true">
      <span llmAccordionHeader>Section 2</span>
      Content 2
    </llm-accordion-item>
    <llm-accordion-item>
      <span llmAccordionHeader>Section 3</span>
      Content 3
    </llm-accordion-item>
  </llm-accordion-group>
`;

describe('LlmAccordionGroup', () => {
  describe('rendering & content projection', () => {
    it('renders all accordion items', async () => {
      await render(BASIC_TEMPLATE, { imports: IMPORTS });
      expect(screen.getAllByRole('button')).toHaveLength(3);
    });

    it('renders header content in trigger buttons', async () => {
      await render(BASIC_TEMPLATE, { imports: IMPORTS });
      expect(screen.getByRole('button', { name: 'Section 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Section 2' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Section 3' })).toBeInTheDocument();
    });

    it('renders body content in region panels', async () => {
      await render(BASIC_TEMPLATE, { imports: IMPORTS });
      // All panels exist in DOM (for animation), but collapsed ones have 0fr grid rows
      const regions = screen.getAllByRole('region');
      expect(regions).toHaveLength(3);
    });
  });

  describe('ARIA attributes', () => {
    it('sets aria-expanded=false on all items by default', async () => {
      await render(BASIC_TEMPLATE, { imports: IMPORTS });
      const buttons = screen.getAllByRole('button');
      buttons.forEach((btn: HTMLElement) => {
        expect(btn).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it('sets aria-expanded=true when item is expanded', async () => {
      const user = userEvent.setup();
      await render(BASIC_TEMPLATE, { imports: IMPORTS });

      await user.click(screen.getByRole('button', { name: 'Section 1' }));
      expect(screen.getByRole('button', { name: 'Section 1' })).toHaveAttribute('aria-expanded', 'true');
    });

    it('links trigger to panel via aria-controls', async () => {
      await render(BASIC_TEMPLATE, { imports: IMPORTS });
      const button = screen.getByRole('button', { name: 'Section 1' });
      const panelId = button.getAttribute('aria-controls');
      expect(panelId).toBeTruthy();
      expect(screen.getAllByRole('region')[0].id).toBe(panelId);
    });

    it('links panel to trigger via aria-labelledby', async () => {
      await render(BASIC_TEMPLATE, { imports: IMPORTS });
      const button = screen.getByRole('button', { name: 'Section 1' });
      const region = screen.getAllByRole('region')[0];
      expect(region.getAttribute('aria-labelledby')).toBe(button.id);
    });

    it('sets aria-disabled on disabled items', async () => {
      await render(WITH_DISABLED, { imports: IMPORTS });
      expect(screen.getByRole('button', { name: 'Section 2' })).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('click toggle — single mode', () => {
    it('expands an item on click', async () => {
      const user = userEvent.setup();
      await render(BASIC_TEMPLATE, { imports: IMPORTS });

      await user.click(screen.getByRole('button', { name: 'Section 1' }));
      expect(screen.getByRole('button', { name: 'Section 1' })).toHaveAttribute('aria-expanded', 'true');
    });

    it('collapses an expanded item on click', async () => {
      const user = userEvent.setup();
      await render(BASIC_TEMPLATE, { imports: IMPORTS });

      await user.click(screen.getByRole('button', { name: 'Section 1' }));
      await user.click(screen.getByRole('button', { name: 'Section 1' }));
      expect(screen.getByRole('button', { name: 'Section 1' })).toHaveAttribute('aria-expanded', 'false');
    });

    it('closes previously open item when opening another in single mode', async () => {
      const user = userEvent.setup();
      await render(BASIC_TEMPLATE, { imports: IMPORTS });

      await user.click(screen.getByRole('button', { name: 'Section 1' }));
      expect(screen.getByRole('button', { name: 'Section 1' })).toHaveAttribute('aria-expanded', 'true');

      await user.click(screen.getByRole('button', { name: 'Section 2' }));
      expect(screen.getByRole('button', { name: 'Section 1' })).toHaveAttribute('aria-expanded', 'false');
      expect(screen.getByRole('button', { name: 'Section 2' })).toHaveAttribute('aria-expanded', 'true');
    });

    it('does not toggle disabled items on click', async () => {
      const user = userEvent.setup();
      await render(WITH_DISABLED, { imports: IMPORTS });

      await user.click(screen.getByRole('button', { name: 'Section 2' }));
      expect(screen.getByRole('button', { name: 'Section 2' })).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('click toggle — multi mode', () => {
    it('allows multiple items to be expanded', async () => {
      const user = userEvent.setup();
      await render(MULTI_TEMPLATE, { imports: IMPORTS });

      await user.click(screen.getByRole('button', { name: 'Section 1' }));
      await user.click(screen.getByRole('button', { name: 'Section 2' }));

      expect(screen.getByRole('button', { name: 'Section 1' })).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('button', { name: 'Section 2' })).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('keyboard navigation', () => {
    it('ArrowDown moves focus to next item', async () => {
      const user = userEvent.setup();
      await render(BASIC_TEMPLATE, { imports: IMPORTS });

      screen.getByRole('button', { name: 'Section 1' }).focus();
      await user.keyboard('{ArrowDown}');

      expect(screen.getByRole('button', { name: 'Section 2' })).toHaveFocus();
    });

    it('ArrowUp moves focus to previous item', async () => {
      const user = userEvent.setup();
      await render(BASIC_TEMPLATE, { imports: IMPORTS });

      screen.getByRole('button', { name: 'Section 2' }).focus();
      await user.keyboard('{ArrowUp}');

      expect(screen.getByRole('button', { name: 'Section 1' })).toHaveFocus();
    });

    it('ArrowDown wraps from last to first', async () => {
      const user = userEvent.setup();
      await render(BASIC_TEMPLATE, { imports: IMPORTS });

      screen.getByRole('button', { name: 'Section 3' }).focus();
      await user.keyboard('{ArrowDown}');

      expect(screen.getByRole('button', { name: 'Section 1' })).toHaveFocus();
    });

    it('ArrowUp wraps from first to last', async () => {
      const user = userEvent.setup();
      await render(BASIC_TEMPLATE, { imports: IMPORTS });

      screen.getByRole('button', { name: 'Section 1' }).focus();
      await user.keyboard('{ArrowUp}');

      expect(screen.getByRole('button', { name: 'Section 3' })).toHaveFocus();
    });

    it('Home moves focus to first enabled item', async () => {
      const user = userEvent.setup();
      await render(BASIC_TEMPLATE, { imports: IMPORTS });

      screen.getByRole('button', { name: 'Section 3' }).focus();
      await user.keyboard('{Home}');

      expect(screen.getByRole('button', { name: 'Section 1' })).toHaveFocus();
    });

    it('End moves focus to last enabled item', async () => {
      const user = userEvent.setup();
      await render(BASIC_TEMPLATE, { imports: IMPORTS });

      screen.getByRole('button', { name: 'Section 1' }).focus();
      await user.keyboard('{End}');

      expect(screen.getByRole('button', { name: 'Section 3' })).toHaveFocus();
    });

    it('arrow keys skip disabled items', async () => {
      const user = userEvent.setup();
      await render(WITH_DISABLED, { imports: IMPORTS });

      screen.getByRole('button', { name: 'Section 1' }).focus();
      await user.keyboard('{ArrowDown}');

      // Should skip Section 2 (disabled) and go to Section 3
      expect(screen.getByRole('button', { name: 'Section 3' })).toHaveFocus();
    });
  });

  describe('two-way expanded binding', () => {
    it('reflects expanded state via two-way binding', async () => {
      const user = userEvent.setup();
      await render(
        `<llm-accordion-group>
          <llm-accordion-item [(expanded)]="open">
            <span llmAccordionHeader>Toggle</span>
            Body
          </llm-accordion-item>
        </llm-accordion-group>`,
        {
          imports: IMPORTS,
          componentProperties: { open: false },
        },
      );

      await user.click(screen.getByRole('button', { name: 'Toggle' }));
      expect(screen.getByRole('button', { name: 'Toggle' })).toHaveAttribute('aria-expanded', 'true');
    });

    it('pre-expands item when expanded is initially true', async () => {
      await render(
        `<llm-accordion-group>
          <llm-accordion-item [expanded]="true">
            <span llmAccordionHeader>Pre-expanded</span>
            Body
          </llm-accordion-item>
        </llm-accordion-group>`,
        { imports: IMPORTS },
      );

      expect(screen.getByRole('button', { name: 'Pre-expanded' })).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('variant classes', () => {
    it('applies variant-default class by default', async () => {
      const { container } = await render(BASIC_TEMPLATE, { imports: IMPORTS });
      expect(container.querySelector('llm-accordion-group')).toHaveClass('variant-default');
    });

    it('applies variant-bordered class', async () => {
      const { container } = await render(
        `<llm-accordion-group variant="bordered">
          <llm-accordion-item>
            <span llmAccordionHeader>Item</span>Body
          </llm-accordion-item>
        </llm-accordion-group>`,
        { imports: IMPORTS },
      );
      expect(container.querySelector('llm-accordion-group')).toHaveClass('variant-bordered');
    });

    it('applies variant-separated class', async () => {
      const { container } = await render(
        `<llm-accordion-group variant="separated">
          <llm-accordion-item>
            <span llmAccordionHeader>Item</span>Body
          </llm-accordion-item>
        </llm-accordion-group>`,
        { imports: IMPORTS },
      );
      expect(container.querySelector('llm-accordion-group')).toHaveClass('variant-separated');
    });
  });
});
