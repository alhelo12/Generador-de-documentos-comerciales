<script setup lang="ts">
defineProps<{
  label?: string
  modelValue: string
  options: { value: string; label: string }[]
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-xs font-medium text-neutral-600">{{ label }}</label>
    <select
      :value="modelValue"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      class="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md bg-white transition-colors outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 appearance-none cursor-pointer"
    >
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
  </div>
</template>
