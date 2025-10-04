import { KpiCardData, RecentActivity } from '@/types'
import { subMonths } from 'date-fns'

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
    description: `Ordem de Serviço #OS-123 aprovada por Gerente.`,
    timestamp: '2 horas atrás',
    serviceOrderId: 'os-1',
  },
  {
    id: 'act-2',
    description: `Nova ordem de serviço #OS-124 criada por Ana Silva.`,
    timestamp: '5 horas atrás',
    serviceOrderId: 'os-2',
  },
]
