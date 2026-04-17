import type { Framework, ToolDef } from './-mcp.types';

// ─── Tool Definitions ──────────────────────────────────────────────────────────

const ALL_COMPONENT_SLUGS = [
  'button', 'badge', 'input', 'textarea', 'select', 'checkbox', 'toggle',
  'dialog', 'drawer', 'tooltip', 'toast', 'card', 'alert', 'tabs',
  'accordion', 'avatar', 'skeleton', 'progress', 'breadcrumbs', 'pagination', 'menu', 'radio-group',
];

export const TOOL_DEFS: ToolDef[] = [
  {
    name: 'get_component_docs',
    signature: '(component: string)',
    description: 'Returns the full API for a component — inputs, outputs, types, defaults, and integration notes.',
    workshopTip: 'Called when a user asks about a specific component. The AI gets exact prop names, types, and defaults — so it writes correct code instead of guessing the API.',
    params: [{ name: 'component', type: 'string', description: 'Component slug', suggestions: ALL_COMPONENT_SLUGS }],
    defaultParams: { component: 'button' },
  },
  {
    name: 'list_components',
    signature: '()',
    description: 'Returns all available components grouped by category.',
    workshopTip: 'Called at the start of a session or when the user asks "what components are available?". Gives the AI a full map of the library before diving into specifics.',
    params: [],
    defaultParams: {},
  },
  {
    name: 'search_components',
    signature: '(query: string)',
    description: 'Fuzzy-search components by keyword. Returns matching names and descriptions.',
    workshopTip: 'Called when the user expresses an intent ("I need a form input", "show me overlay components") rather than naming a specific component. Helps the AI match need to component.',
    params: [{ name: 'query', type: 'string', description: 'Search term', suggestions: ['form', 'inputs', 'overlay', 'navigation', 'display', 'feedback', 'modal', 'button'] }],
    defaultParams: { query: 'form' },
  },
  {
    name: 'get_stories',
    signature: '(component: string)',
    description: 'Returns Storybook story metadata for a component — names, descriptions, and variant previews.',
    workshopTip: 'Called when the user wants usage examples. The AI reads the story names and descriptions to show real-world patterns instead of inventing examples.',
    params: [{ name: 'component', type: 'string', description: 'Component slug', suggestions: ['button', 'dialog', 'alert', 'card', 'select', 'tabs', 'input', 'badge'] }],
    defaultParams: { component: 'button' },
    supportedFrameworks: ['react', 'vue'],
  },
  {
    name: 'get_theming_guide',
    signature: '()',
    description: 'Returns the full CSS custom property reference, token categories, and dark mode setup.',
    workshopTip: 'Called when the user asks about customising colors, spacing, or dark mode. The AI gets the exact token names and values — no hallucinated CSS variable names.',
    params: [],
    defaultParams: {},
  },
];

// ─── Component Docs ────────────────────────────────────────────────────────────

