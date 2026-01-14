'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function DefaultPageRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(pathname !== '/');
  const hasCheckedRef = useRef(false);

  const performRedirectCheck = useCallback(() => {
    // Only check once and only on home page
    if (hasCheckedRef.current || pathname !== '/') {
      return;
    }
    hasCheckedRef.current = true;

    // Check if this is the first visit (simulating login)
    const hasVisited = sessionStorage.getItem('has-visited');
    
    if (!hasVisited) {
      // Mark as visited for this session
      sessionStorage.setItem('has-visited', 'true');
      
      // Get user settings
      const savedSettings = localStorage.getItem('user-settings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          const defaultPage = settings.defaultPage;
          
          // Redirect to default page if it's not home
          if (defaultPage && defaultPage !== '/') {
            router.replace(defaultPage);
            return;
          }
        } catch (e) {
          console.error('Error parsing settings:', e);
        }
      }
    }
  }, [pathname, router]);

  useEffect(() => {
    performRedirectCheck();
    // Defer the state update using requestAnimationFrame
    const rafId = requestAnimationFrame(() => {
      setChecked(true);
    });
    return () => cancelAnimationFrame(rafId);
  }, [performRedirectCheck]);

  // Show loading only on home page while checking
  if (!checked && pathname === '/') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Dang tai...</p>
        </div>
      </div>
    );
  }

  return null;
}
