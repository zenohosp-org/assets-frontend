import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/common.css';
import '../styles/pages/oauth2-callback.css';

/**
 * OAuth2 Callback Handler
 * 
 * Flow:
 * 1. User logs in at Directory → Directory sets SSO cookie on zenohosp.com
 * 2. Directory redirects to /sso/callback (Backend OAuth2SsoSuccessHandler)
 * 3. This component validates the session with the backend
 * 4. Backend reads SSO cookie automatically (HttpOnly)
 * 5. Redirects to dashboard
 * 
 * Cookie is already set by Directory backend — no manual token handling needed
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
        const errorParam = searchParams.get('error');

        // Check for error from Directory
        if (errorParam) {
          setError(`Login failed: ${errorParam}`);
          setTimeout(() => navigate(`/login?error=${encodeURIComponent(errorParam)}`), 3000);
          return;
        }

        console.log('✅ OAuth2 callback received, validating session with backend');

        // SSO cookie should now be set by Directory backend
        // Validate that we have an active session using the HttpOnly cookie
        const hasValidSession = await validateSession();

        if (hasValidSession) {
          console.log('✅ Valid session detected, redirecting to dashboard');
          navigate('/dashboard', { replace: true });
        } else {
          setError('Session validation failed. Please login again.');
          setTimeout(() => navigate('/login?error=session_validation_failed'), 3000);
        }
      } catch (err) {
        console.error('OAuth2 callback error:', err);
        setError('An error occurred during login');
        setTimeout(() => navigate('/login?error=callback_exception'), 3000);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate, validateSession]);

  if (error) {
    return (
      <div className="oauth2-callback-page">
        <div className="oauth2-callback-card">
          <h2 className="oauth2-callback-error-title">Login Error</h2>
          <p className="oauth2-callback-text">{error}</p>
          <p className="oauth2-callback-subtext">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="oauth2-callback-page">
      <div className="oauth2-callback-card">
        <h2 className="oauth2-callback-title">Completing Login...</h2>
        {loading && (
          <div className="oauth2-callback-spinner">
            ⏳
          </div>
        )}
        <p className="oauth2-callback-subtext">Please wait while we verify your session.</p>
      </div>
    </div>
  );
}
