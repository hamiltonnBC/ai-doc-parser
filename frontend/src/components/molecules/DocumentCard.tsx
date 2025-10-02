import React from 'react'
import { Badge } from '@atoms/Badge'
import { Button } from '@atoms/Button'

interface DocumentCardProps {
  filename: string
  documentType?: string
  uploadDate: string
  processed: boolean
  onView: () => void
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  filename,
  documentType,
  uploadDate,
  processed,
  onView
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium text-gray-900 truncate">{filename}</h3>
          <p className="text-sm text-gray-500">{new Date(uploadDate).toLocaleDateString()}</p>
        </div>
        <Badge variant={processed ? 'success' : 'warning'}>
          {processed ? 'Processed' : 'Processing'}
        </Badge>
      </div>
      <div className="flex items-center justify-between">
        {documentType && <Badge variant="neutral">{documentType}</Badge>}
        <Button size="sm" onClick={onView}>View</Button>
      </div>
    </div>
  )
}
