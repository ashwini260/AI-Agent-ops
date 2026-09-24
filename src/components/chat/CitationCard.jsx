import { FileText, Link as LinkIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CitationCard({ citation }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <FileText className="h-4 w-4 text-blue-600" />
          {citation.invoice_no} - {citation.file_name}
        </div>
        <Link
          to={`/documents/${citation.document_id}`}
          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
        >
          <LinkIcon className="h-3.5 w-3.5" />
          View Document #{citation.document_id}
        </Link>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        <span><strong className="text-slate-600">Document ID:</strong> {citation.document_id}</span>
        <span><strong className="text-slate-600">Page:</strong> {citation.page_number}</span>
        <span><strong className="text-slate-600">Chunk ID:</strong> {citation.chunk_id}</span>
      </div>
      <p className="mt-2 text-sm text-slate-600 italic border-l-2 border-blue-300 pl-2">
        &ldquo;{citation.snippet}&rdquo;
      </p>
    </div>
  )
}
