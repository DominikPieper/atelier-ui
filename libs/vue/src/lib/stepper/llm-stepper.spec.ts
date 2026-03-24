import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import LlmStepper from './llm-stepper.vue';
import LlmStep from './llm-step.vue';

const Controlled = {
  components: { LlmStepper, LlmStep },
  props: ['initialStep'],
  setup(props: { initialStep?: number }) {
    const step = ref(props.initialStep ?? 0);
    return { step };
  },
  template: `
    <LlmStepper v-model:activeStep="step">
      <LlmStep label="Account">Account content</LlmStep>
      <LlmStep label="Profile">Profile content</LlmStep>
      <LlmStep label="Review">Review content</LlmStep>
    </LlmStepper>
  `,
};

describe('LlmStepper', () => {
  describe('rendering', () => {
    it('renders a tablist', async () => {
      render(Controlled);
      await flushPromises();
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('renders step buttons matching child count', async () => {
      render(Controlled);
      await flushPromises();
      expect(screen.getAllByRole('tab')).toHaveLength(3);
    });

    it('renders step buttons with correct labels', async () => {
      render(Controlled);
      await flushPromises();
      expect(screen.getByRole('tab', { name: /Account/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Profile/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Review/i })).toBeInTheDocument();
    });

    it('shows first step panel by default', async () => {
      render(Controlled);
      await flushPromises();
      const panels = screen.getAllByRole('tabpanel', { hidden: true });
      const visible = panels.find((p) => !(p as HTMLElement).hidden);
      expect(visible).toHaveTextContent('Account content');
    });

    it('renders step numbers', async () => {
      const { container } = render(Controlled);
      await flushPromises();
      const circles = container.querySelectorAll('.step-circle');
      expect(circles[0].textContent?.trim()).toBe('1');
      expect(circles[1].textContent?.trim()).toBe('2');
      expect(circles[2].textContent?.trim()).toBe('3');
    });
  });

  describe('ARIA attributes', () => {
    it('sets aria-selected on active step', async () => {
      render(Controlled);
      await flushPromises();
      const tabs = screen.getAllByRole('tab');
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
      expect(tabs[2]).toHaveAttribute('aria-selected', 'false');
    });

    it('links step button to panel via aria-controls', async () => {
      render(Controlled);
      await flushPromises();
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
      render(Controlled);
      await flushPromises();

      await user.click(screen.getByRole('tab', { name: /Profile/i }));

      expect(screen.getByRole('tab', { name: /Profile/i })).toHaveAttribute('aria-selected', 'true');
    });

    it('clicking a disabled step does nothing', async () => {
      const user = userEvent.setup();
      const { emitted } = render(LlmStepper, {
        props: { activeStep: 0 },
        slots: {
          default: `
            <LlmStep label="Account">Account</LlmStep>
            <LlmStep label="Profile" :disabled="true">Profile</LlmStep>
            <LlmStep label="Review">Review</LlmStep>
          `,
        },
        global: { components: { LlmStep } },
      });
      await flushPromises();

      await user.click(screen.getByRole('tab', { name: /Profile/i }));
      expect((emitted()['update:activeStep'] ?? []).length).toBe(0);
    });
  });

  describe('v-model emit', () => {
    it('emits update:activeStep when step is clicked', async () => {
      const user = userEvent.setup();
      const { emitted } = render(LlmStepper, {
        props: { activeStep: 0 },
        slots: {
          default: `
            <LlmStep label="A">A</LlmStep>
            <LlmStep label="B">B</LlmStep>
          `,
        },
        global: { components: { LlmStep } },
      });
      await flushPromises();

      await user.click(screen.getByRole('tab', { name: /B/i }));
      expect(emitted()['update:activeStep']).toEqual([[1]]);
    });
  });

  describe('states', () => {
    it('applies is-completed class to completed non-active steps', async () => {
      const { container } = render({
        components: { LlmStepper, LlmStep },
        template: `
          <LlmStepper :activeStep="1">
            <LlmStep label="Done" :completed="true">Done</LlmStep>
            <LlmStep label="Current">Current</LlmStep>
          </LlmStepper>
        `,
      });
      await flushPromises();
      const items = container.querySelectorAll('.step-item');
      expect(items[0]).toHaveClass('is-completed');
    });

    it('applies is-error class to error steps', async () => {
      const { container } = render({
        components: { LlmStepper, LlmStep },
        template: `
          <LlmStepper :activeStep="1">
            <LlmStep label="Failed" :error="true">Failed</LlmStep>
            <LlmStep label="Current">Current</LlmStep>
          </LlmStepper>
        `,
      });
      await flushPromises();
      const items = container.querySelectorAll('.step-item');
      expect(items[0]).toHaveClass('is-error');
    });
  });

  describe('orientation', () => {
    it('applies orientation-horizontal class by default', async () => {
      const { container } = render(Controlled);
      await flushPromises();
      expect(container.querySelector('.llm-stepper')).toHaveClass('orientation-horizontal');
    });

    it('applies orientation-vertical class', async () => {
      const { container } = render({
        components: { LlmStepper, LlmStep },
        template: `
          <LlmStepper orientation="vertical">
            <LlmStep label="A">A</LlmStep>
            <LlmStep label="B">B</LlmStep>
          </LlmStepper>
        `,
      });
      await flushPromises();
      expect(container.querySelector('.llm-stepper')).toHaveClass('orientation-vertical');
    });
  });

  describe('optional label', () => {
    it('shows Optional text for optional non-completed steps', async () => {
      render({
        components: { LlmStepper, LlmStep },
        template: `
          <LlmStepper>
            <LlmStep label="Account" :optional="true">Account</LlmStep>
          </LlmStepper>
        `,
      });
      await flushPromises();
      expect(screen.getByText('Optional')).toBeInTheDocument();
    });
  });
});
