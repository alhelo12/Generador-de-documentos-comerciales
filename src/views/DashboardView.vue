<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useDocumentsStore } from '@/stores/documents'
import { useSettingsStore } from '@/stores/settings'
import { useEditorStore } from '@/stores/editor'
import { useDocumentCalculations } from '@/composables/useDocumentCalculations'
import type { DocumentType } from '@/types/document'
import gsap from 'gsap'

const router = useRouter()
const docs = useDocumentsStore()
const settings = useSettingsStore()
const editor = useEditorStore()
const { formatCurrency, docTotal } = useDocumentCalculations()
const loading = ref(true)

const statusLabels: Record<string, string> = { 'draft': 'Borrador', 'sent': 'Enviado', 'paid': 'Pagado', 'cancelled': 'Cancelado' }
const statusVariants: Record<string, 'success' | 'warning' | 'danger' | 'default'> = { 'draft': 'default', 'sent': 'warning', 'paid': 'success', 'cancelled': 'danger' }
const typeLabels: Record<string, string> = { 'invoice': 'Factura', 'delivery-note': 'Remision', 'quote': 'Cotizacion' }

function totalOf(d: any) { return docTotal(d.items) }
function openDoc(id: string) { router.push(`/editor/${id}`) }

const recentDocs = ref<any[]>([])

onMounted(async () => {
  await docs.loadAll()
  recentDocs.value = docs.docs.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6)
  loading.value = false
  await nextTick()
  animateIn()
})

