import { useState } from 'react'
import Navbar from './Navbar'

const DashboardLayout = ({ children, sidebar }) => {
  const [language, setLanguage] = useState('en')

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebar}
      
      <div className="flex-1 flex flex-col">
        <Navbar language={language} onLanguageChange={setLanguage} />
        
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
