'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AMBULANCE_TYPES, STATUS_COLORS, formatDate } from '@/lib/utils';

export default function TrackPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [searching, setSearching] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        setSearching(true);
        try {
            const res = await fetch(`/api/bookings/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            setResults(data);
        } catch {
            setResults([]);
        }
        setSearching(false);
    };

    return (
        <>
            <Header />
            <div className="page-header">
                <h1>Track Your Ambulance</h1>
                <div className="breadcrumb">
                    <Link href="/">Home</Link> <span>/</span> <span>Track</span>
                </div>
            </div>

            <section className="section">
                <div className="container">
                    <motion.div className="glass-card search-box" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Search Your Booking</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                            Enter your booking number, patient name, or phone number
                        </p>
                        <form onSubmit={handleSearch}>
                            <div className="search-input-wrap">
                                <input className="input-field" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. 292564626 or John Doe" required />
                                <button type="submit" className="btn btn-primary" disabled={searching}>
                                    <Search size={18} /> {searching ? 'Searching...' : 'Search'}
                                </button>
                            </div>
                        </form>
                    </motion.div>

                    {results !== null && (
                        <div className="tracking-results">
                            {results.length === 0 ? (
                                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--text-muted)' }}>No bookings found for &quot;{query}&quot;</p>
                                </div>
                            ) : (
                                results.map((b, i) => {
                                    const statusStyle = STATUS_COLORS[b.status] || STATUS_COLORS['New'];
                                    return (
                                        <motion.div key={b.id} className="glass-card booking-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                            <div className="booking-info">
                                                <h4>Booking #</h4>
                                                <p style={{ color: 'var(--accent-cyan)' }}>{b.booking_number}</p>
                                            </div>
                                            <div className="booking-info">
                                                <h4>Patient</h4>
                                                <p>{b.patient_name}</p>
                                            </div>
                                            <div className="booking-info">
                                                <h4>Date</h4>
                                                <p>{formatDate(b.hiring_date)}</p>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <span className="status-badge" style={{ background: statusStyle.bg, color: statusStyle.color, border: statusStyle.border }}>
                                                    {b.status || 'New'}
                                                </span>
                                                <Link href={`/track/${b.id}`} className="btn btn-primary btn-sm">View</Link>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </>
    );
}
