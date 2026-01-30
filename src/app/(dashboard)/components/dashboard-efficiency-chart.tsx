'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export interface EfficiencyData {
  month: string
  rate: number
}

interface DashboardEfficiencyChartProps {
  data: EfficiencyData[]
}

export function DashboardEfficiencyChart({ data }: DashboardEfficiencyChartProps) {
  if (data.length === 0) {
    return (
      <Card className="py-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Taxa de Aceitação</CardTitle>
          <CardDescription>Evolução mensal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
            Sem dados para exibir
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="py-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Taxa de Aceitação</CardTitle>
        <CardDescription>Evolução mensal</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value) => [`${value}%`, 'Taxa']}
            />
            <ReferenceLine
              y={80}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="hsl(142.1 76.2% 36.3%)"
              strokeWidth={2}
              dot={{ fill: 'hsl(142.1 76.2% 36.3%)', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
