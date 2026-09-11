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
    covers('stepper', 'renders-list')(
      'renders the header as an ordered list',
      async () => {
        await render(BASIC_TEMPLATE, { imports: IMPORTS });
        expect(
          screen.getByRole('list', { name: 'Progress' }),
        ).toBeInTheDocument();
      },
    );

    it('renders step buttons matching child count', async () => {
      await render(BASIC_TEMPLATE, { imports: IMPORTS });
      expect(screen.getAllByRole('button')).toHaveLength(3);
    });

    it('renders step buttons with correct labels', async () => {
      await render(BASIC_TEMPLATE, { imports: IMPORTS });
      expect(
        screen.getByRole('button', { name: /Account/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Profile/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Review/i }),
      ).toBeInTheDocument();
    });

    covers('stepper', 'first-panel-default')(
      'shows first step panel by default',
      async () => {
        await render(BASIC_TEMPLATE, { imports: IMPORTS });
        expect(screen.getByRole('region')).toHaveTextContent('Account content');
      },
    );

    it('does not render inactive step panels', async () => {
      await render(BASIC_TEMPLATE, { imports: IMPORTS });
      expect(screen.queryByText('Profile content')).not.toBeInTheDocument();
      expect(screen.queryByText('Review content')).not.toBeInTheDocument();
    });

    it('renders step numbers', async () => {
      await render(BASIC_TEMPLATE, { imports: IMPORTS });
      const buttons = screen.getAllByRole('button');
      expect(buttons[0].textContent.trim()).toBe('1');
      expect(buttons[1].textContent.trim()).toBe('2');
      expect(buttons[2].textContent.trim()).toBe('3');
    });
  });

  describe('ARIA attributes', () => {
    covers('stepper', 'aria-current-active')(
      'sets aria-current="step" on active step',
      async () => {
        await render(BASIC_TEMPLATE, { imports: IMPORTS });
        const buttons = screen.getAllByRole('button');
        expect(buttons[0]).toHaveAttribute('aria-current', 'step');
        expect(buttons[1]).not.toHaveAttribute('aria-current');
        expect(buttons[2]).not.toHaveAttribute('aria-current');
      },
    );

    it('associates the panel with its step via aria-labelledby', async () => {
      await render(BASIC_TEMPLATE, { imports: IMPORTS });
      const button = screen.getAllByRole('button')[0];
      expect(screen.getByRole('region')).toHaveAttribute(
        'aria-labelledby',
        button.id,
      );
    });
  });

  describe('click navigation', () => {
    covers('stepper', 'click-navigates')(
      'clicking a step navigates to it',
      async () => {
        const user = userEvent.setup();
        await render(BASIC_TEMPLATE, { imports: IMPORTS });

        await user.click(screen.getByRole('button', { name: /Profile/i }));

        expect(screen.getByRole('region')).toHaveTextContent('Profile content');
        expect(
          screen.getByRole('button', { name: /Profile/i }),
        ).toHaveAttribute('aria-current', 'step');
      },
    );

    covers('stepper', 'disabled-step-noop')(
      'clicking a disabled step does nothing',
      async () => {
        const user = userEvent.setup();
        await render(
          `<atl-stepper>
          <atl-step label="Account">Account content</atl-step>
          <atl-step label="Profile" [disabled]="true">Profile content</atl-step>
          <atl-step label="Review">Review content</atl-step>
        </atl-stepper>`,
          { imports: IMPORTS },
        );

        const profileButton = screen.getByRole('button', { name: /Profile/i });
        expect(profileButton).toBeDisabled();
        await user.click(profileButton);
        expect(screen.getByRole('region')).toHaveTextContent('Account content');
      },
    );

    covers('stepper', 'future-step-not-focusable')(
      'a step not yet reachable in linear mode is a disabled, non-focusable button',
      async () => {
        await render(
          `<atl-stepper [linear]="true">
            <atl-step label="Account">Account content</atl-step>
            <atl-step label="Profile">Profile content</atl-step>
            <atl-step label="Review">Review content</atl-step>
          </atl-stepper>`,
          { imports: IMPORTS },
        );
        const buttons = screen.getAllByRole('button');
        expect(buttons[0]).not.toBeDisabled(); // active — always reachable
        expect(buttons[1]).toBeDisabled(); // next pending step, not completed yet
        expect(buttons[2]).toBeDisabled(); // beyond the incomplete boundary
      },
    );
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
        },
      );
      expect(screen.getByRole('region')).toHaveTextContent('Panel B');
    });
  });

  describe('completed and error states', () => {
    covers('stepper', 'completed-class')(
      'applies is-completed class to completed steps',
      async () => {
        const { container } = await render(
          `<atl-stepper [activeStep]="activeStep">
          <atl-step label="Done" [completed]="completed">Done content</atl-step>
          <atl-step label="Current">Current content</atl-step>
        </atl-stepper>`,
          {
            imports: IMPORTS,
            componentProperties: { activeStep: 1, completed: true },
          },
        );
        const stepItems = container.querySelectorAll('.step-item');
        expect(stepItems[0]).toHaveClass('is-completed');
      },
    );

    covers('stepper', 'error-class')(
      'applies is-error class to error steps',
      async () => {
        const { container } = await render(
          `<atl-stepper [activeStep]="1">
          <atl-step label="Failed" [error]="true">Error content</atl-step>
          <atl-step label="Current">Current content</atl-step>
        </atl-stepper>`,
          { imports: IMPORTS },
        );
        const stepItems = container.querySelectorAll('.step-item');
        expect(stepItems[0]).toHaveClass('is-error');
      },
    );
  });

  describe('orientation', () => {
    it('applies orientation-horizontal class by default', async () => {
      const { container } = await render(BASIC_TEMPLATE, { imports: IMPORTS });
      expect(container.querySelector('atl-stepper')).toHaveClass(
        'orientation-horizontal',
      );
    });

    covers('stepper', 'orientation-vertical')(
      'applies orientation-vertical class',
      async () => {
        const { container } = await render(
          `<atl-stepper orientation="vertical">
          <atl-step label="A">A</atl-step>
          <atl-step label="B">B</atl-step>
        </atl-stepper>`,
          { imports: IMPORTS },
        );
        expect(container.querySelector('atl-stepper')).toHaveClass(
          'orientation-vertical',
        );
      },
    );
  });

  describe('optional label', () => {
    it('shows Optional text for optional steps that are not completed', async () => {
      await render(
        `<atl-stepper>
          <atl-step label="Account" [optional]="true">Account</atl-step>
        </atl-stepper>`,
        { imports: IMPORTS },
      );
      expect(screen.getByText('Optional')).toBeInTheDocument();
    });
  });
});
