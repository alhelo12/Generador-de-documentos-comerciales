import { inject } from 'vue'

export function useToast() {
  const toast = inject<{ show: (msg: string, type?: 'success' | 'error' | 'info', duration?: number) => void }>('toast')
  if (!toast) throw new Error('useToast() must be used within a provider')
  return toast
}
