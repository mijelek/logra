import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from feeds import RSS_FEEDS
from scraper import get_feed_entries, scrape_article
from summariser_new import summarise_article
from database import article_exists, store_article

def run():
    print("VERSION 2 - UPDATED CODE RUNNING")
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

            if article_exists(url):
                print(f"Already exists, skipping: {entry['title']}")
                total_skipped += 1
                continue

            content = scrape_article(url)

            if not content:
                content = entry.get('description', '')

            if not content or len(content) < 100:
                print(f"  → No content found: {entry['title'][:50]}")
                total_failed += 1
                continue

            print(f"  → Summarising: {entry['title'][:50]}")
            print(f"  → Content preview: {repr(content[:100])}")

            try:
                result = summarise_article(
                    entry['title'],
                    content,
                    feed['category']
                )
                print(f"  → Result: {result}")
            except Exception as e:
