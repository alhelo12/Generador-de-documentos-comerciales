<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDocumentsStore } from '@/stores/documents'
import { useSettingsStore } from '@/stores/settings'
import { useEditorStore } from '@/stores/editor'
import { useDocumentCalculations } from '@/composables/useDocumentCalculations'
import type { DocumentType } from '@/types/document'

const router = useRouter()
const docs = useDocumentsStore()
const settings = useSettingsStore()
const editor = useEditorStore()
const { formatCurrency, docTotal } = useDocumentCalculations()
const loading = ref(true)

const statusLabels: Record<string, string> = { 'draft': 'Borrador', 'sent': 'Enviado', 'paid': 'Pagado', 'cancelled': 'Cancelado' }
const statusVariants: Record<string, 'success' | 'warning' | 'danger' | 'default'> = { 'draft': 'default', 'sent': 'warning', 'paid': 'success', 'cancelled': 'danger' }
const typeLabels: Record<string, string> = { 'invoice': 'Factura', 'delivery-note': 'Remisión', 'quote': 'Cotización' }

function totalOf(d: any) { return docTotal(d.items) }
function openDoc(id: string) { router.push(`/editor/${id}`) }

const recentDocs = ref<any[]>([])

onMounted(async () => {
  await docs.loadAll()
  recentDocs.value = docs.docs.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6)
  loading.value = false
})

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return '¡Buenos días!'
  if (h < 18) return '¡Buenas tardes!'
  return '¡Buenas noches!'
}

function quickCreate(type: string) {
  editor.newDoc(type as DocumentType)
  router.push('/editor')
}
</script>

