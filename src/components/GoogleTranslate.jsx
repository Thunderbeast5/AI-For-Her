import { useEffect, useState } from 'react';

const GoogleTranslate = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Initialize Google Translate
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,hi,mr,ta,te,bn,gu',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
          },
          'google_translate_element'
        );
        console.log('Google Translate initialized successfully');
        setLoaded(true);
      }
    };

    // Add Google Translate script
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.onload = () => console.log('Google Translate script loaded');
      script.onerror = () => {
        console.error('Failed to load Google Translate script');
        setLoaded(false);
      };
      document.body.appendChild(script);
    } else if (window.google && window.google.translate) {
      // Script already loaded, just initialize
      window.googleTranslateElementInit();
    }
  }, []);

  return (
    <div style={{ display: 'inline-block' }}>
      <div id="google_translate_element" style={{ display: 'inline-block' }}></div>
    </div>
  );
};

export default GoogleTranslate;
