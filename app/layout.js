import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata = {
  title: {
    default: 'Logra — AI Knowledge Assistant',
    template: '%s | Logra'
  },
  description: 'Stay informed about AI. Logra helps students and curious minds understand AI progressions, bust misconceptions, and make smarter decisions in the age of artificial intelligence.',
  keywords: ['AI', 'artificial intelligence', 'machine learning', 'AI misconceptions', 'AI news', 'AI education', 'LLM', 'AI literacy'],
  authors: [{ name: 'Spacial Tech Ltd' }],
  creator: 'Spacial Tech Ltd',
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://logra.app',
    siteName: 'Logra',
    title: 'Logra — AI Knowledge Assistant',
    description: 'Stay informed about AI. Understand progressions, bust misconceptions, and make smarter decisions.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Logra — AI Knowledge Assistant'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Logra — AI Knowledge Assistant',
    description: 'Stay informed about AI. Understand progressions, bust misconceptions, and make smarter decisions.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/icon.svg',
  },
  robots: {
    index: true,
    follow: true,
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div style={{ animation: 'pageFadeIn 0.4s ease forwards' }}>
          {children}
        </div>
        <style>{`
          @keyframes pageFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @media (max-width: 768px) {
            .mobile-banner { display: block !important; }
          }
        `}</style>
        <div
          className="mobile-banner"
          style={{
            display: 'none',
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(74,38,29,0.97)',
            color: 'rgba(249,237,228,0.8)',
            fontFamily: 'monospace',
            fontSize: '12px',
            padding: '12px 20px',
            textAlign: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(8px)'
          }}
        >
          Logra is best experienced on desktop for now ✳
        </div>
      </body>
    </html>
  )
}