import { FileText, Link as LinkIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-3xl rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-white border border-slate-200 text-slate-800'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
            <p className="text-xs font-semibold text-slate-500">
              Sources ({message.citations.length})
            </p>
            {message.citations.map((citation, idx) => (
              <CitationCardWrapper key={idx} citation={citation} />
            ))}
          </div>
        )}

        {!isUser && message.citations && message.citations.length === 0 && (
          <div className="mt-2 border-t border-slate-100 pt-2">
            <p className="text-xs text-slate-400 italic">
              No citations available - insufficient evidence found.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function CitationCardWrapper({ citation }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
          <FileText className="h-3.5 w-3.5 text-blue-600" />
          {citation.invoice_no} - {citation.file_name}
        </div>
        <Link
          to={`/documents/${citation.document_id}`}
          className="flex items-center gap-0.5 text-xs text-blue-600 hover:underline"
        >
          <LinkIcon className="h-3 w-3" />
          Doc #{citation.document_id}
        </Link>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Page {citation.page_number} | Chunk ID: {citation.chunk_id}
      </p>
      <p className="mt-1.5 text-xs text-slate-600 italic border-l-2 border-blue-300 pl-2">
        &ldquo;{citation.snippet}&rdquo;
      </p>
    </div>
  )
}
