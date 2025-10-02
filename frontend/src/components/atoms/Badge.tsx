import React from 'react'

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'neutral'
  children: React.ReactNode
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children }) => {
  const variantClasses = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    neutral: 'bg-gray-100 text-gray-800'
  }

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${variantClasses[variant]}`}>
      {children}
    </span>
  )
}
