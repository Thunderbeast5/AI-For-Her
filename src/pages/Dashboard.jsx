import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import EntrepreneurDashboard from './Entrepreneur/EntrepreneurDashboard'
import MentorDashboard from './Mentor/MentorDashboard'
import InvestorDashboard from './Investor/InvestorDashboard'
import WarliLoader from '../components/WarliLoader'

const Dashboard = () => {
    const { currentUser, userRole } = useAuth()
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState(null)

  // Determine user role and set loading state
  useEffect(() => {
    if (userRole) {
      setRole(userRole)
      setLoading(false)
    } else if (currentUser) {
      // Use role from currentUser or localStorage
      const storedRole = localStorage.getItem('userRole')
      setRole(storedRole || currentUser.role || 'entrepreneur')
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [currentUser, userRole])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <WarliLoader size={88} />
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
