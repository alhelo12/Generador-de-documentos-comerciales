import { useDocumentsStore } from '@/stores/documents'
import type { DocumentData } from '@/types/document'

export function usePersistence() {
  const store = useDocumentsStore()

  async function exportAll() {
    await store.loadAll()
    const blob = new Blob([JSON.stringify(store.docs, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `docgen-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importFromFile(file: File): Promise<DocumentData[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string)
          if (!Array.isArray(data)) throw new Error('Formato inválido')
          resolve(data as DocumentData[])
        } catch (err) {
          reject(new Error('Archivo inválido'))
        }
      }
      reader.onerror = () => reject(new Error('Error al leer archivo'))
      reader.readAsText(file)
    })
  }

  return { exportAll, importFromFile }
}
