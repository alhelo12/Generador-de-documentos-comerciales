<script setup lang="ts">
import type { LineItem } from '@/types/document'
import { useDocumentCalculations } from '@/composables/useDocumentCalculations'

const props = defineProps<{ item: LineItem; index: number; isOnly: boolean; currencySymbol?: string }>()
const emit = defineEmits<{ update: [field: keyof LineItem, value: string | number]; remove: [] }>()
const { formatCurrency } = useDocumentCalculations()

const importe = () => props.item.quantity * props.item.unitPrice
</script>

<template>
  <tr class="border-b border-border-light last:border-0">
    <td class="py-2 pr-1.5 text-[10px] w-5 text-center align-middle" style="color: #94a3b8;">{{ index + 1 }}</td>
    <td class="py-2 pr-1.5 align-middle">
      <input :value="item.code" @input="emit('update', 'code', ($event.target as HTMLInputElement).value)" placeholder="Código" class="w-full px-2 py-1.5 text-xs rounded border border-border bg-bg text-text placeholder:text-text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent/20" />
    </td>
    <td class="py-2 pr-1.5 align-middle">
      <input :value="item.description" @input="emit('update', 'description', ($event.target as HTMLInputElement).value)" placeholder="Descripción" class="w-full px-2 py-1.5 text-xs rounded border border-border bg-bg text-text placeholder:text-text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent/20" />
    </td>
    <td class="py-2 pr-1.5 align-middle w-14">
      <input :value="item.quantity" type="number" min="1" @input="emit('update', 'quantity', Number(($event.target as HTMLInputElement).value))" class="w-full px-2 py-1.5 text-xs rounded border border-border bg-bg text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 text-right" />
    </td>
    <td class="py-2 pr-1.5 align-middle w-20">
      <input :value="item.unitPrice" type="number" min="0" step="0.01" @input="emit('update', 'unitPrice', Number(($event.target as HTMLInputElement).value))" class="w-full px-2 py-1.5 text-xs rounded border border-border bg-bg text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 text-right" />
    </td>
    <td class="py-2 pr-1.5 align-middle w-14">
      <input :value="item.taxRate" type="number" min="0" max="100" step="0.5" @input="emit('update', 'taxRate', Number(($event.target as HTMLInputElement).value))" class="w-full px-2 py-1.5 text-xs rounded border border-border bg-bg text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 text-right" />
    </td>
    <td class="py-2 align-middle w-20 text-right text-xs font-semibold tabular-nums pr-1.5" style="color: #0f172a;">{{ formatCurrency(importe(), currencySymbol ?? '$') }}</td>
    <td class="py-2 align-middle w-6 text-center">
      <button v-if="!isOnly" @click="emit('remove')" class="w-5 h-5 flex items-center justify-center rounded hover:bg-surface-hover transition-colors" style="color: #94a3b8;" title="Eliminar">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </td>
  </tr>
</template>
