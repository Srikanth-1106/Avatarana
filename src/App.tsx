import { useState } from 'react';
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
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import CurtainReveal from './components/CurtainReveal';
import SponsorSplash from './components/SponsorSplash';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import './App.css';

// ── Sponsor data for the splash screen ──────────────────────────────────────
const SPLASH_SPONSORS = [
  { name: 'Aapaavani', logo: '/sponsor-logo-custom-removebg-preview.png', url: 'https://aapaavani.com/' },
  { name: 'Brindavan Samaj', logo: '/brindavan-samaj-logo.png' },
  { name: 'Kashi Sadana' },
  { name: 'Ramakrishna Bhat Kodikanda' },
  { name: 'Purushothama Bhat M' },
  { name: 'Karada Vishwa Bengaluru' },
  { name: 'Jayaram Bhat Kuntalpady' },
  { name: 'Sunil Angraje' },
];

// Inner component that has access to the router's location
function AppRoutes() {
  // Stage: 'curtain' → 'sponsors' → 'done'
  const [introStage, setIntroStage] = useState<'curtain' | 'sponsors' | 'done'>('curtain');

  const handleCurtainComplete = () => setIntroStage('sponsors');
  const handleSponsorComplete = () => setIntroStage('done');

  return (
    <>
      {/* Dark cover keeps homepage invisible while any intro is playing */}
      {introStage !== 'done' && (
        <div style={{ position: 'fixed', inset: 0, background: '#0a0a0a', zIndex: 99990, pointerEvents: 'none' }} />
      )}
      {introStage === 'curtain' && <CurtainReveal onComplete={handleCurtainComplete} />}
      {introStage === 'sponsors' && (
        <SponsorSplash
          sponsors={SPLASH_SPONSORS}
          onComplete={handleSponsorComplete}
          duration={14000}
        />
      )}
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
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;
