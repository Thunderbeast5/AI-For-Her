import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import EntrepreneurDashboard from './EntrepreneurDashboard'
import MentorDashboard from './MentorDashboard'
import InvestorDashboard from './InvestorDashboard'

const Dashboard = () => {
  const navigate = useNavigate()
  const { currentUser, userRole } = useAuth()
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState(null)

  // Determine user role and set loading state
  useEffect(() => {
    if (userRole) {
      setRole(userRole)
      setLoading(false)
    } else if (currentUser) {
      // Fetch role from Firestore if not in context
      const fetchRole = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
          if (userDoc.exists()) {
            setRole(userDoc.data().role || 'entrepreneur')
          } else {
            setRole('entrepreneur') // Default role
          }
        } catch (error) {
          console.error('Error fetching user role:', error)
          setRole('entrepreneur') // Default on error
        } finally {
          setLoading(false)
        }
      }
      fetchRole()
    }
  }, [currentUser, userRole])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Render appropriate dashboard based on role
  if (role === 'mentor') {
    return <MentorDashboard />
  }

  if (role === 'investor') {
    return <InvestorDashboard />
  }

  // Default to entrepreneur dashboard
  return <EntrepreneurDashboard />
}

export default Dashboard
