import React, { useEffect, useState } from 'react'; // Import useState for copy feedback
import '../styles/Message.css';

const Message = ({ setView, drop, handleDeleteDrop }) => {
    // State to provide feedback to the user when they copy the message
    const [copied, setCopied] = useState(false);
    
    // Self-destruct feature: runs once when the component renders
    useEffect(() => {
        if (drop?.id) {
            handleDeleteDrop(drop.id);
        }
    }, [drop, handleDeleteDrop]);

    // Function to handle copying the message text to the clipboard
    const handleCopy = () => {
        if (drop?.message) {
            // Use the older execCommand for better compatibility in all environments
            const textArea = document.createElement("textarea");
            textArea.value = drop.message;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);

            // Show "Copied!" feedback for 2 seconds
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Fallback view if the drop doesn't exist
    if (!drop) {
        return (
            <div className="message-container">
                <p>Drop not found or has been deleted.</p>
                <button onClick={() => setView('homepage')} className="back-button">Back to Home</button>
            </div>
        )
    }

    // Main view for displaying the message
    return (
        <div className="message-container">
            <main className="message-box">
                <p className="message-text">"{drop.message}"</p>
                <p className="author-label">Author</p>
                <p className="author-name">{drop.author}</p>
            </main>
            <footer className="message-footer">
                <button onClick={handleCopy} className="copy-button" title="Copy Message">
                    {/* Display "Copied!" text or the SVG icon */}
                    {copied ? (
                        <span className="copied-feedback">Copied!</span>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    )}
                </button>
                <button onClick={() => setView('homepage')} className="back-button">Back</button>
            </footer>
        </div>
    );
};

export default Message;