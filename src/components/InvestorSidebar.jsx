import SidebarLayout from './SidebarLayout'
import { 
  HomeIcon, 
  MagnifyingGlassIcon,
  BriefcaseIcon,
  BookmarkIcon,
  Cog6ToothIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import {
  BookmarkIcon as BookmarkSolidIcon,
  BriefcaseIcon as BriefcaseSolidIcon,
  HomeIcon as HomeSolidIcon,
  MagnifyingGlassIcon as MagnifyingGlassSolidIcon,
  UserIcon as UserSolidIcon,
} from '@heroicons/react/24/solid'

const InvestorSidebar = () => {
  const menuItems = [
    { icon: HomeIcon, activeIcon: HomeSolidIcon, label: 'Home', path: '/dashboard' },
    { icon: UserIcon, activeIcon: UserSolidIcon, label: 'Profile', path: '/profile' },
    { icon: MagnifyingGlassIcon, activeIcon: MagnifyingGlassSolidIcon, label: 'Browse Projects', path: '/browse-projects' },
    { icon: BriefcaseIcon, activeIcon: BriefcaseSolidIcon, label: 'My Portfolio', path: '/portfolio' },
    { icon: BookmarkIcon, activeIcon: BookmarkSolidIcon, label: 'Saved Projects', path: '/saved' },
    // { icon: Cog6ToothIcon, label: 'Settings', path: '/settings' },
  ]

  return <SidebarLayout menuItems={menuItems} />
}

export default InvestorSidebar
