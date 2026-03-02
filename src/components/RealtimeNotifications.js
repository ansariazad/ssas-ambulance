'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, X, CheckCircle, Truck, Clock, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const statusIcons = {
    'Assigned': <AlertTriangle size={16} />,
    'On the way': <Truck size={16} />,
    'Pickup': <Clock size={16} />,
    'Reached': <CheckCircle size={16} />,
};

export default function RealtimeNotifications({ bookingNumber }) {
    const [notifications, setNotifications] = useState([]);
    const [showPanel, setShowPanel] = useState(false);
    const [unread, setUnread] = useState(0);
    const [loaded, setLoaded] = useState(false);

    // Fetch existing tracking history on mount
    useEffect(() => {
        if (!bookingNumber) return;

        async function fetchExisting() {
            try {
                const { data, error } = await supabase
                    .from('tracking_history')
                    .select('*')
                    .eq('booking_number', bookingNumber)
                    .order('created_at', { ascending: false });

                if (!error && data && data.length > 0) {
                    const existing = data.map(item => ({
                        id: item.id,
                        status: item.status,
                        remark: item.remark,
                        time: new Date(item.created_at).toLocaleTimeString(),
                    }));
                    setNotifications(existing);
                    setUnread(existing.length);
                }
            } catch (err) {
                console.error('Failed to fetch tracking history:', err);
            }
            setLoaded(true);
        }

        fetchExisting();
    }, [bookingNumber]);

    // Subscribe to real-time changes
    useEffect(() => {
        if (!bookingNumber) return;

        const channel = supabase
            .channel(`tracking-${bookingNumber}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'tracking_history',
                filter: `booking_number=eq.${bookingNumber}`,
            }, (payload) => {
                const newUpdate = payload.new;
                setNotifications(prev => [{
                    id: newUpdate.id,
                    status: newUpdate.status,
                    remark: newUpdate.remark,
                    time: new Date().toLocaleTimeString(),
                }, ...prev]);
                setUnread(prev => prev + 1);

                // Browser notification
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('SSAS Ambulance Update', {
                        body: `Status: ${newUpdate.status} — ${newUpdate.remark}`,
                        icon: '/favicon.ico',
                    });
                }
            })
            .subscribe();

        // Request browser notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        return () => { supabase.removeChannel(channel); };
    }, [bookingNumber]);

    return (
        <>
            {/* Bell Icon */}
            <button
                className="btn btn-secondary btn-sm"
                onClick={() => { setShowPanel(!showPanel); setUnread(0); }}
                style={{ position: 'relative' }}
            >
                <Bell size={16} />
                {unread > 0 && (
                    <span style={{
                        position: 'absolute', top: -4, right: -4, width: 18, height: 18,
                        background: '#ef4444', borderRadius: '50%', fontSize: '0.7rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                    }}>{unread}</span>
                )}
            </button>

            {/* Panel */}
            <AnimatePresence>
                {showPanel && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="glass-card"
                        style={{
                            position: 'absolute', top: '100%', right: 0, marginTop: 8,
                            width: 320, maxHeight: 400, overflowY: 'auto', padding: '1rem', zIndex: 100,
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Live Updates</h4>
                            <button onClick={() => setShowPanel(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={14} />
                            </button>
                        </div>
                        {notifications.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
                                {loaded ? 'No updates yet for this booking.' : 'Loading updates...'}
                            </p>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} style={{
                                    padding: '0.75rem', borderLeft: '3px solid var(--accent-cyan)',
                                    background: 'var(--bg-glass)', borderRadius: '0 8px 8px 0', marginBottom: '0.5rem',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                        {statusIcons[n.status] || <Bell size={14} />}
                                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{n.status}</span>
                                        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{n.time}</span>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{n.remark}</p>
                                </div>
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
