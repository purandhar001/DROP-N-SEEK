import React from 'react';
import '../styles/Homepage.css'; // We will create and style this file in Phase 3

const Homepage = ({ setView, drops, setSelectedDrop }) => {

    /**
     * This function is called when a user clicks the "Find" button on a drop.
     * It updates the App's state to select the target drop and then
     * switches the view to the 'compass' component.
     * @param {object} drop - The full data object for the selected drop.
     */
    const handleFind = (drop) => {
        setSelectedDrop(drop);
        setView('compass');
    };

    return (
        <div className="homepage-container">
            {/* The main title of the application */}
            <header className="homepage-header">
                <h1>Drop-N-Seek</h1>
            </header>

            {/* This section will list all the nearby drops */}
            <main className="drops-list">
                {drops.length > 0 ? (
                    // If there are drops, map over them and create a list item for each one.
                    drops.map(drop => (
                        <div key={drop.id} className="drop-item">
                            <div className="drop-info">
                                <h2>drop name</h2>
                                <p>author name/{drop.author}</p>
                                <span>{drop.password ? 'Locked' : 'Unlocked'}</span>
                            </div>
                            <button onClick={() => handleFind(drop)} className="find-button">
                                Find
                            </button>
                        </div>
                    ))
                ) : (
                    // If the drops array is empty, display a message encouraging the user to create one.
                    <p className="no-drops-message">No drops found within 1km. Be the first to leave one!</p>
                )}
            </main>

            {/* The footer contains the primary action button to create a new drop */}
            <footer className="homepage-footer">
                <button onClick={() => setView('drop')} className="drop-button">
                    Drop
                </button>
            </footer>
        </div>
    );
};

export default Homepage;