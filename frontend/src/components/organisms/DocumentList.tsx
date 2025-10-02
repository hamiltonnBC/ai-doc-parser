import React from 'react'
import { DocumentCard } from '@molecules/DocumentCard'
import { Document } from '@/types'

interface DocumentListProps {
  documents: Document[]
  onDocumentClick: (id: string) => void
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onDocumentClick
}) => {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No documents uploaded yet
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          filename={doc.filename}
          documentType={doc.document_type}
          uploadDate={doc.uploaded_at}
          processed={doc.processed}
          onView={() => onDocumentClick(doc.id)}
        />
      ))}
    </div>
  )
}
