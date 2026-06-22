import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CompanyData, SectionConfig, CustomField, TemplateStyle, PaperSize, DocumentType, StyleConfig, NumberFormat } from '@/types/document'
import { DEFAULT_SECTIONS, DEFAULT_STYLE_CONFIG, DEFAULT_NUMBER_FORMAT } from '@/types/document'

export const useSettingsStore = defineStore('settings', () => {
  const company = ref<CompanyData>({
    name: 'Mi Empresa',
    rfc: 'RFC000000000',
    address: 'Calle Principal 123, Col. Centro',
    phone: '33 1234 5678',
    email: ' contacto@miempresa.com',
    website: 'www.miempresa.com',
  })

  const logo = ref<string | undefined>(undefined)

  const defaultStyle = ref<TemplateStyle>('classic')
  const defaultPaperSize = ref<PaperSize>('letter')
  const sections = ref<SectionConfig[]>(JSON.parse(JSON.stringify(DEFAULT_SECTIONS)))
  const customFields = ref<CustomField[]>([])
  const styleConfig = ref<StyleConfig>({ ...DEFAULT_STYLE_CONFIG })
  const numberFormat = ref<NumberFormat>(JSON.parse(JSON.stringify(DEFAULT_NUMBER_FORMAT)))

  function setLogo(dataUrl: string | undefined) {
    logo.value = dataUrl
    if (dataUrl) company.value.logo = dataUrl
  }

  function toggleSection(id: string) {
    let s = sections.value.find(s => s.id === id)
    if (!s) {
      s = { id, label: id, enabled: true }
      sections.value.push(s)
    }
    s.enabled = !s.enabled
  }

  function updateCompany(data: Partial<CompanyData>) {
    Object.assign(company.value, data)
  }

  function addCustomField(label: string) {
    customFields.value.push({ label, value: '' })
  }

  function removeCustomField(index: number) {
    customFields.value.splice(index, 1)
  }

  function save() {
    localStorage.setItem('facto-settings', JSON.stringify({
      company: company.value,
      logo: logo.value,
      defaultStyle: defaultStyle.value,
      defaultPaperSize: defaultPaperSize.value,
      sections: sections.value,
      customFields: customFields.value,
      styleConfig: styleConfig.value,
      numberFormat: numberFormat.value,
    }))
  }

  function load() {
    try {
      const raw = localStorage.getItem('facto-settings')
      if (!raw) return
      const data = JSON.parse(raw)
      if (data.company) company.value = data.company
      if (data.logo) logo.value = data.logo
      if (data.defaultStyle) defaultStyle.value = data.defaultStyle
      if (data.defaultPaperSize) defaultPaperSize.value = data.defaultPaperSize
      if (data.customFields) customFields.value = data.customFields
      if (data.styleConfig) styleConfig.value = data.styleConfig
      if (data.numberFormat) numberFormat.value = data.numberFormat
      if (data.sections) {
        const savedIds = new Set(data.sections.map((s: SectionConfig) => s.id))
        for (const def of DEFAULT_SECTIONS) {
          if (!savedIds.has(def.id)) data.sections.push({ ...def })
        }
        sections.value = data.sections
      }
    } catch { /* ignore */ }
  }

  load()

  return { company, logo, defaultStyle, defaultPaperSize, sections, customFields, styleConfig, numberFormat, setLogo, toggleSection, updateCompany, addCustomField, removeCustomField, save, load }
})
