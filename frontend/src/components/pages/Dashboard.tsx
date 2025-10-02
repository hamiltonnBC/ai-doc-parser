import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '@templates/DashboardLayout'
import { DocumentList } from '@organisms/DocumentList'
import { FileUploader } from '@molecules/FileUploader'
import { ConfirmModal } from '@molecules/ConfirmModal'
import { Button } from '@atoms/Button'
import { Spinner } from '@atoms/Spinner'
import { casesApi, documentsApi } from '@/services/api'
import { Case, Document } from '@/types'

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [cases, setCases] = useState<Case[]>([])
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    documentId: string
    documentName: string
  }>({
    isOpen: false,
    documentId: '',
    documentName: ''
  })
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadCases()
  }, [])

  useEffect(() => {
    if (selectedCase) {
      loadDocuments(selectedCase.id)
    }
  }, [selectedCase])

  const loadCases = async () => {
    try {
      const response = await casesApi.list()
      const casesList = response.data
      setCases(casesList)
      if (casesList.length > 0) {
        setSelectedCase(casesList[0])
      } else {
        // Create a default case
        await createDefaultCase()
      }
    } catch (error) {
      console.error('Error loading cases:', error)
    } finally {
      setLoading(false)
    }
  }

  const createDefaultCase = async () => {
    try {
      const response = await casesApi.create({
        name: 'Demo Case',
        description: 'Sample medical records case'
      })
      const newCase = response.data
      setCases([newCase])
      setSelectedCase(newCase)
    } catch (error) {
      console.error('Error creating case:', error)
    }
  }

  const loadDocuments = async (caseId: string) => {
    try {
      const response = await documentsApi.listByCase(caseId)
      setDocuments(response.data)
    } catch (error) {
      console.error('Error loading documents:', error)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!selectedCase) return
    
    setUploading(true)
    try {
      await documentsApi.upload(selectedCase.id, file)
      await loadDocuments(selectedCase.id)
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error uploading file')
    } finally {
      setUploading(false)
    }
  }

  const handleDocumentClick = (documentId: string) => {
    navigate(`/document/${documentId}`)
  }

  const handleDeleteClick = (documentId: string) => {
    const document = documents.find(doc => doc.id === documentId)
    if (document) {
      setDeleteModal({
        isOpen: true,
        documentId,
        documentName: document.filename
      })
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.documentId) return
    
    setDeleting(true)
    try {
      await documentsApi.delete(deleteModal.documentId)
      
      // Refresh document list
      if (selectedCase) {
        await loadDocuments(selectedCase.id)
      }
      
      // Close modal
      setDeleteModal({
        isOpen: false,
        documentId: '',
        documentName: ''
      })
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Error deleting document. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      documentId: '',
      documentName: ''
    })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <Spinner />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {selectedCase?.name || 'Dashboard'}
            </h2>
            <p className="text-gray-600 mt-1">
              {selectedCase?.description || 'Manage your medical documents'}
            </p>
          </div>
          <FileUploader onFileSelect={handleFileUpload} />
        </div>

        {uploading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Spinner />
              <span className="text-blue-800">Uploading document...</span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Processed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {documents.filter(d => d.processed).length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-gray-900">
                  {documents.filter(d => !d.processed).length}
                </p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Documents</h3>
            {documents.length > 0 && (
              <p className="text-sm text-gray-600">
                {documents.filter(d => d.processed).length} of {documents.length} processed
              </p>
            )}
          </div>
          <DocumentList 
            documents={documents} 
            onDocumentClick={handleDocumentClick}
            onDocumentDelete={handleDeleteClick}
          />
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          title="Delete Document"
          message={`Are you sure you want to delete "${deleteModal.documentName}"? This action cannot be undone.`}
          confirmText={deleting ? "Deleting..." : "Delete"}
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          danger={true}
        />
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
