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
  react?: FrameworkPropOverrides;
  vue?: FrameworkPropOverrides;
}

export interface KeyBinding {
  key: string;
  action: string;
}

export interface A11yInfo {
  role?: string;
  keyboard: KeyBinding[];
  notes?: string[];
}

export interface CompositionPart {
  name: string;
  description?: string;
  props: PropRow[];
}

export interface ComponentDoc {
  name: string;
  selector: string;
  description: string;
  category: string;
  props: PropRow[];
  examples: { angular: string; react: string; vue: string };
  status?: 'new' | 'updated' | 'stable';
  aiUsage?: {
    bestPractices: string[];
    promptSnippet: string;
    commonHallucinations: string[];
  };
  a11y?: A11yInfo;
  composition?: CompositionPart[];
}

export const CATEGORY_ICONS: Record<string, string> = {
  Inputs: '✏️',
  Display: '🎨',
  Navigation: '🧭',
  Overlay: '🪟',
  Layout: '📐',
  AI: '🤖',
};

/* Material icon names. Rendered via <Icon name={...} /> in BaseLayout.
 * Names must exist in docs/src/components/Icon.astro's import list. */
export const SECTION_ICONS: Record<string, string> = {
  // Diátaxis-aligned sections used by the main sidebar
  'Workshop': 'school',
  'How-To': 'build_circle',
  'Reference': 'menu_book',
  'Explanation': 'lightbulb',
  // Older labels kept for backwards-compatibility (e.g. components subsidebar)
  'Get Started': 'dashboard',
  'Workflow': 'schema',
  Tools: 'build_circle',
  'The Library': 'book',
  Overview: 'dashboard',
};

export const COMPONENT_CATEGORIES: Record<string, string[]> = {
  Inputs: ['button', 'input', 'textarea', 'checkbox', 'toggle', 'radio-group', 'select', 'combobox'],
  Display: ['badge', 'icon', 'card', 'table', 'avatar', 'skeleton', 'progress', 'code-block'],
  Navigation: ['breadcrumbs', 'tabs', 'stepper', 'pagination', 'menu'],
  Overlay: ['dialog', 'drawer', 'tooltip', 'toast'],
  Layout: ['accordion', 'alert'],
  AI: ['chat'],
};

export const ALL_COMPONENTS = Object.values(COMPONENT_CATEGORIES).flat();

