import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DashboardLayout } from '@templates/DashboardLayout'
import { ChatInterface } from '@organisms/ChatInterface'
import { DocumentList } from '@organisms/DocumentList'
import { Button } from '@atoms/Button'
import { Spinner } from '@atoms/Spinner'
import { casesApi, documentsApi } from '@/services/api'
import { Case, Document } from '@/types'

const CaseView: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>()
  const navigate = useNavigate()
  const [case_, setCase] = useState<Case | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'chat' | 'documents'>('chat')

  useEffect(() => {
    if (caseId) {
      loadCase(caseId)
      loadDocuments(caseId)
    }
  }, [caseId])

  const loadCase = async (id: string) => {
    try {
      const response = await casesApi.get(id)
      setCase(response.data)
    } catch (error) {
      console.error('Error loading case:', error)
    }
  }

  const loadDocuments = async (id: string) => {
    try {
      const response = await documentsApi.listByCase(id)
      setDocuments(response.data)
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSourceClick = (documentId: string) => {
    navigate(`/document/${documentId}`)
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
          <Button 
            variant="secondary" 
            onClick={() => navigate(`/chat-history/${caseId}`)}
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            Chat History
          </Button>
        </div>

        {/* Case Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{case_.name}</h2>
              {case_.description && (
                <p className="text-gray-600 mt-1">{case_.description}</p>
              )}
            </div>
          </div>

          {/* Case Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{documents.length}</div>
              <div className="text-sm text-gray-600">Documents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {documents.filter(d => d.processed).length}
              </div>
              <div className="text-sm text-gray-600">Processed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {documents.reduce((sum, d) => sum + (d.page_count || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Pages</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['chat', 'documents'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                  {tab === 'documents' && documents.length > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {documents.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="h-96">
            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <ChatInterface
                caseId={caseId}
                onSourceClick={handleSourceClick}
                className="h-full"
              />
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="p-6 h-full overflow-y-auto">
                <DocumentList 
                  documents={documents} 
                  onDocumentClick={(id) => navigate(`/document/${id}`)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default CaseView
