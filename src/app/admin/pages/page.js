'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CMSPagesPage() {
    const [pages, setPages] = useState([]);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetch('/api/admin/pages').then(r => r.json()).then(setPages);
    }, []);

    const handleSave = async (page) => {
        const res = await fetch('/api/admin/pages', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(page),
        });
        if (res.ok) {
            setMsg(`${page.page_title} updated!`);
            setTimeout(() => setMsg(''), 3000);
        }
    };

    const handleChange = (idx, field, value) => {
        const updated = [...pages];
        updated[idx] = { ...updated[idx], [field]: value };
        setPages(updated);
    };

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>CMS Pages</h2>
            {msg && <div className="alert alert-success">{msg}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {pages.map((p, idx) => (
                    <motion.div key={p.id} className="glass-card" style={{ padding: '2rem' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                        <h3 style={{ marginBottom: '1rem', textTransform: 'capitalize' }}>{p.page_title || p.page_type}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="input-group">
                                <label>Description / Content</label>
                                <textarea className="input-field" rows={4} value={p.page_description || ''} onChange={e => handleChange(idx, 'page_description', e.target.value)} />
                            </div>
                            {p.page_type === 'contactus' && (
                                <>
                                    <div className="input-group">
                                        <label>Email</label>
                                        <input className="input-field" value={p.email || ''} onChange={e => handleChange(idx, 'email', e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label>Mobile Number</label>
                                        <input className="input-field" value={p.mobile_number || ''} onChange={e => handleChange(idx, 'mobile_number', e.target.value)} />
                                    </div>
                                </>
                            )}
                            <div><button className="btn btn-primary" onClick={() => handleSave(p)}>Save {p.page_title}</button></div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
