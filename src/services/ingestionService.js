import api from './api.js'
import { USE_MOCKS, POLL_INTERVAL_MS } from '../config/apiConfig.js'
import {
  mockIngestionStats,
  mockIngestionJob,
} from '../mocks/mockData.js'

export async function startBulkIngestion(recursive = true) {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 600))
    return { data: { job_id: 'job-mock-001', status: 'QUEUED' } }
  }
  return api.post('/ingestion/bulk', { recursive })
}

export async function getIngestionJob(jobId) {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 300))
    return { data: mockIngestionJob(jobId) }
  }
  return api.get(`/ingestion/jobs/${jobId}`)
}

export async function getIngestionStats() {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 300))
    return { data: mockIngestionStats }
  }
  return api.get('/ingestion/stats')
}

export async function reindexDocument(documentId) {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 700))
    return {
      data: {
        document_id: documentId,
        status: 'INDEXED',
        message: 'Document reindexed successfully',
      },
    }
  }
  return api.post(`/ingestion/reindex/${documentId}`)
}

export function pollIngestionJob(jobId, onUpdate, onComplete, onError) {
  let active = true

  const tick = async () => {
    if (!active) return
    try {
      const { data } = await getIngestionJob(jobId)
      onUpdate(data)
      if (data.status === 'QUEUED' || data.status === 'RUNNING') {
        setTimeout(tick, POLL_INTERVAL_MS)
      } else {
        onComplete(data)
      }
    } catch (err) {
      if (active) onError(err)
    }
  }

  tick()

  return () => {
    active = false
  }
}
