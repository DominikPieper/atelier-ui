import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import LlmAccordionGroup from './llm-accordion-group.vue';
import LlmAccordionItem from './llm-accordion-item.vue';
import LlmAccordionHeader from './llm-accordion-header.vue';

const AccordionFixture = {
  components: { LlmAccordionGroup, LlmAccordionItem, LlmAccordionHeader },
  template: `
    <LlmAccordionGroup>
      <LlmAccordionItem>
        <template #header><LlmAccordionHeader>Question 1</LlmAccordionHeader></template>
        Answer 1
      </LlmAccordionItem>
      <LlmAccordionItem>
        <template #header><LlmAccordionHeader>Question 2</LlmAccordionHeader></template>
        Answer 2
      </LlmAccordionItem>
    </LlmAccordionGroup>
  `,
};

describe('LlmAccordionGroup', () => {
  it('renders accordion headers', () => {
    render(AccordionFixture);
    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('Question 2')).toBeInTheDocument();
  });

  it('expands an item on click', async () => {
    const user = userEvent.setup();
    render(AccordionFixture);
    const btn = screen.getByRole('button', { name: /Question 1/i });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  it('collapses an open item on second click', async () => {
    const user = userEvent.setup();
    render(AccordionFixture);
    const btn = screen.getByRole('button', { name: /Question 1/i });
    await user.click(btn);
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  it('collapses previously open item when multi is false', async () => {
    const user = userEvent.setup();
    render(AccordionFixture);
    const btn1 = screen.getByRole('button', { name: /Question 1/i });
    const btn2 = screen.getByRole('button', { name: /Question 2/i });
    await user.click(btn1);
    expect(btn1).toHaveAttribute('aria-expanded', 'true');
    await user.click(btn2);
    expect(btn2).toHaveAttribute('aria-expanded', 'true');
    expect(btn1).toHaveAttribute('aria-expanded', 'false');
  });

  it('allows multiple open items when multi is true', async () => {
    const user = userEvent.setup();
    render({
      components: { LlmAccordionGroup, LlmAccordionItem },
      template: `
        <LlmAccordionGroup :multi="true">
          <LlmAccordionItem><template #header>Q1</template>A1</LlmAccordionItem>
          <LlmAccordionItem><template #header>Q2</template>A2</LlmAccordionItem>
        </LlmAccordionGroup>
      `,
    });
    const btn1 = screen.getByRole('button', { name: /Q1/i });
    const btn2 = screen.getByRole('button', { name: /Q2/i });
    await user.click(btn1);
    await user.click(btn2);
    expect(btn1).toHaveAttribute('aria-expanded', 'true');
    expect(btn2).toHaveAttribute('aria-expanded', 'true');
  });

  it('does not expand a disabled item', async () => {
    render({
      components: { LlmAccordionGroup, LlmAccordionItem },
      template: `
        <LlmAccordionGroup>
          <LlmAccordionItem :disabled="true"><template #header>Disabled Q</template>Answer</LlmAccordionItem>
        </LlmAccordionGroup>
      `,
    });
    const btn = screen.getByRole('button', { name: /Disabled Q/i });
    expect(btn).toBeDisabled();
  });

  it('applies variant class to group', () => {
    const { container } = render({
      components: { LlmAccordionGroup, LlmAccordionItem },
      template: `<LlmAccordionGroup variant="separated"><LlmAccordionItem><template #header>H</template>B</LlmAccordionItem></LlmAccordionGroup>`,
    });
    expect(container.querySelector('.llm-accordion-group')).toHaveClass('variant-separated');
  });
});
