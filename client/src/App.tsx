import './App.css'
import {BrowserRouter,Route,Routes} from 'react-router-dom'
import Mainlayout from './layouts/Mainlayout'
import Homepage from './pages/Homepage'

function App() {
  return (
   <div className="overall-app-container">
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Mainlayout><Homepage /></Mainlayout>} />
      </Routes>
    </BrowserRouter>
   </div>
  )
}

export default App
