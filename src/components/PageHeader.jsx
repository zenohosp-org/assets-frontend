import '../styles/page-header.css';

/**
 * Standard page title area: title (+ optional icon), subtitle, and an optional
 * right-hand `actions` slot. Callers pass their own action markup verbatim
 * (a single button, or a wrapper such as `.app-page-actions`).
 */
export default function PageHeader({ icon: Icon, title, subtitle, actions }) {
    return (
        <header className="app-page-header">
            <div className="app-page-title-wrapper">
                <h1 className="app-page-title">
                    {Icon && <Icon className="app-page-title-icon" />}
                    {title}
                </h1>
                {subtitle && <p className="app-page-subtitle">{subtitle}</p>}
            </div>
            {actions}
        </header>
    );
}
