import type { Meta } from '@storybook/vue3-vite';
import { ref } from 'vue';
import LlmCard from '../card/llm-card.vue';
import LlmCardHeader from '../card/llm-card-header.vue';
import LlmCardContent from '../card/llm-card-content.vue';
import LlmCardFooter from '../card/llm-card-footer.vue';
import LlmButton from '../button/llm-button.vue';
import LlmInput from '../input/llm-input.vue';
import LlmCheckbox from '../checkbox/llm-checkbox.vue';
import LlmTabGroup from '../tabs/llm-tab-group.vue';
import LlmTab from '../tabs/llm-tab.vue';
import LlmToggle from '../toggle/llm-toggle.vue';
import LlmSelect from '../select/llm-select.vue';
import LlmOption from '../select/llm-option.vue';
import LlmDialog from '../dialog/llm-dialog.vue';
import LlmDialogHeader from '../dialog/llm-dialog-header.vue';
import LlmDialogContent from '../dialog/llm-dialog-content.vue';
import LlmDialogFooter from '../dialog/llm-dialog-footer.vue';
import LlmBadge from '../badge/llm-badge.vue';
import LlmMenuTrigger from '../menu/llm-menu-trigger.vue';
import LlmMenu from '../menu/llm-menu.vue';
import LlmMenuItem from '../menu/llm-menu-item.vue';
import LlmMenuSeparator from '../menu/llm-menu-separator.vue';
import LlmAccordionGroup from '../accordion/llm-accordion-group.vue';
import LlmAccordionItem from '../accordion/llm-accordion-item.vue';
import LlmAccordionHeader from '../accordion/llm-accordion-header.vue';
import LlmAlert from '../alert/llm-alert.vue';

const meta: Meta = {
  title: 'Cookbook',
  tags: ['autodocs'],
};

export default meta;

// ─── Login Form ───────────────────────────────────────────────────────────────

export const LoginForm = {
  render: () => ({
    components: { LlmCard, LlmCardHeader, LlmCardContent, LlmCardFooter, LlmButton, LlmInput, LlmCheckbox },
    setup() {
      const email = ref('');
      const password = ref('');
      const remember = ref(false);
      const loading = ref(false);

      function signIn() {
        loading.value = true;
        setTimeout(() => {
          loading.value = false;
        }, 1500);
      }

      return { email, password, remember, loading, signIn };
    },
    template: `
      <LlmCard variant="elevated" padding="lg" style="max-width:400px;margin:2rem auto">
        <LlmCardHeader>Sign in</LlmCardHeader>
        <LlmCardContent style="display:flex;flex-direction:column;gap:1rem">
          <LlmInput
            type="email"
            placeholder="you@example.com"
            :value="email"
            @update:value="email = $event"
          />
          <LlmInput
            type="password"
            placeholder="Password"
            :value="password"
            @update:value="password = $event"
          />
          <LlmCheckbox :checked="remember" @update:checked="remember = $event">
            Remember me
          </LlmCheckbox>
        </LlmCardContent>
        <LlmCardFooter>
          <LlmButton variant="primary" :loading="loading" style="width:100%" @click="signIn">
            Sign in
          </LlmButton>
        </LlmCardFooter>
      </LlmCard>
    `,
  }),
};

// ─── Settings Page ─────────────────────────────────────────────────────────────

export const SettingsPage = {
  render: () => ({
    components: { LlmTabGroup, LlmTab, LlmInput, LlmToggle, LlmSelect, LlmOption, LlmButton },
    setup() {
      const activeTab = ref(0);
      const name = ref('Jane Doe');
      const email = ref('jane@example.com');
      const emailNotifs = ref(true);
      const pushNotifs = ref(false);
      const visibility = ref('public');
      return { activeTab, name, email, emailNotifs, pushNotifs, visibility };
    },
    template: `
      <div style="max-width:600px;margin:2rem auto">
        <LlmTabGroup v-model:selectedIndex="activeTab">
          <LlmTab label="Account">
            <div style="display:flex;flex-direction:column;gap:1rem;padding-top:1rem">
              <LlmInput
                type="text"
                placeholder="Name"
                :value="name"
                @update:value="name = $event"
              />
              <LlmInput
                type="email"
                placeholder="Email"
                :value="email"
                @update:value="email = $event"
              />
            </div>
          </LlmTab>
          <LlmTab label="Notifications">
            <div style="display:flex;flex-direction:column;gap:1rem;padding-top:1rem">
              <LlmToggle :checked="emailNotifs" @update:checked="emailNotifs = $event">
                Email notifications
              </LlmToggle>
              <LlmToggle :checked="pushNotifs" @update:checked="pushNotifs = $event">
                Push notifications
              </LlmToggle>
            </div>
          </LlmTab>
          <LlmTab label="Privacy">
            <div style="padding-top:1rem">
              <LlmSelect
                :value="visibility"
                placeholder="Profile visibility"
                @update:value="visibility = $event"
              >
                <LlmOption optionValue="public">Public</LlmOption>
                <LlmOption optionValue="private">Private</LlmOption>
                <LlmOption optionValue="friends">Friends only</LlmOption>
              </LlmSelect>
            </div>
          </LlmTab>
        </LlmTabGroup>
        <div style="margin-top:1.5rem">
          <LlmButton variant="primary">Save changes</LlmButton>
        </div>
      </div>
    `,
  }),
};

