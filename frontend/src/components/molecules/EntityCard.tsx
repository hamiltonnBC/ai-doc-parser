import React from 'react'
import { Badge } from '@atoms/Badge'
import { Entity } from '@/types'

interface EntityCardProps {
  entity: Entity
}

export const EntityCard: React.FC<EntityCardProps> = ({ entity }) => {
  const getEntityTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'patient_name':
      case 'provider_name':
        return 'success'
      case 'diagnosis':
      case 'procedure':
        return 'warning'
      case 'medication':
        return 'danger'
      case 'date':
      case 'date_of_service':
        return 'neutral'
      default:
        return 'neutral'
    }
  }

  const formatEntityType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600'
    if (confidence >= 0.7) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <Badge variant={getEntityTypeColor(entity.entity_type)}>
          {formatEntityType(entity.entity_type)}
        </Badge>
        <span className={`text-sm font-medium ${getConfidenceColor(entity.confidence)}`}>
          {Math.round(entity.confidence * 100)}%
        </span>
      </div>
      
      <div className="mb-2">
        <p className="text-gray-900 font-medium">{entity.entity_value}</p>
      </div>

      {entity.source_location?.page && (
        <div className="text-xs text-gray-500">
          Page {entity.source_location.page}
        </div>
      )}
    </div>
  )
}