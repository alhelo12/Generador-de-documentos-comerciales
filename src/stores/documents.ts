import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DocumentData, DocumentType } from '@/types/document'
import { get, set, del, keys } from 'idb-keyval'

export const useDocumentsStore = defineStore('documents', () => {
  const docs = ref<DocumentData[]>([])
  const loaded = ref(false)

  const recentDocs = computed(() => docs.value.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 9))

  async function loadAll() {
    if (loaded.value) return
    try {
      const allKeys = await keys()
      const all: DocumentData[] = []
      for (const k of allKeys) {
        if (typeof k === 'string' && k.startsWith('doc-')) {
          const val = await get(k)
          if (val) all.push(val as DocumentData)
        }
      }
      docs.value = all
      loaded.value = true
    } catch { /* ignore */ }
  }

  async function saveDoc(data: DocumentData) {
    data.updatedAt = new Date().toISOString().split('T')[0]
    const idx = docs.value.findIndex(d => d.id === data.id)
    if (idx >= 0) docs.value[idx] = data
    else docs.value.push(data)
    await set(`doc-${data.id}`, data)
  }

  async function deleteDoc(id: string) {
    docs.value = docs.value.filter(d => d.id !== id)
    await del(`doc-${id}`)
  }

  function getById(id: string) {
    return docs.value.find(d => d.id === id) ?? null
  }

  const stats = computed(() => {
    const invoices = docs.value.filter(d => d.type === 'invoice')
    const quotes = docs.value.filter(d => d.type === 'quote')
    const deliveries = docs.value.filter(d => d.type === 'delivery-note')
    return {
      total: docs.value.length,
      invoices: invoices.length,
      quotes: quotes.length,
      deliveries: deliveries.length,
      invoiceTotal: invoices.reduce((s, d) => s + d.items.reduce((si, i) => si + i.quantity * i.unitPrice, 0), 0),
      quoteTotal: quotes.reduce((s, d) => s + d.items.reduce((si, i) => si + i.quantity * i.unitPrice, 0), 0),
    }
  })

  return { docs, loaded, recentDocs, stats, loadAll, saveDoc, deleteDoc, getById }
})
