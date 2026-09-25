<script setup lang="ts">
import type { LineItem } from '@/types/document'
import { useDocumentCalculations } from '@/composables/useDocumentCalculations'

const props = defineProps<{ item: LineItem; index: number; isOnly: boolean; currencySymbol?: string }>()
const emit = defineEmits<{ update: [field: keyof LineItem, value: string | number]; remove: [] }>()
const { formatCurrency } = useDocumentCalculations()

const importe = () => props.item.quantity * props.item.unitPrice
</script>

<template>
  <tr class="border-b border-black/[0.03] last:border-0">
    <td class="py-2 pr-1.5 text-[10px] w-5 text-center align-middle text-text-muted">{{ index + 1 }}</td>
    <td class="py-2 pr-1.5 align-middle">
      <input :value="item.code" @input="emit('update', 'code', ($event.target as HTMLInputElement).value)" placeholder="Codigo" class="w-full px-2 py-1.5 text-xs rounded-full bg-surface-hover text-text placeholder:text-text-muted" />
    </td>
    <td class="py-2 pr-1.5 align-middle">
      <input :value="item.description" @input="emit('update', 'description', ($event.target as HTMLInputElement).value)" placeholder="Descripcion" class="w-full px-2 py-1.5 text-xs rounded-full bg-surface-hover text-text placeholder:text-text-muted" />
    </td>
    <td class="py-2 pr-1.5 align-middle w-14">
      <input :value="item.quantity" type="number" min="1" @input="emit('update', 'quantity', Number(($event.target as HTMLInputElement).value))" class="w-full px-2 py-1.5 text-xs rounded-full bg-surface-hover text-text text-right" />
    </td>
    <td class="py-2 pr-1.5 align-middle w-20">
      <input :value="item.unitPrice" type="number" min="0" step="0.01" @input="emit('update', 'unitPrice', Number(($event.target as HTMLInputElement).value))" class="w-full px-2 py-1.5 text-xs rounded-full bg-surface-hover text-text text-right" />
    </td>
    <td class="py-2 pr-1.5 align-middle w-14">
      <input :value="item.taxRate" type="number" min="0" max="100" step="0.5" @input="emit('update', 'taxRate', Number(($event.target as HTMLInputElement).value))" class="w-full px-2 py-1.5 text-xs rounded-full bg-surface-hover text-text text-right" />
    </td>
    <td class="py-2 align-middle w-20 text-right text-xs font-bold tabular-nums pr-1.5 text-text">{{ formatCurrency(importe(), currencySymbol ?? '$') }}</td>
    <td class="py-2 align-middle w-6 text-center">
      <button v-if="!isOnly" @click="emit('remove')" class="px-3 py-1.5 text-[11px] font-bold rounded-full text-text-muted hover:text-danger hover:bg-danger/10 transition-colors" title="Quitar esta línea">
        Quitar
      </button>
    </td>
  </tr>
</template>
