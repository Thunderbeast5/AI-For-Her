import admin from 'firebase-admin';

// IMPORTANT: You must download your Firebase service account key file
// and place it in your project. Replace the path below with the actual path.
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' };

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin SDK initialized successfully.');
} catch (error) {
  console.error('❌ Error initializing Firebase Admin SDK:', error);
  // Exit the process if Firebase Admin SDK fails to initialize
  process.exit(1);
}

export const db = admin.firestore();
export default admin;
