import React from 'react'
import { EntityCard } from '@molecules/EntityCard'
import { Entity } from '@/types'

interface EntityListProps {
  entities: Entity[]
  loading?: boolean
}

export const EntityList: React.FC<EntityListProps> = ({ entities, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-20"></div>
        ))}
      </div>
    )
  }

  if (entities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No entities extracted yet</p>
        <p className="text-sm mt-1">Entities will appear here after document processing</p>
      </div>
    )
  }

  // Group entities by type for better organization
  const groupedEntities = entities.reduce((acc, entity) => {
    const type = entity.entity_type
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(entity)
    return acc
  }, {} as Record<string, Entity[]>)

  return (
    <div className="space-y-6">
      {Object.entries(groupedEntities).map(([type, typeEntities]) => (
        <div key={type}>
          <h4 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">
            {type.replace(/_/g, ' ')} ({typeEntities.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {typeEntities.map((entity) => (
              <EntityCard key={entity.id} entity={entity} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}