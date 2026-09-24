import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  FileText,
  Database,
  Layers,
  CheckCircle2,
  XCircle,
  History,
  Send,
} from 'lucide-react'
import LoadingSpinner from '../components/common/LoadingSpinner.jsx'
import ErrorMessage from '../components/common/ErrorMessage.jsx'
import StatusBadge from '../components/common/StatusBadge.jsx'
import InvoiceFields from '../components/documents/InvoiceFields.jsx'
import LineItemsTable from '../components/documents/LineItemsTable.jsx'
import { getDocumentById, reprocessDocument } from '../services/documentService.js'
import { reindexDocument } from '../services/ingestionService.js'

function formatBytes(bytes) {
  if (!bytes) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(2)} MB`
}

export default function DocumentDetailPage() {
  const { documentId } = useParams()
  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [actionResult, setActionResult] = useState(null)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        setLoading(true)
        const { data } = await getDocumentById(documentId)
        if (active) setDoc(data)
      } catch (err) {
        if (active) setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [documentId])

  const handleReprocess = async () => {
    setActionLoading('reprocess')
    setActionResult(null)
    try {
      const { data } = await reprocessDocument(documentId)
      setActionResult({ type: 'success', message: `Reprocessing started: ${data.message}` })
    } catch (err) {
      setActionResult({ type: 'error', message: err.message })
    } finally {
      setActionLoading(null)
    }
  }

  const handleSendToReview = async () => {
    setActionLoading('review')
    setActionResult(null)
    try {
      await reprocessDocument(documentId)
      setActionResult({ type: 'success', message: 'Document sent to review queue' })
    } catch (err) {
      setActionResult({ type: 'error', message: err.message })
    } finally {
      setActionLoading(null)
    }
  }

  const handleReindex = async () => {
    setActionLoading('reindex')
    setActionResult(null)
    try {
      await reindexDocument(documentId)
      setActionResult({ type: 'success', message: 'Document index refreshed successfully.' })
    } catch (err) {
      setActionResult({ type: 'error', message: err.message })
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) return <LoadingSpinner size="lg" label="Loading document details..." />
  if (error) return (
    <div className="p-6">
      <ErrorMessage message={error} />
    </div>
  )
  if (!doc) return <div className="p-6 text-slate-500">Document not found.</div>

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Link
          to="/documents"
          className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Documents
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{doc.file_name}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge status={doc.status} size="md" />
            <StatusBadge status={doc.source_type} size="md" />
            <StatusBadge status={doc.vector_status} size="md" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleReprocess}
            disabled={actionLoading === 'reprocess'}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${actionLoading === 'reprocess' ? 'animate-spin' : ''}`} />
            Reprocess
          </button>
          <button
            onClick={handleSendToReview}
            disabled={actionLoading === 'review'}
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Send to Review
          </button>
          <button
            onClick={handleReindex}
            disabled={actionLoading === 'reindex'}
            className="flex items-center gap-2 rounded-lg bg-navy-700 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800 disabled:opacity-50"
          >
            <Database className="h-4 w-4" />
            Reindex
          </button>
        </div>
      </div>

      {actionResult && (
        <div
          className={`mb-4 rounded-lg px-4 py-3 text-sm ${
            actionResult.type === 'success'
              ? 'border border-green-200 bg-green-50 text-green-800'
              : 'border border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {actionResult.message}
        </div>
      )}

      {/* File info */}
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <FileText className="h-5 w-5 text-navy-700" />
          <h3 className="text-sm font-semibold text-slate-800">File Information</h3>
        </div>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs text-slate-500">File Name</dt>
            <dd className="text-sm font-medium text-slate-700">{doc.file_name}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">File Size</dt>
            <dd className="text-sm font-medium text-slate-700">{formatBytes(doc.file_size_bytes)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Page Count</dt>
            <dd className="text-sm font-medium text-slate-700">{doc.page_count || '-'}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">SHA-256 Hash</dt>
            <dd className="truncate text-sm font-mono text-xs text-slate-600">{doc.sha256 || '-'}</dd>
          </div>
        </dl>
      </div>

      {/* Processing metadata */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-xs text-slate-500">Extraction Method</p>
          <p className="text-sm font-medium text-slate-700">{doc.extraction_method || '-'}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-xs text-slate-500">OCR Status</p>
          <p className="text-sm font-medium text-slate-700">{doc.ocr_status || '-'}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-xs text-slate-500">Vector Status</p>
          <div className="mt-1"><StatusBadge status={doc.vector_status} /></div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-slate-500" />
            <p className="text-xs text-slate-500">Chunk Count</p>
          </div>
          <p className="text-sm font-medium text-slate-700">{doc.chunk_count || 0}</p>
        </div>
      </div>

      {/* Invoice fields + line items */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <InvoiceFields invoice={doc.invoice} />
        <LineItemsTable lineItems={doc.line_items} />
      </div>

      {/* Validation results */}
      {doc.validation_results && doc.validation_results.length > 0 && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Validation Results</h3>
          <ul className="space-y-2">
            {doc.validation_results.map((v, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 rounded-md border border-slate-100 bg-slate-50 px-3 py-2"
              >
                {v.status === 'PASS' ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">{v.field}</span>
                    <StatusBadge status={v.status} />
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{v.message}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Exceptions */}
      {doc.exceptions && doc.exceptions.length > 0 && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h3 className="text-sm font-semibold text-amber-800">Exceptions</h3>
          </div>
          <ul className="space-y-2">
            {doc.exceptions.map((exc, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between rounded-md bg-white px-3 py-2"
              >
                <div>
                  <span className="text-sm font-medium text-slate-700">{exc.type.replace(/_/g, ' ')}</span>
                  <p className="text-xs text-slate-500">{exc.message}</p>
                </div>
                <StatusBadge status={exc.status} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Audit trail */}
      {doc.audit_trail && doc.audit_trail.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <History className="h-5 w-5 text-navy-700" />
            <h3 className="text-sm font-semibold text-slate-800">Audit Trail</h3>
          </div>
          <ol className="space-y-3">
            {doc.audit_trail.map((entry, idx) => (
              <li key={idx} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                  {idx < doc.audit_trail.length - 1 && (
                    <div className="h-full w-px bg-slate-200" />
                  )}
                </div>
                <div className="pb-2">
                  <p className="text-sm font-medium text-slate-700">{entry.action}</p>
                  <p className="text-xs text-slate-500">{entry.detail}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(entry.timestamp).toLocaleString('en-IN')}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
