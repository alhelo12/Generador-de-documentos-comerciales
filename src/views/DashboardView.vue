<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDocumentsStore } from '@/stores/documents'
import AppCard from '@/components/ui/AppCard.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { useDocumentCalculations } from '@/composables/useDocumentCalculations'

const router = useRouter()
const docs = useDocumentsStore()
const { formatCurrency } = useDocumentCalculations()

const statusLabels: Record<string, string> = { 'draft': 'Borrador', 'sent': 'Enviado', 'paid': 'Pagado', 'cancelled': 'Cancelado' }
const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = { 'draft': 'default', 'sent': 'warning', 'paid': 'success', 'cancelled': 'danger' }
const typeLabels: Record<string, string> = { 'invoice': 'Factura', 'delivery-note': 'Remisión', 'quote': 'Cotización' }

function totalOf(d: any) {
  const sub = d.items.reduce((s: number, i: any) => s + i.quantity * i.unitPrice, 0)
  return sub + (sub * (d.items[0]?.taxRate ?? 16) / 100)
}

function openDoc(id: string) {
  router.push(`/editor/${id}`)
}

function newDoc() {
  router.push('/editor')
}

onMounted(() => docs.loadAll())
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 lg:px-6 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Documentos</h1>
        <p class="text-sm text-neutral-500 mt-1">{{ docs.stats.total }} documentos creados</p>
      </div>
      <AppButton @click="newDoc" size="lg">
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
        </template>
        Nuevo documento
      </AppButton>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4 mb-8">
      <AppCard>
        <p class="text-xs text-neutral-500 font-medium uppercase tracking-wider">Facturas</p>
        <p class="text-2xl font-bold mt-1">{{ docs.stats.invoices }}</p>
        <p class="text-xs text-neutral-400 mt-1">{{ formatCurrency(docs.stats.invoiceTotal) }}</p>
      </AppCard>
      <AppCard>
        <p class="text-xs text-neutral-500 font-medium uppercase tracking-wider">Cotizaciones</p>
        <p class="text-2xl font-bold mt-1">{{ docs.stats.quotes }}</p>
        <p class="text-xs text-neutral-400 mt-1">{{ formatCurrency(docs.stats.quoteTotal) }}</p>
      </AppCard>
      <AppCard>
        <p class="text-xs text-neutral-500 font-medium uppercase tracking-wider">Remisiones</p>
        <p class="text-2xl font-bold mt-1">{{ docs.stats.deliveries }}</p>
      </AppCard>
    </div>

    <!-- Recent -->
    <div v-if="docs.recentDocs.length">
      <h2 class="text-sm font-semibold text-neutral-600 mb-3">Recientes</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AppCard
          v-for="d in docs.recentDocs"
          :key="d.id"
          hover
          padding="md"
          @click="openDoc(d.id)"
        >
          <div class="flex items-start justify-between mb-2">
            <div>
              <p class="text-sm font-semibold">{{ typeLabels[d.type] }}</p>
              <p class="text-xs text-neutral-400">{{ d.number }}</p>
            </div>
            <AppBadge :variant="statusVariants[d.status]">{{ statusLabels[d.status] }}</AppBadge>
          </div>
          <p class="text-xs text-neutral-500 truncate">{{ d.client.name || 'Sin cliente' }}</p>
          <div class="flex items-center justify-between mt-2">
            <span class="text-xs text-neutral-400">{{ d.date }}</span>
            <span class="text-sm font-bold tabular-nums">{{ formatCurrency(totalOf(d)) }}</span>
          </div>
        </AppCard>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-20">
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" class="text-neutral-300"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
      </div>
      <h2 class="text-lg font-semibold mb-1">No hay documentos aún</h2>
      <p class="text-sm text-neutral-500 mb-1">Crea tu primera factura, cotización o nota de remisión.</p>
      <p class="text-xs text-neutral-400 mb-6 max-w-md mx-auto">Antes de empezar, configura los datos de tu empresa en <strong>Ajustes → Empresa</strong>. Luego completa el documento en el editor, elige una plantilla y exporta a PDF. Los documentos se guardan en tu historial.</p>
      <AppButton @click="newDoc">Crear documento</AppButton>
    </div>
  </div>
</template>