<template>
  <div class="h-full overflow-y-auto">
    <div class="max-w-[1200px] mx-auto px-4 py-5 sm:px-6 sm:py-6">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-xl font-bold" style="color: #0f172a;">{{ getGreeting() }} 👋</h1>
          <p class="text-sm mt-0.5" style="color: #94a3b8;">Aquí tienes un resumen de tu actividad.</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" class="absolute left-3 top-1/2 -translate-y-1/2" style="color: #94a3b8;"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input aria-label="Buscar documentos" placeholder="Buscar documentos…" class="pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-surface text-text placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent/20 w-full sm:w-64" />
          </div>
          <button aria-label="Notificaciones" class="neu-control w-9 h-9 flex items-center justify-center rounded-xl text-text-secondary relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </button>
          <div class="neu-control w-9 h-9 rounded-xl flex items-center justify-center text-accent text-xs font-bold">JD</div>
        </div>
      </div>

      <!-- Stat cards -->
      <div class="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 xl:grid-cols-4">
        <template v-if="loading">
          <div v-for="i in 4" :key="i" class="neu-raised rounded-2xl p-4">
            <div class="h-3 w-20 bg-bg rounded animate-pulse" />
            <div class="h-6 w-12 bg-bg rounded animate-pulse mt-2" />
          </div>
        </template>
        <template v-else>
          <div v-for="stat in [
            { label: 'Facturas', count: docs.stats.invoices, total: docs.stats.invoiceTotal, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'accent', bg: 'bg-accent-light' },
            { label: 'Cotizaciones', count: docs.stats.quotes, total: docs.stats.quoteTotal, icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z', color: 'success', bg: 'bg-success-light' },
            { label: 'Remisiones', count: docs.stats.deliveries, total: 0, icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', color: 'orange', bg: 'bg-orange-light' },
            { label: 'Total facturado', count: formatCurrency(docs.stats.invoiceTotal + docs.stats.quoteTotal + 0), total: 'Este mes', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'purple', bg: 'bg-purple-light' },
          ]" :key="stat.label" class="neu-raised rounded-2xl p-4">
            <div class="flex items-center gap-2 mb-3">
              <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', stat.bg]">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" :class="stat.color === 'accent' ? 'text-accent' : stat.color === 'success' ? 'text-success' : stat.color === 'orange' ? 'text-orange' : 'text-purple'"><path stroke-linecap="round" stroke-linejoin="round" :d="stat.icon" /></svg>
              </div>
              <span class="text-xs font-medium" style="color: #94a3b8;">{{ stat.label }}</span>
            </div>
            <p class="text-2xl font-bold" style="color: #0f172a;">{{ stat.count }}</p>
            <p v-if="stat.total" class="text-xs mt-1" style="color: #94a3b8;">{{ stat.total }}</p>
          </div>
        </template>
      </div>

      <!-- Content grid: Recent + Quick access + Summary -->
      <div class="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_280px]">
        <!-- Recent documents -->
        <div class="neu-raised min-w-0 rounded-2xl overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 class="text-sm font-semibold" style="color: #0f172a;">Documentos recientes</h2>
            <router-link to="/history" class="text-xs font-medium text-accent hover:text-accent-hover transition-colors">Ver todos</router-link>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border-light" style="color: #94a3b8;">
                  <th class="text-left py-3 px-5 text-[11px] font-semibold uppercase tracking-wider">Tipo</th>
                  <th class="text-left py-3 px-5 text-[11px] font-semibold uppercase tracking-wider">Número</th>
                  <th class="text-left py-3 px-5 text-[11px] font-semibold uppercase tracking-wider">Cliente</th>
                  <th class="text-left py-3 px-5 text-[11px] font-semibold uppercase tracking-wider">Fecha</th>
                  <th class="text-right py-3 px-5 text-[11px] font-semibold uppercase tracking-wider">Total</th>
                  <th class="text-center py-3 px-5 text-[11px] font-semibold uppercase tracking-wider">Estado</th>
                  <th class="text-center py-3 px-5 text-[11px] font-semibold uppercase tracking-wider w-24">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="d in recentDocs" :key="d.id" class="border-b border-border-light last:border-0 hover:bg-surface-hover cursor-pointer transition-colors" @click="openDoc(d.id)">
                  <td class="py-3 px-5 font-medium" style="color: #0f172a;">
                    <div class="flex items-center gap-2">
                      <div :class="['w-2 h-2 rounded-full', d.type === 'invoice' ? 'bg-accent' : d.type === 'quote' ? 'bg-success' : 'bg-orange']" />
                      {{ typeLabels[d.type] }}
                    </div>
                  </td>
                  <td class="py-3 px-5 font-mono text-xs tabular-nums" style="color: #475569;">{{ d.number }}</td>
                  <td class="py-3 px-5" style="color: #475569;">{{ d.client.name || '—' }}</td>
                  <td class="py-3 px-5" style="color: #94a3b8;">{{ d.date }}</td>
                  <td class="py-3 px-5 text-right font-semibold tabular-nums" style="color: #0f172a;">{{ formatCurrency(totalOf(d)) }}</td>
                  <td class="py-3 px-5 text-center">
                    <span :class="[
                      'inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md',
                      statusVariants[d.status] === 'success' ? 'bg-success-light text-green-700' : '',
                      statusVariants[d.status] === 'warning' ? 'bg-warning-light text-amber-700' : '',
                      statusVariants[d.status] === 'danger' ? 'bg-danger-light text-red-700' : '',
                      statusVariants[d.status] === 'default' ? 'bg-surface-hover text-text-secondary' : '',
                    ]">{{ statusLabels[d.status] }}</span>
                  </td>
                  <td class="py-3 px-5">
                    <div class="flex gap-1 justify-center">
                      <button @click.stop="openDoc(d.id)" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-hover transition-colors" style="color: #94a3b8;" title="Ver">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                      <button @click.stop="openDoc(d.id)" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-hover transition-colors" style="color: #94a3b8;" title="Editar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button @click.stop class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-hover transition-colors" style="color: #94a3b8;" title="Eliminar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right column -->
        <div class="space-y-4">
          <!-- Quick access -->
          <div class="neu-raised rounded-2xl p-4">
            <h2 class="text-sm font-semibold mb-3" style="color: #0f172a;">Acceso rápido</h2>
            <div class="space-y-2">
              <button @click="quickCreate('invoice')" class="neu-control w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left group">
                <div class="w-9 h-9 rounded-lg bg-accent-light flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" class="text-accent"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold" style="color: #0f172a;">Nueva Factura</p>
                  <p class="text-[11px]" style="color: #94a3b8;">Crear una nueva factura</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="text-text-muted group-hover:text-accent transition-colors"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
              <button @click="quickCreate('quote')" class="neu-control w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left group">
                <div class="w-9 h-9 rounded-lg bg-success-light flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" class="text-success"><path stroke-linecap="round" stroke-linejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold" style="color: #0f172a;">Nueva Cotización</p>
                  <p class="text-[11px]" style="color: #94a3b8;">Crear una nueva cotización</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="text-text-muted group-hover:text-success transition-colors"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
              <button @click="quickCreate('delivery-note')" class="neu-control w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left group">
                <div class="w-9 h-9 rounded-lg bg-orange-light flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" class="text-orange"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold" style="color: #0f172a;">Nueva Remisión</p>
                  <p class="text-[11px]" style="color: #94a3b8;">Crear una nueva remisión</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="text-text-muted group-hover:text-orange transition-colors"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          <!-- Summary -->
          <div class="neu-raised rounded-2xl p-4">
            <h2 class="text-sm font-semibold mb-3" style="color: #0f172a;">Resumen general</h2>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs" style="color: #94a3b8;">Último documento generado</span>
                <span class="text-xs font-semibold" style="color: #0f172a;">{{ recentDocs[0]?.number || '—' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs" style="color: #94a3b8;">Empresa activa</span>
                <span class="text-xs font-semibold" style="color: #0f172a;">{{ settings.company.name || 'Mi Empresa' }}</span>
              </div>
              <div class="pt-2 border-t border-border">
                <span class="text-[11px] font-medium uppercase tracking-wider" style="color: #94a3b8;">Numeración actual</span>
                <div class="flex gap-2 mt-2">
                  <span v-for="(fmt, type) in settings.numberFormat" :key="type" class="px-2 py-1 text-[10px] font-mono font-semibold rounded border border-border bg-surface-hover" style="color: #0f172a;">{{ fmt.prefix }}-{{ '0'.repeat(fmt.padding) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
