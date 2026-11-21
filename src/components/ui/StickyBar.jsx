import React from 'react';

export default function StickyBar({ children, className = '' }) {
  return (
    <div
      className={`fixed bottom-0 inset-x-0 bg-surface/90 backdrop-blur-md border-t border-slate-200/90 px-4 py-3 z-30 pb-[calc(12px+env(safe-area-inset-bottom,0px))] shadow-soft-md transition-all lg:static lg:bg-transparent lg:border-0 lg:p-0 lg:shadow-none lg:backdrop-blur-none ${className}`}
    >
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
        {children}
      </div>
    </div>
  );
}
