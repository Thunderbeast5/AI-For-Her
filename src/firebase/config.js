import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBz1msU7esogTNwhjBfyVX2dOrB4ZIeHbo",
  authDomain: "aiforher.firebaseapp.com",
  projectId: "aiforher",
  storageBucket: "aiforher.appspot.com",
  messagingSenderId: "999340666503",
  appId: "1:999340666503:web:358d88bfbf4745ee951222",
  measurementId: "G-2VYSMSK00H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Enable offline persistence for better reliability
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support persistence.');
    }
  });
} catch (err) {
  console.error('Error enabling persistence:', err);
}

export default app;
