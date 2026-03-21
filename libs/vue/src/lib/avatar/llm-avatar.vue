<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import './llm-avatar.css';

defineOptions({ name: 'LlmAvatar' });

interface LlmAvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'away' | 'busy' | '';
}

const props = withDefaults(defineProps<LlmAvatarProps>(), {
  src: '',
  alt: '',
  name: '',
  size: 'md',
  shape: 'circle',
  status: '',
});

const imgError = ref(false);

watch(() => props.src, () => {
  imgError.value = false;
});

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

const initials = computed(() => props.name ? getInitials(props.name) : '');
const ariaLabel = computed(() => props.alt || props.name || 'Avatar');

const classes = computed(() => [
  'llm-avatar',
  `size-${props.size}`,
  `shape-${props.shape}`,
]);
</script>

<template>
  <div :class="classes" :aria-label="ariaLabel" role="img">
    <img
      v-if="src && !imgError"
      :src="src"
      :alt="alt || name"
      @error="imgError = true"
    />
    <span v-else-if="initials" class="initials">{{ initials }}</span>
    <svg
      v-else
      class="icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.314 0-10 1.343-10 4v2h20v-2c0-2.657-6.686-4-10-4z" />
    </svg>
    <span v-if="status" :class="`status-dot status-${status}`" aria-hidden="true" />
  </div>
</template>
