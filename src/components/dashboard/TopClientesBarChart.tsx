import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from 'recharts'
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
  value: {
    label: 'Vendas',
    color: 'hsl(var(--chart-2))',
  },
}

type TopClientesBarChartProps = {
  data: { name: string; value: number }[]
}

export const TopClientesBarChart = ({ data }: TopClientesBarChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Clientes</CardTitle>
        <CardDescription>
          Clientes com Maior Volume de Vendas no Período
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ left: 10, right: 20 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                width={120}
                fontSize={12}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value) =>
                      `R$ ${Number(value).toLocaleString('pt-BR')}`
                    }
                  />
                }
              />
              <Bar dataKey="value" fill={chartConfig.value.color} radius={5} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
