<script setup lang="ts">
defineProps<{ title: string; description: string; showBack?: boolean; nextLabel?: string; nextDisabled?: boolean }>()
const emit = defineEmits<{ back: []; next: [] }>()
</script>

<template>
  <section class="editor-step-shell">
    <div class="mb-5">
      <p class="text-xs font-bold uppercase tracking-[0.12em] text-text-muted">Paso activo</p>
      <h2 class="mt-1 font-display text-2xl font-extrabold tracking-[-0.04em] text-text">{{ title }}</h2>
      <p class="mt-1 max-w-[48ch] text-sm leading-6 text-text-secondary">{{ description }}</p>
    </div>
    <slot />
    <div class="mobile-sticky-footer sticky bottom-0 -mx-4 mt-6 flex gap-2 border-t border-border-light bg-white/95 px-4 pt-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:pt-5">
      <button v-if="showBack" type="button" class="touch-target flex-1 rounded-[14px] border border-border bg-white px-4 py-3 text-sm font-bold text-text transition-colors hover:bg-surface-hover" @click="emit('back')">Atrás</button>
      <button type="button" class="touch-target flex-[1.6] rounded-[14px] bg-text px-4 py-3 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(16,16,16,0.14)] transition-transform hover:bg-[#262626] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40" :disabled="nextDisabled" @click="emit('next')">{{ nextLabel ?? 'Continuar' }}</button>
    </div>
  </section>
</template>
