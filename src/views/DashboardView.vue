<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { useDocumentsStore } from '@/stores/documents'
import { useSettingsStore } from '@/stores/settings'
import { useEditorStore } from '@/stores/editor'
import { useDocumentCalculations } from '@/composables/useDocumentCalculations'
import type { DocumentData, DocumentType } from '@/types/document'

const router = useRouter()
const docs = useDocumentsStore()
const settings = useSettingsStore()
const editor = useEditorStore()
const { formatCurrency, docTotal } = useDocumentCalculations()
const loading = shallowRef(true)
const dashboardSearch = shallowRef('')

const typeLabels: Record<string, string> = { invoice: 'Factura', 'delivery-note': 'Remisión', quote: 'Cotización' }
const statusLabels: Record<string, string> = { draft: 'Borrador', sent: 'Enviado', paid: 'Pagado', cancelled: 'Cancelado' }
const statusClasses: Record<string, string> = {
  draft: 'bg-[#FFF4D8] text-[#775D00]',
  sent: 'bg-[#EAF2FF] text-[#24528D]',
  paid: 'bg-[#E8F7E9] text-[#187343]',
  cancelled: 'bg-[#FBE8E8] text-[#A02A2A]',
}

const visibleDocs = computed(() => {
  const query = dashboardSearch.value.trim().toLowerCase()
  const items = docs.recentDocs
  if (!query) return items
  return items.filter((doc) => `${doc.number} ${doc.client?.name ?? ''} ${typeLabels[doc.type]}`.toLowerCase().includes(query))
})

const companyInitial = computed(() => settings.company.name?.trim().charAt(0).toUpperCase() || 'D')

function openDoc(id: string) { router.push(`/editor/${id}`) }

function quickCreate(type: DocumentType) {
  editor.newDoc(type)
  router.push('/editor')
}

function totalOf(doc: DocumentData) { return docTotal(doc.items) }

async function loadDocuments() {
  loading.value = true
  await docs.loadAll()
  loading.value = false
}

onMounted(loadDocuments)
</script>

