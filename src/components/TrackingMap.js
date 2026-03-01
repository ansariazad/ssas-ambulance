'use client';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Main Office Location (SSAS Headquarters)
const MAIN_OFFICE = { lat: 28.6139, lng: 77.2090, name: 'SSAS Main Office' };

// Custom marker icons
function makeIcon(color, emoji) {
    return new L.DivIcon({
        className: 'custom-marker',
        html: `<div style="background:${color};width:30px;height:30px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:14px;">${emoji}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
    });
}

const officeIcon = makeIcon('#8b5cf6', '🏢');
const pickupIcon = makeIcon('#06b6d4', '📍');
const hospitalIcon = makeIcon('#10b981', '🏥');
const ambulanceIcon = makeIcon('#f59e0b', '🚑');

export default function TrackingMap({ booking }) {
    if (!booking) return null;

    const pickupLat = booking.pickup_lat || 28.58;
    const pickupLng = booking.pickup_lng || 77.20;
    const hospitalLat = booking.hospital_lat || pickupLat + 0.02;
    const hospitalLng = booking.hospital_lng || pickupLng + 0.015;

    // Ambulance position based on status
    let ambLat, ambLng;
    const status = booking.status || 'New';
    if (status === 'New' || status === 'Assigned') {
        ambLat = MAIN_OFFICE.lat; ambLng = MAIN_OFFICE.lng;
    } else if (status === 'On the way') {
        ambLat = (MAIN_OFFICE.lat + pickupLat) / 2;
        ambLng = (MAIN_OFFICE.lng + pickupLng) / 2;
    } else if (status === 'Pickup') {
        ambLat = pickupLat; ambLng = pickupLng;
    } else {
        ambLat = hospitalLat; ambLng = hospitalLng;
    }

    const center = [pickupLat, pickupLng];

    // Route line
    const routePoints = [
        [MAIN_OFFICE.lat, MAIN_OFFICE.lng],
        [pickupLat, pickupLng],
        [hospitalLat, hospitalLng],
    ];

    return (
        <div className="glass-card" style={{ overflow: 'hidden', borderRadius: 'var(--radius-lg)', height: 400 }}>
            <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />

                {/* Route line */}
                <Polyline positions={routePoints} pathOptions={{ color: '#06b6d4', weight: 2, dashArray: '8,8', opacity: 0.6 }} />

                {/* Main Office */}
                <Marker position={[MAIN_OFFICE.lat, MAIN_OFFICE.lng]} icon={officeIcon}>
                    <Popup><b>🏢 {MAIN_OFFICE.name}</b><br />Headquarters</Popup>
                </Marker>

                {/* Pickup Location */}
                <Marker position={[pickupLat, pickupLng]} icon={pickupIcon}>
                    <Popup><b>📍 Pickup</b><br />{booking.address}, {booking.city}</Popup>
                </Marker>

                {/* Hospital */}
                <Marker position={[hospitalLat, hospitalLng]} icon={hospitalIcon}>
                    <Popup><b>🏥 Nearest Hospital</b></Popup>
                </Marker>

                {/* Ambulance */}
                <Marker position={[ambLat, ambLng]} icon={ambulanceIcon}>
                    <Popup>
                        <b>🚑 Ambulance</b><br />
                        {booking.driver_name || 'Driver'}<br />
                        {booking.ambulance_reg_no || 'Not assigned'}<br />
                        Status: {status}
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}
