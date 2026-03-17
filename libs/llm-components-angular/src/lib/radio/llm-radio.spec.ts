import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { LlmRadioGroup } from '../radio-group/llm-radio-group';
import { LlmRadio } from './llm-radio';

const GROUP_IMPORTS = [LlmRadioGroup, LlmRadio];

describe('LlmRadio', () => {
  it('renders a native radio input', async () => {
    const { container } = await render(
      `<llm-radio-group name="test">
        <llm-radio radioValue="a">Option A</llm-radio>
      </llm-radio-group>`,
      { imports: GROUP_IMPORTS }
    );
    expect(container.querySelector('input[type="radio"]')).toBeInTheDocument();
  });

  it('renders projected label content', async () => {
    await render(
      `<llm-radio-group name="test">
        <llm-radio radioValue="a">Option A</llm-radio>
      </llm-radio-group>`,
      { imports: GROUP_IMPORTS }
    );
    expect(screen.getByText('Option A')).toBeInTheDocument();
  });

  it('is unchecked by default', async () => {
    const { container } = await render(
      `<llm-radio-group name="test">
        <llm-radio radioValue="a">Option A</llm-radio>
      </llm-radio-group>`,
      { imports: GROUP_IMPORTS }
    );
    expect(container.querySelector('input[type="radio"]')).not.toBeChecked();
  });

  describe('checked state', () => {
    it('is checked when group value matches radioValue', async () => {
      const { container } = await render(
        `<llm-radio-group [(value)]="value" name="test">
          <llm-radio radioValue="a">Option A</llm-radio>
          <llm-radio radioValue="b">Option B</llm-radio>
        </llm-radio-group>`,
        { imports: GROUP_IMPORTS, componentProperties: { value: 'a' } }
      );
      const inputs = container.querySelectorAll<HTMLInputElement>('input[type="radio"]');
      expect(inputs[0]).toBeChecked();
      expect(inputs[1]).not.toBeChecked();
    });

    it('applies is-checked class to host when checked', async () => {
      const { container } = await render(
        `<llm-radio-group [(value)]="value" name="test">
          <llm-radio radioValue="a">Option A</llm-radio>
        </llm-radio-group>`,
        { imports: GROUP_IMPORTS, componentProperties: { value: 'a' } }
      );
      expect(container.querySelector('llm-radio')).toHaveClass('is-checked');
    });

    it('becomes checked when clicked', async () => {
      const user = userEvent.setup();
      const { container } = await render(
        `<llm-radio-group [(value)]="value" name="test">
          <llm-radio radioValue="a">Option A</llm-radio>
        </llm-radio-group>`,
        { imports: GROUP_IMPORTS, componentProperties: { value: '' } }
      );
      const input = container.querySelector('input[type="radio"]') as HTMLInputElement;
      await user.click(input);
      expect(input).toBeChecked();
    });
  });

  describe('disabled state', () => {
    it('is disabled when individually disabled', async () => {
      const { container } = await render(
        `<llm-radio-group name="test">
          <llm-radio radioValue="a" [disabled]="true">Option A</llm-radio>
        </llm-radio-group>`,
        { imports: GROUP_IMPORTS }
      );
      expect(container.querySelector('input[type="radio"]')).toBeDisabled();
    });

    it('is disabled when group is disabled', async () => {
      const { container } = await render(
        `<llm-radio-group [disabled]="true" name="test">
          <llm-radio radioValue="a">Option A</llm-radio>
        </llm-radio-group>`,
        { imports: GROUP_IMPORTS }
      );
      expect(container.querySelector('input[type="radio"]')).toBeDisabled();
    });

    it('applies is-disabled class to host when disabled', async () => {
      const { container } = await render(
        `<llm-radio-group name="test">
          <llm-radio radioValue="a" [disabled]="true">Option A</llm-radio>
        </llm-radio-group>`,
        { imports: GROUP_IMPORTS }
      );
      expect(container.querySelector('llm-radio')).toHaveClass('is-disabled');
    });
  });

  describe('name attribute', () => {
    it('inherits name from group', async () => {
      const { container } = await render(
        `<llm-radio-group name="mygroup">
          <llm-radio radioValue="a">Option A</llm-radio>
        </llm-radio-group>`,
        { imports: GROUP_IMPORTS }
      );
      expect(container.querySelector('input[type="radio"]')).toHaveAttribute('name', 'mygroup');
    });

    it('does not set name attribute when group name is empty', async () => {
      const { container } = await render(
        `<llm-radio-group>
          <llm-radio radioValue="a">Option A</llm-radio>
        </llm-radio-group>`,
        { imports: GROUP_IMPORTS }
      );
      expect(container.querySelector('input[type="radio"]')).not.toHaveAttribute('name');
    });
  });

  describe('label association', () => {
    it('links label to input via for/id', async () => {
      const { container } = await render(
        `<llm-radio-group name="test">
          <llm-radio radioValue="a">Option A</llm-radio>
        </llm-radio-group>`,
        { imports: GROUP_IMPORTS }
      );
      const input = container.querySelector('input[type="radio"]') as HTMLInputElement;
      const label = container.querySelector('label') as HTMLLabelElement;
      expect(label.htmlFor).toBe(input.id);
    });
  });
});
