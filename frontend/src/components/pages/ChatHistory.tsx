import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DashboardLayout } from '@templates/DashboardLayout'
import { ChatMessage } from '@molecules/ChatMessage'
import { Button } from '@atoms/Button'
import { Spinner } from '@atoms/Spinner'
import { chatApi, casesApi } from '@/services/api'
import { ChatMessage as ChatMessageType, Case } from '@/types'

const ChatHistory: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>()
  const navigate = useNavigate()
  const [case_, setCase] = useState<Case | null>(null)
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (caseId) {
      loadCase(caseId)
      loadChatHistory(caseId)
    }
  }, [caseId])

  const loadCase = async (id: string) => {
    try {
      const response = await casesApi.get(id)
      setCase(response.data)
    } catch (error) {
      console.error('Error loading case:', error)
      setError('Failed to load case information')
    }
  }

  const loadChatHistory = async (id: string) => {
    try {
      setLoading(true)
      const response = await chatApi.getHistory(id)
      setMessages(response.data)
      setError(null)
    } catch (error) {
      console.error('Error loading chat history:', error)
      setError('Failed to load chat history')
    } finally {
      setLoading(false)
    }
  }

  const handleSourceClick = (documentId: string) => {
    navigate(`/document/${documentId}`)
  }

  const handleClearHistory = async () => {
    if (!caseId) return
    
    if (!confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
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

  const exportChatHistory = () => {
    if (messages.length === 0) return

    const chatText = messages.map(msg => {
      const timestamp = new Date(msg.created_at).toLocaleString()
      let text = `[${timestamp}]\n\nQ: ${msg.question}\n\nA: ${msg.answer}\n`
      
      if (msg.sources && msg.sources.length > 0) {
        text += '\nSources:\n'
        msg.sources.forEach((source, index) => {
          text += `${index + 1}. ${source.document_name} (${Math.round(source.relevance_score * 100)}% match)\n`
        })
      }
      
      return text + '\n' + '='.repeat(50) + '\n\n'
    }).join('')

    const blob = new Blob([chatText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-history-${case_?.name || 'case'}-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <Spinner />
      </DashboardLayout>
    )
  }

  if (!case_ || !caseId) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Case not found</p>
          <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="secondary" onClick={() => navigate('/')}>
            ← Back to Dashboard
          </Button>
          <div className="flex items-center space-x-3">
            {messages.length > 0 && (
              <>
                <Button variant="secondary" onClick={exportChatHistory}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export
                </Button>
                <Button variant="danger" onClick={handleClearHistory}>
                  Clear History
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Case Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <svg className="w-6 h-6 mr-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                Chat History - {case_.name}
              </h2>
              {case_.description && (
                <p className="text-gray-600 mt-1">{case_.description}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{messages.length}</div>
              <div className="text-sm text-gray-600">Conversations</div>
            </div>
          </div>
        </div>

        {/* Chat History */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Conversation History</h3>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 20l1.98-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-2">No chat history yet</p>
                <p className="text-sm text-gray-500 mb-4">
                  Start asking questions about your documents to build conversation history.
                </p>
                <Button onClick={() => navigate('/')}>
                  Go to Dashboard
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div key={message.id} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-500">
                        Conversation #{messages.length - index}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(message.created_at).toLocaleString()}
                      </span>
                    </div>
                    <ChatMessage
                      message={message}
                      onSourceClick={handleSourceClick}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        {messages.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900">Continue the conversation</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Go back to the dashboard to ask more questions about your documents.
                </p>
              </div>
              <Button onClick={() => navigate('/')}>
                Ask Questions
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default ChatHistory