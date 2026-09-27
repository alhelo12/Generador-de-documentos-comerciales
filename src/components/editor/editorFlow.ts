export type EditorStep = 'basics' | 'client' | 'items' | 'review'

export const editorSteps: { id: EditorStep; label: string; shortLabel: string }[] = [
  { id: 'basics', label: 'Documento', shortLabel: 'Datos' },
  { id: 'client', label: 'Cliente', shortLabel: 'Cliente' },
  { id: 'items', label: 'Conceptos', shortLabel: 'Líneas' },
  { id: 'review', label: 'Revisar', shortLabel: 'Revisar' },
]
