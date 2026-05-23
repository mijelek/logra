import requests
from bs4 import BeautifulSoup
import feedparser
import socket

def get_feed_entries(feed_url):
    """Parse RSS feed and return list of entries"""
    try:
        socket.setdefaulttimeout(15)
        feed = feedparser.parse(feed_url)

        entries = []

        for entry in feed.entries:
            entries.append({
                'title': entry.get('title', ''),
                'url': entry.get('link', ''),
                'published': entry.get('published', ''),
                'description': entry.get('summary', '')
            })

        print(f"  → Found {len(entries)} entries")
        return entries

    except Exception as e:
        print(f"  → Feed parsing failed for {feed_url}: {e}")
        return []

def scrape_article(url):
    """Fetch full article text from URL"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }

        response = requests.get(url, headers=headers, timeout=10)

        if response.status_code != 200:
            print(f"  → Blocked or unavailable ({response.status_code})")
            return None

        soup = BeautifulSoup(response.content, 'html.parser')

        for tag in soup(['nav', 'footer', 'header', 'script',
                         'style', 'aside', 'advertisement']):
            tag.decompose()

        paragraphs = soup.find_all('p')
        content = ' '.join([p.get_text().strip() for p in paragraphs])

        if len(content) < 200:
            return None

        return content[:5000]

    except Exception as e:
        print(f"  → Scraping failed: {e}")
        return None
