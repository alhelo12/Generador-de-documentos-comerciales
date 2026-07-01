<script setup lang="ts">
defineProps<{
  modelValue: boolean
  label?: string
  disabled?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<template>
  <label class="inline-flex items-center gap-2 cursor-pointer" :class="disabled && 'opacity-50 cursor-not-allowed'">
    <div class="relative">
      <input
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
        class="sr-only peer"
      />
      <div class="w-4 h-4 rounded border border-neutral-300 bg-white transition-all peer-checked:bg-accent peer-checked:border-accent peer-focus:ring-1 peer-focus:ring-accent/30 peer-disabled:opacity-50">
        <svg class="w-4 h-4 text-white absolute inset-0 opacity-0 peer-checked:opacity-100 transition-opacity" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
      </div>
    </div>
    <span v-if="label" class="text-sm text-neutral-700">{{ label }}</span>
  </label>
</template>
