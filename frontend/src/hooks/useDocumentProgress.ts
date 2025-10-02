import { useState, useEffect, useCallback } from 'react';
import { documentsApi } from '../services/api';

interface DocumentProgress {
  id: string;
  filename: string;
  processed: boolean;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_progress: number;
  processing_step?: string;
  uploaded_at: string;
}

export const useDocumentProgress = (documentId: string | null, pollInterval = 2000) => {
  const [progress, setProgress] = useState<DocumentProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!documentId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await documentsApi.getStatus(documentId);
      setProgress(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch document progress');
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (!documentId) return;

    // Initial fetch
    fetchProgress();

    // Set up polling only if document is still processing
    const interval = setInterval(() => {
      if (progress?.processing_status === 'processing' || progress?.processing_status === 'pending') {
        fetchProgress();
      }
    }, pollInterval);

    return () => clearInterval(interval);
  }, [documentId, fetchProgress, pollInterval, progress?.processing_status]);

  // Stop polling when processing is complete
  useEffect(() => {
    if (progress?.processing_status === 'completed' || progress?.processing_status === 'failed') {
      // Optional: trigger a callback when processing is done
    }
  }, [progress?.processing_status]);

  return {
    progress,
    loading,
    error,
    refetch: fetchProgress,
    isProcessing: progress?.processing_status === 'processing' || progress?.processing_status === 'pending',
    isCompleted: progress?.processing_status === 'completed',
    isFailed: progress?.processing_status === 'failed'
  };
};