import Navbar from './Navbar'
import { SidebarInset, SidebarProvider } from './ui/sidebar'
import { TooltipProvider } from './ui/tooltip'

const DashboardLayout = ({ children, sidebar }) => {
  return (
    <TooltipProvider>
      <SidebarProvider
        className="dashboard-app"
        style={{ '--sidebar-width': '17rem', '--sidebar-width-icon': '5rem' }}
      >
        {sidebar}
        <SidebarInset className="dashboard-main">
          <Navbar />
          <div className="dashboard-content">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

export default DashboardLayout
