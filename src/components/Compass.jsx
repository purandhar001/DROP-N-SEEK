import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import '../styles/Compass.css';

// --- Helper functions (getDistance, getBearing) remain the same ---
const getDistance = (lat1, lon1, lat2, lon2) => {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return Infinity;
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180; const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180; const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const getBearing = (lat1, lon1, lat2, lon2) => {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0;
    const φ1 = lat1 * Math.PI / 180; const φ2 = lat2 * Math.PI / 180;
    const λ1 = lon1 * Math.PI / 180; const λ2 = lon2 * Math.PI / 180;
    const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
    const θ = Math.atan2(y, x);
    return (θ * 180 / Math.PI + 360) % 360;
};


const Compass = ({ setView, drop, userLocation }) => {
    const [orientation, setOrientation] = useState(0);
    const needleRef = useRef(null);
    const progressBarRef = useRef(null);

    const distance = getDistance(userLocation.lat, userLocation.lon, drop.lat, drop.lon);
    const bearing = getBearing(userLocation.lat, userLocation.lon, drop.lat, drop.lon);
    
    const OPEN_DISTANCE = 1;

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
    
    useEffect(() => {
        // --- FIX STARTS HERE ---
        // Only run animations if the refs are attached to an element.
        // The '.current' property holds the actual DOM element.
        if (needleRef.current) {
            gsap.to(needleRef.current, { 
                rotation: (bearing - orientation),
                duration: 0.3,
                ease: 'linear' 
            });
        }
        
        if (progressBarRef.current) {
            const START_DISTANCE = Math.min(200, drop.distance > 1 ? drop.distance : 200);
            const circumference = 2 * Math.PI * 90;
            const progress = Math.max(0, 1 - ((distance - OPEN_DISTANCE) / (START_DISTANCE - OPEN_DISTANCE)));
            const strokeOffset = circumference * (1 - progress);
            
            gsap.to(progressBarRef.current, { 
                strokeDashoffset: strokeOffset,
                duration: 0.3, 
                ease: 'linear' 
            });
        }
        // --- FIX ENDS HERE ---

    }, [orientation, distance, bearing, drop.distance]);

    const handleOpen = () => setView(drop.password ? 'password' : 'message');
    const canOpen = distance <= OPEN_DISTANCE;

    return (
        <div className="compass-page">
            <header className="compass-header">
                <button onClick={() => setView('homepage')} className="back-button">&larr;</button>
                <div className="distance-display">Distance: {Math.round(distance)}m</div>
            </header>
            <main className="compass-container">
                <svg className="compass-svg" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="90" className="compass-bg" fill="#D90A09" />
                    <circle ref={progressBarRef} cx="100" cy="100" r="90" className="compass-progress" strokeDasharray={2 * Math.PI * 90} fill="none" stroke="#092A3E" strokeWidth="10" />
                    <circle cx="100" cy="100" r="75" className="compass-center" fill="#D90A09" />
                </svg>
                <div className="compass-overlay">
                    {canOpen ? (
                        <button onClick={handleOpen} className="open-drop-btn">Open the Drop</button>
                    ) : (
                        <div ref={needleRef} className="needle-container">
                            <div className="needle"></div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Compass;