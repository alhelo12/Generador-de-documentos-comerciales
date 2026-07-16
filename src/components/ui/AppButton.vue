<script setup lang="ts">
defineProps<{ variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg'; disabled?: boolean; type?: 'button' | 'submit' }>()
</script>

<template>
  <button
    :type="type ?? 'button'"
    :disabled="disabled"
    :class="[
      'inline-flex items-center justify-center gap-2 font-semibold select-none rounded-xl focus-visible:outline-none',
      'disabled:opacity-40 disabled:pointer-events-none',
      size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'lg' ? 'px-5 py-2.5 text-sm' : 'px-4 py-2 text-sm',
      variant === 'secondary' ? 'neu-control text-text-secondary hover:text-text' : '',
      variant === 'ghost' ? 'text-text-secondary hover:text-text hover:shadow-[inset_3px_3px_7px_#c7cfda,inset_-3px_-3px_7px_#fff]' : '',
      variant === 'danger' ? 'neu-control text-danger' : '',
      (!variant || variant === 'primary') ? 'bg-accent text-white shadow-[5px_5px_11px_#bdc6d3,-5px_-5px_11px_#fff] hover:bg-accent-hover active:shadow-[inset_3px_3px_7px_#365895,inset_-3px_-3px_7px_#668bd0]' : '',
    ]"
  >
    <slot />
  </button>
</template>
