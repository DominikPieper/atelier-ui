<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import './atl-avatar.css';
import AtlIcon from '../icon/atl-icon.vue';

defineOptions({ name: 'AtlAvatar' });

interface AtlAvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'away' | 'busy' | '';
}

const props = withDefaults(defineProps<AtlAvatarProps>(), {
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
  'atl-avatar',
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
    <AtlIcon name="person" size="sm" class="icon" />
    <span v-if="status" :class="`status-dot status-${status}`" aria-hidden="true" />
  </div>
</template>
