'use client'
import { useRouter } from 'next/navigation'

export default function NotFound() {
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
        <div style={{
          fontFamily: '"Fragment Mono", monospace',
          fontSize: '80px', fontWeight: 400,
          color: 'rgba(249,237,228,0.15)',
          lineHeight: 1, marginBottom: '24px',
          letterSpacing: '-0.02em'
        }}>
          404
        </div>
        <h1 style={{
          fontFamily: '"Hedvig Letters Sans", serif',
          fontSize: '28px', fontWeight: 300,
          color: '#FFFFFF', marginBottom: '12px'
        }}>
          Page not found
        </h1>
        <p style={{
          fontFamily: '"Fragment Mono", monospace',
          fontSize: '13px', lineHeight: 1.7,
          color: 'rgba(249,237,228,0.55)', marginBottom: '32px'
        }}>
          This page doesn't exist. It may have moved, or the link might be wrong.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => router.push('/chat')}
            style={{
              fontFamily: '"Fragment Mono", monospace',
              fontSize: '12px', padding: '10px 20px',
              background: 'rgba(249,249,249,0.1)',
              border: '1px solid rgba(249,249,249,0.2)',
              borderRadius: '8px', color: '#fff', cursor: 'pointer'
            }}
          >
            Open Logra
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