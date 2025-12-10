import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import EntrepreneurSidebar from '../../components/EntrepreneurSidebar'
import { StarIcon, MapPinIcon } from '@heroicons/react/24/solid'
import { UserIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';

const Mentors = () => {
  const { currentUser } = useAuth()
  const [formData, setFormData] = useState({
    sector: '',
    stage: '',
    goals: ''
  })
  const [showResults, setShowResults] = useState(false)
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState(null);
  const [connectingMentorId, setConnectingMentorId] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState(new Map()) // mentorId -> status
  const [matchThreshold, setMatchThreshold] = useState(50) // Minimum match percentage to show

  const sectors = [
    'Technology', 'Healthcare', 'Education', 'E-commerce', 'Food & Beverage', 
    'Fashion', 'Finance', 'Manufacturing', 'Services', 'Other'
  ]

  const stages = [
    'Idea Stage', 'MVP Development', 'Early Stage', 'Growth Stage', 'Scaling'
  ]

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
          if (userDoc.exists()) {
            const profile = userDoc.data()
            setUserProfile(profile)
            // Auto-populate sector from user profile
            if (profile.sector) {
              setFormData(prev => ({ ...prev, sector: profile.sector }))
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
        }
      }
    }
    fetchUserProfile()
  }, [currentUser])

  // Calculate match score based on profile similarity
  const calculateMatchScore = (mentor, searchCriteria) => {
    let score = 0
    let maxScore = 0

    // Sector match (40 points)
    maxScore += 40
    if (mentor.sector && searchCriteria.sector) {
      if (mentor.sector.toLowerCase() === searchCriteria.sector.toLowerCase()) {
        score += 40
      }
    }

    // Expertise relevance (30 points)
    maxScore += 30
    if (mentor.expertise && searchCriteria.goals) {
      const goals = searchCriteria.goals.toLowerCase()
      const expertise = mentor.expertise.toLowerCase()
      // Check for keyword matches
      const keywords = ['funding', 'team', 'product', 'marketing', 'scale', 'growth']
      let matchedKeywords = 0
      keywords.forEach(keyword => {
        if (goals.includes(keyword) && expertise.includes(keyword)) {
          matchedKeywords++
        }
      })
      score += (matchedKeywords / keywords.length) * 30
    }

    // Experience level (30 points)
    maxScore += 30
    if (mentor.yearsOfExperience) {
      const years = parseInt(mentor.yearsOfExperience)
      if (years >= 10) score += 30
      else if (years >= 5) score += 20
      else if (years >= 2) score += 10
    }

    // Calculate percentage
    return Math.round((score / maxScore) * 100)
  }

  // Check existing connections
  const checkExistingConnections = async () => {
    if (!currentUser) return
    
    try {
      const connectionsQuery = query(
        collection(db, 'connections'),
        where('menteeId', '==', currentUser.uid)
      )
      
      const snapshot = await getDocs(connectionsQuery)
      const statusMap = new Map()
      
      snapshot.forEach((doc) => {
        const connection = doc.data()
        statusMap.set(connection.mentorId, connection.status)
      })
      
      setConnectionStatus(statusMap)
    } catch (error) {
      console.error('Error checking connections:', error)
    }
  }

  // Fetch mentors from Firestore
  const fetchMentors = async (searchCriteria) => {
    setLoading(true)
    try {
      // Query for all users with role 'mentor'
      const mentorsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'mentor')
      )
      
      const querySnapshot = await getDocs(mentorsQuery)
      const mentorsList = []
      
      querySnapshot.forEach((doc) => {
        const mentorData = doc.data()
        const matchScore = calculateMatchScore(mentorData, searchCriteria)
        
        mentorsList.push({
          id: doc.id,
          name: `${mentorData.firstName || ''} ${mentorData.lastName || ''}`.trim() || 'Anonymous Mentor',
          email: mentorData.email,
          sector: mentorData.sector || 'Not specified',
          companyName: mentorData.companyName || 'Independent',
          yearsOfExperience: mentorData.yearsOfExperience || 'N/A',
          expertise: mentorData.expertise || 'No expertise listed',
          bio: mentorData.bio || 'No bio available',
          matchScore: matchScore
        })
      })
      
      // Sort by match score (highest first)
      mentorsList.sort((a, b) => b.matchScore - a.matchScore)
      
      // Filter mentors based on match threshold (only show relevant matches)
      const relevantMentors = mentors.filter(mentor => mentor.matchScore >= matchThreshold);
      
      setMentors(relevantMentors)
      
      // Check existing connections
      await checkExistingConnections();
    } catch (error) {
      console.error('Error fetching mentors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await fetchMentors(formData)
    setShowResults(true)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleConnect = async (mentor) => {
    if (!currentUser) return
    
    // Check if already connected
    if (connectionStatus.has(mentor.id)) {
      alert('You already have a connection with this mentor.')
      return
    }
    
    setConnectingMentorId(mentor.id)
    try {
      // Create a connection request (pending approval)
      await addDoc(collection(db, 'connections'), {
        mentorId: mentor.id,
        menteeId: currentUser.uid,
        menteeName: currentUser.displayName || 'Anonymous',
        mentorName: mentor.name,
        menteeEmail: currentUser.email,
        mentorEmail: mentor.email,
        menteeSector: userProfile?.sector || 'N/A',
        menteeStartup: userProfile?.startupName || 'N/A',
        status: 'pending',
        createdAt: serverTimestamp()
      })
      
      // Create notification for mentor (connection request)
      await addDoc(collection(db, 'notifications'), {
        userId: mentor.id,
        title: 'New Connection Request',
        message: `${currentUser.displayName || 'A mentee'} wants to connect with you!`,
        link: '/mentees',
        read: false,
        createdAt: serverTimestamp()
      })
      
      // Create notification for mentee (request sent)
      await addDoc(collection(db, 'notifications'), {
        userId: currentUser.uid,
        title: 'Connection Request Sent',
        message: `Your connection request has been sent to ${mentor.name}. Waiting for approval.`,
        link: '/mentors',
        read: false,
        createdAt: serverTimestamp()
      })
      
      // Update status map
      setConnectionStatus(prev => new Map(prev).set(mentor.id, 'pending'))
      alert(`Connection request sent to ${mentor.name}!`)
    } catch (error) {
      console.error('Error connecting with mentor:', error)
      alert('Failed to connect. Please try again.')
    } finally {
      setConnectingMentorId(null)
    }
  }

  return (
    <DashboardLayout sidebar={<EntrepreneurSidebar />}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Mentor</h1>
        <p className="text-gray-600 mb-8">Connect with experienced entrepreneurs who can guide your journey</p>

            {!showResults ? (
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What sector is your business in?
                    </label>
                    <select
                      value={formData.sector}
                      onChange={(e) => handleInputChange('sector', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
                      required
                    >
                      <option value="">Select a sector</option>
                      {sectors.map(sector => (
                        <option key={sector} value={sector}>{sector}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What stage is your startup in?
                    </label>
                    <select
                      value={formData.stage}
                      onChange={(e) => handleInputChange('stage', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
                      required
                    >
                      <option value="">Select a stage</option>
                      {stages.map(stage => (
                        <option key={stage} value={stage}>{stage}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What are your main goals?
                    </label>
                    <textarea
                      value={formData.goals}
                      onChange={(e) => handleInputChange('goals', e.target.value)}
                      placeholder="e.g., Scale my team, raise funding, improve product-market fit..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 h-24 resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-pink-400 text-white py-4 rounded-xl font-semibold hover:bg-pink-500 transition-all duration-200"
                  >
                    Find My Match
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Your Mentor Matches {mentors.length > 0 && `(${mentors.length} found)`}
                  </h2>
                  <button
                    onClick={() => setShowResults(false)}
                    className="px-4 py-2 text-pink-500 border border-pink-400 rounded-lg hover:bg-pink-50 transition-colors"
                  >
                    New Search
                  </button>
                </div>

                {/* Match Threshold Filter */}
                <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Match Threshold: {matchThreshold}%
                      </label>
                      <p className="text-xs text-gray-500">Only showing mentors with {matchThreshold}% or higher match</p>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={matchThreshold}
                      onChange={(e) => setMatchThreshold(parseInt(e.target.value))}
                      className="w-48 ml-4"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400"></div>
                    <p className="mt-4 text-gray-600">Finding the best mentors for you...</p>
                  </div>
                ) : mentors.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center">
                    <p className="text-gray-600 mb-4">No relevant mentors found with {matchThreshold}% or higher match.</p>
                    <p className="text-sm text-gray-500">Try lowering the match threshold or adjusting your search parameters.</p>
                  </div>
                ) : (
                  mentors.map((mentor, index) => (
                  <div key={index} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-linear-to-r from-pink-300 to-pink-400 rounded-full flex items-center justify-center">
                        <UserIcon className="w-8 h-8 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
                            <p className="text-gray-600">{mentor.companyName} • {mentor.yearsOfExperience} years experience</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1 mb-1">
                              <StarIcon className="w-4 h-4 text-yellow-400" />
                              <span className="text-sm font-medium">{mentor.matchScore}% match</span>
                            </div>
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-linear-to-r from-green-400 to-green-500 h-2 rounded-full"
                                style={{ width: `${mentor.matchScore}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <span className="px-3 py-1 bg-gray-100 rounded-full">{mentor.sector}</span>
                        </div>

                        <p className="text-gray-600 mb-4">{mentor.bio}</p>

                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Areas of Expertise:</p>
                          <p className="text-sm text-gray-600 bg-pink-50 p-3 rounded-lg">{mentor.expertise}</p>
                        </div>

                        <button 
                          onClick={() => handleConnect(mentor)}
                          disabled={connectingMentorId === mentor.id || connectionStatus.has(mentor.id)}
                          className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                            connectionStatus.get(mentor.id) === 'accepted'
                              ? 'bg-green-500 text-white'
                              : connectionStatus.get(mentor.id) === 'pending'
                              ? 'bg-orange-400 text-white'
                              : 'bg-pink-400 text-white hover:bg-pink-500'
                          }`}
                        >
                          {connectingMentorId === mentor.id 
                            ? 'Sending...' 
                            : connectionStatus.get(mentor.id) === 'accepted'
                            ? 'Connected'
                            : connectionStatus.get(mentor.id) === 'pending'
                            ? 'Pending'
                            : connectionStatus.get(mentor.id) === 'rejected'
                            ? 'Declined'
                            : 'Connect'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
                )}
              </div>
            )}
      </div>
    </DashboardLayout>
  )
}

export default Mentors
