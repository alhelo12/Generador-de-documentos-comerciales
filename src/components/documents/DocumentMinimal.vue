<script setup lang="ts">
import type { DocumentData, SectionConfig } from '@/types/document'
import { useDocumentTemplate } from '@/composables/useDocumentTemplate'

const props = defineProps<{ doc: DocumentData; sections: SectionConfig[] }>()
const { sc, accent, typeTitle, subtotal, enabled, fontFamilyOf, formatCurrency, formatDate } = useDocumentTemplate(props.doc, props.sections)
</script>

<template>
  <article class="document-page min-h-[780px] text-[9px] leading-loose text-slate-900" :style="{ fontFamily: fontFamilyOf() }">
    <header class="flex items-start justify-between gap-10 mb-9">
      <div v-if="enabled('company')" class="max-w-[55%]">
        <img v-if="doc.company.logo" :src="doc.company.logo" class="mb-3 h-12 w-12 object-contain" alt="Logo de la empresa" />
        <div v-else class="mb-3 text-4xl font-light leading-none" :style="{ color: accent }">{{ doc.company.name?.charAt(0) || 'D' }}</div>
        <h1 class="text-[11px] font-semibold uppercase tracking-wide">{{ doc.company.name }}</h1>
        <p v-if="sc.showRfc && doc.company.rfc">RFC: {{ doc.company.rfc }}</p>
        <p v-if="doc.company.address">{{ doc.company.address }}</p>
        <p>{{ sc.showPhone ? doc.company.phone : '' }}<span v-if="sc.showPhone && doc.company.phone && sc.showEmail && doc.company.email"> &nbsp;|&nbsp; </span>{{ sc.showEmail ? doc.company.email : '' }}</p>
      </div>

      <div class="min-w-44 pt-2 text-right">
        <h2 class="text-sm font-medium uppercase tracking-wide" :style="{ color: accent }">{{ typeTitle(doc.type) }}</h2>
        <p v-if="sc.showDocumentNumber" class="mt-2 rounded-md border px-4 py-1 text-center text-xs font-medium" :style="{ borderColor: accent, color: accent }">{{ doc.number }}</p>
        <p v-if="sc.showDate" class="mt-3">Fecha: {{ formatDate(doc.date) }}</p>
        <p v-if="doc.expiryDate">Válida hasta: {{ formatDate(doc.expiryDate) }}</p>
      </div>
    </header>

    <section v-if="enabled('client')" class="mb-10">
      <h3 class="mb-3 text-[10px] font-semibold" :style="{ color: accent }">Cliente</h3>
      <p class="mb-1 font-semibold">{{ doc.client.name }}</p>
      <p v-if="sc.showRfc && doc.client.rfc">RFC: {{ doc.client.rfc }}</p>
      <p v-if="doc.client.address">{{ doc.client.address }}</p>
      <p v-if="sc.showPhone && doc.client.phone">{{ doc.client.phone }}</p>
      <p v-if="sc.showEmail && doc.client.email">{{ doc.client.email }}</p>
    </section>

    <table v-if="enabled('items')" class="w-full table-fixed border-collapse mb-10">
      <thead>
        <tr class="border-b border-slate-300 text-[9px]" :style="{ color: accent }">
          <th class="px-1 py-2 text-left font-semibold">Descripción</th>
          <th class="w-20 px-1 py-2 text-center font-semibold">Cantidad</th>
          <th class="w-28 px-1 py-2 text-right font-semibold">Importe</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in doc.items" :key="item.id" class="border-b border-slate-200">
          <td class="px-1 py-3">{{ item.description || '—' }}<small v-if="item.code" class="ml-2 text-slate-400">{{ item.code }}</small></td>
          <td class="px-1 py-3 text-center tabular-nums">{{ item.quantity }}</td>
          <td class="px-1 py-3 text-right tabular-nums">{{ formatCurrency(item.quantity * item.unitPrice, sc.currencySymbol) }}</td>
        </tr>
      </tbody>
    </table>

    <section class="grid grid-cols-2 items-start gap-16 mb-14">
      <div>
        <div v-if="enabled('notes') && doc.notes" class="mb-5"><h3 class="mb-2 font-semibold" :style="{ color: accent }">Notas</h3><p class="whitespace-pre-line text-slate-600">{{ doc.notes }}</p></div>
        <div v-if="enabled('payment-terms') && doc.paymentTerms"><h3 class="mb-2 font-semibold" :style="{ color: accent }">Condiciones</h3><p class="whitespace-pre-line text-slate-600">{{ doc.paymentTerms }}</p></div>
        <div v-if="enabled('bank-info') && doc.bankInfo" class="mt-5"><h3 class="mb-2 font-semibold" :style="{ color: accent }">Datos bancarios</h3><p class="whitespace-pre-line text-slate-600">{{ doc.bankInfo }}</p></div>
      </div>
      <div v-if="enabled('totals')" class="border-t pt-3 text-center" :style="{ borderColor: accent }">
        <p class="font-medium" :style="{ color: accent }">Total de mercancía</p>
        <p class="mt-1 text-base font-semibold tabular-nums" :style="{ color: accent }">{{ formatCurrency(subtotal, sc.currencySymbol) }}</p>
      </div>
    </section>

    <section v-if="doc.customFields.some(field => field.value) && enabled('custom-fields')" class="mb-10 grid grid-cols-2 gap-2 text-slate-500">
      <p v-for="field in doc.customFields.filter(field => field.value)" :key="field.label"><strong :style="{ color: accent }">{{ field.label }}:</strong> {{ field.value }}</p>
    </section>

    <footer v-if="enabled('signature-client') || enabled('signature-company')" class="mt-auto flex justify-between gap-14 px-2">
      <div v-if="enabled('signature-client')" class="w-40 border-t border-slate-600 pt-2 text-center">{{ doc.signatureClientLabel }}</div>
      <div v-if="enabled('signature-company')" class="w-40 border-t border-slate-600 pt-2 text-center">{{ doc.signatureCompanyLabel }}<p class="mt-1">{{ doc.company.name }}</p></div>
    </footer>
  </article>
</template>
