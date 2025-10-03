import {
  User,
  Customer,
  Quote,
  QuoteStatus,
  KpiCardData,
  RecentActivity,
} from '@/types'
import { subDays, subMonths } from 'date-fns'

export const mockUser: User = {
  id: 'user-1',
  name: 'Ana Silva',
  email: 'ana.silva@projecam.com',
  avatarUrl: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=1',
}

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

const statuses: QuoteStatus[] = [
  'Rascunho',
  'Pendente',
  'Aprovado',
  'Rejeitado',
  'Fechado',
]

export const mockQuotes: Quote[] = Array.from({ length: 25 }, (_, i) => {
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

  return {
    id: `ORC-${2024001 + i}`,
    customer,
    createdAt: subDays(new Date(), i * 2),
    validUntil: new Date(),
    salesperson: mockUser,
    items,
    totalValue,
    globalDiscount,
    status,
    paymentConditions: '30/60 dias',
    observations: 'Instalação a ser agendada.',
    approvalStatus: globalDiscount > 5 ? 'Pendente' : undefined,
    requestedAt: globalDiscount > 5 ? subDays(new Date(), i * 2) : undefined,
  }
})

export const mockKpiCards: KpiCardData[] = [
  {
    title: 'Orçamentos Criados',
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
    title: 'Valor Total de Orçamentos',
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
    description: 'Orçamento #ORC-2024025 aprovado por Gerente.',
    timestamp: '2 horas atrás',
    quoteId: 'ORC-2024025',
  },
  {
    id: 'act-2',
    description: 'Novo orçamento #ORC-2024001 criado por Ana Silva.',
    timestamp: '5 horas atrás',
    quoteId: 'ORC-2024001',
  },
  {
    id: 'act-3',
    description: 'Orçamento #ORC-2024015 rejeitado.',
    timestamp: '1 dia atrás',
    quoteId: 'ORC-2024015',
  },
  {
    id: 'act-4',
    description: 'Orçamento #ORC-2024010 enviado para aprovação.',
    timestamp: '2 dias atrás',
    quoteId: 'ORC-2024010',
  },
]
