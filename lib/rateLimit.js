const rateLimitMap = new Map()

const WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_REQUESTS = 20 // temporarily set to 2 for testing

export function rateLimit(ip) {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry) {
    rateLimitMap.set(ip, { count: 1, start: now })
    return { allowed: true, remaining: MAX_REQUESTS - 1 }
  }

  // Reset window if expired
  if (now - entry.start > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, start: now })
    return { allowed: true, remaining: MAX_REQUESTS - 1 }
  }

  // Within window
  if (entry.count >= MAX_REQUESTS) {
    const resetIn = Math.ceil((WINDOW_MS - (now - entry.start)) / 1000 / 60)
    return { allowed: false, remaining: 0, resetIn }
  }

  entry.count++
  return { allowed: true, remaining: MAX_REQUESTS - entry.count }
}