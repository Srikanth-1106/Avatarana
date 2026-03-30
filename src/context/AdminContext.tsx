import React, { createContext, useContext, useState } from 'react';

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

// Initialize logged-in state from localStorage
const initializeAdminState = () => {
  const adminToken = localStorage.getItem('adminToken');
  return adminToken === 'authenticated';
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(initializeAdminState);

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

// eslint-disable-next-line react-refresh/only-export-components
export const useAdmin = () => useContext(AdminContext);
