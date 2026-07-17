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
        class="glass-raised fixed top-4 right-4 z-[100] px-5 py-3.5 rounded-2xl text-sm font-bold max-w-sm"
        :class="[
          type === 'success' ? 'text-success border border-success/20' : '',
          type === 'error' ? 'text-danger border border-danger/20' : '',
          type === 'info' ? 'text-accent border border-accent/20' : '',
        ]"
      >
        {{ message }}
      </div>
    </Transition>
  </Teleport>
</template>
