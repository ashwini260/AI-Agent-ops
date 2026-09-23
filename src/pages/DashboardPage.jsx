import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Copy,
  IndianRupee,
  Percent,
  ArrowRight,
} from 'lucide-react'
import LoadingSpinner from '../components/common/LoadingSpinner.jsx'
import ErrorMessage from '../components/common/ErrorMessage.jsx'
import StatusBadge from '../components/common/StatusBadge.jsx'
import ExceptionChart from '../components/charts/ExceptionChart.jsx'
import InvoiceTrendChart from '../components/charts/InvoiceTrendChart.jsx'
import { getDocuments } from '../services/documentService.js'
import {
  mockDashboardStats,
  mockDashboardTrends,
  mockDashboardExceptionBreakdown,
} from '../mocks/mockData.js'

function formatCurrency(value) {
  if (value >= 10000000) return `${(value / 10000000).toFixed(2)} Cr`
  if (value >= 100000) return `${(value / 100000).toFixed(2)} L`
  return new Intl.NumberFormat('en-IN').format(value)
}

function KpiCard({ icon: Icon, label, value, color, suffix }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-800">
        {value}
        {suffix && <span className="text-sm font-medium text-slate-500 ml-1">{suffix}</span>}
      </p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  )
}

export default function DashboardPage() {
  const [recentDocs, setRecentDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        setLoading(true)
        const { data } = await getDocuments({ page: 1, page_size: 5 })
        if (active) setRecentDocs(data.items || [])
      } catch (err) {
        if (active) setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Operational overview of document processing and exceptions
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          icon={FileText}
          label="Total Documents"
          value={mockDashboardStats.total_documents.toLocaleString()}
          color="bg-blue-600"
        />
        <KpiCard
          icon={CheckCircle2}
          label="Approved"
          value={mockDashboardStats.approved_documents.toLocaleString()}
          color="bg-green-600"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Review Required"
          value={mockDashboardStats.review_required.toLocaleString()}
          color="bg-amber-500"
        />
        <KpiCard
          icon={Copy}
          label="Duplicates"
          value={mockDashboardStats.duplicate_documents.toLocaleString()}
          color="bg-slate-500"
        />
        <KpiCard
          icon={IndianRupee}
          label="Total Invoice Value"
          value={formatCurrency(mockDashboardStats.total_invoice_value)}
          color="bg-navy-700"
        />
        <KpiCard
          icon={Percent}
          label="Exception Rate"
          value={mockDashboardStats.exception_rate}
          suffix="%"
          color="bg-red-600"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-4 text-sm font-semibold text-slate-800">
            Invoice Processing Trend
          </h2>
          <InvoiceTrendChart data={mockDashboardTrends} />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-4 text-sm font-semibold text-slate-800">
            Exception Breakdown
          </h2>
          <ExceptionChart data={mockDashboardExceptionBreakdown} />
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800">Recent Documents</h2>
          <Link
            to="/documents"
            className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {loading ? (
          <LoadingSpinner label="Loading recent documents..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <th className="px-3 py-3">File Name</th>
                  <th className="px-3 py-3">Invoice No</th>
                  <th className="px-3 py-3">Hospital</th>
                  <th className="px-3 py-3 text-right">Total</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Vector</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2.5">
                      <Link
                        to={`/documents/${doc.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {doc.file_name}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">{doc.invoice_no || '-'}</td>
                    <td className="px-3 py-2.5 text-slate-600">{doc.hospital_name || '-'}</td>
                    <td className="px-3 py-2.5 text-right text-slate-700">
                      {doc.printed_total?.toLocaleString('en-IN') || '-'}
                    </td>
                    <td className="px-3 py-2.5"><StatusBadge status={doc.status} /></td>
                    <td className="px-3 py-2.5"><StatusBadge status={doc.vector_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
