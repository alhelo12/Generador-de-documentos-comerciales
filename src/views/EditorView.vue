<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEditorStore } from '@/stores/editor'
import { useDocumentsStore } from '@/stores/documents'
import { useSettingsStore } from '@/stores/settings'
import { usePrint } from '@/composables/usePrint'
import { useToast } from '@/composables/useToast'
import ClientSection from '@/components/editor/ClientSection.vue'
import LinesTable from '@/components/editor/LinesTable.vue'
import PrintPreview from '@/components/preview/PrintPreview.vue'
import EditorProgress from '@/components/editor/EditorProgress.vue'
import EditorStepShell from '@/components/editor/EditorStepShell.vue'
import { editorSteps, type EditorStep } from '@/components/editor/editorFlow'
import type { ClientData, DocFontFamily, DocumentType, LineItem, LogoPosition, PaperSize, TemplateStyle } from '@/types/document'

const route = useRoute()
const router = useRouter()
const editor = useEditorStore()
const documents = useDocumentsStore()
const settings = useSettingsStore()
const { printDocument, downloadPdf } = usePrint()
const toast = useToast()

const currentStep = ref<EditorStep>('basics')
const exporting = ref(false)
const saving = ref(false)
const saveState = ref<'saved' | 'dirty' | 'saving' | 'error'>('saved')
const initializing = ref(true)

const docTypes = [
  { value: 'invoice', label: 'Factura' },
  { value: 'delivery-note', label: 'Nota de remisión' },
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
const colors = [
  { value: '#0A0A0A', label: 'Tinta' },
  { value: '#173b78', label: 'Azul clásico' },
  { value: '#2f8f43', label: 'Verde' },
  { value: '#8A6D00', label: 'Ocre' },
  { value: '#6B7280', label: 'Gris' },
]
const visibilityOptions: { key: 'showDocumentNumber' | 'showDate' | 'showRfc' | 'showPhone' | 'showEmail'; label: string }[] = [
  { key: 'showDocumentNumber', label: 'Folio' },
  { key: 'showDate', label: 'Fecha' },
  { key: 'showRfc', label: 'RFC' },
  { key: 'showPhone', label: 'Teléfono' },
  { key: 'showEmail', label: 'Correo' },
]
const optionalSections = [
  { id: 'company', label: 'Datos de empresa' },
  { id: 'client', label: 'Datos del cliente' },
  { id: 'items', label: 'Conceptos' },
  { id: 'totals', label: 'Totales' },
  { id: 'payment-terms', label: 'Condiciones de pago' },
  { id: 'bank-info', label: 'Datos bancarios' },
  { id: 'notes', label: 'Notas' },
  { id: 'signature-client', label: 'Firma del cliente' },
  { id: 'signature-company', label: 'Firma de la empresa' },
]

const currentIndex = computed(() => editorSteps.findIndex((step) => step.id === currentStep.value))
const completedSteps = computed(() => editorSteps.slice(0, currentIndex.value).map((step) => step.id))
const isFirstStep = computed(() => currentIndex.value === 0)
const isLastStep = computed(() => currentIndex.value === editorSteps.length - 1)
const documentTypeLabel = computed(() => docTypes.find((type) => type.value === editor.doc.type)?.label ?? 'Documento')
const saveLabel = computed(() => saving.value ? 'Guardando…' : saveState.value === 'dirty' ? 'Guardar cambios' : 'Guardado')

function sectionEnabled(id: string) {
  return settings.sections.find((section) => section.id === id)?.enabled ?? false
}

function toggleSection(id: string) {
  settings.toggleSection(id)
}

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
    await documents.saveDoc(editor.toJSON())
    toast.show('Documento guardado localmente', 'success')
    saveState.value = 'saved'
  } catch (error) {
    saveState.value = 'error'
    toast.show((error as Error).message || 'No se pudo guardar', 'error')
  } finally {
    saving.value = false
  }
}

async function saveAndExit() {
  await save()
  if (saveState.value === 'saved') router.push('/history')
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
  const item = editor.doc.items.find((line) => line.id === id)
  if (!item) return
  if (field === 'quantity' || field === 'unitPrice' || field === 'taxRate') item[field] = Number(value)
  else item[field] = value as string
}

function goToStep(step: EditorStep) {
  currentStep.value = step
  document.querySelector<HTMLElement>('.app-main')?.scrollTo({ top: 0, behavior: 'smooth' })
}

function nextStep() {
  if (isLastStep.value) return
  goToStep(editorSteps[currentIndex.value + 1].id)
}

