<script setup lang="ts">
import type { LineItem } from '@/types/document'
import { useDocumentCalculations } from '@/composables/useDocumentCalculations'

const props = defineProps<{ item: LineItem; index: number; isOnly: boolean }>()
const emit = defineEmits<{ update: [field: string, value: any]; remove: [] }>()
const { formatCurrency } = useDocumentCalculations()

const importe = () => props.item.quantity * props.item.unitPrice
</script>

<template>
  <tr class="border-b border-neutral-100 last:border-0">
    <td class="py-2 pr-2 text-xs text-neutral-400 w-6 text-center align-middle">{{ index + 1 }}</td>
    <td class="py-2 pr-2 align-middle">
      <input :value="item.code" @input="emit('update', 'code', ($event.target as HTMLInputElement).value)" placeholder="Código" class="w-full px-2 py-1.5 text-xs border border-neutral-200 rounded bg-transparent outline-none focus:border-accent" />
    </td>
    <td class="py-2 pr-2 align-middle">
      <input :value="item.description" @input="emit('update', 'description', ($event.target as HTMLInputElement).value)" placeholder="Descripción" class="w-full px-2 py-1.5 text-xs border border-neutral-200 rounded bg-transparent outline-none focus:border-accent" />
    </td>
    <td class="py-2 pr-2 align-middle w-16">
      <input :value="item.quantity" type="number" min="1" @input="emit('update', 'quantity', Number(($event.target as HTMLInputElement).value))" class="w-full px-2 py-1.5 text-xs border border-neutral-200 rounded bg-transparent outline-none focus:border-accent text-right" />
    </td>
    <td class="py-2 pr-2 align-middle w-24">
      <input :value="item.unitPrice" type="number" min="0" step="0.01" @input="emit('update', 'unitPrice', Number(($event.target as HTMLInputElement).value))" class="w-full px-2 py-1.5 text-xs border border-neutral-200 rounded bg-transparent outline-none focus:border-accent text-right" />
    </td>
    <td class="py-2 align-middle w-24 text-right text-xs font-medium tabular-nums pr-1">{{ formatCurrency(importe()) }}</td>
    <td class="py-2 align-middle w-8 text-center">
      <button v-if="!isOnly" @click="emit('remove')" class="text-neutral-300 hover:text-danger transition-colors p-1" title="Eliminar línea">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </td>
  </tr>
</template>
