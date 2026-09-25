<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = defineProps<{ show: boolean; title?: string; maxWidth?: string }>()
const emit = defineEmits<{ close: [] }>()

const contentRef = ref<HTMLElement | null>(null)

function getFocusable(): HTMLElement[] {
  if (!contentRef.value) return []
  return Array.from(contentRef.value.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.show) { emit('close'); return }
  if (e.key === 'Tab' && props.show) {
    const f = getFocusable()
    if (!f.length) return
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus() }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus() }
  }
}

watch(() => props.show, async (v) => {
  if (v) { document.addEventListener('keydown', onKeydown); await nextTick(); getFocusable()[0]?.focus() }
  else document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="emit('close')">
        <div class="absolute inset-0 bg-black/40" />
        <div :class="[maxWidth ?? 'max-w-4xl', 'phone-card w-full max-h-[90vh] overscroll-contain overflow-y-auto relative']">
          <div v-if="title" class="flex items-center justify-between px-6 py-4">
            <h2 class="font-display text-base font-extrabold text-text">{{ title }}</h2>
            <button @click="emit('close')" class="flex items-center gap-1.5 pl-3 pr-4 py-2 rounded-full bg-surface-hover text-text-secondary hover:text-text text-xs font-bold" aria-label="Cerrar ventana">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              Cerrar
            </button>
          </div>
          <div ref="contentRef" class="px-6 pb-6"><slot /></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
