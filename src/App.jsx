import React, { useState, useEffect, useCallback } from 'react';

// --- Firebase Imports ---
// These connect your app to your Firebase backend.
import { auth, db } from './firebaseConfig';
import { collection, getDocs, doc, deleteDoc, addDoc, serverTimestamp, GeoPoint } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// --- Component Imports ---
// These are all the different "pages" of your app.
import Homepage from './components/Homepage';
import Drop from './components/Drop';
import Compass from './components/Compass';
import Password from './components/Password';
import Message from './components/Message';

// --- Helper Function ---
// Calculates the distance between two GPS coordinates in meters.
const getDistance = (lat1, lon1, lat2, lon2) => {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return Infinity;
    const R = 6371e3; // Earth's radius in metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};


function App() {
    // --- STATE MANAGEMENT ---
    const [view, setView] = useState('homepage'); // Controls which component/view is currently active
    const [drops, setDrops] = useState([]); // Stores all drops fetched from Firebase
    const [selectedDrop, setSelectedDrop] = useState(null); // The specific drop the user wants to find
    const [userLocation, setUserLocation] = useState({ lat: null, lon: null }); // User's live GPS coordinates
    const [isLoading, setIsLoading] = useState(true); // Used to show a loading screen on startup
    const [authReady, setAuthReady] = useState(false); // Tracks if anonymous sign-in is complete

    // --- FIREBASE COLLECTION REFERENCE ---
    const dropsCollectionRef = collection(db, "drops");

    // --- EFFECT: AUTHENTICATION & INITIAL DATA FETCH ---
    useEffect(() => {
        // This runs once when the app starts. It signs the user in anonymously
        // for security and then fetches the initial list of all drops.
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setAuthReady(true);
                const dropsSnapshot = await getDocs(dropsCollectionRef);
                const dropsList = dropsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        ...data,
                        id: doc.id,
                        lat: data.location?.latitude, // Safely access nested GeoPoint data
                        lon: data.location?.longitude
                    };
                });
                setDrops(dropsList);
            } else {
                signInAnonymously(auth).catch(error => console.error("Anonymous sign-in failed:", error));
            }
        });
        return () => unsubscribe(); // Cleanup listener on component unmount
    }, []);

    // --- EFFECT: GEOLOCATION TRACKING ---
    useEffect(() => {
        if (!navigator.geolocation) {
            console.error("Geolocation is not supported by this browser.");
            setIsLoading(false);
            return;
        }
        // Starts watching the user's position
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                // Success: update location state and turn off loading screen
                setUserLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                });
                setIsLoading(false);
            },
            (error) => {
                console.error("Geolocation error:", error);
                if (userLocation.lat === null) {
                    alert("Location access is required to find nearby drops. Please enable it in your browser settings.");
                }
                setIsLoading(false);
            },
            { enableHighAccuracy: true } // Request the most accurate location possible
        );
        // Cleanup function to stop watching when the component unmounts
        return () => navigator.geolocation.clearWatch(watchId);
    }, [userLocation.lat]);


    // --- CALLBACK: ADD A NEW DROP ---
    const handleAddDrop = useCallback(async (newDropData) => {
        if (!userLocation.lat || !authReady) {
            alert("Cannot add drop: Location not available or not signed in.");
            return;
        }
        const { message, author, password } = newDropData;
        
        const docRef = await addDoc(dropsCollectionRef, {
            message,
            author,
            password: password || null,
            location: new GeoPoint(userLocation.lat, userLocation.lon),
            createdAt: serverTimestamp() // For the 24-hour cleanup cron job
        });
        
        setDrops(prev => [...prev, {...newDropData, id: docRef.id, lat: userLocation.lat, lon: userLocation.lon}]);
        setView('homepage');

    }, [userLocation, authReady]);

    // --- CALLBACK: DELETE A DROP ---
    const handleDeleteDrop = useCallback(async (dropId) => {
        if (!dropId || !authReady) return;
        
        await deleteDoc(doc(db, "drops", dropId));
        setDrops(prevDrops => prevDrops.filter(drop => drop.id !== dropId));
        
    }, [authReady]);


    // --- ROUTING / VIEW RENDERING LOGIC ---
    const renderView = () => {
        // Show a loading screen until we have the user's location
        if (isLoading || userLocation.lat === null) {
            return (
                <div className="loading-container">
                    <h1>Drop-N-Seek</h1>
                    <p>Finding your location and nearby drops...</p>
                </div>
            );
        }

        // Switch statement to render the correct component based on the 'view' state
        switch (view) {
            case 'drop':
                return <Drop setView={setView} handleAddDrop={handleAddDrop} />;
            case 'compass':
                return <Compass setView={setView} drop={selectedDrop} userLocation={userLocation} />;
            case 'password':
                return <Password setView={setView} drop={selectedDrop} />;
            case 'message':
                return <Message setView={setView} drop={selectedDrop} handleDeleteDrop={handleDeleteDrop} />;
            case 'homepage':
            default:
                // For the homepage, first filter and sort drops to find those within 1km
                const nearbyDrops = drops
                    .map(drop => ({
                        ...drop,
                        distance: getDistance(userLocation.lat, userLocation.lon, drop.lat, drop.lon)
                    }))
                    .filter(drop => drop.distance <= 1000) // 1km radius
                    .sort((a, b) => a.distance - b.distance); // Show closest first

                return <Homepage setView={setView} drops={nearbyDrops} setSelectedDrop={setSelectedDrop} />;
        }
    };

    return (
        <div className="app-container">
            {renderView()}
        </div>
    );
}

export default App;