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
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── SignInPopup.jsx
│   │   └── index.js       # Barrel export
│   ├── config/            # Configuration files
│   │   ├── routes.js      # Route definitions
│   │   └── constants.js   # App constants
│   ├── context/           # React Context providers
│   │   └── AuthContext.jsx
│   ├── hooks/             # Custom React hooks
│   │   └── useAuth.js
│   ├── pages/             # Page components
│   │   ├── Chat.jsx
│   │   ├── SignIn.jsx
│   │   └── index.js       # Barrel export
│   ├── services/          # API services
│   │   ├── authService.js
│   │   └── chatService.js
│   ├── styles/            # CSS stylesheets
│   │   ├── index.css      # Global styles
│   │   ├── App.css
│   │   ├── Navbar.css
│   │   ├── Footer.css
│   │   ├── SignInPopup.css
│   │   ├── Chat.css
│   │   └── Signup.css
│   ├── utils/             # Utility functions
│   │   ├── storage.js
│   │   └── validation.js
│   ├── App.jsx            # Main app component
│   └── index.js           # Entry point
├── index.html             # HTML template
├── package.json           # Dependencies
├── vite.config.js         # Vite configuration
└── README.md              # Project documentation
```

## File Organization Principles

### Components (`src/components/`)
- Reusable UI components
- Each component has its own file
- Components are self-contained with their own styles

### Pages (`src/pages/`)
- Full page components
- Route-level components
- May use multiple components

### Services (`src/services/`)
- API communication logic
- Business logic
- Data fetching and manipulation

### Styles (`src/styles/`)
- Component-specific CSS files
- Global styles in `index.css`
- Organized by component/page

### Utils (`src/utils/`)
- Pure utility functions
- No React dependencies
- Reusable across the application

### Config (`src/config/`)
- Application configuration
- Route definitions
- Constants and settings

### Context (`src/context/`)
- React Context providers
- Global state management
- Shared application state

### Hooks (`src/hooks/`)
- Custom React hooks
- Reusable stateful logic
- Component logic extraction

## Import Conventions

- Use relative imports for local files
- Use barrel exports (`index.js`) for cleaner imports
- Group imports: external → internal → styles

## Naming Conventions

- Components: PascalCase (e.g., `Navbar.jsx`)
- Utilities: camelCase (e.g., `storage.js`)
- Styles: PascalCase matching component (e.g., `Navbar.css`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS`)

## Best Practices

1. **Component Structure**: Each component should be in its own file
2. **Style Organization**: One CSS file per component
3. **Service Layer**: All API calls go through services
4. **Utility Functions**: Keep utilities pure and testable
5. **Configuration**: Centralize all config in `config/` folder