function animateIn() {
  gsap.fromTo('.dash-greeting', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
  gsap.fromTo('.stat-card', { opacity: 0, y: 24, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out', delay: 0.15 })
  gsap.fromTo('.content-reveal', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out', delay: 0.4 })
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos dias'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

function quickCreate(type: string) {
  editor.newDoc(type as DocumentType)
  router.push('/editor')
}
</script>

<template>
  <div class="h-full overflow-y-auto">
    <div class="max-w-[1400px] mx-auto px-5 py-6 sm:px-8 sm:py-8">
      <!-- Cinematic Header -->
      <div class="dash-greeting mb-10">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Panel de control</p>
            <h1 class="text-3xl md:text-5xl font-extrabold tracking-tight text-text leading-[1.1]" style="max-width: 700px;">
              {{ getGreeting() }}
            </h1>
            <p class="text-sm mt-2 text-text-secondary max-w-md">Resumen de tu actividad documental en tiempo real.</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input aria-label="Buscar documentos" placeholder="Buscar documentos..." class="pl-9 pr-4 py-2.5 text-sm rounded-xl glass-control text-text placeholder:text-text-muted w-full sm:w-64" />
            </div>
            <div class="glass-control w-10 h-10 flex items-center justify-center rounded-xl text-text-secondary relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </div>
            <div class="glass-control w-10 h-10 rounded-xl flex items-center justify-center text-accent text-xs font-bold">JD</div>
          </div>
        </div>
      </div>

      <!-- Bento Stat Grid -->
      <div class="grid grid-cols-2 gap-4 mb-10 lg:grid-cols-4" style="grid-auto-flow: dense;">
        <template v-if="loading">
          <div v-for="i in 4" :key="i" class="glass-raised rounded-2xl p-5">
            <div class="skeleton h-3 w-20 mb-3" />
            <div class="skeleton h-8 w-16" />
          </div>
        </template>
        <template v-else>
          <div v-for="(stat, idx) in [
            { label: 'Facturas', count: docs.stats.invoices, total: docs.stats.invoiceTotal, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', accent: 'text-accent', glow: 'shadow-[0_0_20px_rgba(108,140,255,0.15)]' },
            { label: 'Cotizaciones', count: docs.stats.quotes, total: docs.stats.quoteTotal, icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z', accent: 'text-success', glow: 'shadow-[0_0_20px_rgba(52,211,153,0.15)]' },
            { label: 'Remisiones', count: docs.stats.deliveries, total: 0, icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', accent: 'text-orange', glow: 'shadow-[0_0_20px_rgba(251,146,60,0.15)]' },
            { label: 'Total facturado', count: formatCurrency(docs.stats.invoiceTotal + docs.stats.quoteTotal + 0), total: 'Este mes', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', accent: 'text-purple', glow: 'shadow-[0_0_20px_rgba(167,139,250,0.15)]' },
          ]" :key="stat.label" :class="['stat-card glass-raised rounded-2xl p-5 hover-lift cursor-default', stat.glow]">
            <div class="flex items-center gap-2.5 mb-4">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center bg-black/[0.04]">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" :class="stat.accent"><path stroke-linecap="round" stroke-linejoin="round" :d="stat.icon" /></svg>
              </div>
              <span class="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{{ stat.label }}</span>
            </div>
            <p class="text-3xl font-extrabold text-text tracking-tight">{{ stat.count }}</p>
            <p v-if="stat.total" class="text-xs mt-1.5 text-text-muted font-medium">{{ typeof stat.total === 'number' ? formatCurrency(stat.total) : stat.total }}</p>
          </div>
        </template>
      </div>

      <!-- Content Grid: Recent + Quick Access -->
      <div class="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_300px]">
        <!-- Recent Documents -->
        <div class="content-reveal glass-raised min-w-0 rounded-2xl overflow-hidden">
          <div class="flex items-center justify-between px-6 py-5 border-b border-black/[0.04]">
            <div>
              <h2 class="text-sm font-bold text-text">Documentos recientes</h2>
              <p class="text-[11px] text-text-muted mt-0.5">Ultimos documentos generados</p>
            </div>
            <router-link to="/history" class="text-xs font-semibold text-accent hover:text-accent-hover transition-colors px-3 py-1.5 rounded-lg hover:bg-accent/10">Ver todos</router-link>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-black/[0.04]">
                  <th class="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Tipo</th>
                  <th class="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Numero</th>
                  <th class="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Cliente</th>
                  <th class="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Fecha</th>
                  <th class="text-right py-3 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Total</th>
                  <th class="text-center py-3 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Estado</th>
                  <th class="text-center py-3 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted w-24">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="d in recentDocs" :key="d.id" class="border-b border-black/[0.02] last:border-0 hover:bg-black/[0.02] cursor-pointer transition-colors" @click="openDoc(d.id)">
                  <td class="py-3.5 px-6 font-semibold text-text">
                    <div class="flex items-center gap-2.5">
                      <div :class="['w-2 h-2 rounded-full', d.type === 'invoice' ? 'bg-accent' : d.type === 'quote' ? 'bg-success' : 'bg-orange']" />
                      {{ typeLabels[d.type] }}
                    </div>
                  </td>
                  <td class="py-3.5 px-6 font-mono text-xs tabular-nums text-text-secondary">{{ d.number }}</td>
                  <td class="py-3.5 px-6 text-text-secondary">{{ d.client.name || '---' }}</td>
                  <td class="py-3.5 px-6 text-text-muted text-xs">{{ d.date }}</td>
                  <td class="py-3.5 px-6 text-right font-bold tabular-nums text-text">{{ formatCurrency(totalOf(d)) }}</td>
                  <td class="py-3.5 px-6 text-center">
                    <span :class="[
                      'inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg',
                      statusVariants[d.status] === 'success' ? 'bg-success/15 text-success' : '',
                      statusVariants[d.status] === 'warning' ? 'bg-warning/15 text-warning' : '',
                      statusVariants[d.status] === 'danger' ? 'bg-danger/15 text-danger' : '',
                      statusVariants[d.status] === 'default' ? 'bg-black/[0.04] text-text-muted' : '',
                    ]">{{ statusLabels[d.status] }}</span>
                  </td>
                  <td class="py-3.5 px-6">
                    <div class="flex gap-1 justify-center">
                      <button @click.stop="openDoc(d.id)" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/[0.06] transition-colors text-text-muted hover:text-text" title="Ver">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                      <button @click.stop="openDoc(d.id)" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/[0.06] transition-colors text-text-muted hover:text-text" title="Editar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button @click.stop class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/[0.06] transition-colors text-text-muted hover:text-danger" title="Eliminar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="!recentDocs.length && !loading" class="text-center py-16 text-sm text-text-muted">
            No hay documentos recientes.
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-4">
          <!-- Quick Access -->
          <div class="content-reveal glass-raised rounded-2xl p-5">
            <h2 class="text-sm font-bold text-text mb-4">Acceso rapido</h2>
            <div class="space-y-2">
              <button v-for="q in [
                { type: 'invoice', label: 'Nueva Factura', desc: 'Crear una nueva factura', color: 'text-accent', bg: 'bg-accent/10', arrow: 'text-accent' },
                { type: 'quote', label: 'Nueva Cotizacion', desc: 'Crear una nueva cotizacion', color: 'text-success', bg: 'bg-success/10', arrow: 'text-success' },
                { type: 'delivery-note', label: 'Nueva Remision', desc: 'Crear una nueva remision', color: 'text-orange', bg: 'bg-orange/10', arrow: 'text-orange' },
              ]" :key="q.type" @click="quickCreate(q.type)" class="glass-control w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-left group">
                <div :class="['w-10 h-10 rounded-xl flex items-center justify-center', q.bg]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" :class="q.color"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-bold text-text">{{ q.label }}</p>
                  <p class="text-[10px] text-text-muted mt-0.5">{{ q.desc }}</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" :class="[q.arrow, 'opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1']"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          <!-- Summary -->
          <div class="content-reveal glass-raised rounded-2xl p-5">
            <h2 class="text-sm font-bold text-text mb-4">Resumen general</h2>
            <div class="space-y-3.5">
              <div class="flex items-center justify-between">
                <span class="text-[11px] text-text-muted font-medium">Ultimo documento</span>
                <span class="text-xs font-bold text-text font-mono">{{ recentDocs[0]?.number || '---' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[11px] text-text-muted font-medium">Empresa activa</span>
                <span class="text-xs font-bold text-text">{{ settings.company.name || 'Mi Empresa' }}</span>
              </div>
              <div class="pt-3 border-t border-black/[0.04]">
                <span class="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Numeracion actual</span>
                <div class="flex flex-wrap gap-2 mt-2.5">
                  <span v-for="(fmt, type) in settings.numberFormat" :key="type" class="px-2.5 py-1.5 text-[10px] font-mono font-bold rounded-lg bg-black/[0.04] text-text border border-black/[0.04]">{{ fmt.prefix }}-{{ '0'.repeat(fmt.padding) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
