import './mainlayout.css'
import Header from '../components/Common-components/Header'
import Footer from '../components/Common-components/Footer'

function Mainlayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="overall-main-layout-container">
      <Header />
      {children}
      <Footer />
    </div>
  )
}

export default Mainlayout