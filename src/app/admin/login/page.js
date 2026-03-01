'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, ArrowLeft, Mail } from 'lucide-react';

export default function AdminLoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForgot, setShowForgot] = useState(false);
    const [forgotForm, setForgotForm] = useState({ username: '', email: '' });
    const [forgotMsg, setForgotMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('ssas_admin', JSON.stringify(data));
                router.push('/admin/dashboard');
            } else {
                setError(data.error || 'Login failed.');
            }
        } catch {
            setError('Network error.');
        }
        setLoading(false);
    };

    const handleForgot = async (e) => {
        e.preventDefault();
        setForgotMsg('');
        const res = await fetch('/api/admin/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(forgotForm),
        });
        const data = await res.json();
        if (res.ok) {
            setForgotMsg(`✅ ${data.message} Your temporary password is: ${data.tempPassword}`);
        } else {
            setForgotMsg(`❌ ${data.error}`);
        }
    };

    return (
        <div className="login-page">
            <AnimatePresence mode="wait">
                {!showForgot ? (
                    <motion.div key="login" className="glass-card login-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4 }}>
                        <div style={{ width: 60, height: 60, background: 'var(--accent-gradient)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: 'var(--glow-cyan)' }}>
                            <Lock size={28} color="#fff" />
                        </div>
                        <h2>Admin Portal</h2>
                        <p>Sign in to manage the portal</p>

                        {error && <div className="alert alert-error">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label>Username</label>
                                <input className="input-field" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="Enter username" required />
                            </div>
                            <div className="input-group">
                                <label>Password</label>
                                <input className="input-field" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Enter password" required />
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>
                        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                            <a href="/" style={{ color: 'var(--text-secondary)' }}>← Back to Home</a>
                            <button onClick={() => { setShowForgot(true); setForgotMsg(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '0.8rem' }}>
                                Forgot Password?
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="forgot" className="glass-card login-card" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ duration: 0.4 }}>
                        <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg, #f59e0b, #ef4444)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <Mail size={28} color="#fff" />
                        </div>
                        <h2>Reset Password</h2>
                        <p>Enter your username and email to reset your password</p>

                        {forgotMsg && (
                            <div className={`alert ${forgotMsg.startsWith('✅') ? 'alert-success' : 'alert-error'}`} style={{ wordBreak: 'break-all' }}>
                                {forgotMsg}
                            </div>
                        )}

                        <form onSubmit={handleForgot}>
                            <div className="input-group">
                                <label>Username</label>
                                <input className="input-field" value={forgotForm.username} onChange={e => setForgotForm({ ...forgotForm, username: e.target.value })} placeholder="Enter your username" required />
                            </div>
                            <div className="input-group">
                                <label>Email</label>
                                <input className="input-field" type="email" value={forgotForm.email} onChange={e => setForgotForm({ ...forgotForm, email: e.target.value })} placeholder="Enter your registered email" required />
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg">Reset Password</button>
                        </form>
                        <p style={{ marginTop: '1.5rem', fontSize: '0.8rem' }}>
                            <button onClick={() => setShowForgot(false)} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '0.8rem' }}>
                                <ArrowLeft size={12} style={{ display: 'inline', marginRight: 4 }} /> Back to Login
                            </button>
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
