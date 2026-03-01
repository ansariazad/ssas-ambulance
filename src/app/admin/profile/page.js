'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
    const [admin, setAdmin] = useState(null);
    const [form, setForm] = useState({ admin_name: '', email: '', mobile_number: '' });
    const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
    const [msg, setMsg] = useState('');
    const [pwMsg, setPwMsg] = useState('');

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('ssas_admin') || '{}');
        if (stored.id) {
            fetch(`/api/admin/profile?id=${stored.id}`)
                .then(r => r.json())
                .then(d => { setAdmin(d); setForm({ admin_name: d.admin_name, email: d.email, mobile_number: d.mobile_number }); });
        }
    }, []);

    const handleProfile = async (e) => {
        e.preventDefault();
        const stored = JSON.parse(localStorage.getItem('ssas_admin') || '{}');
        const res = await fetch('/api/admin/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: stored.id, ...form }),
        });
        if (res.ok) {
            setMsg('Profile updated!');
            stored.admin_name = form.admin_name;
            stored.email = form.email;
            stored.mobile_number = form.mobile_number;
            localStorage.setItem('ssas_admin', JSON.stringify(stored));
            setTimeout(() => setMsg(''), 3000);
        }
    };

    const handlePassword = async (e) => {
        e.preventDefault();
        if (pwForm.new_password !== pwForm.confirm_password) {
            setPwMsg('Passwords do not match.');
            return;
        }
        const stored = JSON.parse(localStorage.getItem('ssas_admin') || '{}');
        const res = await fetch('/api/admin/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: stored.id, current_password: pwForm.current_password, new_password: pwForm.new_password }),
        });
        const data = await res.json();
        if (res.ok) { setPwMsg('Password changed!'); setPwForm({ current_password: '', new_password: '', confirm_password: '' }); }
        else setPwMsg(data.error || 'Error.');
        setTimeout(() => setPwMsg(''), 3000);
    };

    if (!admin) return <div>Loading...</div>;

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Profile Settings</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <motion.div className="glass-card" style={{ padding: '2rem' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h3 style={{ marginBottom: '1rem' }}>Edit Profile</h3>
                    {msg && <div className="alert alert-success">{msg}</div>}
                    <form onSubmit={handleProfile}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="input-group"><label>Name</label><input className="input-field" value={form.admin_name} onChange={e => setForm({ ...form, admin_name: e.target.value })} required /></div>
                            <div className="input-group"><label>Email</label><input className="input-field" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
                            <div className="input-group"><label>Mobile</label><input className="input-field" value={form.mobile_number} onChange={e => setForm({ ...form, mobile_number: e.target.value })} required /></div>
                            <button type="submit" className="btn btn-primary">Save Changes</button>
                        </div>
                    </form>
                </motion.div>

                <motion.div className="glass-card" style={{ padding: '2rem' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <h3 style={{ marginBottom: '1rem' }}>Change Password</h3>
                    {pwMsg && <div className={`alert ${pwMsg.includes('changed') ? 'alert-success' : 'alert-error'}`}>{pwMsg}</div>}
                    <form onSubmit={handlePassword}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="input-group"><label>Current Password</label><input className="input-field" type="password" value={pwForm.current_password} onChange={e => setPwForm({ ...pwForm, current_password: e.target.value })} required /></div>
                            <div className="input-group"><label>New Password</label><input className="input-field" type="password" value={pwForm.new_password} onChange={e => setPwForm({ ...pwForm, new_password: e.target.value })} required /></div>
                            <div className="input-group"><label>Confirm Password</label><input className="input-field" type="password" value={pwForm.confirm_password} onChange={e => setPwForm({ ...pwForm, confirm_password: e.target.value })} required /></div>
                            <button type="submit" className="btn btn-primary">Change Password</button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
