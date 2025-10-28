import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
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

const chartConfig = {
  value: {
    label: 'Ordens de Serviço',
    color: 'hsl(var(--chart-5))',
  },
}

type OrdensServicoVendedorBarChartProps = {
  data: { name: string; value: number }[]
}

export const OrdensServicoVendedorBarChart = ({
  data,
}: OrdensServicoVendedorBarChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h3">O.S. por Vendedor</CardTitle>
        <CardDescription>
          Número de Ordens de Serviço Criadas por Vendedor no Período
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 20, left: -10, bottom: 0 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                fontSize={12}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill={chartConfig.value.color} radius={8} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
