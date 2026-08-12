import { supabase } from '@/lib/supabase'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const category = searchParams.get('category') || 'all'
    const search = searchParams.get('search') || ''

    const from = page * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('articles')
      .select('id, title, content, category, source_url, created_at, tags, key_points', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (category !== 'all') {
      query = query.eq('category', category)
    }

    if (search.trim()) {
      query = query.ilike('title', `%${search.trim()}%`)
    }

    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) throw error

    return Response.json({
      articles: data,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize)
    })
  } catch (error) {
    console.error('Articles fetch error:', error)
    return Response.json({ articles: [], total: 0, error: 'Failed to load articles' }, { status: 500 })
  }
}