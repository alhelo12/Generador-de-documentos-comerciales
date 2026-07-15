<script setup lang="ts">
import { computed } from 'vue'
import type { DocumentData, SectionConfig } from '@/types/document'
import { useDocumentTemplate } from '@/composables/useDocumentTemplate'

const props = defineProps<{ doc: DocumentData; sections: SectionConfig[] }>()
const { sc, typeTitle: t, subtotal, tax, total, enabled, fontFamilyOf, formatCurrency } = useDocumentTemplate(props.doc, props.sections)
const logoAlign = computed(() => sc.logoPosition === 'center' ? 'justify-center' : sc.logoPosition === 'right' ? 'justify-end' : 'justify-start')
</script>

<template>
  <div class="document-page" :style="{ fontFamily: fontFamilyOf() }">
    <!-- Header -->
    <div v-if="enabled('company')" :class="['flex items-start mb-6', logoAlign]">
      <div :class="['flex', sc.logoPosition === 'center' ? 'flex-col items-center text-center' : 'items-center gap-3']">
        <img v-if="doc.company.logo" :src="doc.company.logo" class="h-12 w-auto" alt="Logo" />
        <div v-else class="w-10 h-10 rounded flex items-center justify-center text-white font-bold text-lg" :style="{ backgroundColor: sc.accentColor }">F</div>
        <div>
          <p class="text-lg font-bold tracking-tight">{{ doc.company.name }}</p>
          <p v-if="doc.company.address" class="text-xs" :style="{ color: sc.accentColor }">{{ doc.company.address }}</p>
          <p v-if="(sc.showPhone && doc.company.phone) || (sc.showEmail && doc.company.email)" class="text-xs text-neutral-500">
            {{ sc.showPhone && doc.company.phone ? doc.company.phone : '' }}{{ sc.showPhone && doc.company.phone && sc.showEmail && doc.company.email ? ' · ' : '' }}{{ sc.showEmail && doc.company.email ? doc.company.email : '' }}
          </p>
          <p v-if="sc.showRfc" class="text-xs text-neutral-400">{{ doc.company.rfc }}</p>
        </div>
      </div>
    </div>

    <hr class="mb-6" :style="{ borderColor: sc.accentColor + '40' }" />

    <!-- Title -->
    <div class="text-center mb-6">
      <h2 class="text-lg font-bold tracking-wide" :style="{ color: sc.accentColor }">{{ t(doc.type) }}</h2>
      <p v-if="sc.showDocumentNumber" class="text-xs text-neutral-500">No. {{ doc.number }}</p>
      <p v-if="sc.showDate" class="text-xs text-neutral-500">Fecha: {{ doc.date }}</p>
      <p v-if="doc.expiryDate" class="text-xs text-neutral-500">Vigencia: {{ doc.expiryDate }}</p>
    </div>

    <!-- Client -->
    <div v-if="enabled('client')" class="mb-6">
      <p class="text-xs font-bold uppercase tracking-wider mb-1" :style="{ color: sc.accentColor }">Cliente</p>
      <p class="text-sm font-semibold">{{ doc.client.name }}</p>
      <p v-if="sc.showRfc" class="text-xs text-neutral-600">RFC: {{ doc.client.rfc }}</p>
      <p v-if="doc.client.address" class="text-xs text-neutral-600">{{ doc.client.address }}</p>
      <p v-if="(sc.showPhone && doc.client.phone) || (sc.showEmail && doc.client.email)" class="text-xs text-neutral-600">
        {{ sc.showPhone && doc.client.phone ? doc.client.phone : '' }}{{ sc.showPhone && doc.client.phone && sc.showEmail && doc.client.email ? ' · ' : '' }}{{ sc.showEmail && doc.client.email ? doc.client.email : '' }}
      </p>
    </div>

    <!-- Items table -->
    <table v-if="enabled('items')" class="w-full text-xs mb-6">
      <thead>
        <tr class="border-b-2" :style="{ borderColor: sc.accentColor }">
          <th class="py-2 text-left font-bold uppercase tracking-wider">Cant</th>
          <th class="py-2 text-left font-bold uppercase tracking-wider">Descripción</th>
          <th class="py-2 text-right font-bold uppercase tracking-wider">P.U.</th>
          <th class="py-2 text-right font-bold uppercase tracking-wider">Importe</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in doc.items" :key="item.id" class="border-b border-neutral-200">
          <td class="py-2">{{ item.quantity }}</td>
          <td class="py-2">
            <span class="text-neutral-400" v-if="item.code">{{ item.code }} · </span>{{ item.description || '—' }}
          </td>
          <td class="py-2 text-right tabular-nums">{{ formatCurrency(item.unitPrice, sc.currencySymbol) }}</td>
          <td class="py-2 text-right tabular-nums font-semibold">{{ formatCurrency(item.quantity * item.unitPrice, sc.currencySymbol) }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Totals -->
    <div v-if="enabled('totals')" class="ml-auto w-64 mb-8">
      <div class="flex justify-between text-xs py-1">
        <span>Subtotal</span>
        <span class="tabular-nums">{{ formatCurrency(subtotal, sc.currencySymbol) }}</span>
      </div>
      <div class="flex justify-between text-xs py-1">
        <span>{{ sc.taxLabel }}</span>
        <span class="tabular-nums">{{ formatCurrency(tax, sc.currencySymbol) }}</span>
      </div>
      <div class="flex justify-between text-sm font-bold border-t-2 pt-1 mt-1" :style="{ borderColor: sc.accentColor }">
        <span>TOTAL</span>
        <span class="tabular-nums">{{ formatCurrency(total, sc.currencySymbol) }}</span>
      </div>
    </div>

    <!-- Footer sections -->
    <div v-if="doc.paymentTerms && enabled('payment-terms')" class="text-xs text-neutral-600 mb-2">
      <span class="font-semibold">Condiciones de pago:</span> {{ doc.paymentTerms }}
    </div>
    <div v-if="doc.bankInfo && enabled('bank-info')" class="text-xs text-neutral-600 mb-2">
      <span class="font-semibold">Datos bancarios:</span> {{ doc.bankInfo }}
    </div>
    <div v-if="doc.customFields.length && enabled('custom-fields')" class="text-xs text-neutral-600 mb-2 space-y-0.5">
      <div v-for="f in doc.customFields.filter(f => f.value)" :key="f.label">
        <span class="font-semibold">{{ f.label }}:</span> {{ f.value }}
      </div>
    </div>
    <div v-if="doc.notes && enabled('notes')" class="text-xs text-neutral-500 italic mt-4 pt-3" :style="{ borderTop: `1px solid ${sc.accentColor}30` }">
      {{ doc.notes }}
    </div>

    <!-- Signature -->
    <div v-if="enabled('signature-client') || enabled('signature-company')" class="mt-12 pt-4 text-xs text-neutral-500" :style="{ borderTop: `1px solid ${sc.accentColor}30` }">
      <div class="flex justify-between">
        <div v-if="enabled('signature-client')" class="text-center">
          <div class="w-40 pt-1 mt-12" :style="{ borderTop: `1px solid ${sc.accentColor}60` }"></div>
          <p class="mt-1">{{ doc.signatureClientLabel }}</p>
        </div>
        <div v-if="enabled('signature-company')" class="text-center">
          <div class="w-40 pt-1 mt-12" :style="{ borderTop: `1px solid ${sc.accentColor}60` }"></div>
          <p class="mt-1">{{ doc.signatureCompanyLabel }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
