import anthropic
import json
import os
import re

client = anthropic.Anthropic(api_key=os.environ.get('ANTHROPIC_API_KEY'))

def summarise_article(title, content, category):
    """Send raw article to Claude Haiku for summarisation"""
    try:
        response = client.messages.create(
            model='claude-haiku-4-5-20251001',
            max_tokens=1000,
            system="""You are an article processor for an AI education database.
            
            Given an article, return ONLY a single JSON object with these exact keys:
            - title: cleaned article title (string)
            - summary: 200-300 word educational summary (string)
            - tags: list of 3-5 relevant tags (array of strings)
            - category: one of "awareness", "progression", or "misconceptions" (string)
            - key_points: list of 3 main takeaways (array of strings)
            
            Rules:
            - Focus on AI awareness, progressions, and misconceptions only
            - If the article is not relevant to AI, return {"skip": true}
            - Never include raw HTML or URLs in the summary
            - Write in clear educational language
            - Return a single valid JSON object only, no extra text""",
            messages=[{
                'role': 'user',
                'content': f'Title: {title}\n\nContent: {content}'
            }]
        )

        raw = response.content[0].text

        # Strip markdown code fences
        raw = raw.replace('```json', '').replace('```', '').strip()

        # If multiple JSON objects returned, take the longest one
        if raw.count('{') > 1:
            objects = re.findall(r'\{.*?\}', raw, re.DOTALL)
            if objects:
                raw = max(objects, key=len)

        return json.loads(raw)

    except json.JSONDecodeError as e:
        print(f"Summarisation failed: {e}")
        print(f"Raw response was: {raw[:200]}")  # Shows what Claude returned
        return None
    except Exception as e:
        print(f"Summarisation failed: {e}")
        return None
