# Text Voice Changer - Frontend

Beautiful, modern React frontend for the Text Voice Changer application.

## Features

- 🎨 Beautiful UI with smooth animations
- 🎯 Two main pages: Train and Transform
- 🔄 Real-time text transformation
- 📱 Fully responsive design
- ⚡ Fast and smooth transitions
- 🎭 Professional color scheme inspired by Google and Claude

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling and animations
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

## Setup

### 1. Install Dependencies

```bash
cd voice-changer/frontend
npm install
```

### 2. Configure Environment

The `.env` file is already configured with:

```
VITE_API_URL=http://localhost:8000
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Pages

### Train Page (`/train`)

Features:
- Large textarea for corpus input
- Character and word counter
- Real-time validation
- Modal dialog for naming models
- Beautiful tips section

### Transform Page (`/transform`)

Features:
- Model selector dropdown
- Two-column layout
- Copy to clipboard
- Model deletion with confirmation
- Loading states and error handling
