"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface UserContextType {
  userData: {
    name?: string | null;
    email?: string | null;
    avatarKey: number;
  };
  updateUserData: (data: Partial<{ name: string; email: string }>) => void;
  updateAvatar: () => void;
  autoplayEnabled: boolean;
  toggleAutoplay: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [userData, setUserData] = useState({
    name: session?.user?.name || undefined,
    email: session?.user?.email || undefined,
    avatarKey: 0,
  });
  const [autoplayEnabled, setAutoplayEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("midiPlayerAutoplay");
      return saved === "true";
    }
    return false;
  });

  // Keep userData in sync with session
  useEffect(() => {
    if (session?.user) {
      setUserData((prev) => ({
        ...prev,
        name: session?.user?.name || undefined,
        email: session?.user?.email || undefined,
      }));
    }
  }, [session]);

  const updateUserData = (data: Partial<{ name: string; email: string }>) => {
    setUserData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const updateAvatar = () => {
    setUserData((prev) => ({
      ...prev,
      avatarKey: prev.avatarKey + 1,
    }));
  };

  const toggleAutoplay = () => {
    setAutoplayEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem("midiPlayerAutoplay", String(newValue));
      return newValue;
    });
  };

  return (
    <UserContext.Provider value={{ userData, updateUserData, updateAvatar, autoplayEnabled, toggleAutoplay }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
