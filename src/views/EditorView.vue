<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEditorStore } from '@/stores/editor'
import { useDocumentsStore } from '@/stores/documents'
import { useSettingsStore } from '@/stores/settings'
import { usePrint } from '@/composables/usePrint'
import { useToast } from '@/composables/useToast'
import ClientSection from '@/components/editor/ClientSection.vue'
import LinesTable from '@/components/editor/LinesTable.vue'
import PrintPreview from '@/components/preview/PrintPreview.vue'
import type { DocumentType, ClientData, LineItem, TemplateStyle, PaperSize, DocFontFamily, LogoPosition } from '@/types/document'

const route = useRoute()
const router = useRouter()
const editor = useEditorStore()
const documents = useDocumentsStore()
const settings = useSettingsStore()
const { printDocument, downloadPdf } = usePrint()
const toast = useToast()

const activePanel = ref<string | null>('client')
const exporting = ref(false)
const saving = ref(false)
const saveState = ref<'saved' | 'dirty' | 'saving' | 'error'>('saved')
const initializing = ref(true)
const showAdvanced = ref(false)

const docTypes = [
  { value: 'invoice', label: 'Factura' },
  { value: 'delivery-note', label: 'Nota de Remision' },
  { value: 'quote', label: 'Cotizacion' },
]
const styles = [
  { value: 'classic', label: 'Clasico' },
  { value: 'modern', label: 'Moderno' },
  { value: 'minimal', label: 'Minimalista' },
]
const paperSizes = [
  { value: 'letter', label: 'Carta' },
  { value: 'a4', label: 'A4' },
]

onMounted(async () => {
  await documents.loadAll()
  const id = route.params.id as string
  if (id) {
    const existing = documents.getById(id)
    if (existing) editor.loadDoc(existing)
  } else {
    editor.generateNumber(editor.doc.type)
  }
  await nextTick()
  initializing.value = false
})

async function save() {
  saving.value = true
  saveState.value = 'saving'
  try {
    const data = editor.toJSON()
    await documents.saveDoc(data)
    toast.show('Documento guardado localmente', 'success')
    saveState.value = 'saved'
  } catch (e) {
    saveState.value = 'error'
    toast.show((e as Error).message || 'Error al guardar', 'error')
  } finally {
    saving.value = false
  }
}

async function exportPdf() {
  const page = document.querySelector<HTMLElement>('.print-sheet .document-page')
  if (!page) return
  exporting.value = true
  try {
    await downloadPdf(page, editor.doc.paperSize, editor.doc.number)
    toast.show('PDF descargado', 'success')
  } catch (error) {
    toast.show((error as Error).message || 'No se pudo generar el PDF', 'error')
  } finally {
    exporting.value = false
  }
}

function onClientUpdate(field: keyof ClientData, value: string) {
  editor.doc.client[field] = value
}

function onLineUpdate(id: string, field: keyof LineItem, value: string | number) {
  const item = editor.doc.items.find(i => i.id === id)
  if (!item) return
  if (field === 'quantity' || field === 'unitPrice' || field === 'taxRate') item[field] = Number(value)
  else item[field] = value as string
}

function togglePanel(id: string) {
  activePanel.value = activePanel.value === id ? null : id
}

watch(() => editor.doc.type, (t) => editor.generateNumber(t))
watch(() => editor.doc, () => {
  if (!initializing.value && !saving.value) saveState.value = 'dirty'
}, { deep: true })
</script>

