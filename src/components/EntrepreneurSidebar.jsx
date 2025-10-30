import SidebarLayout from './SidebarLayout'
import { 
  HomeIcon, 
  AcademicCapIcon, 
  LightBulbIcon, 
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ChartBarIcon, 
  Cog6ToothIcon 
} from '@heroicons/react/24/outline'

const EntrepreneurSidebar = () => {
  const menuItems = [
    { icon: HomeIcon, label: 'Home', path: '/dashboard' },
    { icon: AcademicCapIcon, label: 'Find Mentors', path: '/mentors' },
    { icon: UserGroupIcon, label: 'Chat Sessions', path: '/chat-sessions' },
    { icon: LightBulbIcon, label: 'Opportunities', path: '/opportunities' },
    { icon: ChatBubbleLeftRightIcon, label: 'AI Coach', path: '/chat' },
    { icon: ChartBarIcon, label: 'Growth Journey', path: '/journey' },
    { icon: Cog6ToothIcon, label: 'Settings', path: '/settings' },
  ]

  return <SidebarLayout menuItems={menuItems} />
}

export default EntrepreneurSidebar
