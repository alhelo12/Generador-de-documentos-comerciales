<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEditorStore } from '@/stores/editor'
import { useDocumentsStore } from '@/stores/documents'
import { useSettingsStore } from '@/stores/settings'
import { usePrint } from '@/composables/usePrint'
import { useToast } from '@/composables/useToast'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import ClientSection from '@/components/editor/ClientSection.vue'
import LinesTable from '@/components/editor/LinesTable.vue'
import PrintPreview from '@/components/preview/PrintPreview.vue'
import type { DocumentType } from '@/types/document'

const route = useRoute()
const router = useRouter()
const editor = useEditorStore()
const documents = useDocumentsStore()
const settings = useSettingsStore()
const { printDocument } = usePrint()
const toast = useToast()

const docTypes = [
  { value: 'invoice', label: 'Factura' },
  { value: 'delivery-note', label: 'Nota de Remisión' },
  { value: 'quote', label: 'Cotización' },
]
const styles = [
  { value: 'classic', label: 'Clásico Formal' },
  { value: 'modern', label: 'Moderno Limpio' },
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
  }
})

async function save() {
  const data = editor.toJSON()
  await documents.saveDoc(data)
  toast.show('Documento guardado', 'success')
  router.push('/')
}

function discard() {
  router.push('/')
}

function generateNumber(type: DocumentType) {
  const fmt = settings.numberFormat[type]
  const nextNum = documents.docs.filter(d => d.type === type).length + 1
  editor.doc.number = `${fmt.prefix}-${String(nextNum).padStart(fmt.padding, '0')}`
}

