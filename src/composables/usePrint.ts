export function usePrint() {
  function printDocument(paperSize?: string) {
    document.getElementById('print-dynamic')?.remove()
    const style = document.createElement('style')
    style.id = 'print-dynamic'
    style.textContent = `@page { margin: 10mm; size: ${paperSize === 'a4' ? 'A4' : 'letter'} portrait; }`
    document.head.appendChild(style)
    document.body.classList.add('printing')
    const cleanup = () => {
      style.remove()
      document.body.classList.remove('printing')
    }
    window.addEventListener('afterprint', cleanup, { once: true })
    window.print()
  }

  async function downloadPdf(element: HTMLElement, paperSize: string, filename: string) {
    const { default: html2pdf } = await import('html2pdf.js')
    const previous = {
      width: element.style.width,
      minHeight: element.style.minHeight,
      padding: element.style.padding,
    }
    const isA4 = paperSize === 'a4'

    element.classList.add('pdf-exporting')
    element.style.width = isA4 ? '210mm' : '215.9mm'
    element.style.minHeight = isA4 ? '297mm' : '279.4mm'
    element.style.padding = '10mm'

    try {
      const options = {
        margin: 0,
        filename: `${filename.replace(/[^a-zA-Z0-9_-]+/g, '-')}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: isA4 ? 'a4' : 'letter', orientation: 'portrait' as const },
        pagebreak: { mode: ['css', 'legacy'] },
      }
      // ponytail: HTML rasterization keeps the three existing templates as the single source of truth.
      const blob = await html2pdf().set(options).from(element).outputPdf('blob') as Blob
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = options.filename
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      element.classList.remove('pdf-exporting')
      element.style.width = previous.width
      element.style.minHeight = previous.minHeight
      element.style.padding = previous.padding
    }
  }

  return { printDocument, downloadPdf }
}
