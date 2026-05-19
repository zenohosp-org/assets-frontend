import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/layout.css';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="app-loader-wrapper">
                <div className="app-loader-spinner"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
