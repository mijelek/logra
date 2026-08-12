'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import styles from './chat.module.css'

const SUGGESTIONS = [
  'What is a world model and why does it matter?',
  'Is AI going to take my job? What does the research say?',
  'What\'s a common misconception about how AI "thinks"?'
]

function renderMarkdown(text) {
  const paragraphs = text.split(/\n\n+/)
  return paragraphs.map((para, pi) => {
    if (/^\d+\.\s/.test(para)) {
      const items = para.split(/\n/).filter(Boolean)
      return (
        <ol key={pi} style={{ margin: pi < paragraphs.length - 1 ? '0 0 12px 0' : 0, paddingLeft: '20px' }}>
          {items.map((item, i) => (
            <li key={i} style={{ marginBottom: '4px' }}>
              {item.replace(/^\d+\.\s/, '')}
            </li>
          ))}
        </ol>
      )
    }

    if (/^[-*]\s/.test(para)) {
      const items = para.split(/\n/).filter(Boolean)
      return (
        <ul key={pi} style={{ margin: pi < paragraphs.length - 1 ? '0 0 12px 0' : 0, paddingLeft: '20px' }}>
          {items.map((item, i) => (
            <li key={i} style={{ marginBottom: '4px' }}>
              {item.replace(/^[-*]\s/, '')}
            </li>
          ))}
        </ul>
      )
    }

    const parts = para.split(/(\*\*.*?\*\*)/g)
    return (
      <p key={pi} style={{ margin: pi < paragraphs.length - 1 ? '0 0 12px 0' : 0 }}>
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>
          }
          return part
        })}
      </p>
    )
  })
}

function TypingText({ text, speed = 15, onUpdate, onDone }) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    setDisplayed('')
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      onUpdate?.()
      if (i >= text.length) {
        clearInterval(interval)
        onDone?.()
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text])

  return <>{renderMarkdown(displayed)}</>
}

function ThinkingDots() {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.')
    }, 400)
    return () => clearInterval(interval)
  }, [])

  return <span>{dots}</span>
}

