import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '@templates/DashboardLayout'
import { DocumentList } from '@organisms/DocumentList'
import { FileUploader } from '@molecules/FileUploader'
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

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Documents</h3>
          <DocumentList 
            documents={documents} 
            onDocumentClick={handleDocumentClick}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
