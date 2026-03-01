'use client';
import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Download } from 'lucide-react';
import { AMBULANCE_TYPES, STATUS_COLORS, formatDate } from '@/lib/utils';
import { exportToCSV } from '@/lib/export';
import { useToast } from '@/components/Toast';

const TABS = ['All', 'New', 'Assigned', 'On the way', 'Pickup', 'Reached', 'Rejected'];

function RequestsContent() {
    const toast = useToast();
    const searchParams = useSearchParams();
    const initialStatus = searchParams.get('status') || 'All';
    const [activeTab, setActiveTab] = useState(initialStatus);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setLoading(true);
        fetch(`/api/admin/requests?status=${encodeURIComponent(activeTab)}`)
            .then(r => r.json())
            .then(d => { setBookings(Array.isArray(d) ? d : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, [activeTab]);

    const filtered = bookings.filter(b => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            b.booking_number?.toLowerCase().includes(q) ||
            b.patient_name?.toLowerCase().includes(q) ||
            b.relative_phone?.includes(q) ||
            b.city?.toLowerCase().includes(q)
        );
    });

    const handleExportCSV = () => {
        if (filtered.length === 0) { toast('No data to export.', 'error'); return; }
        exportToCSV(filtered.map(b => ({
            'Booking #': b.booking_number,
            'Patient': b.patient_name,
            'Phone': b.relative_phone,
            'Date': b.hiring_date,
            'Type': AMBULANCE_TYPES[b.ambulance_type] || '',
            'Status': b.status || 'New',
            'City': b.city,
            'Address': b.address,
        })), `ssas-requests-${activeTab.toLowerCase()}`);
        toast('CSV exported!', 'success');
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Ambulance Requests</h2>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            className="input-field"
                            placeholder="Search by name, phone, booking..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: 32, width: 260, height: 36, fontSize: '0.85rem' }}
                        />
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={handleExportCSV} title="Export CSV">
                        <Download size={14} /> CSV
                    </button>
                </div>
            </div>

            <div className="status-tabs">
                {TABS.map(t => (
                    <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
                ))}
            </div>

            <div className="glass-card" style={{ overflow: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr><th>#</th><th>Booking #</th><th>Patient</th><th>Phone</th><th>Date</th><th>Type</th><th>Status</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No requests found.</td></tr>
                        ) : (
                            filtered.map((b, i) => {
                                const st = STATUS_COLORS[b.status] || STATUS_COLORS['New'];
                                return (
                                    <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                                        <td>{i + 1}</td>
                                        <td style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{b.booking_number}</td>
                                        <td>{b.patient_name}</td>
                                        <td>{b.relative_phone}</td>
                                        <td>{formatDate(b.hiring_date)}</td>
                                        <td>{AMBULANCE_TYPES[b.ambulance_type] || '-'}</td>
                                        <td><span className="status-badge" style={{ background: st.bg, color: st.color, border: st.border }}>{b.status || 'New'}</span></td>
                                        <td><Link href={`/admin/requests/${b.id}`} className="btn btn-primary btn-sm">View</Link></td>
                                    </motion.tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {!loading && (
                <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Showing {filtered.length} of {bookings.length} requests
                </p>
            )}
        </div>
    );
}

export default function RequestsPage() {
    return (
        <Suspense fallback={<div>Loading requests...</div>}>
            <RequestsContent />
        </Suspense>
    );
}
