import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import AtlStepper from './atl-stepper.vue';
import AtlStep from './atl-step.vue';
import { covers } from '../../testing/behavior';

const Controlled = {
  components: { AtlStepper, AtlStep },
  props: ['initialStep'],
  setup(props: { initialStep?: number }) {
    const step = ref(props.initialStep ?? 0);
    return { step };
  },
  template: `
    <AtlStepper v-model:activeStep="step">
      <AtlStep label="Account">Account content</AtlStep>
      <AtlStep label="Profile">Profile content</AtlStep>
      <AtlStep label="Review">Review content</AtlStep>
    </AtlStepper>
  `,
};

describe('AtlStepper', () => {
  describe('rendering', () => {
    covers('stepper', 'renders-tablist')('renders a tablist', async () => {
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

    covers('stepper', 'first-panel-default')('shows first step panel by default', async () => {
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
    covers('stepper', 'aria-selected-active')('sets aria-selected on active step', async () => {
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
      const panel = document.getElementById(panelId as string);
      expect(panel).not.toBeNull();
    });
  });

  describe('click navigation', () => {
    covers('stepper', 'click-navigates')('clicking a step navigates to it', async () => {
      const user = userEvent.setup();
      render(Controlled);
      await flushPromises();

      await user.click(screen.getByRole('tab', { name: /Profile/i }));

      expect(screen.getByRole('tab', { name: /Profile/i })).toHaveAttribute('aria-selected', 'true');
    });

    covers('stepper', 'disabled-step-noop')('clicking a disabled step does nothing', async () => {
      const user = userEvent.setup();
      const { emitted } = render(AtlStepper, {
        props: { activeStep: 0 },
        slots: {
          default: `
            <AtlStep label="Account">Account</AtlStep>
            <AtlStep label="Profile" :disabled="true">Profile</AtlStep>
            <AtlStep label="Review">Review</AtlStep>
          `,
        },
        global: { components: { AtlStep } },
      });
      await flushPromises();

      await user.click(screen.getByRole('tab', { name: /Profile/i }));
      expect((emitted()['update:activeStep'] ?? []).length).toBe(0);
    });
  });

  describe('v-model emit', () => {
    it('emits update:activeStep when step is clicked', async () => {
      const user = userEvent.setup();
      const { emitted } = render(AtlStepper, {
        props: { activeStep: 0 },
        slots: {
          default: `
            <AtlStep label="A">A</AtlStep>
            <AtlStep label="B">B</AtlStep>
          `,
        },
        global: { components: { AtlStep } },
      });
      await flushPromises();

      await user.click(screen.getByRole('tab', { name: /B/i }));
      expect(emitted()['update:activeStep']).toEqual([[1]]);
    });
  });

  describe('states', () => {
    covers('stepper', 'completed-class')('applies is-completed class to completed non-active steps', async () => {
      const { container } = render({
        components: { AtlStepper, AtlStep },
        template: `
          <AtlStepper :activeStep="1">
            <AtlStep label="Done" :completed="true">Done</AtlStep>
            <AtlStep label="Current">Current</AtlStep>
          </AtlStepper>
        `,
      });
      await flushPromises();
      const items = container.querySelectorAll('.step-item');
      expect(items[0]).toHaveClass('is-completed');
    });

    covers('stepper', 'error-class')('applies is-error class to error steps', async () => {
      const { container } = render({
        components: { AtlStepper, AtlStep },
        template: `
          <AtlStepper :activeStep="1">
            <AtlStep label="Failed" :error="true">Failed</AtlStep>
            <AtlStep label="Current">Current</AtlStep>
          </AtlStepper>
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
      expect(container.querySelector('.atl-stepper')).toHaveClass('orientation-horizontal');
    });

    covers('stepper', 'orientation-vertical')('applies orientation-vertical class', async () => {
      const { container } = render({
        components: { AtlStepper, AtlStep },
        template: `
          <AtlStepper orientation="vertical">
            <AtlStep label="A">A</AtlStep>
            <AtlStep label="B">B</AtlStep>
          </AtlStepper>
        `,
      });
      await flushPromises();
      expect(container.querySelector('.atl-stepper')).toHaveClass('orientation-vertical');
    });
  });

  describe('optional label', () => {
    it('shows Optional text for optional non-completed steps', async () => {
      render({
        components: { AtlStepper, AtlStep },
        template: `
          <AtlStepper>
            <AtlStep label="Account" :optional="true">Account</AtlStep>
          </AtlStepper>
        `,
      });
      await flushPromises();
      expect(screen.getByText('Optional')).toBeInTheDocument();
    });
  });
});
