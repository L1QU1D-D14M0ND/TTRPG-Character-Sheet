import { useEffect, useState } from 'react'

const QUERY = '(max-width: 800px)'

export function usePrefersNarrow(): boolean {
  const [narrow, setNarrow] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia(QUERY).matches
  })

  useEffect(() => {
    // The initializer already tolerates a missing `matchMedia`; the effect
    // must too, or the whole app throws on mount wherever the API is absent
    // (older embedded webviews, and any test environment without it).
    if (typeof window === 'undefined' || !window.matchMedia) return
    const media = window.matchMedia(QUERY)
    const onChange = () => setNarrow(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return narrow
}
