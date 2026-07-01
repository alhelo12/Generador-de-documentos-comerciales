<script setup lang="ts">
import { computed } from 'vue'
import type { DocumentData, SectionConfig } from '@/types/document'
import { useDocumentCalculations } from '@/composables/useDocumentCalculations'

const props = defineProps<{ doc: DocumentData; sections: SectionConfig[] }>()
const { formatCurrency } = useDocumentCalculations()

const t = (k: string) => ({ 'invoice': 'FACTURA', 'delivery-note': 'NOTA DE REMISIÓN', 'quote': 'COTIZACIÓN' } as Record<string, string>)[k] ?? k
const sc = props.doc.styleConfig

const subtotal = computed(() => props.doc.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0))
const tax = computed(() => props.doc.items.reduce((s, i) => s + (i.quantity * i.unitPrice * (i.taxRate ?? 16) / 100), 0))
const total = computed(() => subtotal.value + tax.value)
const enabled = (id: string) => props.sections.find(s => s.id === id)?.enabled ?? true

const fontMap: Record<string, string> = { 'classic-serif': '"Source Serif 4", serif', 'modern-sans': '"Plus Jakarta Sans", sans-serif', 'minimal-sans': '"Inter Tight", sans-serif' }
const logoAlign = sc.logoPosition === 'center' ? 'text-center' : sc.logoPosition === 'right' ? 'text-right' : 'text-left'
const logoJustify = sc.logoPosition === 'center' ? 'justify-center' : sc.logoPosition === 'right' ? 'justify-end' : 'justify-start'
</script>

