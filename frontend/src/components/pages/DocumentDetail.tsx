import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DashboardLayout } from '@templates/DashboardLayout'
import { EntityList } from '@organisms/EntityList'
import { ChatInterface } from '@organisms/ChatInterface'
import { ConfirmModal } from '@molecules/ConfirmModal'
import { FloatingChatButton } from '@atoms/FloatingChatButton'
import { Button } from '@atoms/Button'
import { Badge } from '@atoms/Badge'
import { Spinner } from '@atoms/Spinner'
import { documentsApi, entitiesApi } from '@/services/api'
import { Document, Entity } from '@/types'

const DocumentDetail: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>()
  const navigate = useNavigate()
  const [document, setDocument] = useState<Document | null>(null)
  const [entities, setEntities] = useState<Entity[]>([])
  const [loading, setLoading] = useState(true)
  const [entitiesLoading, setEntitiesLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'text' | 'entities' | 'chat'>('overview')
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (documentId) {
      loadDocument(documentId)
      loadEntities(documentId)
    }
  }, [documentId])

  const loadDocument = async (id: string) => {
    try {
      const response = await documentsApi.getWithText(id)
      setDocument(response.data)
    } catch (error) {
      console.error('Error loading document:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadEntities = async (id: string) => {
    try {
      const response = await entitiesApi.getByDocument(id)
      setEntities(response.data)
    } catch (error) {
      console.error('Error loading entities:', error)
    } finally {
      setEntitiesLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!document) return
    
    setDeleting(true)
    try {
      await documentsApi.delete(document.id)
      navigate('/')
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Error deleting document. Please try again.')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <Spinner />
      </DashboardLayout>
    )
  }

  if (!document) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Document not found</p>
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
            {document && (
              <Button 
                variant="secondary" 
                onClick={() => navigate(`/chat-history/${document.case_id}`)}
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                Chat History
              </Button>
            )}
            <Button 
              variant="danger" 
              onClick={() => setDeleteModal(true)}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Document'}
            </Button>
          </div>
        </div>

        {/* Document Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{document.filename}</h2>
              <p className="text-gray-600 mt-1">
                Uploaded {new Date(document.uploaded_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {document.document_type && (
                <Badge variant="neutral">{document.document_type}</Badge>
              )}
              <Badge variant={document.processed ? 'success' : 'warning'}>
                {document.processed ? 'Processed' : 'Processing'}
              </Badge>
            </div>
          </div>

          {/* Document Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{document.page_count || 'N/A'}</div>
              <div className="text-sm text-gray-600">Pages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{entities.length}</div>
              <div className="text-sm text-gray-600">Entities Extracted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {document.ocr_text ? Math.round(document.ocr_text.length / 100) / 10 + 'K' : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Characters</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['overview', 'text', 'entities', 'chat'].map((tab) => (
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
                  {tab === 'entities' && entities.length > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {entities.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {document.summary ? (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">AI Summary</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed">{document.summary}</p>
                    </div>
                  </div>
                ) : document.processed ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-600">No summary available for this document.</p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">
                      Document is being processed. Summary will appear here once processing is complete.
                    </p>
                  </div>
                )}

                {/* Quick Entity Preview */}
                {entities.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Key Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {entities.slice(0, 4).map((entity) => (
                        <div key={entity.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="text-sm font-medium text-gray-700 capitalize">
                            {entity.entity_type.replace(/_/g, ' ')}
                          </div>
                          <div className="text-gray-900 mt-1">{entity.entity_value}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {Math.round(entity.confidence * 100)}% confidence
                          </div>
                        </div>
                      ))}
                    </div>
                    {entities.length > 4 && (
                      <button
                        onClick={() => setActiveTab('entities')}
                        className="mt-3 text-primary hover:text-blue-700 text-sm font-medium"
                      >
                        View all {entities.length} entities →
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Text Tab */}
            {activeTab === 'text' && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Extracted Text</h3>
                {document.ocr_text ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                      {document.ocr_text}
                    </pre>
                  </div>
                ) : document.processed ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-600">No text content available for this document.</p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">
                      Text extraction in progress. Content will appear here once processing is complete.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Entities Tab */}
            {activeTab === 'entities' && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Extracted Entities</h3>
                <EntityList entities={entities} loading={entitiesLoading} />
              </div>
            )}

            {/* Chat Tab */}
            {activeTab === 'chat' && document && (
              <div className="h-96">
                <ChatInterface
                  caseId={document.case_id}
                  onSourceClick={(documentId) => {
                    if (documentId !== document.id) {
                      navigate(`/document/${documentId}`)
                    }
                  }}
                  className="h-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal}
          title="Delete Document"
          message={`Are you sure you want to delete "${document.filename}"? This will permanently remove the document and all associated data. This action cannot be undone.`}
          confirmText={deleting ? "Deleting..." : "Delete"}
          cancelText="Cancel"
          onConfirm={handleDelete}
          onCancel={() => setDeleteModal(false)}
          danger={true}
        />

        {/* Floating Chat Button - only show when not on chat tab */}
        {document && activeTab !== 'chat' && (
          <FloatingChatButton caseId={document.case_id} />
        )}
      </div>
    </DashboardLayout>
  )
}

export default DocumentDetail
