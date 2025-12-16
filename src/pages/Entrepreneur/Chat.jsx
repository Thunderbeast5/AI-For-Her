import { useState, useRef, useEffect, useMemo } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import EntrepreneurSidebar from '../../components/EntrepreneurSidebar'
import { PaperAirplaneIcon, MicrophoneIcon } from '@heroicons/react/24/outline'
import { SparklesIcon } from '@heroicons/react/24/solid'
import ReactMarkdown from 'react-markdown'
import { useAuth } from '../../hooks/useAuth'
import Message from '../../components/Message'
import * as api from '../../services/api'

// --- CHANGED ---
// Define your API endpoints. This is the main fix.
const API_BASE_URL = 'https://pratibhara-chatbot.onrender.com' 
// // Use your deployed URL
// const API_BASE_URL = "https://localhost:5001"; // or your actual port

const Chat = () => {
  const { currentUser } = useAuth()
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
  const [language] = useState('en')
  const [isTTSEnabled, setIsTTSEnabled] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [sessionId] = useState(() => currentUser?.uid || `session_${Date.now()}`)
  
  // State for all possible backend responses
  const [buttons, setButtons] = useState([])
  const [ideas, setIdeas] = useState([])
  const [resources, setResources] = useState([])
  const [schemes, setSchemes] = useState([])
  const [plan, setPlan] = useState(null) // --- CHANGED --- Added state for the business plan

  // States from new chatbot
  const [userContext, setUserContext] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const [showLocationHint, setShowLocationHint] = useState(false);
  const [isQuestionMode, setIsQuestionMode] = useState(false);
  const [uploadedPDF, setUploadedPDF] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [mapData, setMapData] = useState({ userLocation: null, businesses: [], businessType: '' });
  const [infoPanelContent, setInfoPanelContent] = useState(null);
  const [infoPanelType, setInfoPanelType] = useState('');
  const [infoPanelOpen, setInfoPanelOpen] = useState(false);

  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const synthesisRef = useRef(window.speechSynthesis)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // --- CHANGED ---
  // Created a central function to handle API responses, just like 'displayResponse' in your app.js
  // This function will update the UI based on what the backend sends.
  const handleApiResponse = (data) => {
    if (data.reply) {
      const aiMessage = {
        id: Date.now(),
        text: data.reply,
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
      
      if (isTTSEnabled) {
        speakText(data.reply)
      }
    }

    // Clear old components and set new ones
    setButtons(data.buttons && data.buttons.length > 0 ? data.buttons : [])
    setIdeas(data.ideas && data.ideas.length > 0 ? data.ideas : [])
    setResources(data.resources && data.resources.length > 0 ? data.resources : [])
    setSchemes(data.schemes && data.schemes.length > 0 ? data.schemes : [])
    setPlan(data.plan ? data.plan : null) // Set the plan
  }

  // --- CHANGED ---
  // This function now handles all API fetches to reduce code duplication

  // This function is for user-typed text messages
  const handleSendMessage = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault()
    }

    const textToSend = inputText
    if (!textToSend.trim()) return

    const userMessage = {
      id: Date.now(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')

    setIsTyping(true);
    try {
      const data = await api.sendChatMessage(textToSend, sessionId, language);
      handleApiResponse(data);
    } catch (error) {
      console.error('Error in API call:', error);
      const errorMessage = {
        id: Date.now(),
        text: "I apologize, but I'm having trouble connecting to the chatbot service. Please try again.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }

  // --- CHANGED ---
  // This function is for backend-provided buttons
  const handleButtonClick = async (buttonValue, buttonText) => {
    // Add the user's "click" to the chat history
    const userMessage = {
      id: Date.now(),
      text: buttonText || buttonValue, // Use the button's text for display
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    setIsTyping(true);
    try {
      const data = await api.handleButtonClick(buttonValue, sessionId, language);
      handleApiResponse(data);
    } catch (error) {
      console.error('Error in API call:', error);
      const errorMessage = {
        id: Date.now(),
        text: "I apologize, but I'm having trouble connecting to the chatbot service. Please try again.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }

  // --- CHANGED ---
  // This is the new function for selecting a business idea
  const handleSelectIdea = async (ideaId, ideaTitle) => {
    // Add the user's "selection" to the chat history
    const userMessage = {
      id: Date.now(),
      text: `I want to create a business plan for ${ideaTitle}`,
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    setIsTyping(true);
    try {
      const data = await api.selectIdea(ideaId, sessionId, language);
      handleApiResponse(data);
    } catch (error) {
      console.error('Error selecting idea:', error);
      const errorMessage = {
        id: Date.now(),
        text: "I apologize, but I'm having trouble with that request. Please try again.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }

  // (Speech recognition, formatTime, speakText, toggleVoiceRecording, toggleTTS functions remain the same)
  // ... (keep all your existing functions for speech, time, etc.)

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const speakText = (text) => {
    if (!synthesisRef.current || !isTTSEnabled) return
    synthesisRef.current.cancel()
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s/g, '')
    const utterance = new SpeechSynthesisUtterance(cleanText)
    const languageCodes = {
      'en': 'en-US', 'hi': 'hi-IN', 'mr': 'mr-IN', 'ta': 'ta-IN',
      'te': 'te-IN', 'bn': 'bn-IN', 'gu': 'gu-IN', 'pa': 'pa-IN'
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
  
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.onresult = (event) => setInputText(event.results[0][0].transcript)
      recognitionRef.current.onend = () => setIsRecording(false)
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
      }
    }
    const synthesis = synthesisRef.current
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop()
      if (synthesis) synthesis.cancel()
    }
  }, [])
  
  useEffect(() => {
    if (recognitionRef.current) {
      const languageCodes = {
        'en': 'en-US', 'hi': 'hi-IN', 'mr': 'mr-IN', 'ta': 'ta-IN',
        'te': 'te-IN', 'bn': 'bn-IN', 'gu': 'gu-IN', 'pa': 'pa-IN'
      }
      recognitionRef.current.lang = languageCodes[language] || 'en-US'
    }
  }, [language])


  const suggestedQuestions = [
    "What startup ideas are good for women with a marketing background?",
    "I want to start a business from home with ₹50,000",
    "Suggest part-time business ideas for working mothers",
    "What are some creative online business ideas?"
  ]

  const sidebar = useMemo(() => <EntrepreneurSidebar />, [])

  // --- CHANGED ---
  // Helper component to render the business plan.
  // You can style this to match your pink/white theme.
  // --- REVISED ---
  // This is a more robust PlanDisplay component.
  // It can handle plan data that is sent as a stringified JSON.
  const PlanDisplay = ({ plan }) => {
    // Helper function to try and parse content if it's a string
    const parseContent = (content) => {
      if (typeof content !== 'string') return content;
      try {
        // Check if it's a JSON string
        if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
          return JSON.parse(content);
        }
      } catch {
        // Not valid JSON, return as plain text
      }
      return content;
    };

    // Smartly render any piece of data (string, array, or object)
    const renderSmart = (data) => {
      const content = parseContent(data);

      if (typeof content === 'string') {
        return <p className="text-sm text-gray-600 mt-1">{content}</p>;
      }

      if (Array.isArray(content)) {
        return (
          <ul className="list-disc list-inside space-y-1 mt-1">
            {content.map((item, i) => (
              <li key={i} className="text-sm text-gray-600">
                {renderSmart(item)}
              </li>
            ))}
          </ul>
        );
      }

      if (typeof content === 'object' && content !== null) {
        return (
          <ul className="list-disc list-inside space-y-1 mt-1 pl-2">
            {Object.entries(content).map(([key, value]) => (
              <li key={key} className="text-sm text-gray-600">
                <span className="capitalize font-medium text-gray-800">{key.replace(/_/g, ' ')}:</span>
                {/* Check if value is another object/array or just text */}
                {(typeof value === 'object' && value !== null) || Array.isArray(value)
                  ? renderSmart(value)
                  : <span className="ml-1">{value}</span>
                }
              </li>
            ))}
          </ul>
        );
      }
      
      return null;
    };
    
    // Parse the main plan object, just in case
    const parsedPlan = parseContent(plan);

    // Get the title from the nested overview object, or use a fallback
    const title = parsedPlan.overview?.title || parsedPlan.overview?.name || 'Business Plan';

    return (
      <div className="bg-linear-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-5 shadow-md space-y-3">
        <h3 className="font-bold text-gray-900 text-lg">📋 Your Business Plan: {title}</h3>
        
        {/* Render each section smartly */}
        <div>
          <span className="font-semibold text-gray-700">Overview:</span>
          {renderSmart(parsedPlan.overview?.description || parsedPlan.overview)}
        </div>
        <div>
          <span className="font-semibold text-gray-700">Investment Breakdown:</span>
          {renderSmart(parsedPlan.investment_breakdown)}
        </div>
        <div>
          <span className="font-semibold text-gray-700">Timeline:</span>
          {renderSmart(parsedPlan.timeline)}
        </div>
        <div>
          <span className="font-semibold text-gray-700">Revenue Estimate:</span>
          {renderSmart(parsedPlan.revenue_estimate)}
        </div>
        <div>
          <span className="font-semibold text-gray-700">Risks & Mitigation:</span>
          {renderSmart(parsedPlan.risks)}
        </div>
         <div>
          <span className="font-semibold text-gray-700">Next Steps:</span>
          {renderSmart(parsedPlan.next_steps)}
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout sidebar={sidebar}>
      <div className="flex flex-col h-[calc(89vh-0px)] -m-4">
        <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden min-h-0 shrink-0">
          {/* Chat Header (fixed at top of chat area) */}
          <div className="bg-white border-b border-gray-100 px-4 py-3 shrink-0 sticky top-0 z-20">
            {/* ... (Your existing header JSX) ... */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-linear-to-r from-primary to-accent rounded-full flex items-center justify-center">
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
                {/* ... (Your existing TTS icon SVG) ... */}
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

          {/* Scrollable chat content (messages, ideas, buttons, suggestions) */}
          <div className="flex-1 overflow-y-auto bg-gray-50 min-h-0">
            <div className="p-4 space-y-3">
              {messages.map((message, index) => (
                <Message
                  key={index}
                  message={message}
                  onButtonClick={handleButtonClick}
                  onIdeaSelect={handleSelectIdea}
                  language={language}
                />
              ))}

              {isTyping && (
                // ... (Your existing isTyping JSX) ...
                <div
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
                </div>
              )}

              {/* Interactive Buttons from Chatbot */}
              {buttons.length > 0 && (
                <div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex flex-wrap gap-2 max-w-2xl">
                    {buttons.map((button, index) => (
                      <button
                        key={index}
                        // --- CHANGED --- Call handleButtonClick with both value and text
                        onClick={() => handleButtonClick(button.value, button.text)}
                        className="px-4 py-2 bg-linear-to-r from-pink-200 to-pink-300 text-gray-900 rounded-lg text-sm font-medium hover:shadow-md transition-all duration-200"
                      >
                        {button.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Business Ideas Display */}
              {ideas.length > 0 && (
                <div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="text-sm font-semibold text-gray-700 mb-2">💡 Business Ideas for You:</div>
                  {ideas.map((idea, index) => (
                    <div key={index} className="bg-linear-to-r from-pink-50 to-purple-50 border-2 border-pink-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-all">
                      {/* ... (Your existing idea rendering JSX) ... */}
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-gray-900 text-lg">{idea.title}</h3>
                        {idea.home_based && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">🏠 Home-based</span>}
                      </div>
                      <p className="text-sm text-gray-700 mb-3 leading-relaxed">{idea.description}</p>
                      {/* ... */}

                      {/* --- CHANGED --- Call handleSelectIdea with the idea.id */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleSelectIdea(index, idea.title); }}
                        className="mt-3 w-full bg-linear-to-r from-pink-200 to-pink-300 text-gray-900 py-2 rounded-lg font-semibold hover:shadow-md transition-all"
                      >
                        📋 Create Business Plan
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* --- CHANGED --- Added rendering for the business plan */}
              {plan && <PlanDisplay plan={plan} />}

              {/* Resources Display */}
              {resources.length > 0 && (
                // ... (Your existing resources mapping JSX) ...
                <div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="text-sm font-semibold text-gray-700 mb-2">📍 Local Resources Near You:</div>
                  {resources.map((resource, index) => (
                    <div key={index} className="bg-white border-l-4 border-pink-300 rounded-lg p-4 shadow-sm">
                      {/* ... */}
                    </div>
                  ))}
                </div>
              )}

              {/* Government Schemes Display */}
              {schemes.length > 0 && (
                // ... (Your existing schemes mapping JSX) ...
                <div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="text-sm font-semibold text-gray-700 mb-2">💰 Government Schemes for You:</div>
                  {schemes.map((scheme, index) => (
                    <div key={index} className="bg-linear-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-5 shadow-md">
                      {/* ... */}
                    </div>
                  ))}
                </div>
              )}

              {/* Suggested Questions (now inside scrollable area) */}
              {messages.length === 1 && (
                // ... (Your existing suggested questions JSX) ...
                <div className="pt-4 border-t border-gray-200">
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

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-white border-t border-gray-100 px-4 py-3 shrink-0">
            {/* --- CHANGED --- This form now only calls handleSendMessage */}
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
                  // ... (Your existing microphone button JSX) ...
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                    isRecording 
                      ? 'text-red-500 animate-pulse' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <MicrophoneIcon className="w-5 h-5" />
                </button>
              </div>
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-6 py-3 bg-linear-to-r from-primary to-accent text-gray-800 rounded-xl font-medium hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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