import React, { useEffect, useState } from 'react';
import { notifications, InAppNotification } from '../utils/notifications';
import { X, Droplets } from 'lucide-react';
import { ASSETS } from '../data/mockData';

export const InAppNotificationToast: React.FC = () => {
  const [activeToast, setActiveToast] = useState<InAppNotification | null>(null);

  useEffect(() => {
    const unsubscribe = notifications.onInAppNotification((item) => {
      setActiveToast(item);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  if (!activeToast) return null;

  return (
    <div className="fixed top-3 inset-x-3 sm:inset-x-auto sm:right-4 sm:max-w-sm z-50 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div className="relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-xl border border-[#cbe1ff] shadow-[0_12px_36px_rgba(0,112,243,0.18)] p-3.5 flex gap-3 items-start">
        {/* Left Avatar Icon */}
        <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-[#0070f3] to-[#00ccf9] p-0.5 shrink-0 shadow-sm">
          <img
            src={activeToast.icon || ASSETS.mascotAvatar}
            alt="HidraGo"
            className="w-full h-full object-cover rounded-full bg-white"
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#0070f3] border-2 border-white flex items-center justify-center">
            <Droplets className="w-2.5 h-2.5 text-white" />
          </div>
        </div>

        {/* Center Content */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center justify-between gap-1">
            <h4 className="text-xs font-bold text-[#111b2f] truncate leading-tight">
              {activeToast.title}
            </h4>
            <span className="text-[10px] text-[#717d96] shrink-0 font-medium">agora</span>
          </div>
          <p className="text-xs text-[#414754] mt-0.5 leading-snug break-words line-clamp-2">
            {activeToast.body}
          </p>

          {activeToast.actionText && (
            <button
              onClick={() => {
                if (activeToast.onAction) activeToast.onAction();
                setActiveToast(null);
              }}
              className="mt-2 text-xs font-bold text-[#0070f3] bg-[#eef5ff] hover:bg-[#e0edff] active:scale-95 px-3 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>{activeToast.actionText}</span>
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => setActiveToast(null)}
          className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-[#717d96] hover:text-[#111b2f] hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Fechar notificação"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
