import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import AtlAccordionGroup from './atl-accordion-group.vue';
import AtlAccordionItem from './atl-accordion-item.vue';
import AtlAccordionHeader from './atl-accordion-header.vue';
import { covers } from '../../testing/behavior';

const AccordionFixture = {
  components: { AtlAccordionGroup, AtlAccordionItem, AtlAccordionHeader },
  template: `
    <AtlAccordionGroup>
      <AtlAccordionItem>
        <template #header><AtlAccordionHeader>Question 1</AtlAccordionHeader></template>
        Answer 1
      </AtlAccordionItem>
      <AtlAccordionItem>
        <template #header><AtlAccordionHeader>Question 2</AtlAccordionHeader></template>
        Answer 2
      </AtlAccordionItem>
    </AtlAccordionGroup>
  `,
};

describe('AtlAccordionGroup', () => {
  it('renders accordion headers', () => {
    render(AccordionFixture);
    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('Question 2')).toBeInTheDocument();
  });

  covers('accordion', 'keyboard-nav')('ArrowDown moves focus to the next header', async () => {
    const user = userEvent.setup();
    render(AccordionFixture);
    const first = screen.getByRole('button', { name: /Question 1/i });
    const second = screen.getByRole('button', { name: /Question 2/i });
    first.focus();
    await user.keyboard('{ArrowDown}');
    expect(second).toHaveFocus();
  });

  covers('accordion', 'home-end')('Home focuses the first header and End the last', async () => {
    const user = userEvent.setup();
    render({
      components: { AtlAccordionGroup, AtlAccordionItem },
      template: `
        <AtlAccordionGroup>
          <AtlAccordionItem><template #header>Q1</template>A1</AtlAccordionItem>
          <AtlAccordionItem><template #header>Q2</template>A2</AtlAccordionItem>
          <AtlAccordionItem><template #header>Q3</template>A3</AtlAccordionItem>
        </AtlAccordionGroup>
      `,
    });
    const btns = screen.getAllByRole('button');
    btns[0].focus();
    await user.keyboard('{End}');
    expect(btns[2]).toHaveFocus();
    await user.keyboard('{Home}');
    expect(btns[0]).toHaveFocus();
  });

  covers('accordion', 'wrap')('ArrowDown wraps from the last header to the first', async () => {
    const user = userEvent.setup();
    render(AccordionFixture);
    const first = screen.getByRole('button', { name: /Question 1/i });
    const second = screen.getByRole('button', { name: /Question 2/i });
    second.focus();
    await user.keyboard('{ArrowDown}');
    expect(first).toHaveFocus();
  });

  covers('accordion', 'skip-disabled')('arrow navigation skips disabled items', async () => {
    const user = userEvent.setup();
    render({
      components: { AtlAccordionGroup, AtlAccordionItem },
      template: `
        <AtlAccordionGroup>
          <AtlAccordionItem><template #header>Q1</template>A1</AtlAccordionItem>
          <AtlAccordionItem :disabled="true"><template #header>Q2</template>A2</AtlAccordionItem>
          <AtlAccordionItem><template #header>Q3</template>A3</AtlAccordionItem>
        </AtlAccordionGroup>
      `,
    });
    const q1 = screen.getByRole('button', { name: /Q1/i });
    const q3 = screen.getByRole('button', { name: /Q3/i });
    q1.focus();
    await user.keyboard('{ArrowDown}');
    expect(q3).toHaveFocus();
  });

  covers('accordion', 'expand-on-click')('expands an item on click', async () => {
    const user = userEvent.setup();
    render(AccordionFixture);
    const btn = screen.getByRole('button', { name: /Question 1/i });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  covers('accordion', 'collapse-on-click')('collapses an open item on second click', async () => {
    const user = userEvent.setup();
    render(AccordionFixture);
    const btn = screen.getByRole('button', { name: /Question 1/i });
    await user.click(btn);
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  covers('accordion', 'single-collapse-other')('collapses previously open item when multi is false', async () => {
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

  covers('accordion', 'multi-expand')('allows multiple open items when multi is true', async () => {
    const user = userEvent.setup();
    render({
      components: { AtlAccordionGroup, AtlAccordionItem },
      template: `
        <AtlAccordionGroup :multi="true">
          <AtlAccordionItem><template #header>Q1</template>A1</AtlAccordionItem>
          <AtlAccordionItem><template #header>Q2</template>A2</AtlAccordionItem>
        </AtlAccordionGroup>
      `,
    });
    const btn1 = screen.getByRole('button', { name: /Q1/i });
    const btn2 = screen.getByRole('button', { name: /Q2/i });
    await user.click(btn1);
    await user.click(btn2);
    expect(btn1).toHaveAttribute('aria-expanded', 'true');
    expect(btn2).toHaveAttribute('aria-expanded', 'true');
  });

  covers('accordion', 'disabled-no-toggle')('does not expand a disabled item', async () => {
    render({
      components: { AtlAccordionGroup, AtlAccordionItem },
      template: `
        <AtlAccordionGroup>
          <AtlAccordionItem :disabled="true"><template #header>Disabled Q</template>Answer</AtlAccordionItem>
        </AtlAccordionGroup>
      `,
    });
    const btn = screen.getByRole('button', { name: /Disabled Q/i });
    expect(btn).toBeDisabled();
  });

  it('applies variant class to group', () => {
    const { container } = render({
      components: { AtlAccordionGroup, AtlAccordionItem },
      template: `<AtlAccordionGroup variant="separated"><AtlAccordionItem><template #header>H</template>B</AtlAccordionItem></AtlAccordionGroup>`,
    });
    expect(container.querySelector('.atl-accordion-group')).toHaveClass('variant-separated');
  });
});
