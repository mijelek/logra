import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from feeds import RSS_FEEDS
from scraper import get_feed_entries, scrape_article
from summariser import summarise_article
from database import article_exists, store_article

def run():
    total_stored = 0
    total_skipped = 0
    total_failed = 0

    print("Starting article collection...")

    for feed in RSS_FEEDS:
        print(f"\nProcessing feed: {feed['url']}")
        entries = get_feed_entries(feed['url'])

        for entry in entries:
            url = entry['url']

            if not url or not entry['title']:
                continue

            # Skip if already in database
            if article_exists(url):
                print(f"Already exists, skipping: {entry['title']}")
                total_skipped += 1
                continue

            # Try to scrape full content
            content = scrape_article(url)

            # Fall back to RSS description if scraping fails
            if not content:
                content = entry.get('description', '')

            if not content or len(content) < 100:
                print(f"  → No content found: {entry['title'][:50]}")
                total_failed += 1
                continue

            # Summarise with Claude Haiku
            print(f"  → Summarising: {entry['title'][:50]}")  # ← fixed
            try:
                result = summarise_article(
                    entry['title'],
                    content,
                    feed['category']
                )
                print(f"  → Result: {result}")
            except Exception as e:
                print(f"  → MAIN ERROR: {type(e).__name__}: {e}")
                result = None

            if not result or result.get('skip'):
                print(f"  → Not AI relevant, skipping")
                total_skipped += 1
                continue

            # Store in Supabase
            stored = store_article(result, url)
            if stored:
                total_stored += 1
            else:
                total_failed += 1

    print(f"\nDone! Stored: {total_stored} | Skipped: {total_skipped} | Failed: {total_failed}")

if __name__ == '__main__':
    run()            stored = store_article(result, url)
            if stored:
                total_stored += 1
            else:
                total_failed += 1

    print(f"\nDone! Stored: {total_stored} | Skipped: {total_skipped} | Failed: {total_failed}")

if __name__ == '__main__':
    run()