export const componentDocs: Record<string, ComponentDoc> = {
  button: {
    name: 'Button',
    selector: 'AtlButton',
    description: 'A versatile button component with multiple variants and sizes. Supports loading and disabled states.',
    category: 'Inputs',
    status: 'stable',
    props: [
      { name: 'variant', type: "'primary' | 'secondary' | 'outline' | 'danger'", default: "'primary'", description: 'Visual style variant' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Size of the button' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the button' },
      { name: 'loading', type: 'boolean', default: 'false', description: 'Shows a loading spinner, disables interaction' },
      { name: 'aria-label', type: 'string', default: '—', description: 'Accessible name. Required for icon-only buttons (no children). React enforces this at compile time via a discriminated union; Angular/Vue warn at runtime in dev mode.' },
    ],
    examples: {
      angular: `<atl-button variant="primary">Primary</atl-button>
<atl-button variant="secondary">Secondary</atl-button>
<atl-button variant="outline">Outline</atl-button>
<atl-button [loading]="true">Loading</atl-button>
<atl-button [disabled]="true">Disabled</atl-button>`,
      react: `<AtlButton variant="primary">Primary</AtlButton>
<AtlButton variant="secondary">Secondary</AtlButton>
<AtlButton variant="outline">Outline</AtlButton>
<AtlButton loading={true}>Loading</AtlButton>
<AtlButton disabled={true}>Disabled</AtlButton>`,
      vue: `<AtlButton variant="primary">Primary</AtlButton>
<AtlButton variant="secondary">Secondary</AtlButton>
<AtlButton variant="outline">Outline</AtlButton>
<AtlButton :loading="true">Loading</AtlButton>
<AtlButton :disabled="true">Disabled</AtlButton>`,
    },
    aiUsage: {
      bestPractices: [
        'Always specify the "variant" to communicate the visual intent to the model.',
        'Use the "loading" state instead of custom spinner implementations for consistency.',
        'Specify the button "size" to ensure correct alignment in complex layouts.'
      ],
      promptSnippet: 'Create a primary AtlButton that says "Submit Form" and shows a loading state.',
      commonHallucinations: [
        'AI may use standard HTML "button" instead of "AtlButton".',
        'AI may try to use "ghost" or "text" variants which are not yet supported.'
      ]
    }
  },

  input: {
    name: 'Input',
    selector: 'AtlInput',
    description: 'A text input field that integrates with Signal Forms. Supports all standard HTML input types, validation states, and error display.',
    category: 'Inputs',
    props: [
      { name: 'value', type: 'string', default: "''", description: 'Controlled value', angular: { name: '[(value)]' } },
      { name: 'onValueChange', type: '(value: string) => void', default: '—', description: 'Called when the input value changes', angular: { name: '(valueChange)' } },
      { name: 'type', type: "'text' | 'email' | 'password' | 'number' | 'tel' | 'url'", default: "'text'", description: 'Input type' },
      { name: 'placeholder', type: 'string', default: "''", description: 'Placeholder text' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the input' },
      { name: 'readonly', type: 'boolean', default: 'false', description: 'Makes the input read-only' },
      { name: 'invalid', type: 'boolean', default: 'false', description: 'Applies invalid/error styling' },
      { name: 'required', type: 'boolean', default: 'false', description: 'Marks field as required' },
      { name: 'name', type: 'string', default: "''", description: 'HTML name attribute for form submission' },
    ],
    examples: {
      angular: `<atl-input type="email" placeholder="you@example.com" [(value)]="email" />
<atl-input type="password" placeholder="Password" [(value)]="password" />
<atl-input [invalid]="true" placeholder="Invalid state" />
<atl-input [disabled]="true" placeholder="Disabled" />`,
      react: `<AtlInput type="email" placeholder="you@example.com" value={email} onValueChange={setEmail} />
<AtlInput type="password" placeholder="Password" value={password} onValueChange={setPassword} />
<AtlInput invalid={true} placeholder="Invalid state" />
<AtlInput disabled={true} placeholder="Disabled" />`,
      vue: `<AtlInput type="email" placeholder="you@example.com" v-model:value="email" />
<AtlInput type="password" placeholder="Password" v-model:value="password" />
<AtlInput :invalid="true" placeholder="Invalid state" />
<AtlInput :disabled="true" placeholder="Disabled" />`,
    },
    aiUsage: {
      bestPractices: [
        'Explicitly state the "type" property to ensure correct mobile keyboards.',
        'Always provide a meaningful "placeholder" to improve form scannability.',
        'Use the "invalid" prop combined with AtlAlert for accessible error feedback.'
      ],
      promptSnippet: 'Create a required AtlInput for email with a placeholder "name@company.com".',
      commonHallucinations: [
        'AI often uses "onChange" (standard React/DOM) instead of "onValueChange".',
        'AI may forget that "AtlInput" is a controlled component and needs state management.'
      ]
    }
  },

  textarea: {
    name: 'Textarea',
    selector: 'AtlTextarea',
    description: 'A multi-line text input. Supports auto-resize to fit content and integrates with Signal Forms.',
    category: 'Inputs',
    props: [
      { name: 'value', type: 'string', default: "''", description: 'Controlled value' },
      { name: 'onValueChange', type: '(value: string) => void', default: '—', description: 'Called when the textarea value changes', angular: { name: '(valueChange)' } },
      { name: 'rows', type: 'number', default: '3', description: 'Initial number of visible rows' },
      { name: 'placeholder', type: 'string', default: "''", description: 'Placeholder text' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the textarea' },
      { name: 'readonly', type: 'boolean', default: 'false', description: 'Makes the textarea read-only' },
      { name: 'invalid', type: 'boolean', default: 'false', description: 'Applies invalid/error styling' },
      { name: 'required', type: 'boolean', default: 'false', description: 'Marks field as required' },
      { name: 'name', type: 'string', default: "''", description: 'HTML name attribute for form submission' },
      { name: 'autoResize', type: 'boolean', default: 'false', description: 'Grows height automatically as content grows' },
    ],
    examples: {
      angular: `<atl-textarea placeholder="Tell us about yourself" [rows]="4" [(value)]="bio" />
<atl-textarea [autoResize]="true" placeholder="Auto-resizes as you type..." />
<atl-textarea [disabled]="true" placeholder="Disabled" />`,
      react: `<AtlTextarea placeholder="Tell us about yourself" rows={4} value={bio} onValueChange={setBio} />
<AtlTextarea autoResize={true} placeholder="Auto-resizes as you type..." />
<AtlTextarea disabled={true} placeholder="Disabled" />`,
      vue: `<AtlTextarea placeholder="Tell us about yourself" :rows="4" v-model:value="bio" />
<AtlTextarea :autoResize="true" placeholder="Auto-resizes as you type..." />
<AtlTextarea :disabled="true" placeholder="Disabled" />`,
    },
  },

  checkbox: {
    name: 'Checkbox',
    selector: 'AtlCheckbox',
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
    examples: {
      angular: `<atl-checkbox [(checked)]="agreed">I agree to the terms</atl-checkbox>
<atl-checkbox [(checked)]="pre">Pre-checked</atl-checkbox>
<atl-checkbox [indeterminate]="true">Indeterminate</atl-checkbox>
<atl-checkbox [disabled]="true">Disabled</atl-checkbox>`,
      react: `<AtlCheckbox checked={agreed} onCheckedChange={setAgreed}>I agree to the terms</AtlCheckbox>
<AtlCheckbox checked={true}>Pre-checked</AtlCheckbox>
<AtlCheckbox indeterminate={true}>Indeterminate</AtlCheckbox>
<AtlCheckbox disabled={true}>Disabled</AtlCheckbox>`,
      vue: `<AtlCheckbox v-model:checked="agreed">I agree to the terms</AtlCheckbox>
<AtlCheckbox v-model:checked="pre">Pre-checked</AtlCheckbox>
<AtlCheckbox :indeterminate="true">Indeterminate</AtlCheckbox>
<AtlCheckbox :disabled="true">Disabled</AtlCheckbox>`,
    },
  },

  toggle: {
    name: 'Toggle',
    selector: 'AtlToggle',
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
    examples: {
      angular: `<atl-toggle [(checked)]="notifications">Enable notifications</atl-toggle>
<atl-toggle [(checked)]="active">Active toggle</atl-toggle>
<atl-toggle [disabled]="true">Disabled</atl-toggle>`,
      react: `<AtlToggle checked={notifications} onCheckedChange={setNotifications}>Enable notifications</AtlToggle>
<AtlToggle checked={true}>Active toggle</AtlToggle>
<AtlToggle disabled={true}>Disabled</AtlToggle>`,
      vue: `<AtlToggle v-model:checked="notifications">Enable notifications</AtlToggle>
<AtlToggle v-model:checked="active">Active toggle</AtlToggle>
<AtlToggle :disabled="true">Disabled</AtlToggle>`,
    },
  },

  'radio-group': {
    name: 'RadioGroup',
    selector: 'AtlRadioGroup + AtlRadio',
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
    examples: {
      angular: `<atl-radio-group name="plan" [(value)]="plan">
  <atl-radio radioValue="free">Free</atl-radio>
  <atl-radio radioValue="pro">Pro</atl-radio>
  <atl-radio radioValue="enterprise">Enterprise</atl-radio>
</atl-radio-group>`,
      react: `<AtlRadioGroup name="plan" value="free" onValueChange={(v) => console.log(v)}>
  <AtlRadio radioValue="free">Free</AtlRadio>
  <AtlRadio radioValue="pro">Pro</AtlRadio>
  <AtlRadio radioValue="enterprise">Enterprise</AtlRadio>
</AtlRadioGroup>`,
      vue: `<AtlRadioGroup name="plan" v-model:value="plan">
  <AtlRadio radioValue="free">Free</AtlRadio>
  <AtlRadio radioValue="pro">Pro</AtlRadio>
  <AtlRadio radioValue="enterprise">Enterprise</AtlRadio>
</AtlRadioGroup>`,
    },
    composition: [
      {
        name: 'AtlRadio',
        description: 'An individual radio button. Place inside AtlRadioGroup — the group manages the checked state.',
        props: [
          { name: 'radioValue', type: 'string', default: '—', description: 'Value this radio contributes when selected (required).' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable this radio only.' },
        ],
      },
    ],
    a11y: {
      role: 'radiogroup',
      keyboard: [
        { key: 'Tab', action: 'Move focus into the group (to the checked radio, or the first radio if none is checked).' },
        { key: 'Arrow Up / Left', action: 'Select the previous radio, wrapping to the last.' },
        { key: 'Arrow Down / Right', action: 'Select the next radio, wrapping to the first.' },
        { key: 'Space', action: 'Select the focused radio.' },
      ],
      notes: [
        'Only the currently selected radio is in the tab sequence (roving tabindex) — the whole group is one tab stop.',
        'If you supply a label via <label> or aria-labelledby on the group, screen readers announce it when focus enters.',
      ],
    },
  },

  select: {
    name: 'Select',
    selector: 'AtlSelect + AtlOption',
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
    examples: {
      angular: `<atl-select placeholder="Select a country" [(value)]="country">
  <atl-option optionValue="us">United States</atl-option>
  <atl-option optionValue="ca">Canada</atl-option>
  <atl-option optionValue="uk" [disabled]="true">United Kingdom (unavailable)</atl-option>
</atl-select>`,
      react: `<AtlSelect placeholder="Select a country" value={country} onValueChange={setCountry}>
  <AtlOption optionValue="us">United States</AtlOption>
  <AtlOption optionValue="ca">Canada</AtlOption>
  <AtlOption optionValue="uk" disabled={true}>United Kingdom (unavailable)</AtlOption>
</AtlSelect>`,
      vue: `<AtlSelect placeholder="Select a country" v-model:value="country">
  <AtlOption optionValue="us">United States</AtlOption>
  <AtlOption optionValue="ca">Canada</AtlOption>
  <AtlOption optionValue="uk" :disabled="true">United Kingdom (unavailable)</AtlOption>
</AtlSelect>`,
    },
    composition: [
      {
        name: 'AtlOption',
        description: 'A selectable option inside AtlSelect. The visible label is the element\'s children.',
        props: [
          { name: 'optionValue', type: 'string', default: '—', description: 'Value committed to the parent AtlSelect when selected (required).' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevent the option from being focused or selected.' },
        ],
      },
    ],
    aiUsage: {
      bestPractices: [
        'Always use "AtlOption" for items within the "AtlSelect".',
        'Specify the "optionValue" for each option to ensure correct selection logic.',
        'Use the "placeholder" prop to provide a default empty state.'
      ],
      promptSnippet: 'Create an AtlSelect for choosing a "Plan" with options "Basic", "Pro", and "Enterprise".',
      commonHallucinations: [
        'AI may use standard HTML "select" and "option" tags.',
        'AI may try to use "items" or "options" prop instead of the composable child pattern.'
      ]
    },
    a11y: {
      role: 'combobox / listbox',
      keyboard: [
        { key: 'Enter / Space / Arrow Down', action: 'Open the listbox.' },
        { key: 'Arrow Up / Down', action: 'Move between options.' },
        { key: 'Home / End', action: 'Jump to the first / last option.' },
        { key: 'Enter', action: 'Confirm the highlighted option and close.' },
        { key: 'Escape', action: 'Close without changing selection.' },
        { key: 'Type a character', action: 'Jump to the next option starting with that letter.' },
      ],
      notes: [
        'The trigger carries aria-expanded and aria-controls that point at the listbox.',
        'Disabled options are skipped by keyboard navigation.',
      ],
    }
  },

  combobox: {
    name: 'Combobox',
    selector: 'AtlCombobox',
    description: 'A filterable autocomplete input. The user can type to narrow down a large list of options.',
    category: 'Inputs',
    status: 'new',
    props: [
      { name: 'value', type: 'string', default: "''", description: 'Controlled value' },
      { name: 'onValueChange', type: '(value: string) => void', default: '—', description: 'Called when selection changes' },
      { name: 'options', type: 'AtlComboboxOption[]', default: '[]', description: 'Array of { label, value } objects' },
      { name: 'placeholder', type: 'string', default: "''", description: 'Placeholder text' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the combobox' },
      { name: 'invalid', type: 'boolean', default: 'false', description: 'Applies invalid/error styling' },
    ],
    examples: {
      angular: `<atl-combobox
  placeholder="Search framework..."
  [(value)]="framework"
  [options]="[
    { label: 'Angular', value: 'ng' },
    { label: 'React', value: 'react' },
    { label: 'Vue', value: 'vue' }
  ]"
/>`,
      react: `<AtlCombobox
  placeholder="Search framework..."
  value={framework}
  onValueChange={setFramework}
  options={[
    { label: 'Angular', value: 'ng' },
    { label: 'React', value: 'react' },
    { label: 'Vue', value: 'vue' }
  ]}
/>`,
      vue: `<AtlCombobox
  placeholder="Search framework..."
  v-model:value="framework"
  :options="[
    { label: 'Angular', value: 'ng' },
    { label: 'React', value: 'react' },
    { label: 'Vue', value: 'vue' }
  ]"
/>`,
    },
    a11y: {
      role: 'combobox',
      keyboard: [
        { key: 'Type', action: 'Filter the options. The list updates in place.' },
        { key: 'Arrow Down', action: 'Open the list (if closed) and focus the first matching option.' },
        { key: 'Arrow Up / Down', action: 'Move between filtered options.' },
        { key: 'Enter', action: 'Select the highlighted option.' },
        { key: 'Escape', action: 'Close the list and clear focus.' },
      ],
      notes: [
        'The input has aria-autocomplete="list" and aria-expanded reflects the open state.',
        'The list is exposed as aria-activedescendant so screen readers announce the highlighted option without losing text-caret focus.',
      ],
    },
  },

  badge: {
    name: 'Badge',
    selector: 'AtlBadge',
    description: 'A small inline label for status, categories, or counts. Use alongside cards, list items, and table cells.',
    category: 'Display',
    props: [
      { name: 'variant', type: "'default' | 'success' | 'warning' | 'danger' | 'info'", default: "'default'", description: 'Color scheme of the badge' },
      { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Size of the badge' },
    ],
    examples: {
      angular: `<atl-badge>Default</atl-badge>
<atl-badge variant="success">Active</atl-badge>
<atl-badge variant="warning">Pending</atl-badge>
<atl-badge variant="danger">Error</atl-badge>
<atl-badge variant="info">Info</atl-badge>
<atl-badge size="sm" variant="success">Small</atl-badge>`,
      react: `<AtlBadge>Default</AtlBadge>
<AtlBadge variant="success">Active</AtlBadge>
<AtlBadge variant="warning">Pending</AtlBadge>
<AtlBadge variant="danger">Error</AtlBadge>
<AtlBadge variant="info">Info</AtlBadge>
<AtlBadge size="sm" variant="success">Small</AtlBadge>`,
      vue: `<AtlBadge>Default</AtlBadge>
<AtlBadge variant="success">Active</AtlBadge>
<AtlBadge variant="warning">Pending</AtlBadge>
<AtlBadge variant="danger">Error</AtlBadge>
<AtlBadge variant="info">Info</AtlBadge>
<AtlBadge size="sm" variant="success">Small</AtlBadge>`,
    },
  },

  icon: {
    name: 'Icon',
    selector: 'AtlIcon',
    description: 'Pictogram glyph icon. 21 named variants matching the Figma `AtlIcon` component set. Decorative by default; pass `label` to announce a meaning to assistive tech.',
    category: 'Display',
    props: [
      { name: 'name', type: "'success' | 'warning' | 'danger' | 'info' | 'error' | 'chevron-up' | 'chevron-down' | 'chevron-left' | 'chevron-right' | 'sort-asc' | 'sort-desc' | 'arrow-right' | 'arrow-left' | 'copy' | 'paste' | 'add' | 'edit' | 'delete' | 'close' | 'more' | 'default-toast'", default: '—', description: 'The icon name. Required.' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Icon size. Maps to the framework font-size scale.' },
      { name: 'label', type: 'string', default: 'undefined', description: 'Accessible label. When provided, the icon is announced as an image with this label. When omitted, the icon is hidden from assistive tech (treated as decorative).' },
    ],
    examples: {
      angular: `<atl-icon name="success" />
<atl-icon name="warning" size="lg" label="Warning" />
<atl-icon name="chevron-down" size="sm" />`,
      react: `<AtlIcon name="success" />
<AtlIcon name="warning" size="lg" label="Warning" />
<AtlIcon name="chevron-down" size="sm" />`,
      vue: `<AtlIcon name="success" />
<AtlIcon name="warning" size="lg" label="Warning" />
<AtlIcon name="chevron-down" size="sm" />`,
    },
  },

  card: {
    name: 'Card',
    selector: 'AtlCard',
    description: 'A container component for grouped content. Compose with AtlCardHeader, AtlCardContent, and AtlCardFooter.',
    category: 'Display',
    props: [
      { name: 'variant', type: "'elevated' | 'outlined' | 'flat'", default: "'elevated'", description: 'Visual style of the card' },
      { name: 'padding', type: "'none' | 'sm' | 'md' | 'lg'", default: "'md'", description: 'Padding size inside the card' },
      { name: 'role', type: "'article' | 'region' | 'section'", default: '—', description: 'Opt-in landmark role. Default is no role (plain div). Use article for self-contained content, region for a perceivable area (pair with aria-label), section for HTML <section> semantics.' },
    ],
    examples: {
      angular: `<atl-card variant="elevated" padding="md">
  <atl-card-header>Card Title</atl-card-header>
  <atl-card-content>
    This is the card body content. It can contain anything.
  </atl-card-content>
  <atl-card-footer>
    <atl-button variant="primary" size="sm">Action</atl-button>
  </atl-card-footer>
</atl-card>`,
      react: `<AtlCard variant="elevated" padding="md">
  <AtlCardHeader>Card Title</AtlCardHeader>
  <AtlCardContent>
    This is the card body content. It can contain anything.
  </AtlCardContent>
  <AtlCardFooter>
    <AtlButton variant="primary" size="sm">Action</AtlButton>
  </AtlCardFooter>
</AtlCard>`,
      vue: `<AtlCard variant="elevated" padding="md">
  <AtlCardHeader>Card Title</AtlCardHeader>
  <AtlCardContent>
    This is the card body content. It can contain anything.
  </AtlCardContent>
  <AtlCardFooter>
    <AtlButton variant="primary" size="sm">Action</AtlButton>
  </AtlCardFooter>
</AtlCard>`,
    },
    composition: [
      { name: 'AtlCardHeader',  description: 'Title row at the top of the card. Slot-only — takes no props.',      props: [] },
      { name: 'AtlCardContent', description: 'Main body of the card. Slot-only — takes no props.',                  props: [] },
      { name: 'AtlCardFooter',  description: 'Action row at the bottom of the card. Slot-only — takes no props.',   props: [] },
    ],
  },

  table: {
    name: 'Table',
    selector: 'AtlTable',
    description: 'A comprehensive data table component for displaying structured information. Supports sorting, row selection, sticky headers, and custom empty states.',
    category: 'Display',
    status: 'new',
    props: [
      { name: 'variant', type: "'default' | 'striped' | 'bordered'", default: "'default'", description: 'Row background styling' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Vertical padding of cells' },
      { name: 'stickyHeader', type: 'boolean', default: 'false', description: 'Makes header row stick to the top on scroll' },
      { name: 'aria-label', type: 'string', default: "'Table'", description: 'Accessible name for the scrollable wrapper region. Announced by screen readers when keyboard users focus the wrapper to scroll horizontally.' },
    ],
    examples: {
      angular: `<atl-table variant="striped">
  <atl-thead>
    <atl-tr>
      <atl-th [sortable]="true">Name</atl-th>
      <atl-th>Status</atl-th>
    </atl-tr>
  </atl-thead>
  <atl-tbody [empty]="rows.length === 0" [colSpan]="2">
    @for (row of rows; track row.id) {
      <atl-tr [selectable]="true">
        <atl-td>{{ row.name }}</atl-td>
        <atl-td>{{ row.status }}</atl-td>
      </atl-tr>
    }
    <div atlTableEmpty>No results found</div>
  </atl-tbody>
</atl-table>`,
      react: `<AtlTable variant="striped">
  <AtlThead>
    <AtlTr>
      <AtlTh sortable>Name</AtlTh>
      <AtlTh>Status</AtlTh>
    </AtlTr>
  </AtlThead>
  <AtlTbody empty={rows.length === 0} colSpan={2} emptyContent="No results found">
    {rows.map((row) => (
      <AtlTr key={row.id} selectable>
        <AtlTd>{row.name}</AtlTd>
        <AtlTd>{row.status}</AtlTd>
      </AtlTr>
    ))}
  </AtlTbody>
</AtlTable>`,
      vue: `<AtlTable variant="striped">
  <AtlThead>
    <AtlTr>
      <AtlTh :sortable="true">Name</AtlTh>
      <AtlTh>Status</AtlTh>
    </AtlTr>
  </AtlThead>
  <AtlTbody :empty="rows.length === 0" :colSpan="2">
    <AtlTr v-for="row in rows" :key="row.id" :selectable="true">
      <AtlTd>{{ row.name }}</AtlTd>
      <AtlTd>{{ row.status }}</AtlTd>
    </AtlTr>
    <template #empty>No results found</template>
  </AtlTbody>
</AtlTable>`,
    },
    composition: [
      {
        name: 'AtlThead',
        description: 'Header row container. Slot-only — takes no props.',
        props: [],
      },
      {
        name: 'AtlTbody',
        description: 'Body container. Renders its own empty state when empty is true.',
        props: [
          { name: 'empty', type: 'boolean', default: 'false', description: 'Show an empty-state row instead of children.' },
          { name: 'colSpan', type: 'number', default: '—', description: 'Number of columns the empty-state row should span.' },
        ],
      },
      {
        name: 'AtlTr',
        description: 'A single row. Can be made selectable for row-level interaction.',
        props: [
          { name: 'selected', type: 'boolean', default: 'false', description: 'Visual + ARIA selected state.' },
          { name: 'selectable', type: 'boolean', default: 'false', description: 'Makes the row keyboard-focusable and emits selection events.' },
          { name: 'rowId', type: 'string', default: '—', description: 'Stable identifier for the row — used in selection change events.' },
        ],
      },
      {
        name: 'AtlTh',
        description: 'A header cell. Make it sortable to expose a sort-toggle button.',
        props: [
          { name: 'sortable', type: 'boolean', default: 'false', description: 'Shows a sort indicator and announces the column as sortable.' },
          { name: 'sortDirection', type: "'asc' | 'desc' | null", default: 'null', description: 'Current sort state when sortable.' },
          { name: 'align', type: "'start' | 'center' | 'end'", default: "'start'", description: 'Text alignment in the cell.' },
          { name: 'width', type: 'string', default: '—', description: 'Explicit column width (any CSS length).' },
        ],
      },
      {
        name: 'AtlTd',
        description: 'A body cell.',
        props: [
          { name: 'align', type: "'start' | 'center' | 'end'", default: "'start'", description: 'Text alignment in the cell.' },
        ],
      },
    ],
  },

  avatar: {
    name: 'Avatar',
    selector: 'AtlAvatar + AtlAvatarGroup',
    description: 'User avatar with image, initials fallback, and status indicator. Group avatars with AtlAvatarGroup.',
    category: 'Display',
    props: [
      { name: 'src', type: 'string', default: "''", description: 'Image URL' },
      { name: 'alt', type: 'string', default: "''", description: 'Alt text for the avatar image' },
      { name: 'name', type: 'string', default: "''", description: 'Used for initials fallback and aria-label' },
      { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Size of the avatar' },
      { name: 'shape', type: "'circle' | 'square'", default: "'circle'", description: 'Shape of the avatar' },
      { name: 'status', type: "'online' | 'offline' | 'away' | 'busy' | ''", default: "''", description: 'Status dot indicator' },
    ],
    examples: {
      angular: `<atl-avatar name="Jane Doe" size="md" status="online" />
<atl-avatar name="John Smith" size="lg" shape="square" />
<atl-avatar-group [max]="3" size="md">
  <atl-avatar name="Alice" />
  <atl-avatar name="Bob" />
  <atl-avatar name="Carol" />
  <atl-avatar name="Dave" />
</atl-avatar-group>`,
      react: `<AtlAvatar name="Jane Doe" size="md" status="online" />
<AtlAvatar name="John Smith" size="lg" shape="square" />
<AtlAvatarGroup max={3} size="md">
  <AtlAvatar name="Alice" />
  <AtlAvatar name="Bob" />
  <AtlAvatar name="Carol" />
  <AtlAvatar name="Dave" />
</AtlAvatarGroup>`,
      vue: `<AtlAvatar name="Jane Doe" size="md" status="online" />
<AtlAvatar name="John Smith" size="lg" shape="square" />
<AtlAvatarGroup :max="3" size="md">
  <AtlAvatar name="Alice" />
  <AtlAvatar name="Bob" />
  <AtlAvatar name="Carol" />
  <AtlAvatar name="Dave" />
</AtlAvatarGroup>`,
    },
    composition: [
      {
        name: 'AtlAvatarGroup',
        description: 'Stacks multiple AtlAvatar children with a "+N" overflow indicator. Pass size once on the group and it applies to every child.',
        props: [
          { name: 'max', type: 'number', default: '—', description: 'Maximum number of avatars to show. Remaining children are summarized as "+N".' },
          { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Applied to every child avatar — overrides their individual size.' },
        ],
      },
    ],
  },

  skeleton: {
    name: 'Skeleton',
    selector: 'AtlSkeleton',
    description: 'Loading placeholder that mimics content shape. Compose multiple skeletons to match your layout.',
    category: 'Display',
    props: [
      { name: 'variant', type: "'text' | 'circular' | 'rectangular'", default: "'text'", description: 'Shape of the skeleton' },
      { name: 'width', type: 'string', default: "'100%'", description: 'CSS width (e.g. "200px", "60%")' },
      { name: 'height', type: 'string', default: "''", description: 'CSS height. Auto per variant if not set.' },
      { name: 'animated', type: 'boolean', default: 'true', description: 'Enables shimmer animation' },
    ],
    examples: {
      angular: `<atl-skeleton variant="text" />
<atl-skeleton variant="text" width="60%" />
<atl-skeleton variant="circular" width="40px" />
<atl-skeleton variant="rectangular" height="200px" />`,
      react: `<AtlSkeleton variant="text" />
<AtlSkeleton variant="text" width="60%" />
<AtlSkeleton variant="circular" width="40px" />
<AtlSkeleton variant="rectangular" height="200px" />`,
      vue: `<AtlSkeleton variant="text" />
<AtlSkeleton variant="text" width="60%" />
<AtlSkeleton variant="circular" width="40px" />
<AtlSkeleton variant="rectangular" height="200px" />`,
    },
  },

  progress: {
    name: 'Progress',
    selector: 'AtlProgress',
    description: 'A horizontal progress bar for showing completion percentage or indeterminate loading.',
    category: 'Display',
    props: [
      { name: 'value', type: 'number', default: '0', description: 'Progress value from 0 to 100' },
      { name: 'max', type: 'number', default: '100', description: 'Maximum value' },
      { name: 'indeterminate', type: 'boolean', default: 'false', description: 'Shows animated indeterminate state' },
      { name: 'variant', type: "'default' | 'success' | 'warning' | 'danger'", default: "'default'", description: 'Color variant' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Size of the progress bar' },
      { name: 'label', type: 'string', default: '—', description: 'Accessible name (aria-label). Required by ARIA when no visible label is nearby.' },
    ],
    examples: {
      angular: `<atl-progress [value]="25" label="Upload progress" />
<atl-progress [value]="60" variant="success" label="Form completion" />
<atl-progress [value]="85" variant="warning" label="Quota usage" />
<atl-progress [indeterminate]="true" label="Loading…" />`,
      react: `<AtlProgress value={25} label="Upload progress" />
<AtlProgress value={60} variant="success" label="Form completion" />
<AtlProgress value={85} variant="warning" label="Quota usage" />
<AtlProgress indeterminate label="Loading…" />`,
      vue: `<AtlProgress :value="25" label="Upload progress" />
<AtlProgress :value="60" variant="success" label="Form completion" />
<AtlProgress :value="85" variant="warning" label="Quota usage" />
<AtlProgress :indeterminate="true" label="Loading…" />`,
    },
  },

  breadcrumbs: {
    name: 'Breadcrumbs',
    selector: 'AtlBreadcrumbs + AtlBreadcrumbItem',
    description: 'Navigation breadcrumb trail showing the current page location within a hierarchy.',
    category: 'Navigation',
    props: [
      { name: 'separator', type: 'string', default: "'/'", description: 'Separator character between items' },
    ],
    examples: {
      angular: `<atl-breadcrumbs>
  <atl-breadcrumb-item href="/">Home</atl-breadcrumb-item>
  <atl-breadcrumb-item href="/components">Components</atl-breadcrumb-item>
  <atl-breadcrumb-item>Breadcrumbs</atl-breadcrumb-item>
</atl-breadcrumbs>`,
      react: `<AtlBreadcrumbs>
  <AtlBreadcrumbItem href="/">Home</AtlBreadcrumbItem>
  <AtlBreadcrumbItem href="/components">Components</AtlBreadcrumbItem>
  <AtlBreadcrumbItem current>Breadcrumbs</AtlBreadcrumbItem>
</AtlBreadcrumbs>`,
      vue: `<AtlBreadcrumbs>
  <AtlBreadcrumbItem href="/">Home</AtlBreadcrumbItem>
  <AtlBreadcrumbItem href="/components">Components</AtlBreadcrumbItem>
  <AtlBreadcrumbItem :current="true">Breadcrumbs</AtlBreadcrumbItem>
</AtlBreadcrumbs>`,
    },
    composition: [
      {
        name: 'AtlBreadcrumbItem',
        description: 'One crumb. Omit href (or set current) on the final item; it renders as text and carries aria-current="page".',
        props: [
          { name: 'href', type: 'string', default: '—', description: 'Link destination. Omit for the current page.' },
          { name: 'current', type: 'boolean', default: 'false', description: 'Marks the item as the current page. Auto-detected when href is missing.' },
        ],
      },
    ],
  },

  tabs: {
    name: 'Tabs',
    selector: 'AtlTabGroup + AtlTab',
    description: 'An accessible tabbed interface. Supports roving tabindex, arrow key navigation, and a pills variant.',
    category: 'Navigation',
    props: [
      { name: 'selectedIndex', type: 'number', default: '0', description: 'Index of the selected tab' },
      { name: 'onSelectedIndexChange', type: '(index: number) => void', default: '—', description: 'Called when selection changes' },
      { name: 'variant', type: "'default' | 'pills'", default: "'default'", description: 'Visual style of the tab strip' },
    ],
    examples: {
      angular: `<atl-tab-group [selectedIndex]="0">
  <atl-tab label="Account">Account settings content.</atl-tab>
  <atl-tab label="Notifications">Notification preferences.</atl-tab>
  <atl-tab label="Billing" [disabled]="true">Billing info.</atl-tab>
</atl-tab-group>`,
      react: `<AtlTabGroup selectedIndex={0}>
  <AtlTab label="Account">Account settings content.</AtlTab>
  <AtlTab label="Notifications">Notification preferences.</AtlTab>
  <AtlTab label="Billing" disabled={true}>Billing info.</AtlTab>
</AtlTabGroup>`,
      vue: `<AtlTabGroup :selectedIndex="0">
  <AtlTab label="Account">Account settings content.</AtlTab>
  <AtlTab label="Notifications">Notification preferences.</AtlTab>
  <AtlTab label="Billing" :disabled="true">Billing info.</AtlTab>
</AtlTabGroup>`,
    },
    composition: [
      {
        name: 'AtlTab',
        description: 'A single tab + panel pair. Children render inside the panel; the label renders in the tablist.',
        props: [
          { name: 'label', type: 'string', default: '—', description: 'Text shown on the tab button (required).' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Skip this tab in keyboard navigation and prevent activation.' },
        ],
      },
    ],
    a11y: {
      role: 'tablist / tab / tabpanel',
      keyboard: [
        { key: 'Arrow Left / Right', action: 'Move between tabs. Focus wraps at the ends.' },
        { key: 'Home / End', action: 'Jump to the first / last tab.' },
        { key: 'Enter / Space', action: 'Activate the focused tab (manual activation mode).' },
      ],
      notes: [
        'Tabs use roving tabindex — only the active tab is in the document tab sequence.',
        'Each AtlTab has aria-controls pointing at its panel, and the panel has aria-labelledby pointing back at the tab. Disabled tabs are skipped by arrow navigation.',
      ],
    },
  },

  stepper: {
    name: 'Stepper',
    selector: 'AtlStepper + AtlStep',
    description: 'A multi-step wizard for complex processes. Supports linear and non-linear navigation.',
    category: 'Navigation',
    status: 'new',
    props: [
      { name: 'activeStep', type: 'number', default: '0', description: 'Currently active step index' },
      { name: 'linear', type: 'boolean', default: 'false', description: 'Forces user to complete steps in order' },
      { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Stepper layout direction' },
    ],
    examples: {
      angular: `<atl-stepper [activeStep]="0">
  <atl-step label="Basic Info">Step 1 content</atl-step>
  <atl-step label="Verification">Step 2 content</atl-step>
  <atl-step label="Complete">Step 3 content</atl-step>
</atl-stepper>`,
      react: `<AtlStepper activeStep={0}>
  <AtlStep label="Basic Info">Step 1 content</AtlStep>
  <AtlStep label="Verification">Step 2 content</AtlStep>
  <AtlStep label="Complete">Step 3 content</AtlStep>
</AtlStepper>`,
      vue: `<AtlStepper :activeStep="0">
  <AtlStep label="Basic Info">Step 1 content</AtlStep>
  <AtlStep label="Verification">Step 2 content</AtlStep>
  <AtlStep label="Complete">Step 3 content</AtlStep>
</AtlStepper>`,
    },
    composition: [
      {
        name: 'AtlStep',
        description: 'A single step in the wizard. Children render when the step is active.',
        props: [
          { name: 'label', type: 'string', default: '—', description: 'Short title shown in the stepper header (required).' },
          { name: 'description', type: 'string', default: '—', description: 'Optional secondary line under the label.' },
          { name: 'completed', type: 'boolean', default: 'false', description: 'Marks the step as completed (shows a checkmark).' },
          { name: 'error', type: 'boolean', default: 'false', description: 'Marks the step as errored (shows an error glyph).' },
          { name: 'optional', type: 'boolean', default: 'false', description: 'Tags the step as optional in the UI.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents the step from being activated.' },
        ],
      },
    ],
  },

  pagination: {
    name: 'Pagination',
    selector: 'AtlPagination',
    description: 'Page navigation control for paginated data. Shows page numbers with previous/next buttons.',
    category: 'Navigation',
    props: [
      { name: 'page', type: 'number', default: '1', description: 'Current page (1-indexed)' },
      { name: 'pageCount', type: 'number', default: '1', description: 'Total number of pages' },
      { name: 'onPageChange', type: '(page: number) => void', default: '—', description: 'Called when the user navigates to a page' },
      { name: 'siblingCount', type: 'number', default: '1', description: 'Number of page buttons on each side of current page' },
      { name: 'showFirstLast', type: 'boolean', default: 'true', description: 'Show first/last page jump buttons' },
    ],
    examples: {
      angular: `<atl-pagination
  [(page)]="page"
  [pageCount]="10"
/>`,
      react: `<AtlPagination
  page={page}
  pageCount={10}
  onPageChange={setPage}
/>`,
      vue: `<AtlPagination
  :page="page"
  :pageCount="10"
  @pageChange="page = $event"
/>`,
    },
  },

  menu: {
    name: 'Menu',
    selector: 'AtlMenu + AtlMenuItem + AtlMenuTrigger',
    description: 'A dropdown context menu. Handles keyboard navigation, focus management, ARIA, and nested submenus.',
    category: 'Navigation',
    props: [
      { name: 'variant', type: "'default' | 'compact'", default: "'default'", description: 'Density of the menu' },
    ],
    examples: {
      angular: `<atl-button [atlMenuTriggerFor]="actions">Actions ▾</atl-button>
<ng-template #actions>
  <atl-menu>
    <atl-menu-item (triggered)="copy()">Copy</atl-menu-item>
    <atl-menu-item (triggered)="paste()">Paste</atl-menu-item>
    <atl-menu-separator />
    <atl-menu-item [disabled]="true">Delete</atl-menu-item>
  </atl-menu>
</ng-template>`,
      react: `<AtlMenuTrigger
  menu={
    <AtlMenu>
      <AtlMenuItem onTriggered={() => console.log('copy')}>Copy</AtlMenuItem>
      <AtlMenuItem onTriggered={() => console.log('paste')}>Paste</AtlMenuItem>
      <AtlMenuSeparator />
      <AtlMenuItem disabled>Delete</AtlMenuItem>
    </AtlMenu>
  }
>
  {({ onClick, ref }) => (
    <AtlButton ref={ref as React.RefObject<HTMLButtonElement>} onClick={onClick}>
      Actions ▾
    </AtlButton>
  )}
</AtlMenuTrigger>`,
      vue: `<AtlMenuTrigger>
  <template #trigger>
    <AtlButton>Actions ▾</AtlButton>
  </template>
  <template #menu>
    <AtlMenu>
      <AtlMenuItem @triggered="copy">Copy</AtlMenuItem>
      <AtlMenuItem @triggered="paste">Paste</AtlMenuItem>
      <AtlMenuSeparator />
      <AtlMenuItem :disabled="true">Delete</AtlMenuItem>
    </AtlMenu>
  </template>
</AtlMenuTrigger>`,
    },
    composition: [
      {
        name: 'AtlMenuItem',
        description: 'A selectable menu entry. Children render as the label.',
        props: [
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents activation and skips the item in keyboard navigation.' },
        ],
      },
      {
        name: 'AtlMenuSeparator',
        description: 'A visual divider between groups of menu items. Rendered with role="separator" — screen readers announce it as a group boundary. Takes no props.',
        props: [],
      },
    ],
    a11y: {
      role: 'menu / menuitem',
      keyboard: [
        { key: 'Enter / Space / Arrow Down', action: 'Open the menu from the trigger and focus the first item.' },
        { key: 'Arrow Up / Down', action: 'Move between items, wrapping at the ends.' },
        { key: 'Home / End', action: 'Jump to the first / last item.' },
        { key: 'Enter / Space', action: 'Activate the focused item and close the menu.' },
        { key: 'Escape', action: 'Close and return focus to the trigger.' },
        { key: 'Arrow Right', action: 'Open a submenu (if present).' },
        { key: 'Arrow Left', action: 'Close the current submenu and return to parent.' },
      ],
      notes: [
        'The trigger carries aria-haspopup="menu" and aria-expanded.',
        'Separators render as role="separator" and are skipped by keyboard navigation.',
      ],
    },
  },

  dialog: {
    name: 'Dialog',
    selector: 'AtlDialog',
    description: 'A modal dialog using the native <dialog> element. Includes focus trap, Escape to close, backdrop click to close, and smooth animations.',
    category: 'Overlay',
    props: [
      { name: 'open', type: 'boolean', default: 'false', description: 'Controls dialog visibility' },
      { name: 'onOpenChange', type: '(open: boolean) => void', default: '—', description: 'Called when open state changes' },
      { name: 'closeOnBackdrop', type: 'boolean', default: 'true', description: 'Close when clicking the backdrop' },
      { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl' | 'full'", default: "'md'", description: 'Max-width of the dialog' },
    ],
    examples: {
      angular: `<atl-button (click)="open = true">Open Dialog</atl-button>
<atl-dialog [(open)]="open" size="sm">
  <atl-dialog-header>Confirm Delete</atl-dialog-header>
  <atl-dialog-content>Are you sure? This cannot be undone.</atl-dialog-content>
  <atl-dialog-footer>
    <atl-button variant="outline" (click)="open = false">Cancel</atl-button>
    <atl-button variant="primary" (click)="open = false">Delete</atl-button>
  </atl-dialog-footer>
</atl-dialog>`,
      react: `<AtlButton onClick={() => setOpen(true)}>Open Dialog</AtlButton>
<AtlDialog open={open} onOpenChange={setOpen} size="sm">
  <AtlDialogHeader>Confirm Delete</AtlDialogHeader>
  <AtlDialogContent>Are you sure? This cannot be undone.</AtlDialogContent>
  <AtlDialogFooter>
    <AtlButton variant="outline" onClick={() => setOpen(false)}>Cancel</AtlButton>
    <AtlButton variant="primary" onClick={() => setOpen(false)}>Delete</AtlButton>
  </AtlDialogFooter>
</AtlDialog>`,
      vue: `<AtlButton @click="open = true">Open Dialog</AtlButton>
<AtlDialog v-model:open="open" size="sm">
  <AtlDialogHeader>Confirm Delete</AtlDialogHeader>
  <AtlDialogContent>Are you sure? This cannot be undone.</AtlDialogContent>
  <AtlDialogFooter>
    <AtlButton variant="outline" @click="open = false">Cancel</AtlButton>
    <AtlButton variant="primary" @click="open = false">Delete</AtlButton>
  </AtlDialogFooter>
</AtlDialog>`,
    },
    composition: [
      { name: 'AtlDialogHeader',  description: 'Title area. The text becomes the dialog\'s accessible name. Slot-only.', props: [] },
      { name: 'AtlDialogContent', description: 'Main body. Receives initial focus when the dialog opens. Slot-only.', props: [] },
      { name: 'AtlDialogFooter',  description: 'Action row — typically Cancel / Confirm buttons. Slot-only.',          props: [] },
    ],
    a11y: {
      role: 'dialog (aria-modal="true")',
      keyboard: [
        { key: 'Escape', action: 'Close the dialog. Focus is returned to the element that opened it.' },
        { key: 'Tab / Shift+Tab', action: 'Cycle through focusable elements inside the dialog (focus is trapped).' },
      ],
      notes: [
        'Initial focus goes to the first tabbable element inside AtlDialogContent on open.',
        'AtlDialogHeader is automatically linked as the accessible name via aria-labelledby.',
        'Background content is inert while the dialog is open — screen readers only hear the dialog content.',
      ],
    },
  },

  drawer: {
    name: 'Drawer',
    selector: 'AtlDrawer',
    description: 'A slide-in panel from the edge of the viewport. Useful for sidebars, filter panels, and detail views.',
    category: 'Overlay',
    props: [
      { name: 'open', type: 'boolean', default: 'false', description: 'Controls drawer visibility' },
      { name: 'onOpenChange', type: '(open: boolean) => void', default: '—', description: 'Called when open state changes' },
      { name: 'position', type: "'left' | 'right' | 'top' | 'bottom'", default: "'right'", description: 'Which edge the drawer slides from' },
      { name: 'size', type: "'sm' | 'md' | 'lg' | 'full'", default: "'md'", description: 'Width (or height for top/bottom)' },
      { name: 'closeOnBackdrop', type: 'boolean', default: 'true', description: 'Close when clicking the backdrop' },
    ],
    examples: {
      angular: `<atl-button (click)="open = true">Open Drawer</atl-button>
<atl-drawer [(open)]="open" position="right">
  <atl-drawer-header>Settings</atl-drawer-header>
  <atl-drawer-content>
    <atl-input placeholder="Search..." />
  </atl-drawer-content>
  <atl-drawer-footer>
    <atl-button (click)="open = false">Close</atl-button>
  </atl-drawer-footer>
</atl-drawer>`,
      react: `<AtlButton onClick={() => setOpen(true)}>Open Drawer</AtlButton>
<AtlDrawer open={open} onOpenChange={setOpen} position="right">
  <AtlDrawerHeader>Settings</AtlDrawerHeader>
  <AtlDrawerContent>
    <AtlInput placeholder="Search..." />
  </AtlDrawerContent>
  <AtlDrawerFooter>
    <AtlButton onClick={() => setOpen(false)}>Close</AtlButton>
  </AtlDrawerFooter>
</AtlDrawer>`,
      vue: `<AtlButton @click="open = true">Open Drawer</AtlButton>
<AtlDrawer v-model:open="open" position="right">
  <AtlDrawerHeader>Settings</AtlDrawerHeader>
  <AtlDrawerContent>
    <AtlInput placeholder="Search..." />
  </AtlDrawerContent>
  <AtlDrawerFooter>
    <AtlButton @click="open = false">Close</AtlButton>
  </AtlDrawerFooter>
</AtlDrawer>`,
    },
    composition: [
      { name: 'AtlDrawerHeader',  description: 'Title area — doubles as the drag handle on touch. Slot-only.', props: [] },
      { name: 'AtlDrawerContent', description: 'Scrollable body. Slot-only.',                                   props: [] },
      { name: 'AtlDrawerFooter',  description: 'Pinned action row at the bottom edge. Slot-only.',              props: [] },
    ],
    a11y: {
      role: 'dialog (aria-modal="true")',
      keyboard: [
        { key: 'Escape', action: 'Close the drawer. Focus returns to the trigger.' },
        { key: 'Tab / Shift+Tab', action: 'Cycle through focusable elements inside the drawer (focus is trapped).' },
      ],
      notes: [
        'Same accessibility model as AtlDialog — the visual slide-in is purely presentational.',
        'Backdrop click closes the drawer only when closeOnBackdrop is true; Escape always closes.',
      ],
    },
  },

  tooltip: {
    name: 'Tooltip',
    selector: '[atlTooltip]',
    description: 'An attribute directive that adds a tooltip to any element. Uses a viewport-aware overlay layer so the tooltip flips to stay on-screen.',
    category: 'Overlay',
    props: [
      { name: 'atlTooltip', type: 'string', default: '—', description: 'Tooltip text content (required)' },
      { name: 'atlTooltipPosition', type: "'above' | 'below' | 'left' | 'right'", default: "'above'", description: 'Preferred position' },
      { name: 'atlTooltipDisabled', type: 'boolean', default: 'false', description: 'Disables the tooltip' },
      { name: 'atlTooltipShowDelay', type: 'number', default: '300', description: 'Delay in ms before showing' },
      { name: 'atlTooltipHideDelay', type: 'number', default: '0', description: 'Delay in ms before hiding' },
    ],
    examples: {
      angular: `<atl-button atlTooltip="Save your changes">Save</atl-button>
<atl-button
  atlTooltip="Copy to clipboard"
  atlTooltipPosition="right"
  variant="outline"
>Copy</atl-button>`,
      react: `<AtlTooltip atlTooltip="Save your changes">
  <AtlButton>Save</AtlButton>
</AtlTooltip>
<AtlTooltip atlTooltip="Copy to clipboard" atlTooltipPosition="right">
  <AtlButton variant="outline">Copy</AtlButton>
</AtlTooltip>`,
      vue: `<AtlTooltip atlTooltip="Save your changes">
  <AtlButton>Save</AtlButton>
</AtlTooltip>
<AtlTooltip atlTooltip="Copy to clipboard" atlTooltipPosition="right">
  <AtlButton variant="outline">Copy</AtlButton>
</AtlTooltip>`,
    },
    a11y: {
      role: 'tooltip',
      keyboard: [
        { key: 'Tab (focus trigger)', action: 'Show the tooltip. It hides when focus leaves.' },
        { key: 'Escape', action: 'Dismiss the tooltip while focus stays on the trigger.' },
      ],
      notes: [
        'Uses aria-describedby — the tooltip supplements, never replaces, the trigger\'s accessible name.',
        'Tooltips are shown on focus, not only on hover, so keyboard users get the same affordance.',
        'Never put interactive content (links, buttons) inside a tooltip — it cannot be reached by keyboard.',
      ],
    },
  },

  toast: {
    name: 'Toast',
    selector: 'Toast (service / hook + AtlToastContainer)',
    description: 'Transient notifications that auto-dismiss. Service/hook-based API — place AtlToastContainer once in app root.',
    category: 'Overlay',
    props: [
      { name: 'variant', type: "'default' | 'success' | 'warning' | 'danger' | 'info'", default: "'default'", description: 'Color scheme of the toast' },
      { name: 'duration', type: 'number', default: '5000', description: 'Auto-dismiss delay in ms. 0 = no auto-dismiss' },
      { name: 'dismissible', type: 'boolean', default: 'true', description: 'Show a dismiss button' },
      { name: 'position', type: "'top-right' | 'top-center' | 'bottom-right' | 'bottom-center'", default: "'bottom-right'", description: 'Container position (on AtlToastContainer)' },
    ],
    examples: {
      angular: `// Place the container once (e.g. in app root template):
// <atl-toast-container position="bottom-right" />

// In any component — inject the service, no provider needed:
import { AtlToastService } from '@atelier-ui/angular';

private readonly toast = inject(AtlToastService);

this.toast.show('Saved!', { variant: 'success' });
this.toast.show('Error occurred', { variant: 'danger', duration: 8000 });
this.toast.show('Persistent', { duration: 0 });`,
      react: `// App root:
<AtlToastProvider>
  <App />
  <AtlToastContainer position="bottom-right" />
</AtlToastProvider>

// In any component inside the provider:
const { show } = useAtlToast();
show('Saved!', { variant: 'success' });
show('Error occurred', { variant: 'danger', duration: 8000 });
show('Persistent', { duration: 0 });`,
      vue: `<!-- App root: -->
<AtlToastProvider>
  <App />
  <AtlToastContainer position="bottom-right" />
</AtlToastProvider>

<!-- In any component inside the provider, in <script setup>: -->
import { useAtlToast } from '@atelier-ui/vue';

const { show } = useAtlToast();
show('Saved!', { variant: 'success' });
show('Error occurred', { variant: 'danger', duration: 8000 });
show('Persistent', { duration: 0 });`,
    },
    a11y: {
      role: 'status / alert',
      keyboard: [
        { key: 'Tab', action: 'Reach the dismiss button inside the toast.' },
        { key: 'Enter / Space (on dismiss)', action: 'Close the toast early.' },
      ],
      notes: [
        'Default toasts live in an aria-live="polite" region — announced without interrupting.',
        'Danger-variant toasts use role="alert" so screen readers announce them immediately.',
        'Auto-dismiss respects prefers-reduced-motion and pauses while the toast is hovered or focused.',
      ],
    },
  },

  accordion: {
    name: 'Accordion',
    selector: 'AtlAccordionGroup + AtlAccordionItem',
    description: 'Expandable/collapsible sections. Supports multi-expand mode and smooth CSS grid animations.',
    category: 'Layout',
    props: [
      { name: 'multi', type: 'boolean', default: 'false', description: 'Allow multiple items expanded simultaneously' },
      { name: 'variant', type: "'default' | 'bordered' | 'separated'", default: "'default'", description: 'Visual style of the group' },
    ],
    examples: {
      angular: `<atl-accordion-group variant="separated">
  <atl-accordion-item>
    <span atlAccordionHeader>Question 1</span>
    Answer content goes here.
  </atl-accordion-item>
  <atl-accordion-item>
    <span atlAccordionHeader>Question 2</span>
    Another answer here.
  </atl-accordion-item>
</atl-accordion-group>`,
      react: `<AtlAccordionGroup variant="separated">
  <AtlAccordionItem>
    <AtlAccordionHeader>Question 1</AtlAccordionHeader>
    Answer content goes here.
  </AtlAccordionItem>
  <AtlAccordionItem>
    <AtlAccordionHeader>Question 2</AtlAccordionHeader>
    Another answer here.
  </AtlAccordionItem>
</AtlAccordionGroup>`,
      vue: `<AtlAccordionGroup variant="separated">
  <AtlAccordionItem>
    <template #header><AtlAccordionHeader>Question 1</AtlAccordionHeader></template>
    Answer content goes here.
  </AtlAccordionItem>
  <AtlAccordionItem>
    <template #header><AtlAccordionHeader>Question 2</AtlAccordionHeader></template>
    Another answer here.
  </AtlAccordionItem>
</AtlAccordionGroup>`,
    },
    composition: [
      {
        name: 'AtlAccordionItem',
        description: 'One expandable section. Mark the header content with the atlAccordionHeader directive; everything else renders as the panel body.',
        props: [
          { name: 'expanded', type: 'boolean', default: 'false', description: 'Controls the expanded state when used as a controlled component.' },
          { name: 'onExpandedChange', type: '(expanded: boolean) => void', default: '—', description: 'Called when the user toggles the item.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents toggling.' },
          { name: 'headingLevel', type: '1 | 2 | 3 | 4 | 5 | 6', default: '3', description: 'HTML heading level wrapping the trigger. Match your page outline so heading order stays valid (e.g. pass 4 if the accordion is nested under an h3).' },
        ],
      },
    ],
    a11y: {
      role: 'heading + region (disclosure pattern)',
      keyboard: [
        { key: 'Tab', action: 'Move focus between accordion headers.' },
        { key: 'Enter / Space', action: 'Expand or collapse the focused section.' },
        { key: 'Arrow Up / Down', action: 'Move between headers within the same group.' },
        { key: 'Home / End', action: 'Jump to the first / last header in the group.' },
      ],
      notes: [
        'Each header is a real button with aria-expanded reflecting state and aria-controls pointing at its panel.',
        'Panels have role="region" with aria-labelledby pointing at their header, so the section has a screen-reader landmark.',
      ],
    },
  },

  alert: {
    name: 'Alert',
    selector: 'AtlAlert',
    description: 'Inline status messages for feedback, warnings, and errors. Optionally dismissible.',
    category: 'Layout',
    props: [
      { name: 'variant', type: "'info' | 'success' | 'warning' | 'danger'", default: "'info'", description: 'Color scheme and icon' },
      { name: 'dismissible', type: 'boolean', default: 'false', description: 'Show a close button' },
      { name: 'onDismissed', type: '() => void', default: '—', description: 'Called when the dismiss button is clicked' },
    ],
    examples: {
      angular: `<atl-alert variant="info">This is an informational message.</atl-alert>
<atl-alert variant="success">Your changes were saved successfully.</atl-alert>
<atl-alert variant="warning" [dismissible]="true">Your session expires in 5 minutes.</atl-alert>
<atl-alert variant="danger">Something went wrong. Please try again.</atl-alert>`,
      react: `<AtlAlert variant="info">This is an informational message.</AtlAlert>
<AtlAlert variant="success">Your changes were saved successfully.</AtlAlert>
<AtlAlert variant="warning" dismissible={true}>Your session expires in 5 minutes.</AtlAlert>
<AtlAlert variant="danger">Something went wrong. Please try again.</AtlAlert>`,
      vue: `<AtlAlert variant="info">This is an informational message.</AtlAlert>
<AtlAlert variant="success">Your changes were saved successfully.</AtlAlert>
<AtlAlert variant="warning" :dismissible="true">Your session expires in 5 minutes.</AtlAlert>
<AtlAlert variant="danger">Something went wrong. Please try again.</AtlAlert>`,
    },
  },

  'code-block': {
    name: 'Code Block',
    selector: 'AtlCodeBlock',
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
    examples: {
      angular: `<atl-code-block code="const x = 1;" language="typescript" />
<atl-code-block [code]="tsCode" filename="app.ts" [showLineNumbers]="true" />
<atl-code-block [code]="shellCmd" language="shell" />
<atl-code-block [code]="jsonStr" filename="package.json" />`,
      react: `<AtlCodeBlock code="const x = 1;" language="typescript" />
<AtlCodeBlock code={tsCode} filename="app.ts" showLineNumbers={true} />
<AtlCodeBlock code={shellCmd} language="shell" />
<AtlCodeBlock code={jsonStr} filename="package.json" />`,
      vue: `<AtlCodeBlock code="const x = 1;" language="typescript" />
<AtlCodeBlock :code="tsCode" filename="app.ts" :showLineNumbers="true" />
<AtlCodeBlock :code="shellCmd" language="shell" />
<AtlCodeBlock :code="jsonStr" filename="package.json" />`,
    },
  },

  chat: {
    name: 'Chat',
    selector: 'AtlChat',
    description: 'Composable AI assistant surface. Three layout variants (drawer, popup, inline) share the same content slots and a status-driven Send/Stop button toggle. Provider-agnostic — wire it to CopilotKit, Vercel AI SDK, or your own backend by binding the Send/Stop events.',
    category: 'AI',
    status: 'new',
    props: [
      { name: 'variant', type: "'drawer' | 'popup' | 'inline'", default: "'drawer'", description: 'Layout — slide-in drawer, floating bubble + popup window, or embedded inline card.' },
      { name: 'status', type: "'idle' | 'streaming' | 'error'", default: "'idle'", description: 'Connection / response status. Drives the input footer button (Send → Stop) and disables the textarea while streaming.' },
      { name: 'open', type: 'boolean', default: 'false', description: 'Whether the chat is open. Only used by drawer and popup variants. Two-way bindable.' },
      { name: 'onOpenChange', type: '(open: boolean) => void', default: '—', description: 'React: emitted when the open state should change. Vue uses v-model:open; Angular uses [(open)].' },
    ],
    examples: {
      angular: `<atl-chat variant="drawer" [(open)]="open" status="idle">
  <atl-chat-header>
    <atl-avatar size="sm" name="AI" />
    <span>AI Assistant</span>
    <atl-badge variant="success" size="sm">Online</atl-badge>
  </atl-chat-header>
  <atl-chat-messages>
    <atl-chat-message role="assistant">Hi! How can I help today?</atl-chat-message>
    <atl-chat-message role="user">Show me a sorting function.</atl-chat-message>
    <atl-chat-message role="assistant">
      <atl-code-block language="ts" [code]="snippet" />
    </atl-chat-message>
  </atl-chat-messages>
  <atl-chat-input (send)="onSend($event)" (stop)="onStop()" />
</atl-chat>`,
      react: `<AtlChat variant="drawer" open={open} onOpenChange={setOpen} status="idle">
  <AtlChatHeader>
    <AtlAvatar size="sm" name="AI" />
    <span>AI Assistant</span>
    <AtlBadge variant="success" size="sm">Online</AtlBadge>
  </AtlChatHeader>
  <AtlChatMessages>
    <AtlChatMessage role="assistant">Hi! How can I help today?</AtlChatMessage>
    <AtlChatMessage role="user">Show me a sorting function.</AtlChatMessage>
    <AtlChatMessage role="assistant">
      <AtlCodeBlock language="ts" code={snippet} />
    </AtlChatMessage>
  </AtlChatMessages>
  <AtlChatInput onSend={onSend} onStop={onStop} />
</AtlChat>`,
      vue: `<AtlChat variant="drawer" v-model:open="open" status="idle">
  <AtlChatHeader>
    <AtlAvatar size="sm" name="AI" />
    <span>AI Assistant</span>
    <AtlBadge variant="success" size="sm">Online</AtlBadge>
  </AtlChatHeader>
  <AtlChatMessages>
    <AtlChatMessage role="assistant">Hi! How can I help today?</AtlChatMessage>
    <AtlChatMessage role="user">Show me a sorting function.</AtlChatMessage>
    <AtlChatMessage role="assistant">
      <AtlCodeBlock language="ts" :code="snippet" />
    </AtlChatMessage>
  </AtlChatMessages>
  <AtlChatInput @send="onSend" @stop="onStop" />
</AtlChat>`,
    },
    composition: [
      { name: 'AtlChatHeader', description: 'Title block (avatar / name / status badge) plus the close button. Slot-only. The close button is auto-hidden on the inline variant.', props: [] },
      { name: 'AtlChatMessages', description: 'Scrollable message list. Project AtlChatMessage, AtlChatTyping, and AtlChatSuggestion children inside.', props: [] },
      {
        name: 'AtlChatMessage',
        description: 'A single message bubble. Role drives alignment (user → right, primary fill; assistant/system → left, surface-sunken). Use failed for the error-state dashed border.',
        props: [
          { name: 'role', type: "'user' | 'assistant' | 'system'", default: "'assistant'", description: 'Sender of the message — drives bubble color and alignment.' },
          { name: 'failed', type: 'boolean', default: 'false', description: 'Marks the message as failed (red dashed border).' },
        ],
      },
      { name: 'AtlChatTyping', description: 'Three animated dots. Render at the end of the message list while the assistant is streaming. Respects prefers-reduced-motion.', props: [] },
      {
        name: 'AtlChatSuggestion',
        description: 'Tappable starter chip used in the empty state. Emits selected (Angular/Vue) or onSelected (React) with the label.',
        props: [
          { name: 'label', type: 'string', default: '— (required)', description: 'Primary text of the chip.' },
          { name: 'hint', type: 'string', default: '—', description: 'Optional secondary text shown below the label.' },
        ],
      },
      {
        name: 'AtlChatInput',
        description: 'Composable input footer. Wraps a textarea and renders a primary "Send" button — automatically swapped for a danger "Stop" button while the parent chat\'s status is "streaming".',
        props: [
          { name: 'placeholder', type: 'string', default: 'status-aware', description: 'Defaults to "Message your AI assistant…", "Waiting for response…" while streaming, or "Try again…" on error.' },
          { name: 'value', type: 'string', default: '—', description: 'Optional controlled value. Omit for uncontrolled internal state.' },
          { name: 'onSend', type: '(text: string) => void', default: '—', description: 'Fires on Enter (without Shift) or Send-button click.' },
          { name: 'onStop', type: '() => void', default: '—', description: 'Fires when the Stop button is clicked while streaming.' },
        ],
      },
    ],
    a11y: {
      role: 'dialog (drawer/popup), region (inline)',
      keyboard: [
        { key: 'Escape', action: 'Close drawer or popup variant. Inline variant ignores Escape.' },
        { key: 'Tab / Shift+Tab', action: 'Cycle focus inside the drawer (focus is trapped via CDK A11y / focus-trap equivalents).' },
        { key: 'Enter (in input)', action: 'Send the message.' },
        { key: 'Shift+Enter (in input)', action: 'Insert a newline without sending.' },
      ],
      notes: [
        'Drawer uses native <dialog> with aria-modal — same accessibility model as AtlDialog and AtlDrawer.',
        'Streaming state announces via aria-live="polite" on the typing indicator so screen readers know the assistant is responding.',
        'Stop button uses AtlButton variant="danger" so the destructive intent is communicated by both color and label.',
        'Inline variant has no overlay chrome — the close button is hidden because there is nothing to close.',
      ],
    },
  },
};
