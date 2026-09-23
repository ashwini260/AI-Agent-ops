import api from './api.js'
import { USE_MOCKS } from '../config/apiConfig.js'
import { mockChatResponse } from '../mocks/mockData.js'

export async function sendChatQuery(question) {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 1000))
    return { data: mockChatResponse(question) }
  }
  return api.post('/chat/query', { question })
}
