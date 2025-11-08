# Text Voice Changer - Implementation Plan

## Project Overview
A web-based tool that learns writing styles from text corpus and transforms user input to match that style. The system uses a two-stage approach: a Learner model that analyzes style, and an Actor model that performs transformations.

---

## Architecture

### System Components
1. **Style Learner**: Analyzes corpus text and generates style reports
2. **Style Actor**: Transforms input text using learned style reports
3. **Model Storage**: Local markdown files containing style reports
4. **Web Interface**: Two-page application for training and transformation

### Technology Stack
- **Backend**: Python + FastAPI
- **LLM**: OpenAI GPT-4o-mini
- **Frontend**: React + Vite + Tailwind CSS
- **Storage**: Local file system (.md files)

---

## Project Structure

```
voice-changer/
├── backend/
│   ├── main.py                    # FastAPI application entry point
│   ├── requirements.txt           # Python dependencies
│   ├── config.py                  # Configuration (API keys)
│   ├── models/                    # Directory for saved style reports (.md)
│   └── services/
│       ├── style_learner.py       # Style analysis logic
│       └── style_actor.py         # Text transformation logic
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx              # React entry point
│   │   ├── App.jsx               # Main app with routing
│   │   ├── pages/
│   │   │   ├── TrainPage.jsx     # Corpus training interface
│   │   │   └── TransformPage.jsx # Text transformation interface
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation component
│   │   │   └── ModelNameDialog.jsx # Modal for naming models
│   │   └── api/
│   │       └── client.js         # API calls to backend
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── README.md
```

---

## Backend Implementation

### API Endpoints

#### 1. POST `/api/train`
**Purpose**: Analyze corpus and generate style report

**Request Body**:
```json
{
  "corpus": "string (text corpus to analyze)"
}
```

**Response**:
```json
{
  "success": true,
  "report_id": "temp_1234567890",
  "message": "Style analysis complete"
}
```

**Process**:
- Receive corpus text
- Call OpenAI GPT-4o-mini with style analysis prompt
- Generate style report
- Save temporarily with timestamp-based ID
- Return success signal

---

#### 2. POST `/api/save-model`
**Purpose**: Save and name the trained model

**Request Body**:
```json
{
  "report_id": "temp_1234567890",
  "model_name": "SpongeBob"
}
```

**Response**:
```json
{
  "success": true,
  "model_name": "SpongeBob"
}
```

**Process**:
- Rename temporary report file to `{model_name}.md`
- Add metadata (creation date, etc.)
- Return confirmation

---

#### 3. GET `/api/models`
**Purpose**: List all available trained models

**Response**:
```json
[
  {
    "name": "SpongeBob",
    "created_at": "2025-01-15T10:30:00Z",
    "file_path": "models/SpongeBob.md"
  },
  {
    "name": "Shakespeare",
    "created_at": "2025-01-14T15:20:00Z",
    "file_path": "models/Shakespeare.md"
  }
]
```

---

#### 4. POST `/api/transform`
**Purpose**: Transform text using a trained model

**Request Body**:
```json
{
  "model_name": "SpongeBob",
  "text": "Hello, how are you doing today?"
}
```

**Response**:
```json
{
  "transformed_text": "Ahoy there! I'm ready, I'm ready, I'm ready! How are you doing today, buddy?"
}
```

**Process**:
- Load style report from `models/{model_name}.md`
- Use report as context in Actor prompt
- Call OpenAI GPT-4o-mini to transform text
- Return transformed result

---

#### 5. DELETE `/api/models/{model_name}`
**Purpose**: Delete a trained model

**Response**:
```json
{
  "success": true,
  "message": "Model 'SpongeBob' deleted successfully"
}
```

**Process**:
- Delete corresponding .md file
- Return confirmation

---

### LLM Prompt Strategy

#### Style Learner Prompt
```
You are an expert in analyzing writing styles and character voices. Analyze the following text corpus and create a comprehensive style guide.

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
{user_corpus}

Generate a detailed style report that can be used to accurately mimic this writing style.
```

#### Style Actor Prompt
```
You are a text style transformer. Your job is to rewrite text to match a specific style.

STYLE GUIDE:
{style_report}

INSTRUCTIONS:
- Transform the input text to match the style described above
- Maintain the core meaning and information
- Apply the vocabulary, tone, and mannerisms from the style guide
- Output ONLY the transformed text, nothing else

INPUT TEXT:
{user_input}

TRANSFORMED TEXT:
```

---

## Frontend Implementation

### Page 1: Train Page

**Features**:
- Large textarea (minimum 300px height) for corpus input
- Character/word counter below textarea
- "Analyze Style" button (primary action)
- Loading spinner during analysis
- Success → Modal dialog appears for naming model
- Validation: Require minimum corpus length (e.g., 100 characters)

