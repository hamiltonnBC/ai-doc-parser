import React from 'react'
import { ChatSource } from '@/types'

interface SourceCardProps {
  source: ChatSource
  onClick?: () => void
  className?: string
}

export const SourceCard: React.FC<SourceCardProps> = ({
  source,
  onClick,
  className = ''
}) => {
  return (
    <div 
      className={`bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm ${
        onClick ? 'cursor-pointer hover:bg-blue-100' : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-blue-900 truncate">
          {source.document_name}
        </span>
        <span className="text-blue-600 text-xs">
          {Math.round(source.relevance_score * 100)}% match
        </span>
      </div>
      <p className="text-blue-800 text-xs leading-relaxed line-clamp-3">
        {source.chunk_text}
      </p>
      {source.page_number && (
        <div className="mt-2 text-blue-600 text-xs">
          Page {source.page_number}
        </div>
      )}
    </div>
  )
}