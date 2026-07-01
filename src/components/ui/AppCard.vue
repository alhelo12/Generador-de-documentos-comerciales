<script setup lang="ts">
defineProps<{
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <div
    :class="[
      'bg-white border border-neutral-200 rounded-lg shadow-sm transition-all',
      hover ? 'cursor-pointer hover:border-neutral-300 hover:shadow-md' : '',
      padding === 'sm' ? 'p-3' : padding === 'lg' ? 'p-6' : 'p-4',
    ]"
  >
    <slot />
  </div>
</template>
