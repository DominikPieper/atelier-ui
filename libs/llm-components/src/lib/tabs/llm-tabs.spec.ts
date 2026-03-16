import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { LlmTabGroup, LlmTab } from './llm-tabs';

const IMPORTS = [LlmTabGroup, LlmTab];

const BASIC_TEMPLATE = `
  <llm-tab-group>
    <llm-tab label="First">First content</llm-tab>
    <llm-tab label="Second">Second content</llm-tab>
    <llm-tab label="Third">Third content</llm-tab>
  </llm-tab-group>
`;

const WITH_DISABLED = `
  <llm-tab-group>
    <llm-tab label="First">First content</llm-tab>
    <llm-tab label="Second" [disabled]="true">Second content</llm-tab>
    <llm-tab label="Third">Third content</llm-tab>
  </llm-tab-group>
`;

describe('LlmTabGroup', () => {
  describe('rendering', () => {
    it('renders a tablist', async () => {
      await render(BASIC_TEMPLATE, { imports: IMPORTS });
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('renders tab buttons matching child count', async () => {
      await render(BASIC_TEMPLATE, { imports: IMPORTS });
      expect(screen.getAllByRole('tab')).toHaveLength(3);
    });

    it('renders tab buttons with correct labels', async () => {
      await render(BASIC_TEMPLATE, { imports: IMPORTS });
      expect(screen.getByRole('tab', { name: 'First' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Second' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Third' })).toBeInTheDocument();
    });

    it('shows first tab panel by default', async () => {
      await render(BASIC_TEMPLATE, { imports: IMPORTS });
      expect(screen.getByRole('tabpanel')).toHaveTextContent('First content');
    });

    it('does not render inactive tab panels', async () => {
      await render(BASIC_TEMPLATE, { imports: IMPORTS });
      expect(screen.queryByText('Second content')).not.toBeInTheDocument();
      expect(screen.queryByText('Third content')).not.toBeInTheDocument();
    });
  });

  describe('ARIA attributes', () => {
    it('sets aria-selected on active tab', async () => {
      await render(BASIC_TEMPLATE, { imports: IMPORTS });
      const tabs = screen.getAllByRole('tab');
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
      expect(tabs[2]).toHaveAttribute('aria-selected', 'false');
    });

    it('links tab to panel via aria-controls', async () => {
      await render(BASIC_TEMPLATE, { imports: IMPORTS });
      const tab = screen.getAllByRole('tab')[0];
      const panelId = tab.getAttribute('aria-controls');
      expect(panelId).toBeTruthy();
      expect(screen.getByRole('tabpanel').id).toBe(panelId);
    });

    it('links panel to tab via aria-labelledby', async () => {
      await render(BASIC_TEMPLATE, { imports: IMPORTS });
      const tab = screen.getAllByRole('tab')[0];
      const panel = screen.getByRole('tabpanel');
      expect(panel.getAttribute('aria-labelledby')).toBe(tab.id);
    });

    it('sets aria-disabled on disabled tabs', async () => {
      await render(WITH_DISABLED, { imports: IMPORTS });
      const tabs = screen.getAllByRole('tab');
      expect(tabs[1]).toHaveAttribute('aria-disabled', 'true');
    });

    it('uses roving tabindex — active tab is 0, others are -1', async () => {
      await render(BASIC_TEMPLATE, { imports: IMPORTS });
      const tabs = screen.getAllByRole('tab');
      expect(tabs[0]).toHaveAttribute('tabindex', '0');
      expect(tabs[1]).toHaveAttribute('tabindex', '-1');
      expect(tabs[2]).toHaveAttribute('tabindex', '-1');
    });

    it('gives active panel tabindex 0', async () => {
      await render(BASIC_TEMPLATE, { imports: IMPORTS });
      expect(screen.getByRole('tabpanel')).toHaveAttribute('tabindex', '0');
    });
  });

  describe('click interaction', () => {
    it('clicking a tab selects it and shows its panel', async () => {
      const user = userEvent.setup();
      await render(BASIC_TEMPLATE, { imports: IMPORTS });

      await user.click(screen.getByRole('tab', { name: 'Second' }));

      expect(screen.getByRole('tabpanel')).toHaveTextContent('Second content');
      expect(screen.getByRole('tab', { name: 'Second' })).toHaveAttribute('aria-selected', 'true');
    });

    it('clicking a disabled tab does nothing', async () => {
      const user = userEvent.setup();
      await render(WITH_DISABLED, { imports: IMPORTS });

      await user.click(screen.getByRole('tab', { name: 'Second' }));

      expect(screen.getByRole('tabpanel')).toHaveTextContent('First content');
    });
  });

  describe('keyboard navigation', () => {
    it('ArrowRight moves to next tab', async () => {
      const user = userEvent.setup();
      await render(BASIC_TEMPLATE, { imports: IMPORTS });

      screen.getByRole('tab', { name: 'First' }).focus();
      await user.keyboard('{ArrowRight}');

      expect(screen.getByRole('tab', { name: 'Second' })).toHaveFocus();
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Second content');
    });

    it('ArrowLeft moves to previous tab', async () => {
      const user = userEvent.setup();
      await render(BASIC_TEMPLATE, { imports: IMPORTS });

      // First select second tab
      await user.click(screen.getByRole('tab', { name: 'Second' }));
      screen.getByRole('tab', { name: 'Second' }).focus();
      await user.keyboard('{ArrowLeft}');

      expect(screen.getByRole('tab', { name: 'First' })).toHaveFocus();
      expect(screen.getByRole('tabpanel')).toHaveTextContent('First content');
    });

    it('ArrowRight wraps from last to first', async () => {
      const user = userEvent.setup();
      await render(BASIC_TEMPLATE, { imports: IMPORTS });

      await user.click(screen.getByRole('tab', { name: 'Third' }));
      screen.getByRole('tab', { name: 'Third' }).focus();
      await user.keyboard('{ArrowRight}');

      expect(screen.getByRole('tab', { name: 'First' })).toHaveFocus();
    });

    it('ArrowLeft wraps from first to last', async () => {
      const user = userEvent.setup();
      await render(BASIC_TEMPLATE, { imports: IMPORTS });

      screen.getByRole('tab', { name: 'First' }).focus();
      await user.keyboard('{ArrowLeft}');

      expect(screen.getByRole('tab', { name: 'Third' })).toHaveFocus();
    });

    it('Home selects first enabled tab', async () => {
      const user = userEvent.setup();
      await render(BASIC_TEMPLATE, { imports: IMPORTS });

      await user.click(screen.getByRole('tab', { name: 'Third' }));
      screen.getByRole('tab', { name: 'Third' }).focus();
      await user.keyboard('{Home}');

      expect(screen.getByRole('tab', { name: 'First' })).toHaveFocus();
      expect(screen.getByRole('tabpanel')).toHaveTextContent('First content');
    });

    it('End selects last enabled tab', async () => {
      const user = userEvent.setup();
      await render(BASIC_TEMPLATE, { imports: IMPORTS });

      screen.getByRole('tab', { name: 'First' }).focus();
      await user.keyboard('{End}');

      expect(screen.getByRole('tab', { name: 'Third' })).toHaveFocus();
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Third content');
    });

    it('arrow keys skip disabled tabs', async () => {
      const user = userEvent.setup();
      await render(WITH_DISABLED, { imports: IMPORTS });

      screen.getByRole('tab', { name: 'First' }).focus();
      await user.keyboard('{ArrowRight}');

      // Should skip Second (disabled) and go to Third
      expect(screen.getByRole('tab', { name: 'Third' })).toHaveFocus();
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Third content');
    });
  });

  describe('two-way binding', () => {
    it('selectedIndex updates panel display', async () => {
      const user = userEvent.setup();
      await render(
        `<llm-tab-group [(selectedIndex)]="index">
          <llm-tab label="A">Panel A</llm-tab>
          <llm-tab label="B">Panel B</llm-tab>
        </llm-tab-group>`,
        {
          imports: IMPORTS,
          componentProperties: { index: 0 },
        },
      );

      await user.click(screen.getByRole('tab', { name: 'B' }));
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel B');
    });
  });

  describe('variants', () => {
    it('applies variant-default class by default', async () => {
      const { container } = await render(BASIC_TEMPLATE, { imports: IMPORTS });
      expect(container.querySelector('llm-tab-group')).toHaveClass('variant-default');
    });

    it('applies variant-pills class', async () => {
      const { container } = await render(
        `<llm-tab-group variant="pills">
          <llm-tab label="A">A</llm-tab>
          <llm-tab label="B">B</llm-tab>
        </llm-tab-group>`,
        { imports: IMPORTS },
      );
      expect(container.querySelector('llm-tab-group')).toHaveClass('variant-pills');
    });
  });
});
