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
  file_path: string
  file_type?: string
  document_type?: string
  uploaded_at: string
  processed: boolean
  processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
  processing_progress?: number
  processing_step?: string
  ocr_text?: string
  summary?: string
  page_count?: number
}

export interface Entity {
  id: string
  document_id: string
  entity_type: string
  entity_value: string
  confidence: number
  source_location?: {
    page?: number
    bbox?: number[]
  }
  extracted_at: string
}

export interface ChatSource {
  document_id: string
  document_name: string
  chunk_text: string
  relevance_score: number
  page_number?: number
}

export interface ChatMessage {
  id: string
  question: string
  answer: string
  sources: ChatSource[]
  created_at: string
}

export interface ChatRequest {
  case_id: string
  question: string
}

export interface ChatResponse {
  answer: string
  sources: ChatSource[]
  confidence?: number
}
