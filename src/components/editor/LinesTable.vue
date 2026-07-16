<script setup lang="ts">
import { computed } from 'vue'
import type { LineItem } from '@/types/document'
import LineRow from './LineRow.vue'
import { useDocumentCalculations } from '@/composables/useDocumentCalculations'

const props = defineProps<{ items: LineItem[]; subtotal: number; taxAmount: number; total: number; currencySymbol?: string }>()
const emit = defineEmits<{ add: []; remove: [id: string]; update: [id: string, field: keyof LineItem, value: string | number] }>()
const { formatCurrency } = useDocumentCalculations()

const sym = () => props.currencySymbol ?? '$'
const ivaLabel = computed(() => {
  const a = props.items
  if (a.length === 0) return 'IVA'
  const r = a[0].taxRate
  return a.every(i => i.taxRate === r) ? `IVA (${r}%)` : 'IVA'
})
</script>

<template>
  <div class="space-y-3">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border" style="color: #94a3b8;">
            <th class="py-2 pr-1.5 font-semibold text-[10px] uppercase text-center w-5">#</th>
            <th class="py-2 pr-1.5 font-semibold text-[10px] uppercase text-left">Código</th>
            <th class="py-2 pr-1.5 font-semibold text-[10px] uppercase text-left">Descripción</th>
            <th class="py-2 pr-1.5 font-semibold text-[10px] uppercase text-right w-14">Cant.</th>
            <th class="py-2 pr-1.5 font-semibold text-[10px] uppercase text-right w-20">P/U</th>
            <th class="py-2 pr-1.5 font-semibold text-[10px] uppercase text-right w-14">IVA %</th>
            <th class="py-2 font-semibold text-[10px] uppercase text-right w-20">Importe</th>
            <th class="py-2 w-6"></th>
          </tr>
        </thead>
        <tbody>
          <LineRow
            v-for="(item, i) in items"
            :key="item.id"
            :item="item"
            :index="i"
            :isOnly="items.length === 1"
            :currencySymbol="sym()"
            @update="(field, value) => emit('update', item.id, field, value)"
            @remove="emit('remove', item.id)"
          />
        </tbody>
      </table>
    </div>
    <button @click="emit('add')" class="text-xs font-semibold text-accent hover:text-accent-hover transition-colors">+ Agregar línea</button>

    <div class="border-t border-border pt-3 space-y-1.5 text-sm">
      <div class="flex justify-between" style="color: #475569;">
        <span>Subtotal</span>
        <span class="tabular-nums font-medium">{{ formatCurrency(subtotal, sym()) }}</span>
      </div>
      <div class="flex justify-between" style="color: #475569;">
        <span>{{ ivaLabel }}</span>
        <span class="tabular-nums font-medium">{{ formatCurrency(taxAmount, sym()) }}</span>
      </div>
      <div class="flex justify-between text-base font-bold border-t border-border pt-2" style="color: #0f172a;">
        <span>Total</span>
        <span class="tabular-nums">{{ formatCurrency(total, sym()) }}</span>
      </div>
    </div>
  </div>
</template>
