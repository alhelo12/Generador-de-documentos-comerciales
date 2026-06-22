<script setup lang="ts">
import type { DocumentData, SectionConfig } from '@/types/document'
import { useDocumentCalculations } from '@/composables/useDocumentCalculations'

const props = defineProps<{ doc: DocumentData; sections: SectionConfig[] }>()
const { formatCurrency } = useDocumentCalculations()

const t = (k: string) => ({ 'invoice': 'FACTURA', 'delivery-note': 'NOTA DE REMISIÓN', 'quote': 'COTIZACIÓN' } as Record<string, string>)[k] ?? k
const sc = props.doc.styleConfig

const subtotal = props.doc.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
const tax = subtotal * (props.doc.items[0]?.taxRate ?? 16) / 100
const total = subtotal + tax
const enabled = (id: string) => props.sections.find(s => s.id === id)?.enabled ?? true

const fontMap: Record<string, string> = { 'classic-serif': '"Source Serif 4", serif', 'modern-sans': '"Plus Jakarta Sans", sans-serif', 'minimal-sans': '"Inter Tight", sans-serif' }
</script>

<template>
  <div class="document-page" :style="{ fontFamily: fontMap[sc.fontFamily] ?? fontMap['modern-sans'] }">
    <!-- Header row: logo + type badge -->
    <div v-if="enabled('company')" class="flex items-start justify-between mb-8">
      <div :class="['flex items-center gap-3', sc.logoPosition === 'right' ? 'order-1' : '']">
        <img v-if="doc.company.logo" :src="doc.company.logo" class="h-10 w-auto" alt="Logo" />
        <div v-else class="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-base" :style="{ backgroundColor: sc.accentColor }">F</div>
        <div>
          <p class="font-bold text-sm">{{ doc.company.name }}</p>
          <p v-if="sc.showRfc" class="text-[11px] text-neutral-500">{{ doc.company.rfc }}</p>
        </div>
      </div>
      <div class="text-right">
        <span class="inline-block px-3 py-1 text-white text-[10px] font-bold uppercase tracking-wider rounded-full mb-1" :style="{ backgroundColor: sc.accentColor }">{{ t(doc.type) }}</span>
        <p v-if="sc.showDocumentNumber" class="text-xs text-neutral-500">No. {{ doc.number }}</p>
      </div>
    </div>

    <!-- Contact strip -->
    <div v-if="enabled('company')" class="rounded-lg px-4 py-3 mb-6 text-[11px] flex flex-wrap gap-x-6 gap-y-1" :style="{ backgroundColor: sc.accentColor + '12', color: sc.accentColor }">
      <span>{{ doc.company.address }}</span>
      <span v-if="sc.showPhone">{{ doc.company.phone }}</span>
      <span v-if="sc.showEmail">{{ doc.company.email }}</span>
      <span v-if="doc.company.website">{{ doc.company.website }}</span>
    </div>

    <!-- Client + date row -->
    <div v-if="enabled('client')" class="flex justify-between mb-6">
      <div>
        <p class="text-[10px] font-bold uppercase tracking-wider mb-1" :style="{ color: sc.accentColor }">Cliente</p>
        <p class="text-sm font-bold">{{ doc.client.name }}</p>
        <p v-if="sc.showRfc" class="text-xs text-neutral-600">RFC {{ doc.client.rfc }}</p>
        <p class="text-xs text-neutral-600">{{ doc.client.address }}</p>
        <p v-if="sc.showPhone || sc.showEmail" class="text-xs text-neutral-600">
          {{ sc.showPhone ? doc.client.phone : '' }}{{ sc.showPhone && sc.showEmail ? ' · ' : '' }}{{ sc.showEmail ? doc.client.email : '' }}
        </p>
      </div>
      <div class="text-right text-xs text-neutral-500">
        <p v-if="sc.showDate">Fecha: <span class="font-medium" :style="{ color: sc.accentColor }">{{ doc.date }}</span></p>
        <p v-if="doc.expiryDate">Vigencia: <span class="font-medium" :style="{ color: sc.accentColor }">{{ doc.expiryDate }}</span></p>
      </div>
    </div>

    <!-- Items table -->
    <table v-if="enabled('items')" class="w-full text-xs mb-6 border-collapse">
      <thead>
        <tr :style="{ backgroundColor: sc.accentColor + '12' }">
          <th class="py-2.5 px-3 text-left font-bold uppercase tracking-wider rounded-l-lg" :style="{ color: sc.accentColor }">#</th>
          <th class="py-2.5 px-3 text-left font-bold uppercase tracking-wider" :style="{ color: sc.accentColor }">Descripción</th>
          <th class="py-2.5 px-3 text-right font-bold uppercase tracking-wider" :style="{ color: sc.accentColor }">Cant</th>
          <th class="py-2.5 px-3 text-right font-bold uppercase tracking-wider" :style="{ color: sc.accentColor }">P/U</th>
          <th class="py-2.5 px-3 text-right font-bold uppercase tracking-wider rounded-r-lg" :style="{ color: sc.accentColor }">Importe</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, i) in doc.items" :key="item.id" class="border-b border-neutral-100">
          <td class="py-2.5 px-3 text-neutral-400">{{ i + 1 }}</td>
          <td class="py-2.5 px-3">
            <span class="text-neutral-400 text-[10px]" v-if="item.code">{{ item.code }} </span>
            <span class="font-medium">{{ item.description || '—' }}</span>
          </td>
          <td class="py-2.5 px-3 text-right tabular-nums">{{ item.quantity }}</td>
          <td class="py-2.5 px-3 text-right tabular-nums">{{ formatCurrency(item.unitPrice, sc.currencySymbol) }}</td>
          <td class="py-2.5 px-3 text-right tabular-nums font-semibold">{{ formatCurrency(item.quantity * item.unitPrice, sc.currencySymbol) }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Totals card -->
    <div v-if="enabled('totals')" class="rounded-lg p-4 mb-6 w-64 ml-auto" :style="{ backgroundColor: sc.accentColor + '12' }">
      <div class="flex justify-between text-xs py-1">
        <span :style="{ color: sc.accentColor }">Subtotal</span>
        <span class="tabular-nums font-medium">{{ formatCurrency(subtotal, sc.currencySymbol) }}</span>
      </div>
      <div class="flex justify-between text-xs py-1">
        <span :style="{ color: sc.accentColor }">{{ sc.taxLabel }} {{ doc.items[0]?.taxRate ?? 16 }}%</span>
        <span class="tabular-nums font-medium">{{ formatCurrency(tax, sc.currencySymbol) }}</span>
      </div>
      <div class="flex justify-between text-sm font-bold pt-2 mt-1" :style="{ borderTop: `2px solid ${sc.accentColor}` }">
        <span>TOTAL</span>
        <span class="tabular-nums text-base">{{ formatCurrency(total, sc.currencySymbol) }}</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex gap-4 text-[11px] text-neutral-500">
      <div v-if="doc.paymentTerms && enabled('payment-terms')" class="flex-1">
        <p class="font-bold mb-0.5" :style="{ color: sc.accentColor }">Pago</p>
        <p>{{ doc.paymentTerms }}</p>
      </div>
      <div v-if="doc.bankInfo && enabled('bank-info')" class="flex-1">
        <p class="font-bold mb-0.5" :style="{ color: sc.accentColor }">Banco</p>
        <p>{{ doc.bankInfo }}</p>
      </div>
    </div>
    <div v-if="doc.customFields.length && enabled('custom-fields')" class="mt-3 text-[11px] text-neutral-500 flex flex-wrap gap-x-6 gap-y-1">
      <div v-for="f in doc.customFields.filter(f => f.value)" :key="f.label">
        <span class="font-medium" :style="{ color: sc.accentColor }">{{ f.label }}:</span> {{ f.value }}
      </div>
    </div>
    <div v-if="doc.notes && enabled('notes')" class="mt-4 text-[11px] text-neutral-500 border-t pt-3" :style="{ borderColor: sc.accentColor + '30' }">
      {{ doc.notes }}
    </div>

    <!-- Signature -->
    <div v-if="enabled('signature-client') || enabled('signature-company')" class="mt-12 pt-4 text-[11px] text-neutral-500" :style="{ borderTop: `1px solid ${sc.accentColor}30` }">
      <div class="flex justify-between">
        <div v-if="enabled('signature-client')" class="text-center">
          <div class="w-36 pt-1 mt-10" :style="{ borderTop: `1px solid ${sc.accentColor}60` }"></div>
          <p class="mt-1">{{ doc.signatureClientLabel }}</p>
        </div>
        <div v-if="enabled('signature-company')" class="text-center">
          <div class="w-36 pt-1 mt-10" :style="{ borderTop: `1px solid ${sc.accentColor}60` }"></div>
          <p class="mt-1">{{ doc.signatureCompanyLabel }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
