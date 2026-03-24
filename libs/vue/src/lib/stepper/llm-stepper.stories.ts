import type { Meta, StoryObj } from '@storybook/vue3';
import LlmStepper from './llm-stepper.vue';
import LlmStep from './llm-step.vue';

const meta: Meta<typeof LlmStepper> = {
  title: 'Components/LlmStepper',
  component: LlmStepper,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LlmStepper>;

export const Default: Story = {
  render: () => ({
    components: { LlmStepper, LlmStep },
    setup() {
      const { ref } = require('vue');
      const step = ref(0);
      return { step };
    },
    template: `
      <LlmStepper v-model:activeStep="step">
        <LlmStep label="Account" description="Basic info">
          <p>Fill in your account details.</p>
          <button @click="step++" style="margin-top:8px;padding:6px 12px;background:#6366f1;color:#fff;border:none;border-radius:6px;cursor:pointer">Next</button>
        </LlmStep>
        <LlmStep label="Profile">
          <p>Set up your profile.</p>
          <div style="display:flex;gap:8px;margin-top:8px">
            <button @click="step--" style="padding:6px 12px;border:1px solid #e2e8f0;border-radius:6px;cursor:pointer;background:#fff">Back</button>
            <button @click="step++" style="padding:6px 12px;background:#6366f1;color:#fff;border:none;border-radius:6px;cursor:pointer">Next</button>
          </div>
        </LlmStep>
        <LlmStep label="Review">
          <p>Review and confirm.</p>
          <div style="display:flex;gap:8px;margin-top:8px">
            <button @click="step--" style="padding:6px 12px;border:1px solid #e2e8f0;border-radius:6px;cursor:pointer;background:#fff">Back</button>
            <button style="padding:6px 12px;background:#6366f1;color:#fff;border:none;border-radius:6px;cursor:pointer">Submit</button>
          </div>
        </LlmStep>
      </LlmStepper>
    `,
  }),
};

export const WithCompletedSteps: Story = {
  render: () => ({
    components: { LlmStepper, LlmStep },
    template: `
      <LlmStepper :activeStep="1">
        <LlmStep label="Account" :completed="true">Account content</LlmStep>
        <LlmStep label="Profile">Profile content</LlmStep>
        <LlmStep label="Review">Review content</LlmStep>
      </LlmStepper>
    `,
  }),
};

export const WithErrorStep: Story = {
  render: () => ({
    components: { LlmStepper, LlmStep },
    template: `
      <LlmStepper :activeStep="2">
        <LlmStep label="Account" :completed="true">Account content</LlmStep>
        <LlmStep label="Profile" :error="true">Profile had an error</LlmStep>
        <LlmStep label="Review">Review content</LlmStep>
      </LlmStepper>
    `,
  }),
};

export const WithOptionalStep: Story = {
  render: () => ({
    components: { LlmStepper, LlmStep },
    template: `
      <LlmStepper>
        <LlmStep label="Account">Account content</LlmStep>
        <LlmStep label="Profile" :optional="true">Profile content</LlmStep>
        <LlmStep label="Review">Review content</LlmStep>
      </LlmStepper>
    `,
  }),
};

export const Vertical: Story = {
  render: () => ({
    components: { LlmStepper, LlmStep },
    setup() {
      const { ref } = require('vue');
      const step = ref(0);
      return { step };
    },
    template: `
      <LlmStepper orientation="vertical" v-model:activeStep="step">
        <LlmStep label="Account" description="Basic info">
          <p>Fill in your account details.</p>
          <button @click="step++" style="margin-top:8px;padding:6px 12px;background:#6366f1;color:#fff;border:none;border-radius:6px;cursor:pointer">Next</button>
        </LlmStep>
        <LlmStep label="Profile">
          <p>Set up your profile.</p>
          <div style="display:flex;gap:8px;margin-top:8px">
            <button @click="step--" style="padding:6px 12px;border:1px solid #e2e8f0;border-radius:6px;cursor:pointer;background:#fff">Back</button>
            <button @click="step++" style="padding:6px 12px;background:#6366f1;color:#fff;border:none;border-radius:6px;cursor:pointer">Next</button>
          </div>
        </LlmStep>
        <LlmStep label="Review">
          <p>Review and confirm.</p>
          <div style="display:flex;gap:8px;margin-top:8px">
            <button @click="step--" style="padding:6px 12px;border:1px solid #e2e8f0;border-radius:6px;cursor:pointer;background:#fff">Back</button>
            <button style="padding:6px 12px;background:#6366f1;color:#fff;border:none;border-radius:6px;cursor:pointer">Submit</button>
          </div>
        </LlmStep>
      </LlmStepper>
    `,
  }),
};
