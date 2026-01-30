'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

export interface ChartData {
  month: string
  rfps: number
  matches: number
}

interface DashboardChartContentProps {
  data: ChartData[]
}

export function DashboardChartContent({ data }: DashboardChartContentProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="month"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
          tickLine={{ stroke: 'hsl(var(--muted))' }}
          axisLine={{ stroke: 'hsl(var(--muted))' }}
        />
        <YAxis
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
          tickLine={{ stroke: 'hsl(var(--muted))' }}
          axisLine={{ stroke: 'hsl(var(--muted))' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Legend />
        <Bar
          dataKey="rfps"
          name="Concursos"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="matches"
          name="Correspondências"
          fill="hsl(142 76% 36%)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
