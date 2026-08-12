'use client'
import { usePathname } from 'next/navigation'

export default function PageWrapper({ children }) {
  const pathname = usePathname()

  return (
    <div
      key={pathname}
      style={{ animation: 'pageFadeIn 0s ease forwards' }}
    >
      {children}
    </div>
  )
}