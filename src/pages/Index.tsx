import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { StatusPieChart } from '@/components/dashboard/StatusPieChart'
import { VendasMensaisBarChart } from '@/components/dashboard/VendasMensaisBarChart'
import { TopClientesBarChart } from '@/components/dashboard/TopClientesBarChart'
import { OrdensServicoVendedorBarChart } from '@/components/dashboard/OrdensServicoVendedorBarChart'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { useAuth } from '@/hooks/use-auth'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getKpiData,
  getStatusDistribution,
  getMonthlySales,
  getTopCustomers,
  getSalesBySalesperson,
  getRecentActivities,
} from '@/services/dashboard'
import { KpiCardData, RecentActivity as RecentActivityType } from '@/types'
import { ConnectWalletButton } from '@/components/ConnectWalletButton'

const Index = () => {
  const { profile } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [kpiCards, setKpiCards] = useState<KpiCardData[]>([])
  const [statusData, setStatusData] = useState<
    { name: string; value: number }[]
  >([])
  const [vendasMensaisData, setVendasMensaisData] = useState<
    { name: string; total: number }[]
  >([])
  const [topClientesData, setTopClientesData] = useState<
    { name: string; value: number }[]
  >([])
  const [vendedoresData, setVendedoresData] = useState<
    { name: string; value: number }[]
  >([])
  const [recentActivities, setRecentActivities] = useState<
    RecentActivityType[]
  >([])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const [kpi, status, monthly, topCustomers, salesperson, activities] =
        await Promise.all([
          getKpiData(),
          getStatusDistribution(),
          getMonthlySales(),
          getTopCustomers(),
          getSalesBySalesperson(),
          getRecentActivities(),
        ])

      if (kpi) {
        setKpiCards([
          {
            title: 'Ordens de Serviço Criadas',
            value: kpi.createdCount?.toString() ?? '0',
            change: 5,
            period: 'vs. mês passado',
            chartData: Array.from({ length: 7 }, (_, i) => ({
              value: 10 + i * 2,
            })),
          },
          {
            title: 'Vendas Fechadas',
            value: `R$ ${kpi.totalSales.toLocaleString('pt-BR')}`,
            change: 12,
            period: 'vs. mês passado',
            chartData: Array.from({ length: 7 }, (_, i) => ({
              value: 15 + i * 3,
            })),
          },
          {
            title: 'Valor Total de O.S.',
            value: `R$ ${kpi.totalValue.toLocaleString('pt-BR')}`,
            change: -2,
            period: 'vs. mês passado',
            chartData: Array.from({ length: 7 }, (_, i) => ({ value: 20 - i })),
          },
          {
            title: 'Taxa de Conversão',
            value: `${kpi.conversionRate.toFixed(1)}%`,
            change: 1.5,
            period: 'vs. mês passado',
            chartData: Array.from({ length: 7 }, (_, i) => ({
              value: 22 + Math.sin(i),
            })),
          },
        ])
      }
      setStatusData(status)
      setVendasMensaisData(monthly)
      setTopClientesData(topCustomers)
      setVendedoresData(salesperson)
      setRecentActivities(activities)

      setIsLoading(false)
    }
    fetchData()
  }, [])

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Bem-vindo(a), {profile?.full_name || 'Usuário'}!
          </h1>
          <p className="text-muted-foreground">
            Aqui está um resumo da atividade recente.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select defaultValue="30d">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Mês Atual</SelectItem>
              <SelectItem value="1y">Ano Atual</SelectItem>
            </SelectContent>
          </Select>
          <ConnectWalletButton />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-[126px] w-full" />
            ))
          : kpiCards.map((card, index) => <KpiCard key={index} {...card} />)}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          {isLoading ? (
            <Skeleton className="h-[380px] w-full" />
          ) : (
            <VendasMensaisBarChart data={vendasMensaisData} />
          )}
        </div>
        <div className="lg:col-span-3">
          {isLoading ? (
            <Skeleton className="h-[380px] w-full" />
          ) : (
            <StatusPieChart data={statusData} />
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {isLoading ? (
            <Skeleton className="h-[380px] w-full" />
          ) : (
            <TopClientesBarChart data={topClientesData} />
          )}
        </div>
        <div className="lg:col-span-1">
          {isLoading ? (
            <Skeleton className="h-[380px] w-full" />
          ) : (
            <RecentActivity activities={recentActivities} />
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <Skeleton className="h-[380px] w-full" />
        ) : (
          <OrdensServicoVendedorBarChart data={vendedoresData} />
        )}
      </div>
    </div>
  )
}

export default Index
