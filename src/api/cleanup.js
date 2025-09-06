// This file is a serverless function, which runs in a Node.js environment.
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// --- IMPORTANT: Load Service Account Credentials ---
// This line reads the private key you will store in Vercel's Environment Variables.
// It will NOT work locally unless you set up local environment variables.
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// Initialize the Firebase Admin App
// We check if it's already initialized to prevent errors during hot-reloading in development.
if (!initializeApp.length) {
    initializeApp({
        credential: cert(serviceAccount)
    });
}

const db = getFirestore();

// This is the main function Vercel will execute.
export default async function handler(request, response) {
    try {
        const now = Date.now();
        const cutoff = new Date(now - 24 * 60 * 60 * 1000); // Timestamp for 24 hours ago

        // Create a query to find all documents where 'createdAt' is older than the cutoff time.
        const expiredDocsQuery = db.collection('drops').where('createdAt', '<', cutoff);
        const snapshot = await expiredDocsQuery.get();

        if (snapshot.empty) {
            console.log("No expired drops to delete.");
            return response.status(200).send('No expired drops to delete.');
        }

        // Use a batch delete for efficiency. This performs all deletions in a single operation.
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        console.log(`Successfully deleted ${snapshot.size} expired drops.`);
        return response.status(200).send(`Deleted ${snapshot.size} expired drops.`);

    } catch (error) {
        console.error("Error deleting expired drops:", error);
        return response.status(500).send('Error deleting expired drops.');
    }
}