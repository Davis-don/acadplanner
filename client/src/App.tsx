import './App.css'
import {BrowserRouter,Route,Routes} from 'react-router-dom'
import Mainlayout from './layouts/Mainlayout'
import Homepage from './pages/Homepage'
import About from './pages/About'
import Contact from './pages/Contact'
import Newaccount from './pages/Newaccount'
import Login from './pages/Login'
function App() {
  return (
   <div className="overall-app-container">
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Mainlayout><Homepage /></Mainlayout>} />
        <Route path="/about" element={<Mainlayout><About /></Mainlayout>} />
        <Route path="/contact" element={<Mainlayout><Contact /></Mainlayout>} />
        <Route path="/signup" element={<Newaccount />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
   </div>
  )
}

export default App
