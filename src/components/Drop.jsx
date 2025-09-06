import React, { useState } from 'react';
import '../styles/Drop.css';

const Drop = ({ setView, handleAddDrop }) => {
    const [message, setMessage] = useState('');
    const [author, setAuthor] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message) {
            alert("Message cannot be empty.");
            return;
        }
        const dropData = {
            message,
            author: isAnonymous ? 'Anonymous' : (author || 'Anonymous'),
            password
        };
        handleAddDrop(dropData);
    };

    const handleAnonymousChange = (e) => {
        const checked = e.target.checked;
        setIsAnonymous(checked);
        if (checked) {
            setAuthor('');
        }
    };

    return (
        <div className="drop-container">
            <form onSubmit={handleSubmit} className="drop-form">
                <label>Message:</label>
                <textarea 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Message..."
                    required 
                />
                <label>Author name</label>
                <input 
                    type="text" 
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    disabled={isAnonymous}
                />
                <label className="checkbox-label">
                    <input 
                        type="checkbox" 
                        checked={isAnonymous}
                        onChange={handleAnonymousChange}
                    />
                    anonymous
                </label>
                <label>Password(optional):</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {/* --- MODIFICATION START --- */}
                {/* Grouping the buttons together in a footer div */}
                <div className="form-footer">
                    <button type="button" onClick={() => setView('homepage')} className="back-button">Back</button>
                    <button type="submit" className="submit-drop-button">Drop</button>
                </div>
                {/* --- MODIFICATION END --- */}
            </form>
        </div>
    );
};

export default Drop;