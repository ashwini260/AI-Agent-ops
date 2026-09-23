import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import StatusBadge from '../common/StatusBadge.jsx'

function formatCurrency(value) {
  if (value == null) return '-'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

export default function DocumentTable({ documents, loading }) {
  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">Loading documents...</div>
    )
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        No documents found matching the current filters.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
            <th className="px-3 py-3">ID</th>
            <th className="px-3 py-3">File Name</th>
            <th className="px-3 py-3">Source</th>
            <th className="px-3 py-3">Invoice No</th>
            <th className="px-3 py-3">Hospital</th>
            <th className="px-3 py-3">Patient</th>
            <th className="px-3 py-3">Date</th>
            <th className="px-3 py-3 text-right">Total</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3">Vector</th>
            <th className="px-3 py-3 text-center">Excep.</th>
            <th className="px-3 py-3 text-center">View</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {documents.map((doc) => (
            <tr
              key={doc.id}
              className="hover:bg-slate-50 transition-colors"
            >
              <td className="px-3 py-2.5 font-medium text-slate-700">{doc.id}</td>
              <td className="px-3 py-2.5 text-slate-600">{doc.file_name}</td>
              <td className="px-3 py-2.5">
                <StatusBadge status={doc.source_type} />
              </td>
              <td className="px-3 py-2.5 font-medium text-slate-700">
                {doc.invoice_no || '-'}
              </td>
              <td className="px-3 py-2.5 text-slate-600">{doc.hospital_name || '-'}</td>
              <td className="px-3 py-2.5 text-slate-600">
                {doc.patient_name ? (
                  doc.patient_name
                ) : (
                  <span className="text-red-600 font-medium">Missing</span>
                )}
              </td>
              <td className="px-3 py-2.5 text-slate-600">{formatDate(doc.invoice_date)}</td>
              <td className="px-3 py-2.5 text-right font-medium text-slate-700">
                {formatCurrency(doc.printed_total)}
              </td>
              <td className="px-3 py-2.5">
                <StatusBadge status={doc.status} />
              </td>
              <td className="px-3 py-2.5">
                <StatusBadge status={doc.vector_status} />
              </td>
              <td className="px-3 py-2.5 text-center">
                {doc.exception_count > 0 ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-100 px-1.5 text-xs font-semibold text-amber-800">
                    {doc.exception_count}
                  </span>
                ) : (
                  '-'
                )}
              </td>
              <td className="px-3 py-2.5 text-center">
                <Link
                  to={`/documents/${doc.id}`}
                  className="inline-flex items-center justify-center rounded-md p-1.5 text-blue-600 hover:bg-blue-50"
                  aria-label={`View document ${doc.id}`}
                >
                  <Eye className="h-4 w-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
