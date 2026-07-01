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
    <div class="relative">
      <select
        :value="modelValue"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
        class="w-full px-3 py-2 pr-8 text-sm border border-neutral-300 rounded-md bg-white transition-colors outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 appearance-none cursor-pointer"
      >
        <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <svg class="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
    </div>
  </div>
</template>
