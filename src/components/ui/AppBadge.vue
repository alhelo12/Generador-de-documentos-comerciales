<script setup lang="ts">
defineProps<{
  variant?: 'default' | 'success' | 'warning' | 'danger'
}>()
</script>

<template>
  <span
    :class="[
      'inline-block px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-full',
      variant === 'success' ? 'bg-success/10 text-success' : '',
      variant === 'warning' ? 'bg-warning/10 text-warning' : '',
      variant === 'danger' ? 'bg-danger/10 text-danger' : '',
      (!variant || variant === 'default') ? 'bg-neutral-200 text-neutral-600' : '',
    ]"
  >
    <slot />
  </span>
</template>
