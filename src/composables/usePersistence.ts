import { useDocumentsStore } from '@/stores/documents'

export function usePersistence() {
  const store = useDocumentsStore()

  async function exportAll() {
    await store.loadAll()
    const blob = new Blob([JSON.stringify(store.docs, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `facto-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          if (!Array.isArray(data)) throw new Error('Formato inválido')
          resolve(`Importados ${data.length} documentos`)
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
