import React, { useState, useEffect, useRef } from 'react';
import { chatApi } from '../api';

const PersonalChatInterface = ({ connection, currentUser, onClose, userRole }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      console.log('📥 Loading messages for connection:', connection._id);
      const response = await chatApi.getMessages(connection._id);
      console.log('📦 Messages API response:', response);
      
      // Extract data from response
      const messagesData = response?.data || response || [];
      console.log('💬 Messages data:', messagesData);
      console.log('📊 Number of messages:', Array.isArray(messagesData) ? messagesData.length : 0);
      
      setMessages(Array.isArray(messagesData) ? messagesData : []);
      
      // Mark messages as read
      await chatApi.markAsRead(connection._id, currentUser.userId);
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      console.error('Error details:', error.response?.data || error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    
    // Poll for new messages every 3 seconds
    pollIntervalRef.current = setInterval(() => {
      loadMessages();
    }, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [connection._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      console.log('📤 Sending message:', {
        connectionId: connection._id,
        senderId: currentUser.userId,
        senderRole: userRole,
        message: newMessage.substring(0, 50)
      });
      
      await chatApi.sendMessage({
        connectionId: connection._id,
        senderId: currentUser.userId,
        senderRole: userRole,
        message: newMessage
      });
      
      console.log('✅ Message sent successfully');
      setNewMessage('');
      await loadMessages();
    } catch (error) {
      console.error('❌ Error sending message:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

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

  // Get the other person's name
  const otherPersonName = connection.mentorId === currentUser.userId 
    ? connection.entrepreneurName 
    : connection.mentorName;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-500 font-bold text-xl">
                {otherPersonName?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-lg">{otherPersonName || 'User'}</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <p className="text-sm text-blue-100">Active</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ 
          backgroundImage: 'linear-gradient(to bottom, #f9fafb 0%, #f3f4f6 100%)'
        }}>
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-lg font-medium mb-2">Start Your Conversation</p>
                <p className="text-sm text-gray-400">Send a message to begin your mentoring session</p>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => {
              console.log(`💬 Rendering message ${index}:`, {
                id: msg._id,
                senderId: msg.senderId,
                message: msg.message?.substring(0, 50),
                createdAt: msg.createdAt,
                isOwnMessage: msg.senderId === currentUser.userId
              });
              
              const isOwnMessage = msg.senderId === currentUser.userId;
              const showAvatar = index === 0 || messages[index - 1].senderId !== msg.senderId;
              
              return (
                <div key={msg._id || index} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} items-end space-x-2`}>
                  {!isOwnMessage && showAvatar && (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {otherPersonName?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  {!isOwnMessage && !showAvatar && <div className="w-8"></div>}
                  
                  <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                    <div className={`rounded-2xl px-4 py-2 shadow-sm ${
                      isOwnMessage 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm' 
                        : 'bg-white text-gray-800 rounded-bl-sm'
                    }`}>
                      <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                      <div className="flex items-center justify-end space-x-1 mt-1">
                        <p className={`text-xs ${
                          isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(msg.createdAt || msg.timestamp)}
                        </p>
                        {isOwnMessage && (
                          <svg className="w-4 h-4 text-blue-100" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {isOwnMessage && showAvatar && (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {currentUser.name?.charAt(0) || 'Y'}
                      </span>
                    </div>
                  )}
                  {isOwnMessage && !showAvatar && <div className="w-8"></div>}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t">
          <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
            <button
              type="button"
              className="p-3 text-gray-400 hover:text-gray-600 transition rounded-full hover:bg-gray-100"
              title="Attach file"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Type a message..."
                rows="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                style={{ maxHeight: '120px' }}
                disabled={sending}
              />
            </div>

            <button
              type="button"
              className="p-3 text-gray-400 hover:text-gray-600 transition rounded-full hover:bg-gray-100"
              title="Emoji"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default PersonalChatInterface;
