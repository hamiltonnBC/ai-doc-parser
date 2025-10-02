import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const casesApi = {
  list: () => api.get('/api/cases'),
  get: (id: string) => api.get(`/api/cases/${id}`),
  create: (data: { name: string; description?: string }) => api.post('/api/cases', data),
}

export const documentsApi = {
  upload: (caseId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/api/documents/upload/${caseId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  get: (id: string) => api.get(`/api/documents/${id}`),
  getWithText: (id: string) => api.get(`/api/documents/${id}/text`),
  getStatus: (id: string) => api.get(`/api/documents/${id}/status`),
  listByCase: (caseId: string) => api.get(`/api/documents/case/${caseId}`),
  delete: (id: string) => api.delete(`/api/documents/${id}`),
}

export const entitiesApi = {
  getByDocument: (documentId: string) => api.get(`/api/entities/document/${documentId}`),
  getByCase: (caseId: string) => api.get(`/api/entities/case/${caseId}`),
}

export const chatApi = {
  ask: (caseId: string, question: string) => 
    api.post('/api/chat/ask', { case_id: caseId, question }),
  getHistory: (caseId: string) => 
    api.get(`/api/chat/history/${caseId}`),
  clearHistory: (caseId: string) => 
    api.post(`/api/chat/clear/${caseId}`),
  getSources: (chatId: string) => 
    api.get(`/api/chat/sources/${chatId}`),
}

export default api
