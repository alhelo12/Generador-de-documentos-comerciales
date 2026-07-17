<script setup lang="ts">
import AppModal from './AppModal.vue'

defineProps<{ show: boolean; title?: string; message: string; confirmText?: string; cancelText?: string; variant?: 'danger' | 'default' }>()
const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <AppModal :show="show" :title="title ?? 'Confirmar'" max-width="max-w-md" @close="emit('cancel')">
    <p class="text-sm text-text-secondary">{{ message }}</p>
    <div class="flex justify-end gap-2 mt-6">
      <button @click="emit('cancel')" class="glass-control px-4 py-2 text-sm font-semibold rounded-xl text-text-secondary hover:text-text">{{ cancelText ?? 'Cancelar' }}</button>
      <button @click="emit('confirm')" :class="['px-4 py-2 text-sm font-bold text-white rounded-xl transition-all', variant === 'danger' ? 'bg-danger hover:bg-red-600' : 'accent-glow']">{{ confirmText ?? 'Confirmar' }}</button>
    </div>
  </AppModal>
</template>
