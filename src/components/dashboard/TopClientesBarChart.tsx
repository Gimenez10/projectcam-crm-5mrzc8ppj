import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LabelList,
} from 'recharts'
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
import { mockTopClientesData } from '@/lib/mock-data'

const chartConfig = {
  value: {
    label: 'Valor',
    color: 'hsl(var(--chart-2))',
  },
}

export const TopClientesBarChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Clientes</CardTitle>
        <CardDescription>
          Clientes com maior valor em vendas fechadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={mockTopClientesData}
              layout="vertical"
              margin={{ left: 30 }}
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
              <Bar dataKey="value" fill="var(--color-chart-2)" radius={5}>
                <LabelList
                  dataKey="value"
                  position="right"
                  offset={8}
                  className="fill-foreground"
                  fontSize={12}
                  formatter={(value: number) =>
                    `R$ ${value.toLocaleString('pt-BR')}`
                  }
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
