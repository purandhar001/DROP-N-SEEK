import React, { useState } from 'react';
import '../styles/Password.css'; // We will create and style this file in Phase 3

const Password = ({ setView, drop }) => {
    // State to hold the user's input in the password field
    const [input, setInput] = useState('');
    // State to hold any potential error message
    const [error, setError] = useState('');

    /**
     * This function is triggered when the "Continue" button is clicked.
     * It checks the user's input against the correct password stored in the drop object.
     */
    const handleContinue = () => {
        // Check if the input matches the drop's password
        if (input === drop.password) {
            // If correct, navigate to the 'message' view to read the content
            setView('message');
        } else {
            // If incorrect, set an error message and clear the input field for another try
            setError('Incorrect password.');
            setInput('');
        }
    };

    return (
        <div className="password-container">
            <label>Password:</label>

            {/* The main section containing the password input field */}
            <main className="password-form">
                <input
                    type="password"
                    value={input}
                    // Update state on every change and clear any previous error
                    onChange={(e) => { setInput(e.target.value); setError(''); }}
                    placeholder="Password..."
                />
                {/* Conditionally render the error message if it exists */}
                {error && <p className="error-message">{error}</p>}
            </main>

            {/* Footer with navigation buttons */}
            <footer className="password-footer">
                <button onClick={() => setView('compass')} className="back-button">Back</button>
                <button onClick={handleContinue} className="continue-button">Continue</button>
            </footer>
        </div>
    );
};

export default Password;