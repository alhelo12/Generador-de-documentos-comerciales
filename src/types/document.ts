export type DocumentType = 'invoice' | 'delivery-note' | 'quote'
export type DocumentStatus = 'draft' | 'sent' | 'paid' | 'cancelled'
export type TemplateStyle = 'classic' | 'modern' | 'minimal'
export type PaperSize = 'letter' | 'a4'
export type LogoPosition = 'left' | 'center' | 'right'
export type DocFontFamily = 'classic-serif' | 'modern-sans' | 'minimal-sans'

export interface StyleConfig {
  accentColor: string
  fontFamily: DocFontFamily
  logoPosition: LogoPosition
  showRfc: boolean
  showPhone: boolean
  showEmail: boolean
  showDocumentNumber: boolean
  showDate: boolean
  taxLabel: string
  currencySymbol: string
}

export interface CompanyData {
  logo?: string
  name: string
  rfc: string
  address: string
  phone: string
  email: string
  website: string
}

export interface ClientData {
  name: string
  rfc: string
  address: string
  phone: string
  email: string
}

export interface LineItem {
  id: string
  code: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
}

export interface SectionConfig {
  id: string
  label: string
  enabled: boolean
}

export interface CustomField {
  label: string
  value: string
}

export interface NumberFormat {
  invoice: { prefix: string; padding: number }
  'delivery-note': { prefix: string; padding: number }
  quote: { prefix: string; padding: number }
}

export interface DocumentData {
  id: string
  type: DocumentType
  number: string
  status: DocumentStatus
  style: TemplateStyle
  paperSize: PaperSize
  styleConfig: StyleConfig
  date: string
  expiryDate: string
  company: CompanyData
  client: ClientData
  items: LineItem[]
  notes: string
  paymentTerms: string
  bankInfo: string
  signatureClientLabel: string
  signatureCompanyLabel: string
  customFields: CustomField[]
  createdAt: string
  updatedAt: string
}

export const DEFAULT_STYLE_CONFIG: StyleConfig = {
  accentColor: '#2d2d2d',
  fontFamily: 'classic-serif',
  logoPosition: 'left',
  showRfc: true,
  showPhone: true,
  showEmail: true,
  showDocumentNumber: true,
  showDate: true,
  taxLabel: 'IVA',
  currencySymbol: '$',
}

export const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: 'company', label: 'Datos de empresa', enabled: true },
  { id: 'client', label: 'Datos del cliente', enabled: true },
  { id: 'items', label: 'Tabla de conceptos', enabled: true },
  { id: 'totals', label: 'Subtotal/IVA/Total', enabled: true },
  { id: 'payment-terms', label: 'Condiciones de pago', enabled: false },
  { id: 'bank-info', label: 'Datos bancarios', enabled: false },
  { id: 'notes', label: 'Notas al pie', enabled: false },
  { id: 'signature-client', label: 'Firma del cliente', enabled: false },
  { id: 'signature-company', label: 'Firma de la empresa', enabled: false },
  { id: 'custom-fields', label: 'Campos personalizados', enabled: false },
]

export const DEFAULT_NUMBER_FORMAT: NumberFormat = {
  invoice: { prefix: 'F', padding: 3 },
  'delivery-note': { prefix: 'R', padding: 3 },
  quote: { prefix: 'C', padding: 3 },
}
