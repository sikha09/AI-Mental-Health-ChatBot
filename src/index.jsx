import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import Signup from './pages/SignUp';
import Chat from './pages/Chat';
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
          <Route path={ROUTES.CHAT} element={<Chat />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);

