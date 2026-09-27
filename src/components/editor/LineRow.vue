<script setup lang="ts">
import type { LineItem } from '@/types/document'
import { useDocumentCalculations } from '@/composables/useDocumentCalculations'

const props = defineProps<{ item: LineItem; index: number; isOnly: boolean; currencySymbol?: string; mobile?: boolean }>()
const emit = defineEmits<{ update: [field: keyof LineItem, value: string | number]; remove: [] }>()
const { formatCurrency } = useDocumentCalculations()

const importe = () => props.item.quantity * props.item.unitPrice
</script>

<template>
  <article v-if="mobile" class="rounded-[16px] border border-border-light bg-white p-3 shadow-[0_4px_12px_rgba(16,16,16,0.04)]">
    <div class="mb-3 flex items-center justify-between gap-2"><p class="text-xs font-bold text-text-muted">Concepto {{ index + 1 }}</p><button v-if="!isOnly" type="button" class="touch-target rounded-[10px] px-2 text-xs font-bold text-text-muted hover:bg-[#FBE8E8] hover:text-[#A02A2A]" title="Quitar esta línea" @click="emit('remove')">Quitar</button></div>
    <div class="space-y-3">
      <input :value="item.description" @input="emit('update', 'description', ($event.target as HTMLInputElement).value)" placeholder="Descripción del producto o servicio" class="h-11 w-full bg-surface-hover px-3 text-sm font-semibold text-text placeholder:text-text-muted" />
      <div class="grid grid-cols-3 gap-2">
        <label class="block"><span class="mb-1 block text-[10px] font-bold text-text-muted">Código</span><input :value="item.code" @input="emit('update', 'code', ($event.target as HTMLInputElement).value)" placeholder="Opcional" class="h-10 w-full bg-surface-hover px-2 text-xs text-text" /></label>
        <label class="block"><span class="mb-1 block text-[10px] font-bold text-text-muted">Cantidad</span><input :value="item.quantity" type="number" min="1" @input="emit('update', 'quantity', Number(($event.target as HTMLInputElement).value))" class="h-10 w-full bg-surface-hover px-2 text-xs text-right text-text" /></label>
        <label class="block"><span class="mb-1 block text-[10px] font-bold text-text-muted">Precio</span><input :value="item.unitPrice" type="number" min="0" step="0.01" @input="emit('update', 'unitPrice', Number(($event.target as HTMLInputElement).value))" class="h-10 w-full bg-surface-hover px-2 text-xs text-right text-text" /></label>
      </div>
      <div class="flex items-center justify-between border-t border-border-light pt-3"><label class="flex items-center gap-2 text-[10px] font-bold text-text-muted">IVA % <input :value="item.taxRate" type="number" min="0" max="100" step="0.5" @input="emit('update', 'taxRate', Number(($event.target as HTMLInputElement).value))" class="h-9 w-16 bg-surface-hover px-2 text-xs text-right text-text" /></label><p class="text-sm font-extrabold tabular-nums text-text">{{ formatCurrency(importe(), currencySymbol ?? '$') }}</p></div>
    </div>
  </article>
  <tr v-else class="border-b border-black/[0.03] last:border-0">
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
