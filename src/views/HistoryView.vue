<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDocumentsStore } from '@/stores/documents'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppModal from '@/components/ui/AppModal.vue'
import PrintPreview from '@/components/preview/PrintPreview.vue'
import { useDocumentCalculations } from '@/composables/useDocumentCalculations'
import { useSettingsStore } from '@/stores/settings'

const router = useRouter()
const documents = useDocumentsStore()
const settings = useSettingsStore()
const { formatCurrency } = useDocumentCalculations()

const filterType = ref<string>('all')
const search = ref('')
const previewDoc = ref<any>(null)
const showPreview = ref(false)

const statusLabels: Record<string, string> = { 'draft': 'Borrador', 'sent': 'Enviado', 'paid': 'Pagado', 'cancelled': 'Cancelado' }
const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = { 'draft': 'default', 'sent': 'warning', 'paid': 'success', 'cancelled': 'danger' }
const typeLabels: Record<string, string> = { 'invoice': 'Factura', 'delivery-note': 'Remisión', 'quote': 'Cotización' }

function totalOf(d: any) {
  const sub = d.items.reduce((s: number, i: any) => s + i.quantity * i.unitPrice, 0)
  return sub + (sub * (d.items[0]?.taxRate ?? 16) / 100)
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

async function remove(id: string) {
  if (confirm('¿Eliminar este documento?')) {
    await documents.deleteDoc(id)
  }
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
      <input v-model="search" placeholder="Buscar por número o cliente..." class="flex-1 max-w-xs px-3 py-1.5 text-sm border border-neutral-200 rounded-md bg-white outline-none focus:border-accent" />
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
                <button @click.stop="editDoc(d.id)" class="px-2 py-1 text-[11px] text-neutral-500 hover:text-accent transition-colors" title="Editar">Editar</button>
                <button @click.stop="remove(d.id)" class="px-2 py-1 text-[11px] text-neutral-400 hover:text-danger transition-colors" title="Eliminar">Eliminar</button>
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
        <AppButton @click="previewDoc && editDoc(previewDoc.id)">Editar</AppButton>
      </div>
    </AppModal>
  </div>
</template>
