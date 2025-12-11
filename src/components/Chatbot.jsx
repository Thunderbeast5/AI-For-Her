import React, { useState, useEffect, useRef } from 'react';
import Message from './Message';
import VoiceInput from './VoiceInput';
import MapModal from './MapModal';
import * as api from '../services/api';
import { getText, getLanguages } from '@utils/translations';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [language, setLanguage] = useState('en-IN');
  const [userContext, setUserContext] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const [showLocationHint, setShowLocationHint] = useState(false);
  const [isQuestionMode, setIsQuestionMode] = useState(false);
  const [uploadedPDF, setUploadedPDF] = useState(null);
  const [infoPanelContent, setInfoPanelContent] = useState(null);
  const [infoPanelType, setInfoPanelType] = useState('');
  const [infoPanelOpen, setInfoPanelOpen] = useState(false);
  
  // Map modal state
  const [showMap, setShowMap] = useState(false);
  const [mapData, setMapData] = useState({ userLocation: null, businesses: [], businessType: '' });
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle language change with fallback for disabled languages
  const handleLanguageChange = (newLanguage) => {
    const selectedLang = getLanguages().find(lang => lang.code === newLanguage);
    if (selectedLang && selectedLang.disabled) {
      alert('This language is coming soon! Currently only English, Hindi, and Marathi are supported.');
      return;
    }
    setLanguage(newLanguage);
  };

  // Generate session ID on mount - MATCH FLASK: Require "Hi" to start
  useEffect(() => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    
    // ✅ MATCH FLASK: Initial message asking user to type "Hi"
    // Only add if messages array is empty (prevent duplicate on React Strict Mode remount)
    setMessages(prev => {
      if (prev.length === 0) {
        return [{
          sender: 'bot',
          text: "Please type 'Hi' to start! 👋",
          timestamp: new Date().toISOString(),
        }];
      }
      return prev;
    });

    // Auto-detect location on page load (after user types Hi)
    // detectUserLocation(); // Moved to after first interaction
  }, []);

  // Auto-detect user's location on page load
  const detectUserLocation = async () => {
    // Try browser geolocation first
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });

        const { latitude, longitude } = position.coords;
        console.log('GPS Location detected:', latitude, longitude);

        // Send to backend to get city name
        const response = await api.detectLocation(sessionId, latitude, longitude);
        
        if (response.success && response.location) {
          const locationData = response.location;
          setUserLocation(locationData);
          
          // Update context
          setUserContext(prev => ({
            ...prev,
            location: locationData.city,
            location_data: locationData
          }));

          // Show location hint notification
          showLocationNotification(locationData.city);

          // ✅ Auto-send location as message if we're in collecting_location step
          if (userContext.currentStep === 'collecting_location' || messages.some(m => m.text?.includes('शहर') || m.text?.includes('city'))) {
            setTimeout(() => {
              handleSendMessage(locationData.city);
            }, 1000);
          }
        }
      } catch (error) {
        console.log('GPS location denied or failed, using IP-based location');
        // Fallback to IP-based location
        await detectLocationFromIP();
      }
    } else {
      console.log('Geolocation not supported, using IP-based location');
      await detectLocationFromIP();
    }
  };

  // Fallback: Detect location from IP
  const detectLocationFromIP = async () => {
    try {
      const response = await api.detectLocation(sessionId);
      
      if (response.success && response.location) {
        const locationData = response.location;
        setUserLocation(locationData);
        
        // Update context
        setUserContext(prev => ({
          ...prev,
          location: locationData.city,
          location_data: locationData
        }));

        showLocationNotification(locationData.city);

        // ✅ Auto-send location as message if we're in collecting_location step
        if (userContext.currentStep === 'collecting_location' || messages.some(m => m.text?.includes('शहर') || m.text?.includes('city'))) {
          setTimeout(() => {
            handleSendMessage(locationData.city);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Location detection failed:', error);
    }
  };

  // Show location notification banner
  const showLocationNotification = (city) => {
    setShowLocationHint(city);
    // Hide after 5 seconds
    setTimeout(() => {
      setShowLocationHint(false);
    }, 5000);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleSendMessage = async (messageText = inputValue) => {
    if (!messageText.trim() || isLoading) return;

    // Add user message
    addMessage({
      sender: 'user',
      text: messageText,
      timestamp: new Date().toISOString(),
    });

    setInputValue('');
    setIsLoading(true);

    try {
      const response = await api.sendChatMessage(messageText, sessionId, language);
      
      // Update context
      if (response.context) {
        setUserContext(response.context);
      }

      // Track current step for location auto-detection
      if (response.current_step) {
        setUserContext(prev => ({
          ...prev,
          currentStep: response.current_step
        }));
      }

      // ✅ Auto-detect location when collecting_location step is reached
      if (response.current_step === 'collecting_location') {
        // Trigger automatic location detection
        setTimeout(() => detectUserLocation(), 500);
      }

      // ✅ MATCH FLASK: Handle detailed plan mode (user types 1-10 for sections)
      if (response.type === 'detailed_plan_menu' || response.type === 'detailed_resource_menu') {
        // User is now in section selection mode - handled by backend
      }

      // Add bot response
      const botMessage = {
        sender: 'bot',
        text: response.reply || response.message || 'Sorry, I did not understand that.',
        buttons: response.buttons || [],
        ideas: response.ideas || [],
        schemes: response.schemes || [],
        plan: response.plan || null, // ✅ Add plan support
        timestamp: new Date().toISOString(),
      };

      addMessage(botMessage);

      // Handle info panel data
      if (response.plan_data || response.plan) {
        setInfoPanelContent(response.plan_data || response.plan);
        setInfoPanelType('plan');
        setInfoPanelOpen(true);
      } else if (response.schemes_data) {
        setInfoPanelContent({ schemes: response.schemes_data });
        setInfoPanelType('schemes');
        setInfoPanelOpen(true);
      } else if (response.resources_data) {
        setInfoPanelContent({ resources: response.resources_data });
        setInfoPanelType('resources');
        setInfoPanelOpen(true);
      } else if (response.analysis_data) {
        setInfoPanelContent(response.analysis_data);
        setInfoPanelType('analysis');
        setInfoPanelOpen(true);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      addMessage({
        sender: 'bot',
        text: getText('errorMessage', language),
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = async (buttonValue, buttonText) => {
    // Track if entering question mode
    if (buttonValue === 'ask_question') {
      setIsQuestionMode(true);
    } else if (buttonValue === 'back_to_menu' || buttonValue === 'generate_business' || buttonValue === 'location_analysis') {
      setIsQuestionMode(false);
      setUploadedPDF(null);
    }

    // Add button click as user message
    addMessage({
      sender: 'user',
      text: buttonText,
      timestamp: new Date().toISOString(),
    });

    setIsLoading(true);

    try {
      const response = await api.handleButtonClick(buttonValue, sessionId, language);
      
      // Update context
      if (response.context) {
        setUserContext(response.context);
      }

      // Add bot response
      const botMessage = {
        sender: 'bot',
        text: response.reply || response.message || '',
        buttons: response.buttons || [],
        ideas: response.ideas || [],
        schemes: response.schemes || [],
        plan: response.plan || null, // ✅ Add plan support
        timestamp: new Date().toISOString(),
      };

      addMessage(botMessage);

      // ✅ MATCH FLASK: Handle info panel for plans and schemes
      if (response.plan_data || response.plan) {
        setInfoPanelContent(response.plan_data || response.plan);
        setInfoPanelType('plan');
        setInfoPanelOpen(true);
      } else if (response.schemes_data || response.schemes) {
        setInfoPanelContent({ schemes: response.schemes_data || response.schemes });
        setInfoPanelType('schemes');
        setInfoPanelOpen(true);
      }

    } catch (error) {
      console.error('Error handling button click:', error);
      addMessage({
        sender: 'bot',
        text: getText('errorMessage', language),
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleIdeaSelect = async (ideaIndex, ideaTitle) => {
    // Add idea selection as user message
    addMessage({
      sender: 'user',
      text: `Selected: ${ideaTitle}`,
      timestamp: new Date().toISOString(),
    });

    setIsLoading(true);

    try {
      const response = await api.selectIdea(ideaIndex, sessionId, language);
      
      // Update context
      if (response.context) {
        setUserContext(response.context);
      }

      // Add bot response
      const botMessage = {
        sender: 'bot',
        text: response.reply || response.message || '',
        buttons: response.buttons || [],
        plan: response.plan || null, // ✅ MATCH FLASK: Include plan in message
        timestamp: new Date().toISOString(),
      };

      addMessage(botMessage);

      // ✅ MATCH FLASK: Show plan immediately after selection
      if (response.plan) {
        setInfoPanelContent(response.plan);
        setInfoPanelType('plan');
        setInfoPanelOpen(true);
      }

    } catch (error) {
      console.error('Error selecting idea:', error);
      addMessage({
        sender: 'bot',
        text: getText('errorMessage', language),
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceTranscript = (transcript) => {
    setInputValue(transcript);
    handleSendMessage(transcript);
  };

  const handleLocationAnalysis = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await api.detectLocation(latitude, longitude, sessionId);
          
          addMessage({
            sender: 'bot',
            text: `${getText('locationDetected', language)} ${response.location}\n\n${getText('locationHint', language)}`,
            timestamp: new Date().toISOString(),
          });

          // Show map with user location
          setMapData({
            userLocation: { latitude, longitude },
            businesses: [],
            businessType: 'Your Location',
          });
          setShowMap(true);

        } catch (error) {
          console.error('Error detecting location:', error);
          addMessage({
            sender: 'bot',
            text: getText('errorMessage', language),
            timestamp: new Date().toISOString(),
          });
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to get your location. Please enable location services.');
        setIsLoading(false);
      }
    );
  };

  const handleBusinessQA = () => {
    addMessage({
      sender: 'user',
      text: getText('askQuestion', language),
      timestamp: new Date().toISOString(),
    });

    addMessage({
      sender: 'bot',
      text: "I'm here to help! 💬\n\nWhat business question would you like to ask?",
      timestamp: new Date().toISOString(),
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePDFUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload only PDF files');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await api.uploadPDF(sessionId, file, language);
      
      if (response.success) {
        setUploadedPDF({
          name: response.filename,
          pages: response.pages
        });

        // Add upload success message
        addMessage({
          sender: 'bot',
          text: `📄 ${response.message}\n\n**File:** ${response.filename} (${response.pages} pages)\n\n**Summary:**\n${response.summary}\n\nYou can now ask me questions about this document, and I'll explain it in simple words!`,
          timestamp: new Date().toISOString(),
        });

        // Update context
        if (response.context) {
          setUserContext(response.context);
        }
      }
    } catch (error) {
      console.error('PDF upload error:', error);
      addMessage({
        sender: 'bot',
        text: error.message || 'Failed to upload PDF. Please try again.',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="chatbot-container">
      {/* Location Hint Notification - Like Flask */}
      {showLocationHint && (
        <div className="location-hint-banner">
          📍 {getText('locationDetected', language)} <strong>{showLocationHint}</strong> - {getText('locationHint', language)}
        </div>
      )}

      {/* Header */}
      <div className="chatbot-header">
        <div className="header-content">
          <h1>{getText('title', language)}</h1>
          <p className="tagline">{getText('tagline', language)}</p>
        </div>
        
        {/* Language Selector */}
        <div className="language-selector">
          <label htmlFor="languageSelector">🌐 Language:</label>
          <select 
            id="languageSelector"
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
          >
            {getLanguages().map((lang) => (
              <option key={lang.code} value={lang.code} disabled={lang.disabled}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="chat-container">
        <div className="chat-section">
          <div className="chat-header-bar">
            <div className="bot-avatar">🤖</div>
            <div>
              <h3>Startup Sathi</h3>
              <span className="status">{getText('status', language)}</span>
            </div>
          </div>

          <div className="chat-messages" ref={chatContainerRef}>
            {messages.map((message, index) => (
              <Message
                key={index}
                message={message}
                onButtonClick={handleButtonClick}
                onIdeaSelect={handleIdeaSelect}
                language={language}
              />
            ))}
            {isLoading && (
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            {isQuestionMode && (
              <div className="pdf-upload-section">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf"
                  onChange={handlePDFUpload}
                  style={{ display: 'none' }}
                />
                <button
                  className="pdf-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  title={getText('upload_pdf_btn', language)}
                >
                  📄 {uploadedPDF ? `${uploadedPDF.name}` : 'Upload PDF'}
                </button>
                {uploadedPDF && (
                  <span className="pdf-indicator">✓ {uploadedPDF.pages} pages</span>
                )}
              </div>
            )}
            <VoiceInput
              onTranscript={handleVoiceTranscript}
              language={language}
              disabled={isLoading}
            />
            <input
              type="text"
              className="chat-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={getText('placeholder', language)}
              disabled={isLoading}
            />
            <button
              className="send-btn"
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputValue.trim()}
            >
              {getText('send', language)} ➤
            </button>
          </div>
        </div>
      </div>

      {/* Map Modal */}
      <MapModal
        isOpen={showMap}
        onClose={() => setShowMap(false)}
        userLocation={mapData.userLocation}
        businesses={mapData.businesses}
        businessType={mapData.businessType}
      />
    </div>
  );
};

export default Chatbot;
