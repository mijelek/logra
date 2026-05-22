import requests
from bs4 import BeautifulSoup
import feedparser

def get_feed_entries(feed_url):
    """Parse RSS feed and return list of entries"""
    feed = feedparser.parse(feed_url)
    entries = []

    for entry in feed.entries:
        entries.append({
            'title': entry.get('title', ''),
            'url': entry.get('link', ''),
            'published': entry.get('published', ''),
            'description': entry.get('summary', '')
        })

    return entries

def scrape_article(url):
    """Fetch full article text from URL"""
    try:
        headers = {
            # Mimics a real browser so sites don't block the request
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }

        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')

        # Remove clutter like nav bars, footers, ads
        for tag in soup(['nav', 'footer', 'header', 'script', 'style', 'aside']):
            tag.decompose()

        # Extract all paragraph text
        paragraphs = soup.find_all('p')
        content = ' '.join([p.get_text() for p in paragraphs])

        # If scraping fails or is too short, fall back to RSS description
        if len(content) < 200:
            return None

        return content[:5000]  # Cap at 5000 chars to control token usage

    except Exception as e:
        print(f"Scraping failed for {url}: {e}")
        return None