<template>
  <div class="document-page" :style="{ fontFamily: fontMap[sc.fontFamily] ?? fontMap['minimal-sans'] }">
    <!-- Logo mark -->
    <div v-if="enabled('company')" :class="['flex', logoJustify, 'mb-6']">
      <div>
        <img v-if="doc.company.logo" :src="doc.company.logo" class="h-8 w-auto" alt="Logo" />
        <div v-else class="w-8 h-8 border flex items-center justify-center text-sm" :style="{ borderColor: sc.accentColor + '50', color: sc.accentColor }">f</div>
      </div>
    </div>

    <!-- Company -->
    <div v-if="enabled('company')" :class="logoAlign">
      <p class="text-xs font-light uppercase tracking-[0.15em] mb-1" :style="{ color: sc.accentColor }">{{ doc.company.name }}</p>
      <p v-if="sc.showRfc" class="text-[10px] text-neutral-400 font-light">{{ doc.company.rfc }}</p>
      <p v-if="doc.company.address" class="text-[10px] text-neutral-400 font-light">{{ doc.company.address }}</p>
      <p v-if="(sc.showPhone && doc.company.phone) || (sc.showEmail && doc.company.email)" class="text-[10px] text-neutral-400 font-light">
        {{ sc.showPhone && doc.company.phone ? doc.company.phone : '' }}{{ sc.showPhone && doc.company.phone && sc.showEmail && doc.company.email ? ' · ' : '' }}{{ sc.showEmail && doc.company.email ? doc.company.email : '' }}
      </p>
      <div class="my-8"></div>
    </div>

    <!-- Document type + number -->
    <p class="text-[10px] font-semibold uppercase tracking-[0.2em] mb-1" :style="{ color: sc.accentColor }">{{ t(doc.type) }}</p>
    <p class="text-3xl font-light tracking-tight text-neutral-950">{{ doc.number }}</p>
    <p v-if="sc.showDate" class="text-[10px] text-neutral-400 mt-1">{{ doc.date }}</p>
    <p v-if="doc.expiryDate" class="text-[10px] text-neutral-400">Vigencia: {{ doc.expiryDate }}</p>

    <div class="my-8"></div>

    <!-- Client -->
    <div v-if="enabled('client')">
      <p class="text-[10px] font-semibold uppercase tracking-[0.15em] mb-2" :style="{ color: sc.accentColor }">Cliente</p>
      <p class="text-sm font-medium">{{ doc.client.name }}</p>
      <p v-if="sc.showRfc" class="text-[11px] text-neutral-500">RFC {{ doc.client.rfc }}</p>
      <p v-if="doc.client.address" class="text-[11px] text-neutral-500">{{ doc.client.address }}</p>
      <p v-if="(sc.showPhone && doc.client.phone) || (sc.showEmail && doc.client.email)" class="text-[11px] text-neutral-500">
        {{ sc.showPhone && doc.client.phone ? doc.client.phone : '' }}{{ sc.showPhone && doc.client.phone && sc.showEmail && doc.client.email ? ' · ' : '' }}{{ sc.showEmail && doc.client.email ? doc.client.email : '' }}
      </p>
      <div class="my-8"></div>
    </div>

    <!-- Items -->
    <div v-if="enabled('items')">
      <div v-for="(item, i) in doc.items" :key="item.id" class="flex justify-between py-2 border-b border-neutral-100 last:border-0">
        <div class="flex-1">
          <p class="text-sm font-normal">{{ item.description || '—' }}</p>
          <p v-if="item.code" class="text-[10px] text-neutral-400">{{ item.code }} · {{ item.quantity }} × {{ formatCurrency(item.unitPrice, sc.currencySymbol) }}</p>
          <p v-else class="text-[10px] text-neutral-400">{{ item.quantity }} × {{ formatCurrency(item.unitPrice, sc.currencySymbol) }}</p>
        </div>
        <p class="text-sm tabular-nums font-medium ml-8">{{ formatCurrency(item.quantity * item.unitPrice, sc.currencySymbol) }}</p>
      </div>
    </div>

    <div v-if="enabled('totals')" class="my-6 pt-3 w-64 ml-auto" :style="{ borderTop: `1px solid ${sc.accentColor}30` }">
      <div class="flex justify-between text-xs text-neutral-500 py-1">
        <span>Subtotal</span>
        <span class="tabular-nums">{{ formatCurrency(subtotal, sc.currencySymbol) }}</span>
      </div>
      <div class="flex justify-between text-xs text-neutral-500 py-1">
        <span>{{ sc.taxLabel }}</span>
        <span class="tabular-nums">{{ formatCurrency(tax, sc.currencySymbol) }}</span>
      </div>
      <div class="flex justify-between text-base font-semibold pt-2 mt-1" :style="{ borderTop: `2px solid ${sc.accentColor}` }">
        <span>Total</span>
        <span class="tabular-nums text-xl font-light">{{ formatCurrency(total, sc.currencySymbol) }}</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="mt-10 pt-4 text-[10px] text-neutral-400 space-y-1" :style="{ borderTop: `1px solid ${sc.accentColor}20` }">
      <div v-if="doc.paymentTerms && enabled('payment-terms')" class="flex gap-2"><span class="font-medium" :style="{ color: sc.accentColor }">Pago:</span> {{ doc.paymentTerms }}</div>
      <div v-if="doc.bankInfo && enabled('bank-info')" class="flex gap-2"><span class="font-medium" :style="{ color: sc.accentColor }">Banco:</span> {{ doc.bankInfo }}</div>
      <div v-if="doc.notes && enabled('notes')" class="mt-4 italic">{{ doc.notes }}</div>
    </div>

    <!-- Custom fields -->
    <div v-if="doc.customFields.filter(f => f.value).length && enabled('custom-fields')" class="mt-4 text-[10px] text-neutral-400 space-y-1">
      <div v-for="f in doc.customFields.filter(f => f.value)" :key="f.label" class="flex gap-2">
        <span class="font-medium" :style="{ color: sc.accentColor }">{{ f.label }}:</span> {{ f.value }}
      </div>
    </div>

    <!-- Signature -->
    <div v-if="enabled('signature-client') || enabled('signature-company')" class="mt-10 text-[10px] text-neutral-400 flex justify-between">
      <div v-if="enabled('signature-client')" class="text-center">
        <div class="w-32 pt-1" :style="{ borderTop: `1px solid ${sc.accentColor}60` }"></div>
        <p class="mt-1">{{ doc.signatureClientLabel }}</p>
      </div>
      <div v-if="enabled('signature-company')" class="text-center">
        <div class="w-32 pt-1" :style="{ borderTop: `1px solid ${sc.accentColor}60` }"></div>
        <p class="mt-1">{{ doc.signatureCompanyLabel }}</p>
      </div>
    </div>
  </div>
</template>
