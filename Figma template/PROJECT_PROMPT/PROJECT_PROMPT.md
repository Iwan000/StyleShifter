# StyleShifter - Text Style Transformation Chat Application

## Overview
Build a full-featured text style transformation web application with a chat interface similar to WhatsApp or WeChat. The app allows users to transform their text messages using AI models trained on different writing styles and famous character personalities.

## Core Features

### 1. Chat Interface
- **Full-screen layout** with three main sections:
  - Top header displaying "Friend X" with a star icon
  - Scrollable message area showing conversation history
  - Fixed bottom input area

- **Message Display**:
  - User messages appear on the right side in blue bubbles
  - Transformed messages show on the left with model identification badges
  - Each message includes timestamp
  - Messages are scrollable

### 2. Input Area (Bottom Fixed)
- **Model Selector Button**: Opens a popover displaying:
  - "None (Original Text)" as default option
  - Up to 3 pinned models (user-selected favorites)
  - "Manage Pinned" button to customize which models are pinned
  - "Open StyleShifter" button to access the full model management interface

- **Text Input**:
  - Auto-expanding textarea (min height: 52px, max height: 120px)
  - Enter key sends message
  - Shift+Enter creates new line

### 3. StyleShifter - Model Management Interface
Access via "Open StyleShifter" button in model selector

**Header**: 
- Title: "StyleShifter" (top left)
- Close button (X) on top right

**Two Main Tabs**:

#### Tab 1: New Model
- **Two action buttons** (side by side):
  - "Browse Characters" (left) - Outline style, blue border
  - "Train New Model" (right) - Blue filled button with Plus icon

- **Your Models List**: 
  - Shows all created models with count
  - Each model card displays:
    - Model name
    - Last used date
    - Delete button (trash icon)
  - Delete confirmation dialog when clicking trash icon

#### Tab 2: Transform Test
- **Purpose**: Test text transformations with any model
- **Features**:
  - Text input area or PDF upload
  - Model selector dropdown
  - Transform button
  - Output area showing transformed text
  - Copy to clipboard functionality

### 4. Train New Model Flow

**Step 1: Create New Model Page**
- Title: "Create New Model"
- Two input methods (tabs):
  - **Text Tab**: Direct text input with textarea
  - **PDF Tab**: Drag & drop or click to upload PDF files
- "Train" button (disabled until content is provided)
- Training progress indicator
- Cancel button to return to StyleShifter

**Step 2: Training Success Page**
- Success icon and message
- "Example Transformations" section showing 3 sample outputs
- Input field to name the model
- "Save Model" button (disabled until name is provided)
- "Train Another" button to create more models

### 5. Browse Characters Feature
- **Search functionality**: Search famous characters by name
- **Character cards** displaying:
  - Character name
  - Brief description of their speaking style
  - Source/origin (e.g., "Literature", "Film", "Historical")
  - "Generate Model" button

- **Pre-populated characters** (examples):
  - Sherlock Holmes - Analytical, deductive reasoning style
  - Shakespeare - Elizabethan poetic language
  - Yoda (Star Wars) - Inverted sentence structure
  - Jane Austen - Formal, witty 19th-century prose
  - Gandalf (LOTR) - Wise, archaic speech patterns
  - Tony Stark (MCU) - Witty, sarcastic, tech-savvy
  - Dumbledore - Wise, gentle, philosophical
  - And more...

**Character Model Generation**:
- After selecting a character, show success page similar to training success
- Display example transformations in that character's style
- Allow user to name the model (defaults to character name)
- Automatically save to model collection

### 6. Transformation Preview
- **Triggers**: When user sends a message with a model selected
- **Display**: Blue overlay panel above input area showing:
  - "Transformed with [Model Name]" header
  - Original text (dimmed)
  - Transformed text (prominent)
  - Two action buttons:
    - "Apply" - Sends the transformed message
    - "Cancel" - Returns to editing original text

### 7. Pinned Models Manager
- Accessed via "Manage Pinned" in model selector
- Shows all available models
- Users can select up to 3 models to pin
- Pinned models appear in the model selector for quick access
- Selected models highlighted with checkmarks
- Save/Cancel buttons

## Design Requirements

### Color Scheme
- **Primary Blue**: #2563eb (blue-600)
- **Light Blue**: #eff6ff (blue-50) for backgrounds
- **Blue Borders**: #bfdbfe (blue-200)
- **Dark Text**: Gray-900 for primary text
- **Light Text**: Gray-500/Gray-600 for secondary text

### Typography
- Use default typography from globals.css
- Don't override font-size, font-weight, or line-height with Tailwind classes unless specifically requested

### Layout
- Full-screen, mobile-responsive design
- Clean, modern WhatsApp/WeChat-inspired interface
- Smooth transitions and hover states
- Proper spacing and padding throughout

### Icons
- Use lucide-react for all icons
- Common icons: Plus, X, Star, Sparkles, Upload, Check, Trash2, Users, GraduationCap, Wand2

## Technical Details

### State Management
- User can save unlimited models
- Only 3 models can be pinned at a time
- Most recently used models shown in model selector
- Models persist with last used date
- Selected model state for current conversation

### Mock Data Transformations
Implement simple text transformations to demonstrate:
- Formal English: Replace casual words with formal equivalents
- Casual Slang: Replace formal words with slang
- Poetic Style: Add poetic flourishes
- Character styles: Mimic speaking patterns (e.g., Yoda's inverted syntax)

### Components Structure
- Modular component architecture
- Separate components for each major feature
- Reusable UI components (buttons, dialogs, tabs)
- Use shadcn/ui components where applicable

## User Flow Examples

### Flow 1: Send a Transformed Message
1. User types message in input area
2. User selects a model from model selector
3. User presses Enter
4. Preview appears showing transformation
5. User clicks "Apply"
6. Message appears in chat with model badge

### Flow 2: Create Custom Model
1. Click model selector → "Open StyleShifter"
2. On "New Model" tab, click "Train New Model"
3. Choose text or PDF input method
4. Provide training content
5. Click "Train" button
6. View example transformations
7. Name the model
8. Click "Save Model"
9. Model added to collection and auto-pinned if space available

### Flow 3: Generate Character Model
1. Open StyleShifter
2. Click "Browse Characters"
3. Search or browse character list
4. Click "Generate Model" on desired character
5. View example transformations in character's style
6. Optionally rename model
7. Save to model collection

### Flow 4: Manage Pinned Models
1. Click model selector
2. Click "Manage Pinned"
3. Select/deselect models (max 3)
4. Click "Save"
5. Pinned models now appear in quick selector

## Additional Notes
- Include loading states during training/transformation
- Add confirmation dialogs for destructive actions (delete model)
- Show helpful empty states when no models exist
- Provide clear visual feedback for all user actions
- Ensure all modals/dialogs can be closed with X button or Cancel
- Use blue theme consistently throughout the application
