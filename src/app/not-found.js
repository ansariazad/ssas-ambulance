import Link from 'next/link';

export default function NotFound() {
    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#0a0a0a', fontFamily: 'Inter, sans-serif',
        }}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: 80, marginBottom: '1rem' }}>🚑💨</div>
                <h1 style={{ fontSize: '5rem', fontWeight: 900, background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem', lineHeight: 1 }}>404</h1>
                <h2 style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: '0.5rem' }}>Page Not Found</h2>
                <p style={{ color: '#94a3b8', marginBottom: '2rem', maxWidth: 400 }}>
                    The ambulance you&apos;re looking for took a wrong turn. Let&apos;s get you back on track.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/" style={{ padding: '12px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #06b6d4, #10b981)', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
                        🏠 Go Home
                    </Link>
                    <Link href="/track" style={{ padding: '12px 24px', borderRadius: 12, border: '1px solid #334155', background: '#1e293b', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
                        🔍 Track Booking
                    </Link>
                    <a href="tel:108" style={{ padding: '12px 24px', borderRadius: 12, background: '#dc2626', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
                        🆘 Call 108
                    </a>
                </div>
            </div>
        </div>
    );
}
