<template>
  <span
    :class="[
      'chip',
      variant === 'success' ? '!bg-[#E4F3E9] !text-[#146434]' : '',
      variant === 'warning' ? '!bg-[#FFF1CF] !text-[#7A5F00]' : '',
      variant === 'danger' ? '!bg-[#FBE3E3] !text-[#A02A2A]' : '',
    ]"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
defineProps<{ variant?: 'default' | 'success' | 'warning' | 'danger' }>()
</script>
