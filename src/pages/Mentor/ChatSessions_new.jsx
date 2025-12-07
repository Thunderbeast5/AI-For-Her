import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import MentorSidebar from '../../components/MentorSidebar';
import { useAuth } from '../../context/AuthContext';
import { connectionsApi, chatApi } from '../../api';
import { 
  PaperAirplaneIcon, 
  MagnifyingGlassIcon,
  UserCircleIcon 
} from '@heroicons/react/24/outline';

const ChatSessions = () => {
  const { currentUser } = useAuth();
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [connections, setConnections] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConnections();
  }, [currentUser]);

  useEffect(() => {
    if (selectedConnection) {
      fetchMessages(selectedConnection._id);
      const interval = setInterval(() => fetchMessages(selectedConnection._id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedConnection]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConnections = async () => {
    try {
      if (currentUser?.userId) {
        const data = await connectionsApi.getByUser(currentUser.userId, 'mentor');
        const activeConnections = data.filter(conn => conn.status === 'active');
        setConnections(activeConnections);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (connectionId) => {
    try {
      const data = await chatApi.getMessages(connectionId);
      setMessages(data);
      await chatApi.markAsRead(connectionId, currentUser.userId);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !selectedConnection) return;

    try {
      await chatApi.sendMessage({
        connectionId: selectedConnection._id,
        senderId: currentUser.userId,
        senderRole: 'mentor',
        message: inputText,
        messageType: 'text'
      });
      
      setInputText('');
      fetchMessages(selectedConnection._id);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const filteredConnections = connections.filter(conn => {
    const entrepreneurName = conn.entrepreneurId?.name || conn.entrepreneurId?.firstName || '';
    return entrepreneurName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const sidebar = useMemo(() => <MentorSidebar />, []);

  if (loading) {
    return (
      <DashboardLayout sidebar={sidebar}>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={sidebar}>
      <div className="h-[calc(100vh-2rem)] flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat Sessions</h1>
          <p className="text-gray-600">Connect with your mentees</p>
        </motion.div>

        <div className="flex-1 bg-white rounded-2xl shadow-sm overflow-hidden flex">
          {/* Contacts List */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search mentees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConnections.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No active connections
                </div>
              ) : (
                filteredConnections.map((connection) => (
                  <div
                    key={connection._id}
                    onClick={() => setSelectedConnection(connection)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                      selectedConnection?._id === connection._id ? 'bg-pink-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <UserCircleIcon className="w-10 h-10 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {connection.entrepreneurId?.name || connection.entrepreneurId?.firstName || 'Entrepreneur'}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {connection.mentorType === 'personal' ? 'Personal Session' : 'Group Session'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConnection ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <UserCircleIcon className="w-10 h-10 text-gray-400" />
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {selectedConnection.entrepreneurId?.name || selectedConnection.entrepreneurId?.firstName || 'Entrepreneur'}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {selectedConnection.entrepreneurId?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`flex ${msg.senderId === currentUser.userId ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.senderId === currentUser.userId
                              ? 'bg-pink-500 text-white'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          <p className="text-sm mb-1">{msg.message}</p>
                          <p className={`text-xs ${
                            msg.senderId === currentUser.userId ? 'text-pink-100' : 'text-gray-500'
                          }`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                    <button
                      onClick={sendMessage}
                      className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-semibold transition flex items-center space-x-2"
                    >
                      <span>Send</span>
                      <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a mentee to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatSessions;
