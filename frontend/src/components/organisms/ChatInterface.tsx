import React, { useState, useEffect, useRef } from 'react'
import { ChatInput } from '@atoms/ChatInput'
import { ChatMessage } from '@molecules/ChatMessage'
import { Button } from '@atoms/Button'
import { Spinner } from '@atoms/Spinner'
import { chatApi } from '@/services/api'
import { ChatMessage as ChatMessageType, ChatResponse } from '@/types'

interface ChatInterfaceProps {
  caseId: string
  onSourceClick?: (documentId: string) => void
  className?: string
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  caseId,
  onSourceClick,
  className = ''
}) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadChatHistory()
  }, [caseId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChatHistory = async () => {
    try {
      setInitialLoading(true)
      const response = await chatApi.getHistory(caseId)
      setMessages(response.data)
      setError(null)
    } catch (error) {
      console.error('Error loading chat history:', error)
      setError('Failed to load chat history')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSendMessage = async (question: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await chatApi.ask(caseId, question)
      const chatResponse: ChatResponse = response.data

      // Create a new message object that matches our ChatMessage type
      const newMessage: ChatMessageType = {
        id: Date.now().toString(), // Temporary ID until we reload from server
        question,
        answer: chatResponse.answer,
        sources: chatResponse.sources,
        created_at: new Date().toISOString()
      }

      setMessages(prev => [...prev, newMessage])
      
      // Reload history to get the actual message with proper ID
      setTimeout(() => loadChatHistory(), 500)
      
    } catch (error) {
      console.error('Error sending message:', error)
      if (error instanceof Error && error.message.includes('Rate limit')) {
        setError(error.message)
      } else {
        setError('Failed to send message. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear the chat history? This action cannot be undone.')) {
      return
    }

    try {
      await chatApi.clearHistory(caseId)
      setMessages([])
      setError(null)
    } catch (error) {
      console.error('Error clearing chat history:', error)
      setError('Failed to clear chat history')
    }
  }

  if (initialLoading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <Spinner />
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Ask Questions</h3>
        {messages.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClearHistory}
          >
            Clear History
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 20l1.98-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-2">No questions yet</p>
            <p className="text-sm text-gray-500">
              Ask questions about the documents in this case to get AI-powered answers with source citations.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onSourceClick={onSourceClick}
            />
          ))
        )}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm text-gray-600">AI is thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <ChatInput
          onSend={handleSendMessage}
          disabled={loading}
          placeholder="Ask a question about the documents in this case..."
        />
      </div>
    </div>
  )
}