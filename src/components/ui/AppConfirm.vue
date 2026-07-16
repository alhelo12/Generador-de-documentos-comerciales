<script setup lang="ts">
import AppModal from './AppModal.vue'

defineProps<{ show: boolean; title?: string; message: string; confirmText?: string; cancelText?: string; variant?: 'danger' | 'default' }>()
const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <AppModal :show="show" :title="title ?? 'Confirmar'" max-width="max-w-md" @close="emit('cancel')">
    <p class="text-sm" style="color: #475569;">{{ message }}</p>
    <div class="flex justify-end gap-2 mt-5">
      <button @click="emit('cancel')" class="px-4 py-2 text-sm font-medium rounded-lg border border-border text-text-secondary hover:bg-surface-hover transition-all">{{ cancelText ?? 'Cancelar' }}</button>
      <button @click="emit('confirm')" :class="['px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all', variant === 'danger' ? 'bg-danger hover:bg-red-600' : 'bg-accent hover:bg-accent-hover']">{{ confirmText ?? 'Confirmar' }}</button>
    </div>
  </AppModal>
</template>
