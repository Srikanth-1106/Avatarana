import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminContextType {
  isAdminLoggedIn: boolean;
  adminLogin: (username: string, password: string) => boolean;
  adminLogout: () => void;
}

const AdminContext = createContext<AdminContextType>({
  isAdminLoggedIn: false,
  adminLogin: () => false,
  adminLogout: () => {},
});

// Static admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Avatarana@2026';

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Check if already logged in on mount
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken === 'authenticated') {
      setIsAdminLoggedIn(true);
    }
  }, []);

  const adminLogin = (username: string, password: string): boolean => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem('adminToken', 'authenticated');
      setIsAdminLoggedIn(true);
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdminLoggedIn(false);
  };

  return (
    <AdminContext.Provider value={{ isAdminLoggedIn, adminLogin, adminLogout }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