watch(() => editor.doc.type, (t) => generateNumber(t))
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 lg:px-6 py-6 print:max-w-none print:px-0 print:py-0">
    <div class="flex items-center justify-between no-print">
      <div>
        <h1 class="text-xl font-bold tracking-tight">
          {{ editor.doc.id ? 'Editar' : 'Nuevo' }} documento
        </h1>
        <p class="text-sm text-neutral-500 mt-1">Completa los datos del documento. Usa los checkboxes para activar o desactivar secciones en la vista previa.</p>
      </div>
      <div class="flex gap-2">
        <AppButton variant="secondary" @click="discard" aria-label="Descartar documento">Descartar</AppButton>
        <AppButton variant="primary" @click="save" aria-label="Guardar documento">Guardar</AppButton>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-5 gap-6">
      <!-- Editor panel -->
      <div class="xl:col-span-3 space-y-6 no-print">
        <AppSelect
          label="Tipo de documento"
          :modelValue="editor.doc.type"
          :options="docTypes"
          @update:modelValue="editor.doc.type = $event as any"
        />

        <AppInput label="Número de documento" :modelValue="editor.doc.number" @update:modelValue="editor.doc.number = $event" />
        <div class="grid grid-cols-2 gap-3">
          <AppSelect label="Plantilla" :modelValue="editor.doc.style" :options="styles" @update:modelValue="editor.doc.style = $event as any" />
          <AppSelect label="Papel" :modelValue="editor.doc.paperSize" :options="paperSizes" @update:modelValue="editor.doc.paperSize = $event as any" />
        </div>

        <!-- Style personalization -->
        <details class="bg-white border border-neutral-200 rounded-lg">
          <summary class="px-4 py-3 text-sm font-medium cursor-pointer select-none text-neutral-600 hover:text-neutral-900 transition-colors [&::-webkit-details-marker]:hidden flex items-center justify-between">
            <span>Personalizar estilo</span>
            <span class="text-xs text-neutral-400 font-normal">Color, tipografía, logo, moneda</span>
            <svg class="w-4 h-4 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </summary>
          <div class="px-4 pb-4 border-t border-neutral-100 pt-3 space-y-3">
            <div class="flex items-center gap-3">
              <label class="text-xs font-medium text-neutral-600 w-24">Color acento</label>
              <div class="flex gap-1.5 flex-wrap">
                <button v-for="c in ['#2d2d2d','#1e3a5f','#059669','#c2410c','#9333ea','#dc2626','#0d9488','#ca8a04']" :key="c" @click="editor.doc.styleConfig.accentColor = c" :class="['w-6 h-6 rounded-full border-2 transition-all', editor.doc.styleConfig.accentColor === c ? 'border-neutral-950 scale-110' : 'border-transparent']" :style="{ backgroundColor: c }" :title="c"></button>
                <input type="color" :value="editor.doc.styleConfig.accentColor" @input="editor.doc.styleConfig.accentColor = ($event.target as HTMLInputElement).value" class="w-6 h-6 rounded-full border-0 cursor-pointer p-0" title="Personalizado" />
              </div>
            </div>
            <div class="flex items-center gap-3">
              <label class="text-xs font-medium text-neutral-600 w-24">Tipografía</label>
              <AppSelect :modelValue="editor.doc.styleConfig.fontFamily" :options="[{ value: 'classic-serif', label: 'Clásica (serif)' }, { value: 'modern-sans', label: 'Moderna (sans bold)' }, { value: 'minimal-sans', label: 'Minimal (sans light)' }]" @update:modelValue="editor.doc.styleConfig.fontFamily = $event as any" class="flex-1" />
            </div>
            <div class="flex items-center gap-3">
              <label class="text-xs font-medium text-neutral-600 w-24">Logo</label>
              <AppSelect :modelValue="editor.doc.styleConfig.logoPosition" :options="[{ value: 'left', label: 'Izquierda' }, { value: 'center', label: 'Centrado' }, { value: 'right', label: 'Derecha' }]" @update:modelValue="editor.doc.styleConfig.logoPosition = $event as any" class="flex-1" />
            </div>
            <div class="flex items-center gap-3">
              <label class="text-xs font-medium text-neutral-600 w-24">Moneda</label>
              <AppSelect :modelValue="editor.doc.styleConfig.currencySymbol" :options="[{ value: '$', label: '$ (peso)' }, { value: 'US$', label: 'US$ (dólar)' }, { value: '€', label: '€ (euro)' }, { value: '$MX', label: '$MX' }]" @update:modelValue="editor.doc.styleConfig.currencySymbol = $event" class="flex-1" />
            </div>
            <div class="flex items-center gap-3">
              <label class="text-xs font-medium text-neutral-600 w-24">Impuesto</label>
              <AppInput :modelValue="editor.doc.styleConfig.taxLabel" @update:modelValue="editor.doc.styleConfig.taxLabel = $event" class="flex-1" />
            </div>
            <div class="border-t border-neutral-100 pt-2">
              <p class="text-xs font-medium text-neutral-600 mb-2">Mostrar en el documento</p>
              <div class="grid grid-cols-2 gap-x-4 gap-y-1.5">
                <label class="flex items-center gap-2 text-xs"><input type="checkbox" :checked="editor.doc.styleConfig.showRfc" @change="editor.doc.styleConfig.showRfc = !editor.doc.styleConfig.showRfc" class="w-3.5 h-3.5 rounded border-neutral-300 accent-accent" /> RFC empresa</label>
                <label class="flex items-center gap-2 text-xs"><input type="checkbox" :checked="editor.doc.styleConfig.showPhone" @change="editor.doc.styleConfig.showPhone = !editor.doc.styleConfig.showPhone" class="w-3.5 h-3.5 rounded border-neutral-300 accent-accent" /> Teléfono</label>
                <label class="flex items-center gap-2 text-xs"><input type="checkbox" :checked="editor.doc.styleConfig.showEmail" @change="editor.doc.styleConfig.showEmail = !editor.doc.styleConfig.showEmail" class="w-3.5 h-3.5 rounded border-neutral-300 accent-accent" /> Correo</label>
                <label class="flex items-center gap-2 text-xs"><input type="checkbox" :checked="editor.doc.styleConfig.showDocumentNumber" @change="editor.doc.styleConfig.showDocumentNumber = !editor.doc.styleConfig.showDocumentNumber" class="w-3.5 h-3.5 rounded border-neutral-300 accent-accent" /> N° de documento</label>
                <label class="flex items-center gap-2 text-xs"><input type="checkbox" :checked="editor.doc.styleConfig.showDate" @change="editor.doc.styleConfig.showDate = !editor.doc.styleConfig.showDate" class="w-3.5 h-3.5 rounded border-neutral-300 accent-accent" /> Fecha</label>
              </div>
            </div>
          </div>
        </details>

        <ClientSection
          :client="editor.doc.client"
          @update="(field, value) => { (editor.doc.client as any)[field] = value }"
        >
          <template #header>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" :checked="settings.sections.find(s => s.id === 'client')?.enabled" @change="settings.toggleSection('client')" class="w-3.5 h-3.5 rounded border-neutral-300 accent-accent" />
              <span class="text-xs font-semibold uppercase tracking-wider text-neutral-500">Cliente</span>
            </label>
          </template>
        </ClientSection>

        <LinesTable
          :items="editor.doc.items"
          :subtotal="editor.subtotal"
          :taxAmount="editor.taxAmount"
          :total="editor.total"
          @add="editor.addItem()"
          @remove="editor.removeItem($event)"
          @update="(id, field, value) => { const item = editor.doc.items.find(i => i.id === id); if (item) (item as any)[field] = value }"
        >
          <template #header>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" :checked="settings.sections.find(s => s.id === 'items')?.enabled" @change="settings.toggleSection('items')" class="w-3.5 h-3.5 rounded border-neutral-300 accent-accent" />
              <span class="text-xs font-semibold uppercase tracking-wider text-neutral-500">Conceptos</span>
            </label>
          </template>
        </LinesTable>

        <!-- Extra fields per doc type -->
        <div v-if="editor.doc.type === 'quote'" class="space-y-3">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-neutral-500">Vigencia</h3>
          <AppInput :modelValue="editor.doc.expiryDate" @update:modelValue="editor.doc.expiryDate = $event" type="date" />
        </div>

        <!-- Sections with inline toggles + data -->
        <div>
          <p class="text-xs text-neutral-500 mb-2">Activa o desactiva secciones usando los checkboxes. Los datos se conservan aunque la sección esté oculta.</p>

          <!-- Document data -->
          <div class="bg-white border border-neutral-200 rounded-lg divide-y divide-neutral-100 mb-3">
            <p class="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Datos del documento</p>
            <div class="px-4 py-3 flex items-center gap-3">
              <input type="checkbox" :checked="settings.sections.find(s => s.id === 'payment-terms')?.enabled" @change="settings.toggleSection('payment-terms')" class="w-3.5 h-3.5 rounded border-neutral-300 accent-accent" />
              <span class="text-xs font-medium flex-1">Condiciones de pago</span>
            </div>
            <div v-if="settings.sections.find(s => s.id === 'payment-terms')?.enabled" class="px-4 pb-3">
              <textarea :value="editor.doc.paymentTerms" @input="editor.doc.paymentTerms = ($event.target as HTMLTextAreaElement).value" placeholder="Ej. Crédito a 30 días" class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-md bg-white outline-none focus:border-accent resize-none" rows="2"></textarea>
            </div>
            <div class="px-4 py-3 flex items-center gap-3">
              <input type="checkbox" :checked="settings.sections.find(s => s.id === 'bank-info')?.enabled" @change="settings.toggleSection('bank-info')" class="w-3.5 h-3.5 rounded border-neutral-300 accent-accent" />
              <span class="text-xs font-medium flex-1">Datos bancarios</span>
            </div>
            <div v-if="settings.sections.find(s => s.id === 'bank-info')?.enabled" class="px-4 pb-3">
              <textarea :value="editor.doc.bankInfo" @input="editor.doc.bankInfo = ($event.target as HTMLTextAreaElement).value" placeholder="Ej. HSBC · 1234 5678 9012 · Clabe 012345..." class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-md bg-white outline-none focus:border-accent resize-none" rows="2"></textarea>
            </div>
            <div class="px-4 py-3 flex items-center gap-3">
              <input type="checkbox" :checked="settings.sections.find(s => s.id === 'notes')?.enabled" @change="settings.toggleSection('notes')" class="w-3.5 h-3.5 rounded border-neutral-300 accent-accent" />
              <span class="text-xs font-medium flex-1">Notas al pie</span>
            </div>
            <div v-if="settings.sections.find(s => s.id === 'notes')?.enabled" class="px-4 pb-3">
              <textarea :value="editor.doc.notes" @input="editor.doc.notes = ($event.target as HTMLTextAreaElement).value" placeholder="Ej. Gracias por su preferencia" class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-md bg-white outline-none focus:border-accent resize-none" rows="2"></textarea>
            </div>
          </div>

          <!-- Signatures -->
          <div class="bg-white border border-neutral-200 rounded-lg divide-y divide-neutral-100 mb-3">
            <p class="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Firmas</p>
            <div class="px-4 py-3 flex items-center gap-3">
              <input type="checkbox" :checked="settings.sections.find(s => s.id === 'signature-client')?.enabled" @change="settings.toggleSection('signature-client')" class="w-3.5 h-3.5 rounded border-neutral-300 accent-accent" />
              <span class="text-xs font-medium flex-1">Firma del cliente</span>
            </div>
            <div v-if="settings.sections.find(s => s.id === 'signature-client')?.enabled" class="px-4 pb-3">
              <input :value="editor.doc.signatureClientLabel" @input="editor.doc.signatureClientLabel = ($event.target as HTMLInputElement).value" placeholder="Firma del cliente" class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-md bg-white outline-none focus:border-accent" />
            </div>
            <div class="px-4 py-3 flex items-center gap-3">
              <input type="checkbox" :checked="settings.sections.find(s => s.id === 'signature-company')?.enabled" @change="settings.toggleSection('signature-company')" class="w-3.5 h-3.5 rounded border-neutral-300 accent-accent" />
              <span class="text-xs font-medium flex-1">Firma de la empresa</span>
            </div>
            <div v-if="settings.sections.find(s => s.id === 'signature-company')?.enabled" class="px-4 pb-3">
              <input :value="editor.doc.signatureCompanyLabel" @input="editor.doc.signatureCompanyLabel = ($event.target as HTMLInputElement).value" placeholder="Firma de la empresa" class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-md bg-white outline-none focus:border-accent" />
            </div>
          </div>

          <!-- Visibility toggles -->
          <div class="bg-white border border-neutral-200 rounded-lg divide-y divide-neutral-100">
            <p class="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Visibilidad</p>
            <div class="px-4 py-3 flex items-center gap-3">
              <input type="checkbox" :checked="settings.sections.find(s => s.id === 'totals')?.enabled" @change="settings.toggleSection('totals')" class="w-3.5 h-3.5 rounded border-neutral-300 accent-accent" />
              <span class="text-xs font-medium flex-1">Subtotal / IVA / Total</span>
            </div>
            <div class="px-4 py-3 flex items-center gap-3">
              <input type="checkbox" :checked="settings.sections.find(s => s.id === 'company')?.enabled" @change="settings.toggleSection('company')" class="w-3.5 h-3.5 rounded border-neutral-300 accent-accent" />
              <span class="text-xs font-medium flex-1">Datos de empresa</span>
            </div>
          </div>
        </div>

        <!-- Custom fields -->
        <div v-if="editor.doc.customFields.length" class="space-y-3">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" :checked="settings.sections.find(s => s.id === 'custom-fields')?.enabled" @change="settings.toggleSection('custom-fields')" class="w-3.5 h-3.5 rounded border-neutral-300 accent-accent" />
            <span class="text-xs font-semibold uppercase tracking-wider text-neutral-500">Campos personalizados</span>
          </label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div v-for="(f, i) in editor.doc.customFields" :key="i" class="flex flex-col gap-1">
              <label class="text-xs font-medium text-neutral-600">{{ f.label }}</label>
              <input :value="f.value" @input="editor.doc.customFields[i].value = ($event.target as HTMLInputElement).value" class="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md bg-white outline-none focus:border-accent" />
            </div>
          </div>
        </div>
      </div>

      <!-- Preview panel -->
      <div class="xl:col-span-2">
        <div class="sticky top-6">
          <div class="flex items-center justify-between mb-3 no-print">
            <h2 class="text-sm font-semibold text-neutral-600">Vista previa</h2>
            <AppButton size="sm" variant="secondary" @click="printDocument(editor.doc.paperSize)" aria-label="Imprimir documento">
              <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9V3h12v6M6 9h12M6 9H4a2 2 0 00-2 2v6h4v4h12v-4h4v-6a2 2 0 00-2-2h-2M6 15h12" /></svg>
              </template>
              Imprimir / PDF
            </AppButton>
          </div>
          <div class="border border-neutral-200 rounded-lg bg-neutral-100 overflow-y-auto print:!border-none print:!rounded-none print:!bg-white print:!overflow-visible print:!max-h-none" style="max-height: calc(100vh - 140px)">
            <PrintPreview :doc="editor.doc" :sections="settings.sections" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
