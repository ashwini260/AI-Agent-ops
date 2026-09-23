import { useState, useEffect, useCallback } from 'react'
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  Download,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import LoadingSpinner from '../components/common/LoadingSpinner.jsx'
import ErrorMessage from '../components/common/ErrorMessage.jsx'
import ExceptionChart from '../components/charts/ExceptionChart.jsx'
import {
  getAnalyticsSummary,
  getAnalyticsTrends,
  getExportUrl,
} from '../services/analyticsService.js'

const PIE_COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#64748b', '#0891b2']

function formatCurrencyShort(value) {
  if (value >= 10000000) return `${(value / 10000000).toFixed(1)} Cr`
  if (value >= 100000) return `${(value / 100000).toFixed(1)} L`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
  return value
}

function KpiCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-800">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  )
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState(null)
  const [trends, setTrends] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' })
  const [hospitalFilter, setHospitalFilter] = useState('')

  const loadAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (dateFilter.from) params.from_date = dateFilter.from
      if (dateFilter.to) params.to_date = dateFilter.to
      if (hospitalFilter) params.hospital = hospitalFilter

      const [summaryRes, trendsRes] = await Promise.all([
        getAnalyticsSummary(params),
        getAnalyticsTrends(params),
      ])
      setSummary(summaryRes.data)
      setTrends(trendsRes.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [dateFilter, hospitalFilter])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">
            Operational analytics and invoice insights
          </p>
        </div>
        <a
          href={getExportUrl()}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          <Download className="h-4 w-4" />
          Export to Excel
        </a>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">From Date</label>
            <input
              type="date"
              value={dateFilter.from}
              onChange={(e) => setDateFilter((prev) => ({ ...prev, from: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">To Date</label>
            <input
              type="date"
              value={dateFilter.to}
              onChange={(e) => setDateFilter((prev) => ({ ...prev, to: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Hospital</label>
            <input
              type="text"
              value={hospitalFilter}
              onChange={(e) => setHospitalFilter(e.target.value)}
              placeholder="Filter by hospital name..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" label="Loading analytics..." />
      ) : summary ? (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard
              icon={FileText}
              label="Total Documents"
              value={summary.total_documents?.toLocaleString()}
              color="bg-blue-600"
            />
            <KpiCard
              icon={CheckCircle2}
              label="Approved"
              value={summary.approved_documents?.toLocaleString()}
              color="bg-green-600"
            />
            <KpiCard
              icon={AlertTriangle}
              label="Review Required"
              value={summary.review_required?.toLocaleString()}
              color="bg-amber-500"
            />
            <KpiCard
              icon={IndianRupee}
              label="Total Invoice Value"
              value={formatCurrencyShort(summary.total_invoice_value)}
              color="bg-navy-700"
            />
          </div>

          {/* Trend chart */}
          {trends?.monthly && (
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="mb-4 text-sm font-semibold text-slate-800">
                Invoice Value Trend
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends.monthly} margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={formatCurrencyShort}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    formatter={(value, name) => {
                      if (name === 'total_value') return [formatCurrencyShort(value), 'Total Value']
                      return [value, 'Invoices']
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="invoices"
                    stroke="#2563eb"
                    strokeWidth={2}
                    name="Invoices"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="total_value"
                    stroke="#16a34a"
                    strokeWidth={2}
                    name="Total Value"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Hospital comparison */}
            {summary.by_hospital && (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <h2 className="mb-4 text-sm font-semibold text-slate-800">
                  Hospital Comparison
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={summary.by_hospital.slice(0, 8)}
                    layout="vertical"
                    margin={{ left: 20, right: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis
                      type="category"
                      dataKey="hospital"
                      width={120}
                      tick={{ fontSize: 10, fill: '#475569' }}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} name="Document Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Insurer split */}
            {summary.by_insurer && (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <h2 className="mb-4 text-sm font-semibold text-slate-800">
                  Insurer Split
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={summary.by_insurer}
                      dataKey="count"
                      nameKey="insurer"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ insurer, percent }) =>
                        `${insurer}: ${((percent || 0) * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {summary.by_insurer.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Exception breakdown */}
            {summary.by_exception_type && (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <h2 className="mb-4 text-sm font-semibold text-slate-800">
                  Exception Breakdown
                </h2>
                <ExceptionChart data={summary.by_exception_type} />
              </div>
            )}

            {/* Processing status */}
            {summary.by_status && (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <h2 className="mb-4 text-sm font-semibold text-slate-800">
                  Processing Status Distribution
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={summary.by_status}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ status, percent }) =>
                        `${status.replace(/_/g, ' ')}: ${((percent || 0) * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {summary.by_status.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