<template>
  <div class="editor-view h-full flex flex-col overflow-hidden bg-bg">
    <h1 class="sr-only">Editar {{ editor.doc.type }} {{ editor.doc.number }}</h1>
    <!-- Top Bar -->
    <div class="bg-surface mx-3 mt-3 rounded-full flex flex-wrap items-center gap-2 pl-2 pr-2.5 py-2 shrink-0 no-print sm:mx-4 shadow-[0_12px_32px_rgba(20,20,20,0.10)]">
      <button @click="router.push('/')" aria-label="Volver al inicio" class="h-9 pl-3 pr-4 rounded-full bg-surface-hover flex items-center gap-1 text-xs font-bold text-text-secondary hover:text-text">
        ‹ Volver
      </button>

      <div class="flex items-center gap-2">
        <select aria-label="Tipo de documento" :value="editor.doc.type" @change="editor.doc.type = ($event.target as HTMLSelectElement).value as DocumentType" class="pl-4 pr-8 py-2 text-xs font-bold rounded-full bg-surface-hover !border-transparent text-text cursor-pointer appearance-none">
          <option v-for="t in docTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
        </select>
        <div class="hidden sm:flex items-center px-3 py-2 rounded-full bg-surface-hover">
          <span class="text-[11px] font-mono font-bold text-text">{{ editor.doc.number }}</span>
        </div>
      </div>

      <div class="hidden flex-1 sm:block" />

      <div class="ml-auto flex items-center gap-2">
        <button @click="save" :disabled="saving" class="px-5 py-2.5 text-xs font-bold rounded-full bg-text text-white shadow-[0_8px_20px_rgba(20,20,20,0.18)] disabled:opacity-40">
          {{ saving ? '···' : 'Guardar' }}
        </button>
        <button @click="printDocument(editor.doc.paperSize)" class="px-4 py-2.5 text-xs font-bold rounded-full bg-surface-hover text-text-secondary hover:text-text" aria-label="Imprimir documento">⎙ Imprimir</button>
        <button @click="exportPdf" :disabled="exporting" class="px-4 py-2.5 text-xs font-bold rounded-full bg-surface-hover text-text-secondary hover:text-text disabled:opacity-40">
          {{ exporting ? '···' : 'PDF' }}
        </button>
      </div>
    </div>

    <!-- Canvas -->
    <div class="editor-canvas flex-1 flex flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
      <!-- Left: Section Panels -->
      <div class="editor-panel-left phone-card order-1 mx-3 mt-3 max-h-52 overflow-y-auto no-print lg:order-none lg:mb-3 lg:mr-0 lg:w-60 lg:shrink-0 lg:max-h-none">
        <div class="grid grid-cols-2 gap-1 p-2.5 sm:grid-cols-3 lg:block lg:space-y-1">
          <template v-for="sec in [
            { id: 'appearance', label: 'Apariencia', n: '01' },
            { id: 'client', label: 'Cliente', n: '02' },
            { id: 'items', label: 'Conceptos', n: '03' },
            { id: 'sections', label: 'Secciones', n: '04' },
            { id: 'conditions', label: 'Condiciones', n: '05' },
            { id: 'notes', label: 'Notas', n: '06' },
            { id: 'signatures', label: 'Firmas', n: '07' },
           ]" :key="sec.id">
           <button v-if="showAdvanced || ['client', 'items'].includes(sec.id)" @click="togglePanel(sec.id)" :class="[
            'w-full flex items-center gap-2.5 px-4 py-2.5 rounded-full text-[13px] transition-colors text-left',
            activePanel === sec.id ? 'bg-text text-white font-bold shadow-[0_8px_20px_rgba(20,20,20,0.18)]' : 'font-normal text-text-secondary hover:text-text hover:bg-surface-hover',
          ]">
            <span class="text-[10px] font-mono opacity-50">{{ sec.n }}</span>
            {{ sec.label }}
            <span class="ml-auto text-[10px] transition-transform" :class="activePanel === sec.id ? 'rotate-180' : ''">∨</span>
           </button>
          </template>
          <button @click="showAdvanced = !showAdvanced" :aria-expanded="showAdvanced" class="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded text-[12px] font-semibold text-text-muted hover:text-text transition-colors">
            <span>{{ showAdvanced ? '— Ocultar' : '— Más opciones' }}</span>
          </button>
        </div>
      </div>

      <!-- Center: Document Preview -->
      <div class="print-stage order-3 flex-1 overflow-y-auto p-3 sm:p-6 lg:order-none bg-bg">
        <div class="print-frame max-w-[700px] mx-auto">
          <p class="text-center text-[11px] text-text-muted mb-3 no-print">Vista previa — así saldrá en papel o PDF. Se guarda en tu equipo.</p>
          <div class="print-sheet phone-card overflow-hidden">
            <PrintPreview :doc="editor.doc" :sections="settings.sections" />
          </div>
          <div class="mt-5 flex flex-wrap justify-center items-center gap-2 no-print">
            <button @click="printDocument(editor.doc.paperSize)" class="px-6 py-3 text-xs font-bold rounded-full bg-surface text-text shadow-[0_2px_8px_rgba(20,20,20,0.06)]" aria-label="Imprimir documento">⎙ Imprimir</button>
            <button @click="exportPdf" :disabled="exporting" class="px-6 py-3 text-xs font-bold rounded-full bg-text text-white shadow-[0_8px_20px_rgba(20,20,20,0.18)] disabled:opacity-40">
              {{ exporting ? '···' : 'Descargar PDF →' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Right: Edit Panel -->
      <div class="editor-panel-right phone-card order-2 mx-3 mt-3 p-5 no-print lg:order-none lg:my-3 lg:ml-0 lg:w-80 lg:shrink-0 lg:overflow-y-auto">
        <!-- Appearance -->
        <div v-if="activePanel === 'appearance'" class="panel-content space-y-5">
          <div><p class="eyebrow mb-1">01 — apariencia</p><h3 class="text-sm font-bold text-text">Plantilla y papel</h3><p class="text-xs text-text-muted mt-1">Elige cómo se verá impreso. Lo digital no cambia.</p></div>
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">Plantilla</label>
            <select aria-label="Plantilla del documento" :value="editor.doc.style" @change="editor.doc.style = ($event.target as HTMLSelectElement).value as TemplateStyle" class="w-full px-3 py-2.5 text-sm rounded border border-border bg-surface text-text cursor-pointer appearance-none">
              <option v-for="s in styles" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">Color</label>
            <div class="flex gap-2">
              <button v-for="c in [{ value: '#0A0A0A', label: 'Tinta' }, { value: '#173b78', label: 'Azul clásico' }, { value: '#2f8f43', label: 'Verde' }, { value: '#8A6D00', label: 'Ocre' }, { value: '#6B7280', label: 'Gris' }]" :key="c.value" @click="editor.doc.styleConfig.accentColor = c.value" :title="c.label" :aria-label="`Usar color ${c.label}`" :aria-pressed="editor.doc.styleConfig.accentColor === c.value" :class="['w-8 h-8 rounded-full border-2 transition-colors', editor.doc.styleConfig.accentColor === c.value ? 'border-text' : 'border-transparent hover:border-text']" :style="{ backgroundColor: c.value }" />
            </div>
            <p class="text-[11px] text-text-muted mt-2">En uso: {{ ({'#0A0A0A':'Tinta','#173b78':'Azul clásico','#2f8f43':'Verde','#8A6D00':'Ocre','#6B7280':'Gris'})[editor.doc.styleConfig.accentColor] ?? 'Personalizado' }}</p>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">Tipografia</label>
              <select aria-label="Tipografía del documento" :value="editor.doc.styleConfig.fontFamily" @change="editor.doc.styleConfig.fontFamily = ($event.target as HTMLSelectElement).value as DocFontFamily" class="w-full px-3 py-2.5 text-sm rounded border border-border bg-surface text-text cursor-pointer appearance-none">
                <option value="classic-serif">Clasica</option>
                <option value="modern-sans">Moderna</option>
                <option value="minimal-sans">Minimal</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">Logo</label>
              <select aria-label="Posición del logo" :value="editor.doc.styleConfig.logoPosition" @change="editor.doc.styleConfig.logoPosition = ($event.target as HTMLSelectElement).value as LogoPosition" class="w-full px-3 py-2.5 text-sm rounded border border-border bg-surface text-text cursor-pointer appearance-none">
                <option value="left">Izquierda</option>
                <option value="center">Centro</option>
                <option value="right">Derecha</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">Papel</label>
              <select aria-label="Tamaño de papel" :value="editor.doc.paperSize" @change="editor.doc.paperSize = ($event.target as HTMLSelectElement).value as PaperSize" class="w-full px-3 py-2.5 text-sm rounded border border-border bg-surface text-text cursor-pointer appearance-none">
                <option v-for="p in paperSizes" :key="p.value" :value="p.value">{{ p.label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">Moneda</label>
              <select aria-label="Moneda del documento" :value="editor.doc.styleConfig.currencySymbol" @change="editor.doc.styleConfig.currencySymbol = ($event.target as HTMLSelectElement).value" class="w-full px-3 py-2.5 text-sm rounded border border-border bg-surface text-text cursor-pointer appearance-none">
                <option value="$">$</option>
                <option value="US$">US$</option>
                <option value="&#8364;">&#8364;</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">Fecha</label>
            <input aria-label="Fecha del documento" :value="editor.doc.date" @input="editor.doc.date = ($event.target as HTMLInputElement).value" type="date" class="w-full px-3 py-2.5 text-sm rounded border border-border bg-surface text-text" />
          </div>
        </div>

        <!-- Client -->
        <div v-if="activePanel === 'client'" class="panel-content space-y-5">
          <h3 class="text-sm font-bold text-text">Cliente</h3>
          <p class="text-xs text-text-muted -mt-3">Quien recibe el documento. Aparece como receptor en la impresión.</p>
          <ClientSection :client="editor.doc.client" @update="onClientUpdate" />
          <label class="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" :checked="settings.sections.find(s => s.id === 'client')?.enabled" @change="settings.toggleSection('client')" class="w-3.5 h-3.5 rounded border-black/15 text-accent focus:ring-accent/20" />
            <span class="text-[11px] font-semibold text-text-muted">Mostrar seccion</span>
          </label>
        </div>

        <!-- Items -->
        <div v-if="activePanel === 'items'" class="panel-content space-y-5">
          <h3 class="text-sm font-bold text-text">Conceptos</h3>
          <p class="text-xs text-text-muted -mt-3">Cada línea calcula importe e IVA. El total se actualiza solo.</p>
          <LinesTable
            :items="editor.doc.items"
            :subtotal="editor.subtotal"
            :taxAmount="editor.taxAmount"
            :total="editor.total"
            :currencySymbol="editor.doc.styleConfig.currencySymbol"
            @add="editor.addItem()"
            @remove="editor.removeItem($event)"
            @update="onLineUpdate"
          />
          <label class="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" :checked="settings.sections.find(s => s.id === 'items')?.enabled" @change="settings.toggleSection('items')" class="w-3.5 h-3.5 rounded border-black/15 text-accent focus:ring-accent/20" />
            <span class="text-[11px] font-semibold text-text-muted">Mostrar seccion</span>
          </label>
        </div>

        <!-- Sections -->
        <div v-if="activePanel === 'sections'" class="panel-content space-y-5">
          <h3 class="text-sm font-bold text-text">Secciones</h3>
          <p class="text-xs text-text-muted -mt-3">Marca lo que sale impreso. Ocultar no borra tus datos.</p>
          <div class="space-y-2.5">
            <label v-for="sec in [
              { id: 'payment-terms', label: 'Condiciones de pago' },
              { id: 'bank-info', label: 'Datos bancarios' },
              { id: 'notes', label: 'Notas' },
              { id: 'signature-client', label: 'Firma cliente' },
              { id: 'signature-company', label: 'Firma empresa' },
              { id: 'totals', label: 'Totales' },
              { id: 'company', label: 'Empresa' },
            ]" :key="sec.id" class="flex items-center gap-2.5 cursor-pointer py-1">
              <input type="checkbox" :checked="settings.sections.find(s => s.id === sec.id)?.enabled" @change="settings.toggleSection(sec.id)" class="w-3.5 h-3.5 rounded border-black/15 text-accent focus:ring-accent/20" />
              <span class="text-xs font-semibold text-text-secondary">{{ sec.label }}</span>
            </label>
          </div>
        </div>

        <!-- Conditions -->
        <div v-if="activePanel === 'conditions'" class="panel-content space-y-5">
          <h3 class="text-sm font-bold text-text">Condiciones</h3>
          <p class="text-xs text-text-muted -mt-3">Cómo te pagan y a dónde. Ej.: crédito a 30 días.</p>
          <div class="flex flex-col gap-2">
            <label class="text-[11px] font-bold uppercase tracking-wider text-text-muted">Condiciones de pago</label>
            <textarea aria-label="Condiciones de pago" :value="editor.doc.paymentTerms" @input="editor.doc.paymentTerms = ($event.target as HTMLTextAreaElement).value" class="w-full px-3 py-2.5 text-sm rounded border border-border bg-surface text-text resize-none" rows="2" placeholder="Credito a 30 dias" />
          </div>
          <label class="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" :checked="settings.sections.find(s => s.id === 'payment-terms')?.enabled" @change="settings.toggleSection('payment-terms')" class="w-3.5 h-3.5 rounded border-black/15 text-accent focus:ring-accent/20" />
            <span class="text-[11px] font-semibold text-text-muted">Mostrar seccion</span>
          </label>
          <div class="flex flex-col gap-2">
            <label class="text-[11px] font-bold uppercase tracking-wider text-text-muted">Datos bancarios</label>
            <textarea aria-label="Datos bancarios" :value="editor.doc.bankInfo" @input="editor.doc.bankInfo = ($event.target as HTMLTextAreaElement).value" class="w-full px-3 py-2.5 text-sm rounded border border-border bg-surface text-text resize-none" rows="2" placeholder="HSBC - 1234 5678 9012" />
          </div>
          <label class="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" :checked="settings.sections.find(s => s.id === 'bank-info')?.enabled" @change="settings.toggleSection('bank-info')" class="w-3.5 h-3.5 rounded border-black/15 text-accent focus:ring-accent/20" />
            <span class="text-[11px] font-semibold text-text-muted">Mostrar seccion</span>
          </label>
        </div>

        <!-- Notes -->
        <div v-if="activePanel === 'notes'" class="panel-content space-y-5">
          <h3 class="text-sm font-bold text-text">Notas</h3>
          <p class="text-xs text-text-muted -mt-3">Mensaje libre al final. Ej.: gracias por su preferencia.</p>
          <div class="flex flex-col gap-2">
            <label class="text-[11px] font-bold uppercase tracking-wider text-text-muted">Notas</label>
            <textarea aria-label="Notas del documento" :value="editor.doc.notes" @input="editor.doc.notes = ($event.target as HTMLTextAreaElement).value" class="w-full px-3 py-2.5 text-sm rounded border border-border bg-surface text-text resize-none" rows="3" placeholder="Gracias por su preferencia" />
          </div>
          <label class="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" :checked="settings.sections.find(s => s.id === 'notes')?.enabled" @change="settings.toggleSection('notes')" class="w-3.5 h-3.5 rounded border-black/15 text-accent focus:ring-accent/20" />
            <span class="text-[11px] font-semibold text-text-muted">Mostrar seccion</span>
          </label>
        </div>

        <!-- Signatures -->
        <div v-if="activePanel === 'signatures'" class="panel-content space-y-5">
          <h3 class="text-sm font-bold text-text">Firmas</h3>
          <p class="text-xs text-text-muted -mt-3">Textos bajo las líneas de firma en el papel.</p>
          <div class="flex flex-col gap-2">
            <label class="text-[11px] font-bold uppercase tracking-wider text-text-muted">Firma del cliente</label>
            <input aria-label="Etiqueta de firma del cliente" :value="editor.doc.signatureClientLabel" @input="editor.doc.signatureClientLabel = ($event.target as HTMLInputElement).value" class="w-full px-3 py-2.5 text-sm rounded border border-border bg-surface text-text" placeholder="Firma" />
          </div>
          <label class="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" :checked="settings.sections.find(s => s.id === 'signature-client')?.enabled" @change="settings.toggleSection('signature-client')" class="w-3.5 h-3.5 rounded border-black/15 text-accent focus:ring-accent/20" />
            <span class="text-[11px] font-semibold text-text-muted">Mostrar seccion</span>
          </label>
          <div class="flex flex-col gap-2">
            <label class="text-[11px] font-bold uppercase tracking-wider text-text-muted">Firma de la empresa</label>
            <input aria-label="Etiqueta de firma de la empresa" :value="editor.doc.signatureCompanyLabel" @input="editor.doc.signatureCompanyLabel = ($event.target as HTMLInputElement).value" class="w-full px-3 py-2.5 text-sm rounded border border-border bg-surface text-text" placeholder="Firma" />
          </div>
          <label class="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" :checked="settings.sections.find(s => s.id === 'signature-company')?.enabled" @change="settings.toggleSection('signature-company')" class="w-3.5 h-3.5 rounded border-black/15 text-accent focus:ring-accent/20" />
            <span class="text-[11px] font-semibold text-text-muted">Mostrar seccion</span>
          </label>
        </div>

        <!-- Totals -->
        <div v-if="activePanel === 'items' || activePanel === null" class="mt-5 pt-5 border-t border-black/[0.04]">
          <div class="space-y-2.5 text-sm">
            <div class="flex justify-between text-text-secondary">
              <span>Subtotal</span>
              <span class="font-semibold tabular-nums">{{ editor.doc.styleConfig.currencySymbol }}{{ editor.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 }) }}</span>
            </div>
            <div class="flex justify-between text-text-secondary">
              <span>IVA</span>
              <span class="font-semibold tabular-nums">{{ editor.doc.styleConfig.currencySymbol }}{{ editor.taxAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 }) }}</span>
            </div>
            <div class="flex justify-between text-base font-extrabold text-text pt-2.5 border-t border-black/[0.04]">
              <span>Total</span>
              <span class="tabular-nums">{{ editor.doc.styleConfig.currencySymbol }}{{ editor.total.toLocaleString('es-MX', { minimumFractionDigits: 2 }) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
