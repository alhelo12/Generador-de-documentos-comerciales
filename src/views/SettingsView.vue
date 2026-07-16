<script setup lang="ts">
import { ref, watch } from 'vue'
import type { DocumentType, TemplateStyle, PaperSize } from '@/types/document'
import { useSettingsStore } from '@/stores/settings'
import { useDocumentsStore } from '@/stores/documents'
import { usePersistence } from '@/composables/usePersistence'
import { useToast } from '@/composables/useToast'

const settings = useSettingsStore()
const documents = useDocumentsStore()
const { exportAll, importFromFile } = usePersistence()
const toast = useToast()

let saveTimer: ReturnType<typeof setTimeout> | null = null
function autoSave() { if (saveTimer) clearTimeout(saveTimer); saveTimer = setTimeout(() => settings.save(), 500) }

watch(() => settings.company, autoSave, { deep: true })
watch(() => settings.defaultStyle, autoSave)
watch(() => settings.defaultPaperSize, autoSave)
watch(() => settings.numberFormat, autoSave, { deep: true })

const tab = ref<'company' | 'appearance' | 'fields' | 'data'>('company')
const newFieldLabel = ref('')
const logoUploadRef = ref<HTMLInputElement | null>(null)
const importUploadRef = ref<HTMLInputElement | null>(null)

const styleOptions = [
  { value: 'classic', label: 'Clásico Formal' },
  { value: 'modern', label: 'Moderno Limpio' },
  { value: 'minimal', label: 'Minimalista' },
]
const paperOptions = [
  { value: 'letter', label: 'Carta' },
  { value: 'a4', label: 'A4' },
]
const numberTypes: { v: DocumentType; l: string }[] = [
  { v: 'invoice', l: 'Factura' },
  { v: 'delivery-note', l: 'Remisión' },
  { v: 'quote', l: 'Cotización' },
]

function handleLogoUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => settings.setLogo(reader.result as string)
  reader.readAsDataURL(file)
}

function addField() {
  const label = newFieldLabel.value.trim()
  if (!label) return
  settings.addCustomField(label)
  settings.save()
  newFieldLabel.value = ''
}

async function handleImport(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    const data = await importFromFile(file)
    await documents.importDocs(data)
    toast.show(`Importados ${data.length} documentos`, 'success')
    if (importUploadRef.value) importUploadRef.value.value = ''
  } catch (err) {
    toast.show((err as Error).message, 'error')
  }
}
</script>

