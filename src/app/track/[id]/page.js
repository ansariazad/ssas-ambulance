'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Phone, Calendar, MapPin, Truck, Clock, Download, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RealtimeNotifications from '@/components/RealtimeNotifications';
import { AMBULANCE_TYPES, STATUS_COLORS, formatDate, formatDateTime } from '@/lib/utils';
import { generateBookingPDF } from '@/lib/export';

const TrackingMap = dynamic(() => import('@/components/TrackingMap'), { ssr: false });

const STEPS = [
    { key: 'New', label: 'Received', icon: '📋', desc: 'Booking received by SSAS' },
    { key: 'Assigned', label: 'Assigned', icon: '👤', desc: 'Driver & ambulance assigned' },
    { key: 'On the way', label: 'On the Way', icon: '🚑', desc: 'Ambulance is heading to you' },
    { key: 'Pickup', label: 'Pickup', icon: '📍', desc: 'Reached pickup location' },
    { key: 'Reached', label: 'Delivered', icon: '🏥', desc: 'Patient delivered to hospital' },
];

function StatusTimeline({ currentStatus }) {
    const currentIdx = STEPS.findIndex(s => s.key === currentStatus);
    const activeIdx = currentIdx === -1 ? 0 : currentIdx;

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 10px' }}>
            {/* Progress line */}
            <div style={{ position: 'absolute', top: 22, left: 30, right: 30, height: 3, background: '#1e293b', zIndex: 0 }}>
                <div style={{ width: `${(activeIdx / (STEPS.length - 1)) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #06b6d4, #10b981)', borderRadius: 4, transition: 'width 0.8s ease' }} />
            </div>

            {STEPS.map((step, i) => {
                const done = i <= activeIdx;
                const active = i === activeIdx;
                return (
                    <div key={step.key} style={{ textAlign: 'center', position: 'relative', zIndex: 1, flex: 1 }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: '50%', margin: '0 auto 8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                            background: done ? 'linear-gradient(135deg, #06b6d4, #10b981)' : '#1e293b',
                            border: active ? '3px solid #06b6d4' : '2px solid #334155',
                            boxShadow: active ? '0 0 15px rgba(6,182,212,0.4)' : 'none',
                            transition: 'all 0.5s ease',
                        }}>
                            {done ? step.icon : <Circle size={16} style={{ color: '#4b5563' }} />}
                        </div>
                        <p style={{ fontSize: '0.75rem', fontWeight: active ? 700 : 500, color: done ? '#ffffff' : '#64748b', marginBottom: 2 }}>{step.label}</p>
                        <p style={{ fontSize: '0.6rem', color: '#64748b', display: active ? 'block' : 'none' }}>{step.desc}</p>
                    </div>
                );
            })}
        </div>
    );
}

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
            <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 50, height: 50, border: '3px solid #1e293b', borderTop: '3px solid #06b6d4', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                    <p style={{ color: '#94a3b8' }}>Loading booking details...</p>
                </div>
            </div>
            <Footer />
        </>
    );

    if (!data || !data.booking) return (
        <>
            <Header />
            <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: '1rem' }}>🔍</div>
                    <h2 style={{ marginBottom: '0.5rem' }}>Booking Not Found</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>The booking ID you entered doesn&apos;t exist.</p>
                    <Link href="/track" className="btn btn-primary" style={{ textDecoration: 'none' }}>Try Again</Link>
                </div>
            </div>
            <Footer />
        </>
    );

    const { booking, history } = data;
    const statusStyle = STATUS_COLORS[booking.status] || STATUS_COLORS['New'];
    const isRejected = booking.status === 'Rejected';

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
                            <ArrowLeft size={16} /> Back
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => generateBookingPDF(booking, history)} title="Download PDF">
                                <Download size={14} /> PDF
                            </button>
                            <RealtimeNotifications bookingNumber={booking.booking_number} />
                        </div>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

                        {/* Status + ETA Card */}
                        <div className="glass-card" style={{ padding: '1.5rem 2rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 4 }}>Status</p>
                                    <span className="status-badge" style={{ background: statusStyle.bg, color: statusStyle.color, border: statusStyle.border, fontSize: '1rem', padding: '6px 18px' }}>
                                        {booking.status || 'New'}
                                    </span>
                                </div>
                                {!isRejected && (
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 4 }}>Estimated Arrival</p>
                                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#06b6d4' }}>
                                            {booking.status === 'Reached' ? 'Delivered ✅' :
                                                booking.status === 'Pickup' ? 'At Location 📍' :
                                                    booking.status === 'On the way' ? '5-10 min 🚑' : '10-15 min ⏱️'}
                                        </span>
                                    </div>
                                )}
                            </div>
                            {booking.remark && <p style={{ color: '#94a3b8', fontSize: '0.85rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>💬 {booking.remark}</p>}
                        </div>

                        {/* Step-by-step Timeline */}
                        {!isRejected && (
                            <div className="glass-card" style={{ padding: '1.5rem 1rem', marginBottom: '1.5rem' }}>
                                <StatusTimeline currentStatus={booking.status || 'New'} />
                            </div>
                        )}

                        {/* Map */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <TrackingMap booking={booking} />
                        </div>

                        {/* Details Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div className="glass-card" style={{ padding: '1.5rem' }}>
                                <h4 style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: 1 }}>Patient Info</h4>
                                <p style={{ marginBottom: '0.5rem' }}><User size={14} style={{ display: 'inline', marginRight: 6 }} />{booking.patient_name}</p>
                                <p style={{ marginBottom: '0.5rem' }}><User size={14} style={{ display: 'inline', marginRight: 6 }} />{booking.relative_name} (Relative)</p>
                                <p><Phone size={14} style={{ display: 'inline', marginRight: 6 }} /><a href={`tel:${booking.relative_phone}`} style={{ color: '#06b6d4' }}>{booking.relative_phone}</a></p>
                            </div>
                            <div className="glass-card" style={{ padding: '1.5rem' }}>
                                <h4 style={{ color: 'var(--accent-emerald)', fontSize: '0.8rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: 1 }}>Booking Info</h4>
                                <p style={{ marginBottom: '0.5rem' }}><Calendar size={14} style={{ display: 'inline', marginRight: 6 }} />{formatDate(booking.hiring_date)} at {booking.hiring_time}</p>
                                <p style={{ marginBottom: '0.5rem' }}><Truck size={14} style={{ display: 'inline', marginRight: 6 }} />{AMBULANCE_TYPES[booking.ambulance_type] || 'Standard'}</p>
                                <p><MapPin size={14} style={{ display: 'inline', marginRight: 6 }} />{booking.address}, {booking.city}</p>
                            </div>
                        </div>

                        {/* Driver Card */}
                        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderLeft: booking.driver_name ? '3px solid #10b981' : '3px solid #334155' }}>
                            <h4 style={{ color: booking.driver_name ? '#10b981' : '#64748b', fontSize: '0.8rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: 1 }}>🚑 Driver & Ambulance</h4>
                            {booking.driver_name ? (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                    <div><span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>Driver</span><b>{booking.driver_name}</b></div>
                                    <div><span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>Contact</span><b>{booking.driver_contact || '—'}</b></div>
                                    <div><span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>Reg No</span><b>{booking.ambulance_reg_no || '—'}</b></div>
                                </div>
                            ) : (
                                <p style={{ color: '#64748b' }}>Assigning driver shortly...</p>
                            )}
                        </div>

                        {/* History */}
                        {history && history.length > 0 && (
                            <div className="glass-card" style={{ padding: '1.5rem' }}>
                                <h4 style={{ color: 'var(--accent-purple)', fontSize: '0.8rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: 1 }}>📜 Activity Log</h4>
                                {history.map((h, i) => {
                                    const hStyle = STATUS_COLORS[h.status] || STATUS_COLORS['New'];
                                    return (
                                        <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: i < history.length - 1 ? '1rem' : 0, paddingBottom: i < history.length - 1 ? '1rem' : 0, borderBottom: i < history.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: hStyle.color, marginTop: 6, flexShrink: 0 }} />
                                            <div>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{h.status}</span>
                                                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{formatDateTime(h.created_at)}</span>
                                                </div>
                                                {h.remark && <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: 2 }}>{h.remark}</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                </div>
            </section>

            <Footer />
        </>
    );
}
