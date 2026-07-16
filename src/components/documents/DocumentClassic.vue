<script setup lang="ts">
import type { DocumentData, SectionConfig } from '@/types/document'
import { useDocumentTemplate } from '@/composables/useDocumentTemplate'

const props = defineProps<{ doc: DocumentData; sections: SectionConfig[] }>()
const { sc, accent, typeTitle, subtotal, total, taxRows, enabled, fontFamilyOf, formatCurrency, formatDate } = useDocumentTemplate(props.doc, props.sections)
</script>

<template>
  <article class="document-page text-[9px] leading-relaxed text-slate-900" :style="{ fontFamily: fontFamilyOf() }">
    <header class="flex items-start justify-between gap-8 mb-5">
      <div v-if="enabled('company')" class="flex min-w-0 items-start gap-4">
        <img v-if="doc.company.logo" :src="doc.company.logo" class="h-14 w-14 shrink-0 object-contain" alt="Logo de la empresa" />
        <div v-else class="h-12 w-12 shrink-0 rounded-lg flex items-center justify-center text-xl font-bold text-white" :style="{ backgroundColor: accent }">
          {{ doc.company.name?.charAt(0) || 'D' }}
        </div>
        <div class="min-w-0">
          <h1 class="text-[13px] font-extrabold uppercase tracking-tight">{{ doc.company.name }}</h1>
          <p v-if="sc.showRfc && doc.company.rfc"><strong>RFC:</strong> {{ doc.company.rfc }}</p>
          <p v-if="doc.company.address">{{ doc.company.address }}</p>
          <p v-if="(sc.showPhone && doc.company.phone) || (sc.showEmail && doc.company.email)">
            {{ sc.showPhone ? doc.company.phone : '' }}<span v-if="sc.showPhone && doc.company.phone && sc.showEmail && doc.company.email"> &nbsp;|&nbsp; </span>{{ sc.showEmail ? doc.company.email : '' }}
          </p>
          <p v-if="doc.company.website">{{ doc.company.website }}</p>
        </div>
      </div>

      <div class="min-w-40 text-right">
        <h2 class="text-lg font-extrabold uppercase tracking-tight" :style="{ color: accent }">{{ typeTitle(doc.type) }}</h2>
        <p v-if="sc.showDocumentNumber" class="mt-1 rounded-md px-5 py-1.5 text-center text-xs font-bold text-white" :style="{ backgroundColor: accent }">{{ doc.number }}</p>
        <p v-if="sc.showDate" class="mt-2">Fecha: {{ formatDate(doc.date) }}</p>
        <p v-if="doc.expiryDate">Válida hasta: {{ formatDate(doc.expiryDate) }}</p>
        <p>Moneda: {{ sc.currencySymbol === '$' ? 'MXN' : sc.currencySymbol }}</p>
      </div>
    </header>

    <section v-if="enabled('client') || (enabled('payment-terms') && doc.paymentTerms)" class="grid grid-cols-2 border border-slate-300 mb-4">
      <div v-if="enabled('client')" class="p-3" :class="enabled('payment-terms') && doc.paymentTerms ? 'border-r border-slate-300' : 'col-span-2'">
        <h3 class="mb-2 font-extrabold uppercase" :style="{ color: accent }">Cliente</h3>
        <dl class="grid grid-cols-[72px_1fr] gap-y-1">
          <dt class="font-semibold">Nombre:</dt><dd class="font-medium">{{ doc.client.name }}</dd>
          <dt v-if="sc.showRfc">RFC:</dt><dd v-if="sc.showRfc">{{ doc.client.rfc }}</dd>
          <dt v-if="doc.client.address">Dirección:</dt><dd v-if="doc.client.address">{{ doc.client.address }}</dd>
          <dt v-if="sc.showPhone && doc.client.phone">Teléfono:</dt><dd v-if="sc.showPhone && doc.client.phone">{{ doc.client.phone }}</dd>
          <dt v-if="sc.showEmail && doc.client.email">Email:</dt><dd v-if="sc.showEmail && doc.client.email">{{ doc.client.email }}</dd>
        </dl>
      </div>
      <div v-if="enabled('payment-terms') && doc.paymentTerms" class="p-3">
        <h3 class="mb-2 font-extrabold uppercase" :style="{ color: accent }">Condiciones de pago</h3>
        <p class="whitespace-pre-line">{{ doc.paymentTerms }}</p>
        <p v-if="doc.expiryDate" class="mt-2"><strong>Vencimiento:</strong> {{ formatDate(doc.expiryDate) }}</p>
      </div>
    </section>

    <table v-if="enabled('items')" class="w-full table-fixed border-collapse mb-1 text-[8px]">
      <thead>
        <tr class="text-white" :style="{ backgroundColor: accent }">
          <th class="w-7 border border-white/20 px-1 py-2">#</th>
          <th class="w-16 border border-white/20 px-1 py-2">Código</th>
          <th class="border border-white/20 px-2 py-2 text-left">Descripción</th>
          <th class="w-12 border border-white/20 px-1 py-2">Cant.</th>
          <th class="w-20 border border-white/20 px-1 py-2">P. unitario</th>
          <th class="w-12 border border-white/20 px-1 py-2">% IVA</th>
          <th class="w-20 border border-white/20 px-1 py-2">Importe</th>
          <th class="w-16 border border-white/20 px-1 py-2">IVA</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in doc.items" :key="item.id">
          <td class="border border-slate-300 px-1 py-2 text-center">{{ index + 1 }}</td>
          <td class="border border-slate-300 px-1 py-2 text-center">{{ item.code || '—' }}</td>
          <td class="border border-slate-300 px-2 py-2">{{ item.description || '—' }}</td>
          <td class="border border-slate-300 px-1 py-2 text-center tabular-nums">{{ item.quantity }}</td>
          <td class="border border-slate-300 px-1 py-2 text-right tabular-nums">{{ formatCurrency(item.unitPrice, sc.currencySymbol) }}</td>
          <td class="border border-slate-300 px-1 py-2 text-center tabular-nums">{{ item.taxRate }}%</td>
          <td class="border border-slate-300 px-1 py-2 text-right tabular-nums">{{ formatCurrency(item.quantity * item.unitPrice, sc.currencySymbol) }}</td>
          <td class="border border-slate-300 px-1 py-2 text-right tabular-nums">{{ formatCurrency(item.quantity * item.unitPrice * item.taxRate / 100, sc.currencySymbol) }}</td>
        </tr>
      </tbody>
    </table>

    <section v-if="enabled('totals')" class="ml-auto w-52 border border-slate-300 border-t-0 mb-4">
      <div class="flex justify-between px-3 py-1.5"><strong>SUBTOTAL</strong><span class="tabular-nums">{{ formatCurrency(subtotal, sc.currencySymbol) }}</span></div>
      <div v-for="row in taxRows" :key="row.rate" class="flex justify-between px-3 py-1.5"><strong>IVA ({{ row.rate }}%)</strong><span class="tabular-nums">{{ formatCurrency(row.amount, sc.currencySymbol) }}</span></div>
      <div class="flex justify-between px-3 py-2 text-xs font-extrabold text-white" :style="{ backgroundColor: accent }"><span>TOTAL</span><span class="tabular-nums">{{ formatCurrency(total, sc.currencySymbol) }}</span></div>
    </section>

    <section v-if="(enabled('notes') && doc.notes) || (enabled('bank-info') && doc.bankInfo)" class="grid grid-cols-2 border border-slate-300 mb-8">
      <div v-if="enabled('notes') && doc.notes" class="min-h-20 p-3" :class="enabled('bank-info') && doc.bankInfo ? 'border-r border-slate-300' : 'col-span-2'">
        <h3 class="mb-2 font-extrabold uppercase" :style="{ color: accent }">Notas</h3>
        <p class="whitespace-pre-line">{{ doc.notes }}</p>
      </div>
      <div v-if="enabled('bank-info') && doc.bankInfo" class="min-h-20 p-3">
        <h3 class="mb-2 font-extrabold uppercase" :style="{ color: accent }">Datos bancarios</h3>
        <p class="whitespace-pre-line">{{ doc.bankInfo }}</p>
      </div>
    </section>

    <section v-if="doc.customFields.some(field => field.value) && enabled('custom-fields')" class="mb-6 grid grid-cols-2 gap-2 text-slate-600">
      <p v-for="field in doc.customFields.filter(field => field.value)" :key="field.label"><strong>{{ field.label }}:</strong> {{ field.value }}</p>
    </section>

    <footer v-if="enabled('signature-client') || enabled('signature-company')" class="mt-10 flex justify-between gap-12 px-5">
      <div v-if="enabled('signature-client')" class="w-44 border-t border-slate-600 pt-2 text-center font-semibold uppercase">{{ doc.signatureClientLabel }}</div>
      <div v-if="enabled('signature-company')" class="w-44 border-t border-slate-600 pt-2 text-center font-semibold uppercase">{{ doc.signatureCompanyLabel }}<p class="mt-1 normal-case font-normal">{{ doc.company.name }}</p></div>
    </footer>
  </article>
</template>
