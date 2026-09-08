import React, { useMemo, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, ShieldCheck, X, CheckCheck, BellOff, Clock, UserCheck, Layers } from 'lucide-react';
import { getMyself, markNotificationsAsRead, setSelectedBrand } from '../redux/adminSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { adminUser, selectedBrand } = useSelector((state) => state.admin);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  useEffect(() => {
    if (!adminUser) {
      dispatch(getMyself());
    }
  }, [dispatch, adminUser]);

  const unreadNotifications = useMemo(() => {
    if (adminUser?.notifications) {
      return adminUser.notifications.filter((notification) => notification.isRead === false);
    }
    return [];
  }, [adminUser]);

  const allNotifications = useMemo(() => {
    if (!adminUser?.notifications) return [];
    return [...adminUser.notifications].reverse();
  }, [adminUser]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recent';
    }
  };

  const handleMarkAllRead = () => {
    if (adminUser?.id) {
      dispatch(markNotificationsAsRead(adminUser.id));
    }
  };

  return (
    <header className="h-16 bg-slate-900/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20 border-b border-slate-800 select-none">
      {/* Search Input */}
      <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg w-72 border border-slate-800 focus-within:border-slate-600 focus-within:bg-slate-950 focus-within:ring-2 focus-within:ring-slate-700/50 transition-all">
        <Search className="w-3.5 h-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Quick search catalog, parts..."
          className="bg-transparent border-none outline-none text-xs font-semibold text-slate-200 w-full placeholder:text-slate-500"
        />
      </div>

      {/* Brand Switcher Pill */}
      <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => dispatch(setSelectedBrand('ngk'))}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
            selectedBrand === 'ngk'
              ? 'bg-[#008752] text-white shadow-md shadow-emerald-950/50 ring-1 ring-emerald-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${selectedBrand === 'ngk' ? 'bg-white animate-pulse' : 'bg-emerald-400'}`}></span>
          NGK & NTK
        </button>
        <button
          onClick={() => dispatch(setSelectedBrand('kyb'))}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
            selectedBrand === 'kyb'
              ? 'bg-[#E31837] text-white shadow-md shadow-red-950/50 ring-1 ring-red-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${selectedBrand === 'kyb' ? 'bg-white animate-pulse' : 'bg-red-400'}`}></span>
          KYB
        </button>
        <button
          onClick={() => navigate('/portal')}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-0.5 cursor-pointer"
          title="Open Brand Portal"
        >
          <Layers className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right User Bar */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button
          onClick={() => setShowNotificationModal(true)}
          className="relative p-2 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800 cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadNotifications.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E31837] text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-slate-900">
              {unreadNotifications.length}
            </span>
          )}
        </button>

        <div className="h-4 w-[1px] bg-slate-800"></div>

        {/* User Pill */}
        <div className="flex items-center gap-2.5 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl">
          <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-white flex items-center justify-center text-xs font-extrabold shadow-inner">
            {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-bold text-slate-200 leading-tight">
              {adminUser?.name || 'System Admin'}
            </span>
            <span className={`text-[9px] font-extrabold uppercase tracking-wider ${
              selectedBrand === 'kyb' ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {adminUser?.role || 'Administrator'}
            </span>
          </div>
        </div>
      </div>

      {/* Notifications Slide-Over Panel */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setShowNotificationModal(false)}
          ></div>

          {/* Drawer */}
          <div className="relative w-full max-w-sm bg-slate-900 shadow-2xl h-full flex flex-col z-10 animate-slide-in-right border-l border-slate-800 text-slate-200">
            {/* Header */}
            <div className="px-4 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-800 rounded-lg text-rose-400 border border-slate-700">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-extrabold text-white">Notifications</h2>
                  <p className="text-[10px] font-bold text-slate-400">
                    {unreadNotifications.length} unread
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {unreadNotifications.length > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-md transition-colors cursor-pointer border border-red-500/20"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Read all</span>
                  </button>
                )}
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800">
              {allNotifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                  <BellOff className="w-8 h-8 text-slate-600 mb-2" />
                  <h3 className="text-xs font-bold text-slate-300">No Notifications</h3>
                  <p className="text-[11px] text-slate-500 mt-1">You are all caught up!</p>
                </div>
              ) : (
                allNotifications.map((notif, idx) => (
                  <div
                    key={idx}
                    className={`p-3 flex gap-2.5 hover:bg-slate-800/50 transition-colors ${
                      !notif.isRead ? 'bg-slate-800/30' : ''
                    }`}
                  >
                    <div className="mt-1">
                      {!notif.isRead ? (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs text-slate-300 leading-snug ${
                          !notif.isRead ? 'font-bold text-white' : 'font-medium'
                        }`}
                      >
                        {notif.message}
                      </p>
                      <span className="text-[9px] font-bold text-slate-500 mt-1 block">
                        {formatTimestamp(notif.timestamp)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
