<script setup lang="ts">
defineProps<{
  label?: string
  modelValue: string | number
  type?: string
  placeholder?: string
  error?: string
  help?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-xs font-medium text-neutral-600">{{ label }}</label>
    <input
      :type="type ?? 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :class="[
        'w-full px-3 py-2 text-sm border rounded-md bg-white transition-colors outline-none',
        'focus:border-accent focus:ring-1 focus:ring-accent/30',
        error ? 'border-danger' : 'border-neutral-300',
      ]"
    />
    <p v-if="error" class="text-xs text-danger">{{ error }}</p>
    <p v-else-if="help" class="text-xs text-neutral-400">{{ help }}</p>
  </div>
</template>
