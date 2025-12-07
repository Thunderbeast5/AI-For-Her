import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import EntrepreneurDashboard from './Entrepreneur/EntrepreneurDashboard'
import MentorDashboard from './Mentor/MentorDashboard'
import InvestorDashboard from './Investor/InvestorDashboard'

const Dashboard = () => {
  const navigate = useNavigate()
  const { currentUser, userRole } = useAuth()
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState(null)

  // Determine user role and set loading state
  useEffect(() => {
    console.log('🎯 Dashboard useEffect - userRole:', userRole, 'currentUser:', currentUser)
    
    if (userRole) {
      console.log('✅ Using userRole from context:', userRole)
      setRole(userRole)
      setLoading(false)
    } else if (currentUser) {
      // Use role from currentUser or localStorage
      const storedRole = localStorage.getItem('userRole')
      console.log('📦 Stored role from localStorage:', storedRole)
      console.log('👤 Role from currentUser:', currentUser.role)
      setRole(storedRole || currentUser.role || 'entrepreneur')
      setLoading(false)
    } else {
      console.log('⚠️ No userRole or currentUser')
      setLoading(false)
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
  console.log('🎨 Rendering dashboard for role:', role)
  
  if (role === 'mentor') {
    console.log('👨‍🏫 Rendering MentorDashboard')
    return <MentorDashboard />
  }

  if (role === 'investor') {
    console.log('💰 Rendering InvestorDashboard')
    return <InvestorDashboard />
  }

  // Default to entrepreneur dashboard
  console.log('🚀 Rendering EntrepreneurDashboard (default)')
  return <EntrepreneurDashboard />
}

export default Dashboard
