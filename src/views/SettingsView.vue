<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import type { DocumentType, TemplateStyle, PaperSize } from '@/types/document'
import { useSettingsStore } from '@/stores/settings'
import { useDocumentsStore } from '@/stores/documents'
import { usePersistence } from '@/composables/usePersistence'
import { useToast } from '@/composables/useToast'
import gsap from 'gsap'

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
  { value: 'classic', label: 'Clasico Formal' },
  { value: 'modern', label: 'Moderno Limpio' },
  { value: 'minimal', label: 'Minimalista' },
]
const paperOptions = [
  { value: 'letter', label: 'Carta' },
  { value: 'a4', label: 'A4' },
]
const numberTypes: { v: DocumentType; l: string }[] = [
  { v: 'invoice', l: 'Factura' },
  { v: 'delivery-note', l: 'Remision' },
  { v: 'quote', l: 'Cotizacion' },
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

function switchTab(t: typeof tab.value) {
  tab.value = t
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  nextTick(() => {
    gsap.fromTo('.settings-content', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' })
  })
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  gsap.fromTo('.settings-header', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' })
  gsap.fromTo('.settings-shell', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: 0.1 })
})
</script>

<template>
  <div class="h-full overflow-y-auto">
    <div class="max-w-[1200px] mx-auto px-5 py-6 sm:px-8 sm:py-8">
      <div class="settings-header mb-8">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Configuracion</p>
        <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight text-text">Ajustes</h1>
        <p class="text-sm mt-1.5 text-text-secondary">Ajustes generales de la aplicacion.</p>
      </div>

          <div class="settings-shell grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <!-- Left Tabs -->
        <div class="glass-pressed flex gap-1 overflow-x-auto rounded-2xl p-1 lg:block lg:space-y-0.5 lg:bg-transparent lg:p-0 lg:shadow-none">
          <button v-for="t in (['company','appearance','fields','data'] as const)" :key="t" @click="switchTab(t)" :class="[
            'flex shrink-0 items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-bold transition-all duration-200 text-left lg:w-full',
            tab === t ? 'bg-accent/15 text-accent shadow-[0_0_15px_rgba(75,110,245,0.08)]' : 'text-text-muted hover:text-text-secondary hover:bg-black/[0.03]',
          ]">
            <svg v-if="t === 'company'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            <svg v-if="t === 'appearance'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 112.828 2.828L7.343 15.657" /></svg>
            <svg v-if="t === 'fields'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <svg v-if="t === 'data'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
            {{ t === 'company' ? 'Empresa' : t === 'appearance' ? 'Apariencia' : t === 'fields' ? 'Campos' : 'Datos' }}
          </button>
        </div>

        <!-- Content -->
        <div class="glass-raised rounded-2xl p-5 sm:p-7">
          <!-- Company -->
          <div v-if="tab === 'company'" class="settings-content space-y-6">
            <div>
              <h3 class="text-base font-bold text-text mb-1">Empresa</h3>
              <p class="text-xs text-text-muted">Informacion general de tu empresa y numeracion.</p>
            </div>

            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-xl bg-black/[0.04] border border-black/[0.06] flex items-center justify-center overflow-hidden">
                <img v-if="settings.logo" :src="settings.logo" class="w-full h-full object-contain p-1.5" alt="Logo" />
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" class="text-text-muted"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div class="flex gap-2">
                <label class="cursor-pointer">
                  <input ref="logoUploadRef" type="file" accept="image/*" class="hidden" @change="handleLogoUpload" />
                  <button @click="logoUploadRef?.click()" class="glass-control px-3.5 py-2 text-xs font-bold rounded-xl text-text-secondary hover:text-text">Cambiar logo</button>
                </label>
                <button v-if="settings.logo" @click="settings.setLogo(undefined)" class="px-3.5 py-2 text-xs font-bold rounded-xl text-danger hover:bg-danger/10 transition-all">Eliminar</button>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="flex flex-col gap-2">
                <label class="text-[11px] font-bold uppercase tracking-wider text-text-muted">Nombre</label>
                <input aria-label="Nombre de la empresa" :value="settings.company.name" @input="settings.company.name = ($event.target as HTMLInputElement).value" class="w-full px-3.5 py-2.5 text-sm rounded-xl glass-control text-text" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-[11px] font-bold uppercase tracking-wider text-text-muted">RFC</label>
                <input aria-label="RFC de la empresa" :value="settings.company.rfc" @input="settings.company.rfc = ($event.target as HTMLInputElement).value" class="w-full px-3.5 py-2.5 text-sm rounded-xl glass-control text-text" />
              </div>
              <div class="flex flex-col gap-2 sm:col-span-2">
                <label class="text-[11px] font-bold uppercase tracking-wider text-text-muted">Direccion</label>
                <input aria-label="Dirección de la empresa" :value="settings.company.address" @input="settings.company.address = ($event.target as HTMLInputElement).value" class="w-full px-3.5 py-2.5 text-sm rounded-xl glass-control text-text" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-[11px] font-bold uppercase tracking-wider text-text-muted">Telefono</label>
                <input aria-label="Teléfono de la empresa" :value="settings.company.phone" @input="settings.company.phone = ($event.target as HTMLInputElement).value" class="w-full px-3.5 py-2.5 text-sm rounded-xl glass-control text-text" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-[11px] font-bold uppercase tracking-wider text-text-muted">Email</label>
                <input aria-label="Correo de la empresa" :value="settings.company.email" @input="settings.company.email = ($event.target as HTMLInputElement).value" class="w-full px-3.5 py-2.5 text-sm rounded-xl glass-control text-text" />
              </div>
              <div class="flex flex-col gap-2 sm:col-span-2">
                <label class="text-[11px] font-bold uppercase tracking-wider text-text-muted">Sitio web</label>
                <input aria-label="Sitio web de la empresa" :value="settings.company.website" @input="settings.company.website = ($event.target as HTMLInputElement).value" class="w-full px-3.5 py-2.5 text-sm rounded-xl glass-control text-text" />
              </div>
            </div>

            <div class="pt-5 border-t border-black/[0.04]">
              <h4 class="text-sm font-bold text-text mb-1">Numeracion por tipo</h4>
              <p class="text-xs text-text-muted mb-3">Configura el prefijo y digitos de cada tipo.</p>
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-black/[0.04]">
                    <th class="text-left py-2.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">Tipo</th>
                    <th class="text-left py-2.5 text-[10px] font-bold uppercase tracking-wider text-text-muted w-24">Prefijo</th>
                    <th class="text-left py-2.5 text-[10px] font-bold uppercase tracking-wider text-text-muted w-24">Digitos</th>
                    <th class="text-right py-2.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">Vista previa</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="t in numberTypes" :key="t.v" class="border-b border-black/[0.02] last:border-0">
                    <td class="py-2.5 font-semibold text-text">{{ t.l }}</td>
                    <td class="py-2.5"><input :aria-label="`Prefijo de ${t.l}`" :value="settings.numberFormat[t.v].prefix" @input="settings.numberFormat[t.v].prefix = ($event.target as HTMLInputElement).value" maxlength="3" class="w-20 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-black/[0.04] border border-black/[0.04] text-text text-center" /></td>
                    <td class="py-2.5"><input :aria-label="`Dígitos de ${t.l}`" :value="settings.numberFormat[t.v].padding" @input="settings.numberFormat[t.v].padding = Math.max(1, Math.min(10, parseInt(($event.target as HTMLInputElement).value) || 1))" type="number" min="1" max="10" class="w-20 px-2.5 py-1.5 text-xs rounded-lg bg-black/[0.04] border border-black/[0.04] text-text text-center" /></td>
                    <td class="py-2.5 text-right font-mono text-xs font-bold text-accent">{{ settings.numberFormat[t.v].prefix }}-{{ '0'.repeat(settings.numberFormat[t.v].padding) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Appearance -->
          <div v-if="tab === 'appearance'" class="settings-content space-y-6">
            <div>
              <h3 class="text-base font-bold text-text mb-1">Apariencia</h3>
              <p class="text-xs text-text-muted">Apariencia por defecto de documentos nuevos.</p>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="flex flex-col gap-2">
                <label class="text-[11px] font-bold uppercase tracking-wider text-text-muted">Estilo predeterminado</label>
                <select aria-label="Estilo predeterminado" :value="settings.defaultStyle" @change="settings.defaultStyle = ($event.target as HTMLSelectElement).value as TemplateStyle" class="w-full px-3.5 py-2.5 text-sm rounded-xl glass-control text-text cursor-pointer appearance-none">
                  <option v-for="s in styleOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
                </select>
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-[11px] font-bold uppercase tracking-wider text-text-muted">Tamano de papel</label>
                <select aria-label="Tamaño de papel predeterminado" :value="settings.defaultPaperSize" @change="settings.defaultPaperSize = ($event.target as HTMLSelectElement).value as PaperSize" class="w-full px-3.5 py-2.5 text-sm rounded-xl glass-control text-text cursor-pointer appearance-none">
                  <option v-for="p in paperOptions" :key="p.value" :value="p.value">{{ p.label }}</option>
                </select>
              </div>
            </div>
            <p class="text-xs text-text-muted">Las secciones se configuran desde el editor.</p>
          </div>

          <!-- Fields -->
          <div v-if="tab === 'fields'" class="settings-content space-y-6">
            <div>
              <h3 class="text-base font-bold text-text mb-1">Campos personalizados</h3>
              <p class="text-xs text-text-muted">Campos adicionales para documentos.</p>
            </div>
            <div class="space-y-2 mb-4">
              <div v-for="(f, i) in settings.customFields" :key="i" class="flex items-center gap-2">
                <span class="flex-1 px-3.5 py-2.5 text-sm rounded-xl bg-black/[0.04] border border-black/[0.04] text-text">{{ f.label }}</span>
                <button @click="settings.removeCustomField(i); settings.save()" class="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-danger/10 text-text-muted hover:text-danger transition-all" title="Eliminar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <p v-if="!settings.customFields.length" class="text-sm text-text-muted italic">Sin campos aun.</p>
            </div>
            <div class="flex gap-2">
              <input v-model="newFieldLabel" placeholder="Nombre del campo" class="flex-1 px-3.5 py-2.5 text-sm rounded-xl glass-control text-text placeholder:text-text-muted" @keyup.enter="addField" />
              <button @click="addField" :disabled="!newFieldLabel.trim()" class="accent-glow px-5 py-2.5 text-sm font-bold text-white rounded-xl disabled:opacity-40">Agregar</button>
            </div>
          </div>

          <!-- Data -->
          <div v-if="tab === 'data'" class="settings-content space-y-6">
            <div>
              <h3 class="text-base font-bold text-text mb-1">Datos</h3>
              <p class="text-xs text-text-muted">Almacenamiento local. Exporta e importa respaldos.</p>
            </div>
            <div class="glass-pressed rounded-xl p-5">
              <h4 class="text-sm font-bold text-text mb-1">Exportar respaldo</h4>
              <p class="text-xs text-text-muted mb-3">Descarga un JSON con todos tus documentos.</p>
              <button @click="exportAll" class="glass-control px-4 py-2.5 text-sm font-semibold rounded-xl text-text-secondary hover:text-text">Exportar JSON</button>
            </div>
            <div class="glass-pressed rounded-xl p-5">
              <h4 class="text-sm font-bold text-text mb-1">Importar documentos</h4>
              <p class="text-xs text-text-muted mb-3">Carga un JSON exportado previamente.</p>
              <label class="cursor-pointer">
                <input ref="importUploadRef" type="file" accept=".json" class="hidden" @change="handleImport" />
                <button @click="importUploadRef?.click()" class="glass-control px-4 py-2.5 text-sm font-semibold rounded-xl text-text-secondary hover:text-text">Seleccionar archivo</button>
              </label>
            </div>
          </div>

          <!-- Save -->
          <div class="flex justify-end mt-6 pt-5 border-t border-black/[0.04]">
            <button @click="settings.save(); toast.show('Configuracion guardada', 'success')" class="accent-glow px-6 py-2.5 text-sm font-bold text-white rounded-xl">Guardar cambios</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
