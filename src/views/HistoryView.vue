<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDocumentsStore } from '@/stores/documents'
import { useSettingsStore } from '@/stores/settings'
import { useDocumentCalculations } from '@/composables/useDocumentCalculations'
import { usePrint } from '@/composables/usePrint'
import { useToast } from '@/composables/useToast'
import AppModal from '@/components/ui/AppModal.vue'
import AppConfirm from '@/components/ui/AppConfirm.vue'
import PrintPreview from '@/components/preview/PrintPreview.vue'
import type { DocumentData } from '@/types/document'

const router = useRouter()
const documents = useDocumentsStore()
const settings = useSettingsStore()
const { formatCurrency, docTotal } = useDocumentCalculations()
const { printDocument } = usePrint()
const toast = useToast()

const filterType = ref('all')
const search = ref('')
const previewDoc = ref<DocumentData | null>(null)
const deleteTarget = ref<string | null>(null)
const showDeleteConfirm = ref(false)
const currentPage = ref(1)
const perPage = 10

const filters = [
  { value: 'all', label: 'Todos' },
  { value: 'invoice', label: 'Facturas' },
  { value: 'quote', label: 'Cotizaciones' },
  { value: 'delivery-note', label: 'Remisiones' },
]
const typeLabels: Record<string, string> = { invoice: 'Factura', 'delivery-note': 'Remisión', quote: 'Cotización' }
const statusLabels: Record<string, string> = { draft: 'Borrador', sent: 'Enviado', paid: 'Pagado', cancelled: 'Cancelado' }
const statusClasses: Record<string, string> = { draft: 'bg-[#FFF4D8] text-[#775D00]', sent: 'bg-[#EAF2FF] text-[#24528D]', paid: 'bg-[#E8F7E9] text-[#187343]', cancelled: 'bg-[#FBE8E8] text-[#A02A2A]' }

const filtered = computed(() => {
  const query = search.value.trim().toLowerCase()
  return documents.docs
    .filter((doc) => filterType.value === 'all' || doc.type === filterType.value)
    .filter((doc) => !query || `${doc.number} ${doc.client?.name ?? ''}`.toLowerCase().includes(query))
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
})
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage)))
const paginated = computed(() => filtered.value.slice((currentPage.value - 1) * perPage, currentPage.value * perPage))

function totalOf(doc: DocumentData) { return docTotal(doc.items) }
function editDoc(id: string) { router.push(`/editor/${id}`) }
function resetPage() { currentPage.value = 1 }
function confirmDelete(id: string) { deleteTarget.value = id; showDeleteConfirm.value = true }

async function remove() {
  if (deleteTarget.value) {
    await documents.deleteDoc(deleteTarget.value)
    toast.show('Documento eliminado', 'success')
  }
  deleteTarget.value = null
  showDeleteConfirm.value = false
}

onMounted(() => documents.loadAll())
</script>

