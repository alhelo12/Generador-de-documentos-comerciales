<script setup lang="ts">
import { useId } from 'vue'

defineProps<{ label?: string; modelValue: string | number; type?: string; placeholder?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const inputId = useId()
</script>

<template>
  <div class="flex flex-col gap-2">
    <label v-if="label" :for="inputId" class="text-[11px] font-bold uppercase tracking-wider text-text-muted">{{ label }}</label>
    <input
      :id="inputId"
      :type="type ?? 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      class="w-full px-3.5 py-2.5 text-sm rounded-xl glass-control text-text placeholder:text-text-muted"
    />
  </div>
</template>
