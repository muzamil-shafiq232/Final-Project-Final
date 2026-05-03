'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const MIN_ROUTE_LOADER_MS = 450

export default function AppProgress() {
  const pathname = usePathname()
  const isFirstRender = useRef(true)

  const [routeLoading, setRouteLoading] = useState(false)
  const [activeRequests, setActiveRequests] = useState(0)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    setRouteLoading(true)
    const timeout = setTimeout(() => setRouteLoading(false), MIN_ROUTE_LOADER_MS)
    return () => clearTimeout(timeout)
  }, [pathname])

  useEffect(() => {
    const onRequestStart = () => setActiveRequests((count) => count + 1)
    const onRequestEnd = () => setActiveRequests((count) => Math.max(count - 1, 0))

    window.addEventListener('app:network-start', onRequestStart)
    window.addEventListener('app:network-end', onRequestEnd)

    return () => {
      window.removeEventListener('app:network-start', onRequestStart)
      window.removeEventListener('app:network-end', onRequestEnd)
    }
  }, [])

  const visible = routeLoading || activeRequests > 0

  return (
    <div
      className={`pointer-events-none fixed left-0 right-0 top-0 z-[90] h-1.5 bg-transparent transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="h-full w-full overflow-hidden bg-indigo-100/70">
        <div className="h-full w-1/3 animate-app-loader-slide rounded-r-full bg-gradient-to-r from-indigo-600 via-cyan-500 to-violet-500" />
      </div>
    </div>
  )
}
