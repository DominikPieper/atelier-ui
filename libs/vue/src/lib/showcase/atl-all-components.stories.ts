import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { onMounted, onUnmounted, ref } from 'vue';
import AtlAccordionGroup from '../accordion/atl-accordion-group.vue';
import AtlAccordionItem from '../accordion/atl-accordion-item.vue';
import AtlAccordionHeader from '../accordion/atl-accordion-header.vue';
import AtlAlert from '../alert/atl-alert.vue';
import AtlAvatar from '../avatar/atl-avatar.vue';
import AtlAvatarGroup from '../avatar/atl-avatar-group.vue';
import AtlBadge from '../badge/atl-badge.vue';
import AtlBreadcrumbs from '../breadcrumbs/atl-breadcrumbs.vue';
import AtlBreadcrumbItem from '../breadcrumbs/atl-breadcrumb-item.vue';
import AtlButton from '../button/atl-button.vue';
import AtlCard from '../card/atl-card.vue';
import AtlCardHeader from '../card/atl-card-header.vue';
import AtlCardContent from '../card/atl-card-content.vue';
import AtlCardFooter from '../card/atl-card-footer.vue';
import AtlCheckbox from '../checkbox/atl-checkbox.vue';
import AtlDialog from '../dialog/atl-dialog.vue';
import AtlDialogHeader from '../dialog/atl-dialog-header.vue';
import AtlDialogContent from '../dialog/atl-dialog-content.vue';
import AtlDialogFooter from '../dialog/atl-dialog-footer.vue';
import AtlDrawer from '../drawer/atl-drawer.vue';
import AtlDrawerHeader from '../drawer/atl-drawer-header.vue';
import AtlDrawerContent from '../drawer/atl-drawer-content.vue';
import AtlDrawerFooter from '../drawer/atl-drawer-footer.vue';
import AtlInput from '../input/atl-input.vue';
import AtlMenu from '../menu/atl-menu.vue';
import AtlMenuItem from '../menu/atl-menu-item.vue';
import AtlMenuSeparator from '../menu/atl-menu-separator.vue';
import AtlMenuTrigger from '../menu/atl-menu-trigger.vue';
import AtlPagination from '../pagination/atl-pagination.vue';
import AtlProgress from '../progress/atl-progress.vue';
import AtlRadioGroup from '../radio-group/atl-radio-group.vue';
import AtlRadio from '../radio/atl-radio.vue';
import AtlSelect from '../select/atl-select.vue';
import AtlOption from '../select/atl-option.vue';
import AtlSkeleton from '../skeleton/atl-skeleton.vue';
import AtlTabGroup from '../tabs/atl-tab-group.vue';
import AtlTab from '../tabs/atl-tab.vue';
import AtlTextarea from '../textarea/atl-textarea.vue';
import AtlToggle from '../toggle/atl-toggle.vue';

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
      AtlAccordionGroup, AtlAccordionItem, AtlAccordionHeader,
      AtlAlert,
      AtlAvatar, AtlAvatarGroup,
      AtlBadge,
      AtlBreadcrumbs, AtlBreadcrumbItem,
      AtlButton,
      AtlCard, AtlCardHeader, AtlCardContent, AtlCardFooter,
      AtlCheckbox,
      AtlDialog, AtlDialogHeader, AtlDialogContent, AtlDialogFooter,
      AtlDrawer, AtlDrawerHeader, AtlDrawerContent, AtlDrawerFooter,
      AtlInput,
      AtlMenu, AtlMenuItem, AtlMenuSeparator, AtlMenuTrigger,
      AtlPagination,
      AtlProgress,
      AtlRadioGroup, AtlRadio,
      AtlSelect, AtlOption,
      AtlSkeleton,
      AtlTabGroup, AtlTab,
      AtlTextarea,
      AtlToggle,
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
        styleEl.setAttribute('data-atl-showcase', '');
        styleEl.textContent = `
          .atl-showcase h1,
          .atl-showcase h2,
          .atl-showcase p { color: var(--ui-color-text); }
          .atl-showcase .section-title {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--ui-color-border);
            color: var(--ui-color-text);
            letter-spacing: -0.01em;
          }
          .atl-showcase .section-body {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }
          .atl-showcase .row {
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
      <div class="atl-showcase" style="max-width: 860px; margin: 0 auto; padding: 2rem 1.5rem;">
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
              <AtlButton variant="primary">Primary</AtlButton>
              <AtlButton variant="secondary">Secondary</AtlButton>
              <AtlButton variant="outline">Outline</AtlButton>
              <AtlButton variant="primary" :disabled="true">Disabled</AtlButton>
              <AtlButton variant="primary" :loading="true">Loading</AtlButton>
            </div>
            <div class="row">
              <AtlButton size="sm">Small</AtlButton>
              <AtlButton size="md">Medium</AtlButton>
              <AtlButton size="lg">Large</AtlButton>
            </div>
          </div>
        </section>

        <!-- Badge -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Badge</h2>
          <div class="section-body">
            <div class="row">
              <AtlBadge variant="default">Default</AtlBadge>
              <AtlBadge variant="success">Success</AtlBadge>
              <AtlBadge variant="warning">Warning</AtlBadge>
              <AtlBadge variant="danger">Danger</AtlBadge>
              <AtlBadge variant="info">Info</AtlBadge>
              <AtlBadge variant="success" size="sm">Small</AtlBadge>
            </div>
          </div>
        </section>

        <!-- Avatar -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Avatar &amp; AvatarGroup</h2>
          <div class="section-body">
            <div class="row">
              <AtlAvatar name="Alice Chen" size="xs" />
              <AtlAvatar name="Bob Smith" size="sm" status="online" />
              <AtlAvatar name="Carol Jones" size="md" status="away" />
              <AtlAvatar name="Dave Brown" size="lg" shape="square" />
              <AtlAvatar name="Eve Wilson" size="xl" status="busy" />
            </div>
            <div class="row">
              <AtlAvatarGroup :max="3" size="md">
                <AtlAvatar name="Alice Chen" />
                <AtlAvatar name="Bob Smith" />
                <AtlAvatar name="Carol Jones" />
                <AtlAvatar name="Dave Brown" />
                <AtlAvatar name="Eve Wilson" />
              </AtlAvatarGroup>
            </div>
          </div>
        </section>

        <!-- Alert -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Alert</h2>
          <div class="section-body">
            <AtlAlert variant="info">This is an info alert.</AtlAlert>
            <AtlAlert variant="success">Your changes were saved successfully.</AtlAlert>
            <AtlAlert variant="warning">Your session will expire in 5 minutes.</AtlAlert>
            <AtlAlert variant="danger">Something went wrong. Please try again.</AtlAlert>
            <AtlAlert variant="info" :dismissible="true">This alert can be dismissed.</AtlAlert>
          </div>
        </section>

        <!-- Card -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Card</h2>
          <div class="section-body">
            <div class="row" style="align-items: stretch; flex-wrap: wrap;">
              <AtlCard v-for="v in cardVariants" :key="v" :variant="v" padding="md" style="flex: 1; min-width: 180px;">
                <AtlCardHeader>{{ v.charAt(0).toUpperCase() + v.slice(1) }}</AtlCardHeader>
                <AtlCardContent>Card content goes here.</AtlCardContent>
                <AtlCardFooter>
                  <AtlButton size="sm">Action</AtlButton>
                </AtlCardFooter>
              </AtlCard>
            </div>
          </div>
        </section>

        <!-- Input -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Input</h2>
          <div class="section-body">
            <div class="row">
              <div style="flex: 1; min-width: 180px;">
                <AtlInput placeholder="Text input" :value="inputValue" @update:value="inputValue = $event" />
              </div>
              <div style="flex: 1; min-width: 180px;">
                <AtlInput type="email" placeholder="Email input" />
              </div>
              <div style="flex: 1; min-width: 180px;">
                <AtlInput placeholder="Invalid state" :invalid="true" />
              </div>
            </div>
          </div>
        </section>

        <!-- Textarea -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Textarea</h2>
          <div class="section-body">
            <AtlTextarea placeholder="Write something here…" :rows="3" :value="textareaValue" @update:value="textareaValue = $event" />
            <AtlTextarea placeholder="Auto-resize" :autoResize="true" />
          </div>
        </section>

        <!-- Checkbox -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Checkbox</h2>
          <div class="section-body">
            <div class="row">
              <AtlCheckbox :checked="checkboxChecked" @update:checked="checkboxChecked = $event">Accept terms and conditions</AtlCheckbox>
              <AtlCheckbox :checked="true" :indeterminate="true">Indeterminate</AtlCheckbox>
              <AtlCheckbox :checked="true" :disabled="true">Disabled</AtlCheckbox>
            </div>
          </div>
        </section>

        <!-- Toggle -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Toggle</h2>
          <div class="section-body">
            <div class="row">
              <AtlToggle :checked="toggleOn" @update:checked="toggleOn = $event">Enable notifications</AtlToggle>
              <AtlToggle :checked="false" :disabled="true">Disabled</AtlToggle>
            </div>
          </div>
        </section>

        <!-- RadioGroup -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">RadioGroup</h2>
          <div class="section-body">
            <AtlRadioGroup :value="radioValue" @update:value="radioValue = $event" name="plan">
              <div class="row">
                <AtlRadio radioValue="free">Free</AtlRadio>
                <AtlRadio radioValue="pro">Pro</AtlRadio>
                <AtlRadio radioValue="enterprise">Enterprise</AtlRadio>
                <AtlRadio radioValue="legacy" :disabled="true">Legacy (disabled)</AtlRadio>
              </div>
            </AtlRadioGroup>
          </div>
        </section>

        <!-- Select -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Select</h2>
          <div class="section-body">
            <div style="max-width: 300px;">
              <AtlSelect :value="selectValue" @update:value="selectValue = $event" placeholder="Select a country">
                <AtlOption optionValue="us">United States</AtlOption>
                <AtlOption optionValue="ca">Canada</AtlOption>
                <AtlOption optionValue="uk">United Kingdom</AtlOption>
                <AtlOption optionValue="de">Germany</AtlOption>
                <AtlOption optionValue="jp" :disabled="true">Japan (unavailable)</AtlOption>
              </AtlSelect>
            </div>
          </div>
        </section>

        <!-- Progress -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Progress</h2>
          <div class="section-body">
            <AtlProgress :value="20" />
            <AtlProgress :value="50" variant="success" />
            <AtlProgress :value="75" variant="warning" />
            <AtlProgress :value="90" variant="danger" size="lg" />
            <AtlProgress :indeterminate="true" />
          </div>
        </section>

        <!-- Skeleton -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Skeleton</h2>
          <div class="section-body">
            <div style="display: flex; gap: 1rem; align-items: center;">
              <AtlSkeleton variant="circular" width="48px" />
              <div style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem;">
                <AtlSkeleton variant="text" width="40%" />
                <AtlSkeleton variant="text" />
                <AtlSkeleton variant="text" width="70%" />
              </div>
            </div>
            <AtlSkeleton variant="rectangular" height="80px" />
          </div>
        </section>

        <!-- Tabs -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Tabs</h2>
          <div class="section-body">
            <AtlTabGroup :selectedIndex="tabIndex" @update:selectedIndex="tabIndex = $event">
              <AtlTab label="Overview">Overview — general information about the item.</AtlTab>
              <AtlTab label="Details">Detailed specifications and technical information.</AtlTab>
              <AtlTab label="History">Historical records and activity log.</AtlTab>
              <AtlTab label="Disabled" :disabled="true">Not accessible.</AtlTab>
            </AtlTabGroup>
            <AtlTabGroup variant="pills">
              <AtlTab label="All">All items shown here.</AtlTab>
              <AtlTab label="Active">Only active items.</AtlTab>
              <AtlTab label="Archived">Archived items.</AtlTab>
            </AtlTabGroup>
          </div>
        </section>

        <!-- Accordion -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Accordion</h2>
          <div class="section-body">
            <AtlAccordionGroup variant="bordered">
              <AtlAccordionItem>
                <template #header><AtlAccordionHeader>What is this component library?</AtlAccordionHeader></template>
                A set of accessible, composable UI components built for LLM-generated applications.
              </AtlAccordionItem>
              <AtlAccordionItem>
                <template #header><AtlAccordionHeader>How do I get started?</AtlAccordionHeader></template>
                Import any component from <code>@atelier-ui/vue</code>.
              </AtlAccordionItem>
              <AtlAccordionItem :disabled="true">
                <template #header><AtlAccordionHeader>Disabled section</AtlAccordionHeader></template>
                This is not accessible.
              </AtlAccordionItem>
            </AtlAccordionGroup>
          </div>
        </section>

        <!-- Breadcrumbs -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Breadcrumbs</h2>
          <div class="section-body">
            <AtlBreadcrumbs>
              <AtlBreadcrumbItem href="#">Home</AtlBreadcrumbItem>
              <AtlBreadcrumbItem href="#">Products</AtlBreadcrumbItem>
              <AtlBreadcrumbItem href="#">Category</AtlBreadcrumbItem>
              <AtlBreadcrumbItem>Current Page</AtlBreadcrumbItem>
            </AtlBreadcrumbs>
          </div>
        </section>

        <!-- Pagination -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Pagination</h2>
          <div class="section-body">
            <AtlPagination :page="page" @update:page="page = $event" :pageCount="10" />
          </div>
        </section>

        <!-- Menu -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Menu</h2>
          <div class="section-body">
            <div class="row">
              <AtlMenuTrigger>
                <template #trigger>
                  <AtlButton variant="outline" size="sm">Open Menu ▾</AtlButton>
                </template>
                <template #menu>
                  <AtlMenu>
                    <AtlMenuItem>Edit</AtlMenuItem>
                    <AtlMenuItem>Duplicate</AtlMenuItem>
                    <AtlMenuSeparator />
                    <AtlMenuItem>Archive</AtlMenuItem>
                    <AtlMenuItem :disabled="true">Delete (disabled)</AtlMenuItem>
                  </AtlMenu>
                </template>
              </AtlMenuTrigger>
            </div>
          </div>
        </section>

        <!-- Dialog -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Dialog</h2>
          <div class="section-body">
            <div class="row">
              <AtlButton @click="dialogOpen = true">Open Dialog</AtlButton>
            </div>
            <AtlDialog :open="dialogOpen" @update:open="dialogOpen = $event" size="sm">
              <AtlDialogHeader>Confirm Action</AtlDialogHeader>
              <AtlDialogContent>Are you sure you want to proceed? This action cannot be undone.</AtlDialogContent>
              <AtlDialogFooter>
                <AtlButton variant="outline" @click="dialogOpen = false">Cancel</AtlButton>
                <AtlButton variant="primary" @click="dialogOpen = false">Confirm</AtlButton>
              </AtlDialogFooter>
            </AtlDialog>
          </div>
        </section>

        <!-- Drawer -->
        <section style="margin-bottom: 3rem;">
          <h2 class="section-title">Drawer</h2>
          <div class="section-body">
            <div class="row">
              <AtlButton variant="outline" @click="drawerOpen = true">Open Drawer</AtlButton>
            </div>
            <AtlDrawer :open="drawerOpen" @update:open="drawerOpen = $event" position="right" size="md">
              <AtlDrawerHeader>Settings Panel</AtlDrawerHeader>
              <AtlDrawerContent>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                  <AtlInput placeholder="Display name" />
                  <AtlToggle :checked="toggleOn" @update:checked="toggleOn = $event">Email notifications</AtlToggle>
                  <AtlToggle :checked="false">Push notifications</AtlToggle>
                </div>
              </AtlDrawerContent>
              <AtlDrawerFooter>
                <AtlButton variant="outline" @click="drawerOpen = false">Cancel</AtlButton>
                <AtlButton @click="drawerOpen = false">Save</AtlButton>
              </AtlDrawerFooter>
            </AtlDrawer>
          </div>
        </section>
      </div>
    `,
  }),
};
