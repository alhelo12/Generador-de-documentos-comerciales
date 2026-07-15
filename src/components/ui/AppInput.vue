<script setup lang="ts">
defineProps<{
  label?: string
  modelValue: string | number
  type?: string
  placeholder?: string
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
      class="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md bg-white outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/30"
    />
  </div>
</template>
