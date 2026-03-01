'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Phone, Calendar, MapPin, Truck, Clock, Mail } from 'lucide-react';
import { AMBULANCE_TYPES, STATUS_COLORS, formatDate, formatDateTime } from '@/lib/utils';
import { useToast } from '@/components/Toast';

const STATUSES = ['Assigned', 'On the way', 'Pickup', 'Reached', 'Rejected'];

export default function RequestDetailPage({ params }) {
    const { id } = use(params);
    const toast = useToast();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updateForm, setUpdateForm] = useState({ status: '', remark: '', ambulance_reg_no: '' });
    const [sendEmail, setSendEmail] = useState(true);

    const load = () => {
        fetch(`/api/admin/requests/${id}`)
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    };
    useEffect(load, [id]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        const res = await fetch(`/api/admin/requests/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateForm),
        });
        if (res.ok) {
            toast('Status updated successfully!', 'success');
            setUpdateForm({ status: '', remark: '', ambulance_reg_no: '' });
            load();

            // Send email notification
            if (sendEmail && data?.booking) {
                fetch('/api/admin/notify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        booking_number: data.booking.booking_number,
                        status: updateForm.status,
                        remark: updateForm.remark,
                    }),
                }).then(r => r.json()).then(nr => {
                    if (nr.sent) toast('Email notification sent!', 'info');
                }).catch(() => { });
            }
        } else {
            toast('Failed to update status.', 'error');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!data || !data.booking) return <div>Request not found.</div>;

    const { booking, history, ambulances } = data;
    const statusStyle = STATUS_COLORS[booking.status] || STATUS_COLORS['New'];

    return (
        <div>
            <Link href="/admin/requests" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                <ArrowLeft size={16} /> Back to requests
            </Link>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Request #{booking.booking_number}</h2>
                    <span className="status-badge" style={{ background: statusStyle.bg, color: statusStyle.color, border: statusStyle.border, fontSize: '1rem', padding: '6px 18px' }}>{booking.status || 'New'}</span>
                </div>

                {/* Details */}
                <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Booking Details</h3>
                    <div className="detail-grid">
                        <div className="detail-item"><div className="label">Patient</div><div className="value">{booking.patient_name}</div></div>
                        <div className="detail-item"><div className="label">Relative</div><div className="value">{booking.relative_name}</div></div>
                        <div className="detail-item"><div className="label">Phone</div><div className="value">{booking.relative_phone}</div></div>
                        <div className="detail-item"><div className="label">Date/Time</div><div className="value">{formatDate(booking.hiring_date)} at {booking.hiring_time}</div></div>
                        <div className="detail-item"><div className="label">Address</div><div className="value">{booking.address}, {booking.city}, {booking.state}</div></div>
                        <div className="detail-item"><div className="label">Ambulance Type</div><div className="value">{AMBULANCE_TYPES[booking.ambulance_type] || '-'}</div></div>
                        {booking.relative_email && <div className="detail-item"><div className="label"><Mail size={14} style={{ display: 'inline', marginRight: 4 }} />Email</div><div className="value">{booking.relative_email}</div></div>}
                        {booking.message && <div className="detail-item" style={{ gridColumn: '1/-1' }}><div className="label">Message</div><div className="value">{booking.message}</div></div>}
                        {booking.ambulance_reg_no && <div className="detail-item"><div className="label">Assigned Ambulance</div><div className="value">{booking.ambulance_reg_no}</div></div>}
                        <div className="detail-item"><div className="label">Driver</div><div className="value">{booking.driver_name || 'Not assigned'}</div></div>
                    </div>
                </div>

                {/* Update Status */}
                <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Update Status</h3>
                    <form onSubmit={handleUpdate}>
                        <div className="form-grid">
                            <div className="input-group">
                                <label>Status *</label>
                                <select className="input-field" value={updateForm.status} onChange={e => setUpdateForm({ ...updateForm, status: e.target.value })} required>
                                    <option value="">Select Status</option>
                                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Assign Ambulance</label>
                                <select className="input-field" value={updateForm.ambulance_reg_no} onChange={e => setUpdateForm({ ...updateForm, ambulance_reg_no: e.target.value })}>
                                    <option value="">Select Ambulance</option>
                                    {ambulances && ambulances.map(a => (
                                        <option key={a.id} value={a.reg_number}>{a.reg_number} — {a.driver_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group form-full">
                                <label>Remark *</label>
                                <input className="input-field" value={updateForm.remark} onChange={e => setUpdateForm({ ...updateForm, remark: e.target.value })} placeholder="Enter remark..." required />
                            </div>
                        </div>
                        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <button type="submit" className="btn btn-primary">Update Status</button>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                <input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} style={{ accentColor: 'var(--accent-cyan)' }} />
                                <Mail size={14} /> Send email notification
                            </label>
                        </div>
                    </form>
                </div>

                {/* Timeline */}
                {history && history.length > 0 && (
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}><Clock size={18} style={{ display: 'inline', marginRight: 6 }} />Tracking History</h3>
                        <div className="timeline">
                            {history.map((h, i) => {
                                const hStyle = STATUS_COLORS[h.status] || STATUS_COLORS['New'];
                                return (
                                    <div key={i} className="timeline-item">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                            <span className="status-badge" style={{ background: hStyle.bg, color: hStyle.color, border: hStyle.border }}>{h.status}</span>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{formatDateTime(h.created_at)}</span>
                                        </div>
                                        <p style={{ marginTop: '0.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{h.remark}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
