<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useDocumentsStore } from '@/stores/documents'
import AppModal from '@/components/ui/AppModal.vue'
import AppConfirm from '@/components/ui/AppConfirm.vue'
import PrintPreview from '@/components/preview/PrintPreview.vue'
import { useDocumentCalculations } from '@/composables/useDocumentCalculations'
import { usePrint } from '@/composables/usePrint'
import { useToast } from '@/composables/useToast'
import { useSettingsStore } from '@/stores/settings'
import gsap from 'gsap'

const router = useRouter()
const documents = useDocumentsStore()
const settings = useSettingsStore()
const { formatCurrency, docTotal } = useDocumentCalculations()
const { printDocument } = usePrint()
const toast = useToast()

const filterType = ref<string>('all')
const search = ref('')
const previewDoc = ref<any>(null)
const showPreview = ref(false)
const deleteTarget = ref<string | null>(null)
const showDeleteConfirm = ref(false)
const currentPage = ref(1)
const perPage = 10

const statusLabels: Record<string, string> = { 'draft': 'Borrador', 'sent': 'Enviado', 'paid': 'Pagado', 'cancelled': 'Cancelado' }
const statusVariants: Record<string, 'success' | 'warning' | 'danger' | 'default'> = { 'draft': 'default', 'sent': 'warning', 'paid': 'success', 'cancelled': 'danger' }
const typeLabels: Record<string, string> = { 'invoice': 'Factura', 'delivery-note': 'Remision', 'quote': 'Cotizacion' }

function totalOf(d: any) { return docTotal(d.items) }

const filtered = computed(() => {
  let list = documents.docs
  if (filterType.value !== 'all') list = list.filter(d => d.type === filterType.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(d => d.number.toLowerCase().includes(q) || d.client.name.toLowerCase().includes(q))
  }
  return list.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
})

const totalPages = computed(() => Math.ceil(filtered.value.length / perPage))
const paginated = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filtered.value.slice(start, start + perPage)
})

function editDoc(id: string) { router.push(`/editor/${id}`) }
function preview(doc: any) { previewDoc.value = doc; showPreview.value = true }
function confirmDelete(id: string) { deleteTarget.value = id; showDeleteConfirm.value = true }

async function remove() {
  if (deleteTarget.value) {
    await documents.deleteDoc(deleteTarget.value)
    toast.show('Documento eliminado', 'success')
    deleteTarget.value = null
  }
  showDeleteConfirm.value = false
}

onMounted(async () => {
  await documents.loadAll()
  await nextTick()
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  gsap.fromTo('.history-header', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' })
  gsap.fromTo('.history-content', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: 0.15 })
})
</script>

