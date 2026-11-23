import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, X } from 'lucide-react'

export default function ImageDropzone({ onChange, maxFiles = 5, existingImages = [] }) {
  const [previews, setPreviews] = useState(existingImages.map(url => ({ url, file: null })))
  const [error, setError] = useState('')

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setError('Some files were rejected. Only JPG, PNG, WEBP up to 10MB each.')
      return
    }
    setError('')
    const newPreviews = acceptedFiles.map(file => ({
      url: URL.createObjectURL(file),
      file,
    }))

    const combined = [...previews, ...newPreviews].slice(0, maxFiles)
    setPreviews(combined)
    onChange?.(combined.map(p => p.file).filter(Boolean))
  }, [previews, maxFiles, onChange])

  const removePreview = (index) => {
    const updated = previews.filter((_, i) => i !== index)
    setPreviews(updated)
    onChange?.(updated.map(p => p.file).filter(Boolean))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxFiles: maxFiles - previews.length,
    maxSize: 10 * 1024 * 1024,
    disabled: previews.length >= maxFiles,
  })

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-all duration-300
          ${isDragActive ? 'border-accent bg-accent/5' : 'border-gray-300 hover:border-accent hover:bg-gray-50'}
          ${previews.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <UploadCloud size={36} className={`mx-auto mb-3 ${isDragActive ? 'text-accent' : 'text-gray-400'}`} />
        {isDragActive ? (
          <p className="text-accent font-medium text-sm">Drop the images here...</p>
        ) : (
          <>
            <p className="text-gray-600 text-sm font-medium">Drag & drop images here or click to browse</p>
            <p className="text-gray-400 text-xs mt-1.5">JPG, PNG, WEBP up to 10MB each · Max {maxFiles} images</p>
            {previews.length >= maxFiles && (
              <p className="text-amber-500 text-xs mt-1">Maximum {maxFiles} images reached</p>
            )}
          </>
        )}
      </div>

      {/* Error */}
      {error && <p className="text-red-500 text-xs">{error}</p>}

      {/* Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {previews.map((preview, index) => (
            <div key={index} className="relative group aspect-square bg-gray-100 overflow-hidden">
              <img
                src={preview.url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePreview(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
              {index === 0 && (
                <span className="absolute bottom-0 left-0 right-0 bg-primary/70 text-accent text-[10px] text-center py-0.5 font-medium">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
