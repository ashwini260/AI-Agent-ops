import { Database, FileText, CheckCircle2, XCircle, Copy, Layers } from 'lucide-react'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-lg font-bold text-slate-800">
          {value?.toLocaleString() ?? '-'}
        </p>
      </div>
    </div>
  )
}

export default function IndexStats({ stats }) {
  if (!stats) return null

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <Database className="h-5 w-5 text-navy-700" />
          <h3 className="text-sm font-semibold text-slate-800">
            Vector Index Statistics
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <StatCard
            icon={FileText}
            label="Discovered PDFs"
            value={stats.discovered_pdfs}
            color="bg-blue-600"
          />
          <StatCard
            icon={CheckCircle2}
            label="Processed"
            value={stats.processed}
            color="bg-navy-600"
          />
          <StatCard
            icon={CheckCircle2}
            label="Succeeded"
            value={stats.succeeded}
            color="bg-green-600"
          />
          <StatCard
            icon={XCircle}
            label="Failed"
            value={stats.failed}
            color="bg-red-600"
          />
          <StatCard
            icon={Copy}
            label="Skipped Duplicates"
            value={stats.skipped_duplicates}
            color="bg-slate-500"
          />
          <StatCard
            icon={FileText}
            label="Indexed Documents"
            value={stats.indexed_documents}
            color="bg-blue-600"
          />
          <StatCard
            icon={Layers}
            label="Indexed Chunks"
            value={stats.indexed_chunks}
            color="bg-navy-700"
          />
          <StatCard
            icon={Database}
            label="Last Run Status"
            value={null}
            color="bg-green-600"
          />
        </div>
        {stats.last_run && (
          <p className="mt-3 text-xs text-slate-500">
            Last run: {new Date(stats.last_run).toLocaleString('en-IN')}
          </p>
        )}
      </div>
    </div>
  )
}
