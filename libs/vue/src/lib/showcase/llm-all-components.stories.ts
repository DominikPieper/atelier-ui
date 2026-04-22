import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { onMounted, onUnmounted, ref } from 'vue';
import LlmAccordionGroup from '../accordion/llm-accordion-group.vue';
import LlmAccordionItem from '../accordion/llm-accordion-item.vue';
import LlmAccordionHeader from '../accordion/llm-accordion-header.vue';
import LlmAlert from '../alert/llm-alert.vue';
import LlmAvatar from '../avatar/llm-avatar.vue';
import LlmAvatarGroup from '../avatar/llm-avatar-group.vue';
import LlmBadge from '../badge/llm-badge.vue';
import LlmBreadcrumbs from '../breadcrumbs/llm-breadcrumbs.vue';
import LlmBreadcrumbItem from '../breadcrumbs/llm-breadcrumb-item.vue';
import LlmButton from '../button/llm-button.vue';
import LlmCard from '../card/llm-card.vue';
import LlmCardHeader from '../card/llm-card-header.vue';
import LlmCardContent from '../card/llm-card-content.vue';
import LlmCardFooter from '../card/llm-card-footer.vue';
import LlmCheckbox from '../checkbox/llm-checkbox.vue';
import LlmDialog from '../dialog/llm-dialog.vue';
import LlmDialogHeader from '../dialog/llm-dialog-header.vue';
import LlmDialogContent from '../dialog/llm-dialog-content.vue';
import LlmDialogFooter from '../dialog/llm-dialog-footer.vue';
import LlmDrawer from '../drawer/llm-drawer.vue';
import LlmDrawerHeader from '../drawer/llm-drawer-header.vue';
import LlmDrawerContent from '../drawer/llm-drawer-content.vue';
import LlmDrawerFooter from '../drawer/llm-drawer-footer.vue';
import LlmInput from '../input/llm-input.vue';
import LlmMenu from '../menu/llm-menu.vue';
import LlmMenuItem from '../menu/llm-menu-item.vue';
import LlmMenuSeparator from '../menu/llm-menu-separator.vue';
import LlmMenuTrigger from '../menu/llm-menu-trigger.vue';
import LlmPagination from '../pagination/llm-pagination.vue';
import LlmProgress from '../progress/llm-progress.vue';
import LlmRadioGroup from '../radio-group/llm-radio-group.vue';
import LlmRadio from '../radio/llm-radio.vue';
import LlmSelect from '../select/llm-select.vue';
import LlmOption from '../select/llm-option.vue';
import LlmSkeleton from '../skeleton/llm-skeleton.vue';
import LlmTabGroup from '../tabs/llm-tab-group.vue';
import LlmTab from '../tabs/llm-tab.vue';
import LlmTextarea from '../textarea/llm-textarea.vue';
import LlmToggle from '../toggle/llm-toggle.vue';

