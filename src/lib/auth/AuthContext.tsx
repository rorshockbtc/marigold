"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useClerk } from "@clerk/nextjs";

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
  
  // Web2 Identity
  login: () => void; // We rely on Clerk now, but keeping signature for legacy mocks if needed
  logout: () => void;
  
  // Local Data Encryption (AuthZ)
  isWorkspaceUnlocked: boolean;
  hasPinSet: boolean;
  setupWorkspacePin: (pin: string) => Promise<boolean>;
  unlockWorkspace: (pin: string) => Promise<boolean>;
  lockWorkspace: () => void;

  transferAdmin: (newAdminEmail: string) => void;
  updateGroup: (newGroup: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [isWorkspaceUnlocked, setIsWorkspaceUnlocked] = useState(false);
  const [hasPinSet, setHasPinSet] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasPinSet(localStorage.getItem("marigold_has_pin") === "true");
    }
  }, []);

  useEffect(() => {
    if (isLoaded && clerkUser) {
      setUser({
        id: clerkUser.id,
        name: clerkUser.fullName || "Citizen",
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        groupName: "Independent Audit Workspace",
        role: "admin"
      });
    } else if (isLoaded && !clerkUser) {
      setUser(null);
      setIsWorkspaceUnlocked(false);
    }
  }, [isLoaded, clerkUser]);

  const login = () => {
    // Identity handled via Clerk UI buttons
  };

  const logout = async () => {
    setIsWorkspaceUnlocked(false);
    await signOut();
  };

  const setupWorkspacePin = async (pin: string): Promise<boolean> => {
    if (pin.length >= 4) {
      if (typeof window !== "undefined") {
        localStorage.setItem("marigold_has_pin", "true");
      }
      setHasPinSet(true);
      setIsWorkspaceUnlocked(true);
      return true;
    }
    return false;
  };

  const unlockWorkspace = async (pin: string): Promise<boolean> => {
    // In Phase 2:
    // 1. Fetch encrypted blob from 'Marigold Local' via File System API
    // 2. Decrypt with PIN using LocalKeyManager
    // 3. Sign server ZK challenge to prove ownership
    
    if (pin.length >= 4) {
      // Mocking successful decryption
      setIsWorkspaceUnlocked(true);
      return true;
    }
    return false;
  };

  const lockWorkspace = () => {
    setIsWorkspaceUnlocked(false);
    // In a real implementation, we'd clear the decrypted CryptoKey from memory
  };

  const transferAdmin = (newAdminEmail: string) => {
    if (!user || user.role !== 'admin') return;
    setUser({ ...user, role: 'member' });
  };

  const updateGroup = (newGroup: string) => {
    if (!user) return;
    setUser({ ...user, groupName: newGroup });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isWorkspaceUnlocked,
      hasPinSet,
      setupWorkspacePin,
      unlockWorkspace,
      lockWorkspace,
      login, 
      logout, 
      transferAdmin, 
      updateGroup 
    }}>
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
