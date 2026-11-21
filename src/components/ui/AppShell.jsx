import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import TopBar from './TopBar';
import Drawer from './Drawer';
import Sidebar from './Sidebar';
import Disclaimer from './Disclaimer';
import { WifiOff } from 'lucide-react';

export default function AppShell({
  children,
  title,
  showBack = false,
  onBack,
  rightAction,
  hideDisclaimer = false,
  maxWidth = 'max-w-4xl',
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const location = useLocation();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Close drawer when route changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-dvh bg-bg text-text flex flex-col antialiased">
      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 sticky top-0 z-50">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Anda sedang offline. Formulir dan data yang telah dimuat tetap tersimpan di memori.</span>
        </div>
      )}

      {/* Desktop Sidebar (>= 1024px) */}
      <Sidebar />

      {/* Mobile Drawer */}
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-[220px]">
        {/* Mobile Top Bar */}
        <TopBar
          title={title}
          showBack={showBack}
          onBack={onBack}
          onOpenDrawer={() => setDrawerOpen(true)}
          rightAction={rightAction}
        />

        {/* Desktop Top Header Bar (when not mobile) */}
        <header className="hidden lg:flex items-center justify-between h-16 px-8 border-b border-border bg-surface">
          <div>
            <h2 className="text-xl font-bold text-ink">{title}</h2>
          </div>
          {rightAction && <div>{rightAction}</div>}
        </header>

        {/* Page Body Container */}
        <main className={`flex-1 w-full mx-auto p-4 sm:p-6 lg:p-8 xl:p-10 ${maxWidth}`}>
          {children}
        </main>

        {/* Standard Disclaimer Footer */}
        {!hideDisclaimer && (
          <footer className="mt-auto border-t border-border/60 py-4 bg-surface/50">
            <Disclaimer variant="footer" />
          </footer>
        )}
      </div>
    </div>
  );
}
