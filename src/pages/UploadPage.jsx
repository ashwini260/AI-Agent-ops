import { useState, useRef, useCallback } from 'react'
import {
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react'
import { uploadDocuments } from '../services/documentService.js'
import { USE_MOCKS } from '../config/apiConfig.js'

export default function UploadPage() {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef(null)

  const handleFiles = useCallback((fileList) => {
    const pdfs = Array.from(fileList).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    )
    const rejected = Array.from(fileList).length - pdfs.length
    if (rejected > 0) {
      setError(`${rejected} file(s) were rejected. Only PDF files are allowed.`)
    } else {
      setError(null)
    }
    setFiles((prev) => [...prev, ...pdfs])
    setResult(null)
  }, [])

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setDragActive(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragActive(false)
  }

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    setUploading(true)
    setProgress(0)
    setError(null)
    setResult(null)
    try {
      const { data } = await uploadDocuments(files, setProgress)
      setResult(data)
      setFiles([])
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Upload Documents</h1>
        <p className="mt-1 text-sm text-slate-500">
          Upload synthetic hospital invoice PDFs for processing
        </p>
      </div>

      <div className="mb-4 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Use synthetic documents only.</p>
          <p className="mt-1 text-blue-700">
            Each upload is automatically extracted, OCR-processed when needed,
            validated, stored, chunked, and indexed into the vector database.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-300 bg-white hover:border-blue-400'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
        <p className="mt-3 text-sm font-medium text-slate-700">
          Drag and drop PDF files here, or click to browse
        </p>
        <p className="mt-1 text-xs text-slate-500">Only PDF files are accepted</p>
      </div>

      {/* Selected files */}
      {files.length > 0 && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">
            Selected Files ({files.length})
          </h3>
          <ul className="space-y-2">
            {files.map((file, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between gap-2 rounded-md border border-slate-100 bg-slate-50 px-3 py-2"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="h-4 w-4 flex-shrink-0 text-blue-600" />
                  <span className="truncate text-sm text-slate-700">{file.name}</span>
                  <span className="text-xs text-slate-400">
                    ({(file.size / 1024).toFixed(0)} KB)
                  </span>
                </div>
                {!uploading && (
                  <button
                    onClick={() => removeFile(idx)}
                    className="text-slate-400 hover:text-red-600"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>

          {uploading && (
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-slate-500">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {!uploading && (
            <button
              onClick={handleUpload}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Upload {files.length} file{files.length > 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}

      {/* Upload results */}
      {result && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <h3 className="text-sm font-semibold text-green-800">
              Upload Complete - {result.uploaded} file(s) processed
            </h3>
          </div>
          <ul className="mt-3 space-y-2">
            {result.results?.map((r, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-slate-700">{r.file_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Doc #{r.document_id}</span>
                  <span
                    className={`text-xs font-medium ${
                      r.status === 'APPROVED' ? 'text-green-600' : 'text-amber-600'
                    }`}
                  >
                    {r.status === 'APPROVED' ? 'Approved' : 'Review Required'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {USE_MOCKS && (
        <p className="mt-4 text-xs text-slate-400">
          Running in mock mode - uploads are simulated. Set VITE_USE_MOCKS=false to
          connect to the FastAPI backend.
        </p>
      )}
    </div>
  )
}
