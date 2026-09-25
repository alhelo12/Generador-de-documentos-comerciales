<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
const dashboardSearch = ref('')
const typeFilter = ref('all')

const statusLabels: Record<string, string> = { 'draft': 'Borrador', 'sent': 'Enviado', 'paid': 'Pagado', 'cancelled': 'Cancelado' }
const typeLabels: Record<string, string> = { 'invoice': 'Factura', 'delivery-note': 'Remision', 'quote': 'Cotizacion' }

function totalOf(d: any) { return docTotal(d.items) }
function openDoc(id: string) { router.push(`/editor/${id}`) }
function initialOf(d: any) { return (d.client?.name ?? d.number ?? 'D').trim().charAt(0).toUpperCase() || 'D' }
function monoOf(d: any) {
  const id = String(d.id ?? d.number ?? '')
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997
  return `mono-${h % 5}`
}

const recentDocs = ref<any[]>([])
const featured = computed(() => filteredRecent.value[0] ?? null)
const gridDocs = computed(() => filteredRecent.value.slice(1))
const filteredRecent = computed(() => {
  let list = recentDocs.value
  if (typeFilter.value !== 'all') list = list.filter(d => d.type === typeFilter.value)
  const query = dashboardSearch.value.trim().toLowerCase()
  if (!query) return list
  return list.filter(d => d.number.toLowerCase().includes(query) || (d.client?.name ?? '').toLowerCase().includes(query))
})

async function retryLoad() {
  docs.loaded = false
  loading.value = true
  await docs.loadAll()
  recentDocs.value = docs.docs.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 7)
  loading.value = false
}

onMounted(async () => {
  await docs.loadAll()
  recentDocs.value = docs.docs.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 7)
  loading.value = false
})

function quickCreate(type: string) {
  editor.newDoc(type as DocumentType)
  router.push('/editor')
}
</script>

