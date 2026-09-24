import { Link } from 'react-router-dom'
import StatusBadge from '../common/StatusBadge.jsx'

const typeLabels = {
  TOTAL_MISMATCH: 'Total Mismatch',
  DUPLICATE_FILE: 'Duplicate File',
  DUPLICATE_INVOICE: 'Duplicate Invoice',
  MISSING_PATIENT_NAME: 'Missing Patient Name',
  MISSING_DIAGNOSIS: 'Missing Diagnosis',
  MISSING_INSURER: 'Missing Insurer',
  MISSING_INVOICE_DATE: 'Missing Invoice Date',
  EXTRACTION_FAILED: 'Extraction Failed',
}

export default function ExceptionTable({ exceptions, loading, onReview }) {
  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">Loading exceptions...</div>
    )
  }

  if (!exceptions || exceptions.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        No exceptions found matching the current filters.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
            <th className="px-3 py-3">ID</th>
            <th className="px-3 py-3">Document</th>
            <th className="px-3 py-3">Invoice No</th>
            <th className="px-3 py-3">Hospital</th>
            <th className="px-3 py-3">Type</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3">Message</th>
            <th className="px-3 py-3">Created</th>
            <th className="px-3 py-3 text-center">Review</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {exceptions.map((exc) => (
            <tr key={exc.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-3 py-2.5 font-medium text-slate-700">{exc.id}</td>
              <td className="px-3 py-2.5">
                <Link
                  to={`/documents/${exc.document_id}`}
                  className="text-blue-600 hover:underline"
                >
                  {exc.file_name}
                </Link>
              </td>
              <td className="px-3 py-2.5 text-slate-600">{exc.invoice_no || '-'}</td>
              <td className="px-3 py-2.5 text-slate-600">{exc.hospital_name || '-'}</td>
              <td className="px-3 py-2.5">
                <span className="font-medium text-slate-700">
                  {typeLabels[exc.type] || exc.type}
                </span>
              </td>
              <td className="px-3 py-2.5">
                <StatusBadge status={exc.status} />
              </td>
              <td className="px-3 py-2.5 text-slate-600 max-w-xs truncate">
                {exc.message}
              </td>
              <td className="px-3 py-2.5 text-slate-500">
                {new Date(exc.created_at).toLocaleDateString('en-IN')}
              </td>
              <td className="px-3 py-2.5 text-center">
                {exc.status === 'OPEN' ? (
                  <button
                    type="button"
                    onClick={() => onReview(exc)}
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    Review
                  </button>
                ) : (
                  <span className="text-xs text-slate-400">Done</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
