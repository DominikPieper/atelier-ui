import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { AtlStepper, AtlStep, useAtlStepper } from './atl-stepper';
import { covers } from '../../testing/behavior';

function Basic({ initialStep = 0 }: { initialStep?: number }) {
  const [step, setStep] = useState(initialStep);
  return (
    <AtlStepper activeStep={step} onActiveStepChange={setStep}>
      <AtlStep label="Account">Account content</AtlStep>
      <AtlStep label="Profile">Profile content</AtlStep>
      <AtlStep label="Review">Review content</AtlStep>
    </AtlStepper>
  );
}

describe('AtlStepper', () => {
  describe('rendering', () => {
    covers('stepper', 'renders-list')(
      'renders the header as an ordered list',
      () => {
        render(<Basic />);
        expect(
          screen.getByRole('list', { name: 'Progress' }),
        ).toBeInTheDocument();
      },
    );

    it('renders step buttons matching child count', () => {
      render(<Basic />);
      expect(screen.getAllByRole('button')).toHaveLength(3);
    });

    it('renders step buttons with correct labels', () => {
      render(<Basic />);
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
      () => {
        render(<Basic />);
        expect(screen.getByRole('region')).toHaveTextContent('Account content');
      },
    );

    it('does not show inactive panels', () => {
      render(<Basic />);
      expect(screen.queryByText('Profile content')).not.toBeVisible();
      expect(screen.queryByText('Review content')).not.toBeVisible();
    });

    it('renders step numbers', () => {
      const { container } = render(<Basic />);
      const circles = container.querySelectorAll('.step-circle');
      expect(circles[0].textContent?.trim()).toBe('1');
      expect(circles[1].textContent?.trim()).toBe('2');
      expect(circles[2].textContent?.trim()).toBe('3');
    });
  });

  describe('ARIA attributes', () => {
    covers('stepper', 'aria-current-active')(
      'sets aria-current="step" on active step',
      () => {
        render(<Basic />);
        const buttons = screen.getAllByRole('button');
        expect(buttons[0]).toHaveAttribute('aria-current', 'step');
        expect(buttons[1]).not.toHaveAttribute('aria-current');
        expect(buttons[2]).not.toHaveAttribute('aria-current');
      },
    );

    it('associates each panel with its step via aria-labelledby', () => {
      render(<Basic />);
      const button = screen.getAllByRole('button')[0];
      const panel = screen.getByRole('region');
      expect(panel).toHaveAttribute('aria-labelledby', button.id);
    });
  });

  describe('click navigation', () => {
    covers('stepper', 'click-navigates')(
      'clicking a step navigates to it',
      async () => {
        const user = userEvent.setup();
        render(<Basic />);

        await user.click(screen.getByRole('button', { name: /Profile/i }));

        expect(
          screen.getByRole('button', { name: /Profile/i }),
        ).toHaveAttribute('aria-current', 'step');
        expect(screen.getByRole('region')).toHaveTextContent('Profile content');
      },
    );

    covers('stepper', 'disabled-step-noop')(
      'clicking a disabled step does nothing',
      async () => {
        const user = userEvent.setup();
        const [step, setStep] = [0, vi.fn()];
        render(
          <AtlStepper activeStep={step} onActiveStepChange={setStep}>
            <AtlStep label="Account">Account content</AtlStep>
            <AtlStep label="Profile" disabled>
              Profile content
            </AtlStep>
            <AtlStep label="Review">Review content</AtlStep>
          </AtlStepper>,
        );

        const profileButton = screen.getByRole('button', { name: /Profile/i });
        expect(profileButton).toBeDisabled();
        await user.click(profileButton);
        expect(setStep).not.toHaveBeenCalled();
      },
    );

    covers('stepper', 'future-step-not-focusable')(
      'a step not yet reachable in linear mode is a disabled, non-focusable button',
      () => {
        render(
          <AtlStepper linear activeStep={0}>
            <AtlStep label="Account">Account content</AtlStep>
            <AtlStep label="Profile">Profile content</AtlStep>
            <AtlStep label="Review">Review content</AtlStep>
          </AtlStepper>,
        );
        const buttons = screen.getAllByRole('button');
        expect(buttons[0]).not.toBeDisabled(); // active — always reachable
        expect(buttons[1]).toBeDisabled(); // next pending step, not completed yet
        expect(buttons[2]).toBeDisabled(); // beyond the incomplete boundary
      },
    );

    it('keeps a completed step reachable in linear mode even when a later step is active', () => {
      render(
        <AtlStepper linear activeStep={1}>
          <AtlStep label="Account" completed>
            Account content
          </AtlStep>
          <AtlStep label="Profile">Profile content</AtlStep>
          <AtlStep label="Review">Review content</AtlStep>
        </AtlStepper>,
      );
      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).not.toBeDisabled(); // completed
      expect(buttons[1]).not.toBeDisabled(); // active
      expect(buttons[2]).toBeDisabled(); // next pending, not completed yet
    });
  });

  describe('states', () => {
    covers('stepper', 'completed-class')(
      'applies is-completed class to completed non-active steps',
      () => {
        const { container } = render(
          <AtlStepper activeStep={1}>
            <AtlStep label="Done" completed>
              Done content
            </AtlStep>
            <AtlStep label="Current">Current content</AtlStep>
          </AtlStepper>,
        );
        const items = container.querySelectorAll('.step-item');
        expect(items[0]).toHaveClass('is-completed');
      },
    );

    covers('stepper', 'error-class')(
      'applies is-error class to error steps',
      () => {
        const { container } = render(
          <AtlStepper activeStep={1}>
            <AtlStep label="Failed" error>
              Error content
            </AtlStep>
            <AtlStep label="Current">Current content</AtlStep>
          </AtlStepper>,
        );
        const items = container.querySelectorAll('.step-item');
        expect(items[0]).toHaveClass('is-error');
      },
    );

    it('applies is-disabled class to disabled steps', () => {
      const { container } = render(
        <AtlStepper>
          <AtlStep label="Account">Account</AtlStep>
          <AtlStep label="Skip" disabled>
            Skip
          </AtlStep>
        </AtlStepper>,
      );
      const items = container.querySelectorAll('.step-item');
      expect(items[1]).toHaveClass('is-disabled');
    });
  });

  describe('orientation', () => {
    it('applies orientation-horizontal class by default', () => {
      const { container } = render(<Basic />);
      expect(container.querySelector('.atl-stepper')).toHaveClass(
        'orientation-horizontal',
      );
    });

    covers('stepper', 'orientation-vertical')(
      'applies orientation-vertical class',
      () => {
        const { container } = render(
          <AtlStepper orientation="vertical">
            <AtlStep label="A">A</AtlStep>
            <AtlStep label="B">B</AtlStep>
          </AtlStepper>,
        );
        expect(container.querySelector('.atl-stepper')).toHaveClass(
          'orientation-vertical',
        );
      },
    );
  });

  describe('optional label', () => {
    it('shows Optional text for optional non-completed steps', () => {
      render(
        <AtlStepper>
          <AtlStep label="Account" optional>
            Account
          </AtlStep>
        </AtlStepper>,
      );
      expect(screen.getByText('Optional')).toBeInTheDocument();
    });
  });

  describe('useAtlStepper hook', () => {
    function NextButton() {
      const { next } = useAtlStepper();
      return <button onClick={next}>Next</button>;
    }

    it('next() advances to the next step', async () => {
      const user = userEvent.setup();
      render(
        <AtlStepper>
          <AtlStep label="Step 1">
            <NextButton />
          </AtlStep>
          <AtlStep label="Step 2">Step 2 content</AtlStep>
          <AtlStep label="Step 3">Step 3 content</AtlStep>
        </AtlStepper>,
      );

      await user.click(screen.getByText('Next'));
      expect(screen.getByRole('button', { name: /Step 2/i })).toHaveAttribute(
        'aria-current',
        'step',
      );
    });
  });
});
