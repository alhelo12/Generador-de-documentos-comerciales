<script setup lang="ts">
import { ref, watch } from 'vue'
import type { DocumentType } from '@/types/document'
import { useSettingsStore } from '@/stores/settings'
import { usePersistence } from '@/composables/usePersistence'
import { useToast } from '@/composables/useToast'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppCard from '@/components/ui/AppCard.vue'

const settings = useSettingsStore()
const { exportAll, importFromFile } = usePersistence()
const toast = useToast()

let saveTimer: ReturnType<typeof setTimeout> | null = null
function autoSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => settings.save(), 500)
}

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

function handleImport(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  importFromFile(file).then(msg => {
    toast.show(msg, 'success')
    location.reload()
  }).catch(err => toast.show(err.message, 'error'))
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 lg:px-6 py-8">
    <h1 class="text-2xl font-bold tracking-tight mb-6">Configuración</h1>

    <!-- Tabs -->
    <div class="flex gap-1 bg-neutral-100 rounded-lg p-1 mb-6 w-fit">
      <button v-for="t in [{v:'company',l:'Empresa'},{v:'appearance',l:'Apariencia'},{v:'fields',l:'Campos personalizados'},{v:'data',l:'Datos y respaldo'}]" :key="t.v" @click="tab = t.v as any" :class="['px-4 py-2 text-sm font-medium rounded-md transition-colors', tab === t.v ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-500 hover:text-neutral-700']">{{ t.l }}</button>
    </div>

    <!-- Company tab -->
    <div v-if="tab === 'company'" class="space-y-6">
      <p class="text-sm text-neutral-500">Estos datos se usan como predeterminados al crear un nuevo documento. Puedes modificarlos por documento desde el editor.</p>
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-lg bg-neutral-100 flex items-center justify-center overflow-hidden border border-neutral-200">
          <img v-if="settings.logo" :src="settings.logo" class="w-full h-full object-contain" alt="Logo" />
          <span v-else class="text-neutral-400 text-xs">Logo</span>
        </div>
        <label class="cursor-pointer">
          <input ref="logoUploadRef" type="file" accept="image/*" class="hidden" @change="handleLogoUpload" />
          <AppButton variant="secondary" size="sm" @click="logoUploadRef?.click()">Seleccionar logo</AppButton>
        </label>
        <AppButton v-if="settings.logo" variant="ghost" size="sm" @click="settings.setLogo(undefined)">Quitar</AppButton>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AppInput label="Nombre comercial" :modelValue="settings.company.name" @update:modelValue="settings.company.name = $event" />
        <AppInput label="RFC" :modelValue="settings.company.rfc" @update:modelValue="settings.company.rfc = $event" />
        <AppInput label="Dirección" :modelValue="settings.company.address" class="md:col-span-2" @update:modelValue="settings.company.address = $event" />
        <AppInput label="Teléfono" :modelValue="settings.company.phone" @update:modelValue="settings.company.phone = $event" />
        <AppInput label="Correo" :modelValue="settings.company.email" @update:modelValue="settings.company.email = $event" />
        <AppInput label="Sitio web" :modelValue="settings.company.website" @update:modelValue="settings.company.website = $event" />
      </div>

      <AppCard>
        <h3 class="text-sm font-semibold mb-3">Formato de numeración</h3>
        <p class="text-xs text-neutral-500 mb-4">Configura el prefijo y el número de dígitos para cada tipo de documento.</p>
        <div class="space-y-3">
          <div v-for="t in numberTypes" :key="t.v" class="flex items-center gap-4">
            <span class="text-sm w-24">{{ t.l }}</span>
            <input :value="settings.numberFormat[t.v].prefix" @input="settings.numberFormat[t.v].prefix = ($event.target as HTMLInputElement).value" class="w-16 px-2 py-1.5 text-sm border border-neutral-300 rounded-md bg-white text-center uppercase outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" maxlength="3" />
            <span class="text-xs text-neutral-400">—</span>
            <input :value="settings.numberFormat[t.v].padding" @input="settings.numberFormat[t.v].padding = Math.max(1, Math.min(10, parseInt(($event.target as HTMLInputElement).value) || 1))" class="w-16 px-2 py-1.5 text-sm border border-neutral-300 rounded-md bg-white text-center outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" type="number" min="1" max="10" />
            <span class="text-xs text-neutral-400">dígitos</span>
            <span class="text-sm text-neutral-500 font-mono ml-2">{{ settings.numberFormat[t.v].prefix }}-{{ '0'.repeat(settings.numberFormat[t.v].padding) }}</span>
          </div>
        </div>
      </AppCard>
    </div>

    <!-- Appearance tab -->
    <div v-if="tab === 'appearance'" class="space-y-6">
      <p class="text-sm text-neutral-500">Configura la apariencia por defecto de los documentos nuevos. Cada documento puede tener su propio estilo desde el editor.</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AppSelect label="Estilo predeterminado" :modelValue="settings.defaultStyle" :options="styleOptions" @update:modelValue="settings.defaultStyle = $event as any" />
        <AppSelect label="Tamaño de papel" :modelValue="settings.defaultPaperSize" :options="paperOptions" @update:modelValue="settings.defaultPaperSize = $event as any" />
      </div>

      <p class="text-xs text-neutral-400">Las secciones visibles se configuran desde el editor de documentos.</p>
    </div>

    <!-- Custom fields tab -->
    <div v-if="tab === 'fields'" class="space-y-6">
      <p class="text-sm text-neutral-500">Agrega campos adicionales como número de orden de compra, método de pago, o cualquier otro dato que quieras incluir en tus documentos.</p>
      <AppCard>
        <h3 class="text-sm font-semibold mb-3">Campos personalizados</h3>
        <p class="text-xs text-neutral-500 mb-4">Define campos extra que aparecerán al crear documentos. Los campos se sincronizan automáticamente con los documentos existentes.</p>
        <div class="space-y-2 mb-4">
          <div v-for="(f, i) in settings.customFields" :key="i" class="flex items-center gap-2">
            <span class="text-sm flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md">{{ f.label }}</span>
            <button @click="settings.removeCustomField(i); settings.save()" class="text-neutral-400 hover:text-danger transition-colors p-1" title="Eliminar" aria-label="Eliminar campo">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <p v-if="!settings.customFields.length" class="text-sm text-neutral-400 italic">Sin campos personalizados aún.</p>
        </div>
        <div class="flex gap-2">
          <input v-model="newFieldLabel" placeholder="Nombre del campo (ej. Orden de compra)" class="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-md bg-white outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" @keyup.enter="addField" />
          <AppButton @click="addField" :disabled="!newFieldLabel.trim()">Agregar</AppButton>
        </div>
      </AppCard>
    </div>

    <!-- Data tab -->
    <div v-if="tab === 'data'" class="space-y-6">
      <p class="text-sm text-neutral-500">Todos tus documentos se almacenan localmente en el navegador. Puedes exportar un respaldo o importar documentos desde otro equipo.</p>
      <AppCard>
        <h3 class="text-sm font-semibold mb-1">Exportar respaldo</h3>
        <p class="text-xs text-neutral-500 mb-3">Descarga un archivo JSON con todos tus documentos.</p>
        <AppButton variant="secondary" size="sm" @click="exportAll">Exportar JSON</AppButton>
      </AppCard>

      <AppCard>
        <h3 class="text-sm font-semibold mb-1">Importar documentos</h3>
        <p class="text-xs text-neutral-500 mb-3">Carga un archivo JSON exportado previamente.</p>
        <label class="cursor-pointer">
          <input ref="importUploadRef" type="file" accept=".json" class="hidden" @change="handleImport" />
          <AppButton variant="secondary" size="sm" @click="importUploadRef?.click()">Seleccionar archivo</AppButton>
        </label>
      </AppCard>
    </div>
  </div>
</template>
