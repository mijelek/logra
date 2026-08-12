import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { count } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })

    return Response.json({ count })
  } catch (error) {
    return Response.json({ count: null })
  }
}