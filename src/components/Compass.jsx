import React, { useState, useEffect } from 'react';
import '../styles/Compass.css';

// We only need the distance calculation now
const getDistance = (lat1, lon1, lat2, lon2) => {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return Infinity;
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180; const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180; const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const Compass = ({ setView, drop, userLocation }) => {
    // We'll manage a local copy of the user's location for the "Retrack" functionality
    const [currentTrackedLocation, setCurrentTrackedLocation] = useState(userLocation);

    const distance = getDistance(currentTrackedLocation.lat, currentTrackedLocation.lon, drop.lat, drop.lon);
    const OPEN_DISTANCE = 15; // User must be within 5 meters to open
    const canOpen = distance <= OPEN_DISTANCE;

    // --- The Core Radar Logic ---
    // This calculates the position of the drop dot relative to the user in the center.
    const getDropPosition = () => {
        if (canOpen) {
            // Snap to center when close
            return { top: '50%', left: '50%' };
        }

        // Calculate the difference in latitude and longitude
        // Latitude difference maps to Y-axis, Longitude to X-axis
        const latDiff = drop.lat - currentTrackedLocation.lat;
        const lonDiff = drop.lon - currentTrackedLocation.lon;

        // A simple scaling factor. This value determines how far the dot moves.
        // You can adjust this to make the dot more or less sensitive.
        // This scale roughly maps 1km to the edge of the circle.
        const scale = 50000; 

        // Calculate pixel offsets, clamping them to stay within the radar circle
        let xOffset = lonDiff * scale;
        let yOffset = -latDiff * scale; // Negative because screen Y is inverted from latitude

        const maxOffset = 45; // Represents 45% from the center (to stay inside the 50% radius)
        xOffset = Math.max(-maxOffset, Math.min(maxOffset, xOffset));
        yOffset = Math.max(-maxOffset, Math.min(maxOffset, yOffset));

        return {
            top: `calc(50% + ${yOffset}%)`,
            left: `calc(50% + ${xOffset}%)`
        };
    };

    const handleRetrack = () => {
        // When retracking, we update our local state with the latest global location from App.jsx
        setCurrentTrackedLocation(userLocation);
    };

    const handleOpen = () => setView(drop.password ? 'password' : 'message');

    const dropDotStyle = getDropPosition();

    return (
        <div className="radar-page">
            <header className="radar-header">
                <button onClick={() => setView('homepage')} className="back-button">&larr;</button>
                <div className="distance-display">Distance: {Math.round(distance)}m</div>
            </header>

            <main className="radar-container">
                <div className="radar-circle">
                    {/* The User's Dot (always in the center) */}
                    <div className="user-dot"></div>
                    {/* The Drop's Dot (position is calculated dynamically) */}
                    <div className="drop-dot" style={dropDotStyle}></div>
                </div>
            </main>

            <footer className="radar-footer">
                {canOpen ? (
                    <button onClick={handleOpen} className="open-drop-button">Open the Drop</button>
                ) : (
                    <button onClick={handleRetrack} className="retrack-button">Retrack</button>
                )}
            </footer>
        </div>
    );
};

export default Compass;