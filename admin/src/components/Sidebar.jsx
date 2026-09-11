import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  BuildingStorefrontIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/solid';
import { logout } from '../redux/adminSlice';

const Sidebar = () => {
  const dispatch = useDispatch();
  const { enquiries, selectedBrand } = useSelector((state) => state.admin);

  const pendingEnquiriesCount =
    enquiries?.filter((e) => e.status === 'open' || e.status === 'pending')?.length || 0;

  const handleLogout = () => {
    dispatch(logout());
  };

  const navigationItems = [
    {
      name: 'Brand Portal',
      path: '/portal',
      icon: BuildingStorefrontIcon,
    },
    {
      name: 'Part Search',
      path: '/parts',
      icon: MagnifyingGlassIcon,
    },
    {
      name: 'Users',
      path: '/users',
      icon: UserGroupIcon,
    },
    {
      name: 'Inquiries',
      path: '/enquiries',
      icon: DocumentTextIcon,
      badge: pendingEnquiriesCount > 0 ? pendingEnquiriesCount : null,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col h-screen fixed left-0 top-0 z-30 shadow-xl border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-slate-800 bg-slate-950/80">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center p-1.5 shadow-md shrink-0 ${
              selectedBrand === 'kyb'
                ? 'bg-white shadow-red-600/30 ring-1 ring-red-500/30'
                : 'bg-white shadow-emerald-600/30 ring-1 ring-emerald-500/30'
            }`}
          >
            <img
              src={selectedBrand === 'kyb' ? '/images/branding/kyb_icon.png' : '/images/branding/ngk_logo.png'}
              alt={selectedBrand === 'kyb' ? 'KYB' : 'NGK'}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold text-[13px] tracking-tight text-white leading-tight truncate">
              {selectedBrand === 'kyb' ? 'KYB SUSPENSION' : 'NGK SPARK PLUG'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase leading-tight mt-0.5">
              Admin Console
            </span>
          </div>
        </div>
      </div>

      {/* Clean, Streamlined Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-2 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Menu
        </div>

        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-[13px] tracking-normal transition-all duration-150 group ${
                  isActive
                    ? selectedBrand === 'kyb'
                      ? 'bg-[#E31837] text-white shadow-md shadow-red-600/30 font-bold'
                      : 'bg-[#008752] text-white shadow-md shadow-emerald-600/30 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-800/80 text-slate-400 group-hover:text-white group-hover:bg-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="truncate leading-none">
                      {item.name}
                    </span>
                  </div>

                  {typeof item.badge === 'number' && item.badge > 0 ? (
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isActive
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'bg-[#E31837] text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Exit Session */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/70">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 border border-slate-700/60 hover:border-brand-red/40 text-slate-300 hover:text-rose-300 font-semibold text-xs tracking-wide transition-all duration-150 cursor-pointer"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
