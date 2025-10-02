import React from 'react'
import { useNavigate } from 'react-router-dom'

interface FloatingChatButtonProps {
  caseId?: string
  className?: string
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  caseId,
  className = ''
}) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (caseId) {
      navigate(`/case/${caseId}`)
    } else {
      navigate('/')
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`fixed bottom-6 right-6 bg-primary hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110 z-50 ${className}`}
      title="Open Chat"
    >
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
      </svg>
    </button>
  )
}