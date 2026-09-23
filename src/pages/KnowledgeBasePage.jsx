import { useState, useEffect, useRef } from 'react'
import {
  Play,
  RefreshCw,
  Search,
  Database,
  Info,
  Layers,
} from 'lucide-react'
import LoadingSpinner from '../components/common/LoadingSpinner.jsx'
import ErrorMessage from '../components/common/ErrorMessage.jsx'
import IndexStats from '../components/ingestion/IndexStats.jsx'
import IngestionProgress from '../components/ingestion/IngestionProgress.jsx'
import {
  startBulkIngestion,
  getIngestionStats,
  reindexDocument,
  pollIngestionJob,
} from '../services/ingestionService.js'

export default function KnowledgeBasePage() {
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [job, setJob] = useState(null)
  const [starting, setStarting] = useState(false)
  const [reindexId, setReindexId] = useState('')
  const [reindexResult, setReindexResult] = useState(null)
  const [reindexLoading, setReindexLoading] = useState(false)
  const [error, setError] = useState(null)
  const stopPollingRef = useRef(null)

  const loadStats = async () => {
    try {
      setStatsLoading(true)
      const { data } = await getIngestionStats()
      setStats(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setStatsLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
    return () => {
      if (stopPollingRef.current) stopPollingRef.current()
    }
  }, [])

  const handleStartIngestion = async () => {
    setError(null)
    setStarting(true)
    setJob(null)
    try {
      const { data } = await startBulkIngestion(true)
      const jobId = data.job_id
      setJob({ job_id: jobId, status: 'QUEUED', progress: 0 })
      stopPollingRef.current = pollIngestionJob(
        jobId,
        (update) => setJob(update),
        (final) => {
          setJob(final)
          loadStats()
        },
        (err) => setError(err.message)
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setStarting(false)
    }
  }

  const handleReindex = async () => {
    if (!reindexId.trim()) return
    setReindexLoading(true)
    setReindexResult(null)
    setError(null)
    try {
      const { data } = await reindexDocument(reindexId.trim())
      setReindexResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setReindexLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Knowledge Base</h1>
        <p className="mt-1 text-sm text-slate-500">
          Bulk folder ingestion and vector index management
        </p>
      </div>

      <div className="mb-4 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Backend-managed source folder</p>
          <p className="mt-1 text-blue-700">
            Place synthetic invoice PDFs in the backend&apos;s configured{' '}
            <code className="rounded bg-blue-100 px-1 py-0.5 text-xs">
              data/source_invoices
            </code>{' '}
            folder, then select <strong>Start / Resume Bulk Ingestion</strong>.
            The browser does not need to upload the folder contents. Files selected
            on the Upload Documents page are handled separately.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {/* Actions */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={handleStartIngestion}
          disabled={starting}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Play className="h-4 w-4" />
          {starting ? 'Starting...' : 'Start / Resume Bulk Ingestion'}
        </button>
        <button
          onClick={loadStats}
          disabled={statsLoading}
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`} />
          Refresh Statistics
        </button>
      </div>

      {/* Ingestion progress */}
      {job && (
        <div className="mb-6">
          <IngestionProgress job={job} />
        </div>
      )}

      {/* Stats */}
      {statsLoading ? (
        <LoadingSpinner label="Loading statistics..." />
      ) : (
        stats && <IndexStats stats={stats} />
      )}

      {/* Reindex section */}
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <Layers className="h-5 w-5 text-navy-700" />
          <h3 className="text-sm font-semibold text-slate-800">
            Reindex Single Document
          </h3>
        </div>
        <p className="mb-3 text-sm text-slate-500">
          Enter a document ID to re-chunk and re-embed it into the vector store.
        </p>
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="number"
              value={reindexId}
              onChange={(e) => setReindexId(e.target.value)}
              placeholder="Document ID"
              className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            onClick={handleReindex}
            disabled={reindexLoading || !reindexId.trim()}
            className="flex items-center gap-2 rounded-lg bg-navy-700 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800 disabled:opacity-50"
          >
            <Database className="h-4 w-4" />
            {reindexLoading ? 'Reindexing...' : 'Reindex'}
          </button>
        </div>
        {reindexResult && (
          <div className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            Document #{reindexResult.document_id} - {reindexResult.message}
          </div>
        )}
      </div>
    </div>
  )
}
