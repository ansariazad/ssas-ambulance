'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Phone, Calendar, MapPin, Truck, Clock, Download } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RealtimeNotifications from '@/components/RealtimeNotifications';
import { AMBULANCE_TYPES, STATUS_COLORS, formatDate, formatDateTime } from '@/lib/utils';
import { generateBookingPDF } from '@/lib/export';

// Dynamic import for map (SSR disabled - Leaflet needs window)
const TrackingMap = dynamic(() => import('@/components/TrackingMap'), { ssr: false });

export default function BookingDetailPage({ params }) {
    const { id } = use(params);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/bookings/${id}`)
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <>
            <Header />
            <div className="page-header"><h1>Loading...</h1></div>
            <div style={{ minHeight: '50vh' }} />
            <Footer />
        </>
    );

    if (!data || !data.booking) return (
        <>
            <Header />
            <div className="page-header"><h1>Booking Not Found</h1></div>
            <section className="section"><div className="container" style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>The booking you&apos;re looking for doesn&apos;t exist.</p>
                <Link href="/track" className="btn btn-primary" style={{ marginTop: '1rem' }}>Go Back</Link>
            </div></section>
            <Footer />
        </>
    );

    const { booking, history } = data;
    const statusStyle = STATUS_COLORS[booking.status] || STATUS_COLORS['New'];

    return (
        <>
            <Header />
            <div className="page-header">
                <h1>Booking #{booking.booking_number}</h1>
                <div className="breadcrumb">
                    <Link href="/">Home</Link> <span>/</span> <Link href="/track">Track</Link> <span>/</span> <span>Details</span>
                </div>
            </div>

            <section className="section">
                <div className="container" style={{ maxWidth: 900 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <Link href="/track" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                            <ArrowLeft size={16} /> Back to tracking
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => generateBookingPDF(booking, history)} title="Download PDF">
                                <Download size={14} /> PDF
                            </button>
                            <RealtimeNotifications bookingNumber={booking.booking_number} />
                        </div>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        {/* Status Banner */}
                        <div className="glass-card" style={{ padding: '1.5rem 2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Current Status</p>
                                <span className="status-badge" style={{ background: statusStyle.bg, color: statusStyle.color, border: statusStyle.border, fontSize: '1rem', padding: '6px 18px' }}>
                                    {booking.status || 'New'}
                                </span>
                            </div>
                            {booking.remark && (
                                <div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Remark</p>
                                    <p style={{ fontWeight: 500 }}>{booking.remark}</p>
                                </div>
                            )}
                        </div>

                        {/* Map */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <TrackingMap booking={booking} />
                        </div>

                        {/* Details */}
                        <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Booking Details</h3>
                            <div className="detail-grid">
                                <div className="detail-item"><div className="label"><User size={14} style={{ display: 'inline', marginRight: 4 }} />Patient</div><div className="value">{booking.patient_name}</div></div>
                                <div className="detail-item"><div className="label"><User size={14} style={{ display: 'inline', marginRight: 4 }} />Relative</div><div className="value">{booking.relative_name}</div></div>
                                <div className="detail-item"><div className="label"><Phone size={14} style={{ display: 'inline', marginRight: 4 }} />Phone</div><div className="value">{booking.relative_phone}</div></div>
                                <div className="detail-item"><div className="label"><Calendar size={14} style={{ display: 'inline', marginRight: 4 }} />Date/Time</div><div className="value">{formatDate(booking.hiring_date)} at {booking.hiring_time}</div></div>
                                <div className="detail-item"><div className="label"><MapPin size={14} style={{ display: 'inline', marginRight: 4 }} />Address</div><div className="value">{booking.address}, {booking.city}, {booking.state}</div></div>
                                <div className="detail-item"><div className="label"><Truck size={14} style={{ display: 'inline', marginRight: 4 }} />Type</div><div className="value">{AMBULANCE_TYPES[booking.ambulance_type] || 'Unknown'}</div></div>
                                {booking.message && <div className="detail-item" style={{ gridColumn: '1/-1' }}><div className="label">Message</div><div className="value">{booking.message}</div></div>}
                            </div>
                        </div>

                        {/* Driver Info */}
                        <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Driver Information</h3>
                            <div className="detail-grid">
                                <div className="detail-item"><div className="label">Driver Name</div><div className="value">{booking.driver_name || 'Not Assigned Yet'}</div></div>
                                <div className="detail-item"><div className="label">Driver Contact</div><div className="value">{booking.driver_contact || 'Not Assigned Yet'}</div></div>
                                <div className="detail-item"><div className="label">Ambulance Reg No</div><div className="value">{booking.ambulance_reg_no || 'Not Assigned Yet'}</div></div>
                            </div>
                        </div>

                        {/* Tracking Timeline */}
                        {history && history.length > 0 && (
                            <div className="glass-card" style={{ padding: '2rem' }}>
                                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}><Clock size={18} style={{ display: 'inline', marginRight: 6 }} />Tracking History</h3>
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
                                                {h.ambulance_reg_num && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ambulance: {h.ambulance_reg_num}</p>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </section>

            <Footer />
        </>
    );
}
