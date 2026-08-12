'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from './resources.module.css'

const PAGE_SIZE = 20

function ResourcesPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [highlightedTitle, setHighlightedTitle] = useState(null)
  const router = useRouter()
  const urlSearchParams = useSearchParams()

  useEffect(() => {
    const searchParam = urlSearchParams.get('search')
    if (searchParam) {
      setSearchInput(searchParam)
      setSearch(searchParam)
      setHighlightedTitle(searchParam)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: PAGE_SIZE.toString(),
      category: categoryFilter,
      search
    })

    fetch(`/api/articles?${params}`)
      .then(r => r.json())
      .then(d => {
        setArticles(d.articles || [])
        setTotal(d.total || 0)
        setTotalPages(d.totalPages || 0)
        setLoading(false)
        if (highlightedTitle && d.articles?.length) {
          const match = d.articles.find(a => a.title === highlightedTitle)
          if (match) setExpandedId(match.id)
        }
      })
      .catch(() => setLoading(false))
  }, [page, categoryFilter, search])

  useEffect(() => {
    setPage(0)
  }, [categoryFilter, search])

  function handleSearchSubmit(e) {
    if (e.key === 'Enter') {
      setSearch(searchInput)
      setHighlightedTitle(null)
    }
  }

  const categories = ['all', 'awareness', 'progression', 'misconceptions']

  function formatDate(dateStr) {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <div className={styles.page}>
      <div className={`${styles.blob} ${styles.blobOrangeRight}`} />
      <div className={`${styles.blob} ${styles.blobBlack}`} />
      <div className={`${styles.blob} ${styles.blobOrangeLeft}`} />
      <div className={`${styles.blob} ${styles.blobOrange}`} />

      <img
        src="/logo.svg"
        alt="Logra"
        className={styles.logo}
        onClick={() => router.push('/')}
        style={{ cursor: 'pointer' }}
      />

      <div className={styles.nav}>
        <span className={styles.navItem} onClick={() => router.push('/')}>HOME</span>
        <span className={styles.navItem} onClick={() => router.push('/chat')}>[LOGRA]</span>
        <span className={styles.navItem} style={{ fontWeight: 700 }}>RESOURCES</span>
      </div>

      <div className={styles.copyright}>
        © 2026 SPACIAL TECH LTD<br/>
        // LINKEDIN
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Resources</h1>
          <span className={styles.count}>{total} articles</span>
        </div>

        <div className={styles.controls}>
          <input
            className={styles.searchInput}
            placeholder="Search by title..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={handleSearchSubmit}
          />
          <div className={styles.filters}>
            {categories.map(cat => (
              <button
                key={cat}
                className={`${styles.filterButton} ${categoryFilter === cat ? styles.filterActive : ''}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span className={styles.colTitle}>Title</span>
            <span className={styles.colCategory}>Category</span>
            <span className={styles.colDate}>Date</span>
            <span className={styles.colSource}></span>
          </div>

          {loading && (
            <>
              {[...Array(8)].map((_, i) => (
                <div key={i} className={styles.skeletonRow}>
                  <div className={styles.skeletonCell} />
                  <div className={styles.skeletonCellShort} />
                  <div className={styles.skeletonCellShort} />
                  <div className={styles.skeletonCell} style={{ width: '24px', borderRadius: '50%' }} />
                </div>
              ))}
            </>
          )}

          {!loading && articles.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateTitle}>No articles found</div>
              <div className={styles.emptyStateText}>
                Try a different search term or clear the filters
              </div>
              <button
                className={styles.emptyStateClear}
                onClick={() => {
                  setSearch('')
                  setSearchInput('')
                  setCategoryFilter('all')
                }}
              >
                Clear search
              </button>
            </div>
          )}

          {!loading && articles.map(article => (
            <div key={article.id}>
              <div
                className={`${styles.row} ${highlightedTitle === article.title ? styles.rowHighlighted : ''}`}
                onClick={() => setExpandedId(expandedId === article.id ? null : article.id)}
              >
                <span className={styles.colTitle}>{article.title}</span>
                <span className={styles.colCategory}>
                  <span className={styles.categoryBadge}>{article.category}</span>
                </span>
                <span className={styles.colDate}>{formatDate(article.created_at)}</span>
                <span className={styles.colSource}>
                  <a
                    href={article.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className={styles.sourceLink}
                  >
                    ↗
                  </a>
                </span>
              </div>

              {expandedId === article.id && (
                <div className={styles.expanded}>
                  <p className={styles.summary}>{article.content}</p>
                  {article.tags?.length > 0 && (
                    <div className={styles.tags}>
                      {article.tags.map((tag, i) => (
                        <span key={i} className={styles.tag}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageButton}
              disabled={page === 0}
              onClick={() => setPage(p => Math.max(0, p - 1))}
            >
              ← Prev
            </button>
            <span className={styles.pageInfo}>
              Page {page + 1} of {totalPages}
            </span>
            <button
              className={styles.pageButton}
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ResourcesPageWrapper() {
  return (
    <Suspense fallback={null}>
      <ResourcesPage />
    </Suspense>
  )
}