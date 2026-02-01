import './toastlayout.css'
import type { ReactNode } from 'react'
import { useToast } from '../store/useToaststore';
import Toastcomponent from '../components/Common-components/Toastcomponent/Toastcomponent';

function Dashboardlayout({children}: { children?: ReactNode }) {
    const isMounted = useToast(state => state.isMounted);

  return (
    <div className="overall-container-dashboard-layout">
      {/* Toast appears on top */}
      {isMounted && (
        <div className="toast-overall-container">
          <Toastcomponent/>
        </div>
      )}
      
      {/* Main content always visible */}
      <main className='main-content-layout-holder'>
        {children}
      </main>
    </div>
  )
}

export default Dashboardlayout;