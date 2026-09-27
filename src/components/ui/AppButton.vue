<script setup lang="ts">
defineProps<{ variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'highlight'; size?: 'sm' | 'md' | 'lg'; disabled?: boolean; type?: 'button' | 'submit' }>()
</script>

<template>
  <button
    :type="type ?? 'button'"
    :disabled="disabled"
    :class="[
      'inline-flex items-center justify-center gap-2 font-bold select-none rounded-[10px] focus-visible:outline-none transition-all active:scale-[0.98]',
      'disabled:opacity-40 disabled:pointer-events-none',
      size === 'sm' ? 'px-4 py-1.5 text-xs' : size === 'lg' ? 'px-6 py-3 text-sm' : 'px-5 py-2.5 text-sm',
      variant === 'secondary' ? 'border border-border bg-white text-text hover:bg-surface-hover' : '',
      variant === 'ghost' ? 'text-text-secondary hover:text-text hover:bg-surface-hover' : '',
      variant === 'danger' ? 'border border-[#F0D1D1] bg-[#FFF5F5] text-danger hover:bg-danger hover:text-white' : '',
      (!variant || variant === 'primary') ? 'bg-text text-white hover:bg-[#2b2b2b]' : '',
      variant === 'highlight' ? 'bg-accent text-accent-text hover:bg-accent-hover' : '',
    ]"
  >
    <slot />
  </button>
</template>
