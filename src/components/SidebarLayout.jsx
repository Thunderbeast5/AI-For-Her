import { useNavigate, useLocation } from 'react-router-dom'

const SidebarLayout = ({ menuItems }) => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="w-64 bg-white border-r-2 border-pink-200 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <h1 
          onClick={() => navigate('/')}
          className="text-2xl font-bold text-gray-900 notranslate cursor-pointer hover:text-pink-400 transition-colors"
        >
          AI For Her
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-gradient-to-r from-pink-200 to-pink-300 text-gray-900 font-semibold shadow-sm'
                    : 'text-gray-600 hover:bg-pink-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 transition-transform duration-200 ${
                  location.pathname === item.path ? 'scale-110' : 'group-hover:scale-105'
                }`} />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default SidebarLayout
