'use client';

import Link from "next/link";
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  const checkRedirect = useCallback(() => {
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
            return false; // Don't show page, redirecting
          }
        } catch (e) {
          console.error('Error parsing settings:', e);
        }
      }
    }
    return true; // Show page
  }, [router]);

  useEffect(() => {
    const shouldShowPage = checkRedirect();
    if (shouldShowPage) {
      // Use setTimeout to avoid synchronous setState warning
      const timer = setTimeout(() => setReady(true), 0);
      return () => clearTimeout(timer);
    }
  }, [checkRedirect]);

  // Show loading while checking redirect
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Dang tai...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 md:p-12">
          {/* Header */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Ticket Management System
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              He thong quan ly cong viec va giao tiep nhom hien dai
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5">
              <svg className="w-8 h-8 text-blue-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Quan ly Ticket</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Tao, theo doi va quan ly cong viec</p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-5">
              <svg className="w-8 h-8 text-green-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Chat thoi gian thuc</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Giao tiep nhanh chong voi nhom</p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-5">
              <svg className="w-8 h-8 text-orange-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Binh luan & Thao luan</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Trao doi tren tung ticket</p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-5">
              <svg className="w-8 h-8 text-purple-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Lam viec nhom</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Phan cong va theo doi tien do</p>
            </div>
          </div>

          {/* Sample Stats */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">5</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Tickets</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">2</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Phong chat</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">7</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Binh luan</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">4</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Thanh vien</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">2</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Hoan thanh</div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/tickets"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Xem tat ca Tickets
              </Link>
              
              <Link
                href="/chat"
                className="inline-flex items-center justify-center px-8 py-3 border border-blue-600 text-base font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Mo Chat
              </Link>
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              <Link href="/settings" className="text-blue-600 hover:underline">
                Cau hinh man hinh mac dinh
              </Link>
              {' '}de thay doi trang hien thi dau tien khi dang nhap
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
