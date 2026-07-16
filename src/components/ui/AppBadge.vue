<script setup lang="ts">
defineProps<{ variant?: 'default' | 'success' | 'warning' | 'danger' }>()
</script>

<template>
  <span
    :class="[
      'inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md',
      variant === 'success' ? 'bg-success-light text-green-700' : '',
      variant === 'warning' ? 'bg-warning-light text-amber-700' : '',
      variant === 'danger' ? 'bg-danger-light text-red-700' : '',
      (!variant || variant === 'default') ? 'bg-surface-hover text-text-secondary border border-border' : '',
    ]"
  >
    <slot />
  </span>
</template>
