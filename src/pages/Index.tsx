import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
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
import {
  KpiCardData,
  RecentActivity as RecentActivityType,
  WidgetConfig,
} from '@/types'
import { Layout } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import { CustomizeDashboardSheet } from '@/components/dashboard/CustomizeDashboardSheet'
import { updateDashboardLayout } from '@/services/profiles'
import { useToast } from '@/components/ui/use-toast'

const defaultWidgets: WidgetConfig[] = [
  { id: 'kpiCards' },
  { id: 'vendasMensais' },
  { id: 'statusDistribuicao' },
  { id: 'topClientes' },
  { id: 'atividadeRecente' },
  { id: 'vendasVendedor' },
]

const Index = () => {
  const { profile, user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isSavingLayout, setIsSavingLayout] = useState(false)
  const [widgets, setWidgets] = useState<WidgetConfig[]>(
    profile?.dashboard_layout?.widgets ?? defaultWidgets,
  )

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

  const fetchData = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (profile?.dashboard_layout?.widgets) {
      setWidgets(profile.dashboard_layout.widgets)
    }
  }, [profile])

  const handleSaveLayout = async () => {
    if (!user) return
    setIsSavingLayout(true)
    const { error } = await updateDashboardLayout(user.id, { widgets })
    setIsSavingLayout(false)
    if (error) {
      toast({
        title: 'Erro ao salvar layout',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Layout do dashboard salvo com sucesso!' })
      setIsSheetOpen(false)
    }
  }

  const isWidgetVisible = (id: string) => widgets.some((w) => w.id === id)

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 hidden sm:flex">
            <AvatarImage
              src={profile?.avatar_url || undefined}
              alt={profile?.full_name ?? 'User Avatar'}
            />
            <AvatarFallback>{getInitials(profile?.full_name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-h1">
              Bem-vindo(a), {profile?.full_name || 'Usuário'}!
            </h1>
            <p className="text-muted-foreground">
              Aqui Está um Resumo da Atividade Recente.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button variant="outline" onClick={() => setIsSheetOpen(true)}>
            <Layout className="mr-2 h-4 w-4" />
            <span className="sm:hidden">Editar</span>
            <span className="hidden sm:inline">Personalizar Dashboard</span>
          </Button>
        </div>
      </div>

      {isWidgetVisible('kpiCards') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-[126px] w-full" />
              ))
            : kpiCards.map((card, index) => <KpiCard key={index} {...card} />)}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {isWidgetVisible('vendasMensais') && (
          <div className="lg:col-span-4">
            {isLoading ? (
              <Skeleton className="h-[380px] w-full" />
            ) : (
              <VendasMensaisBarChart data={vendasMensaisData} />
            )}
          </div>
        )}
        {isWidgetVisible('statusDistribuicao') && (
          <div className="lg:col-span-3">
            {isLoading ? (
              <Skeleton className="h-[380px] w-full" />
            ) : (
              <StatusPieChart data={statusData} />
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {isWidgetVisible('topClientes') && (
          <div className="lg:col-span-2">
            {isLoading ? (
              <Skeleton className="h-[380px] w-full" />
            ) : (
              <TopClientesBarChart data={topClientesData} />
            )}
          </div>
        )}
        {isWidgetVisible('atividadeRecente') && (
          <div className="lg:col-span-1">
            {isLoading ? (
              <Skeleton className="h-[380px] w-full" />
            ) : (
              <RecentActivity activities={recentActivities} />
            )}
          </div>
        )}
      </div>

      {isWidgetVisible('vendasVendedor') && (
        <div className="grid gap-4">
          {isLoading ? (
            <Skeleton className="h-[380px] w-full" />
          ) : (
            <OrdensServicoVendedorBarChart data={vendedoresData} />
          )}
        </div>
      )}

      <CustomizeDashboardSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        widgets={widgets}
        onWidgetsChange={setWidgets}
        onSave={handleSaveLayout}
        isSaving={isSavingLayout}
      />
    </div>
  )
}

export default Index
