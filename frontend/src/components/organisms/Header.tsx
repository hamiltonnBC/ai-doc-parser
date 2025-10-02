import React from 'react'
import { Link } from 'react-router-dom'

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">InQuery Demo</h1>
          </Link>
          <nav className="flex space-x-4">
            <Link to="/" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
              Dashboard
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
