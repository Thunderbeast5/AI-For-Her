import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore';

const UnifiedChat = ({ chatInfo, currentUser, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chatDetails, setChatDetails] = useState(null);
  const messagesEndRef = useRef(null);

  const isGroupChat = chatInfo.type === 'group';
  const chatId = chatInfo.id;

  // Match existing chat implementations: prefer userId, fall back to uid
  const authUserId = currentUser?.userId || currentUser?.uid;
  const authUserName = currentUser?.name || currentUser?.displayName || 'User';

  const pinkGradient = 'bg-gradient-to-r from-pink-400 to-pink-500';
  const pinkGradientHover = 'hover:from-pink-500 hover:to-pink-600';
  const primaryButtonClass = `text-white ${pinkGradient} ${pinkGradientHover} font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`;

  const fetchChatDetails = useCallback(async () => {
    if (isGroupChat) {
      const groupDocRef = doc(db, 'mentorGroups', chatId);
      const docSnap = await getDoc(groupDocRef);
      if (docSnap.exists()) {
        setChatDetails({ name: docSnap.data().groupName, participants: docSnap.data().participants });
      } else {
        // Fallback for self-help groups if necessary
        const selfHelpDocRef = doc(db, 'self-help-groups', chatId);
        const selfHelpSnap = await getDoc(selfHelpDocRef);
        if (selfHelpSnap.exists()) {
          setChatDetails({ name: selfHelpSnap.data().name, participants: selfHelpSnap.data().participants });
        }
      }
    } else {
      setChatDetails({ name: chatInfo.otherPersonName });
    }
  }, [chatId, isGroupChat, chatInfo.otherPersonName]);

  useEffect(() => {
    let unsubscribe = null;

    const init = async () => {
      try {
        await fetchChatDetails();

        const chatCollectionPath = isGroupChat
          ? (chatInfo.groupType === 'self-help' ? 'self-help-group-chats' : 'group-chats')
          : 'chats';

        // For mentor group chats, ensure a chat doc exists and add current user as participant.
        // For self-help group chats, rules only allow read/create (no update),
        // and membership is checked via self-help-groups members array instead.
        if (isGroupChat && authUserId && chatInfo.groupType !== 'self-help') {
          const chatDocRef = doc(db, chatCollectionPath, chatId);
          const chatSnap = await getDoc(chatDocRef);

          if (!chatSnap.exists()) {
            const baseData = {
              groupName: chatDetails?.name || chatInfo.groupName || 'Group Chat',
              participants: [
                {
                  userId: authUserId,
                  userName: authUserName,
                  joinedAt: new Date(),
                },
              ],
              participantIds: [authUserId],
              createdAt: serverTimestamp(),
            };
            await setDoc(chatDocRef, baseData);
          } else {
            const data = chatSnap.data() || {};
            if (!data.participantIds || !data.participantIds.includes(authUserId)) {
              await updateDoc(chatDocRef, {
                participantIds: arrayUnion(authUserId),
                participants: arrayUnion({
                  userId: authUserId,
                  userName: authUserName,
                  joinedAt: new Date(),
                }),
              });
            }
          }
        }

        const messagesQuery = query(
          collection(db, chatCollectionPath, chatId, 'messages'),
          orderBy('timestamp', 'asc')
        );

        unsubscribe = onSnapshot(
          messagesQuery,
          (snapshot) => {
            const messagesList = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
            setMessages(messagesList);
            setLoading(false);
          },
          (error) => {
            console.error('Error fetching messages: ', error);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('Error initializing chat: ', err);
        setLoading(false);
      }
    };

    init();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [chatId, isGroupChat, fetchChatDetails, chatInfo.groupType, authUserId, authUserName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const chatCollectionPath = isGroupChat ? (chatInfo.groupType === 'self-help' ? 'self-help-group-chats' : 'group-chats') : 'chats';

    const messagePayload = {
      senderId: authUserId,
      senderName: authUserName,
      message: newMessage,
      timestamp: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, chatCollectionPath, chatId, 'messages'), messagePayload);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
          <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {chatDetails?.name?.charAt(0) || 'C'}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">{chatDetails?.name}</h3>
            {isGroupChat && (
              <p className="text-sm text-gray-500">
                {chatInfo.groupType === 'self-help'
                  ? (chatInfo.membersCount ?? 0)
                  : (chatDetails?.participants?.length || 0)
                } participants
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const isOwnMessage = msg.senderId === authUserId;
          const showSender = isGroupChat && (index === 0 || messages[index - 1].senderId !== msg.senderId);

          return (
            <div key={msg.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                {showSender && !isOwnMessage && (
                  <p className="text-xs text-gray-500 font-medium mb-1 px-1">
                    {msg.senderName}
                  </p>
                )}
                <div className={`rounded-lg px-4 py-2 ${
                  isOwnMessage
                    ? 'bg-pink-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}>
                  <p className="whitespace-pre-wrap wrap-break-word">{msg.message}</p>
                  <p className={`text-xs mt-1 ${isOwnMessage ? 'text-pink-100' : 'text-gray-500'}`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className={`${primaryButtonClass} px-6 py-3 flex items-center justify-center`}
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UnifiedChat;
