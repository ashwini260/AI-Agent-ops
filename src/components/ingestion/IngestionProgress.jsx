export default function IngestionProgress({ job }) {
  if (!job) return null

  const percent = job.progress || 0

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">
          Ingestion Job Progress
        </h3>
        <span className="text-sm font-medium text-slate-600">{percent}%</span>
      </div>

      <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs text-slate-500">Current File</p>
          <p className="truncate font-medium text-slate-700">{job.current_file || '-'}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Processed</p>
          <p className="font-medium text-slate-700">
            {job.processed?.toLocaleString() || 0} / {job.total_files?.toLocaleString() || 0}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Succeeded / Failed</p>
          <p className="font-medium text-slate-700">
            <span className="text-green-600">{job.succeeded?.toLocaleString() || 0}</span>
            {' / '}
            <span className="text-red-600">{job.failed?.toLocaleString() || 0}</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Skipped Duplicates</p>
          <p className="font-medium text-slate-700">{job.skipped?.toLocaleString() || 0}</p>
        </div>
      </div>

      {job.status === 'COMPLETED' && (
        <div className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Ingestion completed. {job.succeeded?.toLocaleString() || 0} documents
          processed, {job.failed?.toLocaleString() || 0} failed,{' '}
          {job.skipped?.toLocaleString() || 0} duplicates skipped.
        </div>
      )}
    </div>
  )
}
