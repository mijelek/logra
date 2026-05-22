from supabase import create_client
import os

supabase = create_client(
    os.environ.get('SUPABASE_URL'),
    os.environ.get('SUPABASE_KEY')
)

def article_exists(url):
    """Check if article already stored to avoid duplicates"""
    try:
        result = supabase.table('articles') \
            .select('id') \
            .eq('source_url', url) \
            .execute()
        return len(result.data) > 0
    except Exception as e:
        print(f"  → DB CHECK ERROR: {e}")
        print(f"  → Problematic URL: {url[:150]}")
        return False

def store_article(article, source_url):
    """Insert article into Supabase"""
    try:
        supabase.table('articles').insert({
            'title': article['title'],
            'content': article['summary'],
            'source_url': source_url,
            'category': article['category'],
            'tags': article.get('tags', []),
            'key_points': article.get('key_points', [])
        }).execute()
        print(f"✓ Stored: {article['title']}")
        return True
    except Exception as e:
        print(f"✗ Storage failed: {e}")
        return False
