import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet'; // Import Leaflet library itself for custom icons
import '../styles/Compass.css';

// --- Custom Icon for the User's Location (Standard Blue) ---
const userIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41]
});

// --- Custom Icon for the Drop's Location (Red to match your theme) ---
const dropIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41]
});

// Helper function to calculate distance
const getDistance = (lat1, lon1, lat2, lon2) => {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return Infinity;
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180; const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180; const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// A helper component that automatically centers and zooms the map
const MapUpdater = ({ userPos, dropPos }) => {
    const map = useMap();
    useEffect(() => {
        if (userPos && dropPos) {
            const bounds = L.latLngBounds([userPos, dropPos]);
            map.fitBounds(bounds, { padding: [50, 50] }); // Fit both markers in view
        }
    }, [userPos, dropPos, map]);
    return null;
};


const Compass = ({ setView, drop, userLocation }) => {
    // We use the live userLocation prop directly
    const distance = getDistance(userLocation.lat, userLocation.lon, drop.lat, drop.lon);
    const OPEN_DISTANCE = 15; // Realistic open distance for GPS
    const canOpen = distance <= OPEN_DISTANCE;

    const userPosition = [userLocation.lat, userLocation.lon];
    const dropPosition = [drop.lat, drop.lon];

    const handleOpen = () => setView(drop.password ? 'password' : 'message');

    return (
        <div className="compass-page">
            <header className="compass-header">
                <button onClick={() => setView('homepage')} className="back-button">&larr;</button>
                <div className="distance-display">Distance: {Math.round(distance)}m</div>
            </header>

            {/* The Map Container takes up the full screen */}
            <MapContainer center={userPosition} zoom={16} scrollWheelZoom={true} className="map-container">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Marker for the User */}
                <Marker position={userPosition} icon={userIcon}>
                    <Popup>You are here</Popup>
                </Marker>

                {/* Marker for the Drop */}
                <Marker position={dropPosition} icon={dropIcon}>
                    <Popup>The drop is here</Popup>
                </Marker>

                <MapUpdater userPos={userPosition} dropPos={dropPosition} />
            </MapContainer>

            {/* The "Open" button appears at the bottom when close enough */}
            {canOpen && (
                <footer className="map-footer">
                    <button onClick={handleOpen} className="open-drop-btn">
                        Open the Drop
                    </button>
                </footer>
            )}
        </div>
    );
};

export default Compass;