import api from './api.js'
import { USE_MOCKS } from '../config/apiConfig.js'
import { mockExceptions } from '../mocks/mockData.js'

export async function getExceptions(params = {}) {
  if (USE_MOCKS) {
    let items = [...mockExceptions]
    if (params.status) items = items.filter((e) => e.status === params.status)
    if (params.type) items = items.filter((e) => e.type === params.type)

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
  return api.get('/exceptions', { params })
}

export async function reviewException(exceptionId, payload) {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 600))
    return {
      data: {
        id: exceptionId,
        status: payload.action === 'APPROVE' ? 'RESOLVED' : 'REJECTED',
        reviewer_note: payload.reviewer_note,
        corrected_fields: payload.corrected_fields,
        reviewed_at: new Date().toISOString(),
      },
    }
  }
  return api.patch(`/exceptions/${exceptionId}/review`, payload)
}
