import anthropic
import json
import os
import re

client = anthropic.Anthropic(api_key=os.environ.get('ANTHROPIC_API_KEY'))

def clean_json(raw):
    """Robustly extract the best JSON object from a string"""

    # Strip markdown fences
    raw = raw.replace('```json', '').replace('```', '').strip()

    # If only one JSON object, return it directly
    if raw.count('{') == 1:
        return raw

    # Find all JSON objects in the string
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

    # Return the longest object — always the full article summary
    return max(objects, key=len)

def summarise_article(title, content, category):
    """Send raw article to Claude Haiku for summarisation"""
    try:
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
                'content': f'Title: {title}\n\nContent: {content}'
            }]
        )

        raw = response.content[0].text
        print(f"RAW CLAUDE RESPONSE: {repr(raw)}")  # This shows us exactly what Claude returned
        cleaned = clean_json(raw)

        result = json.loads(cleaned)
        return result

    except json.JSONDecodeError as e:
        raw_preview = response.content[0].text[:300] if response else 'no response'
        print(f"Summarisation failed: {e}")
        print(f"Claude returned: {raw_preview}")
        return None
    except Exception as e:
        print(f"Summarisation failed: {e}")
        return None
