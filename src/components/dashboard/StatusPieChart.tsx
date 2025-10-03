import { Pie, PieChart, ResponsiveContainer, Cell, Legend } from 'recharts'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { mockStatusData } from '@/lib/mock-data'

const chartConfig = {
  value: { label: 'Orçamentos' },
  Rascunho: { label: 'Rascunho', color: 'hsl(var(--muted-foreground))' },
  Pendente: { label: 'Pendente', color: 'hsl(var(--chart-3))' },
  Aprovado: { label: 'Aprovado', color: 'hsl(var(--chart-1))' },
  Rejeitado: { label: 'Rejeitado', color: 'hsl(var(--chart-4))' },
  Fechado: { label: 'Fechado', color: 'hsl(var(--chart-2))' },
}

export const StatusPieChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Orçamentos por Status</CardTitle>
        <CardDescription>Distribuição dos orçamentos atuais</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[250px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={mockStatusData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
              >
                {mockStatusData.map((entry) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={
                      chartConfig[entry.name as keyof typeof chartConfig].color
                    }
                  />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
