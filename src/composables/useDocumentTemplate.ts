import { computed } from 'vue'
import type { DocumentData, SectionConfig } from '@/types/document'
import { useDocumentCalculations } from '@/composables/useDocumentCalculations'

export const TYPE_TITLES: Record<string, string> = {
  'invoice': 'FACTURA',
  'delivery-note': 'NOTA DE REMISIÓN',
  'quote': 'COTIZACIÓN',
}

export const FONT_MAP: Record<string, string> = {
  'classic-serif': '"Source Serif 4", serif',
  'modern-sans': '"Plus Jakarta Sans", sans-serif',
  'minimal-sans': '"Inter Tight", sans-serif',
}

export function useDocumentTemplate(doc: DocumentData, sections: SectionConfig[]) {
  const { formatCurrency } = useDocumentCalculations()
  const sc = doc.styleConfig
  const typeTitle = (k: string) => TYPE_TITLES[k] ?? k
  const subtotal = computed(() => doc.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0))
  const tax = computed(() => doc.items.reduce((s, i) => s + i.quantity * i.unitPrice * (i.taxRate ?? 16) / 100, 0))
  const total = computed(() => subtotal.value + tax.value)
  const enabled = (id: string) => sections.find(s => s.id === id)?.enabled ?? true
  const fontFamilyOf = () => FONT_MAP[sc.fontFamily] ?? FONT_MAP['classic-serif']

  return { sc, typeTitle, subtotal, tax, total, enabled, fontFamilyOf, formatCurrency }
}
