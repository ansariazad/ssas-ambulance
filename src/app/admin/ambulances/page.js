'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { AMBULANCE_TYPES } from '@/lib/utils';
import { useToast } from '@/components/Toast';
import ImageUpload from '@/components/ImageUpload';

export default function AmbulancesPage() {
    const toast = useToast();
    const [ambulances, setAmbulances] = useState([]);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ ambulance_type: '', reg_number: '', driver_name: '', driver_contact: '', driver_photo: '', ambulance_photo: '' });

    const load = () => fetch('/api/admin/ambulances').then(r => r.json()).then(setAmbulances);
    useEffect(() => { load(); }, []);

    const openAdd = () => { setForm({ ambulance_type: '', reg_number: '', driver_name: '', driver_contact: '', driver_photo: '', ambulance_photo: '' }); setModal('add'); };
    const openEdit = (a) => { setForm({ ambulance_type: a.ambulance_type, reg_number: a.reg_number, driver_name: a.driver_name, driver_contact: a.driver_contact, driver_photo: a.driver_photo || '', ambulance_photo: a.ambulance_photo || '' }); setModal(a); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isEdit = modal !== 'add';
        const url = isEdit ? `/api/admin/ambulances/${modal.id}` : '/api/admin/ambulances';
        const method = isEdit ? 'PUT' : 'POST';
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        if (res.ok) { toast(isEdit ? 'Ambulance updated!' : 'Ambulance added!', 'success'); setModal(null); load(); }
        else toast('Error saving ambulance.', 'error');
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this ambulance?')) return;
        await fetch(`/api/admin/ambulances/${id}`, { method: 'DELETE' });
        toast('Ambulance deleted.', 'success');
        load();
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Manage Ambulances</h2>
                <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Ambulance</button>
            </div>

            <div className="glass-card" style={{ overflow: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Photo</th><th>Type</th><th>Reg Number</th><th>Driver</th><th>Contact</th><th>Status</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ambulances.map((a, i) => (
                            <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                                <td>
                                    {a.ambulance_photo ? (
                                        <img src={a.ambulance_photo} alt="Ambulance" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <ImageIcon size={16} style={{ color: 'var(--text-muted)' }} />
                                        </div>
                                    )}
                                </td>
                                <td>{AMBULANCE_TYPES[a.ambulance_type] || 'Unknown'}</td>
                                <td style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{a.reg_number}</td>
                                <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {a.driver_photo && <img src={a.driver_photo} alt="Driver" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />}
                                    {a.driver_name}
                                </td>
                                <td>{a.driver_contact}</td>
                                <td><span className="status-badge" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)' }}>{a.status || 'Available'}</span></td>
                                <td style={{ display: 'flex', gap: 6 }}>
                                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(a)}><Edit size={14} /></button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}><Trash2 size={14} /></button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {modal && (
                    <motion.div className="modal-overlay" onClick={() => setModal(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="modal-content" onClick={e => e.stopPropagation()} initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                            <div className="modal-header">
                                <h3>{modal === 'add' ? 'Add Ambulance' : 'Edit Ambulance'}</h3>
                                <button className="modal-close" onClick={() => setModal(null)}><X /></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {/* Photo Uploads */}
                                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Driver Photo</label>
                                            <ImageUpload
                                                folder="drivers"
                                                currentUrl={form.driver_photo}
                                                onUpload={url => setForm({ ...form, driver_photo: url })}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Ambulance Photo</label>
                                            <ImageUpload
                                                folder="ambulances"
                                                currentUrl={form.ambulance_photo}
                                                onUpload={url => setForm({ ...form, ambulance_photo: url })}
                                            />
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label>Ambulance Type</label>
                                        <select className="input-field" value={form.ambulance_type} onChange={e => setForm({ ...form, ambulance_type: e.target.value })} required>
                                            <option value="">Select Type</option>
                                            <option value="1">Basic Life Support (BLS)</option>
                                            <option value="2">Advanced Life Support (ALS)</option>
                                            <option value="3">Non-Emergency Transport</option>
                                            <option value="4">Boat Ambulance</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>Registration Number</label>
                                        <input className="input-field" value={form.reg_number} onChange={e => setForm({ ...form, reg_number: e.target.value })} placeholder="e.g. DL14RT5678" required />
                                    </div>
                                    <div className="input-group">
                                        <label>Driver Name</label>
                                        <input className="input-field" value={form.driver_name} onChange={e => setForm({ ...form, driver_name: e.target.value })} required />
                                    </div>
                                    <div className="input-group">
                                        <label>Driver Contact</label>
                                        <input className="input-field" value={form.driver_contact} onChange={e => setForm({ ...form, driver_contact: e.target.value })} required />
                                    </div>
                                    <button type="submit" className="btn btn-primary">{modal === 'add' ? 'Add Ambulance' : 'Save Changes'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
