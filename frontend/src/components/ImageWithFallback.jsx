import { useEffect, useState } from 'react'

export default function ImageWithFallback({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  skeletonClassName = '',
  fallbackSrc = '',
}) {
  const [activeSrc, setActiveSrc] = useState(src || '')
  const [status, setStatus] = useState(src ? 'loading' : 'error')

  useEffect(() => {
    setActiveSrc(src || '')
    setStatus(src ? 'loading' : 'error')
  }, [src])

  function handleError() {
    if (fallbackSrc && activeSrc !== fallbackSrc) {
      setActiveSrc(fallbackSrc)
      setStatus('loading')
      return
    }

    setStatus('error')
  }

  return (
    <div className={`relative ${wrapperClassName}`}>
      {status !== 'loaded' ? (
        <div
          className={`absolute inset-0 flex items-center justify-center rounded-md bg-slate-200 text-xs font-medium text-slate-500 ${
            status === 'loading' ? 'animate-pulse' : ''
          } ${skeletonClassName}`}
        >
          {status === 'loading' ? 'Loading image...' : 'Image unavailable'}
        </div>
      ) : null}

      {activeSrc ? (
        <img
          src={activeSrc}
          alt={alt}
          className={`${className} ${status === 'loaded' ? 'opacity-100' : 'opacity-0'} transition-opacity`}
          onLoad={() => setStatus('loaded')}
          onError={handleError}
        />
      ) : null}
    </div>
  )
}
