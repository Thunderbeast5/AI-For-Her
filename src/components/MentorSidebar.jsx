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
import {
  CalendarIcon as CalendarSolidIcon,
  ChartBarIcon as ChartBarSolidIcon,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightSolidIcon,
  EnvelopeIcon as EnvelopeSolidIcon,
  HomeIcon as HomeSolidIcon,
  PlusCircleIcon as PlusCircleSolidIcon,
  UserGroupIcon as UserGroupSolidIcon,
  UserIcon as UserSolidIcon,
  UsersIcon as UsersSolidIcon,
  VideoCameraIcon as VideoCameraSolidIcon,
} from '@heroicons/react/24/solid'

const MentorSidebar = () => {
  const menuItems = [
    { icon: HomeIcon, activeIcon: HomeSolidIcon, label: 'Home', path: '/mentor/dashboard' },
    { icon: UserIcon, activeIcon: UserSolidIcon, label: 'Profile', path: '/profile' },
    { icon: EnvelopeIcon, activeIcon: EnvelopeSolidIcon, label: 'Connection Requests', path: '/mentor/requests' },
    { icon: UserGroupIcon, activeIcon: UserGroupSolidIcon, label: 'My Mentees', path: '/mentees' },
    { icon: PlusCircleIcon, activeIcon: PlusCircleSolidIcon, label: 'Create Group', path: '/mentor/create-group' },
    { icon: UsersIcon, activeIcon: UsersSolidIcon, label: 'My Groups', path: '/mentor/my-groups' },
    { icon: VideoCameraIcon, activeIcon: VideoCameraSolidIcon, label: 'Group Mentoring', path: '/group-sessions' },
    { icon: CalendarIcon, activeIcon: CalendarSolidIcon, label: 'Schedule', path: '/schedule' },
    { icon: ChartBarIcon, activeIcon: ChartBarSolidIcon, label: 'Analytics', path: '/analytics' },
    // { icon: Cog6ToothIcon, label: 'Settings', path: '/settings' },
  ]

  return <SidebarLayout menuItems={menuItems} />
}

export default MentorSidebar
