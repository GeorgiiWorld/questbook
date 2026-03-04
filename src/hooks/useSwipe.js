import { useRef } from 'react'

export function useSwipe(onSwipeLeft, onSwipeRight, threshold = 50) {
  const touchStart = useRef(null)

  const onTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX
  }

  const onTouchEnd = (e) => {
    if (touchStart.current === null) return

    const diff = touchStart.current - e.changedTouches[0].clientX

    if (Math.abs(diff) < threshold) return

    if (diff > 0) onSwipeLeft()
    else onSwipeRight()

    touchStart.current = null
  }

  return { onTouchStart, onTouchEnd }
}
