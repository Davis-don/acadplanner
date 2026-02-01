import './App.css';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Mainlayout from './layouts/Mainlayout';
import Homepage from './pages/Homepage';
import About from './pages/About';
import Contact from './pages/Contact';
import Newaccount from './pages/Newaccount';
import Login from './pages/Login';
import Clientaccount from './Accounts/Client/pages/Clientaccount';
import Dashboardlayout from './layouts/Toastlayout';
import Protectedroute from './components/protected-route/Protectedroute';

function App() {
  return (
    <div className="overall-app-container">
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Mainlayout><Homepage /></Mainlayout>} />
          <Route path="/about" element={<Mainlayout><About /></Mainlayout>} />
          <Route path="/contact" element={<Mainlayout><Contact /></Mainlayout>} />
          <Route path="/login" element={<Dashboardlayout><Login /></Dashboardlayout>} />
          <Route path="/signup" element={<Dashboardlayout><Newaccount /></Dashboardlayout>} />

          {/* Protected dashboard routes */}
          <Route
            path="/client/dashboard"
            element={
              <Protectedroute>
                <Dashboardlayout>
                  <Clientaccount />
                </Dashboardlayout>
              </Protectedroute>
            }
          />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
