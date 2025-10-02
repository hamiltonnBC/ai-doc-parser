export interface Case {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  case_id: string
  filename: string
  file_type?: string
  document_type?: string
  uploaded_at: string
  processed: boolean
  summary?: string
  page_count?: number
}

export interface Entity {
  id: string
  entity_type: string
  entity_value: string
  confidence: number
  source_location?: any
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  sources?: any[]
}
