import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import LlmStepper from './llm-stepper.vue';
import LlmStep from './llm-step.vue';
import LlmButton from '../button/llm-button.vue';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string): { type: 'figma'; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmStepper> = {
  title: 'Components/Navigation/LlmStepper',
  component: LlmStepper,
  tags: ['autodocs'],
  parameters: { design: figmaNode('421-505') },
};

export default meta;
type Story = StoryObj<typeof LlmStepper>;

export const Default: Story = {
  render: () => ({
    components: { LlmStepper, LlmStep, LlmButton },
    setup() {
      const step = ref(0);
      return { step };
    },
    template: `
      <LlmStepper v-model:activeStep="step">
        <LlmStep label="Account" description="Basic info">
          <p>Fill in your account details.</p>
          <LlmButton variant="primary" size="sm" style="margin-top:8px" @click="step++">Next</LlmButton>
        </LlmStep>
        <LlmStep label="Profile">
          <p>Set up your profile.</p>
          <div style="display:flex;gap:8px;margin-top:8px">
            <LlmButton variant="outline" size="sm" @click="step--">Back</LlmButton>
            <LlmButton variant="primary" size="sm" @click="step++">Next</LlmButton>
          </div>
        </LlmStep>
        <LlmStep label="Review">
          <p>Review and confirm.</p>
          <div style="display:flex;gap:8px;margin-top:8px">
            <LlmButton variant="outline" size="sm" @click="step--">Back</LlmButton>
            <LlmButton variant="primary" size="sm">Submit</LlmButton>
          </div>
        </LlmStep>
      </LlmStepper>
    `,
  }),
  parameters: { design: figmaNode('421-407') },
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
  parameters: { design: figmaNode('421-427') },
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
  parameters: { design: figmaNode('421-446') },
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
  parameters: { design: figmaNode('421-465') },
};

export const Vertical: Story = {
  render: () => ({
    components: { LlmStepper, LlmStep, LlmButton },
    setup() {
      const step = ref(0);
      return { step };
    },
    template: `
      <LlmStepper orientation="vertical" v-model:activeStep="step">
        <LlmStep label="Account" description="Basic info">
          <p>Fill in your account details.</p>
          <LlmButton variant="primary" size="sm" style="margin-top:8px" @click="step++">Next</LlmButton>
        </LlmStep>
        <LlmStep label="Profile">
          <p>Set up your profile.</p>
          <div style="display:flex;gap:8px;margin-top:8px">
            <LlmButton variant="outline" size="sm" @click="step--">Back</LlmButton>
            <LlmButton variant="primary" size="sm" @click="step++">Next</LlmButton>
          </div>
        </LlmStep>
        <LlmStep label="Review">
          <p>Review and confirm.</p>
          <div style="display:flex;gap:8px;margin-top:8px">
            <LlmButton variant="outline" size="sm" @click="step--">Back</LlmButton>
            <LlmButton variant="primary" size="sm">Submit</LlmButton>
          </div>
        </LlmStep>
      </LlmStepper>
    `,
  }),
  parameters: { design: figmaNode('421-485') },
};
