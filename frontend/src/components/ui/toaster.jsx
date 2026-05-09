import { useEffect, useState } from 'react'
import { Toaster as Sonner } from 'sonner'

export function Toaster() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false,
  )

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    function handleChange(event) {
      setIsMobile(event.matches)
    }
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [])

  return <Sonner richColors position="top-center" offset={{ top: isMobile ? 110 : 74, left: 16, right: 16 }} />
}
