import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleOAuthCallback } from '../services/authService';

/**
 * OAuth Callback Page
 * Handles the redirect from OAuth providers (Google, Facebook)
 */
const OAuthCallback = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState('Processing authentication...');

    useEffect(() => {
        const processCallback = async () => {
            try {
                // Get token from URL parameters
                const urlParams = new URLSearchParams(window.location.search);
                const token = urlParams.get('token');
                const provider = urlParams.get('provider');
                const error = urlParams.get('error');

                if (error) {
                    setStatus(`Authentication failed: ${error}`);
                    setTimeout(() => navigate('/signin'), 2000);
                    return;
                }

                if (!token) {
                    setStatus('No authentication token received');
                    setTimeout(() => navigate('/signin'), 2000);
                    return;
                }

                // Handle the OAuth callback
                await handleOAuthCallback(token);

                setStatus(`Successfully signed in with ${provider}!`);

                // Redirect to chat page after successful authentication
                setTimeout(() => navigate('/chat'), 1000);
            } catch (error) {
                console.error('OAuth callback error:', error);
                setStatus('Authentication failed. Redirecting...');
                setTimeout(() => navigate('/signin'), 2000);
            }
        };

        processCallback();
    }, [navigate]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div style={{
                fontSize: '24px',
                marginBottom: '20px'
            }}>
                {status}
            </div>
            <div style={{
                width: '50px',
                height: '50px',
                border: '5px solid #f3f3f3',
                borderTop: '5px solid #3498db',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }}></div>
            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default OAuthCallback;
