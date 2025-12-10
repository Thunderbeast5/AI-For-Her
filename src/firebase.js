// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBz1msU7esogTNwhjBfyVX2dOrB4ZIeHbo",
  authDomain: "aiforher.firebaseapp.com",
  projectId: "aiforher",
  storageBucket: "aiforher.firebasestorage.app",
  messagingSenderId: "999340666503",
  appId: "1:999340666503:web:358d88bfbf4745ee951222",
  measurementId: "G-2VYSMSK00H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
