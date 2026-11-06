import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import EntrepreneurDashboard from './Entrepreneur/EntrepreneurDashboard'
import MentorDashboard from './Mentor/MentorDashboard'
import InvestorDashboard from './Investor/InvestorDashboard'
import WarliLoader from '../components/WarliLoader'
import DashboardLayout from '../components/DashboardLayout'
import EntrepreneurSidebar from '../components/EntrepreneurSidebar'
import MentorSidebar from '../components/MentorSidebar'
import InvestorSidebar from '../components/InvestorSidebar'

const Dashboard = () => {
  const { currentUser, userRole } = useAuth()
  const initialRole = userRole || localStorage.getItem('userRole') || currentUser?.role || null
  const [role, setRole] = useState(initialRole)
  const [loading, setLoading] = useState(!initialRole)

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
    } else if (localStorage.getItem('userRole')) {
      setRole(localStorage.getItem('userRole'))
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [currentUser, userRole])

  const getSidebar = () => {
    const activeRole = role || userRole || localStorage.getItem('userRole') || currentUser?.role
    if (activeRole === 'mentor') return <MentorSidebar />
    if (activeRole === 'investor') return <InvestorSidebar />
    return <EntrepreneurSidebar />
  }

  if (loading) {
    return (
      <DashboardLayout sidebar={getSidebar()}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <WarliLoader size={88} />
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
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
