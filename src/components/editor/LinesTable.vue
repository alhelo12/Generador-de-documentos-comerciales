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
    <div class="hidden overflow-x-auto sm:block">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-black/[0.04]">
            <th class="py-2 pr-1.5 font-bold text-[10px] uppercase text-center w-5 text-text-muted">#</th>
            <th class="py-2 pr-1.5 font-bold text-[10px] uppercase text-left text-text-muted">Codigo</th>
            <th class="py-2 pr-1.5 font-bold text-[10px] uppercase text-left text-text-muted">Descripcion</th>
            <th class="py-2 pr-1.5 font-bold text-[10px] uppercase text-right w-14 text-text-muted">Cant.</th>
            <th class="py-2 pr-1.5 font-bold text-[10px] uppercase text-right w-20 text-text-muted">P/U</th>
            <th class="py-2 pr-1.5 font-bold text-[10px] uppercase text-right w-14 text-text-muted">IVA %</th>
            <th class="py-2 font-bold text-[10px] uppercase text-right w-20 text-text-muted">Importe</th>
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
    <div class="space-y-3 sm:hidden">
      <LineRow
        v-for="(item, i) in items"
        :key="item.id"
        :item="item"
        :index="i"
        :isOnly="items.length === 1"
        :currencySymbol="sym()"
        :mobile="true"
        @update="(field, value) => emit('update', item.id, field, value)"
        @remove="emit('remove', item.id)"
      />
    </div>
    <button @click="emit('add')" class="text-xs font-bold text-accent hover:text-accent-hover transition-colors">+ Agregar linea</button>

    <div class="border-t border-black/[0.04] pt-3 space-y-2 text-sm">
      <div class="flex justify-between text-text-secondary">
        <span>Subtotal</span>
        <span class="tabular-nums font-semibold">{{ formatCurrency(subtotal, sym()) }}</span>
      </div>
      <div class="flex justify-between text-text-secondary">
        <span>{{ ivaLabel }}</span>
        <span class="tabular-nums font-semibold">{{ formatCurrency(taxAmount, sym()) }}</span>
      </div>
      <div class="flex justify-between text-base font-extrabold border-t border-black/[0.04] pt-2.5 text-text">
        <span>Total</span>
        <span class="tabular-nums">{{ formatCurrency(total, sym()) }}</span>
      </div>
    </div>
  </div>
</template>
