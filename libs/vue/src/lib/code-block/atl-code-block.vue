<script setup lang="ts">
import { computed, ref } from 'vue';
import './atl-code-block.css';
import AtlIcon from '../icon/atl-icon.vue';

defineOptions({ name: 'AtlCodeBlock' });

interface AtlCodeBlockProps {
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

const props = withDefaults(defineProps<AtlCodeBlockProps>(), {
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
  <div class="atl-code-block">
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
          <AtlIcon name="check" size="sm" />
          Copied
        </template>
        <template v-else>
          <AtlIcon name="copy" size="sm" />
          Copy
        </template>
      </button>
    </div>
    <div class="code-block-body">
      <pre class="code-block-pre"><code><template v-if="showLineNumbers"><span v-for="(line, i) in lines" :key="i" class="code-line"><span class="code-line-number">{{ i + 1 }}</span><span class="code-line-text">{{ line }}</span></span></template><template v-else>{{ code }}</template></code></pre>
    </div>
  </div>
</template>
