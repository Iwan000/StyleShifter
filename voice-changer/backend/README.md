# Text Voice Changer - Backend

FastAPI backend for the Text Voice Changer application.

## Setup

### 1. Install Dependencies

```bash
cd voice-changer/backend
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```
OPENAI_API_KEY=your_actual_api_key_here
MODEL_NAME=gpt-4o-mini
MODELS_DIR=./models
```

### 3. Run the Server

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### POST `/api/train`
Analyze a text corpus and generate a style report.

**Request:**
```json
{
  "corpus": "Your text corpus here..."
}
```

**Response:**
```json
{
  "success": true,
  "report_id": "temp_1234567890",
  "message": "Style analysis complete"
}
```

### POST `/api/save-model`
Save and name a trained model.

**Request:**
```json
{
  "report_id": "temp_1234567890",
  "model_name": "SpongeBob"
}
```

**Response:**
```json
{
  "success": true,
  "model_name": "SpongeBob"
}
```

### GET `/api/models`
List all available trained models.

**Response:**
```json
[
  {
    "name": "SpongeBob",
    "created_at": "2025-01-15T10:30:00Z",
    "file_path": "./models/SpongeBob.md"
  }
]
```

### POST `/api/transform`
Transform text using a trained model.

**Request:**
```json
{
  "model_name": "SpongeBob",
  "text": "Hello, how are you?"
}
```

**Response:**
```json
{
  "transformed_text": "Ahoy there! I'm ready, I'm ready! How are ya doing, buddy?"
}
```

### POST `/api/training-examples`
Generate 3 example transformations using a temporary (unsaved) style report.

Use this after `/api/train` or `/api/train-pdf` and before saving the model.

**Request:**
```json
{
  "report_id": "temp_1234567890",
  "prompts": [
    "Say hello to a friend and ask how they are.",
    "Politely ask for directions to the nearest train station.",
    "Briefly describe today's weather in one sentence."
  ]
}
```

`prompts` is optional. If omitted, the above defaults are used.

**Response:**
```json
{
  "examples": [
    "Greetings, dear friend! How do you fare today?",
    "Pardon me, could you kindly direct me to the nearest train station?",
    "Today is pleasantly cool with a gentle breeze."
  ]
}
```

### POST `/api/character-preview`
Analyze a famous character to create a temporary style report and return 3 example transformations for review before saving.

**Request:**
```json
{
  "name": "SpongeBob",
  "description": "Optimistic, energetic fry cook with a childlike sense of wonder",
  "source": "SpongeBob SquarePants",
  "prompts": [
    "Say hello to a friend and ask how they are.",
    "Politely ask for directions to the nearest train station.",
    "Briefly describe today's weather in one sentence."
  ]
}
```

`prompts` is optional; defaults are used if omitted.

**Response:**
```json
{
  "report_id": "temp_1234567890",
  "examples": [
    "I'm ready! I'm ready! Hey buddy, how're ya doing today?",
    "Excuse me! Could you point me to the choo-choo station, pretty please?",
    "Ooh! It's a bright, bubbly day with sunshine and smiles!"
  ]
}
```

### DELETE `/api/models/{model_name}`
Delete a trained model.

**Response:**
```json
{
  "success": true,
  "message": "Model 'SpongeBob' deleted successfully"
}
```

## Testing with curl

### Train a model:
```bash
curl -X POST http://localhost:8000/api/train \
  -H "Content-Type: application/json" \
  -d '{"corpus": "I'\''m ready! I'\''m ready! I'\''m ready! Welcome to the Krusty Krab! Aye aye captain! F is for friends who do stuff together..."}'
```

### Save the model:
```bash
curl -X POST http://localhost:8000/api/save-model \
  -H "Content-Type: application/json" \
  -d '{"report_id": "temp_1234567890", "model_name": "SpongeBob"}'
```

### List models:
```bash
curl http://localhost:8000/api/models
```

### Transform text:
```bash
curl -X POST http://localhost:8000/api/transform \
  -H "Content-Type: application/json" \
  -d '{"model_name": "SpongeBob", "text": "Hello, how are you today?"}'
```

### Delete a model:
```bash
curl -X DELETE http://localhost:8000/api/models/SpongeBob
```

### Training examples (after `/api/train`):
```bash
curl -X POST http://localhost:8000/api/training-examples \
  -H "Content-Type: application/json" \
  -d '{"report_id": "temp_1234567890"}'
```

### Character preview:
```bash
curl -X POST http://localhost:8000/api/character-preview \
  -H "Content-Type: application/json" \
  -d '{"name": "SpongeBob", "description": "Optimistic, energetic fry cook", "source": "SpongeBob SquarePants"}'
```

## Project Structure

```
backend/
├── main.py                 # FastAPI application
├── config.py              # Configuration management
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables (create this)
├── .env.example          # Environment template
├── models/               # Saved style reports (.md files)
└── services/
    ├── style_learner.py  # Style analysis service
    └── style_actor.py    # Text transformation service
```

## Notes

- The `models/` directory stores all trained models as markdown files
- Each model file contains metadata and the style report
- Temporary reports (starting with `temp_`) are created during training
- CORS is enabled for all origins (configure for production use)
