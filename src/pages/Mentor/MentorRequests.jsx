import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import DashboardLayout from '../../components/DashboardLayout';
import MentorSidebar from '../../components/MentorSidebar';

export default function MentorRequests() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const { currentUser } = useAuth();

  const fetchPendingRequests = useCallback(async () => {
    try {
      const q = query(
        collection(db, 'connections'),
        where('mentorId', '==', currentUser.uid),
        where('status', '==', 'pending'),
        where('paymentStatus', '==', 'pending'),
        where('mentorType', '==', 'personal')
      );
      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPendingRequests(requests);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      setPendingRequests([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.uid) {
      fetchPendingRequests();
    }
  }, [currentUser, fetchPendingRequests]);

  const handleAccept = async (request) => {
    if (!window.confirm('Accept this connection request? The entrepreneur will be prompted to complete payment.')) {
      return;
    }

    setProcessingId(request.id);
    try {
      const connectionRef = doc(db, 'connections', request.id);
      await updateDoc(connectionRef, { status: 'accepted' });

      // Create a notification for the entrepreneur so it shows in their navbar bell
      await addDoc(collection(db, 'notifications'), {
        userId: request.entrepreneurId,
        title: 'Mentor accepted your request',
        message: `${currentUser.displayName || 'Your mentor'} has accepted your personal mentoring request. Click to complete payment and start your sessions.`,
        type: 'mentor-connection-accepted',
        link: '/mentors',
        connectionId: request.id,
        read: false,
        createdAt: serverTimestamp(),
      });

      alert('Request accepted! The entrepreneur will see a notification to complete payment.');
      fetchPendingRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request: ' + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (connectionId) => {
    const reason = window.prompt('Please provide a reason for rejection (optional):');
    if (reason === null) return; // User cancelled

    setProcessingId(connectionId);
    try {
      const connectionRef = doc(db, 'connections', connectionId);
      await updateDoc(connectionRef, { status: 'rejected', rejectionReason: reason });
      alert('Request rejected.');
      fetchPendingRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request: ' + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <DashboardLayout sidebar={<MentorSidebar />}>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Connection Requests</h1>
          <p className="text-gray-600">Review and manage pending personal mentoring requests</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Pending Requests</h2>
            <p className="text-gray-500">You don't have any connection requests at the moment.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      {request.entrepreneurName || 'Entrepreneur'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Requested on {new Date(request.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                    Pending Review
                  </span>
                </div>

                {/* Request Message */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Request Message:</p>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {request.requestMessage || 'No message provided'}
                  </p>
                </div>

                {/* Entrepreneur Info */}
                {request.entrepreneurEmail && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Email:</span> {request.entrepreneurEmail}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleAccept(request)}
                    disabled={processingId === request.id}
                    className="flex-1 bg-linear-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {processingId === request.id ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Accept Request</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    disabled={processingId === request.id}
                    className="flex-1 bg-linear-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {processingId === request.id ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Reject Request</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
