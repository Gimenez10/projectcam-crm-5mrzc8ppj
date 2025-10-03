import { ArrowUp, ArrowDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'
import { KpiCardData } from '@/types'
import { Bar, BarChart, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'

export const KpiCard = ({
  title,
  value,
  change,
  period,
  chartData,
}: KpiCardData) => {
  const isPositive = change >= 0

  return (
    <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-10 w-20">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <Bar
                dataKey="value"
                fill={
                  isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))'
                }
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p
          className={cn(
            'text-xs text-muted-foreground flex items-center',
            isPositive ? 'text-success' : 'text-destructive',
          )}
        >
          {isPositive ? (
            <ArrowUp className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDown className="h-4 w-4 mr-1" />
          )}
          {Math.abs(change)}% {period}
        </p>
      </CardContent>
    </Card>
  )
}
