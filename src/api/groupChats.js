import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';

export const groupChatsApi = {
  getGroupChat: async (groupId) => {
    const chatRef = doc(db, 'groupChats', groupId);
    const chatSnap = await getDoc(chatRef);
    return chatSnap.exists() ? { id: chatSnap.id, ...chatSnap.data() } : null;
  },

  sendMessage: async (groupId, senderId, senderName, message) => {
    const messagesRef = collection(db, 'groupChats', groupId, 'messages');
    const newMessage = {
      senderId,
      senderName,
      message,
      timestamp: serverTimestamp()
    };
    const docRef = await addDoc(messagesRef, newMessage);
    const groupChatRef = doc(db, 'groupChats', groupId);
    await updateDoc(groupChatRef, {
        lastMessage: message,
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSender: senderName,
    });
    return { id: docRef.id, ...newMessage };
  },

  markAsRead: async (groupId, userId) => {
    const chatRef = doc(db, 'groupChats', groupId);
    const groupDoc = await getDoc(chatRef);
    if (groupDoc.exists()) {
        const groupData = groupDoc.data();
        const participants = groupData.participants || [];
        const updatedParticipants = participants.map(p => 
            p.userId === userId ? { ...p, lastRead: serverTimestamp() } : p
        );
        await updateDoc(chatRef, { participants: updatedParticipants });
    }
  },

  addParticipant: async (groupId, userId, userName) => {
    const chatRef = doc(db, 'groupChats', groupId);
    await updateDoc(chatRef, {
      participants: arrayUnion({ userId, userName })
    });
  },

  removeParticipant: async (groupId, userId) => {
    const chatRef = doc(db, 'groupChats', groupId);
    const chatDoc = await getDoc(chatRef);
    if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        const newParticipants = chatData.participants.filter(p => p.userId !== userId);
        await updateDoc(chatRef, { participants: newParticipants });
    }
  },

  getUserGroupChats: async (userId) => {
    const q = query(collection(db, 'groupChats'), where('participants', 'array-contains', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

export default groupChatsApi;
