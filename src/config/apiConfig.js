export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export const USE_MOCKS =
  String(import.meta.env.VITE_USE_MOCKS ?? 'true').toLowerCase() === 'true'

export const API_PREFIX = '/api/v1'

export const POLL_INTERVAL_MS = 5000
