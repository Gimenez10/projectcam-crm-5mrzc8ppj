export type UserRole = 'Administrator' | 'Seller'

export type Permission =
  // Quotes
  | 'quotes:create'
  | 'quotes:read:own'
  | 'quotes:read:all'
  | 'quotes:update:own'
  | 'quotes:update:all'
  | 'quotes:delete:own'
  | 'quotes:delete:all'
  | 'quotes:approve_discounts'
  // Customers
  | 'customers:create'
  | 'customers:read'
  | 'customers:update'
  | 'customers:delete'
  // Products
  | 'products:create'
  | 'products:read'
  | 'products:update'
  | 'products:delete'
  // Users & Roles
  | 'users:manage'
  | 'roles:manage'
  // Settings
  | 'settings:view'

export type Role = {
  id: string
  name: string
  description: string
  permissions: Permission[]
}

export type UserStatus = 'Active' | 'Pending Approval' | 'Inactive'

export type User = {
  id: string
  name: string
  email: string
  avatarUrl: string
  role: Role
  status: UserStatus
  createdAt: Date
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

export type AuditLog = {
  id: string
  user: Pick<User, 'id' | 'name' | 'avatarUrl'>
  action: string
  details: string
  timestamp: Date
}
