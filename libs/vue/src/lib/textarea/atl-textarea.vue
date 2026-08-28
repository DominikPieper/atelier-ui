<script setup lang="ts">
import { ref, watch, onMounted, computed, nextTick, useId } from 'vue';
import './atl-textarea.css';
import AtlIcon from '../icon/atl-icon.vue';

defineOptions({ name: 'AtlTextarea' });

interface AtlTextareaProps {
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

const props = withDefaults(defineProps<AtlTextareaProps>(), {
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

const errorsId = useId();

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
  <div
    class="atl-textarea"
    :class="{
      'is-invalid': invalid,
      'is-disabled': disabled,
      'is-readonly': readonly,
      'is-auto-resize': autoResize,
    }"
  >
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
        :aria-describedby="errors.length > 0 ? errorsId : undefined"
        @input="onInput"
      />
      <AtlIcon v-if="invalid" name="danger" size="sm" class="invalid-icon" />
    </div>
    <div v-if="errors.length" :id="errorsId" class="errors" aria-live="polite">
      <p v-for="(error, i) in errors" :key="i" class="error-message">{{ error }}</p>
    </div>
  </div>
</template>
