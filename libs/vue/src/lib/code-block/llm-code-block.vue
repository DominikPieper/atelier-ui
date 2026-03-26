<script setup lang="ts">
import { computed, ref } from 'vue';
import './llm-code-block.css';

defineOptions({ name: 'LlmCodeBlock' });

interface LlmCodeBlockProps {
  /** The code string to display. */
  code: string;
  /** Language label shown in the header. Ignored if filename is set. */
  language?: string;
  /** Optional filename shown in the header instead of the language label. */
  filename?: string;
  /** Whether to show a copy-to-clipboard button. */
  copyable?: boolean;
  /** Whether to display line numbers alongside the code. */
  showLineNumbers?: boolean;
}

const props = withDefaults(defineProps<LlmCodeBlockProps>(), {
  language: 'text',
  filename: '',
  copyable: true,
  showLineNumbers: false,
});

const copied = ref(false);

const displayLabel = computed(() => props.filename || props.language);
const lines = computed(() => props.code.split('\n'));

function copy() {
  void navigator.clipboard.writeText(props.code).then(() => {
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 1800);
  });
}
</script>

<template>
  <div class="llm-code-block">
    <div class="code-block-header">
      <span class="code-block-label">{{ displayLabel }}</span>
      <button
        v-if="copyable"
        class="code-block-copy"
        type="button"
        :aria-label="copied ? 'Copied' : 'Copy code'"
        @click="copy"
      >
        <template v-if="copied">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied
        </template>
        <template v-else>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy
        </template>
      </button>
    </div>
    <div class="code-block-body">
      <pre class="code-block-pre"><code><template v-if="showLineNumbers"><span v-for="(line, i) in lines" :key="i" class="code-line"><span class="code-line-number">{{ i + 1 }}</span><span class="code-line-text">{{ line }}</span></span></template><template v-else>{{ code }}</template></code></pre>
    </div>
  </div>
</template>
