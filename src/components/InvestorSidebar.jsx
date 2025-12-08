import SidebarLayout from './SidebarLayout'
import { 
  HomeIcon, 
  MagnifyingGlassIcon,
  BriefcaseIcon,
  BookmarkIcon,
  Cog6ToothIcon,
  UserIcon
} from '@heroicons/react/24/outline'

const InvestorSidebar = () => {
  const menuItems = [
    { icon: HomeIcon, label: 'Home', path: '/dashboard' },
    { icon: UserIcon, label: 'Profile', path: '/profile' },
    { icon: MagnifyingGlassIcon, label: 'Browse Projects', path: '/browse-projects' },
    { icon: BriefcaseIcon, label: 'My Portfolio', path: '/portfolio' },
    { icon: BookmarkIcon, label: 'Saved Projects', path: '/saved' },
    { icon: Cog6ToothIcon, label: 'Settings', path: '/settings' },
  ]

  return <SidebarLayout menuItems={menuItems} />
}

export default InvestorSidebar
