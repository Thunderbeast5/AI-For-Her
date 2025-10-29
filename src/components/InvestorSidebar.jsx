import SidebarLayout from './SidebarLayout'
import { 
  HomeIcon, 
  MagnifyingGlassIcon,
  BriefcaseIcon,
  ChartBarIcon,
  BanknotesIcon,
  BookmarkIcon,
  Cog6ToothIcon 
} from '@heroicons/react/24/outline'

const InvestorSidebar = () => {
  const menuItems = [
    { icon: HomeIcon, label: 'Home', path: '/dashboard' },
    { icon: MagnifyingGlassIcon, label: 'Browse Projects', path: '/browse-projects' },
    { icon: BriefcaseIcon, label: 'My Portfolio', path: '/portfolio' },
    { icon: BookmarkIcon, label: 'Saved Projects', path: '/saved' },
    { icon: BanknotesIcon, label: 'Investments', path: '/investments' },
    { icon: ChartBarIcon, label: 'Analytics', path: '/analytics' },
    { icon: Cog6ToothIcon, label: 'Settings', path: '/settings' },
  ]

  return <SidebarLayout menuItems={menuItems} />
}

export default InvestorSidebar
