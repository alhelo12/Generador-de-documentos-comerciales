<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  type?: 'button' | 'submit'
}>()
</script>

<template>
  <button
    :type="type ?? 'button'"
    :disabled="disabled"
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-150 select-none',
      'active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none',
      size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'lg' ? 'px-6 py-3 text-base' : 'px-4 py-2 text-sm',
      variant === 'secondary' ? 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300' : '',
      variant === 'ghost' ? 'text-neutral-600 hover:bg-neutral-100' : '',
      variant === 'danger' ? 'bg-danger text-white hover:opacity-90' : '',
      (!variant || variant === 'primary') ? 'bg-accent text-accent-fg hover:opacity-90' : '',
    ]"
  >
    <slot name="icon" />
    <slot />
  </button>
</template>
