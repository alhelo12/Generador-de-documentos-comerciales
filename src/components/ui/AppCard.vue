<script setup lang="ts">
defineProps<{ hover?: boolean; padding?: 'sm' | 'md' | 'lg' }>()
</script>

<template>
  <div
    :class="[
      'glass-raised rounded-2xl transition-all duration-300',
      hover ? 'cursor-pointer hover-lift' : '',
      padding === 'sm' ? 'p-3' : padding === 'lg' ? 'p-6' : 'p-4',
    ]"
  >
    <slot />
  </div>
</template>
