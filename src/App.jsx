import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import { Toaster } from './components/ui/sonner'
import WarliLoader from './components/WarliLoader'
import DashboardLayout from './components/DashboardLayout'
import EntrepreneurSidebar from './components/EntrepreneurSidebar'
import InvestorSidebar from './components/InvestorSidebar'
import MentorSidebar from './components/MentorSidebar'
import { useAuth } from './hooks/useAuth'
const LandingPage = lazy(() => import('./pages/LandingPage'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Signup = lazy(() => import('./pages/Signup'))
const Login = lazy(() => import('./pages/Login'))
const RoleSelection = lazy(() => import('./pages/RoleSelection'))
import ProtectedRoute from './components/ProtectedRoute'
const AboutUs = lazy(() => import('./pages/AboutUs'))
const Saharohi = lazy(() => import('./pages/SaharohiAI/Saharohi'))



// Entrepreneur Pages
const Chat = lazy(() => import('./pages/Entrepreneur/Chat'))
const CreateStartup = lazy(() => import('./pages/Entrepreneur/CreateStartup'))
const MyStartups = lazy(() => import('./pages/Entrepreneur/MyStartups'))
const Journey = lazy(() => import('./pages/Entrepreneur/Journey'))
const Mentors = lazy(() => import('./pages/Entrepreneur/Mentors'))
const Opportunities = lazy(() => import('./pages/Entrepreneur/Opportunities'))
const SelfHelpGroups = lazy(() => import('./pages/Entrepreneur/SelfHelpGroups'))
const ListProject = lazy(() => import('./pages/Entrepreneur/ListProject'))

// Investor Pages
const BrowseProjects = lazy(() => import('./pages/Investor/BrowseProjects'))
const Portfolio = lazy(() => import('./pages/Investor/Portfolio'))
const SavedProjects = lazy(() => import('./pages/Investor/SavedProjects'))
const Investments = lazy(() => import('./pages/Investor/Investments'))

// Mentor Pages
const MentorDashboard = lazy(() => import('./pages/Mentor/MentorDashboard'))
const Mentees = lazy(() => import('./pages/Mentor/Mentees'))
const ChatSessions = lazy(() => import('./pages/Mentor/ChatSessions'))
const GroupSessions = lazy(() => import('./pages/Mentor/GroupSessions'))
const Schedule = lazy(() => import('./pages/Mentor/Schedule'))
const MentorRequests = lazy(() => import('./pages/Mentor/MentorRequests'))
const CreateGroup = lazy(() => import('./pages/Mentor/CreateGroup'))
const MyGroups = lazy(() => import('./pages/Mentor/MyGroups'))

// Shared Pages
const Analytics = lazy(() => import('./pages/Analytics'))
const Settings = lazy(() => import('./pages/Settings'))
const Profile = lazy(() => import('./pages/Profile'))
const EnterpriseProducts = lazy(() => import('./pages/Enterprise/EnterpriseProducts'))
const EnterpriseStorefront = lazy(() => import('./pages/Enterprise/EnterpriseStorefront'))

function PageLoadingFallback() {
  const { pathname } = useLocation()
  const { currentUser, userRole } = useAuth()
  const role = userRole || currentUser?.role || localStorage.getItem('userRole') || 'entrepreneur'
  const usesDashboardLayout = pathname !== '/enterprise/store' &&
    !['/', '/signup', '/login', '/aboutus', '/saharohi', '/role-selection'].includes(pathname)

  if (!usesDashboardLayout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffdf9]">
        <WarliLoader size={88} />
      </div>
    )
  }

  const sidebar = pathname.startsWith('/mentor/') || role === 'mentor'
    ? <MentorSidebar />
    : role === 'investor'
      ? <InvestorSidebar />
      : <EntrepreneurSidebar />

  return (
    <DashboardLayout sidebar={sidebar}>
      <div className="min-h-full grid place-items-center">
        <WarliLoader size={88} />
      </div>
    </DashboardLayout>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-white font-sans">
          <Toaster position="top-right" richColors />
          <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
         
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/saharohi" element={<Saharohi />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/mentors" element={
              <ProtectedRoute>
                <Mentors />
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } />
            <Route path="/opportunities" element={
              <ProtectedRoute>
                <Opportunities />
              </ProtectedRoute>
            } />
            <Route path="/journey" element={
              <ProtectedRoute>
                <Journey />
              </ProtectedRoute>
            } />
            <Route path="/shg" element={
              <ProtectedRoute>
                <SelfHelpGroups />
              </ProtectedRoute>
            } />
            <Route path="/create-startup" element={
              <ProtectedRoute>
                <CreateStartup />
              </ProtectedRoute>
            } />
            <Route path="/my-startups" element={
              <ProtectedRoute>
                <MyStartups />
              </ProtectedRoute>
            } />
            <Route path="/startups" element={
              <ProtectedRoute>
                <MyStartups />
              </ProtectedRoute>
            } />
            <Route path="/list-project" element={
              <ProtectedRoute>
                <ListProject />
              </ProtectedRoute>
            } />
            <Route path="/role-selection" element={<RoleSelection />} />
            
            {/* Investor Routes */}
            <Route path="/browse-projects" element={
              <ProtectedRoute>
                <BrowseProjects />
              </ProtectedRoute>
            } />
            <Route path="/portfolio" element={
              <ProtectedRoute>
                <Portfolio />
              </ProtectedRoute>
            } />
            <Route path="/saved" element={
              <ProtectedRoute>
                <SavedProjects />
              </ProtectedRoute>
            } />
            <Route path="/investments" element={
              <ProtectedRoute>
                <Investments />
              </ProtectedRoute>
            } />
            
            {/* Mentor Routes */}
            <Route path="/mentor/dashboard" element={
              <ProtectedRoute>
                <MentorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/mentor/requests" element={
              <ProtectedRoute>
                <MentorRequests />
              </ProtectedRoute>
            } />
            <Route path="/mentor/create-group" element={
              <ProtectedRoute>
                <CreateGroup />
              </ProtectedRoute>
            } />
            <Route path="/mentor/my-groups" element={
              <ProtectedRoute>
                <MyGroups />
              </ProtectedRoute>
            } />
            <Route path="/mentees" element={
              <ProtectedRoute>
                <Mentees />
              </ProtectedRoute>
            } />
            <Route path="/chat-sessions" element={
              <ProtectedRoute>
                <ChatSessions />
              </ProtectedRoute>
            } />
            <Route path="/group-sessions" element={
              <ProtectedRoute>
                <GroupSessions />
              </ProtectedRoute>
            } />
            <Route path="/schedule" element={
              <ProtectedRoute>
                <Schedule />
              </ProtectedRoute>
            } />
            
            {/* Shared Routes */}
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/enterprise/store" element={<EnterpriseStorefront />} />
            <Route path="/enterprise/products" element={
              <ProtectedRoute>
                <EnterpriseProducts />
              </ProtectedRoute>
            } />
          </Routes>
          </Suspense>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