export const COMP_DOCS: Record<string, Record<Framework, object>> = {
  button: {
    angular: {
      component: 'button', selector: 'llm-button', package: '@atelier-ui/angular', type: 'standalone',
      inputs: { variant: "'primary' | 'secondary' | 'outline' (default: 'primary')", size: "'sm' | 'md' | 'lg' (default: 'md')", disabled: 'boolean (default: false)', loading: 'boolean (default: false)' },
      outputs: { click: 'EventEmitter<void>' },
      content_projection: 'default slot — button label',
    },
    react: {
      component: 'button', element: 'LlmButton', package: '@atelier-ui/react',
      props: { variant: "'primary' | 'secondary' | 'outline' (default: 'primary')", size: "'sm' | 'md' | 'lg' (default: 'md')", disabled: 'boolean (default: false)', loading: 'boolean (default: false)', onClick: '() => void' },
      children: 'ReactNode — button label',
    },
    vue: {
      component: 'button', element: 'LlmButton', package: '@atelier-ui/vue',
      props: { variant: "'primary' | 'secondary' | 'outline' (default: 'primary')", size: "'sm' | 'md' | 'lg' (default: 'md')", disabled: 'boolean (default: false)', loading: 'boolean (default: false)' },
      emits: { click: 'void' }, slots: 'default — button label',
    },
  },
  badge: {
    angular: {
      component: 'badge', selector: 'llm-badge', package: '@atelier-ui/angular', type: 'standalone',
      inputs: { variant: "'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' (default: 'default')", size: "'sm' | 'md' (default: 'md')" },
      content_projection: 'default slot — badge text',
    },
    react: {
      component: 'badge', element: 'LlmBadge', package: '@atelier-ui/react',
      props: { variant: "'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' (default: 'default')", size: "'sm' | 'md' (default: 'md')" },
      children: 'ReactNode — badge text',
    },
    vue: {
      component: 'badge', element: 'LlmBadge', package: '@atelier-ui/vue',
      props: { variant: "'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' (default: 'default')", size: "'sm' | 'md' (default: 'md')" },
      slots: 'default — badge text',
    },
  },
  input: {
    angular: {
      component: 'input', selector: 'llm-input', package: '@atelier-ui/angular', type: 'standalone',
      inputs: { value: 'string (default: "")', type: "'text' | 'email' | 'password' | 'number' | 'tel' (default: 'text')", placeholder: 'string', disabled: 'boolean (default: false)', readonly: 'boolean (default: false)', invalid: 'boolean (default: false)' },
      outputs: { valueChange: 'EventEmitter<string>' },
      form_integration: 'FormValueControl<string> — compatible with Angular Signal Forms',
    },
    react: {
      component: 'input', element: 'LlmInput', package: '@atelier-ui/react',
      props: { value: 'string (default: "")', type: "'text' | 'email' | 'password' | 'number' | 'tel' (default: 'text')", placeholder: 'string', disabled: 'boolean (default: false)', invalid: 'boolean (default: false)', onValueChange: '(value: string) => void' },
    },
    vue: {
      component: 'input', element: 'LlmInput', package: '@atelier-ui/vue',
      props: { type: "'text' | 'email' | 'password' | 'number' | 'tel' (default: 'text')", placeholder: 'string', disabled: 'boolean (default: false)', invalid: 'boolean (default: false)' },
      v_model: 'v-model:value — binds to string',
      emits: { 'update:value': 'string' },
    },
  },
  textarea: {
    angular: {
      component: 'textarea', selector: 'llm-textarea', package: '@atelier-ui/angular', type: 'standalone',
      inputs: { value: 'string (default: "")', rows: 'number (default: 3)', placeholder: 'string', disabled: 'boolean (default: false)', autoResize: 'boolean (default: false)', invalid: 'boolean (default: false)' },
      outputs: { valueChange: 'EventEmitter<string>' },
      form_integration: 'FormValueControl<string>',
    },
    react: {
      component: 'textarea', element: 'LlmTextarea', package: '@atelier-ui/react',
      props: { value: 'string (default: "")', rows: 'number (default: 3)', placeholder: 'string', disabled: 'boolean (default: false)', autoResize: 'boolean (default: false)', invalid: 'boolean (default: false)', onValueChange: '(value: string) => void' },
    },
    vue: {
      component: 'textarea', element: 'LlmTextarea', package: '@atelier-ui/vue',
      props: { rows: 'number (default: 3)', placeholder: 'string', disabled: 'boolean (default: false)', autoResize: 'boolean (default: false)', invalid: 'boolean (default: false)' },
      v_model: 'v-model:value — binds to string',
    },
  },
  select: {
    angular: {
      component: 'select', selector: 'llm-select', package: '@atelier-ui/angular', type: 'standalone',
      inputs: { options: 'Array<{ value: string; label: string }>', value: 'string (default: "")', placeholder: 'string', disabled: 'boolean (default: false)', invalid: 'boolean (default: false)' },
      outputs: { valueChange: 'EventEmitter<string>' },
      form_integration: 'FormValueControl<string>',
      features: ['keyboard navigation', 'searchable', 'ARIA combobox'],
    },
    react: {
      component: 'select', element: 'LlmSelect', package: '@atelier-ui/react',
      props: { options: 'Array<{ value: string; label: string }>', value: 'string (default: "")', placeholder: 'string', disabled: 'boolean (default: false)', invalid: 'boolean (default: false)', onValueChange: '(value: string) => void' },
      features: ['keyboard navigation', 'searchable', 'ARIA combobox'],
    },
    vue: {
      component: 'select', element: 'LlmSelect', package: '@atelier-ui/vue',
      props: { options: 'Array<{ value: string; label: string }>', placeholder: 'string', disabled: 'boolean (default: false)', invalid: 'boolean (default: false)' },
      v_model: 'v-model:value — binds to string',
      features: ['keyboard navigation', 'searchable', 'ARIA combobox'],
    },
  },
  checkbox: {
    angular: {
      component: 'checkbox', selector: 'llm-checkbox', package: '@atelier-ui/angular', type: 'standalone',
      inputs: { checked: 'boolean (default: false)', label: 'string', disabled: 'boolean (default: false)', invalid: 'boolean (default: false)' },
      outputs: { checkedChange: 'EventEmitter<boolean>' },
      form_integration: 'FormCheckboxControl',
    },
    react: {
      component: 'checkbox', element: 'LlmCheckbox', package: '@atelier-ui/react',
      props: { checked: 'boolean (default: false)', label: 'string', disabled: 'boolean (default: false)', invalid: 'boolean (default: false)', onCheckedChange: '(checked: boolean) => void' },
    },
    vue: {
      component: 'checkbox', element: 'LlmCheckbox', package: '@atelier-ui/vue',
      props: { label: 'string', disabled: 'boolean (default: false)', invalid: 'boolean (default: false)' },
      v_model: 'v-model:checked — binds to boolean',
    },
  },
  toggle: {
    angular: {
      component: 'toggle', selector: 'llm-toggle', package: '@atelier-ui/angular', type: 'standalone',
      inputs: { checked: 'boolean (default: false)', label: 'string', disabled: 'boolean (default: false)' },
      outputs: { checkedChange: 'EventEmitter<boolean>' },
      form_integration: 'FormCheckboxControl',
    },
    react: {
      component: 'toggle', element: 'LlmToggle', package: '@atelier-ui/react',
      props: { checked: 'boolean (default: false)', label: 'string', disabled: 'boolean (default: false)', onCheckedChange: '(checked: boolean) => void' },
    },
    vue: {
      component: 'toggle', element: 'LlmToggle', package: '@atelier-ui/vue',
      props: { label: 'string', disabled: 'boolean (default: false)' },
      v_model: 'v-model:checked — binds to boolean',
    },
  },
  dialog: {
    angular: {
      component: 'dialog', selector: 'llm-dialog', package: '@atelier-ui/angular', type: 'standalone',
      inputs: { open: 'boolean (default: false)', size: "'sm' | 'md' | 'lg' (default: 'md')" },
      outputs: { openChange: 'EventEmitter<boolean>' },
      content_projection: { 'llm-dialog-header': 'title area', default: 'body content', 'llm-dialog-footer': 'action buttons' },
    },
    react: {
      component: 'dialog', element: 'LlmDialog', package: '@atelier-ui/react',
      props: { open: 'boolean (default: false)', size: "'sm' | 'md' | 'lg' (default: 'md')", onOpenChange: '(open: boolean) => void' },
      children: 'LlmDialogHeader + body content + LlmDialogFooter',
    },
    vue: {
      component: 'dialog', element: 'LlmDialog', package: '@atelier-ui/vue',
      props: { open: 'boolean (default: false)', size: "'sm' | 'md' | 'lg' (default: 'md')" },
      emits: { 'update:open': 'boolean' },
      slots: { header: 'LlmDialogHeader', default: 'body content', footer: 'LlmDialogFooter' },
    },
  },
  drawer: {
    angular: {
      component: 'drawer', selector: 'llm-drawer', package: '@atelier-ui/angular', type: 'standalone',
      inputs: { open: 'boolean (default: false)', position: "'left' | 'right' (default: 'right')", size: "'sm' | 'md' | 'lg' (default: 'md')" },
      outputs: { openChange: 'EventEmitter<boolean>' },
      content_projection: { 'llm-drawer-header': 'optional header', default: 'drawer body', 'llm-drawer-footer': 'optional footer' },
    },
    react: {
      component: 'drawer', element: 'LlmDrawer', package: '@atelier-ui/react',
      props: { open: 'boolean (default: false)', position: "'left' | 'right' (default: 'right')", size: "'sm' | 'md' | 'lg' (default: 'md')", onOpenChange: '(open: boolean) => void' },
    },
    vue: {
      component: 'drawer', element: 'LlmDrawer', package: '@atelier-ui/vue',
      props: { open: 'boolean (default: false)', position: "'left' | 'right' (default: 'right')", size: "'sm' | 'md' | 'lg' (default: 'md')" },
      emits: { 'update:open': 'boolean' },
    },
  },
  card: {
    angular: {
      component: 'card', selector: 'llm-card', package: '@atelier-ui/angular', type: 'standalone',
      inputs: { variant: "'flat' | 'raised' | 'outlined' (default: 'raised')", padding: "'none' | 'sm' | 'md' | 'lg' (default: 'md')", interactive: 'boolean (default: false)' },
      content_projection: { header: 'optional header slot', default: 'card body', footer: 'optional footer slot' },
    },
    react: {
      component: 'card', element: 'LlmCard', package: '@atelier-ui/react',
      props: { variant: "'flat' | 'raised' | 'outlined' (default: 'raised')", padding: "'none' | 'sm' | 'md' | 'lg' (default: 'md')", interactive: 'boolean (default: false)', onClick: '() => void (optional)' },
      children: 'ReactNode — use LlmCardHeader / LlmCardFooter for named slots',
    },
    vue: {
      component: 'card', element: 'LlmCard', package: '@atelier-ui/vue',
      props: { variant: "'flat' | 'raised' | 'outlined' (default: 'raised')", padding: "'none' | 'sm' | 'md' | 'lg' (default: 'md')", interactive: 'boolean (default: false)' },
      slots: { header: 'optional', default: 'card body', footer: 'optional' },
    },
  },
  alert: {
    angular: {
      component: 'alert', selector: 'llm-alert', package: '@atelier-ui/angular', type: 'standalone',
      inputs: { variant: "'info' | 'success' | 'warning' | 'danger' (default: 'info')", dismissible: 'boolean (default: false)' },
      outputs: { dismiss: 'EventEmitter<void>' },
      content_projection: 'default slot — alert message',
    },
    react: {
      component: 'alert', element: 'LlmAlert', package: '@atelier-ui/react',
      props: { variant: "'info' | 'success' | 'warning' | 'danger' (default: 'info')", dismissible: 'boolean (default: false)', onDismiss: '() => void (optional)' },
      children: 'ReactNode — alert message',
    },
    vue: {
      component: 'alert', element: 'LlmAlert', package: '@atelier-ui/vue',
      props: { variant: "'info' | 'success' | 'warning' | 'danger' (default: 'info')", dismissible: 'boolean (default: false)' },
      emits: { dismiss: 'void' },
      slots: 'default — alert message',
    },
  },
  tabs: {
    angular: {
      component: 'tabs', selector: 'llm-tabs', package: '@atelier-ui/angular', type: 'standalone',
      inputs: { activeTab: 'string — id of the active tab' },
      outputs: { activeTabChange: 'EventEmitter<string>' },
      content_projection: 'llm-tab components — each accepts [tabId] and [label] inputs',
      accessibility: 'WAI-ARIA Tabs pattern with keyboard navigation',
    },
    react: {
      component: 'tabs', element: 'LlmTabs', package: '@atelier-ui/react',
      props: { activeTab: 'string', onActiveTabChange: '(tabId: string) => void' },
      children: 'LlmTab components with tabId and label props',
    },
    vue: {
      component: 'tabs', element: 'LlmTabs', package: '@atelier-ui/vue',
      props: { activeTab: 'string' },
      emits: { 'update:activeTab': 'string' },
      slots: 'LlmTab components with tabId and label props',
    },
  },
  tooltip: {
    angular: {
      component: 'tooltip', selector: 'llm-tooltip', package: '@atelier-ui/angular', type: 'standalone',
      inputs: { text: 'string — tooltip content', position: "'top' | 'bottom' | 'left' | 'right' (default: 'top')", disabled: 'boolean (default: false)' },
      content_projection: 'default slot — trigger element',
    },
    react: {
      component: 'tooltip', element: 'LlmTooltip', package: '@atelier-ui/react',
      props: { text: 'string', position: "'top' | 'bottom' | 'left' | 'right' (default: 'top')", disabled: 'boolean (default: false)' },
      children: 'ReactNode — trigger element',
    },
    vue: {
      component: 'tooltip', element: 'LlmTooltip', package: '@atelier-ui/vue',
      props: { text: 'string', position: "'top' | 'bottom' | 'left' | 'right' (default: 'top')", disabled: 'boolean (default: false)' },
      slots: 'default — trigger element',
    },
  },
  toast: {
    angular: {
      component: 'toast', package: '@atelier-ui/angular',
      note: 'Programmatic service — not a declarative template component',
      usage: "inject(ToastService).show({ message: 'Saved!', variant: 'success' })",
      service_api: { message: 'string', variant: "'info' | 'success' | 'warning' | 'danger' (default: 'info')", duration: 'number ms (default: 4000)', dismissible: 'boolean (default: true)' },
    },
    react: {
      component: 'toast', package: '@atelier-ui/react',
      note: 'Programmatic — use the useToast hook',
      usage: "const { show } = useToast(); show({ message: 'Saved!', variant: 'success' })",
      hook_api: { message: 'string', variant: "'info' | 'success' | 'warning' | 'danger'", duration: 'number ms (default: 4000)' },
    },
    vue: {
      component: 'toast', package: '@atelier-ui/vue',
      note: 'Programmatic — use the useToast composable',
      usage: "const { show } = useToast(); show({ message: 'Saved!', variant: 'success' })",
      composable_api: { message: 'string', variant: "'info' | 'success' | 'warning' | 'danger'", duration: 'number ms (default: 4000)' },
    },
  },
  accordion: {
    angular: {
      component: 'accordion', selector: 'llm-accordion', package: '@atelier-ui/angular', type: 'standalone',
      inputs: { multi: 'boolean — allow multiple panels open simultaneously (default: false)' },
      content_projection: 'llm-accordion-item components — each accepts [title] input',
    },
    react: {
      component: 'accordion', element: 'LlmAccordion', package: '@atelier-ui/react',
      props: { multi: 'boolean (default: false)' },
      children: 'LlmAccordionItem components with title prop',
    },
    vue: {
      component: 'accordion', element: 'LlmAccordion', package: '@atelier-ui/vue',
      props: { multi: 'boolean (default: false)' },
      slots: 'LlmAccordionItem components with title prop',
    },
  },
  avatar: {
    angular: {
      component: 'avatar', selector: 'llm-avatar', package: '@atelier-ui/angular', type: 'standalone',
      inputs: { src: 'string — image URL (optional, falls back to initials)', name: 'string — for initials and alt text', size: "'sm' | 'md' | 'lg' | 'xl' (default: 'md')" },
    },
    react: {
      component: 'avatar', element: 'LlmAvatar', package: '@atelier-ui/react',
      props: { src: 'string (optional)', name: 'string', size: "'sm' | 'md' | 'lg' | 'xl' (default: 'md')" },
    },
    vue: {
      component: 'avatar', element: 'LlmAvatar', package: '@atelier-ui/vue',
      props: { src: 'string (optional)', name: 'string', size: "'sm' | 'md' | 'lg' | 'xl' (default: 'md')" },
    },
  },
  skeleton: {
    angular: {
      component: 'skeleton', selector: 'llm-skeleton', package: '@atelier-ui/angular', type: 'standalone',
      inputs: { width: 'string — CSS value (default: "100%")', height: 'string — CSS value (default: "1rem")', variant: "'text' | 'circle' | 'rect' (default: 'text')" },
    },
    react: {
      component: 'skeleton', element: 'LlmSkeleton', package: '@atelier-ui/react',
      props: { width: 'string (default: "100%")', height: 'string (default: "1rem")', variant: "'text' | 'circle' | 'rect' (default: 'text')" },
    },
    vue: {
      component: 'skeleton', element: 'LlmSkeleton', package: '@atelier-ui/vue',
      props: { width: 'string (default: "100%")', height: 'string (default: "1rem")', variant: "'text' | 'circle' | 'rect' (default: 'text')" },
    },
  },
  progress: {
    angular: {
      component: 'progress', selector: 'llm-progress', package: '@atelier-ui/angular', type: 'standalone',
      inputs: { value: 'number — 0 to 100', variant: "'default' | 'success' | 'warning' | 'danger' (default: 'default')", size: "'sm' | 'md' | 'lg' (default: 'md')" },
    },
    react: {
      component: 'progress', element: 'LlmProgress', package: '@atelier-ui/react',
      props: { value: 'number — 0 to 100', variant: "'default' | 'success' | 'warning' | 'danger' (default: 'default')", size: "'sm' | 'md' | 'lg' (default: 'md')" },
    },
    vue: {
      component: 'progress', element: 'LlmProgress', package: '@atelier-ui/vue',
      props: { value: 'number — 0 to 100', variant: "'default' | 'success' | 'warning' | 'danger' (default: 'default')", size: "'sm' | 'md' | 'lg' (default: 'md')" },
    },
  },
  'radio-group': {
    angular: {
      component: 'radio-group', selector: 'llm-radio-group', package: '@atelier-ui/angular', type: 'standalone',
      inputs: { options: 'Array<{ value: string; label: string }>', value: 'string (default: "")', disabled: 'boolean (default: false)' },
      outputs: { valueChange: 'EventEmitter<string>' },
      form_integration: 'FormValueControl<string>',
    },
    react: {
      component: 'radio-group', element: 'LlmRadioGroup', package: '@atelier-ui/react',
      props: { options: 'Array<{ value: string; label: string }>', value: 'string (default: "")', disabled: 'boolean (default: false)', onValueChange: '(value: string) => void' },
    },
    vue: {
      component: 'radio-group', element: 'LlmRadioGroup', package: '@atelier-ui/vue',
      props: { options: 'Array<{ value: string; label: string }>', disabled: 'boolean (default: false)' },
      v_model: 'v-model:value — binds to string',
    },
  },
  breadcrumbs: {
    angular: {
      component: 'breadcrumbs', selector: 'llm-breadcrumbs', package: '@atelier-ui/angular', type: 'standalone',
      inputs: { items: 'Array<{ label: string; href?: string }>' },
      note: 'Last item rendered as current page (no link)',
    },
    react: {
      component: 'breadcrumbs', element: 'LlmBreadcrumbs', package: '@atelier-ui/react',
      props: { items: 'Array<{ label: string; href?: string }>' },
    },
    vue: {
      component: 'breadcrumbs', element: 'LlmBreadcrumbs', package: '@atelier-ui/vue',
      props: { items: 'Array<{ label: string; href?: string }>' },
    },
  },
  pagination: {
    angular: {
      component: 'pagination', selector: 'llm-pagination', package: '@atelier-ui/angular', type: 'standalone',
      inputs: { page: 'number — current page (1-based)', total: 'number — total page count', siblingCount: 'number (default: 1)' },
      outputs: { pageChange: 'EventEmitter<number>' },
    },
    react: {
      component: 'pagination', element: 'LlmPagination', package: '@atelier-ui/react',
      props: { page: 'number', total: 'number', siblingCount: 'number (default: 1)', onPageChange: '(page: number) => void' },
    },
    vue: {
      component: 'pagination', element: 'LlmPagination', package: '@atelier-ui/vue',
      props: { page: 'number', total: 'number', siblingCount: 'number (default: 1)' },
      emits: { 'update:page': 'number' },
    },
  },
  menu: {
    angular: {
      component: 'menu', selector: 'llm-menu', package: '@atelier-ui/angular', type: 'standalone',
      inputs: { items: 'Array<{ label: string; icon?: string; disabled?: boolean; separator?: boolean }>' },
      outputs: { itemSelect: 'EventEmitter<string>' },
      content_projection: 'default slot — trigger element',
    },
    react: {
      component: 'menu', element: 'LlmMenu', package: '@atelier-ui/react',
      props: { items: 'Array<{ label: string; icon?: string; disabled?: boolean }>', onItemSelect: '(label: string) => void' },
      children: 'ReactNode — trigger element',
    },
    vue: {
      component: 'menu', element: 'LlmMenu', package: '@atelier-ui/vue',
      props: { items: 'Array<{ label: string; icon?: string; disabled?: boolean }>' },
      emits: { itemSelect: 'string' },
      slots: 'default — trigger element',
    },
  },
};

