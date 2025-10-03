export type UserRole = 'Administrator' | 'Seller'

export type SellerPermissions = {
  canCreateQuotes: boolean
  canEditOwnQuotes: boolean
  canViewAllQuotes: boolean
  canRequestDiscounts: boolean
  canDeleteQuotes: boolean
}

export type User = {
  id: string
  name: string
  email: string
  avatarUrl: string
  role: UserRole
  permissions?: SellerPermissions
}

export type Customer = {
  id: string
  name: string
  cpfCnpj: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  email: string
}

export type QuoteItem = {
  id: string
  code: string
  description: string
  quantity: number
  unitPrice: number
  discount: number // percentage
}

export type QuoteStatus =
  | 'Rascunho'
  | 'Pendente'
  | 'Aprovado'
  | 'Rejeitado'
  | 'Fechado'

export type ApprovalStatus = 'Pendente' | 'Aprovado' | 'Rejeitado'

export type Quote = {
  id: string
  customer: Customer
  createdAt: Date
  validUntil: Date
  salesperson: User
  items: QuoteItem[]
  totalValue: number
  globalDiscount: number // percentage
  status: QuoteStatus
  paymentConditions: string
  observations: string
  approvalStatus?: ApprovalStatus
  approver?: User
  approvalComments?: string
  requestedAt?: Date
}

export type KpiCardData = {
  title: string
  value: string
  change: number
  period: string
  chartData: { value: number }[]
}

export type RecentActivity = {
  id: string
  description: string
  timestamp: string
  quoteId: string
}
