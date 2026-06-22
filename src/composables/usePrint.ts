export function usePrint() {
  function printDocument(paperSize?: string) {
    const style = document.createElement('style')
    style.id = 'print-dynamic'
    style.textContent = `@page { margin: 15mm; size: ${paperSize === 'a4' ? 'A4' : 'letter'}; }`
    document.head.appendChild(style)
    window.print()
    const cleanup = () => style.remove()
    window.addEventListener('afterprint', cleanup, { once: true })
    setTimeout(cleanup, 1000)
  }

  return { printDocument }
}
