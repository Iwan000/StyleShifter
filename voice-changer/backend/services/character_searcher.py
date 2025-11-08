import os
import json
from openai import OpenAI
from typing import List, Dict

class CharacterSearcher:
    def __init__(self):
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")

        self.client = OpenAI(api_key=api_key)
        self.search_model = os.getenv('SEARCH_MODEL_NAME', 'gpt-4o-mini')

    def search_characters(self, query: str) -> List[Dict[str, str]]:
        """
        Search for famous characters matching the query using GPT-4o-mini.
        Returns up to 5 characters ranked by popularity.

        Args:
            query: The character name or type to search for

        Returns:
            List of character dictionaries with name, description, source, and category
        """
        prompt = f"""Find up to 5 famous characters that match the search query: "{query}"

Rules:
- If the query is specific (e.g., "SpongeBob"), find exact name matches
- If the query is generic (e.g., "pirate", "wizard"), find popular characters of that type
- Rank results by popularity (most well-known first)
- Include characters from TV shows, movies, literature, video games, anime, and history

For each character, provide:
1. name: Full character name
2. description: Brief description (one sentence, focusing on personality/style)
3. source: The work/franchise they're from (e.g., "SpongeBob SquarePants", "Star Wars")
4. category: One of these: "tv", "movie", "literature", "historical", "game", "anime", "cartoon"

Return ONLY a valid JSON array with this exact structure:
[
  {{
    "name": "Character Name",
    "description": "Brief description of personality and speaking style",
    "source": "Source work/franchise",
    "category": "category"
  }}
]

Do not include any other text, just the JSON array."""

        try:
            response = self.client.chat.completions.create(
                model=self.search_model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that finds famous characters. Always respond with valid JSON only."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                max_tokens=1000
            )

            result_text = response.choices[0].message.content.strip()

            # Parse JSON response
            characters = json.loads(result_text)

            # Validate structure
            if not isinstance(characters, list):
                return []

            # Ensure all required fields are present
            validated_characters = []
            for char in characters[:5]:  # Limit to 5
                if all(key in char for key in ['name', 'description', 'source', 'category']):
                    validated_characters.append({
                        'name': char['name'],
                        'description': char['description'],
                        'source': char['source'],
                        'category': char['category']
                    })

            return validated_characters

        except json.JSONDecodeError as e:
            print(f"Failed to parse JSON from character search: {e}")
            print(f"Response was: {result_text}")
            return []
        except Exception as e:
            print(f"Error in character search: {e}")
            return []
