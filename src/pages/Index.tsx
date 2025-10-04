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

// NOTE: Dashboard data is still using mock data for demonstration.
// A full implementation would require fetching this data from Supabase.
import {
  mockKpiCards,
  mockStatusData,
  mockVendasMensaisData,
  mockTopClientesData,
  mockRecentActivities,
  mockVendedoresData,
} from '@/lib/temp-mock-data'

const Index = () => {
  const { profile } = useAuth()

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Bem-vindo(a), {profile?.full_name || 'Usuário'}!
          </h1>
          <p className="text-muted-foreground">
            Você tem 3 ordens de serviço pendentes de aprovação.
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
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mockKpiCards.map((card, index) => (
          <KpiCard key={index} {...card} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <VendasMensaisBarChart data={mockVendasMensaisData} />
        </div>
        <div className="lg:col-span-3">
          <StatusPieChart data={mockStatusData} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TopClientesBarChart data={mockTopClientesData} />
        </div>
        <div className="lg:col-span-1">
          <RecentActivity activities={mockRecentActivities} />
        </div>
      </div>

      <div className="grid gap-4">
        <OrdensServicoVendedorBarChart data={mockVendedoresData} />
      </div>
    </div>
  )
}

export default Index
