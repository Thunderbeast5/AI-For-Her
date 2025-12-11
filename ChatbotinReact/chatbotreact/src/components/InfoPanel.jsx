import React from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import './InfoPanel.css';

const InfoPanel = ({ isOpen, onClose, content, type, language }) => {
  // Configure marked options
  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  // Render markdown content
  const renderMarkdown = (text) => {
    if (!text) return { __html: '' };
    const rawMarkup = marked(text);
    const cleanMarkup = DOMPurify.sanitize(rawMarkup);
    return { __html: cleanMarkup };
  };

  if (!isOpen) return null;

  return (
    <div className={`info-panel ${isOpen ? 'open' : ''}`}>
      <div className="info-panel-header">
        <h3>
          {type === 'plan' && '📋 Business Plan'}
          {type === 'schemes' && '💰 Government Schemes'}
          {type === 'resources' && '📍 Local Resources'}
          {type === 'analysis' && '📊 Location Analysis'}
        </h3>
        <button className="info-panel-close" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="info-panel-content">
        {/* Business Plan Display */}
        {type === 'plan' && content && (
          <div className="business-plan">
            {content.title && (
              <div className="plan-title">
                <h2>{content.title}</h2>
                {content.subtitle && <p>{content.subtitle}</p>}
              </div>
            )}

            {content.sections && content.sections.map((section, index) => (
              <div key={index} className="plan-section">
                <h3>
                  {section.icon} {section.title}
                </h3>
                <div
                  className="section-content"
                  dangerouslySetInnerHTML={renderMarkdown(section.content)}
                />
              </div>
            ))}

            {content.raw && (
              <div
                className="plan-raw"
                dangerouslySetInnerHTML={renderMarkdown(content.raw)}
              />
            )}
          </div>
        )}

        {/* Government Schemes Display */}
        {type === 'schemes' && content && (
          <div className="schemes-panel">
            {content.schemes && content.schemes.map((scheme, index) => (
              <div key={index} className="scheme-item">
                <h3>{scheme.name}</h3>
                <p className="scheme-description">{scheme.description}</p>
                
                {scheme.eligibility && (
                  <div className="scheme-detail">
                    <strong>📋 Eligibility:</strong>
                    <p>{scheme.eligibility}</p>
                  </div>
                )}
                
                {scheme.benefits && (
                  <div className="scheme-detail">
                    <strong>✨ Benefits:</strong>
                    <p>{scheme.benefits}</p>
                  </div>
                )}
                
                {scheme.howToApply && (
                  <div className="scheme-detail">
                    <strong>📝 How to Apply:</strong>
                    <p>{scheme.howToApply}</p>
                  </div>
                )}
                
                {scheme.link && (
                  <a
                    href={scheme.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="scheme-link"
                  >
                    Learn More →
                  </a>
                )}
              </div>
            ))}

            {content.raw && (
              <div
                className="schemes-raw"
                dangerouslySetInnerHTML={renderMarkdown(content.raw)}
              />
            )}
          </div>
        )}

        {/* Resources Display */}
        {type === 'resources' && content && (
          <div className="resources-panel">
            {content.resources && content.resources.map((resource, index) => (
              <div key={index} className="resource-item">
                <h3>
                  {resource.icon} {resource.name}
                </h3>
                {resource.address && (
                  <p className="resource-address">📍 {resource.address}</p>
                )}
                {resource.distance && (
                  <p className="resource-distance">📏 {resource.distance.toFixed(2)} km away</p>
                )}
                {resource.type && (
                  <p className="resource-type">🏷️ {resource.type}</p>
                )}
                {resource.contact && (
                  <p className="resource-contact">📞 {resource.contact}</p>
                )}
              </div>
            ))}

            {content.raw && (
              <div
                className="resources-raw"
                dangerouslySetInnerHTML={renderMarkdown(content.raw)}
              />
            )}
          </div>
        )}

        {/* Location Analysis Display */}
        {type === 'analysis' && content && (
          <div className="analysis-panel">
            {content.summary && (
              <div className="analysis-summary">
                <h3>📊 Summary</h3>
                <div dangerouslySetInnerHTML={renderMarkdown(content.summary)} />
              </div>
            )}

            {content.insights && content.insights.map((insight, index) => (
              <div key={index} className="analysis-insight">
                <h4>{insight.title}</h4>
                <div dangerouslySetInnerHTML={renderMarkdown(insight.content)} />
              </div>
            ))}

            {content.raw && (
              <div
                className="analysis-raw"
                dangerouslySetInnerHTML={renderMarkdown(content.raw)}
              />
            )}
          </div>
        )}

        {/* Fallback for raw content */}
        {!['plan', 'schemes', 'resources', 'analysis'].includes(type) && content && (
          <div
            className="info-raw"
            dangerouslySetInnerHTML={renderMarkdown(
              typeof content === 'string' ? content : JSON.stringify(content, null, 2)
            )}
          />
        )}
      </div>
    </div>
  );
};

export default InfoPanel;
