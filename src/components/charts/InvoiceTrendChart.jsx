import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

function formatCurrencyShort(value) {
  if (value >= 10000000) return `${(value / 10000000).toFixed(1)} Cr`
  if (value >= 100000) return `${(value / 100000).toFixed(1)} L`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
  return value
}

export default function InvoiceTrendChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        No trend data available.
      </div>
    )
  }

  const chartData = data.map((d) => ({
    month: d.month,
    invoices: d.invoices,
    total_value: d.total_value,
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={chartData} margin={{ left: 10, right: 20 }}>
        <defs>
          <linearGradient id="invoiceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: '#64748b' }}
        />
        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
        <Tooltip
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '12px',
          }}
          formatter={(value, name) => {
            if (name === 'total_value')
              return [formatCurrencyShort(value), 'Total Value']
            return [value, 'Invoices']
          }}
        />
        <Area
          type="monotone"
          dataKey="invoices"
          stroke="#2563eb"
          strokeWidth={2}
          fill="url(#invoiceGradient)"
          name="Invoices"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