<template>
  <div class="history-view h-full overflow-y-auto">
    <div class="max-w-[1200px] mx-auto px-5 py-6 sm:px-8 sm:py-8">
      <div class="history-header mb-8">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Historial</p>
        <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight text-text">Documentos</h1>
        <p class="text-sm mt-1.5 text-text-secondary">Todos los documentos guardados en el sistema.</p>
      </div>

      <!-- Filters -->
      <div class="history-content">
        <div class="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center">
          <div class="glass-pressed flex gap-1 overflow-x-auto p-1 rounded-xl">
            <button v-for="f in [{v:'all',l:'Todos'},{v:'invoice',l:'Facturas'},{v:'quote',l:'Cotizaciones'},{v:'delivery-note',l:'Remisiones'}]" :key="f.v" @click="filterType = f.v; currentPage = 1" :class="['px-3.5 py-2 text-xs font-bold rounded-lg transition-all duration-200', filterType === f.v ? 'bg-accent/15 text-accent shadow-[0_0_12px_rgba(75,110,245,0.1)]' : 'text-text-muted hover:text-text-secondary']">{{ f.l }}</button>
          </div>
          <div class="flex-1 w-full sm:max-w-xs relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input v-model="search" aria-label="Buscar por numero o cliente" placeholder="Buscar por numero o cliente..." class="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl glass-control text-text placeholder:text-text-muted" />
          </div>
        </div>

        <!-- Table -->
        <div v-if="paginated.length" class="glass-raised rounded-2xl overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-black/[0.04]">
                <th class="text-left py-3.5 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Tipo</th>
                <th class="text-left py-3.5 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Numero</th>
                <th class="text-left py-3.5 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Cliente</th>
                <th class="text-left py-3.5 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Fecha</th>
                <th class="text-right py-3.5 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Total</th>
                <th class="text-center py-3.5 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Estado</th>
                <th class="text-center py-3.5 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted w-24">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in paginated" :key="d.id" class="border-b border-black/[0.02] last:border-0 hover:bg-black/[0.02] cursor-pointer transition-colors" @click="preview(d)">
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
                    <button @click.stop="preview(d)" aria-label="Ver documento" class="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-black/[0.06] transition-colors text-text-muted hover:text-text" title="Ver">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                    <button @click.stop="editDoc(d.id)" aria-label="Editar documento" class="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-black/[0.06] transition-colors text-text-muted hover:text-text" title="Editar">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button @click.stop="confirmDelete(d.id)" aria-label="Eliminar documento" class="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-black/[0.06] transition-colors text-text-muted hover:text-danger" title="Eliminar">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="text-center py-20 glass-raised rounded-2xl">
          <p class="text-sm text-text-muted">{{ search || filterType !== 'all' ? 'Sin resultados.' : 'No hay documentos guardados.' }}</p>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-center gap-1 mt-6">
          <button @click="currentPage = Math.max(1, currentPage - 1)" aria-label="Página anterior" :disabled="currentPage === 1" class="w-11 h-11 flex items-center justify-center rounded-xl text-sm font-bold glass-control text-text-secondary hover:text-text disabled:opacity-30">&lt;</button>
          <button v-for="p in totalPages" :key="p" @click="currentPage = p" :aria-label="`Ir a página ${p}`" :aria-current="p === currentPage ? 'page' : undefined" :class="['w-11 h-11 flex items-center justify-center rounded-xl text-sm font-bold transition-all', p === currentPage ? 'bg-accent text-white shadow-[0_0_15px_rgba(75,110,245,0.3)]' : 'glass-control text-text-secondary hover:text-text']">{{ p }}</button>
          <button @click="currentPage = Math.min(totalPages, currentPage + 1)" aria-label="Página siguiente" :disabled="currentPage === totalPages" class="w-11 h-11 flex items-center justify-center rounded-xl text-sm font-bold glass-control text-text-secondary hover:text-text disabled:opacity-30">&gt;</button>
        </div>

        <!-- Preview Modal -->
        <AppModal :show="showPreview" title="Vista previa" @close="showPreview = false" max-width="max-w-4xl">
          <div v-if="previewDoc" class="flex justify-center bg-bg rounded-xl p-4 border border-black/[0.04]">
            <PrintPreview :doc="previewDoc" :sections="settings.sections" />
          </div>
          <div class="flex justify-end gap-2 mt-5 no-print">
            <button @click="showPreview = false" class="glass-control px-4 py-2 text-sm font-semibold rounded-xl text-text-secondary hover:text-text">Cerrar</button>
            <button @click="previewDoc && printDocument(previewDoc.paperSize)" class="glass-control px-4 py-2 text-sm font-semibold rounded-xl text-text-secondary hover:text-text">Imprimir</button>
            <button @click="previewDoc && editDoc(previewDoc.id)" class="accent-glow px-4 py-2 text-sm font-bold text-white rounded-xl">Editar</button>
          </div>
        </AppModal>

        <AppConfirm :show="showDeleteConfirm" title="Eliminar documento" message="Eliminar este documento? No se puede deshacer." confirm-text="Eliminar" variant="danger" @confirm="remove" @cancel="showDeleteConfirm = false" />
      </div>
    </div>
    <div v-if="previewDoc" class="print-sheet print-only">
      <PrintPreview :doc="previewDoc" :sections="settings.sections" />
    </div>
  </div>
</template>
