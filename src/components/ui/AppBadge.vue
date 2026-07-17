<script setup lang="ts">
defineProps<{ variant?: 'default' | 'success' | 'warning' | 'danger' }>()
</script>

<template>
  <span
    :class="[
      'inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg',
      variant === 'success' ? 'bg-success/15 text-success' : '',
      variant === 'warning' ? 'bg-warning/15 text-warning' : '',
      variant === 'danger' ? 'bg-danger/15 text-danger' : '',
      (!variant || variant === 'default') ? 'bg-black/[0.04] text-text-muted border border-black/[0.04]' : '',
    ]"
  >
    <slot />
  </span>
</template>
