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
    covers('stepper', 'renders-list')('renders the header as an ordered list', async () => {
      render(Controlled);
      await flushPromises();
      expect(screen.getByRole('list', { name: 'Progress' })).toBeInTheDocument();
    });

    it('renders step buttons matching child count', async () => {
      render(Controlled);
      await flushPromises();
      expect(screen.getAllByRole('button')).toHaveLength(3);
    });

    it('renders step buttons with correct labels', async () => {
      render(Controlled);
      await flushPromises();
      expect(screen.getByRole('button', { name: /Account/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Profile/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Review/i })).toBeInTheDocument();
    });

    covers('stepper', 'first-panel-default')('shows first step panel by default', async () => {
      render(Controlled);
      await flushPromises();
      const panels = screen.getAllByRole('region', { hidden: true });
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
    covers('stepper', 'aria-current-active')('sets aria-current="step" on active step', async () => {
      render(Controlled);
      await flushPromises();
      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveAttribute('aria-current', 'step');
      expect(buttons[1]).not.toHaveAttribute('aria-current');
      expect(buttons[2]).not.toHaveAttribute('aria-current');
    });

    it('associates each panel with its step via aria-labelledby', async () => {
      render(Controlled);
      await flushPromises();
      const button = screen.getAllByRole('button')[0];
      const panel = screen.getAllByRole('region', { hidden: true }).find((p) => !(p as HTMLElement).hidden);
      expect(panel).toHaveAttribute('aria-labelledby', button.id);
    });
  });

  describe('click navigation', () => {
    covers('stepper', 'click-navigates')('clicking a step navigates to it', async () => {
      const user = userEvent.setup();
      render(Controlled);
      await flushPromises();

      await user.click(screen.getByRole('button', { name: /Profile/i }));

      expect(screen.getByRole('button', { name: /Profile/i })).toHaveAttribute('aria-current', 'step');
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

      const profileButton = screen.getByRole('button', { name: /Profile/i });
      expect(profileButton).toBeDisabled();
      await user.click(profileButton);
      expect((emitted()['update:activeStep'] ?? []).length).toBe(0);
    });

    covers('stepper', 'future-step-not-focusable')(
      'a step not yet reachable in linear mode is a disabled, non-focusable button',
      async () => {
        render({
          components: { AtlStepper, AtlStep },
          template: `
            <AtlStepper :linear="true" :activeStep="0">
              <AtlStep label="Account">Account content</AtlStep>
              <AtlStep label="Profile">Profile content</AtlStep>
              <AtlStep label="Review">Review content</AtlStep>
            </AtlStepper>
          `,
        });
        await flushPromises();
        const buttons = screen.getAllByRole('button');
        expect(buttons[0]).not.toBeDisabled(); // active — always reachable
        expect(buttons[1]).toBeDisabled(); // next pending step, not completed yet
        expect(buttons[2]).toBeDisabled(); // beyond the incomplete boundary
      }
    );
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

      await user.click(screen.getByRole('button', { name: /B/i }));
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
