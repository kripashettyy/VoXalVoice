import { useEffect, useRef, useState } from 'react'

interface Options {
  threshold?: number
  rootMargin?: string
}

/**
 * Returns a ref and a boolean `visible`.
 * Once the element enters the viewport, visible becomes true (one-shot).
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  { threshold = 0.15, rootMargin = '0px' }: Options = {}
) {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold, rootMargin }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold, rootMargin])

  return { ref, visible }
}
