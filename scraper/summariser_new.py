import anthropic
import json
import os
import re

client = anthropic.Anthropic(api_key=os.environ.get('ANTHROPIC_API_KEY'))

def clean_json(raw):
    """Robustly extract the best JSON object from a string"""
    raw = raw.replace('```json', '').replace('```', '').strip()

    if raw.count('{') <= 1:
        return raw

    objects = []
    depth = 0
    start = None

    for i, char in enumerate(raw):
        if char == '{':
            if depth == 0:
                start = i
            depth += 1
        elif char == '}':
            depth -= 1
            if depth == 0 and start is not None:
                objects.append(raw[start:i+1])
                start = None

    if not objects:
        return raw

    return max(objects, key=len)

def summarise_article(title, content, category):
    """Send raw article to Claude Haiku for summarisation"""
    raw = None
    try:
        # Clean content before sending
        content = content.encode('utf-8', errors='ignore').decode('utf-8')
        title = title.encode('utf-8', errors='ignore').decode('utf-8')

        print(f"  → Calling Claude API...")

        response = client.messages.create(
            model='claude-haiku-4-5-20251001',
            max_tokens=1000,
            system="""You are an article processor for an AI education database.

You must return ONE single JSON object and nothing else.

If the article IS relevant to AI, return exactly this structure:
{
  "title": "article title here",
  "summary": "200-300 word summary here",
  "tags": ["tag1", "tag2", "tag3"],
  "category": "awareness",
  "key_points": ["point1", "point2", "point3"]
}

If the article is NOT relevant to AI, return exactly this:
{"skip": true}

Category must be one of: awareness, progression, misconceptions
Do not return two JSON objects. Do not add any text before or after the JSON.""",
            messages=[{
                'role': 'user',
                'content': f'Title: {title}\n\nContent: {content[:3000]}'
            }]
        )

        raw = response.content[0].text
        print(f"  → RAW CLAUDE RESPONSE: {repr(raw[:200])}")

        cleaned = clean_json(raw)
        result = json.loads(cleaned)
        return result

    except json.JSONDecodeError as e:
        print(f"  → JSON ERROR: {e}")
        print(f"  → Raw was: {repr(raw[:200]) if raw else 'None'}")
        return None
    except anthropic.APIError as e:
        print(f"  → API ERROR: {e}")
        return None
    except Exception as e:
        print(f"  → UNEXPECTED ERROR: {type(e).__name__}: {e}")
        return None
