export interface FrameworkPropOverrides {
  name?: string;
  type?: string;
  default?: string;
}

export interface PropRow {
  name: string;
  type: string;
  default: string;
  description: string;
  angular?: FrameworkPropOverrides;
  vue?: FrameworkPropOverrides;
}

export interface ComponentDoc {
  name: string;
  selector: string;
  description: string;
  category: string;
  props: PropRow[];
  codeExample: string;
  status?: 'new' | 'updated' | 'stable';
  aiUsage?: {
    bestPractices: string[];
    promptSnippet: string;
    commonHallucinations: string[];
  };
}

export const CATEGORY_ICONS: Record<string, string> = {
  Inputs: '✏️',
  Display: '🎨',
  Navigation: '🧭',
  Overlay: '🪟',
  Layout: '📐',
};

export const SECTION_ICONS: Record<string, string> = {
  'Get Started': '🚀',
  Tools: '🛠️',
  'The Library': '📚',
  Overview: '🏠',
};

export const COMPONENT_CATEGORIES: Record<string, string[]> = {
  Inputs: ['button', 'input', 'textarea', 'checkbox', 'toggle', 'radio-group', 'select', 'combobox'],
  Display: ['badge', 'card', 'table', 'avatar', 'skeleton', 'progress', 'code-block'],
  Navigation: ['breadcrumbs', 'tabs', 'stepper', 'pagination', 'menu'],
  Overlay: ['dialog', 'drawer', 'tooltip', 'toast'],
  Layout: ['accordion', 'alert'],
};

export const ALL_COMPONENTS = Object.values(COMPONENT_CATEGORIES).flat();

export const componentDocs: Record<string, ComponentDoc> = {
  button: {
    name: 'Button',
    selector: 'LlmButton',
    description: 'A versatile button component with multiple variants and sizes. Supports loading and disabled states.',
    category: 'Inputs',
    status: 'stable',
    props: [
      { name: 'variant', type: "'primary' | 'secondary' | 'outline'", default: "'primary'", description: 'Visual style variant' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Size of the button' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the button' },
      { name: 'loading', type: 'boolean', default: 'false', description: 'Shows a loading spinner, disables interaction' },
    ],
    codeExample: `<LlmButton variant="primary">Primary</LlmButton>
<LlmButton variant="secondary">Secondary</LlmButton>
<LlmButton variant="outline">Outline</LlmButton>
<LlmButton loading={true}>Loading</LlmButton>
<LlmButton disabled={true}>Disabled</LlmButton>`,
    aiUsage: {
      bestPractices: [
        'Always specify the "variant" to communicate the visual intent to the model.',
        'Use the "loading" state instead of custom spinner implementations for consistency.',
        'Specify the button "size" to ensure correct alignment in complex layouts.'
      ],
      promptSnippet: 'Create a primary LlmButton that says "Submit Form" and shows a loading state.',
      commonHallucinations: [
        'AI may use standard HTML "button" instead of "LlmButton".',
        'AI may try to use "ghost" or "text" variants which are not yet supported.'
      ]
    }
  },

  input: {
    name: 'Input',
    selector: 'LlmInput',
    description: 'A text input field that integrates with Signal Forms. Supports all standard HTML input types, validation states, and error display.',
    category: 'Inputs',
    props: [
      { name: 'value', type: 'string', default: "''", description: 'Controlled value', angular: { name: '[(value)]' } },
      { name: 'type', type: "'text' | 'email' | 'password' | 'number' | 'tel' | 'url'", default: "'text'", description: 'Input type' },
      { name: 'placeholder', type: 'string', default: "''", description: 'Placeholder text' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the input' },
      { name: 'readonly', type: 'boolean', default: 'false', description: 'Makes the input read-only' },
      { name: 'invalid', type: 'boolean', default: 'false', description: 'Applies invalid/error styling' },
      { name: 'required', type: 'boolean', default: 'false', description: 'Marks field as required' },
      { name: 'name', type: 'string', default: "''", description: 'HTML name attribute for form submission' },
    ],
    codeExample: `<LlmInput type="email" placeholder="you@example.com" />
<LlmInput type="password" placeholder="Password" />
<LlmInput invalid={true} placeholder="Invalid state" />
<LlmInput disabled={true} placeholder="Disabled" />`,
    aiUsage: {
      bestPractices: [
        'Explicitly state the "type" property to ensure correct mobile keyboards.',
        'Always provide a meaningful "placeholder" to improve form scannability.',
        'Use the "invalid" prop combined with LlmAlert for accessible error feedback.'
      ],
      promptSnippet: 'Create a required LlmInput for email with a placeholder "name@company.com".',
      commonHallucinations: [
        'AI often uses "onChange" (standard React/DOM) instead of "onValueChange".',
        'AI may forget that "LlmInput" is a controlled component and needs state management.'
      ]
    }
  },

  textarea: {
    name: 'Textarea',
    selector: 'LlmTextarea',
    description: 'A multi-line text input. Supports auto-resize to fit content and integrates with Signal Forms.',
    category: 'Inputs',
    props: [
      { name: 'value', type: 'string', default: "''", description: 'Controlled value' },
      { name: 'rows', type: 'number', default: '3', description: 'Initial number of visible rows' },
      { name: 'placeholder', type: 'string', default: "''", description: 'Placeholder text' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the textarea' },
      { name: 'readonly', type: 'boolean', default: 'false', description: 'Makes the textarea read-only' },
      { name: 'invalid', type: 'boolean', default: 'false', description: 'Applies invalid/error styling' },
      { name: 'required', type: 'boolean', default: 'false', description: 'Marks field as required' },
      { name: 'name', type: 'string', default: "''", description: 'HTML name attribute for form submission' },
      { name: 'autoResize', type: 'boolean', default: 'false', description: 'Grows height automatically as content grows' },
    ],
    codeExample: `<LlmTextarea placeholder="Tell us about yourself" rows={4} />
<LlmTextarea autoResize={true} placeholder="Auto-resizes as you type..." />
<LlmTextarea disabled={true} placeholder="Disabled" />`,
  },

  checkbox: {
    name: 'Checkbox',
    selector: 'LlmCheckbox',
    description: 'A checkbox input that supports indeterminate state. Integrates with Signal Forms.',
    category: 'Inputs',
    props: [
      { name: 'checked', type: 'boolean', default: 'false', description: 'Controlled checked state' },
      { name: 'onCheckedChange', type: '(checked: boolean) => void', default: '—', description: 'Called when the checked state changes' },
      { name: 'indeterminate', type: 'boolean', default: 'false', description: 'Shows a dash (indeterminate state)' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the checkbox' },
      { name: 'readonly', type: 'boolean', default: 'false', description: 'Makes the checkbox read-only' },
      { name: 'invalid', type: 'boolean', default: 'false', description: 'Applies invalid/error styling' },
      { name: 'required', type: 'boolean', default: 'false', description: 'Marks field as required' },
      { name: 'name', type: 'string', default: "''", description: 'HTML name attribute for form submission' },
    ],
    codeExample: `<LlmCheckbox>I agree to the terms</LlmCheckbox>
<LlmCheckbox checked={true}>Pre-checked</LlmCheckbox>
<LlmCheckbox indeterminate={true}>Indeterminate</LlmCheckbox>
<LlmCheckbox disabled={true}>Disabled</LlmCheckbox>`,
  },

  toggle: {
    name: 'Toggle',
    selector: 'LlmToggle',
    description: 'A toggle switch for boolean settings. Integrates with Signal Forms.',
    category: 'Inputs',
    props: [
      { name: 'checked', type: 'boolean', default: 'false', description: 'Controlled checked state' },
      { name: 'onCheckedChange', type: '(checked: boolean) => void', default: '—', description: 'Called when the checked state changes' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the toggle' },
      { name: 'readonly', type: 'boolean', default: 'false', description: 'Makes the toggle read-only' },
      { name: 'invalid', type: 'boolean', default: 'false', description: 'Applies invalid/error styling' },
      { name: 'required', type: 'boolean', default: 'false', description: 'Marks field as required' },
      { name: 'name', type: 'string', default: "''", description: 'HTML name attribute for form submission' },
    ],
    codeExample: `<LlmToggle>Enable notifications</LlmToggle>
<LlmToggle checked={true}>Active toggle</LlmToggle>
<LlmToggle disabled={true}>Disabled</LlmToggle>`,
  },

  'radio-group': {
    name: 'RadioGroup',
    selector: 'LlmRadioGroup + LlmRadio',
    description: 'A group of radio buttons with keyboard navigation. The group handles arrow key navigation and value management.',
    category: 'Inputs',
    props: [
      { name: 'value', type: 'string', default: "''", description: 'Currently selected value' },
      { name: 'onValueChange', type: '(value: string) => void', default: '—', description: 'Called when selection changes' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables all radios in the group' },
      { name: 'readonly', type: 'boolean', default: 'false', description: 'Makes all radios in the group read-only' },
      { name: 'invalid', type: 'boolean', default: 'false', description: 'Applies invalid/error styling' },
      { name: 'required', type: 'boolean', default: 'false', description: 'Marks field as required' },
      { name: 'name', type: 'string', default: "''", description: 'HTML name attribute (propagated to radios)' },
    ],
    codeExample: `<LlmRadioGroup name="plan" value="free" onValueChange={(v) => console.log(v)}>
  <LlmRadio radioValue="free">Free</LlmRadio>
  <LlmRadio radioValue="pro">Pro</LlmRadio>
  <LlmRadio radioValue="enterprise">Enterprise</LlmRadio>
</LlmRadioGroup>`,
  },

  select: {
    name: 'Select',
    selector: 'LlmSelect + LlmOption',
    description: 'A custom select dropdown built on the native Popover API. Supports keyboard navigation, type-ahead, and disabled options.',
    category: 'Inputs',
    props: [
      { name: 'value', type: 'string', default: "''", description: 'Currently selected value', angular: { name: '[(value)]' } },
      { name: 'onValueChange', type: '(value: string) => void', default: '—', description: 'Called when selection changes', angular: { name: '(valueChange)' } },
      { name: 'placeholder', type: 'string', default: "''", description: 'Placeholder text when no option is selected' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the select' },
      { name: 'readonly', type: 'boolean', default: 'false', description: 'Makes the select read-only' },
      { name: 'invalid', type: 'boolean', default: 'false', description: 'Applies invalid/error styling' },
      { name: 'required', type: 'boolean', default: 'false', description: 'Marks field as required' },
      { name: 'name', type: 'string', default: "''", description: 'HTML name attribute for form submission' },
    ],
    codeExample: `<LlmSelect placeholder="Select a country" onValueChange={(v) => console.log(v)}>
  <LlmOption optionValue="us">United States</LlmOption>
  <LlmOption optionValue="ca">Canada</LlmOption>
  <LlmOption optionValue="uk" disabled={true}>United Kingdom (unavailable)</LlmOption>
</LlmSelect>`,
    aiUsage: {
      bestPractices: [
        'Always use "LlmOption" for items within the "LlmSelect".',
        'Specify the "optionValue" for each option to ensure correct selection logic.',
        'Use the "placeholder" prop to provide a default empty state.'
      ],
      promptSnippet: 'Create an LlmSelect for choosing a "Plan" with options "Basic", "Pro", and "Enterprise".',
      commonHallucinations: [
        'AI may use standard HTML "select" and "option" tags.',
        'AI may try to use "items" or "options" prop instead of the composable child pattern.'
      ]
    }
  },

  combobox: {
    name: 'Combobox',
    selector: 'LlmCombobox',
    description: 'A filterable autocomplete input. The user can type to narrow down a large list of options.',
    category: 'Inputs',
    status: 'new',
    props: [
      { name: 'value', type: 'string', default: "''", description: 'Controlled value' },
      { name: 'onValueChange', type: '(value: string) => void', default: '—', description: 'Called when selection changes' },
      { name: 'options', type: 'LlmComboboxOption[]', default: '[]', description: 'Array of { label, value } objects' },
      { name: 'placeholder', type: 'string', default: "''", description: 'Placeholder text' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the combobox' },
      { name: 'invalid', type: 'boolean', default: 'false', description: 'Applies invalid/error styling' },
    ],
    codeExample: `<LlmCombobox 
  placeholder="Search framework..." 
  options={[
    { label: 'Angular', value: 'ng' },
    { label: 'React', value: 'react' },
    { label: 'Vue', value: 'vue' }
  ]} 
/>`,
  },

  badge: {
    name: 'Badge',
    selector: 'LlmBadge',
    description: 'A small inline label for status, categories, or counts. Use alongside cards, list items, and table cells.',
    category: 'Display',
    props: [
      { name: 'variant', type: "'default' | 'success' | 'warning' | 'danger' | 'info'", default: "'default'", description: 'Color scheme of the badge' },
      { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Size of the badge' },
    ],
    codeExample: `<LlmBadge>Default</LlmBadge>
<LlmBadge variant="success">Active</LlmBadge>
<LlmBadge variant="warning">Pending</LlmBadge>
<LlmBadge variant="danger">Error</LlmBadge>
<LlmBadge variant="info">Info</LlmBadge>
<LlmBadge size="sm" variant="success">Small</LlmBadge>`,
  },

  card: {
    name: 'Card',
    selector: 'LlmCard',
    description: 'A container component for grouped content. Compose with LlmCardHeader, LlmCardContent, and LlmCardFooter.',
    category: 'Display',
    props: [
      { name: 'variant', type: "'elevated' | 'outlined' | 'flat'", default: "'elevated'", description: 'Visual style of the card' },
      { name: 'padding', type: "'none' | 'sm' | 'md' | 'lg'", default: "'md'", description: 'Padding size inside the card' },
    ],
    codeExample: `<LlmCard variant="elevated" padding="md">
  <LlmCardHeader>Card Title</LlmCardHeader>
  <LlmCardContent>
    This is the card body content. It can contain anything.
  </LlmCardContent>
  <LlmCardFooter>
    <LlmButton variant="primary" size="sm">Action</LlmButton>
  </LlmCardFooter>
</LlmCard>`,
  },

  table: {
    name: 'Table',
    selector: 'LlmTable',
    description: 'A comprehensive data table component for displaying structured information. Supports sorting, row selection, sticky headers, and custom empty states.',
    category: 'Display',
    status: 'new',
    props: [
      { name: 'variant', type: "'default' | 'striped' | 'bordered'", default: "'default'", description: 'Row background styling' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Vertical padding of cells' },
      { name: 'stickyHeader', type: 'boolean', default: 'false', description: 'Makes header row stick to the top on scroll' },
    ],
    codeExample: `<LlmTable variant="striped">
  <LlmThead>
    <LlmTr>
      <LlmTh sortable>Name</LlmTh>
      <LlmTh>Status</LlmTh>
    </LlmTr>
  </LlmThead>
  <LlmTbody empty={rows.length === 0} colSpan={2}>
    {rows.map(row => (
      <LlmTr key={row.id} selectable>
        <LlmTd>{row.name}</LlmTd>
        <LlmTd>{row.status}</LlmTd>
      </LlmTr>
    ))}
    <div llmTableEmpty>No results found</div>
  </LlmTbody>
</LlmTable>`,
  },

  avatar: {
    name: 'Avatar',
    selector: 'LlmAvatar + LlmAvatarGroup',
    description: 'User avatar with image, initials fallback, and status indicator. Group avatars with LlmAvatarGroup.',
    category: 'Display',
    props: [
      { name: 'src', type: 'string', default: "''", description: 'Image URL' },
      { name: 'alt', type: 'string', default: "''", description: 'Alt text for the avatar image' },
      { name: 'name', type: 'string', default: "''", description: 'Used for initials fallback and aria-label' },
      { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Size of the avatar' },
      { name: 'shape', type: "'circle' | 'square'", default: "'circle'", description: 'Shape of the avatar' },
      { name: 'status', type: "'online' | 'offline' | 'away' | 'busy' | ''", default: "''", description: 'Status dot indicator' },
    ],
    codeExample: `<LlmAvatar name="Jane Doe" size="md" status="online" />
<LlmAvatar name="John Smith" size="lg" shape="square" />
<LlmAvatarGroup max={3} size="md">
  <LlmAvatar name="Alice" />
  <LlmAvatar name="Bob" />
  <LlmAvatar name="Carol" />
  <LlmAvatar name="Dave" />
</LlmAvatarGroup>`,
  },

  skeleton: {
    name: 'Skeleton',
    selector: 'LlmSkeleton',
    description: 'Loading placeholder that mimics content shape. Compose multiple skeletons to match your layout.',
    category: 'Display',
    props: [
      { name: 'variant', type: "'text' | 'circular' | 'rectangular'", default: "'text'", description: 'Shape of the skeleton' },
      { name: 'width', type: 'string', default: "'100%'", description: 'CSS width (e.g. "200px", "60%")' },
      { name: 'height', type: 'string', default: "''", description: 'CSS height. Auto per variant if not set.' },
      { name: 'animated', type: 'boolean', default: 'true', description: 'Enables shimmer animation' },
    ],
    codeExample: `<LlmSkeleton variant="text" />
<LlmSkeleton variant="text" width="60%" />
<LlmSkeleton variant="circular" width="40px" />
<LlmSkeleton variant="rectangular" height="200px" />`,
  },

  progress: {
    name: 'Progress',
    selector: 'LlmProgress',
    description: 'A horizontal progress bar for showing completion percentage or indeterminate loading.',
    category: 'Display',
    props: [
      { name: 'value', type: 'number', default: '0', description: 'Progress value from 0 to 100' },
      { name: 'max', type: 'number', default: '100', description: 'Maximum value' },
      { name: 'indeterminate', type: 'boolean', default: 'false', description: 'Shows animated indeterminate state' },
      { name: 'variant', type: "'default' | 'success' | 'warning' | 'danger'", default: "'default'", description: 'Color variant' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Size of the progress bar' },
    ],
    codeExample: `<LlmProgress value={25} />
<LlmProgress value={60} variant="success" />
<LlmProgress value={85} variant="warning" />
<LlmProgress indeterminate={true} />`,
  },

  breadcrumbs: {
    name: 'Breadcrumbs',
    selector: 'LlmBreadcrumbs + LlmBreadcrumbItem',
    description: 'Navigation breadcrumb trail showing the current page location within a hierarchy.',
    category: 'Navigation',
    props: [
      { name: 'separator', type: 'string', default: "'/'", description: 'Separator character between items' },
    ],
    codeExample: `<LlmBreadcrumbs>
  <LlmBreadcrumbItem href="/">Home</LlmBreadcrumbItem>
  <LlmBreadcrumbItem href="/components">Components</LlmBreadcrumbItem>
  <LlmBreadcrumbItem>Breadcrumbs</LlmBreadcrumbItem>
</LlmBreadcrumbs>`,
  },

  tabs: {
    name: 'Tabs',
    selector: 'LlmTabGroup + LlmTab',
    description: 'An accessible tabbed interface. Supports roving tabindex, arrow key navigation, and a pills variant.',
    category: 'Navigation',
    props: [
      { name: 'selectedIndex', type: 'number', default: '0', description: 'Index of the selected tab' },
      { name: 'onSelectedIndexChange', type: '(index: number) => void', default: '—', description: 'Called when selection changes' },
      { name: 'variant', type: "'default' | 'pills'", default: "'default'", description: 'Visual style of the tab strip' },
    ],
    codeExample: `<LlmTabGroup selectedIndex={0}>
  <LlmTab label="Account">Account settings content.</LlmTab>
  <LlmTab label="Notifications">Notification preferences.</LlmTab>
  <LlmTab label="Billing" disabled={true}>Billing info.</LlmTab>
</LlmTabGroup>`,
  },

  stepper: {
    name: 'Stepper',
    selector: 'LlmStepper + LlmStep',
    description: 'A multi-step wizard for complex processes. Supports linear and non-linear navigation.',
    category: 'Navigation',
    status: 'new',
    props: [
      { name: 'activeStep', type: 'number', default: '0', description: 'Currently active step index' },
      { name: 'linear', type: 'boolean', default: 'false', description: 'Forces user to complete steps in order' },
      { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Stepper layout direction' },
    ],
    codeExample: `<LlmStepper activeStep={0}>
  <LlmStep label="Basic Info">Step 1 content</LlmStep>
  <LlmStep label="Verification">Step 2 content</LlmStep>
  <LlmStep label="Complete">Step 3 content</LlmStep>
</LlmStepper>`,
  },

  pagination: {
    name: 'Pagination',
    selector: 'LlmPagination',
    description: 'Page navigation control for paginated data. Shows page numbers with previous/next buttons.',
    category: 'Navigation',
    props: [
      { name: 'page', type: 'number', default: '1', description: 'Current page (1-indexed)' },
      { name: 'pageCount', type: 'number', default: '1', description: 'Total number of pages' },
      { name: 'onPageChange', type: '(page: number) => void', default: '—', description: 'Called when the user navigates to a page' },
      { name: 'siblingCount', type: 'number', default: '1', description: 'Number of page buttons on each side of current page' },
      { name: 'showFirstLast', type: 'boolean', default: 'true', description: 'Show first/last page jump buttons' },
    ],
    codeExample: `<LlmPagination
  page={3}
  pageCount={10}
  onPageChange={(p) => console.log(p)}
/>`,
  },

  menu: {
    name: 'Menu',
    selector: 'LlmMenu + LlmMenuItem + LlmMenuTrigger',
    description: 'A dropdown context menu built on @angular/cdk/menu. Handles keyboard navigation, focus management, ARIA, and nested submenus.',
    category: 'Navigation',
    props: [
      { name: 'variant', type: "'default' | 'compact'", default: "'default'", description: 'Density of the menu' },
    ],
    codeExample: `<LlmButton llmMenuTriggerFor={actionsMenu}>Actions ▾</LlmButton>
{/* In template: */}
<LlmMenu ref={actionsMenu}>
  <LlmMenuItem onTriggered={() => console.log('copy')}>Copy</LlmMenuItem>
  <LlmMenuItem onTriggered={() => console.log('paste')}>Paste</LlmMenuItem>
  <LlmMenuSeparator />
  <LlmMenuItem disabled={true}>Delete</LlmMenuItem>
</LlmMenu>`,
  },

  dialog: {
    name: 'Dialog',
    selector: 'LlmDialog',
    description: 'A modal dialog using the native <dialog> element. Includes focus trap, Escape to close, backdrop click to close, and smooth animations.',
    category: 'Overlay',
    props: [
      { name: 'open', type: 'boolean', default: 'false', description: 'Controls dialog visibility' },
      { name: 'onOpenChange', type: '(open: boolean) => void', default: '—', description: 'Called when open state changes' },
      { name: 'closeOnBackdrop', type: 'boolean', default: 'true', description: 'Close when clicking the backdrop' },
      { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl' | 'full'", default: "'md'", description: 'Max-width of the dialog' },
    ],
    codeExample: `<LlmButton onClick={() => setOpen(true)}>Open Dialog</LlmButton>
<LlmDialog open={open} onOpenChange={setOpen} size="sm">
  <LlmDialogHeader>Confirm Delete</LlmDialogHeader>
  <LlmDialogContent>Are you sure? This cannot be undone.</LlmDialogContent>
  <LlmDialogFooter>
    <LlmButton variant="outline" onClick={() => setOpen(false)}>Cancel</LlmButton>
    <LlmButton variant="primary" onClick={() => setOpen(false)}>Delete</LlmButton>
  </LlmDialogFooter>
</LlmDialog>`,
  },

  drawer: {
    name: 'Drawer',
    selector: 'LlmDrawer',
    description: 'A slide-in panel from the edge of the viewport. Useful for sidebars, filter panels, and detail views.',
    category: 'Overlay',
    props: [
      { name: 'open', type: 'boolean', default: 'false', description: 'Controls drawer visibility' },
      { name: 'onOpenChange', type: '(open: boolean) => void', default: '—', description: 'Called when open state changes' },
      { name: 'position', type: "'left' | 'right' | 'top' | 'bottom'", default: "'right'", description: 'Which edge the drawer slides from' },
      { name: 'size', type: "'sm' | 'md' | 'lg' | 'full'", default: "'md'", description: 'Width (or height for top/bottom)' },
      { name: 'closeOnBackdrop', type: 'boolean', default: 'true', description: 'Close when clicking the backdrop' },
    ],
    codeExample: `<LlmButton onClick={() => setOpen(true)}>Open Drawer</LlmButton>
<LlmDrawer open={open} onOpenChange={setOpen} position="right">
  <LlmDrawerHeader>Settings</LlmDrawerHeader>
  <LlmDrawerContent>
    <LlmInput placeholder="Search..." />
  </LlmDrawerContent>
  <LlmDrawerFooter>
    <LlmButton onClick={() => setOpen(false)}>Close</LlmButton>
  </LlmDrawerFooter>
</LlmDrawer>`,
  },

  tooltip: {
    name: 'Tooltip',
    selector: '[llmTooltip]',
    description: 'An attribute directive that adds a tooltip to any element. Built on @angular/cdk/overlay for viewport-aware positioning.',
    category: 'Overlay',
    props: [
      { name: 'llmTooltip', type: 'string', default: '—', description: 'Tooltip text content (required)' },
      { name: 'llmTooltipPosition', type: "'above' | 'below' | 'left' | 'right'", default: "'above'", description: 'Preferred position' },
      { name: 'llmTooltipDisabled', type: 'boolean', default: 'false', description: 'Disables the tooltip' },
      { name: 'llmTooltipShowDelay', type: 'number', default: '300', description: 'Delay in ms before showing' },
      { name: 'llmTooltipHideDelay', type: 'number', default: '0', description: 'Delay in ms before hiding' },
    ],
    codeExample: `<LlmTooltip tooltip="Save your changes">
  <LlmButton>Save</LlmButton>
</LlmTooltip>
<LlmTooltip tooltip="Copy to clipboard" position="right">
  <LlmButton variant="outline">Copy</LlmButton>
</LlmTooltip>`,
  },

  toast: {
    name: 'Toast',
    selector: 'LlmToastProvider + useLlmToast',
    description: 'Transient notifications that auto-dismiss. Service/hook-based API — place LlmToastContainer once in app root.',
    category: 'Overlay',
    props: [
      { name: 'variant', type: "'default' | 'success' | 'warning' | 'danger' | 'info'", default: "'default'", description: 'Color scheme of the toast' },
      { name: 'duration', type: 'number', default: '5000', description: 'Auto-dismiss delay in ms. 0 = no auto-dismiss' },
      { name: 'dismissible', type: 'boolean', default: 'true', description: 'Show a dismiss button' },
      { name: 'position', type: "'top-right' | 'top-center' | 'bottom-right' | 'bottom-center'", default: "'bottom-right'", description: 'Container position (on LlmToastContainer)' },
    ],
    codeExample: `// App root:
<LlmToastProvider>
  <App />
  <LlmToastContainer position="bottom-right" />
</LlmToastProvider>

// In any component:
const { show } = useLlmToast();
show('Saved!', { variant: 'success' });
show('Error occurred', { variant: 'danger', duration: 8000 });
show('Persistent', { duration: 0 });`,
  },

  accordion: {
    name: 'Accordion',
    selector: 'LlmAccordionGroup + LlmAccordionItem',
    description: 'Expandable/collapsible sections. Supports multi-expand mode and smooth CSS grid animations.',
    category: 'Layout',
    props: [
      { name: 'multi', type: 'boolean', default: 'false', description: 'Allow multiple items expanded simultaneously' },
      { name: 'variant', type: "'default' | 'bordered' | 'separated'", default: "'default'", description: 'Visual style of the group' },
    ],
    codeExample: `<LlmAccordionGroup variant="separated">
  <LlmAccordionItem>
    <span llmAccordionHeader>Question 1</span>
    Answer content goes here.
  </LlmAccordionItem>
  <LlmAccordionItem>
    <span llmAccordionHeader>Question 2</span>
    Another answer here.
  </LlmAccordionItem>
</LlmAccordionGroup>`,
  },

  alert: {
    name: 'Alert',
    selector: 'LlmAlert',
    description: 'Inline status messages for feedback, warnings, and errors. Optionally dismissible.',
    category: 'Layout',
    props: [
      { name: 'variant', type: "'info' | 'success' | 'warning' | 'danger'", default: "'info'", description: 'Color scheme and icon' },
      { name: 'dismissible', type: 'boolean', default: 'false', description: 'Show a close button' },
      { name: 'onDismissed', type: '() => void', default: '—', description: 'Called when the dismiss button is clicked' },
    ],
    codeExample: `<LlmAlert variant="info">This is an informational message.</LlmAlert>
<LlmAlert variant="success">Your changes were saved successfully.</LlmAlert>
<LlmAlert variant="warning" dismissible={true}>Your session expires in 5 minutes.</LlmAlert>
<LlmAlert variant="danger">Something went wrong. Please try again.</LlmAlert>`,
  },

  'code-block': {
    name: 'Code Block',
    selector: 'LlmCodeBlock',
    description: 'Displays a block of code with an optional header, language label, filename, and copy-to-clipboard button. Designed for rendering LLM-generated code output, API examples, and inline snippets.',
    category: 'Display',
    status: 'new',
    props: [
      { name: 'code', type: 'string', default: "''", description: 'The code string to display' },
      { name: 'language', type: 'string', default: "'text'", description: 'Language label shown in the header. Ignored when filename is set.' },
      { name: 'filename', type: 'string', default: "''", description: 'Optional filename shown in the header instead of the language label' },
      { name: 'copyable', type: 'boolean', default: 'true', description: 'Whether to show a copy-to-clipboard button' },
      { name: 'showLineNumbers', type: 'boolean', default: 'false', description: 'Whether to display line numbers alongside the code' },
    ],
    codeExample: `<LlmCodeBlock code="const x = 1;" language="typescript" />
<LlmCodeBlock code={tsCode} filename="app.ts" showLineNumbers={true} />
<LlmCodeBlock code={shellCmd} language="shell" />
<LlmCodeBlock code={jsonStr} filename="package.json" />`,
  },
};
