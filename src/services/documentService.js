import api from './api.js'
import { USE_MOCKS } from '../config/apiConfig.js'
import {
  mockDocuments,
  mockDocumentDetail,
  mockUploadResult,
} from '../mocks/mockData.js'

export async function getDocuments(params = {}) {
  if (USE_MOCKS) {
    let items = [...mockDocuments]
    if (params.search) {
      const q = params.search.toLowerCase()
      items = items.filter(
        (d) =>
          d.file_name.toLowerCase().includes(q) ||
          d.invoice_no?.toLowerCase().includes(q) ||
          d.hospital_name?.toLowerCase().includes(q) ||
          d.patient_name?.toLowerCase().includes(q)
      )
    }
    if (params.status) items = items.filter((d) => d.status === params.status)
    if (params.source_type)
      items = items.filter((d) => d.source_type === params.source_type)
    if (params.vector_status)
      items = items.filter((d) => d.vector_status === params.vector_status)
    if (params.hospital)
      items = items.filter((d) =>
        d.hospital_name?.toLowerCase().includes(params.hospital.toLowerCase())
      )
    if (params.exception_type)
      items = items.filter((d) => d.exception_type === params.exception_type)

    const page = Number(params.page) || 1
    const pageSize = Number(params.page_size) || 20
    const total = items.length
    const start = (page - 1) * pageSize
    const data = items.slice(start, start + pageSize)

    return {
      data: {
        items: data,
        total,
        page,
        page_size: pageSize,
        total_pages: Math.ceil(total / pageSize),
      },
    }
  }
  return api.get('/documents', { params })
}

export async function getDocumentById(documentId) {
  if (USE_MOCKS) {
    const detail =
      mockDocumentDetail[documentId] ||
      mockDocumentDetail[1]
    return { data: detail }
  }
  return api.get(`/documents/${documentId}`)
}

export async function uploadDocuments(files, onProgress) {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 1200))
    return { data: mockUploadResult(files) }
  }
  const formData = new FormData()
  for (const file of files) {
    formData.append('files', file)
  }
  return api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    },
  })
}

export async function reprocessDocument(documentId) {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 800))
    return {
      data: {
        id: documentId,
        status: 'PROCESSING',
        message: 'Document reprocessing started',
      },
    }
  }
  return api.post(`/documents/${documentId}/reprocess`)
}
