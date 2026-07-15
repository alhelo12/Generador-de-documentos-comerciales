<script setup lang="ts">
import { computed } from 'vue'
import type { LineItem } from '@/types/document'
import LineRow from './LineRow.vue'
import AppButton from '@/components/ui/AppButton.vue'
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
    <slot name="header"><h3 class="text-xs font-semibold uppercase tracking-wider text-neutral-500">Conceptos</h3></slot>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-neutral-300 text-[11px] uppercase tracking-wider text-neutral-500">
            <th class="py-2 pr-2 font-medium text-center w-6">#</th>
            <th class="py-2 pr-2 font-medium text-left">Código</th>
            <th class="py-2 pr-2 font-medium text-left">Descripción</th>
            <th class="py-2 pr-2 font-medium text-right w-16">Cant.</th>
            <th class="py-2 pr-2 font-medium text-right w-24">P/U</th>
            <th class="py-2 pr-2 font-medium text-right w-16">IVA %</th>
            <th class="py-2 font-medium text-right w-24">Importe</th>
            <th class="py-2 w-8"></th>
          </tr>
        </thead>
        <tbody>
          <LineRow
            v-for="(item, i) in items"
            :key="item.id"
            :item="item"
            :index="i"
            :isOnly="items.length === 1"
            @update="(field, value) => emit('update', item.id, field, value)"
            @remove="emit('remove', item.id)"
          />
        </tbody>
      </table>
    </div>
    <AppButton variant="ghost" size="sm" @click="emit('add')">
      + Agregar línea
    </AppButton>

    <div class="border-t border-neutral-200 pt-3 ml-auto w-64 space-y-1 text-sm">
      <div class="flex justify-between text-neutral-600">
        <span>Subtotal</span>
        <span class="tabular-nums">{{ formatCurrency(subtotal, sym()) }}</span>
      </div>
      <div class="flex justify-between text-neutral-600">
        <span>{{ ivaLabel }}</span>
        <span class="tabular-nums">{{ formatCurrency(taxAmount, sym()) }}</span>
      </div>
      <div class="flex justify-between text-base font-bold border-t border-neutral-300 pt-1">
        <span>Total</span>
        <span class="tabular-nums">{{ formatCurrency(total, sym()) }}</span>
      </div>
    </div>
  </div>
</template>
