import React, { useState, useEffect } from 'react'
import { Badge } from '@atoms/Badge'

interface UsageStatsData {
  documents: {
    total: number
    processed: number
    limit: number
  }
  storage: {
    used_mb: number
    limit_mb: number
    percentage: number
  }
  chat: {
    requests_24h: number
    hourly_limit: number
    daily_limit: number
  }
  limits: {
    max_file_size_mb: number
    max_files_per_case: number
    max_document_pages: number
    demo_mode: boolean
  }
}

interface UsageStatsProps {
  className?: string
}

export const UsageStats: React.FC<UsageStatsProps> = ({ className = '' }) => {
  const [stats, setStats] = useState<UsageStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsageStats()
  }, [])

  const fetchUsageStats = async () => {
    try {
      const response = await fetch('/api/documents/usage-stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
        setError(null)
      } else {
        setError('Failed to load usage statistics')
      }
    } catch (err) {
      setError('Error fetching usage statistics')
    } finally {
      setLoading(false)
    }
  }

  const getStorageColor = (percentage: number) => {
    if (percentage >= 90) return 'danger'
    if (percentage >= 70) return 'warning'
    return 'success'
  }

  const getDocumentColor = (current: number, limit: number) => {
    const percentage = (current / limit) * 100
    if (percentage >= 90) return 'danger'
    if (percentage >= 70) return 'warning'
    return 'success'
  }

  if (loading) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return null // Hide the component when there's an error or no data
  }

  if (!stats.limits.demo_mode) {
    return null // Don't show usage stats if not in demo mode
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-blue-900">Demo Usage Limits</h4>
        <Badge variant="neutral">Demo Mode</Badge>
      </div>
      
      <div className="space-y-3 text-sm">
        {/* Documents */}
        <div className="flex items-center justify-between">
          <span className="text-blue-700">Documents:</span>
          <div className="flex items-center space-x-2">
            <span className="text-blue-900 font-medium">
              {stats.documents.total}/{stats.documents.limit}
            </span>
            <Badge 
              variant={getDocumentColor(stats.documents.total, stats.documents.limit)}
            >
              {Math.round((stats.documents.total / stats.documents.limit) * 100)}%
            </Badge>
          </div>
        </div>

        {/* Storage */}
        <div className="flex items-center justify-between">
          <span className="text-blue-700">Storage:</span>
          <div className="flex items-center space-x-2">
            <span className="text-blue-900 font-medium">
              {stats.storage.used_mb.toFixed(1)}/{stats.storage.limit_mb} MB
            </span>
            <Badge 
              variant={getStorageColor(stats.storage.percentage)}
            >
              {stats.storage.percentage.toFixed(1)}%
            </Badge>
          </div>
        </div>

        {/* Chat Requests */}
        <div className="flex items-center justify-between">
          <span className="text-blue-700">Chat (24h):</span>
          <div className="flex items-center space-x-2">
            <span className="text-blue-900 font-medium">
              {stats.chat.requests_24h}/{stats.chat.daily_limit}
            </span>
            <Badge 
              variant={getDocumentColor(stats.chat.requests_24h, stats.chat.daily_limit)}
            >
              {Math.round((stats.chat.requests_24h / stats.chat.daily_limit) * 100)}%
            </Badge>
          </div>
        </div>

        {/* Limits Info */}
        <div className="pt-2 border-t border-blue-200">
          <div className="text-xs text-blue-600 space-y-1">
            <div>• Max file size: {stats.limits.max_file_size_mb}MB</div>
            <div>• Max files per case: {stats.limits.max_files_per_case}</div>
            <div>• Chat limit: {stats.chat.hourly_limit}/hour, {stats.chat.daily_limit}/day</div>
          </div>
        </div>
      </div>
    </div>
  )
}