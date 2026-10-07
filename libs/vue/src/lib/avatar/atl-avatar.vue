<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import '@atelier-ui/styles/avatar/atl-avatar.css';
import AtlIcon from '../icon/atl-icon.vue';

defineOptions({ name: 'AtlAvatar' });

interface AtlAvatarProps {
  /** Image URL. Falls back to initials if empty or if the image fails to load. */
  src?: string;
  /** Alt text for the image (also used as the accessible label). */
  alt?: string;
  /** Full name used to generate the initials fallback and the default accessible label. */
  name?: string;
  /** Size of the avatar. */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Shape of the avatar. */
  shape?: 'circle' | 'square';
  /** Presence status indicator dot. Empty string hides the dot. */
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

watch(
  () => props.src,
  () => {
    imgError.value = false;
  },
);

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

const initials = computed(() => (props.name ? getInitials(props.name) : ''));
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
    <span
      v-if="status"
      :class="`status-dot status-${status}`"
      aria-hidden="true"
    />
  </div>
</template>
