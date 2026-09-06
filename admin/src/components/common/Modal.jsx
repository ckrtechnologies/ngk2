import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable Polished Modal Container
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl',
  icon: Icon = null,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dimmed backdrop with blur */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in-fast"
        onClick={onClose}
      />

      {/* Slide-in Drawer Panel from the Right */}
      <div
        className={`relative w-full ${maxWidth} bg-white shadow-2xl flex flex-col h-full z-10 animate-slide-in-right border-l border-slate-200`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-brand-red flex-shrink-0">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight truncate">{title}</h3>
              {subtitle && <p className="text-[11px] font-semibold text-slate-400 mt-0.5 truncate">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0 ml-3"
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
