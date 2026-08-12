'use client'
import { usePathname } from 'next/navigation'

export default function PageWrapper({ children }) {
  const pathname = usePathname()

  return (
    <div
      key={pathname}
      style={{ animation: 'pageFadeIn 0.8s ease forwards' }}
    >
      {children}
    </div>
  )
}