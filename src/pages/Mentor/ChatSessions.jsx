import { useState, useEffect, useRef } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import MentorSidebar from '../../components/MentorSidebar'
import EntrepreneurSidebar from '../../components/EntrepreneurSidebar'
import { useAuth } from '../../context/authContext'
import { db } from '../../firebase'
import { collection, query, where, getDocs, doc, getDoc, addDoc, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore'
import { 
  PaperAirplaneIcon, 
  MagnifyingGlassIcon,
  UserCircleIcon 
} from '@heroicons/react/24/outline'

const ChatSessions = () => {
  const { currentUser, userRole } = useAuth()
  const [selectedContact, setSelectedContact] = useState(null)
  const [contacts, setContacts] = useState([])
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  // Fetch connected contacts (mentees for mentors, mentors for entrepreneurs)
  useEffect(() => {
    const fetchContacts = async () => {
      if (!currentUser || !userRole) {
        console.log('ChatSessions: Waiting for user or role...', { currentUser: !!currentUser, userRole })
        return
      }
      
      console.log('ChatSessions: Fetching contacts for', { userId: currentUser.uid, userRole })
      
      try {
        // Query based on user role
        const isMentor = userRole === 'mentor'
        const fieldName = isMentor ? 'mentorId' : 'menteeId'
        
        console.log('ChatSessions: Querying connections where', fieldName, '==', currentUser.uid, 'and status == accepted')
        
        const connectionsQuery = query(
          collection(db, 'connections'),
          where(fieldName, '==', currentUser.uid),
          where('status', '==', 'accepted')
        )
        
        const connectionsSnapshot = await getDocs(connectionsQuery)
        console.log('ChatSessions: Found', connectionsSnapshot.size, 'connections')
        
        const contactsMap = new Map() // Use Map to avoid duplicates
        
        for (const connectionDoc of connectionsSnapshot.docs) {
          const connection = connectionDoc.data()
          console.log('ChatSessions: Processing connection:', connection)
          
          const contactId = isMentor ? connection.menteeId : connection.mentorId
          
          // Skip if already added
          if (contactsMap.has(contactId)) {
            console.log('ChatSessions: Skipping duplicate contact:', contactId)
            continue
          }
          
          // Fetch contact profile
          const contactDoc = await getDoc(doc(db, 'users', contactId))
          if (contactDoc.exists()) {
            const contactData = contactDoc.data()
            console.log('ChatSessions: Found contact profile:', contactData)
            
            contactsMap.set(contactId, {
              id: contactId,
              name: `${contactData.firstName || ''} ${contactData.lastName || ''}`.trim() || 'Anonymous',
              email: contactData.email,
              companyName: contactData.companyName || contactData.startupName || 'N/A',
              sector: contactData.sector || 'N/A',
              lastMessage: null,
              unreadCount: 0
            })
          } else {
            console.log('ChatSessions: Contact profile not found for:', contactId)
          }
        }
        
        // Convert Map to array
        const contactsList = Array.from(contactsMap.values())
        console.log('ChatSessions: Final contacts list:', contactsList)
        setContacts(contactsList)
      } catch (error) {
        console.error('ChatSessions: Error fetching contacts:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchContacts()
  }, [currentUser, userRole])

  // Listen to messages for selected contact
  useEffect(() => {
    if (!selectedContact || !currentUser) return

    const chatId = [currentUser.uid, selectedContact.id].sort().join('_')
    
    const messagesQuery = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    )

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesList = []
      snapshot.forEach((doc) => {
        messagesList.push({ id: doc.id, ...doc.data() })
      })
      setMessages(messagesList)
    })

    return () => unsubscribe()
  }, [selectedContact, currentUser])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputText.trim() || !selectedContact || !currentUser) return

    const chatId = [currentUser.uid, selectedContact.id].sort().join('_')

    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: inputText,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Mentor',
        timestamp: serverTimestamp(),
        read: false
      })

      setInputText('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getSidebar = () => {
    if (userRole === 'mentor') return <MentorSidebar />
    return <EntrepreneurSidebar />
  }

  return (
    <DashboardLayout sidebar={getSidebar()}>
      <div className="h-[calc(100vh-120px)] flex bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Mentees List Sidebar */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${userRole === 'mentor' ? 'mentees' : 'mentors'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400"></div>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p className="mb-2">No {userRole === 'mentor' ? 'mentees' : 'mentors'} found</p>
                <p className="text-sm">Connected {userRole === 'mentor' ? 'mentees' : 'mentors'} will appear here</p>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setSelectedContact(contact)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                    selectedContact?.id === contact.id
                      ? 'bg-pink-50 border-l-4 border-l-pink-400'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-linear-to-r from-pink-300 to-pink-400 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-white font-semibold text-lg">
                        {contact.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{contact.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{contact.companyName}</p>
                      <p className="text-xs text-gray-500 truncate">{contact.sector}</p>
                    </div>
                    {contact.unreadCount > 0 && (
                      <div className="w-6 h-6 bg-pink-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">{contact.unreadCount}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-linear-to-r from-pink-300 to-pink-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {selectedContact.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{selectedContact.name}</h2>
                    <p className="text-sm text-gray-600">{selectedContact.companyName}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <UserCircleIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="mb-2">No messages yet</p>
                      <p className="text-sm">Start the conversation with {selectedContact.name}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => {
                      const showDate = index === 0 || 
                        formatDate(messages[index - 1]?.timestamp) !== formatDate(message.timestamp)
                      
                      return (
                        <div key={message.id}>
                          {showDate && (
                            <div className="flex justify-center my-4">
                              <span className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                                {formatDate(message.timestamp)}
                              </span>
                            </div>
                          )}
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${
                              message.senderId === currentUser.uid ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                                message.senderId === currentUser.uid
                                  ? 'bg-pink-400 text-white'
                                  : 'bg-white text-gray-900 shadow-sm'
                              }`}
                            >
                              <p className="text-sm wrap-break-word">{message.text}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  message.senderId === currentUser.uid
                                    ? 'text-pink-100'
                                    : 'text-gray-500'
                                }`}
                              >
                                {formatTime(message.timestamp)}
                              </p>
                            </div>
                          </motion.div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <form onSubmit={handleSendMessage} className="flex space-x-3">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Message ${selectedContact.name}...`}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="px-6 py-3 bg-pink-400 text-white rounded-xl font-medium hover:bg-pink-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center text-gray-500">
                <UserCircleIcon className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                <p className="text-lg mb-2">Select a {userRole === 'mentor' ? 'mentee' : 'mentor'} to start chatting</p>
                <p className="text-sm">Choose from your connected {userRole === 'mentor' ? 'mentees' : 'mentors'} on the left</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ChatSessions
