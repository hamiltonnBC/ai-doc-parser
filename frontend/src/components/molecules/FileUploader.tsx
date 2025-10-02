import React, { useRef } from 'react'
import { Button } from '@atoms/Button'

interface FileUploaderProps {
  onFileSelect: (file: File) => void
  accept?: string
}

export const FileUploader: React.FC<FileUploaderProps> = ({ 
  onFileSelect, 
  accept = '.pdf,.jpg,.jpeg,.png' 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      <Button onClick={handleClick}>Upload Document</Button>
    </div>
  )
}
