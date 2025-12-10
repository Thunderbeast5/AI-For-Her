import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, arrayUnion } from 'firebase/firestore';

export const groupSessionsApi = {
  getActiveSessions: async () => {
    const q = query(collection(db, 'groupSessions'), where('status', '==', 'active'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  getByMentor: async (mentorId) => {
    const q = query(collection(db, 'groupSessions'), where('mentorId', '==', mentorId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  getByParticipant: async (userId) => {
    const q = query(collection(db, 'groupSessions'), where('participants', 'array-contains', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  getById: async (sessionId) => {
    const docRef = doc(db, 'groupSessions', sessionId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  create: async (sessionData) => {
    const docRef = await addDoc(collection(db, 'groupSessions'), sessionData);
    return { id: docRef.id, ...sessionData };
  },

  update: async (sessionId, sessionData) => {
    const sessionRef = doc(db, 'groupSessions', sessionId);
    await updateDoc(sessionRef, sessionData);
  },

  delete: async (sessionId) => {
    await deleteDoc(doc(db, 'groupSessions', sessionId));
  },

  joinSession: async (sessionId, userId, userName) => {
    const sessionRef = doc(db, 'groupSessions', sessionId);
    await updateDoc(sessionRef, {
      participants: arrayUnion({ userId, userName })
    });
  },

  leaveSession: async (sessionId, userId) => {
    const sessionRef = doc(db, 'groupSessions', sessionId);
    const sessionDoc = await getDoc(sessionRef);
    if (sessionDoc.exists()) {
      const sessionData = sessionDoc.data();
      const newParticipants = sessionData.participants.filter(p => p.userId !== userId);
      await updateDoc(sessionRef, { participants: newParticipants });
    }
  },

  addSessionContent: async (sessionId, contentData) => {
    const sessionRef = doc(db, 'groupSessions', sessionId);
    await updateDoc(sessionRef, {
      content: arrayUnion(contentData)
    });
  }
};

export default groupSessionsApi;
