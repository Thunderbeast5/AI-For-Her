import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { getText } from '../utils/translations';
import './Message.css';

const Message = ({ message, onButtonClick, onIdeaSelect, language }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Configure marked options
  useEffect(() => {
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
  }, []);

  // Render markdown content
  const renderMarkdown = (text) => {
    const rawMarkup = marked(text);
    const cleanMarkup = DOMPurify.sanitize(rawMarkup);
    return { __html: cleanMarkup };
  };

  // Handle text-to-speech
  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(message.text);
    
    // Set language
    if (language === 'hi-IN') {
      utterance.lang = 'hi-IN';
    } else if (language === 'mr-IN') {
      utterance.lang = 'mr-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div className={`message ${message.sender}`}>
      <div className="message-content">
        <div 
          className="message-text"
          dangerouslySetInnerHTML={renderMarkdown(message.text)}
        />
        
        {/* Buttons */}
        {message.buttons && message.buttons.length > 0 && (
          <div className="message-buttons">
            {message.buttons.map((button, index) => {
              // ✅ MATCH FLASK: Style budget buttons differently
              const isBudgetButton = button.value && button.value.startsWith('budget_');
              const buttonClass = isBudgetButton ? 'chat-button budget-button' : 'chat-button';
              
              return (
                <button
                  key={index}
                  className={buttonClass}
                  onClick={() => onButtonClick(button.value, button.text)}
                >
                  {button.text}
                </button>
              );
            })}
          </div>
        )}

        {/* Business Ideas Display - Matching Flask */}
        {message.ideas && message.ideas.length > 0 && (
          <div className="business-ideas">
            <h3>{getText('personalized_ideas_title', language)}</h3>
            <p style={{ color: '#666', marginBottom: '20px', fontSize: '0.95em' }}>
              {getText('ideas_subtitle', language)}
            </p>
            <div className="ideas-grid">
              {message.ideas.map((idea, index) => {
                // ✅ MATCH FLASK: Extract all fields exactly as Flask sends them
                const minInv = idea.required_investment_min || idea.investment_min || 5000;
                const maxInv = idea.required_investment_max || idea.investment_max || 50000;
                const homeBased = idea.home_based || false;
                const competition = idea.competition_level || 'Medium';
                const profitability = idea.profitability || 'Medium';
                const marketSize = idea.market_size || '';
                const funding = idea.funding_suggestion || '';
                const whyLocation = idea.why_this_location || '';
                const actualCost = idea.actual_realistic_cost || '';
                
                const compColor = competition === 'Low' ? '#10b981' : (competition === 'Medium' ? '#f59e0b' : '#ef4444');
                const profitColor = profitability === 'High' ? '#10b981' : (profitability === 'Medium' ? '#f59e0b' : '#ef4444');
                
                return (
                  <div
                    key={index}
                    className="business-idea-card clickable"
                    onClick={() => onIdeaSelect(idea.id || index, idea.title)}
                  >
                    <div className="idea-header">
                      <div className="idea-number">#{index + 1}</div>
                      <div className="idea-badges">
                        {homeBased && (
                          <span className="badge badge-home">🏠 {getText('home_based', language)}</span>
                        )}
                        <span className="badge" style={{ background: compColor }}>
                          {getText('competition', language)}: {competition}
                        </span>
                        {profitability && (
                          <span className="badge" style={{ background: profitColor }}>
                            {getText('profitability', language)}: {profitability}
                          </span>
                        )}
                      </div>
                    </div>
                    <h4>{idea.title}</h4>
                    <p className="idea-desc">
                      {idea.description && idea.description.length > 150 
                        ? idea.description.substring(0, 150) + '...' 
                        : idea.description}
                    </p>
                    {whyLocation && (
                      <p className="why-location">
                        📍 <strong>{getText('for_location', language)}:</strong> {whyLocation.length > 100 ? whyLocation.substring(0, 100) + '...' : whyLocation}
                      </p>
                    )}
                    {actualCost && (
                      <p className="actual-cost">
                        💵 <strong>{getText('realistic_cost', language)}:</strong> {actualCost}
                      </p>
                    )}
                    {marketSize && (
                      <p className="market-size">
                        📊 <strong>{getText('market', language)}:</strong> {marketSize}
                      </p>
                    )}
                    {funding && (
                      <p className="funding-hint">
                        💰 <strong>{getText('funding', language)}:</strong> {funding.length > 80 ? funding.substring(0, 80) + '...' : funding}
                      </p>
                    )}
                    <div className="idea-footer">
                      <p className="investment">💵 ₹{minInv.toLocaleString()} - ₹{maxInv.toLocaleString()}</p>
                      <button 
                        className="btn-select"
                        onClick={(e) => {
                          e.stopPropagation();
                          onIdeaSelect(idea.id || index, idea.title);
                        }}
                      >
                        {getText('select_plan_btn', language)}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Schemes Display - Matching Flask */}
        {message.schemes && message.schemes.length > 0 && (
          <div className="schemes-section">
            <h3>💰 Government Schemes for You</h3>
            <p style={{ color: '#666', marginBottom: '20px', fontSize: '0.95em' }}>
              Click on any scheme to learn more about eligibility and application process
            </p>
            <div className="schemes-list">
              {message.schemes.map((scheme, index) => {
                // ✅ MATCH FLASK: Handle all scheme fields exactly
                const title = scheme.title || scheme.name || `Scheme ${index + 1}`;
                const region = scheme.region || 'All India';
                const category = scheme.category || '';
                const eligibility = scheme.eligibility || 'View details';
                const benefit = scheme.benefit || scheme.benefits || 'Financial assistance';
                const documents = scheme.documents || '';
                const howToApply = scheme.how_to_apply || '';
                const applyLink = scheme.apply_link || '';
                
                const eligibilityText = eligibility.length > 120 ? eligibility.substring(0, 120) + '...' : eligibility;
                const benefitText = benefit.length > 120 ? benefit.substring(0, 120) + '...' : benefit;
                const documentsText = documents && documents.length > 100 ? documents.substring(0, 100) + '...' : documents;
                
                return (
                  <div key={index} className="scheme-card clickable">
                    <div className="scheme-header">
                      <h4>{title}</h4>
                      <div className="scheme-meta">
                        {region && <span className="status-badge">📍 {region}</span>}
                        {category && <span className="category-badge">{category}</span>}
                        {applyLink && <span className="status-badge apply-badge">✓ Apply Online</span>}
                      </div>
                    </div>
                    <div className="scheme-body">
                      <p><strong>🎯 Eligibility:</strong> {eligibilityText}</p>
                      <p><strong>💵 Benefit:</strong> {benefitText}</p>
                      {documentsText && (
                        <p><strong>📄 Documents:</strong> {documentsText}</p>
                      )}
                      {howToApply && (
                        <p><strong>📝 How to Apply:</strong> {howToApply.length > 100 ? howToApply.substring(0, 100) + '...' : howToApply}</p>
                      )}
                    </div>
                    <div className="scheme-footer">
                      {applyLink ? (
                        <a 
                          href={applyLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="apply-link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Apply Now →
                        </a>
                      ) : (
                        <button className="btn-link">
                          View Full Details →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Business Plan Display - Inline like Flask */}
        {message.plan && (
          <div className="business-plan-inline">
            {message.plan.sections && message.plan.sections.map((section, index) => (
              <div key={index} className="plan-section-inline">
                <h3>{section.title}</h3>
                <div
                  className="plan-section-content"
                  dangerouslySetInnerHTML={renderMarkdown(section.content)}
                />
              </div>
            ))}
            {message.plan.raw && (
              <div
                className="plan-raw-content"
                dangerouslySetInnerHTML={renderMarkdown(message.plan.raw)}
              />
            )}
          </div>
        )}

        {/* Speak Button for bot messages */}
        {message.sender === 'bot' && (
          <button
            className="speak-button"
            onClick={handleSpeak}
            title={isSpeaking ? 'Stop' : 'Listen'}
          >
            {isSpeaking ? '🔇 Stop' : '🔊 Listen'}
          </button>
        )}
      </div>
      
      {message.timestamp && (
        <div className="message-timestamp">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      )}
    </div>
  );
};

export default Message;
