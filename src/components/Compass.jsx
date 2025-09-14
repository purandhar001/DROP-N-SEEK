import React, { useState, useEffect, useRef } from 'react';
import '../styles/Compass.css';

// Helper function to calculate the distance between two GPS coordinates
const getDistance = (lat1, lon1, lat2, lon2) => {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return Infinity;
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180; const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180; const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Helper function to calculate the bearing (compass direction) from user to drop
const getBearing = (lat1, lon1, lat2, lon2) => {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0;
    const φ1 = lat1 * Math.PI / 180; const φ2 = lat2 * Math.PI / 180;
    const λ1 = lon1 * Math.PI / 180; const λ2 = lon2 * Math.PI / 180;
    const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
    const θ = Math.atan2(y, x);
    return (θ * 180 / Math.PI + 360) % 360; // Convert to degrees
};


const Compass = ({ setView, drop, userLocation }) => {
    const [currentTrackedLocation, setCurrentTrackedLocation] = useState(userLocation);
    // --- NEW: State for device orientation ---
    const [orientation, setOrientation] = useState(0);
    const radarCircleRef = useRef(null); // Ref for rotating the entire radar

    const distance = getDistance(currentTrackedLocation.lat, currentTrackedLocation.lon, drop.lat, drop.lon);
    const OPEN_DISTANCE = 15;
    const canOpen = distance <= OPEN_DISTANCE;

    // --- EFFECT: Listen for device orientation ---
    useEffect(() => {
        const handleOrientation = (event) => {
            const heading = event.webkitCompassHeading || (360 - event.alpha);
            setOrientation(heading);
        };

        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                    }
                })
                .catch(console.error);
        } else {
            window.addEventListener('deviceorientation', handleOrientation);
        }

        return () => window.removeEventListener('deviceorientation', handleOrientation);
    }, []);

    // --- EFFECT: Rotate the radar circle ---
    useEffect(() => {
        if (radarCircleRef.current) {
            // We rotate the circle opposite to the device heading.
            // This makes it so that 0° (North) is always at the top of the screen.
            radarCircleRef.current.style.transform = `rotate(${-orientation}deg)`;
        }
    }, [orientation]);


    // --- The Core Radar Logic (Updated) ---
    const getDropPosition = () => {
        if (canOpen) {
            return { top: '50%', left: '50%' };
        }

        const bearing = getBearing(currentTrackedLocation.lat, currentTrackedLocation.lon, drop.lat, drop.lon);
        // Scale the distance to fit within the radar. Max distance (1km) should be at the edge.
        const distanceScale = Math.min(distance / 1000, 1); // Clamp distance between 0 and 1 (for 1km)
        
        // Convert bearing and distance to x, y coordinates
        const angleRad = (bearing * Math.PI) / 180;
        const xOffset = distanceScale * 45 * Math.sin(angleRad); // 45 is the maxOffset
        const yOffset = -distanceScale * 45 * Math.cos(angleRad);

        return {
            top: `calc(50% + ${yOffset}%)`,
            left: `calc(50% + ${xOffset}%)`
        };
    };

    const handleRetrack = () => {
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
                {/* The radar circle now has a ref and an inner div for content */}
                <div className="radar-circle" ref={radarCircleRef}>
                    <div className="radar-content">
                        <div className="user-dot"></div>
                        <div className="drop-dot" style={dropDotStyle}></div>
                    </div>
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