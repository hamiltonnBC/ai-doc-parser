import React from 'react'
import { Badge } from '@atoms/Badge'
import { Button } from '@atoms/Button'
import { ProgressBar } from '@atoms/ProgressBar'
import { useDocumentProgress } from '../../hooks/useDocumentProgress'

interface DocumentCardProps {
  id: string
  filename: string
  documentType?: string
  uploadDate: string
  processed: boolean
  processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
  processing_progress?: number
  processing_step?: string
  onView: () => void
  onDelete?: () => void
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  id,
  filename,
  documentType,
  uploadDate,
  processed,
  processing_status = 'pending',
  processing_progress = 0,
  processing_step,
  onView,
  onDelete
}) => {
  // Use real-time progress tracking for documents that are still processing
  const { progress } = useDocumentProgress(
    !processed && (processing_status === 'processing' || processing_status === 'pending') ? id : null
  );

  // Use real-time data if available, otherwise fall back to props
  const currentStatus = progress?.processing_status || processing_status;
  const currentProgress = progress?.processing_progress || processing_progress;
  const currentStep = progress?.processing_step || processing_step;
  const isProcessed = progress?.processed ?? processed;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={onView}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-gray-900 truncate" title={filename}>{filename}</h3>
            <p className="text-sm text-gray-500">{new Date(uploadDate).toLocaleDateString()}</p>
          </div>
        </div>
        <Badge variant={isProcessed ? 'success' : currentStatus === 'failed' ? 'error' : 'warning'}>
          {isProcessed ? 'Processed' : currentStatus === 'failed' ? 'Failed' : 'Processing'}
        </Badge>
      </div>
      
      {/* Progress bar for processing documents */}
      {!isProcessed && currentStatus !== 'failed' && (
        <div className="mb-3">
          <ProgressBar
            progress={currentProgress}
            status={currentStatus}
            step={currentStep}
          />
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {documentType && <Badge variant="neutral">{documentType}</Badge>}
          {isProcessed && (
            <span className="text-xs text-green-600 font-medium">✓ Ready</span>
          )}
          {currentStatus === 'failed' && (
            <span className="text-xs text-red-600 font-medium">✗ Failed</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm" onClick={(e) => { e.stopPropagation(); onView(); }}>
            View
          </Button>
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete document"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
