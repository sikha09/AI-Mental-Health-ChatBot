# Project Structure Documentation

## Overview
This document describes the organization and structure of the AI-Mental Health ChatBot project.

## Directory Structure

```
Chatbot/
├── public/                 # Public assets
│   └── vite.svg
├── src/                    # Source code
│   ├── assets/            # Static assets (images, icons)
│   ├── components/        # Reusable React components
│   │   ├── ChatArea/      # Main chat interface
│   │   ├── JournalArea/   # Private journaling UI
│   │   ├── MoodTracker/   # Data visualization (Mood Analytics)
│   │   ├── Sidebar/       # Main navigation
│   │   ├── SettingsModal/
│   │   ├── admin/         # Admin dashboard components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── SignInPopup.jsx
│   │   └── index.js       # Barrel export
│   ├── config/            # Configuration files
│   │   ├── routes.js      # Route definitions
│   │   └── constants.js   # App constants & Emotion Colors
│   ├── context/           # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── AdminAuthContext.jsx
│   ├── hooks/             # Custom React hooks
│   │   └── useAuth.js
│   ├── pages/             # Page components
│   │   ├── ClaudePage.jsx # Main persistent Chat/Mood/Journal view
│   │   ├── SignUp.jsx
│   │   ├── admin/         # Admin Login & Dashboard pages
│   │   └── index.js       # Barrel export
│   ├── services/          # API services
│   │   ├── authService.js
│   │   ├── chatService.js
│   │   └── journalService.js
│   ├── styles/            # CSS stylesheets
│   │   ├── index.css      # Global styles
│   │   ├── App.css
│   │   ├── Navbar.css
│   │   ├── Footer.css
│   │   ├── SignInPopup.css
│   │   └── Signup.css
│   ├── utils/             # Utility functions
│   │   ├── storage.js
│   │   └── validation.js
│   ├── App.jsx            # Landing page component
│   └── index.jsx          # Entry point (React Router setup)
├── mental_health_chatbot/  # Python AI Inference Server
│   ├── app.py             # Flask API entry
│   ├── chat.py            # AI model loading & inference logic
│   └── models/            # Local model weights & emotion classifiers
├── src/Backend/           # Node.js API Backend
│   ├── server.js          # Express server entry
│   ├── auth.js            # Auth controllers & JWT logic
│   ├── chat.js            # Chat persistence & Mood analytics controller
│   ├── journal.js         # Journal CRUD controller
│   ├── db.js              # MySQL connection pool
│   └── emailService.js    # NodeMailer logic for verification
├── index.html             # HTML template
├── package.json           # Dependencies
├── vite.config.js         # Vite configuration
└── README.md              # Project documentation
```

## File Organization Principles

### Components (`src/components/`)
- Reusable UI components
- Each major feature (Chat, Journal, Mood) has its own directory with CSS
- Components are self-contained with their own styles

### Pages (`src/pages/`)
- Full page components and Route-level components
- `ClaudePage.jsx` acts as the main authenticated dashboard

### Services (`src/services/`)
- API communication logic with the Node.js backend
- Centralized fetch calls with Authorization headers

### Backend (`src/Backend/`)
- Node.js/Express REST API
- Handles SQL Persistence (Chat History, Journals, Users)
- Acts as a proxy to the Python AI Server

### AI Server (`mental_health_chatbot/`)
- Flask server running the DialoGPT-medium model
- Handles emotion detection (SVM/NN) and supportive response generation

## Import Conventions
- Use barrel exports (`index.js`) for cleaner imports where applicable
- Group imports: React/External → Components/Internal → Styles

## Best Practices
1. **Separation of Concerns**: UI logic in React, Database logic in Node, AI logic in Python.
2. **Security**: JWT tokens are used for all protected routes.
3. **Analytics**: User moods are tracked over time and persisted in a dedicated SQL table.
