import {
  User,
  Customer,
  ServiceOrder,
  ServiceOrderStatus,
  KpiCardData,
  RecentActivity,
  Role,
  Permission,
  AuditLog,
} from '@/types'
import { subDays, subMonths, subHours } from 'date-fns'

export const mockPermissions: Permission[] = [
  'service_orders:create',
  'service_orders:read:own',
  'service_orders:read:all',
  'service_orders:update:own',
  'service_orders:update:all',
  'service_orders:delete:own',
  'service_orders:delete:all',
  'service_orders:approve_discounts',
  'customers:create',
  'customers:read',
  'customers:update',
  'customers:delete',
  'products:create',
  'products:read',
  'products:update',
  'products:delete',
  'users:manage',
  'roles:manage',
  'settings:view',
]

export const mockRoles: Role[] = [
  {
    id: 'role-admin',
    name: 'Administrator',
    description: 'Acesso total a todas as funcionalidades do sistema.',
    permissions: mockPermissions,
  },
  {
    id: 'role-seller',
    name: 'Vendedor',
    description: 'Cria e gerencia suas próprias ordens de serviço.',
    permissions: [
      'service_orders:create',
      'service_orders:read:own',
      'service_orders:update:own',
      'service_orders:delete:own',
      'customers:create',
      'customers:read',
    ],
  },
  {
    id: 'role-manager',
    name: 'Gerente de Vendas',
    description: 'Visualiza todas as ordens de serviço e aprova descontos.',
    permissions: [
      'service_orders:read:all',
      'service_orders:update:all',
      'service_orders:approve_discounts',
      'customers:read',
      'customers:update',
    ],
  },
]

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Ana Silva',
    email: 'ana.silva@projecam.com',
    avatarUrl: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=1',
    role: mockRoles[0],
    status: 'Active',
    createdAt: subDays(new Date(), 30),
  },
  {
    id: 'user-2',
    name: 'Bruno Costa',
    email: 'bruno.costa@projecam.com',
    avatarUrl: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=2',
    role: mockRoles[1],
    status: 'Active',
    createdAt: subDays(new Date(), 15),
  },
  {
    id: 'user-3',
    name: 'Carla Dias',
    email: 'carla.dias@projecam.com',
    avatarUrl: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=3',
    role: mockRoles[2],
    status: 'Active',
    createdAt: subDays(new Date(), 5),
  },
  {
    id: 'user-4',
    name: 'Daniel Souza',
    email: 'daniel.souza@projecam.com',
    avatarUrl: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=4',
    role: mockRoles[1],
    status: 'Pending Approval',
    createdAt: subDays(new Date(), 1),
  },
]

export const mockUser: User = mockUsers[0]

const mockCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Construtora Alfa',
    cpfCnpj: '12.345.678/0001-90',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    phone: '(11) 98765-4321',
    email: 'contato@alfa.com',
  },
  {
    id: 'cust-2',
    name: 'Indústria Beta',
    cpfCnpj: '98.765.432/0001-10',
    address: 'Avenida Principal, 456',
    city: 'Rio de Janeiro',
    state: 'RJ',
    zipCode: '20000-000',
    phone: '(21) 91234-5678',
    email: 'compras@beta.com.br',
  },
  {
    id: 'cust-3',
    name: 'Comércio Gama',
    cpfCnpj: '54.321.987/0001-20',
    address: 'Praça Central, 789',
    city: 'Belo Horizonte',
    state: 'MG',
    zipCode: '30170-001',
    phone: '(31) 95555-4444',
    email: 'adm@gama.com',
  },
]

const statuses: ServiceOrderStatus[] = [
  'Rascunho',
  'Pendente',
  'Aprovado',
  'Rejeitado',
  'Fechado',
]

const generatedIds = new Set<number>()
const generateUniqueId = (): number => {
  let id = Math.floor(Math.random() * 1001)
  while (generatedIds.has(id)) {
    id = Math.floor(Math.random() * 1001)
  }
  generatedIds.add(id)
  return id
}

export const mockServiceOrders: ServiceOrder[] = Array.from(
  { length: 25 },
  (_, i) => {
    const customer = mockCustomers[i % mockCustomers.length]
    const status = statuses[i % statuses.length]
    const items = [
      {
        id: `item-${i}-1`,
        code: `PROD-00${i + 1}`,
        description: `Produto de Teste ${i + 1}`,
        quantity: (i % 5) + 1,
        unitPrice: 100 + i * 10,
        discount: i % 4 === 0 ? 5 : 0,
      },
      {
        id: `item-${i}-2`,
        code: `SERV-00${i + 1}`,
        description: `Serviço de Instalação ${i + 1}`,
        quantity: 1,
        unitPrice: 250 + i * 5,
        discount: 0,
      },
    ]
    const subtotal = items.reduce(
      (acc, item) =>
        acc + item.quantity * item.unitPrice * (1 - item.discount / 100),
      0,
    )
    const globalDiscount = i % 5 === 0 ? 10 : 0
    const totalValue = subtotal * (1 - globalDiscount / 100)
    const id = `OS-${generateUniqueId()}`

    return {
      id,
      customer,
      createdAt: subDays(new Date(), i * 2),
      validUntil: new Date(),
      salesperson: mockUsers[1],
      items,
      totalValue,
      globalDiscount,
      status,
      paymentConditions: '30/60 dias',
      observations: 'Instalação a ser agendada.',
      approvalStatus: globalDiscount > 5 ? 'Pendente' : undefined,
      requestedAt: globalDiscount > 5 ? subDays(new Date(), i * 2) : undefined,
    }
  },
)

