<script setup lang="ts">
defineProps<{ hover?: boolean; padding?: 'sm' | 'md' | 'lg' }>()
</script>

<template>
  <div
    :class="[
      'bg-surface rounded-[24px] shadow-[0_12px_32px_rgba(20,20,20,0.10)] transition-all duration-300',
      hover ? 'cursor-pointer hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(20,20,20,0.14)]' : '',
      padding === 'sm' ? 'p-3' : padding === 'lg' ? 'p-6' : 'p-4',
    ]"
  >
    <slot />
  </div>
</template>
