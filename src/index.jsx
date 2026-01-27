import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import Signup from './pages/SignUp';
import ClaudePage from './pages/ClaudePage';
import { OAuthCallback } from './pages';
import ROUTES from './config/routes';
import './styles/index.css';

/**
 * Application Entry Point
 * 
 * Sets up routing, context providers, and renders the root component.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path={ROUTES.HOME} element={<App />} />
          <Route path={ROUTES.SIGNUP} element={<Signup />} />
          <Route path={ROUTES.CHAT} element={<ClaudePage />} />
          <Route path={ROUTES.OAUTH_CALLBACK} element={<OAuthCallback />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);