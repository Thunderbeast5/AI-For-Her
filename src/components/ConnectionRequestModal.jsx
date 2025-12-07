import React, { useState } from 'react';

const ConnectionRequestModal = ({ mentor, onClose, onSubmit }) => {
  const [requestMessage, setRequestMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requestMessage.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit(requestMessage);
      onClose();
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to send connection request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-t-lg">
          <h3 className="text-xl font-bold">Request Personal Mentoring</h3>
          <p className="text-sm text-pink-100 mt-1">
            Send a connection request to {mentor.name}
          </p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Mentor Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {mentor.name?.charAt(0) || 'M'}
                </span>
              </div>
              <div>
                <p className="font-bold text-gray-800">{mentor.name}</p>
                <p className="text-sm text-gray-600">{mentor.expertise || 'Expert Mentor'}</p>
              </div>
            </div>
            
            {mentor.hourlyRate && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Hourly Rate:</span>
                  <span className="font-bold text-pink-600">₹{mentor.hourlyRate}/hr</span>
                </div>
              </div>
            )}
          </div>

          {/* Request Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Why do you want to connect? <span className="text-red-500">*</span>
            </label>
            <textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="Tell the mentor about your goals, challenges, and what you hope to learn..."
              rows="6"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
              required
              disabled={submitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              The mentor will review your request before accepting.
            </p>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium">How it works:</p>
                <ol className="list-decimal list-inside mt-1 space-y-1 text-xs">
                  <li>Send your request with a message</li>
                  <li>Wait for mentor to accept</li>
                  <li>Complete payment after approval</li>
                  <li>Start 1-on-1 mentoring chat</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!requestMessage.trim() || submitting}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-pink-600 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {submitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                'Send Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConnectionRequestModal;
