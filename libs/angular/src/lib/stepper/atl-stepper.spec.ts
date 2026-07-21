import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { AtlStepper, AtlStep } from './atl-stepper';
import { covers } from '../../testing/behavior';

const IMPORTS = [AtlStepper, AtlStep];

const BASIC_TEMPLATE = `
  <atl-stepper>
    <atl-step label="Account">Account content</atl-step>
    <atl-step label="Profile">Profile content</atl-step>
    <atl-step label="Review">Review content</atl-step>
  </atl-stepper>
`;

describe('AtlStepper', () => {
  describe('rendering', () => {
    covers('stepper', 'renders-tablist')('renders a tablist', async () => {
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

    covers('stepper', 'first-panel-default')('shows first step panel by default', async () => {
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
    covers('stepper', 'aria-selected-active')('sets aria-selected on active step', async () => {
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
    covers('stepper', 'click-navigates')('clicking a step navigates to it', async () => {
      const user = userEvent.setup();
      await render(BASIC_TEMPLATE, { imports: IMPORTS });

      await user.click(screen.getByRole('tab', { name: /Profile/i }));

      expect(screen.getByRole('tabpanel')).toHaveTextContent('Profile content');
      expect(screen.getByRole('tab', { name: /Profile/i })).toHaveAttribute('aria-selected', 'true');
    });

    covers('stepper', 'disabled-step-noop')('clicking a disabled step does nothing', async () => {
      const user = userEvent.setup();
      await render(
        `<atl-stepper>
          <atl-step label="Account">Account content</atl-step>
          <atl-step label="Profile" [disabled]="true">Profile content</atl-step>
          <atl-step label="Review">Review content</atl-step>
        </atl-stepper>`,
        { imports: IMPORTS }
      );

      await user.click(screen.getByRole('tab', { name: /Profile/i }));
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Account content');
    });
  });

  describe('two-way binding', () => {
    it('activeStep updates panel display', async () => {
      await render(
        `<atl-stepper [(activeStep)]="step">
          <atl-step label="A">Panel A</atl-step>
          <atl-step label="B">Panel B</atl-step>
        </atl-stepper>`,
        {
          imports: IMPORTS,
          componentProperties: { step: 1 },
        }
      );
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel B');
    });
  });

  describe('completed and error states', () => {
    covers('stepper', 'completed-class')('applies is-completed class to completed steps', async () => {
      const { container } = await render(
        `<atl-stepper [activeStep]="activeStep">
          <atl-step label="Done" [completed]="completed">Done content</atl-step>
          <atl-step label="Current">Current content</atl-step>
        </atl-stepper>`,
        { imports: IMPORTS, componentProperties: { activeStep: 1, completed: true } }
      );
      const stepItems = container.querySelectorAll('.step-item');
      expect(stepItems[0]).toHaveClass('is-completed');
    });

    covers('stepper', 'error-class')('applies is-error class to error steps', async () => {
      const { container } = await render(
        `<atl-stepper [activeStep]="1">
          <atl-step label="Failed" [error]="true">Error content</atl-step>
          <atl-step label="Current">Current content</atl-step>
        </atl-stepper>`,
        { imports: IMPORTS }
      );
      const stepItems = container.querySelectorAll('.step-item');
      expect(stepItems[0]).toHaveClass('is-error');
    });
  });

  describe('orientation', () => {
    it('applies orientation-horizontal class by default', async () => {
      const { container } = await render(BASIC_TEMPLATE, { imports: IMPORTS });
      expect(container.querySelector('atl-stepper')).toHaveClass('orientation-horizontal');
    });

    covers('stepper', 'orientation-vertical')('applies orientation-vertical class', async () => {
      const { container } = await render(
        `<atl-stepper orientation="vertical">
          <atl-step label="A">A</atl-step>
          <atl-step label="B">B</atl-step>
        </atl-stepper>`,
        { imports: IMPORTS }
      );
      expect(container.querySelector('atl-stepper')).toHaveClass('orientation-vertical');
    });
  });

  describe('optional label', () => {
    it('shows Optional text for optional steps that are not completed', async () => {
      await render(
        `<atl-stepper>
          <atl-step label="Account" [optional]="true">Account</atl-step>
        </atl-stepper>`,
        { imports: IMPORTS }
      );
      expect(screen.getByText('Optional')).toBeInTheDocument();
    });
  });
});
