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
import gsap from 'gsap'

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
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  gsap.fromTo('.editor-panel-left', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' })
  gsap.fromTo('.editor-panel-center', { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out', delay: 0.1 })
  gsap.fromTo('.editor-panel-right', { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out', delay: 0.15 })
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
  const wasOpen = activePanel.value === id
  activePanel.value = wasOpen ? null : id
  if (!wasOpen && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    nextTick(() => {
      gsap.fromTo('.panel-content', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' })
    })
  }
}

watch(() => editor.doc.type, (t) => editor.generateNumber(t))
watch(() => editor.doc, () => {
  if (!initializing.value && !saving.value) saveState.value = 'dirty'
}, { deep: true })
</script>

<template>
  <div class="editor-view h-full flex flex-col overflow-hidden">
    <!-- Top Bar -->
    <div class="glass-raised flex flex-wrap items-center gap-3 px-4 py-3 shrink-0 no-print sm:px-5 border-b border-black/[0.04]">
      <button @click="router.push('/')" aria-label="Volver al dashboard" class="glass-control flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
      </button>

      <div class="flex items-center gap-2">
        <select aria-label="Tipo de documento" :value="editor.doc.type" @change="editor.doc.type = ($event.target as HTMLSelectElement).value as DocumentType" class="px-3 py-2 text-sm font-semibold rounded-xl glass-control text-text cursor-pointer appearance-none">
          <option v-for="t in docTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
        </select>
        <div class="flex items-center gap-1 px-3 py-2 rounded-xl bg-black/[0.03] border border-black/[0.04]">
          <span class="text-sm font-mono font-bold text-accent">{{ editor.doc.number }}</span>
        </div>
        <span :class="['hidden sm:inline text-[11px] font-semibold', saveState === 'error' ? 'text-danger' : saveState === 'dirty' ? 'text-warning' : 'text-success']">
          {{ saveState === 'saving' ? 'Guardando...' : saveState === 'dirty' ? 'Cambios sin guardar' : saveState === 'error' ? 'No se pudo guardar' : 'Guardado local' }}
        </span>
      </div>

      <div class="hidden flex-1 sm:block" />

      <div class="ml-auto flex items-center gap-2">
        <button @click="save" :disabled="saving" class="accent-glow px-5 py-2 text-sm font-bold text-white rounded-xl disabled:opacity-40">
          {{ saving ? 'Guardando...' : 'Guardar' }}
        </button>
        <button @click="printDocument(editor.doc.paperSize)" class="glass-control px-4 py-2 text-sm font-semibold rounded-xl text-text-secondary hover:text-text">
          Imprimir
        </button>
        <button @click="exportPdf" :disabled="exporting" class="glass-control px-4 py-2 text-sm font-semibold rounded-xl text-text-secondary hover:text-text disabled:opacity-40">
          {{ exporting ? 'Generando...' : 'Descargar PDF' }}
        </button>
      </div>
    </div>

    <!-- Canvas -->
    <div class="editor-canvas flex-1 flex flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
      <!-- Left: Section Panels -->
      <div class="editor-panel-left glass-raised order-1 mx-3 mt-3 max-h-52 overflow-y-auto rounded-2xl no-print lg:order-none lg:mb-3 lg:mr-0 lg:w-72 lg:shrink-0 lg:max-h-none">
        <div class="grid grid-cols-2 gap-1 p-2 sm:grid-cols-3 lg:block lg:space-y-0.5">
          <template v-for="sec in [
            { id: 'appearance', label: 'Apariencia', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 112.828 2.828L7.343 15.657' },
            { id: 'client', label: 'Cliente', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
            { id: 'items', label: 'Conceptos', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { id: 'sections', label: 'Secciones', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
            { id: 'conditions', label: 'Condiciones', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
            { id: 'notes', label: 'Notas', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
            { id: 'signatures', label: 'Firmas', icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' },
           ]" :key="sec.id">
           <button v-if="showAdvanced || ['client', 'items'].includes(sec.id)" @click="togglePanel(sec.id)" :class="[
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-left',
            activePanel === sec.id ? 'bg-accent/15 text-accent shadow-[0_0_15px_rgba(75,110,245,0.08)]' : 'text-text-secondary hover:text-text hover:bg-black/[0.03]',
          ]">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" :d="sec.icon" /></svg>
            {{ sec.label }}
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" class="ml-auto transition-transform duration-200 text-text-muted" :class="activePanel === sec.id ? 'rotate-180' : ''"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
           </button>
          </template>
          <button @click="showAdvanced = !showAdvanced" :aria-expanded="showAdvanced" class="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-text-muted hover:text-text hover:bg-black/[0.03] transition-colors">
            <span>{{ showAdvanced ? 'Ocultar opciones' : 'Más opciones' }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" :class="showAdvanced ? 'rotate-180' : ''" class="transition-transform"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
        </div>
      </div>

      <!-- Center: Document Preview -->
      <div class="print-stage order-3 flex-1 overflow-y-auto p-3 sm:p-6 lg:order-none">
        <div class="print-frame max-w-[700px] mx-auto">
          <div class="print-sheet bg-white rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
            <PrintPreview :doc="editor.doc" :sections="settings.sections" />
          </div>
          <div class="mt-5 flex flex-wrap justify-center gap-2 no-print">
            <button @click="printDocument(editor.doc.paperSize)" class="glass-control flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-text-secondary hover:text-text">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9V3h12v6M6 9h12M6 9H4a2 2 0 00-2 2v6h4v4h12v-4h4v-6a2 2 0 00-2-2h-2M6 15h12" /></svg>
              Imprimir
            </button>
            <button @click="exportPdf" :disabled="exporting" class="glass-control flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-text-secondary hover:text-text disabled:opacity-40">
              {{ exporting ? 'Generando...' : 'Descargar PDF' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Right: Edit Panel -->
      <div class="editor-panel-right glass-raised order-2 mx-3 mt-3 rounded-2xl p-5 no-print lg:order-none lg:my-3 lg:ml-0 lg:w-80 lg:shrink-0 lg:overflow-y-auto">
        <!-- Appearance -->
        <div v-if="activePanel === 'appearance'" class="panel-content space-y-5">
          <h3 class="text-sm font-bold text-text">Apariencia</h3>
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">Plantilla</label>
            <select aria-label="Plantilla del documento" :value="editor.doc.style" @change="editor.doc.style = ($event.target as HTMLSelectElement).value as TemplateStyle" class="w-full px-3 py-2.5 text-sm rounded-xl glass-control text-text cursor-pointer appearance-none">
              <option v-for="s in styles" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">Color</label>
            <div class="flex gap-2">
              <button v-for="c in [{ value: '#4b6ef5', label: 'Azul señal' }, { value: '#16a34a', label: 'Verde validación' }, { value: '#dc2626', label: 'Rojo alerta' }, { value: '#d97706', label: 'Ámbar atención' }, { value: '#7c3aed', label: 'Violeta auxiliar' }]" :key="c.value" @click="editor.doc.styleConfig.accentColor = c.value" :aria-label="`Usar ${c.label}`" :aria-pressed="editor.doc.styleConfig.accentColor === c.value" :class="['w-11 h-11 rounded-xl border-2 transition-all duration-200', editor.doc.styleConfig.accentColor === c.value ? 'border-black scale-105 shadow-lg' : 'border-transparent hover:scale-105 opacity-70 hover:opacity-100']" :style="{ backgroundColor: c.value }" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">Tipografia</label>
              <select aria-label="Tipografía del documento" :value="editor.doc.styleConfig.fontFamily" @change="editor.doc.styleConfig.fontFamily = ($event.target as HTMLSelectElement).value as DocFontFamily" class="w-full px-3 py-2.5 text-sm rounded-xl glass-control text-text cursor-pointer appearance-none">
                <option value="classic-serif">Clasica</option>
                <option value="modern-sans">Moderna</option>
                <option value="minimal-sans">Minimal</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">Logo</label>
              <select aria-label="Posición del logo" :value="editor.doc.styleConfig.logoPosition" @change="editor.doc.styleConfig.logoPosition = ($event.target as HTMLSelectElement).value as LogoPosition" class="w-full px-3 py-2.5 text-sm rounded-xl glass-control text-text cursor-pointer appearance-none">
                <option value="left">Izquierda</option>
                <option value="center">Centro</option>
                <option value="right">Derecha</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">Papel</label>
              <select aria-label="Tamaño de papel" :value="editor.doc.paperSize" @change="editor.doc.paperSize = ($event.target as HTMLSelectElement).value as PaperSize" class="w-full px-3 py-2.5 text-sm rounded-xl glass-control text-text cursor-pointer appearance-none">
                <option v-for="p in paperSizes" :key="p.value" :value="p.value">{{ p.label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">Moneda</label>
              <select aria-label="Moneda del documento" :value="editor.doc.styleConfig.currencySymbol" @change="editor.doc.styleConfig.currencySymbol = ($event.target as HTMLSelectElement).value" class="w-full px-3 py-2.5 text-sm rounded-xl glass-control text-text cursor-pointer appearance-none">
                <option value="$">$</option>
                <option value="US$">US$</option>
                <option value="&#8364;">&#8364;</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">Fecha</label>
            <input aria-label="Fecha del documento" :value="editor.doc.date" @input="editor.doc.date = ($event.target as HTMLInputElement).value" type="date" class="w-full px-3 py-2.5 text-sm rounded-xl glass-control text-text" />
          </div>
        </div>

        <!-- Client -->
        <div v-if="activePanel === 'client'" class="panel-content space-y-5">
          <h3 class="text-sm font-bold text-text">Cliente</h3>
          <ClientSection :client="editor.doc.client" @update="onClientUpdate" />
          <label class="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" :checked="settings.sections.find(s => s.id === 'client')?.enabled" @change="settings.toggleSection('client')" class="w-3.5 h-3.5 rounded border-black/15 text-accent focus:ring-accent/20" />
            <span class="text-[11px] font-semibold text-text-muted">Mostrar seccion</span>
          </label>
        </div>

        <!-- Items -->
        <div v-if="activePanel === 'items'" class="panel-content space-y-5">
          <h3 class="text-sm font-bold text-text">Conceptos</h3>
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
          <div class="flex flex-col gap-2">
            <label class="text-[11px] font-bold uppercase tracking-wider text-text-muted">Condiciones de pago</label>
            <textarea aria-label="Condiciones de pago" :value="editor.doc.paymentTerms" @input="editor.doc.paymentTerms = ($event.target as HTMLTextAreaElement).value" class="w-full px-3 py-2.5 text-sm rounded-xl glass-control text-text resize-none" rows="2" placeholder="Credito a 30 dias" />
          </div>
          <label class="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" :checked="settings.sections.find(s => s.id === 'payment-terms')?.enabled" @change="settings.toggleSection('payment-terms')" class="w-3.5 h-3.5 rounded border-black/15 text-accent focus:ring-accent/20" />
            <span class="text-[11px] font-semibold text-text-muted">Mostrar seccion</span>
          </label>
          <div class="flex flex-col gap-2">
            <label class="text-[11px] font-bold uppercase tracking-wider text-text-muted">Datos bancarios</label>
            <textarea aria-label="Datos bancarios" :value="editor.doc.bankInfo" @input="editor.doc.bankInfo = ($event.target as HTMLTextAreaElement).value" class="w-full px-3 py-2.5 text-sm rounded-xl glass-control text-text resize-none" rows="2" placeholder="HSBC - 1234 5678 9012" />
          </div>
          <label class="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" :checked="settings.sections.find(s => s.id === 'bank-info')?.enabled" @change="settings.toggleSection('bank-info')" class="w-3.5 h-3.5 rounded border-black/15 text-accent focus:ring-accent/20" />
            <span class="text-[11px] font-semibold text-text-muted">Mostrar seccion</span>
          </label>
        </div>

        <!-- Notes -->
        <div v-if="activePanel === 'notes'" class="panel-content space-y-5">
          <h3 class="text-sm font-bold text-text">Notas</h3>
          <div class="flex flex-col gap-2">
            <label class="text-[11px] font-bold uppercase tracking-wider text-text-muted">Notas</label>
            <textarea aria-label="Notas del documento" :value="editor.doc.notes" @input="editor.doc.notes = ($event.target as HTMLTextAreaElement).value" class="w-full px-3 py-2.5 text-sm rounded-xl glass-control text-text resize-none" rows="3" placeholder="Gracias por su preferencia" />
          </div>
          <label class="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" :checked="settings.sections.find(s => s.id === 'notes')?.enabled" @change="settings.toggleSection('notes')" class="w-3.5 h-3.5 rounded border-black/15 text-accent focus:ring-accent/20" />
            <span class="text-[11px] font-semibold text-text-muted">Mostrar seccion</span>
          </label>
        </div>

        <!-- Signatures -->
        <div v-if="activePanel === 'signatures'" class="panel-content space-y-5">
          <h3 class="text-sm font-bold text-text">Firmas</h3>
          <div class="flex flex-col gap-2">
            <label class="text-[11px] font-bold uppercase tracking-wider text-text-muted">Firma del cliente</label>
            <input aria-label="Etiqueta de firma del cliente" :value="editor.doc.signatureClientLabel" @input="editor.doc.signatureClientLabel = ($event.target as HTMLInputElement).value" class="w-full px-3 py-2.5 text-sm rounded-xl glass-control text-text" placeholder="Firma" />
          </div>
          <label class="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" :checked="settings.sections.find(s => s.id === 'signature-client')?.enabled" @change="settings.toggleSection('signature-client')" class="w-3.5 h-3.5 rounded border-black/15 text-accent focus:ring-accent/20" />
            <span class="text-[11px] font-semibold text-text-muted">Mostrar seccion</span>
          </label>
          <div class="flex flex-col gap-2">
            <label class="text-[11px] font-bold uppercase tracking-wider text-text-muted">Firma de la empresa</label>
            <input aria-label="Etiqueta de firma de la empresa" :value="editor.doc.signatureCompanyLabel" @input="editor.doc.signatureCompanyLabel = ($event.target as HTMLInputElement).value" class="w-full px-3 py-2.5 text-sm rounded-xl glass-control text-text" placeholder="Firma" />
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
