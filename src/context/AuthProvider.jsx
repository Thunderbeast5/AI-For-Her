import { useEffect, useState } from 'react';
import { auth, db } from '../firebase'; // Assuming firebase.js is in the src folder
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

import { AuthContext } from './authContext';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up function
  const signup = async (email, password, firstName, lastName, role) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store additional user info in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      firstName,
      lastName,
      email,
      role,
    });

    // Send verification email
    await sendEmailVerification(user);

    // Manually set user role for immediate use
    setUserRole(role);

    return userCredential;
  };

  // Login function
  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user role from Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Attach role to user object for immediate access
      user.role = userData.role;
      setUserRole(userData.role);
    }
    
    return userCredential;
  };

  // Logout function
  const logout = () => {
    return signOut(auth);
  };

  // Reset password function
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Resend verification email
  const resendVerificationEmail = () => {
    if (auth.currentUser) {
      return sendEmailVerification(auth.currentUser);
    }
    throw new Error('No user is currently signed in.');
  };

  // Force reload of user to get latest state (e.g., emailVerified)
  const reloadUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      // onAuthStateChanged will handle updating the state
      setCurrentUser({ ...auth.currentUser }); // Trigger re-render
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, get their role from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        }
        setCurrentUser(user);
      } else {
        // User is signed out
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  const value = {
    currentUser,
    userRole,
    loading,
    signup,
    login,
    logout,
    resendVerificationEmail,
    reloadUser, // Expose the reload function
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
