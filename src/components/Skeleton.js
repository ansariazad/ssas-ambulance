export function SkeletonText({ width = '100%', height = '1rem', className = '' }) {
    return <div className={`skeleton skeleton-text ${className}`} style={{ width, height }} />;
}

export function SkeletonCard({ className = '' }) {
    return (
        <div className={`glass-card skeleton-card ${className}`} style={{ padding: '1.5rem' }}>
            <div className="skeleton skeleton-circle" />
            <SkeletonText width="60%" height="1.8rem" />
            <SkeletonText width="80%" />
        </div>
    );
}

export function SkeletonTable({ rows = 5, cols = 6 }) {
    return (
        <div className="glass-card" style={{ overflow: 'auto' }}>
            <table className="data-table">
                <thead>
                    <tr>{Array.from({ length: cols }).map((_, i) => <th key={i}><SkeletonText width="80px" height="0.7rem" /></th>)}</tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, r) => (
                        <tr key={r}>
                            {Array.from({ length: cols }).map((_, c) => (
                                <td key={c}><SkeletonText width={`${50 + Math.random() * 50}%`} /></td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
