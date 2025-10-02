import React, { useState } from 'react'
import { ChatBubble } from '@atoms/ChatBubble'
import { SourceCard } from '@atoms/SourceCard'
import { ChatMessage as ChatMessageType } from '@/types'

interface ChatMessageProps {
  message: ChatMessageType
  onSourceClick?: (documentId: string) => void
  className?: string
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onSourceClick,
  className = ''
}) => {
  const [showSources, setShowSources] = useState(false)

  return (
    <div className={`space-y-3 ${className}`}>
      {/* User Question */}
      <ChatBubble
        message={message.question}
        isUser={true}
        timestamp={message.created_at}
      />

      {/* AI Answer */}
      <ChatBubble
        message={message.answer}
        isUser={false}
        timestamp={message.created_at}
      />

      {/* Sources */}
      {message.sources && message.sources.length > 0 && (
        <div className="ml-0 max-w-xs lg:max-w-md">
          <button
            onClick={() => setShowSources(!showSources)}
            className="text-xs text-gray-600 hover:text-gray-800 flex items-center space-x-1"
          >
            <span>
              {showSources ? '▼' : '▶'} {message.sources.length} source{message.sources.length !== 1 ? 's' : ''}
            </span>
          </button>
          
          {showSources && (
            <div className="mt-2 space-y-2">
              {message.sources.map((source, index) => (
                <SourceCard
                  key={index}
                  source={source}
                  onClick={() => onSourceClick?.(source.document_id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}