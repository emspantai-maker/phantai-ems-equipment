import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getActiveSessionUser, loginUser, logoutUser, changePasswordFirstLogin } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from sessionStorage on page refresh
  useEffect(() => {
    try {
      const activeUser = getActiveSessionUser();
      if (activeUser) {
        setUser(activeUser);
      }
    } catch (err) {
      console.error('Failed to load session:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await loginUser(username, password);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser(user);
    setUser(null);
  }, [user]);

  const updateFirstLoginPassword = useCallback(async (newPassword) => {
    if (!user) throw new Error('ไม่พบข้อมูลผู้ใช้');
    const updated = await changePasswordFirstLogin(user.id, newPassword);
    setUser(updated);
    return updated;
  }, [user]);

  const value = {
    user,
    loading,
    login,
    logout,
    updateFirstLoginPassword,
    isAuthenticated: Boolean(user && user.approved && user.active),
    isAdmin: Boolean(user && user.role === 'ADMIN'),
    requiresFirstLoginPasswordChange: Boolean(user && user.first_login)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