export const mockKpiCards: KpiCardData[] = [
  {
    title: 'Ordens de Serviço Criadas',
    value: '150',
    change: 5,
    period: 'vs. mês passado',
    chartData: Array.from({ length: 7 }, (_, i) => ({ value: 10 + i * 2 })),
  },
  {
    title: 'Vendas Fechadas',
    value: 'R$ 250.000',
    change: 12,
    period: 'vs. mês passado',
    chartData: Array.from({ length: 7 }, (_, i) => ({ value: 15 + i * 3 })),
  },
  {
    title: 'Valor Total de O.S.',
    value: 'R$ 1.2M',
    change: -2,
    period: 'vs. mês passado',
    chartData: Array.from({ length: 7 }, (_, i) => ({ value: 20 - i })),
  },
  {
    title: 'Taxa de Conversão',
    value: '25%',
    change: 1.5,
    period: 'vs. mês passado',
    chartData: Array.from({ length: 7 }, (_, i) => ({
      value: 22 + Math.sin(i),
    })),
  },
]

export const mockStatusData = [
  { name: 'Rascunho', value: 15, fill: 'var(--color-gray)' },
  { name: 'Pendente', value: 35, fill: 'var(--color-yellow)' },
  { name: 'Aprovado', value: 25, fill: 'var(--color-blue)' },
  { name: 'Rejeitado', value: 10, fill: 'var(--color-red)' },
  { name: 'Fechado', value: 40, fill: 'var(--color-green)' },
]

export const mockVendasMensaisData = Array.from({ length: 12 }, (_, i) => ({
  name: subMonths(new Date(), 11 - i).toLocaleString('default', {
    month: 'short',
  }),
  total: Math.floor(Math.random() * 50000) + 10000,
}))

export const mockTopClientesData = [
  { name: 'Construtora Alfa', value: 120000 },
  { name: 'Indústria Beta', value: 95000 },
  { name: 'Comércio Gama', value: 82000 },
  { name: 'Soluções Delta', value: 65000 },
  { name: 'Serviços Epsilon', value: 51000 },
]

export const mockVendedoresData = [
  { name: 'Ana Silva', value: 45 },
  { name: 'Bruno Costa', value: 38 },
  { name: 'Carla Dias', value: 52 },
  { name: 'Daniel Souza', value: 29 },
]

export const mockRecentActivities: RecentActivity[] = [
  {
    id: 'act-1',
    description: `Ordem de Serviço #${mockServiceOrders[0].id} aprovada por Gerente.`,
    timestamp: '2 horas atrás',
    serviceOrderId: mockServiceOrders[0].id,
  },
  {
    id: 'act-2',
    description: `Nova ordem de serviço #${mockServiceOrders[1].id} criada por Ana Silva.`,
    timestamp: '5 horas atrás',
    serviceOrderId: mockServiceOrders[1].id,
  },
  {
    id: 'act-3',
    description: `Ordem de Serviço #${mockServiceOrders[2].id} rejeitada.`,
    timestamp: '1 dia atrás',
    serviceOrderId: mockServiceOrders[2].id,
  },
  {
    id: 'act-4',
    description: `Ordem de Serviço #${mockServiceOrders[3].id} enviada para aprovação.`,
    timestamp: '2 dias atrás',
    serviceOrderId: mockServiceOrders[3].id,
  },
]

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    user: mockUsers[0],
    action: 'User Login',
    details: 'User Ana Silva logged in successfully.',
    timestamp: subHours(new Date(), 1),
  },
  {
    id: 'log-2',
    user: mockUsers[1],
    action: 'Create Service Order',
    details: `User Bruno Costa created service order #${mockServiceOrders[0].id}.`,
    timestamp: subHours(new Date(), 2),
  },
  {
    id: 'log-3',
    user: mockUsers[2],
    action: 'Approve Discount',
    details: `User Carla Dias approved discount for service order #${mockServiceOrders[4].id}.`,
    timestamp: subHours(new Date(), 5),
  },
  {
    id: 'log-4',
    user: mockUsers[0],
    action: 'Create User',
    details: 'User Ana Silva created a new user: Daniel Souza.',
    timestamp: subDays(new Date(), 1),
  },
  {
    id: 'log-5',
    user: mockUsers[0],
    action: 'Update Role',
    details: 'User Ana Silva updated permissions for the Vendedor role.',
    timestamp: subDays(new Date(), 2),
  },
]
