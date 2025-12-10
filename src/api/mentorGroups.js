import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, arrayUnion } from 'firebase/firestore';

export const mentorGroupsApi = {
  getActiveGroups: async () => {
    const q = query(collection(db, 'mentorGroups'), where('status', '==', 'active'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  getByMentor: async (mentorId) => {
    const q = query(collection(db, 'mentorGroups'), where('mentorId', '==', mentorId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  getByParticipant: async (userId) => {
    const q = query(collection(db, 'mentorGroups'), where('participants', 'array-contains', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  getById: async (groupId) => {
    const docRef = doc(db, 'mentorGroups', groupId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  create: async (groupData) => {
    const docRef = await addDoc(collection(db, 'mentorGroups'), groupData);
    return { id: docRef.id, ...groupData };
  },

  update: async (groupId, groupData) => {
    const groupRef = doc(db, 'mentorGroups', groupId);
    await updateDoc(groupRef, groupData);
  },

  delete: async (groupId) => {
    await deleteDoc(doc(db, 'mentorGroups', groupId));
  },

  joinGroup: async (groupId, userId, userName) => {
    // For simplicity and to work with array-contains queries, store participants as userId strings.
    // Existing object entries will still be readable; new joins will add string IDs.
    const groupRef = doc(db, 'mentorGroups', groupId);
    await updateDoc(groupRef, {
      participants: arrayUnion(userId)
    });
  },

  leaveGroup: async (groupId, userId) => {
    const groupRef = doc(db, 'mentorGroups', groupId);
    const groupDoc = await getDoc(groupRef);
    if (groupDoc.exists()) {
      const groupData = groupDoc.data();
      const participants = groupData.participants || [];
      // Support both object-form and string-form participants
      const newParticipants = participants.filter(p => {
        if (typeof p === 'string') return p !== userId;
        if (p && typeof p === 'object') return p.userId !== userId;
        return true;
      });
      await updateDoc(groupRef, { participants: newParticipants });
    }
  },

  addSession: async (groupId, sessionData) => {
    const groupRef = doc(db, 'mentorGroups', groupId);
    await updateDoc(groupRef, {
      sessions: arrayUnion(sessionData)
    });
  },

  addReview: async (groupId, reviewData) => {
    const groupRef = doc(db, 'mentorGroups', groupId);
    await updateDoc(groupRef, {
      reviews: arrayUnion(reviewData)
    });
  }
};

export default mentorGroupsApi;
