<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
const message = ref('')
const type = ref<'success' | 'error' | 'info'>('info')
let timer: ReturnType<typeof setTimeout> | null = null

function show(msg: string, t: 'success' | 'error' | 'info' = 'info', duration = 3000) {
  message.value = msg
  type.value = t
  visible.value = true
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => { visible.value = false }, duration)
}

defineExpose({ show })
</script>

<template>
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="visible"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        class="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-full text-sm font-bold max-w-sm bg-text text-white whitespace-nowrap"
        style="box-shadow: 0 12px 32px rgba(20,20,20,0.25);"
      >
        {{ message }}
      </div>
    </Transition>
  </Teleport>
</template>
