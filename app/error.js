'use client'
import { useRouter } from 'next/navigation'

export default function Error({ error, reset }) {
  const router = useRouter()

  return (
    <div style={{
      position: 'relative',
      height: '100vh',
      background: 'linear-gradient(180deg, #BD603E 0%, #4A261D 85.93%)',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        position: 'absolute', width: '600px', height: '280px',
        right: '-300px', top: '150px',
        background: '#E44118', filter: 'blur(120px)'
      }} />
      <div style={{
        position: 'absolute', width: '500px', height: '500px',
        left: '-200px', top: '50px',
        background: '#D06623', filter: 'blur(120px)'
      }} />
      <div style={{
        position: 'absolute', width: '600px', height: '400px',
        right: '50px', bottom: '-200px',
        background: '#7A2E12', filter: 'blur(140px)'
      }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '480px', padding: '0 24px' }}>
        <svg width="48" height="48" viewBox="0 0 100 100" style={{ marginBottom: '24px', opacity: 0.6 }}>
          <g transform="translate(50,50)" stroke="#ffffff" strokeWidth="4" strokeLinecap="round">
            <line x1="0" y1="-40" x2="0" y2="40"/>
            <line x1="-34.6" y1="-20" x2="34.6" y2="20"/>
            <line x1="-34.6" y1="20" x2="34.6" y2="-20"/>
          </g>
        </svg>
        <h1 style={{
          fontFamily: '"Hedvig Letters Sans", serif',
          fontSize: '28px', fontWeight: 300,
          color: '#FFFFFF', marginBottom: '12px'
        }}>
          Something went wrong
        </h1>
        <p style={{
          fontFamily: '"Fragment Mono", monospace',
          fontSize: '13px', lineHeight: 1.7,
          color: 'rgba(249,237,228,0.55)', marginBottom: '32px'
        }}>
          Logra ran into an unexpected error. This has been noted — try again or head back home.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => reset()}
            style={{
              fontFamily: '"Fragment Mono", monospace',
              fontSize: '12px', padding: '10px 20px',
              background: 'rgba(249,249,249,0.1)',
              border: '1px solid rgba(249,249,249,0.2)',
              borderRadius: '8px', color: '#fff', cursor: 'pointer'
            }}
          >
            Try again
          </button>
          <button
            onClick={() => router.push('/')}
            style={{
              fontFamily: '"Fragment Mono", monospace',
              fontSize: '12px', padding: '10px 20px',
              background: '#F9F9F9',
              border: 'none',
              borderRadius: '8px', color: '#1a0f0a', cursor: 'pointer'
            }}
          >
            Go home
          </button>
        </div>
      </div>
    </div>
  )
}