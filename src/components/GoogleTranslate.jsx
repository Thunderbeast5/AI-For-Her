import { useEffect } from 'react';

let translateInitialized = false;

const GoogleTranslate = () => {
  useEffect(() => {
    // Only initialize once globally
    if (translateInitialized) return;

    const initTranslate = () => {
      if (window.google && window.google.translate) {
        const container = document.getElementById('google_translate_element');
        if (container && !container.hasChildNodes()) {
          try {
            new window.google.translate.TranslateElement(
              {
                pageLanguage: 'en',
                includedLanguages: 'en,hi,mr,ta,te,bn,gu',
                layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false
              },
              'google_translate_element'
            );
            translateInitialized = true;
          } catch (error) {
            console.error('Error initializing Google Translate:', error);
          }
        }
      }
    };

    // Set global init function
    window.googleTranslateElementInit = initTranslate;

    // Add script if not present
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google && window.google.translate) {
      initTranslate();
    }
  }, []);

  return (
    <div style={{ display: 'inline-block' }}>
      <div id="google_translate_element" style={{ display: 'inline-block' }}></div>
    </div>
  );
};

export default GoogleTranslate;