function ChatPage() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [articleCount, setArticleCount] = useState(null)
  const [showLimit, setShowLimit] = useState(false)
  const [remaining, setRemaining] = useState(20)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const messagesContainerRef = useRef(null)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)
  const searchParams = useSearchParams()
  const hasAutoSent = useRef(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/count')
      .then(r => r.json())
      .then(d => setArticleCount(d.count))
      .catch(() => setArticleCount(null))
  }, [])

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    const q = searchParams.get('q')
    if (q && !hasAutoSent.current) {
      hasAutoSent.current = true
      handleAskWithQuestion(q)
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowLimit(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    function handleShortcuts(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setQuestion('')
        inputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handleShortcuts)
    return () => document.removeEventListener('keydown', handleShortcuts)
  }, [])

  function handleCopy(text, index) {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  async function handleAskWithQuestion(q) {
    if (!q.trim() || loading) return
    setLoading(true)
    const userMessage = { role: 'user', content: q }
    setMessages(prev => [...prev, userMessage])
    setQuestion('')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          history: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      const remainingHeader = res.headers.get('X-RateLimit-Remaining')
      if (remainingHeader !== null) {
        setRemaining(parseInt(remainingHeader))
      }

      const data = await res.json()

      if (!res.ok || data.error) {
        if (res.status === 429) setRemaining(0)
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.answer || 'Something went wrong. Please try again.',
          sources: [],
          isNew: true
        }])
        setLoading(false)
        return
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        sourceIds: data.sourceIds,
        isNew: true
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Something went wrong connecting to Logra. Please try again in a moment.',
        sources: [],
        isNew: true
      }])
    }
    setLoading(false)
  }

  async function handleAsk() {
    if (!question.trim() || loading) return
    await handleAskWithQuestion(question)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
    }
  }

  function scrollToBottom() {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }

  function markTypingDone(index) {
    setMessages(prev => prev.map((m, i) => i === index ? { ...m, isNew: false } : m))
  }

  return (
    <div className={styles.page}>
      <div className={`${styles.blob} ${styles.blobOrangeRight}`} />
      <div className={`${styles.blob} ${styles.blobOrangeLeft}`} />
      <div className={`${styles.blob} ${styles.blobDark}`} />

      <img
        src="/logo.svg"
        alt="Logra"
        className={styles.logo}
        onClick={() => router.push('/')}
        style={{ cursor: 'pointer' }}
      />

      <div className={styles.nav}>
        <span className={styles.navItem} onClick={() => router.push('/')}>HOME</span>
        <span className={styles.navItem} style={{ fontWeight: 700 }}>[LOGRA]</span>
        <span className={styles.navItem} onClick={() => router.push('/resources')}>RESOURCES</span>
      </div>

      <div className={styles.copyright}>
        © 2026 SPACIAL TECH LTD<br/>
        // LINKEDIN
      </div>

      <div ref={dropdownRef} style={{ position: 'absolute', right: '47px', top: '50px', zIndex: 3 }}>
        <div
          onClick={() => setShowLimit(s => !s)}
          style={{
            fontFamily: '"Fragment Mono", monospace',
            fontSize: '11px',
            color: remaining <= 5 ? 'rgba(232,115,46,0.8)' : 'rgba(249,237,228,0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            userSelect: 'none'
          }}
        >
          <span style={{
            width: '16px', height: '16px', borderRadius: '50%',
            border: `1px solid ${remaining <= 5 ? 'rgba(232,115,46,0.5)' : 'rgba(249,237,228,0.3)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px',
            color: remaining <= 5 ? 'rgba(232,115,46,0.8)' : 'rgba(249,237,228,0.5)'
          }}>i</span>
          {remaining} question{remaining !== 1 ? 's' : ''} remaining
        </div>

        {showLimit && (
          <div style={{
            position: 'absolute',
            right: 0,
            top: '28px',
            width: '260px',
            background: 'rgba(74,38,29,0.95)',
            border: '1px solid rgba(216,180,158,0.2)',
            borderRadius: '12px',
            padding: '16px',
            backdropFilter: 'blur(12px)',
            zIndex: 10
          }}>
            <div style={{
              fontFamily: '"Hedvig Letters Sans", serif',
              fontSize: '14px',
              color: '#FBF3EC',
              marginBottom: '8px',
              fontWeight: 300
            }}>
              Why is there a limit?
            </div>
            <div style={{
              fontFamily: '"Fragment Mono", monospace',
              fontSize: '11px',
              lineHeight: 1.7,
              color: 'rgba(249,237,228,0.6)'
            }}>
              Each question queries our AI and article database in real time. To keep Logra free and fast for everyone, we limit to 20 questions per hour per user.
            </div>
            <div style={{
              marginTop: '12px',
              fontFamily: '"Fragment Mono", monospace',
              fontSize: '10px',
              color: 'rgba(249,237,228,0.35)'
            }}>
              Limit resets every 60 minutes.
            </div>
          </div>
        )}
      </div>

      <div className={styles.content}>
        {messages.length > 0 && (
          <svg className={styles.persistentAsterisk} width="28" height="28" viewBox="0 0 100 100">
            <g transform="translate(50,50)" stroke="#ffffff" strokeWidth="4" strokeLinecap="round">
              <line x1="0" y1="-40" x2="0" y2="40"/>
              <line x1="-34.6" y1="-20" x2="34.6" y2="20"/>
              <line x1="-34.6" y1="20" x2="34.6" y2="-20"/>
            </g>
          </svg>
        )}

        <div className={styles.messages} ref={messagesContainerRef}>
          {messages.length === 0 && (
            <div className={styles.empty}>
              <div className={styles.emptyHeader}>
                <svg className={styles.emptyAsterisk} width="56" height="56" viewBox="0 0 100 100">
                  <g transform="translate(50,50)" stroke="#ffffff" strokeWidth="4" strokeLinecap="round">
                    <line x1="0" y1="-40" x2="0" y2="40"/>
                    <line x1="-34.6" y1="-20" x2="34.6" y2="20"/>
                    <line x1="-34.6" y1="20" x2="34.6" y2="-20"/>
                  </g>
                </svg>
              </div>
              <div className={styles.suggestions}>
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    className={styles.suggestionButton}
                    onClick={() => handleAskWithQuestion(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i}>
              {msg.role === 'user' ? (
                <div className={styles.userMessageWrapper}>
                  <div className={styles.userMessage}>{msg.content}</div>
                </div>
              ) : (
                <div className={styles.assistantMessageWrapper}>
                  <button
                    className={styles.copyButton}
                    onClick={() => handleCopy(msg.content, i)}
                  >
                    {copiedIndex === i ? 'copied!' : 'copy'}
                  </button>
                  <div className={styles.assistantMessage}>
                    {msg.isNew ? (
                      <TypingText
                        text={msg.content}
                        onUpdate={scrollToBottom}
                        onDone={() => markTypingDone(i)}
                      />
                    ) : (
                      renderMarkdown(msg.content)
                    )}
                    {msg.sources?.length > 0 && (
                      <div className={styles.sources}>
                        {msg.sources.map((s, j) => (
                          <span
                            key={j}
                            className={styles.sourceTag}
                            onClick={() => router.push(`/resources?search=${encodeURIComponent(s)}`)}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {loading && i === messages.length - 1 && msg.role === 'user' && (
                <div className={styles.thinking}>
                  thinking<ThinkingDots />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.inputBar}>
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Logra anything about AI..."
            disabled={loading}
          />
          <button
            className={styles.sendButton}
            onClick={handleAsk}
            aria-label="Send"
            disabled={loading}
          />
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          fontFamily: '"Fragment Mono", monospace',
          fontSize: '10px',
          color: 'rgba(249,237,228,0.2)',
          userSelect: 'none',
          pointerEvents: 'none',
          marginTop: '10px',
          flexShrink: 0
        }}>
          <span>⌘/ focus</span>
          <span>·</span>
          <span>ESC clear</span>
          <span>·</span>
          <span>↵ send</span>
        </div>
      </div>
    </div>
  )
}

export default function ChatPageWrapper() {
  return (
    <Suspense fallback={null}>
      <ChatPage />
    </Suspense>
  )
}