import './mainlayout.css'
import Header from '../components/Common-components/Header'
import Footer from '../components/Common-components/Footer'
import Sidebar from '../components/Common-components/sidebar/Sidebar'
import { useSidebarStore } from '../store/useSidebar'

interface MainLayoutProps {
  children: React.ReactNode;
}

function Mainlayout({ children }: MainLayoutProps) {
  const { isSidebarOpen } = useSidebarStore();
  
  return (
    <div className={`overall-main-layout-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Header />
      <div className="main-content-wrapper">
        {children}
      </div>
      <Footer />
      <Sidebar />
    </div>
  )
}

export default Mainlayout