import { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Shield, Globe, Box, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../api/client';
import '../styles/common.css';
import '../styles/pages/login.css';

const AUTO_SSO_LAST_ATTEMPT_KEY = 'asset_auto_sso_last_attempt';
const AUTO_SSO_COOLDOWN_MS = 15000;

export default function Login() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    const ssoAttemptedRef = useRef(false);

    useEffect(() => {
        if (!loading && user) {
            sessionStorage.removeItem(AUTO_SSO_LAST_ATTEMPT_KEY);
            navigate('/dashboard', { replace: true });
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        if (loading || user || ssoAttemptedRef.current) {
            return;
        }

        if (searchParams.get('logged_out') === '1') {
            return;
        }

        // Avoid immediate retry loops when login error is already present.
        if (searchParams.get('error')) {
            return;
        }

        const now = Date.now();
        const lastAttempt = Number(sessionStorage.getItem(AUTO_SSO_LAST_ATTEMPT_KEY) || 0);
        if (lastAttempt > 0 && now - lastAttempt < AUTO_SSO_COOLDOWN_MS) {
            return;
        }

        ssoAttemptedRef.current = true;
        sessionStorage.setItem(AUTO_SSO_LAST_ATTEMPT_KEY, String(now));
        window.location.href = `${API_BASE_URL}/oauth2/authorization/directory`;
    }, [loading, user, searchParams]);

    const handleLoginClick = () => {
        // Redirect to Asset Backend OAuth2 endpoint using environment variable
        sessionStorage.setItem(AUTO_SSO_LAST_ATTEMPT_KEY, String(Date.now()));
        window.location.href = `${API_BASE_URL}/oauth2/authorization/directory`;
    };

    const error = searchParams.get('error') ? (searchParams.get('error_description') || 'SSO login failed.') : null;

    if (searchParams.get('code')) {
        return (
            <div className="login-loading-page">
                <div className="login-loading-wrapper">
                    <div className="login-loading-spinner"></div>
                    <p className="login-loading-text">Completing SSO Login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            {/* Background Decor */}
            <div className="login-bg-decor-top"></div>
            <div className="login-bg-decor-bottom"></div>

            {/* Left Col - Hero Information */}
            <div className="login-hero">
                <div className="login-badge">
                    <Shield className="login-badge-icon" />
                    <span className="login-badge-text">ZenoHosp Enterprise OS</span>
                </div>

                <h1 className="login-title">
                    Institutional Level <br />Asset Management
                </h1>

                <p className="login-subtitle">
                    Gain full visibility over hospital equipment, transfer flows, and maintenance statuses powered by ZenoHosp's integrated security directory.
                </p>

                <div className="login-features">
                    <div className="login-feature-item">
                        <CheckCircle className="login-feature-icon" />
                        <span>Centralized hardware and equipment logs</span>
                    </div>
                    <div className="login-feature-item">
                        <CheckCircle className="login-feature-icon" />
                        <span>Automated asset transfer tracking and sign-offs</span>
                    </div>
                    <div className="login-feature-item">
                        <CheckCircle className="login-feature-icon" />
                        <span>Seamless global SSO authentication</span>
                    </div>
                </div>
            </div>

            {/* Right Col - Login Box */}
            <div className="login-box-wrapper">
                <div className="login-box">
                    <div className="login-box-accent"></div>

                    <div className="login-box-header">
                        <div className="login-box-icon-wrapper">
                            <Box className="login-box-icon" />
                        </div>
                        <h2 className="login-box-title">Welcome Back</h2>
                        <p className="login-box-text">Please sign in to your dashboard</p>
                    </div>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <div className="login-actions">
                        <button
                            onClick={handleLoginClick}
                            className="login-sso-btn group"
                        >
                            <Globe className="login-sso-icon" />
                            Continue with ZenoHosp SSO
                        </button>

                        <p className="login-disclaimer">
                            By logging in, you agree to our Terms of Service and Privacy Policy. Auth tokens are fully encrypted via Identity Directory.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
