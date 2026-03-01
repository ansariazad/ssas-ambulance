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

const SERVICE_AREAS = [
    { name: 'Central Delhi', lat: 28.6139, lng: 77.2090, radius: 5000 },
    { name: 'South Delhi', lat: 28.5244, lng: 77.2066, radius: 6000 },
    { name: 'Noida', lat: 28.5355, lng: 77.3910, radius: 5000 },
    { name: 'Gurgaon', lat: 28.4595, lng: 77.0266, radius: 5500 },
    { name: 'Faridabad', lat: 28.4089, lng: 77.3178, radius: 4000 },
];

export default function ServiceAreaMapInner() {
    return (
        <div className="glass-card" style={{ overflow: 'hidden', borderRadius: 'var(--radius-lg)', height: 400 }}>
            <MapContainer center={[28.5839, 77.2090]} zoom={11} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />
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