<template>
  <div class="h-full overflow-y-auto">
    <div class="max-w-[1000px] mx-auto px-4 py-5 sm:px-6 sm:py-6">
      <h1 class="text-xl font-bold mb-1" style="color: #0f172a;">Configuración</h1>
      <p class="text-sm mb-5" style="color: #94a3b8;">Ajustes generales de la aplicación.</p>

      <div class="grid grid-cols-1 gap-5 lg:grid-cols-[200px_1fr]">
        <!-- Left tabs -->
        <div class="neu-pressed flex gap-1 overflow-x-auto rounded-2xl p-1 lg:block lg:space-y-1 lg:bg-transparent lg:p-0 lg:shadow-none">
          <button v-for="t in (['company','appearance','fields','data'] as const)" :key="t" @click="tab = t" :class="['flex shrink-0 items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-[box-shadow,color] text-left lg:w-full', tab === t ? 'bg-surface-active text-accent shadow-[inset_3px_3px_7px_#c7cfda,inset_-3px_-3px_7px_#fff]' : 'text-text-secondary hover:text-text']">
            <svg v-if="t === 'company'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            <svg v-if="t === 'appearance'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 112.828 2.828L7.343 15.657" /></svg>
            <svg v-if="t === 'fields'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <svg v-if="t === 'data'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
            {{ t === 'company' ? 'Empresa' : t === 'appearance' ? 'Apariencia' : t === 'fields' ? 'Campos' : 'Datos' }}
          </button>
        </div>

        <!-- Content -->
        <div class="neu-raised rounded-3xl p-4 sm:p-6">
          <!-- Company tab -->
          <div v-if="tab === 'company'" class="space-y-5">
            <div class="flex items-center gap-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" class="text-accent"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              <h3 class="text-sm font-semibold" style="color: #0f172a;">Empresa</h3>
            </div>
            <p class="text-xs" style="color: #94a3b8;">Información general de tu empresa y numeración.</p>

            <!-- Logo -->
            <div class="flex items-center gap-4 mb-4">
              <div class="w-16 h-16 rounded-xl border border-border bg-bg flex items-center justify-center overflow-hidden">
                <img v-if="settings.logo" :src="settings.logo" class="w-full h-full object-contain p-1.5" alt="Logo" />
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" style="color: #94a3b8;"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div class="flex gap-2">
                <label class="cursor-pointer">
                  <input ref="logoUploadRef" type="file" accept="image/*" class="hidden" @change="handleLogoUpload" />
                  <button @click="logoUploadRef?.click()" class="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-text-secondary hover:bg-surface-hover transition-all">Cambiar logo</button>
                </label>
                <button v-if="settings.logo" @click="settings.setLogo(undefined)" class="px-3 py-1.5 text-xs font-medium rounded-lg text-danger hover:bg-danger-light transition-all">Eliminar</button>
              </div>
            </div>

            <!-- Fields -->
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-medium" style="color: #475569;">Nombre</label>
                <input :value="settings.company.name" @input="settings.company.name = ($event.target as HTMLInputElement).value" class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/10" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-medium" style="color: #475569;">RFC</label>
                <input :value="settings.company.rfc" @input="settings.company.rfc = ($event.target as HTMLInputElement).value" class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/10" />
              </div>
              <div class="flex flex-col gap-1.5 col-span-2">
                <label class="text-xs font-medium" style="color: #475569;">Dirección</label>
                <input :value="settings.company.address" @input="settings.company.address = ($event.target as HTMLInputElement).value" class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/10" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-medium" style="color: #475569;">Teléfono</label>
                <input :value="settings.company.phone" @input="settings.company.phone = ($event.target as HTMLInputElement).value" class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/10" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-medium" style="color: #475569;">Email</label>
                <input :value="settings.company.email" @input="settings.company.email = ($event.target as HTMLInputElement).value" class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/10" />
              </div>
              <div class="flex flex-col gap-1.5 col-span-2">
                <label class="text-xs font-medium" style="color: #475569;">Sitio web</label>
                <input :value="settings.company.website" @input="settings.company.website = ($event.target as HTMLInputElement).value" class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/10" />
              </div>
            </div>

            <!-- Numeration -->
            <div class="pt-4 border-t border-border">
              <h4 class="text-sm font-semibold mb-1" style="color: #0f172a;">Numeración por tipo</h4>
              <p class="text-xs mb-3" style="color: #94a3b8;">Configura el prefijo y dígitos de cada tipo.</p>
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-border" style="color: #94a3b8;">
                    <th class="text-left py-2 text-[11px] font-semibold uppercase">Tipo</th>
                    <th class="text-left py-2 text-[11px] font-semibold uppercase w-24">Prefijo</th>
                    <th class="text-left py-2 text-[11px] font-semibold uppercase w-24">Dígitos</th>
                    <th class="text-right py-2 text-[11px] font-semibold uppercase">Vista previa</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="t in numberTypes" :key="t.v" class="border-b border-border-light last:border-0">
                    <td class="py-2 font-medium" style="color: #0f172a;">{{ t.l }}</td>
                    <td class="py-2"><input :value="settings.numberFormat[t.v].prefix" @input="settings.numberFormat[t.v].prefix = ($event.target as HTMLInputElement).value" maxlength="3" class="w-20 px-2 py-1 text-xs font-semibold rounded border border-border bg-bg text-text outline-none focus:border-accent text-center" /></td>
                    <td class="py-2"><input :value="settings.numberFormat[t.v].padding" @input="settings.numberFormat[t.v].padding = Math.max(1, Math.min(10, parseInt(($event.target as HTMLInputElement).value) || 1))" type="number" min="1" max="10" class="w-20 px-2 py-1 text-xs rounded border border-border bg-bg text-text outline-none focus:border-accent text-center" /></td>
                    <td class="py-2 text-right font-mono text-xs font-semibold" style="color: #0f172a;">{{ settings.numberFormat[t.v].prefix }}-{{ '0'.repeat(settings.numberFormat[t.v].padding) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Appearance tab -->
          <div v-if="tab === 'appearance'" class="space-y-5">
            <div class="flex items-center gap-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" class="text-accent"><path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 112.828 2.828L7.343 15.657" /></svg>
              <h3 class="text-sm font-semibold" style="color: #0f172a;">Apariencia</h3>
            </div>
            <p class="text-xs" style="color: #94a3b8;">Apariencia por defecto de documentos nuevos.</p>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-medium" style="color: #475569;">Estilo predeterminado</label>
                <select :value="settings.defaultStyle" @change="settings.defaultStyle = ($event.target as HTMLSelectElement).value as TemplateStyle" class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text outline-none focus:border-accent cursor-pointer">
                  <option v-for="s in styleOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
                </select>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-medium" style="color: #475569;">Tamaño de papel</label>
                <select :value="settings.defaultPaperSize" @change="settings.defaultPaperSize = ($event.target as HTMLSelectElement).value as PaperSize" class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text outline-none focus:border-accent cursor-pointer">
                  <option v-for="p in paperOptions" :key="p.value" :value="p.value">{{ p.label }}</option>
                </select>
              </div>
            </div>
            <p class="text-xs" style="color: #94a3b8;">Las secciones se configuran desde el editor.</p>
          </div>

          <!-- Fields tab -->
          <div v-if="tab === 'fields'" class="space-y-5">
            <div class="flex items-center gap-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" class="text-accent"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              <h3 class="text-sm font-semibold" style="color: #0f172a;">Campos personalizados</h3>
            </div>
            <p class="text-xs" style="color: #94a3b8;">Campos adicionales para documentos.</p>
            <div class="space-y-2 mb-4">
              <div v-for="(f, i) in settings.customFields" :key="i" class="flex items-center gap-2">
                <span class="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-bg">{{ f.label }}</span>
                <button @click="settings.removeCustomField(i); settings.save()" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-danger-light text-text-muted hover:text-danger transition-all" title="Eliminar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <p v-if="!settings.customFields.length" class="text-sm italic" style="color: #94a3b8;">Sin campos aún.</p>
            </div>
            <div class="flex gap-2">
              <input v-model="newFieldLabel" placeholder="Nombre del campo" class="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/10" @keyup.enter="addField" />
              <button @click="addField" :disabled="!newFieldLabel.trim()" class="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-accent hover:bg-accent-hover transition-all disabled:opacity-40">Agregar</button>
            </div>
          </div>

          <!-- Data tab -->
          <div v-if="tab === 'data'" class="space-y-5">
            <div class="flex items-center gap-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" class="text-accent"><path stroke-linecap="round" stroke-linejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
              <h3 class="text-sm font-semibold" style="color: #0f172a;">Datos</h3>
            </div>
            <p class="text-xs" style="color: #94a3b8;">Almacenamiento local. Exporta e importa respaldos.</p>
            <div class="bg-bg rounded-lg p-4 border border-border">
              <h4 class="text-sm font-semibold mb-1" style="color: #0f172a;">Exportar respaldo</h4>
              <p class="text-xs mb-3" style="color: #94a3b8;">Descarga un JSON con todos tus documentos.</p>
              <button @click="exportAll" class="px-4 py-2 text-sm font-medium rounded-lg border border-border text-text-secondary hover:bg-surface-hover transition-all">Exportar JSON</button>
            </div>
            <div class="bg-bg rounded-lg p-4 border border-border">
              <h4 class="text-sm font-semibold mb-1" style="color: #0f172a;">Importar documentos</h4>
              <p class="text-xs mb-3" style="color: #94a3b8;">Carga un JSON exportado previamente.</p>
              <label class="cursor-pointer">
                <input ref="importUploadRef" type="file" accept=".json" class="hidden" @change="handleImport" />
                <button @click="importUploadRef?.click()" class="px-4 py-2 text-sm font-medium rounded-lg border border-border text-text-secondary hover:bg-surface-hover transition-all">Seleccionar archivo</button>
              </label>
            </div>
          </div>

          <!-- Save button -->
          <div class="flex justify-end mt-6 pt-4 border-t border-border">
            <button @click="settings.save(); toast.show('Configuración guardada', 'success')" class="px-5 py-2 text-sm font-semibold text-white rounded-lg bg-accent hover:bg-accent-hover transition-all">Guardar cambios</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
