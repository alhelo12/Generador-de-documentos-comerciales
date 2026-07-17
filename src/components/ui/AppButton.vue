<script setup lang="ts">
defineProps<{ variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg'; disabled?: boolean; type?: 'button' | 'submit' }>()
</script>

<template>
  <button
    :type="type ?? 'button'"
    :disabled="disabled"
    :class="[
      'inline-flex items-center justify-center gap-2 font-bold select-none rounded-xl focus-visible:outline-none transition-all duration-200',
      'disabled:opacity-40 disabled:pointer-events-none',
      size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'lg' ? 'px-5 py-2.5 text-sm' : 'px-4 py-2 text-sm',
      variant === 'secondary' ? 'glass-control text-text-secondary hover:text-text' : '',
      variant === 'ghost' ? 'text-text-secondary hover:text-text hover:bg-black/[0.04]' : '',
      variant === 'danger' ? 'glass-control text-danger hover:bg-danger/10' : '',
      (!variant || variant === 'primary') ? 'accent-glow text-white' : '',
    ]"
  >
    <slot />
  </button>
</template>
