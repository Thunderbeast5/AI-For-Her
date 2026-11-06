import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRightOnRectangleIcon, ChevronDownIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth'
import logo from '../assets/logos/brown.png'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  SidebarTrigger,
} from './ui/sidebar'

const CollapsibleMenuItem = ({ item, isActive }) => {
  const isChildActive = item.children?.some((child) => isActive(child.path))
  const active = isChildActive || isActive(item.path)
  const [isOpen, setIsOpen] = useState(active)

  useEffect(() => {
    if (active) {
      setIsOpen(true)
    }
  }, [active])

  const Icon = active && item.activeIcon ? item.activeIcon : item.icon

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.label}
            isActive={active}
            className="dashboard-sidebar-link cursor-pointer justify-between w-full"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Icon aria-hidden="true" className="dashboard-sidebar-icon shrink-0" />
              <span className="dashboard-sidebar-link-label truncate">{item.label}</span>
            </div>
            <ChevronDownIcon
              className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 group-data-[collapsible=icon]:hidden shrink-0 ${
                isOpen ? 'rotate-180 text-stone-700' : ''
              }`}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="dashboard-sidebar-sub">
            {item.children.map((child) => {
              const childActive = isActive(child.path)
              return (
                <SidebarMenuSubItem key={child.path}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={childActive}
                    className="dashboard-sidebar-sub-link"
                  >
                    <Link to={child.path}>
                      <span className="truncate">{child.label}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

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

  const isActive = (path) => {
    if (!path) return false
    const [itemPath, itemQuery] = path.split('?')
    if (location.pathname !== itemPath) {
      if (itemPath !== '/dashboard' && location.pathname.startsWith(`${itemPath}/`)) {
        return true
      }
      return false
    }

    if (itemQuery) {
      const searchParams = new URLSearchParams(itemQuery)
      const currentParams = new URLSearchParams(location.search)
      for (const [key, value] of searchParams.entries()) {
        const currentVal = currentParams.get(key)
        if (currentVal !== value) {
          if ((value === 'find' || value === 'browse') && !currentVal) {
            return true
          }
          return false
        }
      }
      return true
    }

    if (location.search && location.search.includes('tab=')) {
      const currentParams = new URLSearchParams(location.search)
      const tab = currentParams.get('tab')
      if ((tab === 'find' && itemPath === '/mentors') || (tab === 'browse' && itemPath === '/shg')) {
        return true
      }
      return false
    }

    return true
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="dashboard-sidebar-header">
        <Link
          to="/"
          className="dashboard-brand flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
        >
          <img
            src={logo}
            alt="saharohi logo"
            className="h-10 w-auto object-contain shrink-0"
          />
          <span className="font-manrope font-semibold text-xl tracking-wide lowercase text-black group-data-[collapsible=icon]:hidden leading-none select-none">
            saharohi
          </span>
        </Link>
        <SidebarTrigger
          className="dashboard-sidebar-edge-trigger"
          aria-label="Toggle sidebar"
        />
      </SidebarHeader>

      <SidebarSeparator className="dashboard-sidebar-separator dashboard-sidebar-brand-separator" />

      <SidebarContent className="dashboard-sidebar-content">
        <SidebarGroup className="dashboard-sidebar-group">
          <SidebarGroupLabel className="dashboard-sidebar-group-label">Workspace</SidebarGroupLabel>
          <SidebarMenu className="dashboard-sidebar-menu">
            {menuItems.map((item) => {
              if (item.children && item.children.length > 0) {
                return (
                  <CollapsibleMenuItem
                    key={item.label}
                    item={item}
                    isActive={isActive}
                  />
                )
              }

              const active = isActive(item.path)
              const Icon = active && item.activeIcon ? item.activeIcon : item.icon

              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    tooltip={item.label}
                    className="dashboard-sidebar-link"
                  >
                    <Link to={item.path}>
                      <Icon aria-hidden="true" className="dashboard-sidebar-icon" />
                      <span className="dashboard-sidebar-link-label">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
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