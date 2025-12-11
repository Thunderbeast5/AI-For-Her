/**
 * Utility helper functions for the chatbot
 */

/**
 * Generate a unique session ID
 */
export const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Format timestamp to readable time
 */
export const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Check if speech recognition is supported
 */
export const isSpeechRecognitionSupported = () => {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
};

/**
 * Check if text-to-speech is supported
 */
export const isTextToSpeechSupported = () => {
  return 'speechSynthesis' in window;
};

/**
 * Check if geolocation is supported
 */
export const isGeolocationSupported = () => {
  return 'geolocation' in navigator;
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Scroll element to bottom smoothly
 */
export const scrollToBottom = (element) => {
  if (element) {
    element.scrollTo({
      top: element.scrollHeight,
      behavior: 'smooth',
    });
  }
};

/**
 * Debounce function to limit API calls
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Check if string is valid JSON
 */
export const isValidJSON = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Parse markdown-style bold text to HTML
 */
export const parseBoldText = (text) => {
  if (!text) return '';
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
};

/**
 * Get browser language preference
 */
export const getBrowserLanguage = () => {
  const lang = navigator.language || navigator.userLanguage;
  
  if (lang.startsWith('hi')) return 'hi-IN';
  if (lang.startsWith('mr')) return 'mr-IN';
  return 'en-IN';
};

/**
 * Local storage helper
 */
export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  },
  
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Error reading from localStorage:', e);
      return defaultValue;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing from localStorage:', e);
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }
  },
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        textArea.remove();
        return true;
      } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
        textArea.remove();
        return false;
      }
    }
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

/**
 * Download content as file
 */
export const downloadAsFile = (content, filename, type = 'text/plain') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default {
  generateSessionId,
  formatTime,
  isSpeechRecognitionSupported,
  isTextToSpeechSupported,
  isGeolocationSupported,
  truncateText,
  scrollToBottom,
  debounce,
  isValidJSON,
  parseBoldText,
  getBrowserLanguage,
  storage,
  copyToClipboard,
  downloadAsFile,
};
