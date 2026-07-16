<script setup lang="ts">
defineProps<{ hover?: boolean; padding?: 'sm' | 'md' | 'lg' }>()
</script>

<template>
  <div
    :class="[
      'neu-raised rounded-2xl transition-[box-shadow,transform] duration-200',
      hover ? 'cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5' : '',
      padding === 'sm' ? 'p-3' : padding === 'lg' ? 'p-6' : 'p-4',
    ]"
  >
    <slot />
  </div>
</template>
