<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import type { LlmComboboxOption } from '@atelier-ui/spec';
import './llm-combobox.css';

defineOptions({ name: 'LlmCombobox' });

interface Props {
  value?: string;
  options?: LlmComboboxOption[];
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  invalid?: boolean;
  required?: boolean;
  name?: string;
  errors?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  value: '',
  options: () => [],
  placeholder: '',
  disabled: false,
  readonly: false,
  invalid: false,
  required: false,
  name: '',
  errors: () => [],
});

const emit = defineEmits<{
  'update:value': [value: string];
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);

const query = ref('');
const isOpen = ref(false);
const activeIndex = ref(-1);

let idBase = Math.random().toString(36).slice(2);
const inputId = `llm-combobox-input-${idBase}`;
const panelId = `llm-combobox-panel-${idBase}`;

const selectedLabel = computed(
  () => props.options.find((o) => o.value === props.value)?.label ?? '',
);

const filteredOptions = computed(() => {
  const q = query.value.toLowerCase();
  if (!q) return props.options;
  return props.options.filter((o) => o.label.toLowerCase().includes(q));
});

const activeOptionId = computed(() =>
  activeIndex.value >= 0 ? `${panelId}-option-${activeIndex.value}` : undefined,
);

const wrapperClasses = computed(() => [
  'llm-combobox',
  isOpen.value && 'is-open',
  props.disabled && 'is-disabled',
  props.invalid && 'is-invalid',
]);

// Sync query to selected label when value changes externally
watch(
  () => props.value,
  () => {
    if (!isOpen.value) query.value = selectedLabel.value;
  },
  { immediate: true },
);

function open() {
  if (props.disabled || props.readonly || isOpen.value) return;
  isOpen.value = true;
  activeIndex.value = -1;
  document.addEventListener('click', onOutsideClick);
}

function close() {
  if (!isOpen.value) return;
  isOpen.value = false;
  activeIndex.value = -1;
  document.removeEventListener('click', onOutsideClick);
}

function onOutsideClick(e: MouseEvent) {
  if (!containerRef.value?.contains(e.target as Node)) {
    query.value = selectedLabel.value;
    close();
  }
}

onUnmounted(() => {
  document.removeEventListener('click', onOutsideClick);
});

function selectOption(option: LlmComboboxOption) {
  if (option.disabled || props.disabled || props.readonly) return;
  emit('update:value', option.value);
  query.value = option.label;
  close();
  inputRef.value?.focus();
}

function onInput(event: Event) {
  const q = (event.target as HTMLInputElement).value;
  query.value = q;
  activeIndex.value = -1;
  if (q === '') emit('update:value', '');
  if (!isOpen.value) open();
}

function onFocus() {
  open();
}

function onBlur() {
  query.value = selectedLabel.value;
}

function onKeydown(event: KeyboardEvent) {
  const filtered = filteredOptions.value;
  switch (event.key) {
    case 'ArrowDown': {
      event.preventDefault();
      if (!isOpen.value) { open(); return; }
      const next = activeIndex.value + 1;
      activeIndex.value = next >= filtered.length ? 0 : next;
      break;
    }
    case 'ArrowUp': {
      event.preventDefault();
      if (!isOpen.value) { open(); return; }
      const prev = activeIndex.value - 1;
      activeIndex.value = prev < 0 ? filtered.length - 1 : prev;
      break;
    }
    case 'Enter': {
      event.preventDefault();
      const idx = activeIndex.value;
      if (isOpen.value && idx >= 0 && idx < filtered.length) {
        selectOption(filtered[idx]);
      }
      break;
    }
    case 'Escape': {
      event.preventDefault();
      query.value = selectedLabel.value;
      close();
      break;
    }
    case 'Tab': {
      close();
      break;
    }
  }
}
</script>

<template>
  <div ref="containerRef" :class="wrapperClasses">
    <div class="llm-combobox-wrapper">
      <input
        ref="inputRef"
        class="llm-combobox-input"
        type="text"
        autocomplete="off"
        role="combobox"
        :id="inputId"
        :aria-expanded="isOpen"
        :aria-controls="panelId"
        aria-autocomplete="list"
        :aria-activedescendant="activeOptionId"
        :aria-invalid="invalid || undefined"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :name="name || undefined"
        :placeholder="placeholder"
        :value="query"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        @keydown="onKeydown"
      />
      <span class="llm-combobox-icon" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    </div>

    <ul
      v-if="isOpen"
      :id="panelId"
      class="llm-combobox-panel"
      role="listbox"
      :aria-labelledby="inputId"
    >
      <template v-if="filteredOptions.length > 0">
        <li
          v-for="(option, i) in filteredOptions"
          :key="option.value"
          :id="`${panelId}-option-${i}`"
          role="option"
          :class="[
            'llm-combobox-option',
            activeIndex === i && 'is-active',
            option.value === value && 'is-selected',
            option.disabled && 'is-disabled',
          ]"
          :aria-selected="option.value === value"
          :aria-disabled="option.disabled || undefined"
          @mousedown="selectOption(option)"
          @mouseenter="activeIndex = i"
        >
          <span>{{ option.label }}</span>
          <svg
            v-if="option.value === value"
            class="llm-combobox-check"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <path d="M2 7l4 4 6-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </li>
      </template>
      <li v-else class="llm-combobox-no-results" role="option" aria-disabled="true">
        No results found.
      </li>
    </ul>

    <div
      v-if="invalid && errors.length > 0"
      class="llm-combobox-errors"
      role="alert"
      aria-live="polite"
    >
      <p v-for="(error, i) in errors" :key="i" class="llm-combobox-error-message">{{ error }}</p>
    </div>
  </div>
</template>
