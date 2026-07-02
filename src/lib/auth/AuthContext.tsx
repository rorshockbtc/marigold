"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  groupName: string;
  role: 'admin' | 'member';
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (groupName?: string, role?: 'admin' | 'member') => void;
  logout: () => void;
  transferAdmin: (newAdminEmail: string) => void;
  updateGroup: (newGroup: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Check local storage for mock session
    const saved = localStorage.getItem('marigold_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem('marigold_user');
      }
    }
  }, []);

  const login = (groupName = "", role: 'admin' | 'member' = 'member') => {
    const mockUser: UserProfile = {
      id: "usr_" + Math.random().toString(36).substring(2, 8),
      name: "Authenticated Citizen",
      email: "volunteer@example.org",
      groupName,
      role
    };
    setUser(mockUser);
    localStorage.setItem('marigold_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('marigold_user');
  };

  const transferAdmin = (newAdminEmail: string) => {
    if (!user || user.role !== 'admin') return;
    alert(`Admin rights successfully transferred to ${newAdminEmail}. You are now a Standard Member.`);
    const updated = { ...user, role: 'member' as const };
    setUser(updated);
    localStorage.setItem('marigold_user', JSON.stringify(updated));
  };

  const updateGroup = (newGroup: string) => {
    if (!user) return;
    const updated = { ...user, groupName: newGroup };
    setUser(updated);
    localStorage.setItem('marigold_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, transferAdmin, updateGroup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
