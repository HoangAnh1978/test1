'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Use a consistent initial state for both server and client to avoid hydration mismatch
  const [isOpen, setIsOpen] = useState<boolean>(true);

  // Sync with localStorage after hydration
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-open');
    if (saved !== null) {
      setIsOpen(saved === 'true');
    }
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => {
      const newValue = !prev;
      localStorage.setItem('sidebar-open', String(newValue));
      return newValue;
    });
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
    localStorage.setItem('sidebar-open', 'true');
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    localStorage.setItem('sidebar-open', 'false');
  }, []);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, open, close }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
