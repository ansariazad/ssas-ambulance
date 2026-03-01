'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Shield, Users, Truck, X } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function ManageUsersPage() {
    const toast = useToast();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null); // null or admin object
    const [form, setForm] = useState({ admin_name: '', username: '', email: '', mobile_number: '', password: '', role: 'dispatcher' });

    const fetchAdmins = () => {
        fetch('/api/admin/users').then(r => r.json()).then(d => { setAdmins(d); setLoading(false); }).catch(() => setLoading(false));
    };

    useEffect(() => { fetchAdmins(); }, []);

    const roleIcons = { super_admin: <Shield size={14} />, dispatcher: <Users size={14} />, driver: <Truck size={14} /> };
    const roleColors = { super_admin: '#8b5cf6', dispatcher: '#06b6d4', driver: '#10b981' };

    const handleSave = async (e) => {
        e.preventDefault();
        const isEdit = modal && modal.id;
        const url = isEdit ? `/api/admin/users/${modal.id}` : '/api/admin/users';
        const method = isEdit ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method, headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        const data = await res.json();
        if (res.ok) {
            toast(isEdit ? 'User updated!' : 'User created!', 'success');
            setModal(null);
            fetchAdmins();
        } else {
            toast(data.error || 'Error', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this user?')) return;
        const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
        if (res.ok) { toast('User deleted.', 'success'); fetchAdmins(); }
        else toast('Error deleting user.', 'error');
    };

    const openAdd = () => {
        setForm({ admin_name: '', username: '', email: '', mobile_number: '', password: '', role: 'dispatcher' });
        setModal({});
    };

    const openEdit = (a) => {
        setForm({ admin_name: a.admin_name, username: a.username, email: a.email, mobile_number: a.mobile_number, password: '', role: a.role || 'super_admin' });
        setModal(a);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Manage Users</h2>
                <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add User</button>
            </div>

            <div className="glass-card" style={{ overflow: 'auto' }}>
                <table className="data-table">
                    <thead><tr><th>Name</th><th>Username</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
                        ) : admins.map(a => (
                            <tr key={a.id}>
                                <td style={{ fontWeight: 600 }}>{a.admin_name}</td>
                                <td>{a.username}</td>
                                <td>{a.email}</td>
                                <td>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 4,
                                        padding: '2px 10px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 600,
                                        background: `${roleColors[a.role] || '#8b5cf6'}22`, color: roleColors[a.role] || '#8b5cf6',
                                    }}>
                                        {roleIcons[a.role]} {a.role || 'super_admin'}
                                    </span>
                                </td>
                                <td style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(a)}><Pencil size={13} /></button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}><Trash2 size={13} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {modal !== null && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(null)}>
                        <motion.div className="modal-content" onClick={e => e.stopPropagation()} initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                            <div className="modal-header">
                                <h3>{modal.id ? 'Edit User' : 'Add User'}</h3>
                                <button className="modal-close" onClick={() => setModal(null)}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSave}>
                                <div className="input-group" style={{ marginBottom: '1rem' }}>
                                    <label>Full Name *</label>
                                    <input className="input-field" value={form.admin_name} onChange={e => setForm({ ...form, admin_name: e.target.value })} required />
                                </div>
                                <div className="input-group" style={{ marginBottom: '1rem' }}>
                                    <label>Username *</label>
                                    <input className="input-field" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required disabled={!!modal.id} />
                                </div>
                                <div className="input-group" style={{ marginBottom: '1rem' }}>
                                    <label>Email</label>
                                    <input className="input-field" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                                </div>
                                <div className="input-group" style={{ marginBottom: '1rem' }}>
                                    <label>Mobile</label>
                                    <input className="input-field" value={form.mobile_number} onChange={e => setForm({ ...form, mobile_number: e.target.value })} />
                                </div>
                                <div className="input-group" style={{ marginBottom: '1rem' }}>
                                    <label>{modal.id ? 'New Password (leave blank to keep)' : 'Password *'}</label>
                                    <input className="input-field" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!modal.id} />
                                </div>
                                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                                    <label>Role *</label>
                                    <select className="input-field" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                                        <option value="super_admin">Super Admin</option>
                                        <option value="dispatcher">Dispatcher</option>
                                        <option value="driver">Driver</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                    {modal.id ? 'Update User' : 'Create User'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
