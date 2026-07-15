<script setup lang="ts">
import type { ClientData } from '@/types/document'
import AppInput from '@/components/ui/AppInput.vue'

defineProps<{ client: ClientData }>()
const emit = defineEmits<{ update: [field: keyof ClientData, value: string] }>()
</script>

<template>
  <div class="space-y-3">
    <slot name="header"><h3 class="text-xs font-semibold uppercase tracking-wider text-neutral-500">Cliente</h3></slot>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <AppInput :modelValue="client.name" label="Nombre / Razón Social" @update:modelValue="emit('update', 'name', $event)" />
      <AppInput :modelValue="client.rfc" label="RFC" @update:modelValue="emit('update', 'rfc', $event)" />
      <AppInput :modelValue="client.address" label="Dirección" class="md:col-span-2" @update:modelValue="emit('update', 'address', $event)" />
      <AppInput :modelValue="client.phone" label="Teléfono" @update:modelValue="emit('update', 'phone', $event)" />
      <AppInput :modelValue="client.email" label="Correo" @update:modelValue="emit('update', 'email', $event)" />
    </div>
  </div>
</template>
