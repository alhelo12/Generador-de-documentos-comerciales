<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDocumentsStore } from '@/stores/documents'
import AppModal from '@/components/ui/AppModal.vue'
import AppConfirm from '@/components/ui/AppConfirm.vue'
import AppInput from '@/components/ui/AppInput.vue'
import PrintPreview from '@/components/preview/PrintPreview.vue'
import { useDocumentCalculations } from '@/composables/useDocumentCalculations'
import { usePrint } from '@/composables/usePrint'
import { useToast } from '@/composables/useToast'
import { useSettingsStore } from '@/stores/settings'

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
const typeLabels: Record<string, string> = { 'invoice': 'Factura', 'delivery-note': 'Remisión', 'quote': 'Cotización' }

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

onMounted(() => documents.loadAll())
</script>

<template>
  <div class="history-view h-full overflow-y-auto">
    <div class="max-w-[1000px] mx-auto px-4 py-5 sm:px-6 sm:py-6">
      <h1 class="text-xl font-bold mb-1" style="color: #0f172a;">Historial</h1>
      <p class="text-sm mb-5" style="color: #94a3b8;">Todos los documentos guardados.</p>

      <!-- Filters -->
      <div class="flex flex-col gap-3 mb-5 sm:flex-row sm:items-center">
        <div class="neu-pressed flex gap-1 overflow-x-auto p-1 rounded-xl">
          <button v-for="f in [{v:'all',l:'Todos'},{v:'invoice',l:'Facturas'},{v:'quote',l:'Cotizaciones'},{v:'delivery-note',l:'Remisiones'}]" :key="f.v" @click="filterType = f.v; currentPage = 1" :class="['px-3 py-1.5 text-xs font-medium rounded-md transition-all', filterType === f.v ? 'bg-surface text-text shadow-sm border border-border' : 'text-text-secondary hover:text-text']">{{ f.l }}</button>
        </div>
        <div class="flex-1 w-full sm:max-w-xs relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" class="absolute left-3 top-1/2 -translate-y-1/2" style="color: #94a3b8;"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input v-model="search" aria-label="Buscar por número o cliente" placeholder="Buscar por número o cliente…" class="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-surface text-text placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent/20" />
        </div>
      </div>

      <!-- Table -->
      <div v-if="paginated.length" class="neu-raised rounded-2xl overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border" style="color: #94a3b8;">
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
            <tr v-for="d in paginated" :key="d.id" class="border-b border-border-light last:border-0 hover:bg-surface-hover cursor-pointer transition-colors" @click="preview(d)">
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
                  <button @click.stop="preview(d)" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-hover transition-colors" style="color: #94a3b8;" title="Ver">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                  <button @click.stop="editDoc(d.id)" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-hover transition-colors" style="color: #94a3b8;" title="Editar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button @click.stop="confirmDelete(d.id)" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-hover transition-colors" style="color: #94a3b8;" title="Eliminar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="text-center py-16 text-sm" style="color: #94a3b8;">
        {{ search || filterType !== 'all' ? 'Sin resultados.' : 'No hay documentos guardados.' }}
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-1 mt-4">
        <button @click="currentPage = Math.max(1, currentPage - 1)" :disabled="currentPage === 1" class="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium border border-border bg-surface text-text-secondary hover:bg-surface-hover disabled:opacity-40 transition-all">&lt;</button>
        <button v-for="p in totalPages" :key="p" @click="currentPage = p" :class="['w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium border transition-all', p === currentPage ? 'bg-accent text-white border-accent' : 'border-border bg-surface text-text-secondary hover:bg-surface-hover']">{{ p }}</button>
        <button @click="currentPage = Math.min(totalPages, currentPage + 1)" :disabled="currentPage === totalPages" class="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium border border-border bg-surface text-text-secondary hover:bg-surface-hover disabled:opacity-40 transition-all">&gt;</button>
      </div>

      <AppModal :show="showPreview" title="Vista previa" @close="showPreview = false" max-width="max-w-4xl">
        <div v-if="previewDoc" class="flex justify-center bg-bg rounded-lg p-4 border border-border">
          <PrintPreview :doc="previewDoc" :sections="settings.sections" />
        </div>
        <div class="flex justify-end gap-2 mt-4 no-print">
          <button @click="showPreview = false" class="px-4 py-2 text-sm font-medium rounded-lg border border-border text-text-secondary hover:bg-surface-hover transition-all">Cerrar</button>
          <button @click="previewDoc && printDocument(previewDoc.paperSize)" class="px-4 py-2 text-sm font-medium rounded-lg border border-border text-text-secondary hover:bg-surface-hover transition-all">Imprimir</button>
          <button @click="previewDoc && editDoc(previewDoc.id)" class="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-accent hover:bg-accent-hover transition-all">Editar</button>
        </div>
      </AppModal>

      <AppConfirm :show="showDeleteConfirm" title="Eliminar documento" message="¿Eliminar este documento? No se puede deshacer." confirm-text="Eliminar" variant="danger" @confirm="remove" @cancel="showDeleteConfirm = false" />
    </div>
    <div v-if="previewDoc" class="print-sheet print-only">
      <PrintPreview :doc="previewDoc" :sections="settings.sections" />
    </div>
  </div>
</template>
