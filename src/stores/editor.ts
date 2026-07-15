import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import type { DocumentData, DocumentType, LineItem, StyleConfig } from '@/types/document'
import { DEFAULT_STYLE_CONFIG } from '@/types/document'
import { useSettingsStore } from './settings'
import { useDocumentsStore } from './documents'

let nextLineId = 1
function lineId() { return `line-${nextLineId++}` }

function parseSequence(number: string): number {
  const parts = number.split('-')
  const last = parts[parts.length - 1]
  const n = parseInt(last, 10)
  return isNaN(n) ? 0 : n
}

function blankDoc(type: DocumentType): DocumentData {
  const now = new Date().toISOString().split('T')[0]
  const settings = useSettingsStore()
  const fmt = settings.numberFormat[type]
  return {
    id: crypto.randomUUID(),
    type,
    number: `${fmt.prefix}-${String(1).padStart(fmt.padding, '0')}`,
    status: 'draft',
    style: settings.defaultStyle,
    paperSize: settings.defaultPaperSize,
    date: now,
    expiryDate: '',
    company: { ...settings.company },
    client: { name: '', rfc: '', address: '', phone: '', email: '' },
    items: [{ id: lineId(), code: '', description: '', quantity: 1, unitPrice: 0, taxRate: 16 }],
    notes: '',
    paymentTerms: '',
    bankInfo: '',
    signatureClientLabel: 'Firma del cliente',
    signatureCompanyLabel: 'Firma de la empresa',
    styleConfig: { ...DEFAULT_STYLE_CONFIG },
    customFields: [],
    createdAt: now,
    updatedAt: now,
  }
}

export const useEditorStore = defineStore('editor', () => {
  const doc = reactive<DocumentData>(blankDoc('invoice'))

  const subtotal = computed(() => doc.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0))
  const taxAmount = computed(() => doc.items.reduce((s, i) => s + i.quantity * i.unitPrice * (i.taxRate ?? 16) / 100, 0))
  const total = computed(() => subtotal.value + taxAmount.value)

  function generateNumber(type: DocumentType) {
    const settings = useSettingsStore()
    const documents = useDocumentsStore()
    const fmt = settings.numberFormat[type]
    const max = documents.docs
      .filter(d => d.type === type)
      .reduce((mx, d) => Math.max(mx, parseSequence(d.number)), 0)
    doc.number = `${fmt.prefix}-${String(max + 1).padStart(fmt.padding, '0')}`
  }

  function newDoc(type: DocumentType) {
    const settings = useSettingsStore()
    Object.assign(doc, blankDoc(type))
    doc.company = { ...settings.company }
    doc.styleConfig = { ...DEFAULT_STYLE_CONFIG }
    syncCustomFields()
  }

  function syncCustomFields() {
    const settings = useSettingsStore()
    const existing = new Set(doc.customFields.map(f => f.label))
    for (const f of settings.customFields) {
      if (!existing.has(f.label)) {
        doc.customFields.push({ label: f.label, value: '' })
      }
    }
    doc.customFields = doc.customFields.filter(f => settings.customFields.some(sf => sf.label === f.label) || !f.label)
  }

  function loadDoc(data: DocumentData) {
    Object.assign(doc, JSON.parse(JSON.stringify(data)))
    if (!doc.styleConfig) doc.styleConfig = { ...DEFAULT_STYLE_CONFIG }
    syncCustomFields()
  }

  function addItem() {
    doc.items.push({ id: lineId(), code: '', description: '', quantity: 1, unitPrice: 0, taxRate: 16 })
  }

  function removeItem(id: string) {
    if (doc.items.length > 1) {
      const idx = doc.items.findIndex(i => i.id === id)
      if (idx >= 0) doc.items.splice(idx, 1)
    }
  }

  function toJSON(): DocumentData {
    return JSON.parse(JSON.stringify(doc))
  }

  return { doc, subtotal, taxAmount, total, newDoc, generateNumber, loadDoc, addItem, removeItem, toJSON }
})