// ─── Confirmation Dialog ───────────────────────────────────────────────────────

export const ConfirmationDialog = {
  render: () => ({
    components: { LlmButton, LlmDialog, LlmDialogHeader, LlmDialogContent, LlmDialogFooter },
    setup() {
      const isOpen = ref(false);
      return { isOpen };
    },
    template: `
      <div>
        <LlmButton variant="primary" @click="isOpen = true">Delete item</LlmButton>
        <LlmDialog v-model:open="isOpen" size="sm">
          <LlmDialogHeader>Confirm Delete</LlmDialogHeader>
          <LlmDialogContent>Are you sure? This action cannot be undone.</LlmDialogContent>
          <LlmDialogFooter>
            <LlmButton variant="outline" @click="isOpen = false">Cancel</LlmButton>
            <LlmButton variant="primary" @click="isOpen = false">Delete</LlmButton>
          </LlmDialogFooter>
        </LlmDialog>
      </div>
    `,
  }),
};

// ─── Data List with Actions ────────────────────────────────────────────────────

export const DataListWithActions = {
  render: () => ({
    components: {
      LlmCard, LlmCardContent, LlmBadge,
      LlmButton, LlmMenuTrigger, LlmMenu, LlmMenuItem, LlmMenuSeparator,
    },
    setup() {
      const items = ref([
        { id: 1, name: 'Project Alpha', status: 'Active', statusVariant: 'success' as const },
        { id: 2, name: 'Project Beta', status: 'Draft', statusVariant: 'default' as const },
        { id: 3, name: 'Project Gamma', status: 'Archived', statusVariant: 'warning' as const },
      ]);

      function deleteItem(id: number) {
        items.value = items.value.filter((i) => i.id !== id);
      }

      return { items, deleteItem };
    },
    template: `
      <div style="max-width:600px;margin:2rem auto;display:flex;flex-direction:column;gap:0.75rem">
        <LlmCard v-for="item in items" :key="item.id" variant="outlined" padding="md">
          <LlmCardContent>
            <div style="display:flex;align-items:center;justify-content:space-between">
              <div style="display:flex;align-items:center;gap:0.75rem">
                <span style="font-weight:500">{{ item.name }}</span>
                <LlmBadge :variant="item.statusVariant">{{ item.status }}</LlmBadge>
              </div>
              <LlmMenuTrigger>
                <template #trigger>
                  <LlmButton variant="outline" size="sm">···</LlmButton>
                </template>
                <template #menu>
                  <LlmMenu>
                    <LlmMenuItem>Edit</LlmMenuItem>
                    <LlmMenuItem>Duplicate</LlmMenuItem>
                    <LlmMenuSeparator />
                    <LlmMenuItem @triggered="deleteItem(item.id)">Delete</LlmMenuItem>
                  </LlmMenu>
                </template>
              </LlmMenuTrigger>
            </div>
          </LlmCardContent>
        </LlmCard>
      </div>
    `,
  }),
};

// ─── Notification Center ───────────────────────────────────────────────────────

export const NotificationCenter = {
  render: () => ({
    components: {
      LlmAccordionGroup, LlmAccordionItem, LlmAccordionHeader,
      LlmAlert, LlmBadge,
    },
    setup() {
      const errors = ref([
        { id: 1, message: 'Database connection failed at 14:32' },
        { id: 2, message: 'API rate limit exceeded for endpoint /users' },
      ]);
      const warnings = ref([
        { id: 3, message: 'Memory usage above 80%' },
      ]);

      function dismiss(id: number) {
        errors.value = errors.value.filter((e) => e.id !== id);
        warnings.value = warnings.value.filter((w) => w.id !== id);
      }

      return { errors, warnings, dismiss };
    },
    template: `
      <div style="max-width:600px;margin:2rem auto">
        <LlmAccordionGroup :multi="true" variant="separated">
          <LlmAccordionItem :expanded="true">
            <template #header>
              <LlmAccordionHeader>
                <span style="display:flex;align-items:center;gap:0.5rem">
                  Errors
                  <LlmBadge variant="danger">{{ errors.length }}</LlmBadge>
                </span>
              </LlmAccordionHeader>
            </template>
            <div style="display:flex;flex-direction:column;gap:0.5rem;padding:0.5rem 0">
              <LlmAlert
                v-for="err in errors"
                :key="err.id"
                variant="danger"
                :dismissible="true"
                @dismissed="dismiss(err.id)"
              >
                {{ err.message }}
              </LlmAlert>
              <p v-if="errors.length === 0" style="color:#888">No errors.</p>
            </div>
          </LlmAccordionItem>
          <LlmAccordionItem>
            <template #header>
              <LlmAccordionHeader>
                <span style="display:flex;align-items:center;gap:0.5rem">
                  Warnings
                  <LlmBadge variant="warning">{{ warnings.length }}</LlmBadge>
                </span>
              </LlmAccordionHeader>
            </template>
            <div style="display:flex;flex-direction:column;gap:0.5rem;padding:0.5rem 0">
              <LlmAlert
                v-for="w in warnings"
                :key="w.id"
                variant="warning"
                :dismissible="true"
                @dismissed="dismiss(w.id)"
              >
                {{ w.message }}
              </LlmAlert>
              <p v-if="warnings.length === 0" style="color:#888">No warnings.</p>
            </div>
          </LlmAccordionItem>
        </LlmAccordionGroup>
      </div>
    `,
  }),
};
