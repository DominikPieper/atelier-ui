import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import AtlStepper from './atl-stepper.vue';
import AtlStep from './atl-step.vue';
import AtlButton from '../button/atl-button.vue';

import { metadata } from '@atelier-ui/spec/metadata/stepper.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: 'figma'; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlStepper> = {
  title: 'Components/Navigation/AtlStepper',
  component: AtlStepper,
  tags: ['autodocs'],
  parameters: { design: figmaNode('421-505'), docs: { description: { component: metadata.purpose } } },
};

export default meta;
type Story = StoryObj<typeof AtlStepper>;

export const Default: Story = {
  render: () => ({
    components: { AtlStepper, AtlStep, AtlButton },
    setup() {
      const step = ref(0);
      return { step };
    },
    template: `
      <AtlStepper v-model:activeStep="step">
        <AtlStep label="Account" description="Basic info">
          <p>Fill in your account details.</p>
          <AtlButton variant="primary" size="sm" style="margin-top:8px" @click="step++">Next</AtlButton>
        </AtlStep>
        <AtlStep label="Profile">
          <p>Set up your profile.</p>
          <div style="display:flex;gap:8px;margin-top:8px">
            <AtlButton variant="outline" size="sm" @click="step--">Back</AtlButton>
            <AtlButton variant="primary" size="sm" @click="step++">Next</AtlButton>
          </div>
        </AtlStep>
        <AtlStep label="Review">
          <p>Review and confirm.</p>
          <div style="display:flex;gap:8px;margin-top:8px">
            <AtlButton variant="outline" size="sm" @click="step--">Back</AtlButton>
            <AtlButton variant="primary" size="sm">Submit</AtlButton>
          </div>
        </AtlStep>
      </AtlStepper>
    `,
  }),
  parameters: { design: figmaNode('421-407') },
};

export const WithCompletedSteps: Story = {
  render: () => ({
    components: { AtlStepper, AtlStep },
    template: `
      <AtlStepper :activeStep="1">
        <AtlStep label="Account" :completed="true">Account content</AtlStep>
        <AtlStep label="Profile">Profile content</AtlStep>
        <AtlStep label="Review">Review content</AtlStep>
      </AtlStepper>
    `,
  }),
  parameters: { design: figmaNode('421-427') },
};

export const WithErrorStep: Story = {
  render: () => ({
    components: { AtlStepper, AtlStep },
    template: `
      <AtlStepper :activeStep="2">
        <AtlStep label="Account" :completed="true">Account content</AtlStep>
        <AtlStep label="Profile" :error="true">Profile had an error</AtlStep>
        <AtlStep label="Review">Review content</AtlStep>
      </AtlStepper>
    `,
  }),
  parameters: { design: figmaNode('421-446') },
};

export const WithOptionalStep: Story = {
  render: () => ({
    components: { AtlStepper, AtlStep },
    template: `
      <AtlStepper>
        <AtlStep label="Account">Account content</AtlStep>
        <AtlStep label="Profile" :optional="true">Profile content</AtlStep>
        <AtlStep label="Review">Review content</AtlStep>
      </AtlStepper>
    `,
  }),
  parameters: { design: figmaNode('421-465') },
};

export const Vertical: Story = {
  render: () => ({
    components: { AtlStepper, AtlStep, AtlButton },
    setup() {
      const step = ref(0);
      return { step };
    },
    template: `
      <AtlStepper orientation="vertical" v-model:activeStep="step">
        <AtlStep label="Account" description="Basic info">
          <p>Fill in your account details.</p>
          <AtlButton variant="primary" size="sm" style="margin-top:8px" @click="step++">Next</AtlButton>
        </AtlStep>
        <AtlStep label="Profile">
          <p>Set up your profile.</p>
          <div style="display:flex;gap:8px;margin-top:8px">
            <AtlButton variant="outline" size="sm" @click="step--">Back</AtlButton>
            <AtlButton variant="primary" size="sm" @click="step++">Next</AtlButton>
          </div>
        </AtlStep>
        <AtlStep label="Review">
          <p>Review and confirm.</p>
          <div style="display:flex;gap:8px;margin-top:8px">
            <AtlButton variant="outline" size="sm" @click="step--">Back</AtlButton>
            <AtlButton variant="primary" size="sm">Submit</AtlButton>
          </div>
        </AtlStep>
      </AtlStepper>
    `,
  }),
  parameters: { design: figmaNode('421-485') },
};
