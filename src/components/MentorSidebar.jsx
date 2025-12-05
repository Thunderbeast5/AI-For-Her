import SidebarLayout from './SidebarLayout'
import { 
  HomeIcon, 
  UserGroupIcon,
  ChatBubbleLeftRightIcon, 
  VideoCameraIcon,
  CalendarIcon,
  ChartBarIcon,
  Cog6ToothIcon, 
  UserIcon
} from '@heroicons/react/24/outline'

const MentorSidebar = () => {
  const menuItems = [
    { icon: HomeIcon, label: 'Home', path: '/dashboard' },
    { icon: UserIcon, label: 'Profile', path: '/settings' },
    { icon: UserGroupIcon, label: 'My Mentees', path: '/mentees' },
    { icon: ChatBubbleLeftRightIcon, label: 'Chat Sessions', path: '/chat-sessions' },
    { icon: VideoCameraIcon, label: 'Group Mentoring', path: '/group-sessions' },
    { icon: CalendarIcon, label: 'Schedule', path: '/schedule' },
    { icon: ChartBarIcon, label: 'Analytics', path: '/analytics' },
    { icon: Cog6ToothIcon, label: 'Settings', path: '/settings' },
  ]

  return <SidebarLayout menuItems={menuItems} />
}

export default MentorSidebar
