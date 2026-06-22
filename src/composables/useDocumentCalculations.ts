export function useDocumentCalculations() {
  function formatCurrency(amount: number, symbol = '$'): string {
    return `${symbol}${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  function calcSubtotal(items: { quantity: number; unitPrice: number }[]): number {
    return items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  }

  function calcTax(subtotal: number, taxRate: number): number {
    return subtotal * taxRate / 100
  }

  return { formatCurrency, calcSubtotal, calcTax }
}
