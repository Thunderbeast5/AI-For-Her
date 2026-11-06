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
  UserIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline'
import {
  AcademicCapIcon as AcademicCapSolidIcon,
  ChartBarIcon as ChartBarSolidIcon,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightSolidIcon,
  CurrencyRupeeIcon as CurrencyRupeeSolidIcon,
  HomeIcon as HomeSolidIcon,
  LightBulbIcon as LightBulbSolidIcon,
  RocketLaunchIcon as RocketLaunchSolidIcon,
  UserGroupIcon as UserGroupSolidIcon,
  UserIcon as UserSolidIcon,
} from '@heroicons/react/24/solid'


const EntrepreneurSidebar = () => {
  const menuItems = [
    { icon: HomeIcon, activeIcon: HomeSolidIcon, label: 'Home', path: '/dashboard' },
    { icon: UserIcon, activeIcon: UserSolidIcon, label: 'Profile', path: '/profile' },
    { icon: RocketLaunchIcon, activeIcon: RocketLaunchSolidIcon, label: 'Create Startup', path: '/create-startup' },
    { icon: CurrencyRupeeIcon, activeIcon: CurrencyRupeeSolidIcon, label: 'List for Investment', path: '/list-project' },
    { icon: CurrencyRupeeIcon, activeIcon: CurrencyRupeeSolidIcon, label: 'Manage Products', path: '/enterprise/products' },
    { icon: AcademicCapIcon, activeIcon: AcademicCapSolidIcon, label: 'Find Mentors', path: '/mentors' },
    { icon: UserGroupIcon, activeIcon: UserGroupSolidIcon, label: 'Self Help Groups', path: '/shg' },
    { icon: LightBulbIcon, activeIcon: LightBulbSolidIcon, label: 'Opportunities', path: '/opportunities' },
    { icon: ChatBubbleLeftRightIcon, activeIcon: ChatBubbleLeftRightSolidIcon, label: 'AI Coach', path: '/chat' },
    { icon: ChartBarIcon, activeIcon: ChartBarSolidIcon, label: 'Growth Journey', path: '/journey' },
    // { icon: Cog6ToothIcon, label: 'Settings', path: '/settings' },
  ]

  return <SidebarLayout menuItems={menuItems} />
}

export default EntrepreneurSidebar
