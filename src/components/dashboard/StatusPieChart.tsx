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

const chartConfig = {
  value: { label: 'Ordens de Serviço' },
  Rascunho: { label: 'Rascunho', color: 'hsl(var(--muted-foreground))' },
  Pendente: { label: 'Pendente', color: 'hsl(var(--chart-3))' },
  Aprovado: { label: 'Aprovado', color: 'hsl(var(--chart-1))' },
  Rejeitado: { label: 'Rejeitado', color: 'hsl(var(--chart-4))' },
  Fechado: { label: 'Fechado', color: 'hsl(var(--chart-2))' },
}

type StatusPieChartProps = {
  data: { name: string; value: number }[]
}

export const StatusPieChart = ({ data }: StatusPieChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ordens de Serviço por Status</CardTitle>
        <CardDescription>
          Distribuição das ordens de serviço atuais
        </CardDescription>
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
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
              >
                {data.map((entry) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={
                      chartConfig[entry.name as keyof typeof chartConfig]?.color
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