<template>
  <div class="app-page history-view">
    <header class="workspace-page-header">
      <div><p class="eyebrow">Workspace</p><h1 class="workspace-title">Historial</h1><p class="workspace-subtitle">Consulta, filtra y recupera tus documentos guardados.</p></div>
      <button type="button" class="workspace-header-action" @click="router.push('/editor')"><span aria-hidden="true">+</span> Nuevo documento</button>
    </header>

    <section class="workspace-panel mt-7">
      <div class="workspace-history-toolbar"><div><p class="eyebrow">Biblioteca local</p><h2 class="workspace-panel-title">{{ filtered.length }} documentos</h2></div><label class="workspace-search-field workspace-history-search"><span class="sr-only">Buscar documentos</span><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" stroke-linecap="round" /></svg><input id="history-search" v-model="search" type="search" placeholder="Buscar por folio o cliente" @input="resetPage" /></label></div>
      <div class="workspace-filter-tabs" role="tablist" aria-label="Filtrar documentos"><button v-for="filter in filters" :key="filter.value" type="button" :aria-selected="filterType === filter.value" :class="['workspace-filter-tab', filterType === filter.value && 'is-active']" role="tab" @click="filterType = filter.value; resetPage()">{{ filter.label }}</button></div>

      <div v-if="documents.loadError" class="workspace-feedback workspace-feedback-error mt-5"><p>No se pudo cargar el historial local.</p><button type="button" @click="documents.loaded = false; documents.loadAll()">Intentar de nuevo</button></div>
      <div v-else-if="!paginated.length" class="workspace-feedback mt-5"><div class="mx-auto flex h-10 w-10 items-center justify-center rounded-[7px] bg-accent font-display text-lg font-extrabold text-accent-text">＋</div><p class="mt-3">{{ search || filterType !== 'all' ? 'No encontramos coincidencias' : 'Tu historial está vacío' }}</p><small>{{ search || filterType !== 'all' ? 'Prueba con otro folio, cliente o filtro.' : 'Crea tu primer documento y volveremos a mostrarlo aquí.' }}</small><button type="button" class="no-underline" @click="search || filterType !== 'all' ? (search = '', filterType = 'all') : router.push('/editor')">{{ search || filterType !== 'all' ? 'Limpiar filtros' : 'Crear documento' }}</button></div>
      <div v-else class="workspace-history-table mt-5">
        <div class="workspace-history-head"><span>Documento</span><span>Cliente</span><span>Estado</span><span class="text-right">Importe</span><span /></div>
        <article v-for="doc in paginated" :key="doc.id" class="workspace-history-row">
        <button type="button" class="flex min-w-0 flex-1 items-center gap-3 py-2 text-left hover:text-text" @click="editDoc(doc.id)">
          <span class="workspace-document-name"><span class="workspace-document-icon">{{ (doc.client?.name || typeLabels[doc.type] || 'D').trim().charAt(0).toUpperCase() }}</span><span><strong>{{ typeLabels[doc.type] }} · {{ doc.number }}</strong><small>{{ doc.date }}</small></span></span>
        </button>
        <span class="workspace-history-client">{{ doc.client?.name || 'Sin cliente' }}</span>
        <span :class="['workspace-status', statusClasses[doc.status] || statusClasses.draft]">{{ statusLabels[doc.status] || 'Borrador' }}</span>
        <span class="workspace-document-total">{{ formatCurrency(totalOf(doc)) }}</span>
        <button type="button" class="touch-target rounded-[7px] px-2 text-xs font-bold text-text-muted hover:bg-[#FBE8E8] hover:text-[#A02A2A]" aria-label="Eliminar documento" @click="confirmDelete(doc.id)">×</button>
      </article>
      <div class="flex items-center justify-between border-t border-border-light px-3 py-3"><button type="button" class="touch-target rounded-[7px] px-3 text-xs font-bold text-text-muted disabled:opacity-30" :disabled="currentPage === 1" @click="currentPage--">‹ Anterior</button><span class="text-xs font-bold text-text-muted">{{ currentPage }} / {{ totalPages }}</span><button type="button" class="touch-target rounded-[7px] px-3 text-xs font-bold text-text-muted disabled:opacity-30" :disabled="currentPage === totalPages" @click="currentPage++">Siguiente ›</button></div></div>
    </section>

    <AppModal :show="Boolean(previewDoc)" title="Vista previa" max-width="max-w-4xl" @close="previewDoc = null"><div v-if="previewDoc" class="rounded-[16px] bg-surface-hover p-3 sm:p-5"><PrintPreview :doc="previewDoc" :sections="settings.sections" /></div><div class="mt-4 flex justify-end gap-2 no-print"><button type="button" class="rounded-[12px] bg-surface-hover px-4 py-3 text-xs font-bold text-text" @click="previewDoc = null">Cerrar</button><button v-if="previewDoc" type="button" class="rounded-[12px] bg-text px-4 py-3 text-xs font-bold text-white" @click="printDocument(previewDoc.paperSize)">Imprimir</button></div></AppModal>
    <AppConfirm :show="showDeleteConfirm" title="Eliminar documento" message="¿Eliminar este documento? Esta acción no se puede deshacer." confirm-text="Eliminar" variant="danger" @confirm="remove" @cancel="showDeleteConfirm = false" />
  </div>
</template>
