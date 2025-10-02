import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DashboardLayout } from '@templates/DashboardLayout'
import { Button } from '@atoms/Button'
import { Badge } from '@atoms/Badge'
import { Spinner } from '@atoms/Spinner'
import { documentsApi } from '@/services/api'
import { Document } from '@/types'

const DocumentDetail: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>()
  const navigate = useNavigate()
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (documentId) {
      loadDocument(documentId)
    }
  }, [documentId])

  const loadDocument = async (id: string) => {
    try {
      const response = await documentsApi.get(id)
      setDocument(response.data)
    } catch (error) {
      console.error('Error loading document:', error)
    } finally {
      setLoading(false)
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
        <div className="flex items-center justify-between">
          <Button variant="secondary" onClick={() => navigate('/')}>
            ← Back
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{document.filename}</h2>
              <p className="text-gray-600 mt-1">
                Uploaded {new Date(document.uploaded_at).toLocaleString()}
              </p>
            </div>
            <Badge variant={document.processed ? 'success' : 'warning'}>
              {document.processed ? 'Processed' : 'Processing'}
            </Badge>
          </div>

          {document.document_type && (
            <div className="mb-4">
              <span className="text-sm font-medium text-gray-700">Type: </span>
              <Badge variant="neutral">{document.document_type}</Badge>
            </div>
          )}

          {document.summary && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Summary</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{document.summary}</p>
              </div>
            </div>
          )}

          {!document.processed && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                Document is being processed. Check back soon for extracted information.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default DocumentDetail
