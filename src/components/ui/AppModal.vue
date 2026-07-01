<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = defineProps<{ show: boolean; title?: string; maxWidth?: string }>()
const emit = defineEmits<{ close: [] }>()

const contentRef = ref<HTMLElement | null>(null)

function getFocusable(): HTMLElement[] {
  if (!contentRef.value) return []
  return Array.from(
    contentRef.value.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
  )
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.show) {
    emit('close')
    return
  }
  if (e.key === 'Tab' && props.show) {
    const focusable = getFocusable()
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus() }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus() }
    }
  }
}

watch(() => props.show, async (v) => {
  if (v) {
    document.addEventListener('keydown', onKeydown)
    await nextTick()
    const focusable = getFocusable()
    if (focusable.length > 0) focusable[0].focus()
  } else {
    document.removeEventListener('keydown', onKeydown)
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center" @click.self="emit('close')">
        <div class="absolute inset-0 bg-black/20 backdrop-blur-sm" />
        <div :class="['relative bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto', maxWidth ?? 'max-w-4xl', 'w-full mx-4']">
          <div v-if="title" class="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
            <h2 class="text-lg font-semibold">{{ title }}</h2>
            <button @click="emit('close')" class="text-neutral-400 hover:text-neutral-600 transition-colors p-1" aria-label="Cerrar">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div ref="contentRef" class="p-6">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
