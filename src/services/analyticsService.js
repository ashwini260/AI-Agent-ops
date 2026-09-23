import api from './api.js'
import { USE_MOCKS, API_BASE_URL, API_PREFIX } from '../config/apiConfig.js'
import {
  mockAnalyticsSummary,
  mockAnalyticsTrends,
} from '../mocks/mockData.js'

export async function getAnalyticsSummary(params = {}) {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 400))
    return { data: mockAnalyticsSummary }
  }
  return api.get('/analytics/summary', { params })
}

export async function getAnalyticsTrends(params = {}) {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 400))
    return { data: mockAnalyticsTrends }
  }
  return api.get('/analytics/trends', { params })
}

export function getExportUrl() {
  return `${API_BASE_URL}${API_PREFIX}/exports/invoices.xlsx`
}
