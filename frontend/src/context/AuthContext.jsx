import { createContext, useContext, useState } from 'react';
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lh_user')); } catch { return null; }
  });
  const login = (userData) => {
    localStorage.setItem('lh_user', JSON.stringify(userData));
    localStorage.setItem('lh_token', userData.token);
    setUser(userData);
  };
  const logout = () => {
    localStorage.removeItem('lh_user');
    localStorage.removeItem('lh_token');
    setUser(null);
  };
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);
