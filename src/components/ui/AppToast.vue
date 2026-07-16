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
        class="neu-raised fixed top-4 right-4 z-[100] px-4 py-3 rounded-2xl text-sm font-medium max-w-sm"
        :class="[
          type === 'success' ? 'bg-success-light text-green-800 border-green-200' : '',
          type === 'error' ? 'bg-danger-light text-red-800 border-red-200' : '',
          type === 'info' ? 'bg-accent-light text-blue-800 border-blue-200' : '',
        ]"
      >
        {{ message }}
      </div>
    </Transition>
  </Teleport>
</template>
