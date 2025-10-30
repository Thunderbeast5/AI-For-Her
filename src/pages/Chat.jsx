import { useState, useRef, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import DashboardLayout from '../components/DashboardLayout'
import EntrepreneurSidebar from '../components/EntrepreneurSidebar'
import { PaperAirplaneIcon, MicrophoneIcon } from '@heroicons/react/24/outline'
import { SparklesIcon } from '@heroicons/react/24/solid'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAuth } from '../context/AuthContext'

// Flask backend URL - change to your deployed backend URL
const CHATBOT_API_URL = 'https://chatbot-1f9h.onrender.com/api/chat'

const Chat = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI Startup Advisor for Women Entrepreneurs! I can help you discover personalized startup ideas based on your background, skills, and interests. I provide guidance on business planning, market analysis, funding options, and work-life balance considerations. What type of business opportunity would you like to explore today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [language, setLanguage] = useState('en')
  const [isTTSEnabled, setIsTTSEnabled] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [sessionId] = useState(() => user?.uid || `session_${Date.now()}`)
  const [buttons, setButtons] = useState([])
  const [ideas, setIdeas] = useState([])
  const [resources, setResources] = useState([])
  const [schemes, setSchemes] = useState([])
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const synthesisRef = useRef(window.speechSynthesis)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInputText(transcript)
      }
      
      recognitionRef.current.onend = () => {
        setIsRecording(false)
      }
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
      }
    }
    
    // Capture synthesis ref for cleanup
    const synthesis = synthesisRef.current
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthesis) {
        synthesis.cancel()
      }
    }
  }, [])

  // Update speech recognition language when language changes
  useEffect(() => {
    if (recognitionRef.current) {
      const languageCodes = {
        'en': 'en-US',
        'hi': 'hi-IN',
        'mr': 'mr-IN',
        'ta': 'ta-IN',
        'te': 'te-IN',
        'bn': 'bn-IN',
        'gu': 'gu-IN',
        'pa': 'pa-IN'
      }
      recognitionRef.current.lang = languageCodes[language] || 'en-US'
    }
  }, [language])

  const handleSendMessage = async (e, messageText = null) => {
    if (e) e.preventDefault()
    const textToSend = messageText || inputText
    if (!textToSend.trim()) return

    const userMessage = {
      id: messages.length + 1,
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)
    setButtons([]) // Clear previous buttons

    try {
      const response = await fetch(CHATBOT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          session_id: sessionId
        })
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()
      
      const aiMessage = {
        id: messages.length + 2,
        text: data.reply || 'I received your message.',
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])

      // Handle buttons if present
      if (data.buttons && data.buttons.length > 0) {
        setButtons(data.buttons)
      }

      // Handle ideas if present
      if (data.ideas && data.ideas.length > 0) {
        setIdeas(data.ideas)
      }

      // Handle resources if present
      if (data.resources && data.resources.length > 0) {
        setResources(data.resources)
      }

      // Handle schemes if present
      if (data.schemes && data.schemes.length > 0) {
        setSchemes(data.schemes)
      }
      
      // Text-to-speech for AI response
      if (isTTSEnabled) {
        speakText(data.reply)
      }
    } catch (error) {
      console.error('Error in chat:', error)
      const errorMessage = {
        id: messages.length + 2,
        text: "I apologize, but I'm having trouble connecting to the chatbot service. Please make sure the Flask backend is running on http://localhost:5000",
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleButtonClick = (buttonValue) => {
    handleSendMessage(null, buttonValue)
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const speakText = (text) => {
    if (!synthesisRef.current || !isTTSEnabled) return
    
    // Stop any ongoing speech
    synthesisRef.current.cancel()
    
    // Clean text for speech (remove markdown formatting)
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
    
    const utterance = new SpeechSynthesisUtterance(cleanText)
    const languageCodes = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'mr': 'mr-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'bn': 'bn-IN',
      'gu': 'gu-IN',
      'pa': 'pa-IN'
    }
    utterance.lang = languageCodes[language] || 'en-US'
    utterance.rate = 0.9
    utterance.pitch = 1
    
    synthesisRef.current.speak(utterance)
  }

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser')
      return
    }
    
    if (isRecording) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
      setIsRecording(true)
    }
  }

  const toggleTTS = () => {
    setIsTTSEnabled(prev => !prev)
    if (isTTSEnabled && synthesisRef.current) {
      synthesisRef.current.cancel()
    }
  }

  const suggestedQuestions = [
    "What startup ideas are good for women with a marketing background?",
    "I want to start a business from home with ₹50,000",
    "Suggest part-time business ideas for working mothers",
    "What are some creative online business ideas?"
  ]

  // Memoize sidebar to prevent re-rendering
  const sidebar = useMemo(() => <EntrepreneurSidebar />, [])

  return (
    <DashboardLayout sidebar={sidebar}>
      <div className="flex flex-col h-[calc(100vh-0px)] -m-6">
        <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden min-h-0">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">AI Startup Advisor</h2>
                  <p className="text-sm text-gray-500">Empowering women entrepreneurs</p>
                </div>
              </div>
              <button
                onClick={toggleTTS}
                className={`p-2 rounded-lg transition-colors ${
                  isTTSEnabled 
                    ? 'bg-primary text-gray-800 hover:bg-opacity-80' 
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
                title={isTTSEnabled ? 'Text-to-Speech ON' : 'Text-to-Speech OFF'}
              >
                {isTTSEnabled ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 min-h-0">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md xl:max-w-2xl px-4 py-3 rounded-2xl ${
                  message.sender === 'user' 
                    ? 'bg-gradient-to-r from-primary to-accent text-gray-800' 
                    : 'bg-white text-gray-900 shadow-sm border border-gray-100'
                }`}>
                  {message.sender === 'user' ? (
                    <p className="text-sm">{message.text}</p>
                  ) : (
                    <div className="text-sm prose prose-sm max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: (props) => <h1 className="text-lg font-bold mt-2 mb-1" {...props} />,
                          h2: (props) => <h2 className="text-base font-bold mt-2 mb-1" {...props} />,
                          h3: (props) => <h3 className="text-sm font-bold mt-1 mb-1" {...props} />,
                          p: (props) => <p className="mb-2" {...props} />,
                          ul: (props) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
                          ol: (props) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
                          li: (props) => <li className="ml-2" {...props} />,
                          strong: (props) => <strong className="font-semibold" {...props} />,
                          em: (props) => <em className="italic" {...props} />,
                          code: ({inline, ...props}) => 
                            inline ? 
                              <code className="bg-gray-100 px-1 rounded text-xs" {...props} /> : 
                              <code className="block bg-gray-100 p-2 rounded text-xs my-2" {...props} />,
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>
                    </div>
                  )}
                  <p className={`text-xs mt-2 ${
                    message.sender === 'user' ? 'text-gray-600' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white text-gray-900 shadow-sm border border-gray-100 px-4 py-3 rounded-2xl max-w-xs">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Interactive Buttons from Chatbot */}
            {buttons.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex flex-wrap gap-2 max-w-2xl">
                  {buttons.map((button, index) => (
                    <button
                      key={index}
                      onClick={() => handleButtonClick(button.value)}
                      className="px-4 py-2 bg-gradient-to-r from-pink-200 to-pink-300 text-gray-900 rounded-lg text-sm font-medium hover:shadow-md transition-all duration-200"
                    >
                      {button.text}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Business Ideas Display */}
            {ideas.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="text-sm font-semibold text-gray-700 mb-2">💡 Business Ideas for You:</div>
                {ideas.map((idea, index) => (
                  <div key={index} className="bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-gray-900 text-lg">{idea.title}</h3>
                      {idea.home_based && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">🏠 Home-based</span>}
                    </div>
                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">{idea.description}</p>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-white rounded-lg p-2">
                        <div className="text-xs text-gray-500">Investment Range</div>
                        <div className="font-semibold text-pink-600">₹{idea.required_investment_min?.toLocaleString()} - ₹{idea.required_investment_max?.toLocaleString()}</div>
                      </div>
                      {idea.profitability && (
                        <div className="bg-white rounded-lg p-2">
                          <div className="text-xs text-gray-500">Profitability</div>
                          <div className="font-semibold text-green-600">{idea.profitability}</div>
                        </div>
                      )}
                    </div>
                    {idea.skills_required && (
                      <div className="text-xs text-gray-600 mb-2">
                        <span className="font-semibold">Skills:</span> {idea.skills_required}
                      </div>
                    )}
                    {idea.why_this_location && (
                      <div className="bg-white rounded-lg p-3 mt-2">
                        <div className="text-xs font-semibold text-gray-700 mb-1">📍 Why this works in your area:</div>
                        <div className="text-xs text-gray-600">{idea.why_this_location}</div>
                      </div>
                    )}
                    <button 
                      onClick={() => handleButtonClick(`create_plan_${index}`)}
                      className="mt-3 w-full bg-gradient-to-r from-pink-200 to-pink-300 text-gray-900 py-2 rounded-lg font-semibold hover:shadow-md transition-all"
                    >
                      📋 Create Business Plan
                    </button>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Resources Display */}
            {resources.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="text-sm font-semibold text-gray-700 mb-2">📍 Local Resources Near You:</div>
                {resources.map((resource, index) => (
                  <div key={index} className="bg-white border-l-4 border-pink-300 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{resource.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{resource.address}</p>
                        {resource.details && <p className="text-xs text-gray-500 mt-2">{resource.details}</p>}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        resource.type === 'supplier' ? 'bg-blue-100 text-blue-700' :
                        resource.type === 'market' ? 'bg-green-100 text-green-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {resource.type === 'supplier' ? '🏭 Supplier' :
                         resource.type === 'market' ? '🏪 Market' :
                         '🏛️ Government'}
                      </span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Government Schemes Display */}
            {schemes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="text-sm font-semibold text-gray-700 mb-2">💰 Government Schemes for You:</div>
                {schemes.map((scheme, index) => (
                  <div key={index} className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-5 shadow-md">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-gray-900">{scheme.title}</h3>
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">{scheme.region}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold text-gray-700">Benefits:</span>
                        <p className="text-gray-600 mt-1">{scheme.benefit}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Eligibility:</span>
                        <p className="text-gray-600 mt-1">{scheme.eligibility}</p>
                      </div>
                      {scheme.documents && (
                        <div>
                          <span className="font-semibold text-gray-700">Required Documents:</span>
                          <p className="text-gray-600 mt-1">{scheme.documents}</p>
                        </div>
                      )}
                      {scheme.how_to_apply && (
                        <div>
                          <span className="font-semibold text-gray-700">How to Apply:</span>
                          <p className="text-gray-600 mt-1">{scheme.how_to_apply}</p>
                        </div>
                      )}
                    </div>
                    {scheme.apply_link && (
                      <a 
                        href={scheme.apply_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block bg-gradient-to-r from-pink-200 to-pink-300 text-gray-900 px-6 py-2 rounded-lg font-semibold hover:shadow-md transition-all"
                      >
                        🔗 Apply Now
                      </a>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="px-6 pb-4 flex-shrink-0 bg-white border-t border-gray-100">
              <p className="text-sm text-gray-600 mb-3">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInputText(question)}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="bg-white border-t border-gray-100 p-6 flex-shrink-0">
            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask me anything about your business..."
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                    isRecording 
                      ? 'text-red-500 animate-pulse' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title={isRecording ? 'Recording... Click to stop' : 'Click to start voice input'}
                >
                  <MicrophoneIcon className="w-5 h-5" />
                </button>
              </div>
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-gray-800 rounded-xl font-medium hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Chat
