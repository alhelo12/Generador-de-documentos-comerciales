<script setup lang="ts">
defineProps<{ label?: string; modelValue: string | number; type?: string; placeholder?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="text-xs font-semibold text-text-secondary">{{ label }}</label>
    <input
      :type="type ?? 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      class="neu-pressed w-full px-3.5 py-2.5 text-sm rounded-xl text-text placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent/20"
    />
  </div>
</template>
