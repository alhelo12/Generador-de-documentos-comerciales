<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDocumentsStore } from '@/stores/documents'
import AppModal from '@/components/ui/AppModal.vue'
import AppConfirm from '@/components/ui/AppConfirm.vue'
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
const perPage = 12

const statusLabels: Record<string, string> = { 'draft': 'Borrador', 'sent': 'Enviado', 'paid': 'Pagado', 'cancelled': 'Cancelado' }
const typeLabels: Record<string, string> = { 'invoice': 'Factura', 'delivery-note': 'Remision', 'quote': 'Cotizacion' }

function totalOf(d: any) { return docTotal(d.items) }
function initialOf(d: any) { return (d.client?.name ?? d.number ?? 'D').trim().charAt(0).toUpperCase() || 'D' }
function monoOf(d: any) {
  const id = String(d.id ?? d.number ?? '')
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997
  return `mono-${h % 5}`
}

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
})
</script>

<template>
  <div class="history-view h-full overflow-y-auto bg-bg">
    <div class="max-w-[1100px] mx-auto px-4 py-6 sm:px-8">
      <div class="history-header flex items-center gap-3 mb-5">
        <div class="flex-1 text-center">
          <h1 class="font-display text-lg font-extrabold text-text leading-tight">Colección</h1>
          <p class="text-[11px] text-text-muted">{{ filtered.length }} piezas guardadas</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="history-content">
        <div class="relative mb-4">
          <input v-model="search" aria-label="Buscar piezas" placeholder="Buscar por folio o cliente…" class="w-full pl-11 pr-4 py-3 text-sm rounded-full bg-surface text-text placeholder:text-text-muted shadow-[0_2px_8px_rgba(20,20,20,0.06)]" />
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">⌕</span>
        </div>
        <div class="flex gap-2 overflow-x-auto pb-1 mb-2">
          <button v-for="f in [{v:'all',l:'Todas'},{v:'invoice',l:'Facturas'},{v:'quote',l:'Cotizaciones'},{v:'delivery-note',l:'Remisiones'}]" :key="f.v" @click="filterType = f.v; currentPage = 1" :class="['pill shrink-0 px-4 py-2 text-[11px] font-bold', filterType === f.v ? 'pill-active' : '']">{{ f.l }}</button>
        </div>
        <p class="text-[11px] text-text-muted mb-5">Toca una pieza para verla. Desde ahí puedes editarla, imprimirla o eliminarla.</p>

        <!-- Grid -->
        <div v-if="paginated.length" class="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">
          <article v-for="d in paginated" :key="d.id" @click="preview(d)" class="phone-card p-3.5 cursor-pointer hover:-translate-y-1 transition-transform">
            <div :class="['monogram aspect-[4/3] rounded-[18px] text-5xl', monoOf(d)]" aria-hidden="true">{{ initialOf(d) }}</div>
            <p class="font-display text-[15px] font-extrabold text-text truncate mt-3">{{ d.client?.name || 'Sin cliente' }}</p>
            <p class="text-[11px] text-text-muted mt-0.5 font-mono">{{ d.number }} · {{ d.date }}</p>
            <div class="flex items-center justify-between mt-2.5">
              <span class="text-sm font-extrabold tabular-nums text-text">{{ formatCurrency(totalOf(d)) }}</span>
              <span class="chip">{{ statusLabels[d.status] }}</span>
            </div>
            <div class="flex gap-2 mt-3">
              <button @click.stop="preview(d)" class="flex-1 py-2 text-[11px] font-bold rounded-full bg-surface-hover text-text">Ver</button>
              <button @click.stop="editDoc(d.id)" class="flex-1 py-2 text-[11px] font-bold rounded-full bg-text text-white">Editar</button>
              <button @click.stop="confirmDelete(d.id)" class="flex-1 py-2 text-[11px] font-bold rounded-full text-danger hover:bg-danger/10">Eliminar</button>
            </div>
          </article>
        </div>

        <div v-else class="phone-card text-center py-16 px-6" style="border-style: dashed;">
          <div class="w-14 h-14 rounded-full bg-surface-hover flex items-center justify-center font-display font-extrabold text-2xl text-text-muted mx-auto mb-3">✦</div>
          <p class="font-display font-extrabold text-text">Sin piezas</p>
          <p class="text-xs text-text-muted mt-1 max-w-[280px] mx-auto">{{ search || filterType !== 'all' ? 'Ningún documento coincide con tu búsqueda.' : 'Aquí se guardan tus facturas, cotizaciones y remisiones. Todo queda en tu equipo.' }}</p>
          <button v-if="!search && filterType === 'all'" @click="$router.push('/editor')" class="mt-4 px-5 py-2.5 text-xs font-bold rounded-full bg-text text-white">Crear documento</button>
          <button v-else @click="search = ''; filterType = 'all'; currentPage = 1" class="mt-4 px-5 py-2.5 text-xs font-bold rounded-full bg-surface-hover text-text">Limpiar filtros</button>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-7">
          <button @click="currentPage = Math.max(1, currentPage - 1)" aria-label="Página anterior" :disabled="currentPage === 1" class="px-4 h-9 rounded-full text-xs font-bold bg-surface text-text-secondary shadow-[0_2px_8px_rgba(20,20,20,0.06)] disabled:opacity-30">‹ Anterior</button>
          <button v-for="p in totalPages" :key="p" @click="currentPage = p" :aria-label="`Ir a página ${p}`" :aria-current="p === currentPage ? 'page' : undefined" :class="['w-11 h-11 rounded-full text-xs font-bold transition-all', p === currentPage ? 'bg-text text-white shadow-[0_8px_20px_rgba(20,20,20,0.18)]' : 'bg-surface text-text-secondary shadow-[0_2px_8px_rgba(20,20,20,0.06)]']">{{ p }}</button>
          <button @click="currentPage = Math.min(totalPages, currentPage + 1)" aria-label="Página siguiente" :disabled="currentPage === totalPages" class="px-4 h-9 rounded-full text-xs font-bold bg-surface text-text-secondary shadow-[0_2px_8px_rgba(20,20,20,0.06)] disabled:opacity-30">Siguiente ›</button>
        </div>

        <!-- Preview Modal -->
        <AppModal :show="showPreview" title="Pieza" @close="showPreview = false" max-width="max-w-4xl">
          <div v-if="previewDoc" class="flex justify-center bg-surface-hover rounded-[18px] p-4">
            <PrintPreview :doc="previewDoc" :sections="settings.sections" />
          </div>
          <div class="flex justify-end gap-2 mt-5 no-print">
            <button @click="showPreview = false" class="px-5 py-2.5 text-xs font-bold rounded-full bg-surface-hover text-text-secondary">Cerrar</button>
            <button @click="previewDoc && printDocument(previewDoc.paperSize)" class="px-5 py-2.5 text-xs font-bold rounded-full bg-surface text-text shadow-[0_2px_8px_rgba(20,20,20,0.06)]">Imprimir</button>
            <button @click="previewDoc && editDoc(previewDoc.id)" class="px-5 py-2.5 text-xs font-bold rounded-full bg-text text-white">Editar →</button>
          </div>
        </AppModal>

        <AppConfirm :show="showDeleteConfirm" title="Eliminar pieza" message="Eliminar este documento? No se puede deshacer." confirm-text="Eliminar" variant="danger" @confirm="remove" @cancel="showDeleteConfirm = false" />
      </div>
    </div>
    <div v-if="previewDoc" class="print-sheet print-only">
      <PrintPreview :doc="previewDoc" :sections="settings.sections" />
    </div>
  </div>
</template>
