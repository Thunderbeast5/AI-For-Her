import Navbar from './Navbar'
import { SidebarInset, SidebarProvider } from './ui/sidebar'
import { TooltipProvider } from './ui/tooltip'
import { cn } from '../lib/utils'

const DashboardLayout = ({ children, sidebar, className, contentClassName }) => {
  return (
    <TooltipProvider>
      <SidebarProvider
        className="dashboard-app"
        style={{ '--sidebar-width': '17rem', '--sidebar-width-icon': '5rem' }}
      >
        {sidebar}
        <SidebarInset className={cn("dashboard-main", className)}>
          <Navbar />
          <div className={cn("dashboard-content", contentClassName)}>
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

export default DashboardLayout
