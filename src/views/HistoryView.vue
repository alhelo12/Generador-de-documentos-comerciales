<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDocumentsStore } from '@/stores/documents'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
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

const statusLabels: Record<string, string> = { 'draft': 'Borrador', 'sent': 'Enviado', 'paid': 'Pagado', 'cancelled': 'Cancelado' }
const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = { 'draft': 'default', 'sent': 'warning', 'paid': 'success', 'cancelled': 'danger' }
const typeLabels: Record<string, string> = { 'invoice': 'Factura', 'delivery-note': 'Remisión', 'quote': 'Cotización' }

function totalOf(d: any) {
  return docTotal(d.items)
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

function editDoc(id: string) {
  router.push(`/editor/${id}`)
}

function preview(doc: any) {
  previewDoc.value = doc
  showPreview.value = true
}

function confirmDelete(id: string) {
  deleteTarget.value = id
  showDeleteConfirm.value = true
}

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
  <div class="max-w-6xl mx-auto px-4 lg:px-6 py-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold tracking-tight">Historial</h1>
      <p class="text-sm text-neutral-500 mt-1">Todos los documentos guardados. Haz clic en uno para previsualizarlo, editarlo o imprimirlo.</p>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-3 mb-6">
      <div class="flex gap-1 bg-neutral-100 rounded-lg p-1">
        <button v-for="f in [{v:'all',l:'Todos'},{v:'invoice',l:'Facturas'},{v:'quote',l:'Cotizaciones'},{v:'delivery-note',l:'Remisiones'}]" :key="f.v" @click="filterType = f.v" :class="['px-3 py-1.5 text-xs font-medium rounded-md transition-colors', filterType === f.v ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-500 hover:text-neutral-700']">{{ f.l }}</button>
      </div>
      <AppInput v-model="search" placeholder="Buscar por número o cliente..." class="flex-1 max-w-xs" />
    </div>

    <!-- Table -->
    <div v-if="filtered.length" class="bg-white border border-neutral-200 rounded-lg overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-neutral-200 text-[11px] uppercase tracking-wider text-neutral-500">
            <th class="text-left py-3 px-4 font-medium">Tipo</th>
            <th class="text-left py-3 px-4 font-medium">Número</th>
            <th class="text-left py-3 px-4 font-medium">Cliente</th>
            <th class="text-left py-3 px-4 font-medium">Fecha</th>
            <th class="text-right py-3 px-4 font-medium">Total</th>
            <th class="text-center py-3 px-4 font-medium">Estado</th>
            <th class="text-center py-3 px-4 font-medium w-24">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in filtered" :key="d.id" class="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 cursor-pointer" @click="preview(d)">
            <td class="py-3 px-4 text-xs font-medium">{{ typeLabels[d.type] }}</td>
            <td class="py-3 px-4 text-xs font-mono tabular-nums">{{ d.number }}</td>
            <td class="py-3 px-4 text-xs text-neutral-600">{{ d.client.name || '—' }}</td>
            <td class="py-3 px-4 text-xs text-neutral-500">{{ d.date }}</td>
            <td class="py-3 px-4 text-xs text-right tabular-nums font-semibold">{{ formatCurrency(totalOf(d)) }}</td>
            <td class="py-3 px-4 text-center"><AppBadge :variant="statusVariants[d.status]">{{ statusLabels[d.status] }}</AppBadge></td>
            <td class="py-3 px-4">
              <div class="flex gap-1 justify-center">
                <button @click.stop="editDoc(d.id)" class="inline-flex items-center gap-1 px-2 py-1 text-[11px] text-neutral-500 hover:text-accent transition-colors" title="Editar" aria-label="Editar documento">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Editar
                </button>
                <button @click.stop="confirmDelete(d.id)" class="inline-flex items-center gap-1 px-2 py-1 text-[11px] text-neutral-400 hover:text-danger transition-colors" title="Eliminar" aria-label="Eliminar documento">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="text-center py-16 text-sm text-neutral-400">
      {{ search || filterType !== 'all' ? 'Sin resultados para esta búsqueda.' : 'No hay documentos guardados.' }}
    </div>

    <!-- Preview modal -->
    <AppModal :show="showPreview" title="Vista previa" @close="showPreview = false" max-width="max-w-4xl">
      <div v-if="previewDoc" class="flex justify-center">
        <PrintPreview :doc="previewDoc" :sections="settings.sections" />
      </div>
      <div class="flex justify-end gap-2 mt-4 no-print">
        <AppButton variant="secondary" @click="showPreview = false">Cerrar</AppButton>
        <AppButton variant="secondary" @click="previewDoc && printDocument(previewDoc.paperSize)" aria-label="Imprimir documento">
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9V3h12v6M6 9h12M6 9H4a2 2 0 00-2 2v6h4v4h12v-4h4v-6a2 2 0 00-2-2h-2M6 15h12" /></svg>
          </template>
          Imprimir / PDF
        </AppButton>
        <AppButton @click="previewDoc && editDoc(previewDoc.id)" aria-label="Editar documento">Editar</AppButton>
      </div>
    </AppModal>

    <AppConfirm
      :show="showDeleteConfirm"
      title="Eliminar documento"
      message="¿Estás seguro de que deseas eliminar este documento? Esta acción no se puede deshacer."
      confirm-text="Eliminar"
      variant="danger"
      @confirm="remove"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>
