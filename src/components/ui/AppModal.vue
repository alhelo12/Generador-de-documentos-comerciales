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
        <div class="absolute inset-0 bg-slate-700/20 backdrop-blur-sm" />
        <div :class="[maxWidth ?? 'max-w-4xl', 'neu-raised w-full max-h-[90vh] overscroll-contain overflow-y-auto rounded-3xl relative']">
          <div v-if="title" class="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 class="text-base font-semibold" style="color: #0f172a;">{{ title }}</h2>
            <button @click="emit('close')" class="neu-control w-8 h-8 flex items-center justify-center rounded-xl text-text-muted hover:text-text" aria-label="Cerrar">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div ref="contentRef" class="p-5"><slot /></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
