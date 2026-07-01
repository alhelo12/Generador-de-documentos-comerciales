<script setup lang="ts">
import AppModal from './AppModal.vue'
import AppButton from './AppButton.vue'

defineProps<{
  show: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'default'
}>()
const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <AppModal :show="show" :title="title ?? 'Confirmar'" max-width="max-w-md" @close="emit('cancel')">
    <p class="text-sm text-neutral-600">{{ message }}</p>
    <div class="flex justify-end gap-2 mt-6">
      <AppButton variant="secondary" @click="emit('cancel')">{{ cancelText ?? 'Cancelar' }}</AppButton>
      <AppButton :variant="variant === 'danger' ? 'danger' : 'primary'" @click="emit('confirm')">{{ confirmText ?? 'Confirmar' }}</AppButton>
    </div>
  </AppModal>
</template>
