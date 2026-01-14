'use client';

import { useSidebar } from '../contexts/SidebarContext';

export default function MainContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();

  return (
    <main 
      className={`h-screen pt-14 transition-all duration-300 overflow-hidden ${
        isOpen ? 'ml-64' : 'ml-0'
      }`}
    >
      <div className="h-full overflow-hidden">
        {children}
      </div>
    </main>
  );
}
