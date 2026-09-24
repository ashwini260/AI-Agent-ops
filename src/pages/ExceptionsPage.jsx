import { useState, useEffect, useCallback } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Save,
} from 'lucide-react'
import ExceptionTable from '../components/exceptions/ExceptionTable.jsx'
import LoadingSpinner from '../components/common/LoadingSpinner.jsx'
import ErrorMessage from '../components/common/ErrorMessage.jsx'
import { getExceptions, reviewException } from '../services/exceptionService.js'

const typeOptions = [
  '',
  'TOTAL_MISMATCH',
  'DUPLICATE_FILE',
  'DUPLICATE_INVOICE',
  'MISSING_PATIENT_NAME',
  'MISSING_DIAGNOSIS',
  'MISSING_INSURER',
  'MISSING_INVOICE_DATE',
  'EXTRACTION_FAILED',
]

const statusOptions = ['', 'OPEN', 'RESOLVED', 'REJECTED']

export default function ExceptionsPage() {
  const [exceptions, setExceptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({ status: 'OPEN', type: '' })
  const [reviewing, setReviewing] = useState(null)
  const [reviewForm, setReviewForm] = useState({
    corrected_fields: {},
    reviewer_note: '',
    action: '',
  })
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewResult, setReviewResult] = useState(null)

  const loadExceptions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, page_size: 20 }
      if (filters.status) params.status = filters.status
      if (filters.type) params.type = filters.type

      const { data } = await getExceptions(params)
      setExceptions(data.items || [])
      setTotal(data.total || 0)
      setTotalPages(data.total_pages || 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => {
    loadExceptions()
  }, [loadExceptions])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const startReview = (exception) => {
    setReviewing(exception)
    setReviewForm({
      corrected_fields: {},
      reviewer_note: '',
      action: '',
    })
    setReviewResult(null)
  }

  const handleFieldChange = (field, value) => {
    setReviewForm((prev) => ({
      ...prev,
      corrected_fields: { ...prev.corrected_fields, [field]: value },
    }))
  }

  const submitReview = async () => {
    if (!reviewForm.action) return
    setReviewLoading(true)
    setReviewResult(null)
    try {
      const { data } = await reviewException(reviewing.id, {
        corrected_fields: reviewForm.corrected_fields,
        reviewer_note: reviewForm.reviewer_note,
        action: reviewForm.action,
      })
      setReviewResult({ type: 'success', message: `Exception ${data.status.toLowerCase()} successfully.` })
      setTimeout(() => {
        setReviewing(null)
        loadExceptions()
      }, 1500)
    } catch (err) {
      setReviewResult({ type: 'error', message: err.message })
    } finally {
      setReviewLoading(false)
    }
  }

  const correctableFields = reviewing
    ? getCorrectableFields(reviewing.type)
    : []

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Exceptions</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review and resolve document processing exceptions
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s || 'All Statuses'}</option>
            ))}
          </select>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            {typeOptions.map((t) => (
              <option key={t} value={t}>{t ? t.replace(/_/g, ' ') : 'All Exception Types'}</option>
            ))}
          </select>
          <div className="text-sm text-slate-500 self-center">
            {total} exception{total !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Table + review panel */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white">
          {loading ? (
            <LoadingSpinner label="Loading exceptions..." />
          ) : (
            <ExceptionTable
              exceptions={exceptions}
              loading={false}
              onReview={startReview}
            />
          )}
        </div>

        {/* Review panel */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          {!reviewing ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-slate-500">
                Select an open exception from the table to review and resolve it.
              </p>
            </div>
          ) : (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-800">
                Review Exception #{reviewing.id}
              </h3>
              <div className="mb-3 space-y-1 text-sm">
                <p><span className="text-slate-500">Type:</span> <span className="font-medium text-slate-700">{reviewing.type.replace(/_/g, ' ')}</span></p>
                <p><span className="text-slate-500">Document:</span> {reviewing.file_name}</p>
                <p><span className="text-slate-500">Invoice:</span> {reviewing.invoice_no || '-'}</p>
                <p><span className="text-slate-500">Message:</span> <span className="text-slate-600">{reviewing.message}</span></p>
              </div>

              {correctableFields.length > 0 && (
                <div className="mb-3">
                  <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
                    Corrected Fields
                  </p>
                  <div className="space-y-2">
                    {correctableFields.map((field) => (
                      <div key={field.key}>
                        <label className="text-xs text-slate-600">{field.label}</label>
                        <input
                          type="text"
                          value={reviewForm.corrected_fields[field.key] || ''}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-3">
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                  Reviewer Note
                </label>
                <textarea
                  value={reviewForm.reviewer_note}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev, reviewer_note: e.target.value }))}
                  rows={3}
                  placeholder="Add a note about this review..."
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setReviewForm((prev) => ({ ...prev, action: 'APPROVE' }))}
                  disabled={reviewLoading}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ${
                    reviewForm.action === 'APPROVE'
                      ? 'bg-green-600 text-white'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Check className="h-4 w-4" />
                  Approve
                </button>
                <button
                  onClick={() => setReviewForm((prev) => ({ ...prev, action: 'REJECT' }))}
                  disabled={reviewLoading}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ${
                    reviewForm.action === 'REJECT'
                      ? 'bg-red-600 text-white'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <X className="h-4 w-4" />
                  Reject
                </button>
              </div>

              {reviewForm.action && (
                <button
                  onClick={submitReview}
                  disabled={reviewLoading}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {reviewLoading ? 'Submitting...' : `Submit ${reviewForm.action === 'APPROVE' ? 'Approval' : 'Rejection'}`}
                </button>
              )}

              {reviewResult && (
                <div
                  className={`mt-3 rounded-md px-3 py-2 text-sm ${
                    reviewResult.type === 'success'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {reviewResult.message}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {!loading && total > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function getCorrectableFields(type) {
  const fieldMap = {
    TOTAL_MISMATCH: [{ key: 'printed_total', label: 'Corrected Total', placeholder: 'e.g. 104892.33' }],
    MISSING_PATIENT_NAME: [{ key: 'patient_name', label: 'Patient Name', placeholder: 'Enter patient name' }],
    MISSING_DIAGNOSIS: [{ key: 'diagnosis', label: 'Diagnosis', placeholder: 'Enter diagnosis' }],
    MISSING_INSURER: [{ key: 'insurer', label: 'Insurer', placeholder: 'Enter insurer name' }],
    MISSING_INVOICE_DATE: [{ key: 'invoice_date', label: 'Invoice Date', placeholder: 'YYYY-MM-DD' }],
  }
  return fieldMap[type] || []
}
