import { useNavigate, useLocation } from 'react-router-dom'
import { 
  HomeIcon, 
  AcademicCapIcon, 
  LightBulbIcon, 
  ChatBubbleLeftRightIcon, 
  ChartBarIcon, 
  Cog6ToothIcon 
} from '@heroicons/react/24/outline'

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { icon: HomeIcon, label: 'Home', path: '/dashboard' },
    { icon: AcademicCapIcon, label: 'Mentors', path: '/mentors' },
    { icon: LightBulbIcon, label: 'Insights', path: '/opportunities' },
    { icon: ChatBubbleLeftRightIcon, label: 'Chat Mentor', path: '/chat' },
    { icon: ChartBarIcon, label: 'Growth Journey', path: '/journey' },
    { icon: Cog6ToothIcon, label: 'Settings', path: '/settings' },
  ]

  return (
    <div className="w-64 bg-white border-r border-gray-100 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">AI for Her</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar
