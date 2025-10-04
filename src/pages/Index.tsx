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
import { mockKpiCards, mockUser } from '@/lib/mock-data'

const Index = () => {
  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Bem-vindo(a), {mockUser.name}!
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
        {mockKpiCards.map((card) => (
          <KpiCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <VendasMensaisBarChart />
        </div>
        <div className="lg:col-span-3">
          <StatusPieChart />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TopClientesBarChart />
        </div>
        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
      </div>

      <div className="grid gap-4">
        <OrdensServicoVendedorBarChart />
      </div>
    </div>
  )
}

export default Index
