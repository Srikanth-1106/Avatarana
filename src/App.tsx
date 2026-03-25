import { useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import PointsSystem from './pages/Points';
import Registration from './pages/Registration';
import Leaderboard from './pages/Leaderboard';
import Schedule from './pages/Schedule';
import Gallery from './pages/Gallery';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Cricket from './pages/Cricket';
import Contact from './pages/Contact';
import CurtainReveal from './components/CurtainReveal';
import { AuthProvider } from './context/AuthContext';
import './App.css';

// Inner component that has access to the router's location
function AppRoutes() {
  const [showIntro, setShowIntro] = useState(true);
  const introShownRef = useRef(false);

  // Show the intro on any page load/refresh, only once per session
  const shouldShowIntro = showIntro && !introShownRef.current;

  const handleIntroComplete = () => {
    setShowIntro(false);
    introShownRef.current = true;
  };

  return (
    <>
      {shouldShowIntro && <CurtainReveal onComplete={handleIntroComplete} />}
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="events" element={<Events />} />
          <Route path="points" element={<PointsSystem />} />
          <Route path="cricket" element={<Cricket />} />
          <Route path="register" element={<Registration />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          
          <Route path="about" element={<About />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="contact" element={<Contact />} />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
