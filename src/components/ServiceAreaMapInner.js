'use client';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const baseIcon = new L.DivIcon({
    className: 'custom-marker',
    html: `<div style="background:#06b6d4;width:20px;height:20px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

const officeIcon = new L.DivIcon({
    className: 'custom-marker',
    html: `<div style="background:#dc2626;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;font-size:12px;">🏥</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

const SERVICE_AREAS = [
    { name: 'Mumbai Central', lat: 18.9388, lng: 72.8354, radius: 5000 },
    { name: 'Andheri', lat: 19.1136, lng: 72.8697, radius: 5500 },
    { name: 'Bandra', lat: 19.0544, lng: 72.8406, radius: 4000 },
    { name: 'Thane', lat: 19.2183, lng: 72.9781, radius: 6000 },
    { name: 'Navi Mumbai', lat: 19.0330, lng: 73.0297, radius: 7000 },
    { name: 'Borivali', lat: 19.2288, lng: 72.8544, radius: 4500 },
    { name: 'Dadar', lat: 19.0176, lng: 72.8562, radius: 3500 },
    { name: 'Powai', lat: 19.1176, lng: 72.9060, radius: 4000 },
    { name: 'Malad', lat: 19.1874, lng: 72.8484, radius: 4000 },
    { name: 'Chembur', lat: 19.0522, lng: 72.8994, radius: 4000 },
    { name: 'Vashi', lat: 19.0771, lng: 72.9987, radius: 5000 },
    { name: 'Goregaon', lat: 19.1663, lng: 72.8526, radius: 4000 },
];

export default function ServiceAreaMapInner() {
    return (
        <div className="glass-card" style={{ overflow: 'hidden', borderRadius: 'var(--radius-lg)', height: 450 }}>
            <MapContainer center={[19.0760, 72.8777]} zoom={11} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />
                {/* Main Office */}
                <Marker position={[19.0760, 72.8777]} icon={officeIcon}>
                    <Popup><b>🏥 SSAS Head Office</b><br />Mumbai Central, Maharashtra</Popup>
                </Marker>
                {SERVICE_AREAS.map((area, i) => (
                    <div key={i}>
                        <Circle
                            center={[area.lat, area.lng]}
                            radius={area.radius}
                            pathOptions={{
                                color: '#06b6d4',
                                fillColor: '#06b6d4',
                                fillOpacity: 0.1,
                                weight: 1,
                            }}
                        />
                        <Marker position={[area.lat, area.lng]} icon={baseIcon}>
                            <Popup>
                                <b>📍 {area.name}</b><br />
                                Coverage: {(area.radius / 1000).toFixed(1)} km
                            </Popup>
                        </Marker>
                    </div>
                ))}
            </MapContainer>
        </div>
    );
}
