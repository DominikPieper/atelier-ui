import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { LlmStepper, LlmStep, useLlmStepper } from './llm-stepper';

function Basic({ initialStep = 0 }: { initialStep?: number }) {
  const [step, setStep] = useState(initialStep);
  return (
    <LlmStepper activeStep={step} onActiveStepChange={setStep}>
      <LlmStep label="Account">Account content</LlmStep>
      <LlmStep label="Profile">Profile content</LlmStep>
      <LlmStep label="Review">Review content</LlmStep>
    </LlmStepper>
  );
}

describe('LlmStepper', () => {
  describe('rendering', () => {
    it('renders a tablist', () => {
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

    it('shows first step panel by default', () => {
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
    it('sets aria-selected on active step', () => {
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
      const panel = document.getElementById(panelId!);
      expect(panel).not.toBeNull();
    });
  });

  describe('click navigation', () => {
    it('clicking a step navigates to it', async () => {
      const user = userEvent.setup();
      render(<Basic />);

      await user.click(screen.getByRole('tab', { name: /Profile/i }));

      expect(screen.getByRole('tab', { name: /Profile/i })).toHaveAttribute('aria-selected', 'true');
      const panels = screen.getAllByRole('tabpanel');
      const visiblePanel = panels.find((p) => !p.hidden);
      expect(visiblePanel).toHaveTextContent('Profile content');
    });

    it('clicking a disabled step does nothing', async () => {
      const user = userEvent.setup();
      const [step, setStep] = [0, vi.fn()];
      render(
        <LlmStepper activeStep={step} onActiveStepChange={setStep}>
          <LlmStep label="Account">Account content</LlmStep>
          <LlmStep label="Profile" disabled>Profile content</LlmStep>
          <LlmStep label="Review">Review content</LlmStep>
        </LlmStepper>
      );

      await user.click(screen.getByRole('tab', { name: /Profile/i }));
      expect(setStep).not.toHaveBeenCalled();
    });
  });

  describe('states', () => {
    it('applies is-completed class to completed non-active steps', () => {
      const { container } = render(
        <LlmStepper activeStep={1}>
          <LlmStep label="Done" completed>Done content</LlmStep>
          <LlmStep label="Current">Current content</LlmStep>
        </LlmStepper>
      );
      const items = container.querySelectorAll('.step-item');
      expect(items[0]).toHaveClass('is-completed');
    });

    it('applies is-error class to error steps', () => {
      const { container } = render(
        <LlmStepper activeStep={1}>
          <LlmStep label="Failed" error>Error content</LlmStep>
          <LlmStep label="Current">Current content</LlmStep>
        </LlmStepper>
      );
      const items = container.querySelectorAll('.step-item');
      expect(items[0]).toHaveClass('is-error');
    });

    it('applies is-disabled class to disabled steps', () => {
      const { container } = render(
        <LlmStepper>
          <LlmStep label="Account">Account</LlmStep>
          <LlmStep label="Skip" disabled>Skip</LlmStep>
        </LlmStepper>
      );
      const items = container.querySelectorAll('.step-item');
      expect(items[1]).toHaveClass('is-disabled');
    });
  });

  describe('orientation', () => {
    it('applies orientation-horizontal class by default', () => {
      const { container } = render(<Basic />);
      expect(container.querySelector('.llm-stepper')).toHaveClass('orientation-horizontal');
    });

    it('applies orientation-vertical class', () => {
      const { container } = render(
        <LlmStepper orientation="vertical">
          <LlmStep label="A">A</LlmStep>
          <LlmStep label="B">B</LlmStep>
        </LlmStepper>
      );
      expect(container.querySelector('.llm-stepper')).toHaveClass('orientation-vertical');
    });
  });

  describe('optional label', () => {
    it('shows Optional text for optional non-completed steps', () => {
      render(
        <LlmStepper>
          <LlmStep label="Account" optional>Account</LlmStep>
        </LlmStepper>
      );
      expect(screen.getByText('Optional')).toBeInTheDocument();
    });
  });

  describe('useLlmStepper hook', () => {
    function NextButton() {
      const { next } = useLlmStepper();
      return <button onClick={next}>Next</button>;
    }

    it('next() advances to the next step', async () => {
      const user = userEvent.setup();
      render(
        <LlmStepper>
          <LlmStep label="Step 1">
            <NextButton />
          </LlmStep>
          <LlmStep label="Step 2">Step 2 content</LlmStep>
          <LlmStep label="Step 3">Step 3 content</LlmStep>
        </LlmStepper>
      );

      await user.click(screen.getByText('Next'));
      expect(screen.getByRole('tab', { name: /Step 2/i })).toHaveAttribute('aria-selected', 'true');
    });
  });
});
