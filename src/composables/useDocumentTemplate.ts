import { computed } from 'vue'
import type { DocumentData, SectionConfig } from '@/types/document'
import { useDocumentCalculations } from '@/composables/useDocumentCalculations'

export const TYPE_TITLES: Record<string, string> = {
  'invoice': 'FACTURA',
  'delivery-note': 'NOTA DE REMISIÓN',
  'quote': 'COTIZACIÓN',
}

export const FONT_MAP: Record<string, string> = {
  'classic-serif': '"Source Serif 4", Georgia, serif',
  'modern-sans': '"Archivo", "Inter Tight", system-ui, sans-serif',
  'minimal-sans': '"Archivo", "Inter Tight", system-ui, sans-serif',
}

export function useDocumentTemplate(doc: DocumentData, sections: SectionConfig[]) {
  const { formatCurrency } = useDocumentCalculations()
  const sc = doc.styleConfig
  const accent = computed(() => sc.accentColor === '#2d2d2d'
    ? '#0A0A0A'
    : sc.accentColor)
  const typeTitle = (k: string) => TYPE_TITLES[k] ?? k
  const subtotal = computed(() => doc.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0))
  const tax = computed(() => doc.items.reduce((s, i) => s + i.quantity * i.unitPrice * (i.taxRate ?? 16) / 100, 0))
  const total = computed(() => subtotal.value + tax.value)
  const taxRows = computed(() => {
    const groups = new Map<number, number>()
    for (const item of doc.items) {
      const rate = item.taxRate ?? 16
      groups.set(rate, (groups.get(rate) ?? 0) + item.quantity * item.unitPrice * rate / 100)
    }
    return [...groups.entries()].sort(([a], [b]) => b - a).map(([rate, amount]) => ({ rate, amount }))
  })
  const enabled = (id: string) => sections.find(s => s.id === id)?.enabled ?? true
  const fontFamilyOf = () => FONT_MAP[sc.fontFamily] ?? FONT_MAP['classic-serif']
  const formatDate = (value: string) => value
    ? new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`))
    : ''

  return { sc, accent, typeTitle, subtotal, tax, total, taxRows, enabled, fontFamilyOf, formatCurrency, formatDate }
}
