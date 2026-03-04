import { useState } from 'react'
import './FileUpload.css'

interface FileUploadProps {
  onFileUpload: (file: File) => void
}

function FileUpload({ onFileUpload }: FileUploadProps) {
  const [fileName, setFileName] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      onFileUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.xls') || file.name.endsWith('.xlsx'))) {
      setFileName(file.name)
      onFileUpload(file)
    }
  }

  return (
    <div 
      className={`file-upload ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="fileInput"
        accept=".xls,.xlsx"
        onChange={handleFileChange}
        className="file-input"
      />
      <label htmlFor="fileInput" className="file-label">
        <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <span className="upload-text">
          {fileName || 'Click to upload or drag and drop'}
        </span>
        <span className="upload-hint">Excel files (.xls, .xlsx)</span>
      </label>
    </div>
  )
}

export default FileUpload
