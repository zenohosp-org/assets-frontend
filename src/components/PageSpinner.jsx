import { Loader2 } from 'lucide-react';
import '../styles/page-spinner.css';

export default function PageSpinner() {
    return (
        <div className="page-spinner-wrap" role="status" aria-live="polite">
            <Loader2 className="page-spinner-icon" />
            <span className="page-spinner-text">Loading…</span>
        </div>
    );
}
