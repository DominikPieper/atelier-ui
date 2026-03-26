import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { LlmStepper, LlmStep } from './llm-stepper';

const IMPORTS = [LlmStepper, LlmStep];

const BASIC_TEMPLATE = `
  <llm-stepper>
    <llm-step label="Account">Account content</llm-step>
    <llm-step label="Profile">Profile content</llm-step>
    <llm-step label="Review">Review content</llm-step>
  </llm-stepper>
`;

describe('LlmStepper', () => {
  describe('rendering', () => {
    it('renders a tablist', async () => {
      await render(BASIC_TEMPLATE, { imports: IMPORTS });
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('renders step buttons matching child count', async () => {
      await render(BASIC_TEMPLATE, { imports: IMPORTS });
      expect(screen.getAllByRole('tab')).toHaveLength(3);
    });

    it('renders step buttons with correct labels', async () => {
      await render(BASIC_TEMPLATE, { imports: IMPORTS });
      expect(screen.getByRole('tab', { name: /Account/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Profile/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Review/i })).toBeInTheDocument();
    });

    it('shows first step panel by default', async () => {
      await render(BASIC_TEMPLATE, { imports: IMPORTS });
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Account content');
    });

    it('does not render inactive step panels', async () => {
      await render(BASIC_TEMPLATE, { imports: IMPORTS });
      expect(screen.queryByText('Profile content')).not.toBeInTheDocument();
      expect(screen.queryByText('Review content')).not.toBeInTheDocument();
    });

    it('renders step numbers', async () => {
      await render(BASIC_TEMPLATE, { imports: IMPORTS });
      const tabs = screen.getAllByRole('tab');
      expect(tabs[0].textContent.trim()).toBe('1');
      expect(tabs[1].textContent.trim()).toBe('2');
      expect(tabs[2].textContent.trim()).toBe('3');
    });
  });

  describe('ARIA attributes', () => {
    it('sets aria-selected on active step', async () => {
      await render(BASIC_TEMPLATE, { imports: IMPORTS });
      const tabs = screen.getAllByRole('tab');
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
      expect(tabs[2]).toHaveAttribute('aria-selected', 'false');
    });

    it('links step to panel via aria-controls', async () => {
      await render(BASIC_TEMPLATE, { imports: IMPORTS });
      const tab = screen.getAllByRole('tab')[0];
      const panelId = tab.getAttribute('aria-controls');
      expect(panelId).toBeTruthy();
      expect(screen.getByRole('tabpanel').id).toBe(panelId);
    });

    it('gives active panel tabindex 0', async () => {
      await render(BASIC_TEMPLATE, { imports: IMPORTS });
      expect(screen.getByRole('tabpanel')).toHaveAttribute('tabindex', '0');
    });
  });

  describe('click navigation', () => {
    it('clicking a step navigates to it', async () => {
      const user = userEvent.setup();
      await render(BASIC_TEMPLATE, { imports: IMPORTS });

      await user.click(screen.getByRole('tab', { name: /Profile/i }));

      expect(screen.getByRole('tabpanel')).toHaveTextContent('Profile content');
      expect(screen.getByRole('tab', { name: /Profile/i })).toHaveAttribute('aria-selected', 'true');
    });

    it('clicking a disabled step does nothing', async () => {
      const user = userEvent.setup();
      await render(
        `<llm-stepper>
          <llm-step label="Account">Account content</llm-step>
          <llm-step label="Profile" [disabled]="true">Profile content</llm-step>
          <llm-step label="Review">Review content</llm-step>
        </llm-stepper>`,
        { imports: IMPORTS }
      );

      await user.click(screen.getByRole('tab', { name: /Profile/i }));
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Account content');
    });
  });

  describe('two-way binding', () => {
    it('activeStep updates panel display', async () => {
      await render(
        `<llm-stepper [(activeStep)]="step">
          <llm-step label="A">Panel A</llm-step>
          <llm-step label="B">Panel B</llm-step>
        </llm-stepper>`,
        {
          imports: IMPORTS,
          componentProperties: { step: 1 },
        }
      );
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel B');
    });
  });

  describe('completed and error states', () => {
    it('applies is-completed class to completed steps', async () => {
      const { container } = await render(
        `<llm-stepper [activeStep]="activeStep">
          <llm-step label="Done" [completed]="completed">Done content</llm-step>
          <llm-step label="Current">Current content</llm-step>
        </llm-stepper>`,
        { imports: IMPORTS, componentProperties: { activeStep: 1, completed: true } }
      );
      const stepItems = container.querySelectorAll('.step-item');
      expect(stepItems[0]).toHaveClass('is-completed');
    });

    it('applies is-error class to error steps', async () => {
      const { container } = await render(
        `<llm-stepper [activeStep]="1">
          <llm-step label="Failed" [error]="true">Error content</llm-step>
          <llm-step label="Current">Current content</llm-step>
        </llm-stepper>`,
        { imports: IMPORTS }
      );
      const stepItems = container.querySelectorAll('.step-item');
      expect(stepItems[0]).toHaveClass('is-error');
    });
  });

  describe('orientation', () => {
    it('applies orientation-horizontal class by default', async () => {
      const { container } = await render(BASIC_TEMPLATE, { imports: IMPORTS });
      expect(container.querySelector('llm-stepper')).toHaveClass('orientation-horizontal');
    });

    it('applies orientation-vertical class', async () => {
      const { container } = await render(
        `<llm-stepper orientation="vertical">
          <llm-step label="A">A</llm-step>
          <llm-step label="B">B</llm-step>
        </llm-stepper>`,
        { imports: IMPORTS }
      );
      expect(container.querySelector('llm-stepper')).toHaveClass('orientation-vertical');
    });
  });

  describe('optional label', () => {
    it('shows Optional text for optional steps that are not completed', async () => {
      await render(
        `<llm-stepper>
          <llm-step label="Account" [optional]="true">Account</llm-step>
        </llm-stepper>`,
        { imports: IMPORTS }
      );
      expect(screen.getByText('Optional')).toBeInTheDocument();
    });
  });
});
