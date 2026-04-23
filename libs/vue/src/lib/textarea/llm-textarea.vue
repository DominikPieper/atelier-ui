<script setup lang="ts">
import { ref, watch, onMounted, computed, nextTick } from 'vue';
import './llm-textarea.css';

defineOptions({ name: 'LlmTextarea' });

interface LlmTextareaProps {
  value?: string;
  rows?: number;
  placeholder?: string;
  invalid?: boolean;
  errors?: string[];
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  label?: string;
  autoResize?: boolean;
  name?: string;
  id?: string;
}

const props = withDefaults(defineProps<LlmTextareaProps>(), {
  value: '',
  rows: 3,
  placeholder: '',
  invalid: false,
  errors: () => [],
  disabled: false,
  readonly: false,
  required: false,
  label: '',
  autoResize: false,
  name: '',
  id: '',
});

const emit = defineEmits<{
  'update:value': [value: string];
}>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);

const textareaId = computed(() => props.id || (props.label ? `textarea-${Math.random().toString(36).slice(2)}` : undefined));

function adjustHeight() {
  if (props.autoResize && textareaRef.value) {
    textareaRef.value.style.height = 'auto';
    textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`;
  }
}

watch(() => props.value, async () => {
  await nextTick();
  adjustHeight();
});

onMounted(() => adjustHeight());

function onInput(event: Event) {
  emit('update:value', (event.target as HTMLTextAreaElement).value);
  adjustHeight();
}
</script>

<template>
  <div class="llm-textarea" :class="{ 'is-invalid': invalid, 'is-disabled': disabled }">
    <label v-if="label" :for="textareaId" class="textarea-label">{{ label }}</label>
    <div class="textarea-field">
      <textarea
        :id="textareaId"
        ref="textareaRef"
        :value="value"
        :rows="rows"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :name="name"
        :aria-invalid="invalid || undefined"
        @input="onInput"
      />
    </div>
    <ul v-if="errors.length" class="errors" aria-live="polite">
      <li v-for="(error, i) in errors" :key="i" class="error">{{ error }}</li>
    </ul>
  </div>
</template>
