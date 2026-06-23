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
    <Transition name="page">
      <div
        v-if="visible"
        :class="[
          'fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg text-sm font-medium max-w-sm',
          type === 'success' ? 'bg-success text-white' : '',
          type === 'error' ? 'bg-danger text-white' : '',
          type === 'info' ? 'bg-accent text-accent-fg' : '',
        ]"
      >
        {{ message }}
      </div>
    </Transition>
  </Teleport>
</template>