<template>
  <div class="h-full overflow-y-auto bg-bg">
    <div class="max-w-[1100px] mx-auto px-4 py-6 sm:px-8">

      <!-- Gallery header -->
      <div class="content-reveal flex items-center gap-3 mb-5">
        <div class="w-11 h-11 rounded-full bg-text text-white flex items-center justify-center font-display font-extrabold text-lg shrink-0">
          {{ (settings.company.name ?? 'D').trim().charAt(0).toUpperCase() || 'D' }}
        </div>
        <div class="flex-1 text-center">
          <h1 class="font-display text-lg font-extrabold text-text leading-tight">DocGen Gallery</h1>
          <p class="text-[11px] text-text-muted">Tus documentos como piezas</p>
        </div>
        <div class="relative shrink-0">
          <button @click="quickCreate('invoice')" class="shrink-0 px-4 py-2.5 text-xs font-bold rounded-full bg-text text-white shadow-[0_8px_20px_rgba(20,20,20,0.18)]">＋ Nuevo</button>
          <span class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-danger border-2 border-bg" />
        </div>
      </div>

      <!-- Search -->
      <div class="content-reveal relative mb-5">
        <input v-model="dashboardSearch" aria-label="Buscar piezas" placeholder="Buscar por folio o cliente…" class="w-full pl-11 pr-4 py-3 text-sm rounded-full bg-surface text-text placeholder:text-text-muted shadow-[0_2px_8px_rgba(20,20,20,0.06)]" />
        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">⌕</span>
      </div>

      <!-- Quick create pills -->
      <div class="content-reveal flex gap-2 overflow-x-auto pb-1 mb-6">
        <button @click="quickCreate('invoice')" class="shrink-0 px-5 py-2.5 text-xs font-bold rounded-full bg-text text-white shadow-[0_8px_20px_rgba(20,20,20,0.18)]">＋ Factura</button>
        <button @click="quickCreate('quote')" class="shrink-0 px-5 py-2.5 text-xs font-bold rounded-full bg-surface text-text shadow-[0_2px_8px_rgba(20,20,20,0.06)]">Cotización</button>
        <button @click="quickCreate('delivery-note')" class="shrink-0 px-5 py-2.5 text-xs font-bold rounded-full bg-surface text-text shadow-[0_2px_8px_rgba(20,20,20,0.06)]">Remisión</button>
      </div>

      <!-- First-run guide -->
      <div v-if="!loading && !recentDocs.length && !settings.guideSeen" class="content-reveal phone-card p-5 mb-6">
        <div class="flex items-start gap-3">
          <div class="flex-1">
            <h2 class="font-display text-base font-extrabold text-text">Tu primera factura en 3 pasos</h2>
            <ol class="mt-3 space-y-2.5 text-[13px] text-text-secondary">
              <li class="flex gap-2.5"><span class="font-display font-extrabold text-text">1</span> Completa tu empresa en <router-link to="/settings" class="font-bold text-text underline underline-offset-2">Ajustes</router-link> — sale en todos tus documentos.</li>
              <li class="flex gap-2.5"><span class="font-display font-extrabold text-text">2</span> Crea una factura y agrega cliente + conceptos.</li>
              <li class="flex gap-2.5"><span class="font-display font-extrabold text-text">3</span> Guarda e imprime o descarga el PDF.</li>
            </ol>
            <div class="flex flex-wrap items-center gap-2 mt-4">
              <button @click="quickCreate('invoice')" class="px-5 py-2.5 text-xs font-bold rounded-full bg-text text-white">Crear mi primera factura</button>
              <button @click="settings.guideSeen = true; settings.save()" class="px-4 py-2.5 text-[11px] font-bold text-text-muted hover:text-text">Ya sé cómo funciona</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Featured piece -->
      <div v-if="!loading && featured" class="content-reveal phone-card p-4 mb-6">
        <div class="relative">
          <div class="art-frame">
            <div :class="['monogram aspect-[16/9] text-7xl', monoOf(featured)]" aria-hidden="true">{{ initialOf(featured) }}</div>
          </div>
        </div>
        <div class="flex items-start gap-3 px-1 pt-4">
          <div class="flex-1 min-w-0">
            <h2 class="font-display text-lg font-extrabold text-text truncate">{{ featured.client?.name || 'Sin cliente' }}</h2>
            <p class="text-[11px] text-text-muted mt-0.5">{{ typeLabels[featured.type] }} · {{ featured.number }} · {{ featured.date }}</p>
            <p class="text-base font-extrabold tabular-nums text-text mt-1.5">{{ formatCurrency(totalOf(featured)) }}</p>
          </div>
          <button @click="openDoc(featured.id)" class="shrink-0 px-5 py-2.5 text-xs font-bold rounded-full bg-text text-white">Abrir →</button>
        </div>
      </div>

      <!-- Stats strip -->
      <div class="content-reveal flex gap-3 overflow-x-auto pb-2 mb-7">
        <div v-for="s in [
          { l: 'Facturado', v: formatCurrency(docs.stats.invoiceTotal) },
          { l: 'Facturas', v: String(docs.stats.invoices) },
          { l: 'Cotizaciones', v: String(docs.stats.quotes) },
          { l: 'Remisiones', v: String(docs.stats.deliveries) },
        ]" :key="s.l" class="shrink-0 phone-card px-5 py-3.5 min-w-[130px]">
          <p class="font-display text-lg font-extrabold text-text tabular-nums">{{ s.v }}</p>
          <p class="text-[11px] text-text-muted mt-0.5">{{ s.l }}</p>
        </div>
      </div>

      <!-- Latest pieces -->
      <div class="content-reveal flex items-end justify-between mb-4">
        <h2 class="font-display text-lg font-extrabold text-text">Últimas piezas</h2>
        <router-link to="/history" class="text-[11px] font-bold text-text-secondary hover:text-text">Ver todo →</router-link>
      </div>

      <div class="content-reveal flex gap-2 overflow-x-auto pb-1 mb-4">
        <button v-for="f in [{v:'all',l:'Todas'},{v:'invoice',l:'Facturas'},{v:'quote',l:'Cotizaciones'},{v:'delivery-note',l:'Remisiones'}]" :key="f.v" @click="typeFilter = f.v" :class="['pill shrink-0 px-4 py-2 text-[11px] font-bold', typeFilter === f.v ? 'pill-active' : '']">{{ f.l }}</button>
      </div>

      <template v-if="loading">
        <div class="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">
          <div v-for="i in 6" :key="i" class="phone-card p-4"><div class="skeleton aspect-[4/3] !rounded-[18px] mb-3" /><div class="skeleton h-4 w-2/3" /></div>
        </div>
      </template>
      <template v-else-if="gridDocs.length">
        <div class="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">
          <article v-for="d in gridDocs" :key="d.id" @click="openDoc(d.id)" class="phone-card p-3.5 cursor-pointer hover:-translate-y-1 transition-transform">
            <div :class="['monogram aspect-[4/3] rounded-[18px] text-5xl mb-3', monoOf(d)]" aria-hidden="true">{{ initialOf(d) }}</div>
            <p class="font-display text-[15px] font-extrabold text-text truncate">{{ d.client?.name || 'Sin cliente' }}</p>
            <p class="text-[11px] text-text-muted mt-0.5 font-mono">{{ d.number }}</p>
            <div class="flex items-center justify-between mt-2.5">
              <span class="text-sm font-extrabold tabular-nums text-text">{{ formatCurrency(totalOf(d)) }}</span>
              <span class="chip">{{ statusLabels[d.status] }}</span>
            </div>
            <button @click.stop="openDoc(d.id)" class="w-full mt-3 py-2 text-[11px] font-bold rounded-full bg-surface-hover text-text">Abrir pieza →</button>
          </article>
        </div>
      </template>
      <div v-else class="phone-card text-center py-14 px-6" style="border-style: dashed;">
        <div class="w-14 h-14 rounded-full bg-surface-hover flex items-center justify-center font-display font-extrabold text-2xl text-text-muted mx-auto mb-3">＋</div>
        <p class="font-display font-extrabold text-text">Nada por aquí aún</p>
        <p class="text-xs text-text-muted mt-1 max-w-[280px] mx-auto">{{ dashboardSearch || typeFilter !== 'all' ? 'Ninguna pieza coincide. Prueba con otro filtro.' : 'Tus documentos aparecerán aquí como piezas de tu galería.' }}</p>
        <button v-if="!dashboardSearch && typeFilter === 'all'" @click="quickCreate('invoice')" class="mt-4 px-5 py-2.5 text-xs font-bold rounded-full bg-text text-white">Crear mi primera factura</button>
        <button v-else @click="dashboardSearch = ''; typeFilter = 'all'" class="mt-4 px-5 py-2.5 text-xs font-bold rounded-full bg-surface-hover text-text">Limpiar filtros</button>
        <p v-if="docs.loadError" class="text-xs text-danger mt-2">{{ docs.loadError }} <button @click="retryLoad" class="underline font-bold">Reintentar</button></p>
      </div>

    </div>
  </div>
</template>