const meta: Meta = {
  title: 'Showcase/All Components',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

export const AllComponents: Story = {
  render: () => ({
    components: {
      LlmAccordionGroup, LlmAccordionItem, LlmAccordionHeader,
      LlmAlert,
      LlmAvatar, LlmAvatarGroup,
      LlmBadge,
      LlmBreadcrumbs, LlmBreadcrumbItem,
      LlmButton,
      LlmCard, LlmCardHeader, LlmCardContent, LlmCardFooter,
      LlmCheckbox,
      LlmDialog, LlmDialogHeader, LlmDialogContent, LlmDialogFooter,
      LlmDrawer, LlmDrawerHeader, LlmDrawerContent, LlmDrawerFooter,
      LlmInput,
      LlmMenu, LlmMenuItem, LlmMenuSeparator, LlmMenuTrigger,
      LlmPagination,
      LlmProgress,
      LlmRadioGroup, LlmRadio,
      LlmSelect, LlmOption,
      LlmSkeleton,
      LlmTabGroup, LlmTab,
      LlmTextarea,
      LlmToggle,
    },
    setup() {
      const dialogOpen = ref(false);
      const drawerOpen = ref(false);
      const checkboxChecked = ref(false);
      const toggleOn = ref(true);
      const radioValue = ref('pro');
      const selectValue = ref('');
      const inputValue = ref('');
      const textareaValue = ref('');
      const page = ref(3);
      const tabIndex = ref(0);
      const cardVariants = ['elevated', 'outlined', 'flat'] as const;

      let styleEl: HTMLStyleElement | null = null;
      onMounted(() => {
        styleEl = document.createElement('style');
        styleEl.setAttribute('data-llm-showcase', '');
        styleEl.textContent = `
          .llm-showcase h1,
          .llm-showcase h2,
          .llm-showcase p { color: var(--ui-color-text); }
          .llm-showcase .section-title {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--ui-color-border);
            color: var(--ui-color-text);
            letter-spacing: -0.01em;
          }
          .llm-showcase .section-body {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }
          .llm-showcase .row {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            flex-wrap: wrap;
          }
        `;
        document.head.appendChild(styleEl);
      });
      onUnmounted(() => {
        styleEl?.remove();
      });

      return {
        dialogOpen, drawerOpen, checkboxChecked, toggleOn, radioValue,
        selectValue, inputValue, textareaValue, page, tabIndex, cardVariants,
      };
    },
    template: `
      <div class="llm-showcase" style="max-width: 860px; margin: 0 auto; padding: 2rem 1.5rem;">
        <header style="margin-bottom: 3rem;">
          <h1 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 0.25rem; letter-spacing: -0.02em;">
            Component Showcase
          </h1>
          <p style="color: var(--ui-color-text-muted); font-size: 0.9rem;">
            All available Vue components at a glance.
          </p>
        </header>

        <!-- Button -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Button</h2>
          <div class="section-body">
            <div class="row">
              <LlmButton variant="primary">Primary</LlmButton>
              <LlmButton variant="secondary">Secondary</LlmButton>
              <LlmButton variant="outline">Outline</LlmButton>
              <LlmButton variant="primary" :disabled="true">Disabled</LlmButton>
              <LlmButton variant="primary" :loading="true">Loading</LlmButton>
            </div>
            <div class="row">
              <LlmButton size="sm">Small</LlmButton>
              <LlmButton size="md">Medium</LlmButton>
              <LlmButton size="lg">Large</LlmButton>
            </div>
          </div>
        </section>

        <!-- Badge -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Badge</h2>
          <div class="section-body">
            <div class="row">
              <LlmBadge variant="default">Default</LlmBadge>
              <LlmBadge variant="success">Success</LlmBadge>
              <LlmBadge variant="warning">Warning</LlmBadge>
              <LlmBadge variant="danger">Danger</LlmBadge>
              <LlmBadge variant="info">Info</LlmBadge>
              <LlmBadge variant="success" size="sm">Small</LlmBadge>
            </div>
          </div>
        </section>

        <!-- Avatar -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Avatar &amp; AvatarGroup</h2>
          <div class="section-body">
            <div class="row">
              <LlmAvatar name="Alice Chen" size="xs" />
              <LlmAvatar name="Bob Smith" size="sm" status="online" />
              <LlmAvatar name="Carol Jones" size="md" status="away" />
              <LlmAvatar name="Dave Brown" size="lg" shape="square" />
              <LlmAvatar name="Eve Wilson" size="xl" status="busy" />
            </div>
            <div class="row">
              <LlmAvatarGroup :max="3" size="md">
                <LlmAvatar name="Alice Chen" />
                <LlmAvatar name="Bob Smith" />
                <LlmAvatar name="Carol Jones" />
                <LlmAvatar name="Dave Brown" />
                <LlmAvatar name="Eve Wilson" />
              </LlmAvatarGroup>
            </div>
          </div>
        </section>

        <!-- Alert -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Alert</h2>
          <div class="section-body">
            <LlmAlert variant="info">This is an info alert.</LlmAlert>
            <LlmAlert variant="success">Your changes were saved successfully.</LlmAlert>
            <LlmAlert variant="warning">Your session will expire in 5 minutes.</LlmAlert>
            <LlmAlert variant="danger">Something went wrong. Please try again.</LlmAlert>
            <LlmAlert variant="info" :dismissible="true">This alert can be dismissed.</LlmAlert>
          </div>
        </section>

        <!-- Card -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Card</h2>
          <div class="section-body">
            <div class="row" style="align-items: stretch; flex-wrap: wrap;">
              <LlmCard v-for="v in cardVariants" :key="v" :variant="v" padding="md" style="flex: 1; min-width: 180px;">
                <LlmCardHeader>{{ v.charAt(0).toUpperCase() + v.slice(1) }}</LlmCardHeader>
                <LlmCardContent>Card content goes here.</LlmCardContent>
                <LlmCardFooter>
                  <LlmButton size="sm">Action</LlmButton>
                </LlmCardFooter>
              </LlmCard>
            </div>
          </div>
        </section>

        <!-- Input -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Input</h2>
          <div class="section-body">
            <div class="row">
              <div style="flex: 1; min-width: 180px;">
                <LlmInput placeholder="Text input" :value="inputValue" @update:value="inputValue = $event" />
              </div>
              <div style="flex: 1; min-width: 180px;">
                <LlmInput type="email" placeholder="Email input" />
              </div>
              <div style="flex: 1; min-width: 180px;">
                <LlmInput placeholder="Invalid state" :invalid="true" />
              </div>
            </div>
          </div>
        </section>

        <!-- Textarea -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Textarea</h2>
          <div class="section-body">
            <LlmTextarea placeholder="Write something here…" :rows="3" :value="textareaValue" @update:value="textareaValue = $event" />
            <LlmTextarea placeholder="Auto-resize" :autoResize="true" />
          </div>
        </section>

        <!-- Checkbox -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Checkbox</h2>
          <div class="section-body">
            <div class="row">
              <LlmCheckbox :checked="checkboxChecked" @update:checked="checkboxChecked = $event">Accept terms and conditions</LlmCheckbox>
              <LlmCheckbox :checked="true" :indeterminate="true">Indeterminate</LlmCheckbox>
              <LlmCheckbox :checked="true" :disabled="true">Disabled</LlmCheckbox>
            </div>
          </div>
        </section>

        <!-- Toggle -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Toggle</h2>
          <div class="section-body">
            <div class="row">
              <LlmToggle :checked="toggleOn" @update:checked="toggleOn = $event">Enable notifications</LlmToggle>
              <LlmToggle :checked="false" :disabled="true">Disabled</LlmToggle>
            </div>
          </div>
        </section>

        <!-- RadioGroup -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">RadioGroup</h2>
          <div class="section-body">
            <LlmRadioGroup :value="radioValue" @update:value="radioValue = $event" name="plan">
              <div class="row">
                <LlmRadio radioValue="free">Free</LlmRadio>
                <LlmRadio radioValue="pro">Pro</LlmRadio>
                <LlmRadio radioValue="enterprise">Enterprise</LlmRadio>
                <LlmRadio radioValue="legacy" :disabled="true">Legacy (disabled)</LlmRadio>
              </div>
            </LlmRadioGroup>
          </div>
        </section>

        <!-- Select -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Select</h2>
          <div class="section-body">
            <div style="max-width: 300px;">
              <LlmSelect :value="selectValue" @update:value="selectValue = $event" placeholder="Select a country">
                <LlmOption optionValue="us">United States</LlmOption>
                <LlmOption optionValue="ca">Canada</LlmOption>
                <LlmOption optionValue="uk">United Kingdom</LlmOption>
                <LlmOption optionValue="de">Germany</LlmOption>
                <LlmOption optionValue="jp" :disabled="true">Japan (unavailable)</LlmOption>
              </LlmSelect>
            </div>
          </div>
        </section>

        <!-- Progress -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Progress</h2>
          <div class="section-body">
            <LlmProgress :value="20" />
            <LlmProgress :value="50" variant="success" />
            <LlmProgress :value="75" variant="warning" />
            <LlmProgress :value="90" variant="danger" size="lg" />
            <LlmProgress :indeterminate="true" />
          </div>
        </section>

        <!-- Skeleton -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Skeleton</h2>
          <div class="section-body">
            <div style="display: flex; gap: 1rem; align-items: center;">
              <LlmSkeleton variant="circular" width="48px" />
              <div style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem;">
                <LlmSkeleton variant="text" width="40%" />
                <LlmSkeleton variant="text" />
                <LlmSkeleton variant="text" width="70%" />
              </div>
            </div>
            <LlmSkeleton variant="rectangular" height="80px" />
          </div>
        </section>

        <!-- Tabs -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Tabs</h2>
          <div class="section-body">
            <LlmTabGroup :selectedIndex="tabIndex" @update:selectedIndex="tabIndex = $event">
              <LlmTab label="Overview">Overview — general information about the item.</LlmTab>
              <LlmTab label="Details">Detailed specifications and technical information.</LlmTab>
              <LlmTab label="History">Historical records and activity log.</LlmTab>
              <LlmTab label="Disabled" :disabled="true">Not accessible.</LlmTab>
            </LlmTabGroup>
            <LlmTabGroup variant="pills">
              <LlmTab label="All">All items shown here.</LlmTab>
              <LlmTab label="Active">Only active items.</LlmTab>
              <LlmTab label="Archived">Archived items.</LlmTab>
            </LlmTabGroup>
          </div>
        </section>

        <!-- Accordion -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Accordion</h2>
          <div class="section-body">
            <LlmAccordionGroup variant="bordered">
              <LlmAccordionItem>
                <template #header><LlmAccordionHeader>What is this component library?</LlmAccordionHeader></template>
                A set of accessible, composable UI components built for LLM-generated applications.
              </LlmAccordionItem>
              <LlmAccordionItem>
                <template #header><LlmAccordionHeader>How do I get started?</LlmAccordionHeader></template>
                Import any component from <code>@atelier-ui/vue</code>.
              </LlmAccordionItem>
              <LlmAccordionItem :disabled="true">
                <template #header><LlmAccordionHeader>Disabled section</LlmAccordionHeader></template>
                This is not accessible.
              </LlmAccordionItem>
            </LlmAccordionGroup>
          </div>
        </section>

        <!-- Breadcrumbs -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Breadcrumbs</h2>
          <div class="section-body">
            <LlmBreadcrumbs>
              <LlmBreadcrumbItem href="#">Home</LlmBreadcrumbItem>
              <LlmBreadcrumbItem href="#">Products</LlmBreadcrumbItem>
              <LlmBreadcrumbItem href="#">Category</LlmBreadcrumbItem>
              <LlmBreadcrumbItem>Current Page</LlmBreadcrumbItem>
            </LlmBreadcrumbs>
          </div>
        </section>

        <!-- Pagination -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Pagination</h2>
          <div class="section-body">
            <LlmPagination :page="page" @update:page="page = $event" :pageCount="10" />
          </div>
        </section>

        <!-- Menu -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Menu</h2>
          <div class="section-body">
            <div class="row">
              <LlmMenuTrigger>
                <template #trigger>
                  <LlmButton variant="outline" size="sm">Open Menu ▾</LlmButton>
                </template>
                <template #menu>
                  <LlmMenu>
                    <LlmMenuItem>Edit</LlmMenuItem>
                    <LlmMenuItem>Duplicate</LlmMenuItem>
                    <LlmMenuSeparator />
                    <LlmMenuItem>Archive</LlmMenuItem>
                    <LlmMenuItem :disabled="true">Delete (disabled)</LlmMenuItem>
                  </LlmMenu>
                </template>
              </LlmMenuTrigger>
            </div>
          </div>
        </section>

        <!-- Dialog -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Dialog</h2>
          <div class="section-body">
            <div class="row">
              <LlmButton @click="dialogOpen = true">Open Dialog</LlmButton>
            </div>
            <LlmDialog :open="dialogOpen" @update:open="dialogOpen = $event" size="sm">
              <LlmDialogHeader>Confirm Action</LlmDialogHeader>
              <LlmDialogContent>Are you sure you want to proceed? This action cannot be undone.</LlmDialogContent>
              <LlmDialogFooter>
                <LlmButton variant="outline" @click="dialogOpen = false">Cancel</LlmButton>
                <LlmButton variant="primary" @click="dialogOpen = false">Confirm</LlmButton>
              </LlmDialogFooter>
            </LlmDialog>
          </div>
        </section>

        <!-- Drawer -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Drawer</h2>
          <div class="section-body">
            <div class="row">
              <LlmButton variant="outline" @click="drawerOpen = true">Open Drawer</LlmButton>
            </div>
            <LlmDrawer :open="drawerOpen" @update:open="drawerOpen = $event" position="right" size="md">
              <LlmDrawerHeader>Settings Panel</LlmDrawerHeader>
              <LlmDrawerContent>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                  <LlmInput placeholder="Display name" />
                  <LlmToggle :checked="toggleOn" @update:checked="toggleOn = $event">Email notifications</LlmToggle>
                  <LlmToggle :checked="false">Push notifications</LlmToggle>
                </div>
              </LlmDrawerContent>
              <LlmDrawerFooter>
                <LlmButton variant="outline" @click="drawerOpen = false">Cancel</LlmButton>
                <LlmButton @click="drawerOpen = false">Save</LlmButton>
              </LlmDrawerFooter>
            </LlmDrawer>
          </div>
        </section>
      </div>
    `,
  }),
};
