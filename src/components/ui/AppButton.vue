<script setup lang="ts">
defineProps<{ variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'highlight'; size?: 'sm' | 'md' | 'lg'; disabled?: boolean; type?: 'button' | 'submit' }>()
</script>

<template>
  <button
    :type="type ?? 'button'"
    :disabled="disabled"
    :class="[
      'inline-flex items-center justify-center gap-2 font-bold select-none rounded-full focus-visible:outline-none transition-all',
      'disabled:opacity-40 disabled:pointer-events-none',
      size === 'sm' ? 'px-4 py-1.5 text-xs' : size === 'lg' ? 'px-6 py-3 text-sm' : 'px-5 py-2.5 text-sm',
      variant === 'secondary' ? 'bg-white text-text shadow-[0_2px_8px_rgba(20,20,20,0.06)] hover:shadow-[0_12px_32px_rgba(20,20,20,0.10)]' : '',
      variant === 'ghost' ? 'text-text-secondary hover:text-text hover:bg-surface-hover' : '',
      variant === 'danger' ? 'bg-white text-danger shadow-[0_2px_8px_rgba(20,20,20,0.06)] hover:bg-danger hover:text-white' : '',
      (!variant || variant === 'primary' || variant === 'highlight') ? 'bg-text text-white shadow-[0_8px_20px_rgba(20,20,20,0.18)] hover:bg-black' : '',
    ]"
  >
    <slot />
  </button>
</template>
