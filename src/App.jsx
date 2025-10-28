import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import Mentors from './pages/Mentors'
import Chat from './pages/Chat'
import Opportunities from './pages/Opportunities'
import Journey from './pages/Journey'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white font-sans">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mentors" element={<Mentors />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/journey" element={<Journey />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
