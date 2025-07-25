'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, X, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import Image from 'next/image'

export function BankSlipUpload({ 
  onFileUpload,
  onFileRemove,
  isUploading = false,
  uploadProgress = 0
}: {
  onFileUpload: (file: File) => void
  onFileRemove: () => void
  isUploading?: boolean
  uploadProgress?: number
}) {
  const [preview, setPreview] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file && file.size <= 5 * 1024 * 1024) { // 5MB limit
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)
      onFileUpload(file)
    }
  }, [onFileUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB
  })

  const handleRemove = () => {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    onFileRemove()
  }

  return (
    <div className="space-y-3">
      {preview ? (
        <div className="relative group">
          <div className="relative rounded-md border overflow-hidden">
            <Image
            width={50}
            height={50}
              src={preview} 
              alt="Bank slip preview" 
              className="w-full h-48 object-contain bg-gray-50"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <Progress 
                  value={uploadProgress} 
                  className="w-[80%] h-2"
                />
              </div>
            )}
            {!isUploading && (
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/90 hover:bg-white"
                  onClick={handleRemove}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            )}
          </div>
          {!isUploading && (
            <div className="flex items-center text-sm text-green-600 mt-1">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span>Image uploaded successfully</span>
            </div>
          )}
        </div>
      ) : (
        <div 
          {...getRootProps()}
          className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {isDragActive ? (
              'Drop the bank slip here'
            ) : (
              <>
                Drag & drop your bank slip here, or click to select
                <br />
                <span className="text-xs text-gray-500">
                  (JPEG, JPG, PNG up to 5MB)
                </span>
              </>
            )}
          </p>
        </div>
      )}
    </div>
  )
}