<template>
  <div class="app-page dashboard-view">
    <header class="workspace-page-header">
      <div class="min-w-0">
        <p class="eyebrow">Panel general</p>
        <h1 class="workspace-title">Hola, {{ settings.company.name || 'equipo' }}.</h1>
        <p class="workspace-subtitle">Todo lo que necesitas para preparar y controlar tus documentos.</p>
      </div>
      <button type="button" class="workspace-header-action" @click="quickCreate('invoice')"><span aria-hidden="true">+</span> Nuevo documento</button>
    </header>

    <section class="workspace-metrics" aria-label="Resumen de actividad">
      <article class="workspace-metric workspace-metric-primary"><span class="workspace-metric-label">Total facturado</span><strong>{{ formatCurrency(docs.stats.invoiceTotal) }}</strong><span class="workspace-metric-note">{{ docs.stats.invoices }} facturas guardadas</span></article>
      <article class="workspace-metric"><span class="workspace-metric-label">Documentos totales</span><strong>{{ docs.stats.total }}</strong><span class="workspace-metric-note">En tu historial local</span></article>
      <article class="workspace-metric"><span class="workspace-metric-label">Última actividad</span><strong>{{ docs.recentDocs[0]?.updatedAt || 'Hoy' }}</strong><span class="workspace-metric-note">Datos almacenados en este dispositivo</span></article>
    </section>

    <section class="workspace-grid workspace-grid-main">
      <div class="workspace-panel">
        <div class="workspace-panel-heading"><div><p class="eyebrow">Acciones rápidas</p><h2 class="workspace-panel-title">¿Qué vas a preparar?</h2></div><span class="workspace-panel-index">01</span></div>
        <div class="workspace-action-grid">
          <button type="button" class="workspace-action-card workspace-action-featured" @click="quickCreate('invoice')"><span class="workspace-action-icon">＋</span><span><strong>Factura</strong><small>Cobros y ventas</small></span><span class="workspace-action-arrow">↗</span></button>
          <button type="button" class="workspace-action-card" @click="quickCreate('quote')"><span class="workspace-action-icon">⌁</span><span><strong>Cotización</strong><small>Propuestas comerciales</small></span><span class="workspace-action-arrow">↗</span></button>
          <button type="button" class="workspace-action-card" @click="quickCreate('delivery-note')"><span class="workspace-action-icon">□</span><span><strong>Remisión</strong><small>Entrega de mercancía</small></span><span class="workspace-action-arrow">↗</span></button>
        </div>
      </div>

      <div v-if="!loading && !docs.recentDocs.length && !settings.guideSeen" class="workspace-panel workspace-guide-panel">
        <div class="workspace-panel-heading"><div><p class="eyebrow">Primer paso</p><h2 class="workspace-panel-title">Configura tu empresa</h2></div><span class="workspace-guide-mark">D</span></div>
        <p class="workspace-panel-copy">Completa tus datos una vez y aparecerán automáticamente en cada documento nuevo.</p>
        <div class="mt-5 flex flex-wrap gap-2"><router-link to="/settings" class="workspace-dark-button">Configurar ahora</router-link><button type="button" class="workspace-link-button" @click="settings.guideSeen = true; settings.save()">Ahora no</button></div>
      </div>
      <div v-else class="workspace-panel workspace-note-panel"><p class="eyebrow">DocGen</p><h2 class="workspace-panel-title">Tu espacio está listo.</h2><p class="workspace-panel-copy">Crea, revisa y guarda tus documentos sin salir de este dispositivo.</p><router-link to="/settings" class="workspace-link-button mt-4 inline-flex">Revisar ajustes <span aria-hidden="true">↗</span></router-link></div>
    </section>

    <section class="workspace-panel workspace-documents-panel">
      <div class="workspace-panel-heading workspace-documents-heading"><div><p class="eyebrow">Actividad reciente</p><h2 class="workspace-panel-title">Documentos recientes</h2></div><router-link to="/history" class="workspace-link-button">Ver historial <span aria-hidden="true">↗</span></router-link></div>
      <label class="workspace-search-field"><span class="sr-only">Buscar documentos</span><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" stroke-linecap="round" /></svg><input v-model="dashboardSearch" type="search" placeholder="Buscar por folio, cliente o tipo" /></label>
      <div v-if="loading" class="mt-4 space-y-2" aria-label="Cargando documentos"><div v-for="n in 3" :key="n" class="h-[62px] animate-pulse rounded-[8px] bg-surface-hover" /></div>
      <div v-else-if="docs.loadError" class="workspace-feedback workspace-feedback-error"><p>No se pudieron cargar tus documentos.</p><button type="button" @click="loadDocuments">Intentar de nuevo</button></div>
      <div v-else-if="!visibleDocs.length" class="workspace-feedback"><p>{{ dashboardSearch ? 'No encontramos coincidencias.' : 'Aún no hay documentos aquí.' }}</p><small>{{ dashboardSearch ? 'Prueba con otro folio o cliente.' : 'Empieza con una factura y guárdala para verla en tu historial.' }}</small></div>
      <div v-else class="workspace-document-table">
        <div class="workspace-table-head"><span>Documento</span><span>Cliente</span><span>Estado</span><span class="text-right">Importe</span><span /></div>
        <button v-for="doc in visibleDocs" :key="doc.id" type="button" class="workspace-document-row" @click="openDoc(doc.id)">
          <span class="workspace-document-name"><span class="workspace-document-icon">{{ (doc.client?.name || typeLabels[doc.type] || 'D').trim().charAt(0).toUpperCase() }}</span><span><strong>{{ typeLabels[doc.type] }} · {{ doc.number }}</strong><small>{{ doc.updatedAt }}</small></span></span>
          <span class="workspace-document-client">{{ doc.client?.name || 'Sin cliente' }}</span>
          <span :class="['workspace-status', statusClasses[doc.status] || statusClasses.draft]">{{ statusLabels[doc.status] || 'Borrador' }}</span>
          <span class="workspace-document-total">{{ formatCurrency(totalOf(doc)) }}</span>
          <span class="workspace-document-arrow" aria-hidden="true">›</span>
        </button>
      </div>
    </section>
  </div>
</template>
