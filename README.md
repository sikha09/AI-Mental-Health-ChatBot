# AI-Mental Health ChatBot

A modern, responsive web application for AI-powered mental health chat support.

## 📁 Project Structure

```
src/
├── assets/          # Static assets (images, icons, etc.)
├── components/      # Reusable React components
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   └── SignInPopup.jsx
├── config/          # Configuration files
│   ├── routes.js    # Route definitions
│   └── constants.js # Application constants
├── context/         # React Context providers
│   └── AuthContext.jsx
├── hooks/           # Custom React hooks
│   └── useAuth.js
├── pages/           # Page components
│   ├── Chat.jsx
│   └── SignIn.jsx
├── services/        # API and business logic
│   ├── authService.js
│   └── chatService.js
├── styles/          # CSS stylesheets
│   ├── index.css    # Global styles
│   ├── App.css
│   ├── Navbar.css
│   ├── Footer.css
│   ├── SignInPopup.css
│   ├── Chat.css
│   └── Signup.css
├── utils/           # Utility functions
│   ├── storage.js
│   └── validation.js
├── App.jsx          # Main application component
└── index.js         # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🏗️ Architecture

### Components
- **Navbar**: Main navigation bar component
- **Footer**: Application footer with links
- **SignInPopup**: Modal popup for user authentication

### Pages
- **App**: Home page with hero section, FAQ, and features
- **SignIn**: User registration/signup page
- **Chat**: Chat interface for AI conversations

### Services
- **authService**: Handles authentication logic
- **chatService**: Manages chat API calls

### Context
- **AuthContext**: Provides authentication state across the app

### Hooks
- **useAuth**: Custom hook for authentication state management

### Utils
- **storage**: Local storage helper functions
- **validation**: Form validation utilities

## 🔧 Configuration

### Routes
All routes are defined in `src/config/routes.js`

### Constants
Application constants are in `src/config/constants.js`

## 📝 Features

- ✅ User authentication (Sign In/Sign Up)
- ✅ AI Chat interface
- ✅ Responsive design
- ✅ Modern UI with blur effects
- ✅ FAQ section
- ✅ Social login support (Google, Facebook)

## 🛠️ Technologies Used

- React 19
- React Router DOM
- Vite
- CSS3

## 📄 License

This project is private and proprietary.

## 👥 Contributors

- Development Team
