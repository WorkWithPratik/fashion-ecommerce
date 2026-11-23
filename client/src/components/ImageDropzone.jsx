import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, X, Play } from 'lucide-react'

const isVideoUrl = (url = '') => {
  return /\.(mp4|webm|mov)(\?.*)?$/i.test(url) || url.includes('/video/upload/')
}

export default function ImageDropzone({ onChange, maxFiles = 6, existingImages = [] }) {
  const [previews, setPreviews] = useState(existingImages.map(url => ({ url, file: null })))
  const [error, setError] = useState('')

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setError('Some files were rejected. JPG, PNG, WEBP, or MP4/WEBM video (up to 30MB each).')
      return
    }
    setError('')
    const newPreviews = acceptedFiles.map(file => ({
      url: URL.createObjectURL(file),
      file,
      isVideo: file.type.startsWith('video'),
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
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'video/mp4': [],
      'video/webm': [],
      'video/quicktime': [],
    },
    maxFiles: maxFiles - previews.length,
    maxSize: 30 * 1024 * 1024,
    disabled: previews.length >= maxFiles,
  })

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-sm p-6 text-center cursor-pointer transition-all duration-300
          ${isDragActive ? 'border-accent bg-accent/5' : 'border-gray-300 hover:border-accent hover:bg-gray-50'}
          ${previews.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <UploadCloud size={32} className={`mx-auto mb-2 ${isDragActive ? 'text-accent' : 'text-gray-400'}`} />
        <p className="text-sm font-semibold text-gray-700">
          {isDragActive ? 'Drop files here' : 'Drag & drop photos or video here, or click to browse'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Supports JPG, PNG, WEBP and MP4/WEBM videos &bull; Max {maxFiles} files
        </p>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {previews.map((item, index) => {
            const isVid = item.isVideo || isVideoUrl(item.url)
            return (
              <div key={index} className="relative group aspect-square bg-gray-100 overflow-hidden border border-gray-200">
                {isVid ? (
                  <div className="w-full h-full relative bg-black flex items-center justify-center">
                    <video src={item.url} className="w-full h-full object-cover opacity-80" muted playsInline />
                    <Play size={20} className="absolute text-white drop-shadow-md" fill="white" />
                  </div>
                ) : (
                  <img src={item.url} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                )}
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 bg-primary/80 text-accent text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removePreview(index)}
                  className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                >
                  <X size={12} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
