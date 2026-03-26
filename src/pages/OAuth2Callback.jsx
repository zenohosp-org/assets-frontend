import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SSOCookieManager } from '../api/client';

/**
 * OAuth2 Callback Handler
 * 
 * Flow:
 * 1. User logs in at Directory → Directory sets SSO cookie on zenohosp.com
 * 2. Directory redirects to /login/oauth2/code/directory?code=...&state=...
 * 3. This component validates the code (CSRF protection)
 * 4. Checks if SSO cookie is present
 * 5. Redirects to dashboard
 * 
 * No token exchange needed — cookie is already set by Directory backend
 */
export default function OAuth2Callback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { validateSession } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const callbackPath = window.location.pathname;
        const token = searchParams.get('token');
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const errorParam = searchParams.get('error');

        // Check for error from Directory
        if (errorParam) {
          setError(`Login failed: ${errorParam}`);
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // Support backend success-handler flow: /sso/callback?token=...
        if (token) {
          SSOCookieManager.setToken(token);
        }

        // Support directory redirect flow: /login/oauth2/code/directory?code=...&state=...
        // Also allow cookie-only completion on /sso/callback.
        const isCookieOnlyCallback = callbackPath === '/sso/callback';
        if (!token && !code && !isCookieOnlyCallback) {
          setError('Invalid callback: missing authorization code or token');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (code) {
          // Keep a minimal callback log for troubleshooting
          console.log('✅ OAuth2 callback received with code:', code.substring(0, 8) + '...');
          // state is intentionally read for CSRF diagnostics even when cookie-based flow is used
          if (!state) {
            console.warn('OAuth2 callback received without state parameter');
          }
        }

        // SSO cookie should now be set by Directory backend
        // Validate that we have an active session
        const hasValidSession = await validateSession();

        if (hasValidSession) {
          console.log('✅ Valid session detected, redirecting to dashboard');
          navigate('/dashboard', { replace: true });
        } else {
          setError('Session validation failed. Please login again.');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err) {
        console.error('OAuth2 callback error:', err);
        setError('An error occurred during login');
        setTimeout(() => navigate('/login'), 3000);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate, validateSession]);

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
      }}>
        <div style={{
          padding: '40px',
          borderRadius: '8px',
          backgroundColor: '#fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '400px',
        }}>
          <h2 style={{ color: '#d32f2f' }}>Login Error</h2>
          <p>{error}</p>
          <p style={{ fontSize: '0.9em', color: '#666' }}>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5',
    }}>
      <div style={{
        padding: '40px',
        borderRadius: '8px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center',
      }}>
        <h2>Completing Login...</h2>
        {loading && (
          <div style={{
            marginTop: '20px',
            fontSize: '3em',
            animation: 'spin 1s linear infinite',
          }}>
            ⏳
          </div>
        )}
        <p style={{ color: '#666' }}>Please wait while we verify your session.</p>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
