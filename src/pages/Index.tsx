import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
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
import { OrcamentosVendedorBarChart } from '@/components/dashboard/OrcamentosVendedorBarChart'
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
            Você tem 3 orçamentos pendentes de aprovação.
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

      <div className="grid gap-4 md:grid-cols-2">
        <OrcamentosVendedorBarChart />
        <div className="flex flex-col items-center justify-center gap-4 p-6 bg-card rounded-lg border">
          <h3 className="text-xl font-semibold">Ações Rápidas</h3>
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button asChild className="w-full">
              <Link to="/orcamentos/novo">Criar Novo Orçamento</Link>
            </Button>
            <Button asChild variant="secondary" className="w-full">
              <Link to="/aprovacoes">Ver Aprovações Pendentes</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Index
