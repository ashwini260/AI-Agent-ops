import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import DocumentTable from '../components/documents/DocumentTable.jsx'
import LoadingSpinner from '../components/common/LoadingSpinner.jsx'
import ErrorMessage from '../components/common/ErrorMessage.jsx'
import { getDocuments } from '../services/documentService.js'

const statusOptions = ['', 'APPROVED', 'REVIEW_REQUIRED', 'PROCESSING', 'FAILED', 'DUPLICATE']
const sourceOptions = ['', 'BULK_FOLDER', 'UI_UPLOAD']
const vectorOptions = ['', 'INDEXED', 'PENDING', 'FAILED', 'NOT_INDEXED']
const exceptionOptions = [
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

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    source_type: '',
    vector_status: '',
    hospital: '',
    exception_type: '',
  })

  const loadDocuments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, page_size: 20 }
      if (filters.search) params.search = filters.search
      if (filters.status) params.status = filters.status
      if (filters.source_type) params.source_type = filters.source_type
      if (filters.vector_status) params.vector_status = filters.vector_status
      if (filters.hospital) params.hospital = filters.hospital
      if (filters.exception_type) params.exception_type = filters.exception_type

      const { data } = await getDocuments(params)
      setDocuments(data.items || [])
      setTotal(data.total || 0)
      setTotalPages(data.total_pages || 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    loadDocuments()
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
        <p className="mt-1 text-sm text-slate-500">
          Browse and search all processed invoice documents
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4">
        <form onSubmit={handleSearch} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search file, invoice, hospital, patient..."
              className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            {statusOptions.slice(1).map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <select
            value={filters.source_type}
            onChange={(e) => handleFilterChange('source_type', e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Sources</option>
            {sourceOptions.slice(1).map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <select
            value={filters.vector_status}
            onChange={(e) => handleFilterChange('vector_status', e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Vector Statuses</option>
            {vectorOptions.slice(1).map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <input
            type="text"
            value={filters.hospital}
            onChange={(e) => handleFilterChange('hospital', e.target.value)}
            placeholder="Filter by hospital..."
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <select
            value={filters.exception_type}
            onChange={(e) => handleFilterChange('exception_type', e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Exception Types</option>
            {exceptionOptions.slice(1).map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Filter className="h-4 w-4" />
            Apply Filters
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-slate-200 bg-white">
        {loading ? (
          <LoadingSpinner label="Loading documents..." />
        ) : (
          <DocumentTable documents={documents} loading={false} />
        )}
      </div>

      {/* Pagination */}
      {!loading && total > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing {(page - 1) * 20 + 1} - {Math.min(page * 20, total)} of{' '}
            {total.toLocaleString()} documents
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
            <span className="text-sm text-slate-600">
              Page {page} of {totalPages}
            </span>
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
