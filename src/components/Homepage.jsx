import React from 'react';
import '../styles/Homepage.css';

const Homepage = ({ setView, drops, setSelectedDrop }) => {

    const handleFind = (drop) => {
        setSelectedDrop(drop);
        setView('compass');
    };

    return (
        <div className="homepage-container">
            <header className="homepage-header">
                <h1>Drop-N-Seek</h1>
            </header>

            <main className="drops-list">
                {drops.length > 0 ? (
                    drops.map(drop => (
                        <div key={drop.id} className="drop-item">
                            <div className="drop-info">
                                {/* --- DISPLAY the dynamic drop name --- */}
                                <h2>{drop.name}</h2>
                                <p>author: {drop.author}</p>
                                <span>{drop.password ? 'Locked' : 'Unlocked'}</span>
                            </div>
                            <button onClick={() => handleFind(drop)} className="find-button">
                                Find
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="no-drops-message">No drops found within 1km. Be the first to leave one!</p>
                )}
            </main>

            <footer className="homepage-footer">
                <button onClick={() => setView('drop')} className="drop-button">
                    Drop
                </button>
            </footer>
        </div>
    );
};

export default Homepage;