<script setup lang="ts">
import type { DocumentData, SectionConfig } from '@/types/document'
import { useDocumentTemplate } from '@/composables/useDocumentTemplate'

const props = defineProps<{ doc: DocumentData; sections: SectionConfig[] }>()
const { sc, accent, typeTitle, subtotal, total, taxRows, enabled, fontFamilyOf, formatCurrency, formatDate } = useDocumentTemplate(props.doc, props.sections)
</script>

<template>
  <article class="document-page text-[9px] leading-relaxed text-slate-900" :style="{ fontFamily: fontFamilyOf() }">
    <header class="flex items-start justify-between gap-8 mb-5">
      <div v-if="enabled('company')" class="flex items-center gap-4">
        <div class="h-16 w-16 rounded-full border flex items-center justify-center" :style="{ backgroundColor: `${accent}10`, borderColor: `${accent}30` }">
          <img v-if="doc.company.logo" :src="doc.company.logo" class="h-12 w-12 object-contain" alt="Logo de la empresa" />
          <span v-else class="text-2xl font-bold" :style="{ color: accent }">{{ doc.company.name?.charAt(0) || 'D' }}</span>
        </div>
        <div>
          <h1 class="text-sm font-extrabold uppercase">{{ doc.company.name }}</h1>
          <p v-if="sc.showRfc && doc.company.rfc">RFC: {{ doc.company.rfc }}</p>
          <p v-if="doc.company.address">{{ doc.company.address }}</p>
          <p>{{ sc.showPhone ? doc.company.phone : '' }}<span v-if="sc.showPhone && doc.company.phone && sc.showEmail && doc.company.email"> &nbsp;|&nbsp; </span>{{ sc.showEmail ? doc.company.email : '' }}</p>
          <p v-if="doc.company.website">{{ doc.company.website }}</p>
        </div>
      </div>

      <div class="min-w-40 text-right">
        <h2 class="text-base font-extrabold uppercase" :style="{ color: accent }">{{ typeTitle(doc.type) }}</h2>
        <p v-if="sc.showDocumentNumber" class="mt-1 rounded-md px-5 py-1.5 text-center font-bold text-white" :style="{ backgroundColor: accent }">{{ doc.number }}</p>
        <p v-if="sc.showDate" class="mt-2">Fecha: {{ formatDate(doc.date) }}</p>
        <p v-if="doc.expiryDate">Válida hasta: {{ formatDate(doc.expiryDate) }}</p>
        <p>Moneda: {{ sc.currencySymbol === '$' ? 'MXN' : sc.currencySymbol }}</p>
      </div>
    </header>

    <section class="grid grid-cols-2 gap-3 mb-4">
      <div v-if="enabled('client')" class="rounded-xl border border-slate-200 p-3 shadow-sm">
        <h3 class="mb-2 flex items-center gap-2 text-xs font-bold" :style="{ color: accent }"><span class="text-sm">♙</span> Cliente</h3>
        <p class="font-bold">{{ doc.client.name }}</p>
        <p v-if="sc.showRfc">RFC: {{ doc.client.rfc }}</p>
        <p v-if="doc.client.address">{{ doc.client.address }}</p>
        <p v-if="sc.showPhone && doc.client.phone">{{ doc.client.phone }}</p>
        <p v-if="sc.showEmail && doc.client.email">{{ doc.client.email }}</p>
      </div>
      <div v-if="enabled('payment-terms') && doc.paymentTerms" class="rounded-xl border border-slate-200 p-3 shadow-sm">
        <h3 class="mb-2 flex items-center gap-2 text-xs font-bold" :style="{ color: accent }"><span class="text-sm">▣</span> Condiciones</h3>
        <p class="whitespace-pre-line">{{ doc.paymentTerms }}</p>
        <p v-if="doc.expiryDate" class="mt-2"><strong>Validez:</strong> {{ formatDate(doc.expiryDate) }}</p>
      </div>
    </section>

    <section v-if="enabled('items')" class="overflow-hidden rounded-xl border border-slate-200 mb-4">
      <table class="w-full table-fixed border-collapse text-[8px]">
        <thead class="text-white" :style="{ backgroundColor: accent }">
          <tr>
            <th class="px-3 py-2 text-left">Producto / Servicio</th>
            <th class="w-14 px-2 py-2">Cantidad</th>
            <th class="w-24 px-2 py-2 text-right">Precio unitario</th>
            <th class="w-14 px-2 py-2">% IVA</th>
            <th class="w-24 px-3 py-2 text-right">Importe</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in doc.items" :key="item.id" class="border-b border-slate-200 last:border-0">
            <td class="px-3 py-2">
              <div class="flex items-center gap-2">
                <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full" :style="{ backgroundColor: `${accent}12`, color: accent }">▣</span>
                <span><strong class="block">{{ item.description || '—' }}</strong><small class="text-slate-500">Código: {{ item.code || '—' }}</small></span>
              </div>
            </td>
            <td class="px-2 py-2 text-center tabular-nums">{{ item.quantity }}</td>
            <td class="px-2 py-2 text-right tabular-nums">{{ formatCurrency(item.unitPrice, sc.currencySymbol) }}</td>
            <td class="px-2 py-2 text-center tabular-nums">{{ item.taxRate }}%</td>
            <td class="px-3 py-2 text-right font-semibold tabular-nums">{{ formatCurrency(item.quantity * item.unitPrice, sc.currencySymbol) }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section v-if="enabled('totals')" class="ml-auto w-56 overflow-hidden rounded-xl border border-slate-200 shadow-sm mb-4">
      <div class="flex justify-between px-4 py-1.5"><strong>Subtotal</strong><span class="tabular-nums font-semibold">{{ formatCurrency(subtotal, sc.currencySymbol) }}</span></div>
      <div v-for="row in taxRows" :key="row.rate" class="flex justify-between px-4 py-1.5"><strong>IVA ({{ row.rate }}%)</strong><span class="tabular-nums font-semibold">{{ formatCurrency(row.amount, sc.currencySymbol) }}</span></div>
      <div class="flex justify-between px-4 py-2 text-sm font-bold text-white" :style="{ backgroundColor: accent }"><span>Total</span><span class="tabular-nums">{{ formatCurrency(total, sc.currencySymbol) }}</span></div>
    </section>

    <section class="grid grid-cols-2 gap-6 mb-8">
      <div v-if="enabled('notes') && doc.notes"><h3 class="mb-1 font-bold" :style="{ color: accent }">Notas</h3><p class="whitespace-pre-line">{{ doc.notes }}</p></div>
      <div v-if="enabled('bank-info') && doc.bankInfo"><h3 class="mb-1 font-bold" :style="{ color: accent }">Datos bancarios</h3><p class="whitespace-pre-line">{{ doc.bankInfo }}</p></div>
    </section>

    <section v-if="doc.customFields.some(field => field.value) && enabled('custom-fields')" class="mb-6 grid grid-cols-2 gap-2 text-slate-600">
      <p v-for="field in doc.customFields.filter(field => field.value)" :key="field.label"><strong :style="{ color: accent }">{{ field.label }}:</strong> {{ field.value }}</p>
    </section>

    <footer v-if="enabled('signature-client') || enabled('signature-company')" class="mt-8 flex justify-between gap-12">
      <div v-if="enabled('signature-client')" class="w-48 rounded-xl border p-5 text-center" :style="{ borderColor: `${accent}40`, color: accent }">{{ doc.signatureClientLabel }}</div>
      <div v-if="enabled('signature-company')" class="w-48 rounded-xl border p-5 text-center" :style="{ borderColor: `${accent}40`, color: accent }">{{ doc.signatureCompanyLabel }}<p class="mt-1 text-slate-700">{{ doc.company.name }}</p></div>
    </footer>
  </article>
</template>
