# @atelier-ui/vue

LLM-optimized component library for Vue 3.

## Features

- **Vue 3 Native**: Built with `<script setup>` and `defineProps`.
- **Accessible**: WAI-ARIA compliant components with keyboard support.
- **LLM-Ready**: Highly predictable prop APIs optimized for AI assistants.
- **Themed**: Shared CSS token system with automatic dark mode.

## Installation

```bash
npm install @atelier-ui/vue
```

Add the design tokens to your global `main.css`:

```css
@import '@atelier-ui/vue/styles/tokens.css';
```

## Usage

```vue
<script setup>
import { LlmButton } from '@atelier-ui/vue';
</script>

<template>
  <LlmButton variant="primary" @click="save">Save</LlmButton>
</template>
```
