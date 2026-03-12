import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
  return (
    <div className="app-container">
      <div className="background-glow"></div>
      <div className="accent-glow"></div>
      
      <Navbar />
      
      <main className="main-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