// ─── Search Data ───────────────────────────────────────────────────────────────

export const SEARCH_MAP: Record<string, string[]> = {
  form:       ['input', 'textarea', 'checkbox', 'toggle', 'select', 'radio-group'],
  inputs:     ['input', 'textarea', 'checkbox', 'toggle', 'select', 'radio-group'],
  overlay:    ['dialog', 'drawer', 'tooltip', 'toast'],
  modal:      ['dialog', 'drawer'],
  navigation: ['breadcrumbs', 'tabs', 'pagination', 'menu'],
  display:    ['badge', 'card', 'avatar', 'skeleton', 'progress'],
  feedback:   ['alert', 'toast', 'skeleton', 'progress'],
  layout:     ['card', 'accordion', 'alert'],
  button:     ['button'],
};

export const COMP_META: Record<string, { name: string; category: string; description: string }> = {
  button:      { name: 'Button',      category: 'Inputs',     description: 'Versatile button with variants and loading state' },
  input:       { name: 'Input',       category: 'Inputs',     description: 'Text field with Signal Forms integration' },
  textarea:    { name: 'Textarea',    category: 'Inputs',     description: 'Multi-line text with auto-resize option' },
  checkbox:    { name: 'Checkbox',    category: 'Inputs',     description: 'Boolean toggle with FormCheckboxControl support' },
  toggle:      { name: 'Toggle',      category: 'Inputs',     description: 'Switch-style boolean input' },
  'radio-group': { name: 'RadioGroup', category: 'Inputs',   description: 'Mutually exclusive option set' },
  select:      { name: 'Select',      category: 'Inputs',     description: 'Searchable dropdown with ARIA combobox pattern' },
  badge:       { name: 'Badge',       category: 'Display',    description: 'Inline status indicator with semantic variants' },
  card:        { name: 'Card',        category: 'Display',    description: 'Surface container with elevation and interactivity' },
  avatar:      { name: 'Avatar',      category: 'Display',    description: 'User avatar with image and initials fallback' },
  skeleton:    { name: 'Skeleton',    category: 'Display',    description: 'Loading placeholder for content areas' },
  progress:    { name: 'Progress',    category: 'Display',    description: 'Linear progress bar' },
  breadcrumbs: { name: 'Breadcrumbs', category: 'Navigation', description: 'Hierarchical page location indicator' },
  tabs:        { name: 'Tabs',        category: 'Navigation', description: 'Tab panel with keyboard navigation' },
  pagination:  { name: 'Pagination',  category: 'Navigation', description: 'Page navigation controls' },
  menu:        { name: 'Menu',        category: 'Navigation', description: 'Dropdown context menu' },
  dialog:      { name: 'Dialog',      category: 'Overlay',    description: 'Modal dialog with content projection slots' },
  drawer:      { name: 'Drawer',      category: 'Overlay',    description: 'Side panel drawer' },
  tooltip:     { name: 'Tooltip',     category: 'Overlay',    description: 'Floating label on hover/focus' },
  toast:       { name: 'Toast',       category: 'Overlay',    description: 'Programmatic notification via service/hook' },
  accordion:   { name: 'Accordion',   category: 'Layout',     description: 'Collapsible content sections' },
  alert:       { name: 'Alert',       category: 'Layout',     description: 'Contextual feedback message with dismiss option' },
};