function previousStep() {
  if (isFirstStep.value) return router.push('/')
  goToStep(editorSteps[currentIndex.value - 1].id)
}

watch(() => editor.doc.type, (type, previousType) => {
  if (previousType && type !== previousType) editor.generateNumber(type)
})
watch(() => editor.doc, () => {
  if (!initializing.value && !saving.value) saveState.value = 'dirty'
}, { deep: true })
</script>

<template>
  <div class="editor-view app-page">
    <header class="workspace-editor-header no-print">
      <button type="button" class="workspace-back-button" aria-label="Volver al inicio" @click="router.push('/')">
        <span class="text-xl leading-none" aria-hidden="true">‹</span>
        <span>Inicio</span>
      </button>
      <div class="min-w-0">
        <p class="eyebrow">Editor de documento</p>
        <h1 class="mt-1 truncate font-display text-xl font-extrabold tracking-[-0.045em] text-text">{{ documentTypeLabel }} <span class="font-mono text-sm font-bold text-text-muted">{{ editor.doc.number }}</span></h1>
      </div>
      <button type="button" class="workspace-save-button" :disabled="saving" @click="save"><span class="workspace-save-dot" :class="saveState" />{{ saveLabel }}</button>
    </header>

    <div v-if="initializing" class="mt-6 space-y-4" aria-label="Cargando editor">
      <div class="h-12 animate-pulse rounded-[16px] bg-white/70" />
      <div class="h-[360px] animate-pulse rounded-[20px] bg-white/70" />
    </div>

    <template v-else>
      <div class="no-print mt-5">
        <EditorProgress :current="currentStep" :completed="completedSteps" @select="goToStep" />
      </div>

      <main class="editor-workspace mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(500px,560px)] xl:grid-cols-[minmax(0,1fr)_minmax(680px,780px)]">
        <section class="editor-form-panel no-print rounded-[9px] border border-border-light bg-white p-4 sm:p-6">
          <EditorStepShell v-if="currentStep === 'basics'" title="Datos del documento" description="Define el tipo, la fecha y el formato del documento que vas a entregar." :next-disabled="!editor.doc.date" @next="nextStep">
            <div class="space-y-5">
              <div>
                <label class="mb-2 block text-xs font-bold text-text-muted">¿Qué vas a crear?</label>
                <div class="grid grid-cols-3 gap-2">
                  <button v-for="type in docTypes" :key="type.value" type="button" :class="['min-h-[68px] rounded-[14px] border px-2 py-3 text-xs font-extrabold transition-colors', editor.doc.type === type.value ? 'border-text bg-text text-white' : 'border-border bg-white text-text hover:bg-surface-hover']" @click="editor.doc.type = type.value as DocumentType">
                    <span class="mb-1 block text-lg" aria-hidden="true">{{ type.value === 'invoice' ? '▣' : type.value === 'quote' ? '⌁' : '□' }}</span>{{ type.label }}
                  </button>
                </div>
              </div>
              <div class="grid gap-4 sm:grid-cols-2">
                <label class="block"><span class="mb-2 block text-xs font-bold text-text-muted">Folio</span><input :value="editor.doc.number" aria-label="Folio" class="h-12 w-full bg-surface-hover px-4 text-sm font-bold" @input="editor.doc.number = ($event.target as HTMLInputElement).value" /></label>
                <label class="block"><span class="mb-2 block text-xs font-bold text-text-muted">Fecha</span><input v-model="editor.doc.date" type="date" aria-label="Fecha del documento" class="h-12 w-full bg-surface-hover px-4 text-sm" /></label>
                <label class="block sm:col-span-2"><span class="mb-2 block text-xs font-bold text-text-muted">Fecha de vencimiento <span class="font-normal text-text-muted">(opcional)</span></span><input v-model="editor.doc.expiryDate" type="date" aria-label="Fecha de vencimiento" class="h-12 w-full bg-surface-hover px-4 text-sm" /></label>
              </div>
              <div class="border-t border-border-light pt-5">
                <p class="text-sm font-extrabold text-text">Formato de salida</p>
                <p class="mt-1 text-xs leading-5 text-text-muted">Solo cambia cómo se verá al imprimir o descargar.</p>
                <div class="mt-4 grid gap-4 sm:grid-cols-2">
                  <label class="block"><span class="mb-2 block text-xs font-bold text-text-muted">Plantilla</span><select v-model="editor.doc.style" aria-label="Plantilla del documento" class="h-12 w-full bg-surface-hover px-4 text-sm"><option v-for="style in styles" :key="style.value" :value="style.value">{{ style.label }}</option></select></label>
                  <label class="block"><span class="mb-2 block text-xs font-bold text-text-muted">Papel</span><select v-model="editor.doc.paperSize" aria-label="Tamaño de papel" class="h-12 w-full bg-surface-hover px-4 text-sm"><option v-for="paper in paperSizes" :key="paper.value" :value="paper.value">{{ paper.label }}</option></select></label>
                  <label class="block"><span class="mb-2 block text-xs font-bold text-text-muted">Moneda</span><select v-model="editor.doc.styleConfig.currencySymbol" aria-label="Moneda" class="h-12 w-full bg-surface-hover px-4 text-sm"><option value="$">Peso ($)</option><option value="US$">Dólar (US$)</option><option value="€">Euro (€)</option></select></label>
                  <label class="block"><span class="mb-2 block text-xs font-bold text-text-muted">Tipografía impresa</span><select v-model="editor.doc.styleConfig.fontFamily" aria-label="Tipografía del documento" class="h-12 w-full bg-surface-hover px-4 text-sm"><option value="classic-serif">Clásica</option><option value="modern-sans">Moderna</option><option value="minimal-sans">Minimalista</option></select></label>
                </div>
                <div class="mt-4"><span class="mb-2 block text-xs font-bold text-text-muted">Color de acento</span><div class="flex gap-2"><button v-for="color in colors" :key="color.value" type="button" :aria-label="`Usar color ${color.label}`" :aria-pressed="editor.doc.styleConfig.accentColor === color.value" :class="['h-9 w-9 rounded-full border-2 transition-transform active:scale-90', editor.doc.styleConfig.accentColor === color.value ? 'border-text scale-110' : 'border-white']" :style="{ backgroundColor: color.value }" @click="editor.doc.styleConfig.accentColor = color.value" /></div></div>
                <div class="mt-5 border-t border-border-light pt-4"><p class="text-sm font-extrabold text-text">Información visible</p><div class="mt-3 grid gap-2 sm:grid-cols-2"><label v-for="option in visibilityOptions" :key="option.key" class="flex min-h-[40px] items-center gap-3 rounded-[11px] px-2 text-xs font-semibold text-text-secondary hover:bg-surface-hover"><input v-model="editor.doc.styleConfig[option.key]" type="checkbox" class="h-4 w-4 accent-[#101010]" />{{ option.label }}</label></div><label class="mt-3 block"><span class="mb-2 block text-xs font-bold text-text-muted">Posición del logo</span><select v-model="editor.doc.styleConfig.logoPosition" aria-label="Posición del logo" class="h-11 w-full bg-surface-hover px-3 text-sm"><option value="left">Izquierda</option><option value="center">Centro</option><option value="right">Derecha</option></select></label></div>
              </div>
            </div>
          </EditorStepShell>

          <EditorStepShell v-else-if="currentStep === 'client'" title="¿A quién se lo entregas?" description="Estos datos aparecerán como receptor del documento." show-back @back="previousStep" @next="nextStep">
            <ClientSection :client="editor.doc.client" @update="onClientUpdate" />
            <label class="mt-5 flex min-h-[44px] items-center gap-3 rounded-[14px] bg-surface-hover px-4 text-sm font-bold text-text"><input type="checkbox" :checked="sectionEnabled('client')" class="h-5 w-5 rounded border-border text-text accent-[#101010]" @change="toggleSection('client')" /> Mostrar datos del cliente en el documento</label>
          </EditorStepShell>

          <EditorStepShell v-else-if="currentStep === 'items'" title="Agrega los conceptos" description="Cada línea calcula su importe e IVA automáticamente." show-back @back="previousStep" @next="nextStep">
            <LinesTable :items="editor.doc.items" :subtotal="editor.subtotal" :tax-amount="editor.taxAmount" :total="editor.total" :currency-symbol="editor.doc.styleConfig.currencySymbol" @add="editor.addItem()" @remove="editor.removeItem($event)" @update="onLineUpdate" />
            <label class="mt-5 flex min-h-[44px] items-center gap-3 rounded-[14px] bg-surface-hover px-4 text-sm font-bold text-text"><input type="checkbox" :checked="sectionEnabled('items')" class="h-5 w-5 rounded border-border text-text accent-[#101010]" @change="toggleSection('items')" /> Mostrar conceptos en el documento</label>
          </EditorStepShell>

          <EditorStepShell v-else title="Revisa antes de guardar" description="Ajusta lo que aparecerá en el papel y termina con una acción." show-back next-label="Guardar documento" @back="previousStep" @next="saveAndExit">
            <div class="space-y-4">
              <div class="rounded-[16px] bg-surface-hover p-4">
                <div class="flex items-start justify-between gap-4"><div><p class="text-xs font-bold text-text-muted">{{ documentTypeLabel }} · {{ editor.doc.number }}</p><p class="mt-1 text-base font-extrabold text-text">{{ editor.doc.client.name || 'Sin cliente' }}</p><p class="mt-1 text-xs text-text-muted">{{ editor.doc.date }}</p></div><p class="font-display text-xl font-extrabold tabular-nums text-text">{{ editor.doc.styleConfig.currencySymbol }}{{ editor.total.toLocaleString('es-MX', { minimumFractionDigits: 2 }) }}</p></div>
              </div>
              <div class="rounded-[16px] border border-border-light p-4">
                <div class="flex items-center justify-between"><div><p class="text-sm font-extrabold text-text">Secciones impresas</p><p class="mt-1 text-xs text-text-muted">Ocultar una sección no borra sus datos.</p></div><span class="rounded-full bg-accent px-2.5 py-1 text-[10px] font-extrabold text-accent-text">{{ settings.sections.filter((section) => section.enabled).length }} activas</span></div>
                <div class="mt-4 grid gap-2 sm:grid-cols-2"><label v-for="section in optionalSections" :key="section.id" class="flex min-h-[44px] items-center gap-3 rounded-[12px] px-2 text-sm text-text hover:bg-surface-hover"><input type="checkbox" :checked="sectionEnabled(section.id)" class="h-5 w-5 rounded border-border accent-[#101010]" @change="toggleSection(section.id)" /><span>{{ section.label }}</span></label></div>
              </div>
              <details class="rounded-[16px] border border-border-light p-4"><summary class="cursor-pointer text-sm font-extrabold text-text">Condiciones y notas</summary><div class="mt-4 space-y-4"><label class="block"><span class="mb-2 block text-xs font-bold text-text-muted">Condiciones de pago</span><textarea v-model="editor.doc.paymentTerms" rows="3" class="w-full resize-none bg-surface-hover px-4 py-3 text-sm" placeholder="Ej. crédito a 30 días" /></label><label class="block"><span class="mb-2 block text-xs font-bold text-text-muted">Datos bancarios</span><textarea v-model="editor.doc.bankInfo" rows="3" class="w-full resize-none bg-surface-hover px-4 py-3 text-sm" placeholder="Banco, cuenta o CLABE" /></label><label class="block"><span class="mb-2 block text-xs font-bold text-text-muted">Notas</span><textarea v-model="editor.doc.notes" rows="3" class="w-full resize-none bg-surface-hover px-4 py-3 text-sm" placeholder="Gracias por su preferencia" /></label></div></details>
              <details class="rounded-[16px] border border-border-light p-4"><summary class="cursor-pointer text-sm font-extrabold text-text">Firmas</summary><div class="mt-4 grid gap-4 sm:grid-cols-2"><label class="block"><span class="mb-2 block text-xs font-bold text-text-muted">Firma del cliente</span><input v-model="editor.doc.signatureClientLabel" class="h-12 w-full bg-surface-hover px-4 text-sm" /></label><label class="block"><span class="mb-2 block text-xs font-bold text-text-muted">Firma de la empresa</span><input v-model="editor.doc.signatureCompanyLabel" class="h-12 w-full bg-surface-hover px-4 text-sm" /></label></div></details>
            </div>
          </EditorStepShell>
        </section>

        <aside class="print-stage order-first lg:order-none">
          <div class="editor-preview-panel sticky top-4">
            <div class="editor-preview-heading"><div><p class="eyebrow">Salida del documento</p><p class="mt-1 text-sm font-bold text-text">Vista previa en papel o PDF</p></div><span :class="['workspace-save-status', saveState === 'error' ? 'is-error' : saveState === 'dirty' ? 'is-dirty' : 'is-saved']">{{ saveState === 'dirty' ? 'Cambios sin guardar' : saveState === 'error' ? 'Error al guardar' : 'Guardado local' }}</span></div>
            <div class="print-sheet overflow-hidden rounded-[8px] border border-border-light bg-white"><PrintPreview :doc="editor.doc" :sections="settings.sections" /></div>
            <div class="no-print mt-3 grid grid-cols-2 gap-2"><button type="button" class="workspace-outline-button touch-target" @click="printDocument(editor.doc.paperSize)">Imprimir</button><button type="button" class="workspace-dark-button touch-target disabled:opacity-40" :disabled="exporting" @click="exportPdf">{{ exporting ? 'Preparando…' : 'Descargar PDF' }}</button></div>
          </div>
        </aside>
      </main>
    </template>
  </div>
</template>
