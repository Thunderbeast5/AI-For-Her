import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import Mentors from './pages/Mentors'
import Chat from './pages/Chat'
import Opportunities from './pages/Opportunities'
import Journey from './pages/Journey'
import SelfHelpGroups from './pages/SelfHelpGroups'
import Signup from './pages/Signup'
import Login from './pages/Login'
import RoleSelection from './pages/RoleSelection'
import ProtectedRoute from './components/ProtectedRoute'

// Investor Pages
import BrowseProjects from './pages/BrowseProjects'
import Portfolio from './pages/Portfolio'
import SavedProjects from './pages/SavedProjects'
import Investments from './pages/Investments'

// Mentor Pages
import Mentees from './pages/Mentees'
import ChatSessions from './pages/ChatSessions'
import GroupSessions from './pages/GroupSessions'
import Schedule from './pages/Schedule'

// Shared Pages
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-white font-sans">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
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
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
