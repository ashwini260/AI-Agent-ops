const statusConfig = {
  APPROVED: { label: 'Approved', className: 'bg-green-100 text-green-800 border-green-200' },
  REVIEW_REQUIRED: { label: 'Review Required', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  PROCESSING: { label: 'Processing', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  FAILED: { label: 'Failed', className: 'bg-red-100 text-red-800 border-red-200' },
  DUPLICATE: { label: 'Duplicate', className: 'bg-slate-100 text-slate-800 border-slate-200' },
  INDEXED: { label: 'Indexed', className: 'bg-green-100 text-green-800 border-green-200' },
  PENDING: { label: 'Pending', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  NOT_INDEXED: { label: 'Not Indexed', className: 'bg-slate-100 text-slate-600 border-slate-200' },
  OPEN: { label: 'Open', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  RESOLVED: { label: 'Resolved', className: 'bg-green-100 text-green-800 border-green-200' },
  REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-800 border-red-200' },
  QUEUED: { label: 'Queued', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  RUNNING: { label: 'Running', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-800 border-green-200' },
  PASS: { label: 'Pass', className: 'bg-green-100 text-green-800 border-green-200' },
  FAIL: { label: 'Fail', className: 'bg-red-100 text-red-800 border-red-200' },
  BULK_FOLDER: { label: 'Bulk Folder', className: 'bg-navy-100 text-navy-700 border-navy-200' },
  UI_UPLOAD: { label: 'UI Upload', className: 'bg-blue-100 text-blue-700 border-blue-200' },
}

export default function StatusBadge({ status, size = 'sm' }) {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${config.className} ${sizes[size]}`}
    >
      {config.label}
    </span>
  )
}
