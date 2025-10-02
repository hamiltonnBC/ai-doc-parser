import React from 'react'

interface ChatBubbleProps {
  message: string
  isUser: boolean
  timestamp?: string
  className?: string
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isUser,
  timestamp,
  className = ''
}) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${className}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isUser 
          ? 'bg-primary text-white' 
          : 'bg-gray-100 text-gray-900'
      }`}>
        <p className="text-sm whitespace-pre-wrap">{message}</p>
        {timestamp && (
          <p className={`text-xs mt-1 ${
            isUser ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {new Date(timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  )
}