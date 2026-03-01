'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons for Next.js
const createIcon = (color) => new L.DivIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

const pickupIcon = createIcon('#06b6d4');
const hospitalIcon = createIcon('#10b981');
const ambulanceIcon = createIcon('#f59e0b');

export default function TrackingMap({ booking }) {
    if (!booking) return null;

    const pickupLat = booking.pickup_lat || 28.6139;
    const pickupLng = booking.pickup_lng || 77.2090;
    const hospitalLat = booking.hospital_lat || 28.6280;
    const hospitalLng = booking.hospital_lng || 77.2196;
    const center = [(pickupLat + hospitalLat) / 2, (pickupLng + hospitalLng) / 2];

    // Simulate ambulance position based on status
    let ambulanceLat, ambulanceLng;
    const statusProgress = {
        'Assigned': 0,
        'On the way': 0.3,
        'Pickup': 0.6,
        'Reached': 1,
    };
    const progress = statusProgress[booking.status] ?? 0.5;
    ambulanceLat = pickupLat + (hospitalLat - pickupLat) * progress;
    ambulanceLng = pickupLng + (hospitalLng - pickupLng) * progress;

    return (
        <div className="glass-card" style={{ overflow: 'hidden', borderRadius: 'var(--radius-lg)', height: 350 }}>
            <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />
                <Marker position={[pickupLat, pickupLng]} icon={pickupIcon}>
                    <Popup><b>📍 Pickup:</b> {booking.address}, {booking.city}</Popup>
                </Marker>
                <Marker position={[hospitalLat, hospitalLng]} icon={hospitalIcon}>
                    <Popup><b>🏥 Hospital</b></Popup>
                </Marker>
                {booking.status && booking.status !== 'New' && booking.status !== 'Rejected' && (
                    <Marker position={[ambulanceLat, ambulanceLng]} icon={ambulanceIcon}>
                        <Popup><b>🚑 Ambulance</b><br />Status: {booking.status}</Popup>
                    </Marker>
                )}
                <Polyline positions={[[pickupLat, pickupLng], [hospitalLat, hospitalLng]]} color="#06b6d4" weight={2} dashArray="8" opacity={0.5} />
            </MapContainer>
        </div>
    );
}
