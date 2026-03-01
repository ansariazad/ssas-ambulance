export default function Loading() {
    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#0a0a0a',
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: '1rem', animation: 'pulse 1.5s ease-in-out infinite' }}>🚑</div>
                <div style={{
                    width: 40, height: 40,
                    border: '3px solid #1e293b', borderTop: '3px solid #06b6d4',
                    borderRadius: '50%', animation: 'spin 1s linear infinite',
                    margin: '0 auto 1rem',
                }} />
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading SSAS...</p>
            </div>
        </div>
    );
}