**UI Elements**:
```jsx
- Header: "Train Your Style Model"
- Subtitle: "Paste text corpus from your desired style source"
- Textarea: Placeholder "Paste SpongeBob dialogue, Shakespeare quotes, or any text..."
- Counter: "Characters: 0 | Words: 0"
- Button: "Analyze Style" (disabled if corpus too short)
- Loading state: "Analyzing style patterns..." with spinner
- Modal: "Name Your Model" with input field and Save button
```

**User Flow**:
1. User pastes corpus
2. Clicks "Analyze Style"
3. Loading state shows
4. Backend processes → Success
5. Modal appears: "Name Your Model"
6. User enters name → Clicks Save
7. Auto-redirect to Transform Page

---

### Page 2: Transform Page

**Features**:
- Dropdown to select trained model
- Two-column layout for input/output
- "Transform" button
- Loading state during transformation
- Copy to clipboard button
- Delete model button (with confirmation)

**UI Elements**:
```jsx
- Header: "Transform Your Text"
- Model selector dropdown: "Select a style model..."
- Left column:
  - Label: "Your Text"
  - Textarea for input
  - Character counter
- Right column:
  - Label: "Transformed Text"
  - Read-only display area
  - "Copy to Clipboard" button
- Action buttons:
  - "Transform" (primary)
  - "Delete Model" (danger, with confirmation dialog)
```

**User Flow**:
1. User selects model from dropdown
2. Pastes text to transform
3. Clicks "Transform"
4. Loading state shows
5. Transformed text appears on right
6. User can copy result
7. Can delete model (with "Are you sure?" confirmation)

---

### Navigation Component

**Navbar Features**:
- Logo/Title: "Text Voice Changer"
- Navigation links: "Train" | "Transform"
- Model counter badge: "3 models trained"
- Active page highlighting

---

## Implementation Order

### Phase 1: Backend Foundation (Day 1)
1. Set up FastAPI project structure
2. Configure OpenAI API integration
3. Implement `/api/train` endpoint
4. Implement `/api/save-model` endpoint
5. Create `models/` directory and file storage logic
6. Test with Postman/curl

### Phase 2: Backend Completion (Day 1-2)
1. Implement `/api/models` endpoint
2. Implement `/api/transform` endpoint
3. Implement `/api/models/{name}` DELETE endpoint
4. Add error handling and validation
5. Test all endpoints

### Phase 3: Frontend Setup (Day 2)
1. Initialize React + Vite project
2. Configure Tailwind CSS
3. Set up routing (React Router)
4. Create basic component structure
5. Build API client module

### Phase 4: Train Page (Day 2)
1. Build Train Page UI
2. Connect to `/api/train` endpoint
3. Implement modal dialog for model naming
4. Connect to `/api/save-model` endpoint
5. Add loading states and validation
6. Implement redirect to Transform page

### Phase 5: Transform Page (Day 2-3)
1. Build Transform Page UI
2. Connect to `/api/models` to populate dropdown
3. Connect to `/api/transform` endpoint
4. Implement copy-to-clipboard functionality
5. Add delete model feature with confirmation
6. Add loading states

### Phase 6: Polish & Testing (Day 3)
1. Beautiful styling with Tailwind
2. Smooth transitions and animations
3. Error message displays
4. Empty states (no models yet)
5. Responsive design
6. End-to-end testing
7. Edge case handling

---

## Key Features

### Style Analysis Quality
- No corpus size limit (the more data, the better)
- GPT-4o-mini for cost-effective analysis
- Comprehensive style report generation

### Model Management
- Multiple models supported
- Local storage as .md files
- Easy to view/edit manually if needed
- Model deletion with confirmation

### User Experience
- Clean, vivid UI with Tailwind CSS
- Instant feedback with loading states
- Smooth workflow from training to transformation
- Model selection from dropdown

---

## Configuration Requirements

### Backend `.env` file
```
OPENAI_API_KEY=your_api_key_here
MODEL_NAME=gpt-4o-mini
MODELS_DIR=./models
```

### Frontend Environment
```
VITE_API_URL=http://localhost:8000
```

---

## Success Criteria

1. User can paste any corpus and generate a style report
2. User can name and save multiple models
3. User can select any saved model for transformation
4. User can transform text and see results instantly
5. User can delete unwanted models
6. System handles errors gracefully
7. UI is beautiful and intuitive

---

## Future Enhancements (Not in Initial Release)

- Show style report preview after training
- Adjust transformation creativity (temperature control)
- Support other LLM providers (Claude, Gemini)
- Cloud storage for models
- Share models with others
- Export/import models
- Batch transformation
- API key management UI
- Model versioning
