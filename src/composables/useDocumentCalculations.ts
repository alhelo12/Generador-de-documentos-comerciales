export function useDocumentCalculations() {
  function formatCurrency(amount: number, symbol = '$'): string {
    return `${symbol}${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  function docTotal(items: { quantity: number; unitPrice: number; taxRate?: number }[]): number {
    const sub = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
    const tax = items.reduce((s, i) => s + i.quantity * i.unitPrice * (i.taxRate ?? 16) / 100, 0)
    return sub + tax
  }

  return { formatCurrency, docTotal }
}
