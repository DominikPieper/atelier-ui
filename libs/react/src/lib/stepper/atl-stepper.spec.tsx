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
    covers('stepper', 'renders-tablist')('renders a tablist', () => {
      render(<Basic />);
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('renders step buttons matching child count', () => {
      render(<Basic />);
      expect(screen.getAllByRole('tab')).toHaveLength(3);
    });

    it('renders step buttons with correct labels', () => {
      render(<Basic />);
      expect(screen.getByRole('tab', { name: /Account/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Profile/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Review/i })).toBeInTheDocument();
    });

    covers('stepper', 'first-panel-default')('shows first step panel by default', () => {
      render(<Basic />);
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Account content');
    });

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
    covers('stepper', 'aria-selected-active')('sets aria-selected on active step', () => {
      render(<Basic />);
      const tabs = screen.getAllByRole('tab');
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
      expect(tabs[2]).toHaveAttribute('aria-selected', 'false');
    });

    it('links step button to panel via aria-controls', () => {
      render(<Basic />);
      const tab = screen.getAllByRole('tab')[0];
      const panelId = tab.getAttribute('aria-controls');
      expect(panelId).toBeTruthy();
      const panel = panelId ? document.getElementById(panelId) : null;
      expect(panel).not.toBeNull();
    });
  });

  describe('click navigation', () => {
    covers('stepper', 'click-navigates')('clicking a step navigates to it', async () => {
      const user = userEvent.setup();
      render(<Basic />);

      await user.click(screen.getByRole('tab', { name: /Profile/i }));

      expect(screen.getByRole('tab', { name: /Profile/i })).toHaveAttribute('aria-selected', 'true');
      const panels = screen.getAllByRole('tabpanel');
      const visiblePanel = panels.find((p) => !p.hidden);
      expect(visiblePanel).toHaveTextContent('Profile content');
    });

    covers('stepper', 'disabled-step-noop')('clicking a disabled step does nothing', async () => {
      const user = userEvent.setup();
      const [step, setStep] = [0, vi.fn()];
      render(
        <AtlStepper activeStep={step} onActiveStepChange={setStep}>
          <AtlStep label="Account">Account content</AtlStep>
          <AtlStep label="Profile" disabled>Profile content</AtlStep>
          <AtlStep label="Review">Review content</AtlStep>
        </AtlStepper>
      );

      await user.click(screen.getByRole('tab', { name: /Profile/i }));
      expect(setStep).not.toHaveBeenCalled();
    });
  });

  describe('states', () => {
    covers('stepper', 'completed-class')('applies is-completed class to completed non-active steps', () => {
      const { container } = render(
        <AtlStepper activeStep={1}>
          <AtlStep label="Done" completed>Done content</AtlStep>
          <AtlStep label="Current">Current content</AtlStep>
        </AtlStepper>
      );
      const items = container.querySelectorAll('.step-item');
      expect(items[0]).toHaveClass('is-completed');
    });

    covers('stepper', 'error-class')('applies is-error class to error steps', () => {
      const { container } = render(
        <AtlStepper activeStep={1}>
          <AtlStep label="Failed" error>Error content</AtlStep>
          <AtlStep label="Current">Current content</AtlStep>
        </AtlStepper>
      );
      const items = container.querySelectorAll('.step-item');
      expect(items[0]).toHaveClass('is-error');
    });

    it('applies is-disabled class to disabled steps', () => {
      const { container } = render(
        <AtlStepper>
          <AtlStep label="Account">Account</AtlStep>
          <AtlStep label="Skip" disabled>Skip</AtlStep>
        </AtlStepper>
      );
      const items = container.querySelectorAll('.step-item');
      expect(items[1]).toHaveClass('is-disabled');
    });
  });

  describe('orientation', () => {
    it('applies orientation-horizontal class by default', () => {
      const { container } = render(<Basic />);
      expect(container.querySelector('.atl-stepper')).toHaveClass('orientation-horizontal');
    });

    covers('stepper', 'orientation-vertical')('applies orientation-vertical class', () => {
      const { container } = render(
        <AtlStepper orientation="vertical">
          <AtlStep label="A">A</AtlStep>
          <AtlStep label="B">B</AtlStep>
        </AtlStepper>
      );
      expect(container.querySelector('.atl-stepper')).toHaveClass('orientation-vertical');
    });
  });

  describe('optional label', () => {
    it('shows Optional text for optional non-completed steps', () => {
      render(
        <AtlStepper>
          <AtlStep label="Account" optional>Account</AtlStep>
        </AtlStepper>
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
        </AtlStepper>
      );

      await user.click(screen.getByText('Next'));
      expect(screen.getByRole('tab', { name: /Step 2/i })).toHaveAttribute('aria-selected', 'true');
    });
  });
});
