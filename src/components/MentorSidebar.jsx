import SidebarLayout from './SidebarLayout'
import { 
  HomeIcon, 
  UserGroupIcon,
  ChatBubbleLeftRightIcon, 
  VideoCameraIcon,
  CalendarIcon,
  ChartBarIcon,
  Cog6ToothIcon, 
  UserIcon,
  PlusCircleIcon,
  UsersIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'

const MentorSidebar = () => {
  const menuItems = [
    { icon: HomeIcon, label: 'Home', path: '/mentor/dashboard' },
    { icon: UserIcon, label: 'Profile', path: '/profile' },
    { icon: EnvelopeIcon, label: 'Connection Requests', path: '/mentor/requests' },
    { icon: UserGroupIcon, label: 'My Mentees', path: '/mentees' },
    { icon: PlusCircleIcon, label: 'Create Group', path: '/mentor/create-group' },
    { icon: UsersIcon, label: 'My Groups', path: '/mentor/my-groups' },
    { icon: VideoCameraIcon, label: 'Group Mentoring', path: '/group-sessions' },
    { icon: CalendarIcon, label: 'Schedule', path: '/schedule' },
    { icon: ChartBarIcon, label: 'Analytics', path: '/analytics' },
    { icon: Cog6ToothIcon, label: 'Settings', path: '/settings' },
  ]

  return <SidebarLayout menuItems={menuItems} />
}

export default MentorSidebar
