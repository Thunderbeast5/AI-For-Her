import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRightOnRectangleIcon, ChevronDownIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth'
import logo from '../assets/logos/brown.png'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from './ui/sidebar'

const SidebarLayout = ({ menuItems }) => {
  const location = useLocation()
  const { currentUser, logout } = useAuth()
  const { t } = useTranslation()
  const [logoutError, setLogoutError] = useState('')
  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Your account'
  const userInitials = userName
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = '/'
    } catch (error) {
      console.error('Failed to log out:', error)
      setLogoutError('Could not log out. Please try again.')
    }
  }

  const isActive = (path) => (
    location.pathname === path ||
    (path !== '/dashboard' && location.pathname.startsWith(`${path}/`))
  )

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="dashboard-sidebar-header p-2">
        <Link
          to="/"
          className="dashboard-brand flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
        >
          <img
            src={logo}
            alt="saharohi logo"
            className="h-12 w-auto object-contain shrink-0"
          />
          <span className="font-manrope font-semibold text-xl tracking-wide lowercase text-black group-data-[collapsible=icon]:hidden leading-none select-none">
            saharohi
          </span>
        </Link>
      </SidebarHeader>

      <SidebarSeparator className="dashboard-sidebar-separator" />

      <SidebarContent className="dashboard-sidebar-content">
        <SidebarGroup className="dashboard-sidebar-group">
          <SidebarGroupLabel className="dashboard-sidebar-group-label">Workspace</SidebarGroupLabel>
          <SidebarMenu className="dashboard-sidebar-menu">
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.path)}
                  tooltip={item.label}
                  className="dashboard-sidebar-link"
                >
                  <Link to={item.path}>
                    <item.icon aria-hidden="true" className="dashboard-sidebar-icon" />
                    <span className="dashboard-sidebar-link-label">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="dashboard-sidebar-footer p-2">
        <SidebarSeparator className="dashboard-sidebar-separator mb-2" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="dashboard-account-trigger w-full flex items-center gap-3 p-1.5 rounded-xl hover:bg-neutral-100 transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
            >
              {/* Profile Avatar - Always centered and visible */}
              <span className="dashboard-avatar flex items-center justify-center w-8 h-8 rounded-full bg-[#8D4624]/10 text-[#8D4624] font-semibold text-xs shrink-0">
                {userInitials || <UserCircleIcon className="w-5 h-5" />}
              </span>

              {/* Account text details - hidden when collapsed */}
              <span className="dashboard-account-trigger-copy flex flex-col text-left overflow-hidden group-data-[collapsible=icon]:hidden">
                <strong className="text-sm font-medium text-neutral-800 truncate leading-tight">{userName}</strong>
                <span className="text-xs text-neutral-500 truncate leading-tight">{currentUser?.email || 'Account'}</span>
              </span>

              <ChevronDownIcon className="dashboard-account-chevron w-4 h-4 ml-auto text-neutral-400 group-data-[collapsible=icon]:hidden shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" sideOffset={8} className="dashboard-account-menu">
            <DropdownMenuLabel className="dashboard-account-summary">
              <strong>{userName}</strong>
              <span>{currentUser?.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault()
                handleLogout()
              }}
              className="dashboard-logout-button cursor-pointer"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
              <span>{t('auth.logout')}</span>
            </DropdownMenuItem>
            {logoutError && <p role="alert" className="dashboard-account-error text-xs text-red-600 p-2">{logoutError}</p>}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default SidebarLayout