<script setup lang="ts">
import AppModal from './AppModal.vue'

defineProps<{ show: boolean; title?: string; message: string; confirmText?: string; cancelText?: string; variant?: 'danger' | 'default' }>()
const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <AppModal :show="show" :title="title ?? 'Confirmar'" max-width="max-w-md" @close="emit('cancel')">
    <p class="text-sm text-text-secondary">{{ message }}</p>
    <div class="flex justify-end gap-2 mt-6">
      <button @click="emit('cancel')" class="px-5 py-2.5 text-sm font-bold rounded-full bg-surface-hover text-text-secondary hover:text-text">{{ cancelText ?? 'Cancelar' }}</button>
      <button @click="emit('confirm')" :class="['px-5 py-2.5 text-sm font-bold rounded-full transition-colors', variant === 'danger' ? 'bg-danger text-white hover:bg-red-600' : 'bg-text text-white hover:bg-black']">{{ confirmText ?? 'Confirmar' }}</button>
    </div>
  </AppModal>
</template>
