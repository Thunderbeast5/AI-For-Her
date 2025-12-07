import SidebarLayout from './SidebarLayout'
import { 
  HomeIcon, 
  AcademicCapIcon, 
  LightBulbIcon, 
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ChartBarIcon, 
  Cog6ToothIcon,
  RocketLaunchIcon,
  UserIcon
} from '@heroicons/react/24/outline'


const EntrepreneurSidebar = () => {
  const menuItems = [
    { icon: HomeIcon, label: 'Home', path: '/dashboard' },
    { icon: UserIcon, label: 'Profile', path: '/profile' },
    { icon: RocketLaunchIcon, label: 'Create Startup', path: '/create-startup' },
    { icon: AcademicCapIcon, label: 'Find Mentors', path: '/mentors' },
    { icon: UserGroupIcon, label: 'Self Help Groups', path: '/shg' },
    { icon: LightBulbIcon, label: 'Opportunities', path: '/opportunities' },
    { icon: ChatBubbleLeftRightIcon, label: 'AI Coach', path: '/chat' },
    { icon: ChartBarIcon, label: 'Growth Journey', path: '/journey' },
    { icon: Cog6ToothIcon, label: 'Settings', path: '/settings' },
  ]

  return <SidebarLayout menuItems={menuItems} />
}

export default EntrepreneurSidebar
