import time
import os
from openai import OpenAI
from config import config

class StyleLearner:
    """Service for analyzing text corpus and generating style reports"""

    def __init__(self):
        self.client = OpenAI(api_key=config.OPENAI_API_KEY)
        self.model_name = config.MODEL_NAME

    def analyze_corpus(self, corpus: str) -> tuple[str, str]:
        """
        Analyze a text corpus and generate a style report.

        Args:
            corpus: The text corpus to analyze

        Returns:
            tuple: (report_id, style_report)
        """
        # Create the style analysis prompt
        prompt = self._create_learner_prompt(corpus)

        # Call OpenAI API using Responses API (for GPT-5)
        response = self.client.responses.create(
            model=self.model_name,
            instructions="You are an expert in analyzing writing styles and character voices.",
            input=prompt
        )

        # Extract the style report
        style_report = response.output_text

        # Generate a temporary report ID
        report_id = f"temp_{int(time.time())}"

        # Save temporary report
        self._save_temp_report(report_id, style_report)

        return report_id, style_report

    def _create_learner_prompt(self, corpus: str) -> str:
        """Create the prompt for style analysis"""
        return f"""You are an expert in analyzing writing styles and character voices. Analyze the following text corpus and create a comprehensive style guide.

Document the following aspects:
1. Vocabulary patterns and unique phrases
2. Sentence structure and rhythm
3. Tone and emotional patterns
4. Speaking mannerisms and quirks
5. Common topics and themes
6. Catchphrases or recurring elements
7. Punctuation and formatting patterns
8. Energy level and enthusiasm

Be specific and provide examples from the corpus.

CORPUS:
{corpus}

Generate a detailed style report that can be used to accurately mimic this writing style."""

    def _save_temp_report(self, report_id: str, style_report: str):
        """Save a temporary style report"""
        # Ensure models directory exists
        os.makedirs(config.MODELS_DIR, exist_ok=True)

        # Save the report
        file_path = os.path.join(config.MODELS_DIR, f"{report_id}.md")
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(style_report)

    def save_model(self, report_id: str, model_name: str) -> bool:
        """
        Rename temporary report to final model name.

        Args:
            report_id: The temporary report ID
            model_name: The desired model name

        Returns:
            bool: Success status
        """
        temp_path = os.path.join(config.MODELS_DIR, f"{report_id}.md")
        final_path = os.path.join(config.MODELS_DIR, f"{model_name}.md")

        if not os.path.exists(temp_path):
            raise FileNotFoundError(f"Temporary report {report_id} not found")

        # Read the report
        with open(temp_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Add metadata header
        timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        final_content = f"""---
model_name: {model_name}
created_at: {timestamp}
---

{content}
"""

        # Save with new name
        with open(final_path, 'w', encoding='utf-8') as f:
            f.write(final_content)

        # Delete temporary file
        os.remove(temp_path)

        return True
