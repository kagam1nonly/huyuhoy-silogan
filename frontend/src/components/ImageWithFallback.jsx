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
      {status === 'loading' ? (
        <div
          className={`absolute inset-0 rounded-md bg-slate-100/80 animate-pulse ${skeletonClassName}`}
        />
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
