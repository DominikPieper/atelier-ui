<script setup lang="ts">
import { Comment, Fragment, cloneVNode, useSlots } from 'vue';
import type { VNode } from 'vue';
import '@atelier-ui/styles/breadcrumbs/atl-breadcrumbs.css';

defineOptions({ name: 'AtlBreadcrumbs' });

const props = withDefaults(
  defineProps<{
    /** Separator character shown between breadcrumb items. */
    separator?: string;
  }>(),
  {
    separator: '/',
  },
);

const slots = useSlots();

// The slot's vnodes with Fragments (v-for, <template>) unwrapped and comments
// (a false v-if) dropped, so the items are seen as the siblings they render as.
function flatten(nodes: VNode[]): VNode[] {
  return nodes.flatMap((node) =>
    node.type === Fragment && Array.isArray(node.children)
      ? flatten(node.children as VNode[])
      : node.type === Comment
        ? []
        : [node],
  );
}

/**
 * The last item is the current page unless an item sets `current` explicitly.
 * If any item does, only explicit values count and nothing is added.
 */
function markCurrent(nodes: VNode[]): VNode[] {
  const flat = flatten(nodes);
  const isItem = (node: VNode) =>
    typeof node.type === 'object' || typeof node.type === 'function';
  const items = flat.filter(isItem);
  const anyExplicit = items.some(
    (item) => item.props != null && item.props['current'] != null,
  );
  const last = items[items.length - 1];
  return anyExplicit
    ? flat
    : flat.map((node) =>
        node === last ? cloneVNode(node, { current: true }) : node,
      );
}

// A functional component, so the slot is re-read and re-marked on every render.
const Items = () => markCurrent(slots['default']?.() ?? []);
</script>

<template>
  <nav
    class="atl-breadcrumbs"
    aria-label="Breadcrumb"
    :style="{ '--atl-separator': `'${props.separator}'` }"
  >
    <!-- Explicit role="list" is a deliberate Safari/VoiceOver workaround, not
    a defect: this element also gets `list-style: none` from
    .breadcrumbs-list, and Safari strips <ol>/<ul>'s implicit `list` role
    once list-style is removed. The static rule can't see the paired CSS. -->
    <!-- eslint-disable-next-line vuejs-accessibility/no-redundant-roles -->
    <ol role="list" class="breadcrumbs-list">
      <Items />
    </ol>
  </nav>
</template>
