import React, { useState, useEffect, useRef } from 'react';
import groupChatsApi from '../api/groupChats';

const GroupChatInterface = ({ groupId, groupName, currentUser, onClose, groupType = 'mentor' }) => {
  const [groupChat, setGroupChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Determine API base URL based on group type
  const apiBaseUrl = groupType === 'self-help' 
    ? 'http://localhost:5000/api/self-help-group-chats'
    : 'http://localhost:5000/api/group-chats';

  // Validate required props
  useEffect(() => {
    if (!currentUser || !currentUser.userId || !currentUser.name) {
      console.error('GroupChatInterface: currentUser prop is required with userId and name');
      setError('User information is missing. Please refresh the page.');
      setLoading(false);
    }
  }, [currentUser]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load group chat data
  const loadGroupChat = async () => {
    if (!currentUser?.userId) return;
    
    try {
      const response = await fetch(`${apiBaseUrl}/group/${groupId}`);
      const data = await response.json();
      setGroupChat(data);
      setMessages(data.messages || []);
      setLoading(false);
      
      // Mark messages as read
      if (currentUser?.userId) {
        await fetch(`${apiBaseUrl}/group/${groupId}/read`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.userId })
        });
      }
    } catch (error) {
      console.error('Error loading group chat:', error);
      setError('Failed to load group chat: ' + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!currentUser?.userId || error) return;
    
    loadGroupChat();
    
    pollIntervalRef.current = setInterval(() => {
      loadGroupChat();
    }, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [groupId, currentUser?.userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !currentUser?.userId || !currentUser?.name) return;

    setSending(true);
    try {
      await fetch(`${apiBaseUrl}/group/${groupId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.userId,
          senderName: currentUser.name,
          message: newMessage
        })
      });
      setNewMessage('');
      await loadGroupChat(); // Refresh messages
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message: ' + (error.response?.data?.message || error.message));
    } finally {
      setSending(false);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + 
             date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading group chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <div className="text-red-500 text-center mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Chat</h3>
            <p className="text-gray-600">{error}</p>
          </div>
          <button
            onClick={onClose || (() => window.location.reload())}
            className="w-full bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-pink-500 font-bold text-lg">
              {groupName?.charAt(0) || 'G'}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-lg">{groupName}</h3>
            <p className="text-sm text-pink-100">
              {groupChat?.participants?.length || 0} participants
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
            title="View Participants"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
              title="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Messages Area */}
        <div className={`flex-1 flex flex-col ${showParticipants ? 'border-r' : ''}`}>
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-lg font-medium">No messages yet</p>
                    <p className="text-sm">Be the first to start the conversation!</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isOwnMessage = msg.senderId === currentUser.userId;
                  const showSender = index === 0 || messages[index - 1].senderId !== msg.senderId;
                  
                  return (
                    <div key={index} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                        {showSender && !isOwnMessage && (
                          <p className="text-xs text-gray-600 font-medium mb-1 px-1">
                            {msg.senderName}
                          </p>
                        )}
                        <div className={`rounded-lg px-4 py-2 ${
                          isOwnMessage 
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
                            : 'bg-white border border-gray-200 text-gray-800'
                        }`}>
                          <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                          <p className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-pink-100' : 'text-gray-500'
                          }`}>
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t">
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
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-pink-600 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>Send</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Participants Sidebar */}
          {showParticipants && (
            <div className="w-80 bg-white overflow-y-auto">
              <div className="p-4 border-b bg-gray-50">
                <h4 className="font-bold text-gray-800">
                  Participants ({groupChat?.participants?.length || 0})
                </h4>
              </div>
              <div className="p-2">
                {groupChat?.participants?.map((participant, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {participant.userName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {participant.userName}
                        {participant.userId === currentUser?.userId && (
                          <span className="text-xs text-pink-500 ml-2">(You)</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        Joined {new Date(participant.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
    </div>
  );
};

export default GroupChatInterface;
