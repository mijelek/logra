import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'
import { rateLimit } from '@/lib/rateLimit'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'

    const { allowed, remaining, resetIn } = rateLimit(ip)

    if (!allowed) {
      return Response.json(
        {
          answer: `You've reached the limit of 20 questions per hour. Please try again in ${resetIn} minute${resetIn === 1 ? '' : 's'}.`,
          sources: []
        },
        {
          status: 429,
          headers: { 'X-RateLimit-Remaining': '0' }
        }
      )
    }

    const { question, history = [] } = await request.json()

    if (!question?.trim()) {
      return Response.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    const recentHistory = history.slice(-6)

    // Extract keywords
    const keywords = question
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .split(' ')
      .filter(w => w.length > 3)
      .slice(0, 3)
      .join(' | ')

    // Primary text search
    let { data: articles } = await supabase
      .from('articles')
      .select('title, content, source_url')
      .textSearch('fts', keywords)
      .limit(3)

    // Fallback to title search
    if (!articles || articles.length === 0) {
      const firstKeyword = question.split(' ').find(w => w.length > 3) || question
      const { data: fallback } = await supabase
        .from('articles')
        .select('title, content, source_url')
        .ilike('title', `%${firstKeyword}%`)
        .limit(3)
      articles = fallback
    }

    // Last resort — recent articles
    if (!articles || articles.length === 0) {
      const { data: recent } = await supabase
        .from('articles')
        .select('title, content, source_url')
        .limit(3)
      articles = recent
    }

    // Build context
    const context = articles?.length
      ? articles.map(a =>
          `Title: ${a.title}\nSource: ${a.source_url}\nContent: ${a.content}`
        ).join('\n\n---\n\n')
      : 'No relevant articles found.'

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: `You are a friendly, approachable educational assistant about AI awareness, progressions, and misconceptions, aimed at students and non-technical readers.

Rules:
1. ONLY answer using the provided article excerpts below
2. Always cite the article title you pulled from
3. If the answer is not in the articles say EXACTLY:
   "I don't have information on that in my knowledge base."
   Do not suggest other sources. Do not add anything else.
4. Never use outside knowledge under any circumstances
5. Paraphrase where possible

Formatting:
- Keep responses concise (2-4 short paragraphs maximum)
- If making more than one point, ALWAYS use a numbered list or bullet points — never run multiple points together in a paragraph
- Put each list item on its own line starting with "- " for bullets or "1. " for numbered lists
- Never put multiple points on the same line separated by dashes
- Use a warm, conversational tone, as if explaining to a curious friend

ARTICLES:
${context}`,
      messages: [
        ...recentHistory.map(m => ({
          role: m.role,
          content: m.content
        })),
        { role: 'user', content: question }
      ]
    })

    const answer = response.content[0]?.text || "I wasn't able to generate a response. Please try again."

    return Response.json(
      {
        answer,
        sources: articles?.map(a => a.title) || []
      },
      {
        headers: { 'X-RateLimit-Remaining': String(remaining) }
      }
    )
  } catch (error) {
    console.error('Chat error:', error)
    return Response.json(
      {
        answer: 'Something went wrong connecting to Logra. Please try again in a moment.',
        sources: []
      },
      { status: 500 }
    )
  }
}