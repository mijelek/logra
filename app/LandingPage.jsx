'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './LandingPage.module.css'

function CountUp({ target }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!target) return
    const duration = 3000 // was 1500
    const steps = 80 // was 60
    const increment = target / steps
    const stepTime = duration / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [target])

  return <>{count.toLocaleString()}</>
}

export default function LandingPage() {
  const [query, setQuery] = useState('')
  const [articleCount, setArticleCount] = useState(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/count')
      .then(r => r.json())
      .then(d => setArticleCount(d.count))
      .catch(() => null)
  }, [])

  function handleSearch() {
    if (!query.trim()) {
      router.push('/chat')
      return
    }
    router.push(`/chat?q=${encodeURIComponent(query)}`)
  }

  return (
    <div className={styles.page}>
      <div className={`${styles.blob} ${styles.blobOrangeRight}`} />
      <div className={`${styles.blob} ${styles.blobBlack}`} />
      <div className={`${styles.blob} ${styles.blobOrangeLeft}`} />
      <div className={`${styles.blob} ${styles.blobOrange}`} />

      <img src="/logo.svg" alt="Logra" className={styles.logo} />

      <div className={styles.nav}>
        <span className={styles.navItem} style={{ fontWeight: 700 }}>HOME</span>
        <span className={styles.navItem} onClick={() => router.push('/chat')}>[LOGRA]</span>
        <span className={styles.navItem} onClick={() => router.push('/resources')}>RESOURCES</span>
      </div>

      <div className={styles.heroCard}>
        <div>
          <svg className={styles.asterisk} width="48" height="48" viewBox="0 0 100 100">
            <g transform="translate(50,50)" stroke="#ffffff" strokeWidth="4" strokeLinecap="round">
              <line x1="0" y1="-40" x2="0" y2="40"/>
              <line x1="-34.6" y1="-20" x2="34.6" y2="20"/>
              <line x1="-34.6" y1="20" x2="34.6" y2="-20"/>
            </g>
          </svg>
          <h1 className={styles.heroTitle}>
            Stay informed and ahead in the fast-changing age of AI
          </h1>
        </div>

        <div>
          <p className={styles.ctaText}>
            Beat misinformation around AI. Stay updated on real developments and make smarter career decisions.
          </p>
          {articleCount && (
            <p style={{
              fontFamily: '"Fragment Mono", monospace',
              fontSize: '11px',
              color: 'rgba(216, 180, 158, 0.6)',
              marginBottom: '16px'
            }}>
              <CountUp target={articleCount} /> articles indexed
            </p>
          )}
          <button className={styles.ctaButton} onClick={() => router.push('/chat')}>
            START EXPLORING
          </button>
        </div>
      </div>

      <div className={styles.searchContainer}>
        <div className={styles.searchBarWrapper}>
          <input
            className={styles.searchInput}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Logra, What are the biggest myths about AI?"
          />
          <div className={styles.searchButton} onClick={handleSearch}></div>
        </div>
      </div>

      <div className={styles.disclaimer}>
        Stay updated, understand AI, plan your career.
      </div>

      <div className={styles.copyright}>
        © 2026 SPACIAL TECH LTD<br/>
        // LINKEDIN
      </div>
    </div>
  )
}