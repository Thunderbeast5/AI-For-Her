import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import Signup from './pages/Signup'
import Login from './pages/Login'
import RoleSelection from './pages/RoleSelection'
import EmailVerification from './pages/EmailVerification'
import ProtectedRoute from './components/ProtectedRoute'

// Entrepreneur Pages
import Chat from './pages/Entrepreneur/Chat'
import CreateStartup from './pages/Entrepreneur/CreateStartup'
import Journey from './pages/Entrepreneur/Journey'
import Mentors from './pages/Entrepreneur/Mentors'
import Opportunities from './pages/Entrepreneur/Opportunities'
import SelfHelpGroups from './pages/Entrepreneur/SelfHelpGroups'
import ListProject from './pages/Entrepreneur/ListProject'

// Investor Pages
import BrowseProjects from './pages/Investor/BrowseProjects'
import Portfolio from './pages/Investor/Portfolio'
import SavedProjects from './pages/Investor/SavedProjects'
import Investments from './pages/Investor/Investments'

// Mentor Pages
import MentorDashboard from './pages/Mentor/MentorDashboard'
import Mentees from './pages/Mentor/Mentees'
import ChatSessions from './pages/Mentor/ChatSessions'
import GroupSessions from './pages/Mentor/GroupSessions'
import Schedule from './pages/Mentor/Schedule'
import MentorRequests from './pages/Mentor/MentorRequests'
import CreateGroup from './pages/Mentor/CreateGroup'
import MyGroups from './pages/Mentor/MyGroups'

// Shared Pages
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import EnterpriseProducts from './enterprise/EnterpriseProducts'
import EnterpriseStorefront from './enterprise/EnterpriseStorefront'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-white font-sans">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-email" element={<EmailVerification />} />
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
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
