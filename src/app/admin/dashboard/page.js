'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, FileText, FilePlus, Clock, CheckCircle, XCircle, AlertTriangle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { SkeletonCard } from '@/components/Skeleton';
import { AMBULANCE_TYPES, STATUS_COLORS, formatDate } from '@/lib/utils';

export default function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [recentBookings, setRecentBookings] = useState([]);
    const [adminName, setAdminName] = useState('');

    useEffect(() => {
        fetch('/api/admin/stats').then(r => r.json()).then(setStats).catch(() => { });
        fetch('/api/admin/requests?status=All').then(r => r.json()).then(d => setRecentBookings((d || []).slice(0, 5))).catch(() => { });
        const stored = localStorage.getItem('ssas_admin');
        if (stored) setAdminName(JSON.parse(stored).admin_name);
    }, []);

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const cards = stats ? [
        { label: 'Total Ambulances', value: stats.totalAmbulances, icon: <Truck size={22} />, bg: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', link: '/admin/ambulances' },
        { label: 'All Requests', value: stats.allRequests, icon: <FileText size={22} />, bg: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', link: '/admin/requests' },
        { label: 'New Requests', value: stats.newRequests, icon: <FilePlus size={22} />, bg: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', link: '/admin/requests?status=New' },
        { label: 'Assigned', value: stats.assigned, icon: <AlertTriangle size={22} />, bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', link: '/admin/requests?status=Assigned' },
        { label: 'On The Way', value: stats.onTheWay, icon: <Clock size={22} />, bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', link: '/admin/requests?status=On the way' },
        { label: 'Pickup', value: stats.pickup, icon: <ArrowUpRight size={22} />, bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', link: '/admin/requests?status=Pickup' },
        { label: 'Reached', value: stats.reached, icon: <CheckCircle size={22} />, bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', link: '/admin/requests?status=Reached' },
        { label: 'Rejected', value: stats.rejected, icon: <XCircle size={22} />, bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', link: '/admin/requests?status=Rejected' },
    ] : [];

    return (
        <div>
            {/* Welcome */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Welcome back, {adminName || 'Admin'} 👋</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{today}</p>
            </motion.div>

            {/* Stats */}
            {!stats ? (
                <div className="stats-grid">
                    {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : (
                <div className="stats-grid">
                    {cards.map((c, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                            <Link href={c.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="glass-card stat-widget">
                                    <div className="stat-icon" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
                                    <h3 style={{ color: c.color }}>{c.value}</h3>
                                    <p>{c.label}</p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Recent Bookings */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Bookings</h3>
                    <Link href="/admin/requests" className="btn btn-secondary btn-sm">View All</Link>
                </div>
                <div className="glass-card" style={{ overflow: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr><th>Booking #</th><th>Patient</th><th>Date</th><th>Type</th><th>Status</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                            {recentBookings.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No bookings yet.</td></tr>
                            ) : (
                                recentBookings.map(b => {
                                    const st = STATUS_COLORS[b.status] || STATUS_COLORS['New'];
                                    return (
                                        <tr key={b.id}>
                                            <td style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{b.booking_number}</td>
                                            <td>{b.patient_name}</td>
                                            <td>{formatDate(b.hiring_date)}</td>
                                            <td>{AMBULANCE_TYPES[b.ambulance_type] || '-'}</td>
                                            <td><span className="status-badge" style={{ background: st.bg, color: st.color, border: st.border }}>{b.status || 'New'}</span></td>
                                            <td><Link href={`/admin/requests/${b.id}`} className="btn btn-primary btn-sm">View</Link></td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
