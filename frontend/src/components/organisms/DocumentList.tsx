import React, { useState, useMemo } from 'react'
import { DocumentCard } from '@molecules/DocumentCard'
import { SearchBar } from '@molecules/SearchBar'
import { Document } from '@/types'

interface DocumentListProps {
  documents: Document[]
  onDocumentClick: (id: string) => void
  onDocumentDelete?: (id: string) => void
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onDocumentClick,
  onDocumentDelete
}) => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents
    
    const query = searchQuery.toLowerCase()
    return documents.filter(doc => 
      doc.filename.toLowerCase().includes(query) ||
      doc.document_type?.toLowerCase().includes(query)
    )
  }, [documents, searchQuery])

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-lg font-medium">No documents uploaded yet</p>
        <p className="text-sm mt-1">Upload your first document to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {documents.length > 3 && (
        <SearchBar 
          placeholder="Search documents by name or type..." 
          onSearch={setSearchQuery}
        />
      )}
      
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No documents match your search</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              id={doc.id}
              filename={doc.filename}
              documentType={doc.document_type}
              uploadDate={doc.uploaded_at}
              processed={doc.processed}
              processing_status={doc.processing_status}
              processing_progress={doc.processing_progress}
              processing_step={doc.processing_step}
              onView={() => onDocumentClick(doc.id)}
              onDelete={onDocumentDelete ? () => onDocumentDelete(doc.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
