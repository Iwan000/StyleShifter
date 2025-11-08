import os
from openai import OpenAI
from config import config

class StyleActor:
    """Service for transforming text using learned style reports"""

    def __init__(self):
        self.client = OpenAI(api_key=config.OPENAI_API_KEY)
        self.model_name = config.MODEL_NAME

    def transform_text(self, model_name: str, input_text: str) -> str:
        """
        Transform input text using a trained style model.

        Args:
            model_name: The name of the style model to use
            input_text: The text to transform

        Returns:
            str: The transformed text
        """
        # Load the style report
        style_report = self._load_style_report(model_name)

        # Create the transformation prompt
        prompt = self._create_actor_prompt(style_report, input_text)

        # Call OpenAI API using Responses API (for GPT-5)
        response = self.client.responses.create(
            model=self.model_name,
            instructions="You are a text style transformer. Your job is to rewrite text to match a specific style accurately.",
            input=prompt
        )

        # Extract and return the transformed text
        transformed_text = response.output_text.strip()
        return transformed_text

    def _load_style_report(self, model_name: str) -> str:
        """Load a style report from disk"""
        file_path = os.path.join(config.MODELS_DIR, f"{model_name}.md")

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Model '{model_name}' not found")

        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Remove metadata header if present
        if content.startswith("---"):
            parts = content.split("---", 2)
            if len(parts) >= 3:
                content = parts[2].strip()

        return content

    def _create_actor_prompt(self, style_report: str, input_text: str) -> str:
        """Create the prompt for text transformation"""
        return f"""You are a text style transformer. Your job is to rewrite text to match a specific style.

STYLE GUIDE:
{style_report}

INSTRUCTIONS:
- Transform the input text to match the style described above
- Maintain the core meaning and information
- Apply the vocabulary, tone, and mannerisms from the style guide
- Output ONLY the transformed text, nothing else

INPUT TEXT:
{input_text}

TRANSFORMED TEXT:"""

    def list_models(self) -> list[dict]:
        """
        List all available style models.

        Returns:
            list: List of model metadata dictionaries
        """
        models = []
        models_dir = config.MODELS_DIR

        if not os.path.exists(models_dir):
            return models

        for filename in os.listdir(models_dir):
            if filename.endswith('.md') and not filename.startswith('temp_'):
                model_name = filename[:-3]  # Remove .md extension
                file_path = os.path.join(models_dir, filename)

                # Get file metadata
                stat_info = os.stat(file_path)
                created_at = stat_info.st_ctime

                # Try to read metadata from file
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if content.startswith("---"):
                        # Parse metadata header
                        parts = content.split("---", 2)
                        if len(parts) >= 2:
                            metadata_lines = parts[1].strip().split('\n')
                            for line in metadata_lines:
                                if line.startswith('created_at:'):
                                    # Use metadata timestamp if available
                                    pass

                models.append({
                    "name": model_name,
                    "created_at": created_at,
                    "file_path": file_path
                })

        # Sort by creation time (newest first)
        models.sort(key=lambda x: x["created_at"], reverse=True)

        return models

    def delete_model(self, model_name: str) -> bool:
        """
        Delete a style model.

        Args:
            model_name: The name of the model to delete

        Returns:
            bool: Success status
        """
        file_path = os.path.join(config.MODELS_DIR, f"{model_name}.md")

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Model '{model_name}' not found")

        os.remove(file_path)
        return True
