'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// Helper to get initial state from localStorage
const getInitialState = (): boolean => {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem('sidebar-open');
  return saved === null ? true : saved === 'true';
};

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState<boolean>(() => getInitialState());

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