// ─── Stories Data ──────────────────────────────────────────────────────────────

export const STORIES_MAP: Record<string, object> = {
  button:  { component: 'button',  story_count: 4, stories: [{ name: 'Variants', description: 'primary, secondary, outline side by side' }, { name: 'Sizes', description: 'sm / md / lg comparison' }, { name: 'Loading', description: 'Loading state — spinner shown, interaction blocked' }, { name: 'Disabled', description: 'Non-interactive disabled state' }] },
  dialog:  { component: 'dialog',  story_count: 3, stories: [{ name: 'Confirmation', description: 'Header + body + footer action buttons' }, { name: 'Large', description: 'lg size for complex content' }, { name: 'No Footer', description: 'Header and body only, no footer slot' }] },
  alert:   { component: 'alert',   story_count: 5, stories: [{ name: 'Info', description: 'Neutral informational message' }, { name: 'Success', description: 'Positive outcome confirmation' }, { name: 'Warning', description: 'Non-blocking caution message' }, { name: 'Danger', description: 'Error or destructive action warning' }, { name: 'Dismissible', description: 'Alert with close button' }] },
  card:    { component: 'card',    story_count: 4, stories: [{ name: 'Raised', description: 'Default elevated card with shadow' }, { name: 'Outlined', description: 'Border-only, no shadow' }, { name: 'Flat', description: 'Subtle background grouping' }, { name: 'Interactive', description: 'Hover lift + pointer cursor' }] },
  select:  { component: 'select',  story_count: 3, stories: [{ name: 'Basic', description: 'Controlled select with options array' }, { name: 'Searchable', description: 'Type to filter — built in by default' }, { name: 'Invalid', description: 'Error state styling' }] },
  tabs:    { component: 'tabs',    story_count: 2, stories: [{ name: 'Basic', description: 'Three tabs with keyboard navigation' }, { name: 'Controlled', description: 'Externally controlled active tab' }] },
  input:   { component: 'input',   story_count: 4, stories: [{ name: 'Types', description: 'text, email, password, number examples' }, { name: 'Invalid', description: 'Error state with invalid=true' }, { name: 'Disabled', description: 'Non-interactive disabled state' }, { name: 'Signal Forms', description: 'Bound to FormValueControl in a Signal Form' }] },
  badge:   { component: 'badge',   story_count: 2, stories: [{ name: 'All Variants', description: 'default, primary, success, warning, danger, info' }, { name: 'Sizes', description: 'sm and md comparison' }] },
};
