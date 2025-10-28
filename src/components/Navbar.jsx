import { useState } from 'react'
import { ChevronDownIcon, UserCircleIcon } from '@heroicons/react/24/outline'

const Navbar = () => {
  const [language, setLanguage] = useState('English')

  return (
    <div className="bg-white border-b border-gray-100 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Language Switcher */}
          <div className="relative">
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="English">English</option>
              <option value="Hindi">हिंदी</option>
            </select>
            <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* User Avatar */}
          <div className="flex items-center space-x-2">
            <UserCircleIcon className="w-8 h-8 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Priya Sharma</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar
