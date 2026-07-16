<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
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

const docTypes = [
  { value: 'invoice', label: 'Factura' },
  { value: 'delivery-note', label: 'Nota de Remisión' },
  { value: 'quote', label: 'Cotización' },
]
const styles = [
  { value: 'classic', label: 'Clásico' },
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
})

const saving = ref(false)

async function save() {
  saving.value = true
  try {
    const data = editor.toJSON()
    await documents.saveDoc(data)
    toast.show('Documento guardado', 'success')
    router.push('/')
  } catch (e) {
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
</script>

<template>
  <div class="editor-view h-full flex flex-col overflow-hidden">
    <!-- Top bar -->
    <div class="neu-raised flex flex-wrap items-center gap-3 px-3 py-3 rounded-t-3xl shrink-0 no-print sm:px-4">
      <button @click="router.push('/')" class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium hover:bg-surface-hover transition-colors" style="color: #475569;">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
      </button>

      <!-- Doc type + number -->
      <div class="flex items-center gap-2">
        <select :value="editor.doc.type" @change="editor.doc.type = ($event.target as HTMLSelectElement).value as DocumentType" class="px-3 py-1.5 text-sm font-medium rounded-lg border border-border bg-surface text-text outline-none cursor-pointer">
          <option v-for="t in docTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
        </select>
        <div class="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-border bg-bg">
          <span class="text-sm font-mono font-semibold" style="color: #0f172a;">{{ editor.doc.number }}</span>
        </div>
      </div>

      <div class="hidden flex-1 sm:block" />

      <!-- Actions -->
      <div class="ml-auto flex items-center gap-2">
        <button @click="save" :disabled="saving" class="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-accent hover:bg-accent-hover transition-all disabled:opacity-50">
          {{ saving ? 'Guardando...' : 'Guardar' }}
        </button>
        <button @click="printDocument(editor.doc.paperSize)" class="px-4 py-2 text-sm font-medium rounded-lg border border-border text-text-secondary hover:bg-surface-hover transition-all">
          Imprimir
        </button>
        <button @click="exportPdf" :disabled="exporting" class="px-4 py-2 text-sm font-medium rounded-lg border border-border text-text-secondary hover:bg-surface-hover transition-all disabled:opacity-50">
          {{ exporting ? 'Generando…' : 'Descargar PDF' }}
        </button>
        <button aria-label="Más acciones" class="neu-control w-8 h-8 flex items-center justify-center rounded-xl text-text-muted">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
        </button>
      </div>
    </div>

    <!-- Canvas -->
    <div class="editor-canvas flex-1 flex flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
      <!-- Left panels -->
      <div class="neu-raised order-1 mx-3 mt-3 max-h-52 overflow-y-auto rounded-2xl no-print lg:order-none lg:mb-3 lg:mr-0 lg:w-72 lg:shrink-0 lg:max-h-none">
        <!-- Sections list -->
        <div class="grid grid-cols-2 gap-1 p-2 sm:grid-cols-3 lg:block lg:space-y-1">
          <button v-for="sec in [
            { id: 'appearance', label: 'Apariencia', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 112.828 2.828L7.343 15.657' },
            { id: 'client', label: 'Cliente', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
            { id: 'items', label: 'Conceptos', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { id: 'sections', label: 'Secciones', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
            { id: 'conditions', label: 'Condiciones', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
            { id: 'notes', label: 'Notas', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
            { id: 'signatures', label: 'Firmas', icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' },
          ]" :key="sec.id" @click="togglePanel(sec.id)" :class="['w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left', activePanel === sec.id ? 'bg-accent-light text-accent' : 'text-text-secondary hover:bg-surface-hover hover:text-text']">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" :d="sec.icon" /></svg>
            {{ sec.label }}
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="ml-auto transition-transform" :class="activePanel === sec.id ? 'rotate-180' : ''" style="color: #94a3b8;"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
        </div>
      </div>

      <!-- Center: Doc preview -->
      <div class="print-stage order-3 flex-1 overflow-y-auto p-3 sm:p-6 lg:order-none">
        <div class="print-frame max-w-[700px] mx-auto">
          <div class="print-sheet bg-white rounded-2xl overflow-hidden shadow-[10px_10px_22px_#c1c9d4,-10px_-10px_22px_#fff]">
            <PrintPreview :doc="editor.doc" :sections="settings.sections" />
          </div>
          <div class="mt-4 flex flex-wrap justify-center gap-2 no-print">
            <button @click="printDocument(editor.doc.paperSize)" class="neu-control flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl text-text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9V3h12v6M6 9h12M6 9H4a2 2 0 00-2 2v6h4v4h12v-4h4v-6a2 2 0 00-2-2h-2M6 15h12" /></svg>
              Imprimir
            </button>
            <button @click="exportPdf" :disabled="exporting" class="neu-control flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl text-text-secondary disabled:opacity-50">
              {{ exporting ? 'Generando…' : 'Descargar PDF' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Right: Edit panel -->
      <div class="neu-raised order-2 mx-3 mt-3 rounded-2xl p-4 no-print lg:order-none lg:my-3 lg:ml-0 lg:w-80 lg:shrink-0 lg:overflow-y-auto">
        <!-- Appearance -->
        <div v-if="activePanel === 'appearance'" class="space-y-4">
          <h3 class="text-sm font-semibold" style="color: #0f172a;">Apariencia</h3>
          <div>
            <label class="block text-xs font-medium mb-1.5" style="color: #475569;">Plantilla</label>
            <select :value="editor.doc.style" @change="editor.doc.style = ($event.target as HTMLSelectElement).value as TemplateStyle" class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text outline-none cursor-pointer">
              <option v-for="s in styles" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium mb-1.5" style="color: #475569;">Color</label>
            <div class="flex gap-2">
              <button v-for="c in ['#1e3a5f','#16a34a','#dc2626','#d97706','#8b5cf6']" :key="c" @click="editor.doc.styleConfig.accentColor = c" :class="['w-7 h-7 rounded-full border-2 transition-all', editor.doc.styleConfig.accentColor === c ? 'border-text scale-110' : 'border-transparent hover:scale-105']" :style="{ backgroundColor: c }" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium mb-1.5" style="color: #475569;">Tipografía</label>
              <select :value="editor.doc.styleConfig.fontFamily" @change="editor.doc.styleConfig.fontFamily = ($event.target as HTMLSelectElement).value as DocFontFamily" class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text outline-none cursor-pointer">
                <option value="classic-serif">Clásica</option>
                <option value="modern-sans">Moderna</option>
                <option value="minimal-sans">Minimal</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium mb-1.5" style="color: #475569;">Logo</label>
              <select :value="editor.doc.styleConfig.logoPosition" @change="editor.doc.styleConfig.logoPosition = ($event.target as HTMLSelectElement).value as LogoPosition" class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text outline-none cursor-pointer">
                <option value="left">Izquierda</option>
                <option value="center">Centro</option>
                <option value="right">Derecha</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium mb-1.5" style="color: #475569;">Papel</label>
              <select :value="editor.doc.paperSize" @change="editor.doc.paperSize = ($event.target as HTMLSelectElement).value as PaperSize" class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text outline-none cursor-pointer">
                <option v-for="p in paperSizes" :key="p.value" :value="p.value">{{ p.label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium mb-1.5" style="color: #475569;">Moneda</label>
              <select :value="editor.doc.styleConfig.currencySymbol" @change="editor.doc.styleConfig.currencySymbol = ($event.target as HTMLSelectElement).value" class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text outline-none cursor-pointer">
                <option value="$">$</option>
                <option value="US$">US$</option>
                <option value="€">€</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium mb-1.5" style="color: #475569;">Fecha</label>
            <input :value="editor.doc.date" @input="editor.doc.date = ($event.target as HTMLInputElement).value" type="date" class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/10" />
          </div>
        </div>

        <!-- Client -->
        <div v-if="activePanel === 'client'" class="space-y-4">
          <h3 class="text-sm font-semibold" style="color: #0f172a;">Cliente</h3>
          <ClientSection :client="editor.doc.client" @update="onClientUpdate" />
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" :checked="settings.sections.find(s => s.id === 'client')?.enabled" @change="settings.toggleSection('client')" class="w-3.5 h-3.5 rounded border-border text-accent focus:ring-accent/20" />
            <span class="text-xs font-medium" style="color: #475569;">Mostrar sección</span>
          </label>
        </div>

        <!-- Items -->
        <div v-if="activePanel === 'items'" class="space-y-4">
          <h3 class="text-sm font-semibold" style="color: #0f172a;">Conceptos</h3>
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
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" :checked="settings.sections.find(s => s.id === 'items')?.enabled" @change="settings.toggleSection('items')" class="w-3.5 h-3.5 rounded border-border text-accent focus:ring-accent/20" />
            <span class="text-xs font-medium" style="color: #475569;">Mostrar sección</span>
          </label>
        </div>

        <!-- Sections -->
        <div v-if="activePanel === 'sections'" class="space-y-4">
          <h3 class="text-sm font-semibold" style="color: #0f172a;">Secciones</h3>
          <div class="space-y-2">
            <label v-for="sec in [
              { id: 'payment-terms', label: 'Condiciones de pago' },
              { id: 'bank-info', label: 'Datos bancarios' },
              { id: 'notes', label: 'Notas' },
              { id: 'signature-client', label: 'Firma cliente' },
              { id: 'signature-company', label: 'Firma empresa' },
              { id: 'totals', label: 'Totales' },
              { id: 'company', label: 'Empresa' },
            ]" :key="sec.id" class="flex items-center gap-2 cursor-pointer py-1">
              <input type="checkbox" :checked="settings.sections.find(s => s.id === sec.id)?.enabled" @change="settings.toggleSection(sec.id)" class="w-3.5 h-3.5 rounded border-border text-accent focus:ring-accent/20" />
              <span class="text-xs font-medium" style="color: #475569;">{{ sec.label }}</span>
            </label>
          </div>
        </div>

        <!-- Conditions -->
        <div v-if="activePanel === 'conditions'" class="space-y-4">
          <h3 class="text-sm font-semibold" style="color: #0f172a;">Condiciones</h3>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium" style="color: #475569;">Condiciones de pago</label>
            <textarea :value="editor.doc.paymentTerms" @input="editor.doc.paymentTerms = ($event.target as HTMLTextAreaElement).value" class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 resize-none" rows="2" placeholder="Crédito a 30 días" />
          </div>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" :checked="settings.sections.find(s => s.id === 'payment-terms')?.enabled" @change="settings.toggleSection('payment-terms')" class="w-3.5 h-3.5 rounded border-border text-accent focus:ring-accent/20" />
            <span class="text-xs font-medium" style="color: #475569;">Mostrar sección</span>
          </label>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium" style="color: #475569;">Datos bancarios</label>
            <textarea :value="editor.doc.bankInfo" @input="editor.doc.bankInfo = ($event.target as HTMLTextAreaElement).value" class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 resize-none" rows="2" placeholder="HSBC · 1234 5678 9012" />
          </div>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" :checked="settings.sections.find(s => s.id === 'bank-info')?.enabled" @change="settings.toggleSection('bank-info')" class="w-3.5 h-3.5 rounded border-border text-accent focus:ring-accent/20" />
            <span class="text-xs font-medium" style="color: #475569;">Mostrar sección</span>
          </label>
        </div>

        <!-- Notes -->
        <div v-if="activePanel === 'notes'" class="space-y-4">
          <h3 class="text-sm font-semibold" style="color: #0f172a;">Notas</h3>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium" style="color: #475569;">Notas</label>
            <textarea :value="editor.doc.notes" @input="editor.doc.notes = ($event.target as HTMLTextAreaElement).value" class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 resize-none" rows="3" placeholder="Gracias por su preferencia" />
          </div>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" :checked="settings.sections.find(s => s.id === 'notes')?.enabled" @change="settings.toggleSection('notes')" class="w-3.5 h-3.5 rounded border-border text-accent focus:ring-accent/20" />
            <span class="text-xs font-medium" style="color: #475569;">Mostrar sección</span>
          </label>
        </div>

        <!-- Signatures -->
        <div v-if="activePanel === 'signatures'" class="space-y-4">
          <h3 class="text-sm font-semibold" style="color: #0f172a;">Firmas</h3>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium" style="color: #475569;">Firma del cliente</label>
            <input :value="editor.doc.signatureClientLabel" @input="editor.doc.signatureClientLabel = ($event.target as HTMLInputElement).value" class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/10" placeholder="Firma" />
          </div>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" :checked="settings.sections.find(s => s.id === 'signature-client')?.enabled" @change="settings.toggleSection('signature-client')" class="w-3.5 h-3.5 rounded border-border text-accent focus:ring-accent/20" />
            <span class="text-xs font-medium" style="color: #475569;">Mostrar sección</span>
          </label>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium" style="color: #475569;">Firma de la empresa</label>
            <input :value="editor.doc.signatureCompanyLabel" @input="editor.doc.signatureCompanyLabel = ($event.target as HTMLInputElement).value" class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/10" placeholder="Firma" />
          </div>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" :checked="settings.sections.find(s => s.id === 'signature-company')?.enabled" @change="settings.toggleSection('signature-company')" class="w-3.5 h-3.5 rounded border-border text-accent focus:ring-accent/20" />
            <span class="text-xs font-medium" style="color: #475569;">Mostrar sección</span>
          </label>
        </div>

        <!-- Totals (always visible) -->
        <div v-if="activePanel === 'items' || activePanel === null" class="mt-4 pt-4 border-t border-border">
          <div class="space-y-1.5 text-sm">
            <div class="flex justify-between" style="color: #475569;">
              <span>Subtotal</span>
              <span class="font-medium tabular-nums">{{ editor.doc.styleConfig.currencySymbol }}{{ editor.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 }) }}</span>
            </div>
            <div class="flex justify-between" style="color: #475569;">
              <span>IVA</span>
              <span class="font-medium tabular-nums">{{ editor.doc.styleConfig.currencySymbol }}{{ editor.taxAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 }) }}</span>
            </div>
            <div class="flex justify-between text-base font-bold pt-1.5 border-t border-border" style="color: #0f172a;">
              <span>Total</span>
              <span class="tabular-nums">{{ editor.doc.styleConfig.currencySymbol }}{{ editor.total.toLocaleString('es-MX', { minimumFractionDigits: 2 }) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
