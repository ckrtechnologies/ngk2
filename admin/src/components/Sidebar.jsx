import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  ChatBubbleBottomCenterTextIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/solid';
import { logout } from '../redux/adminSlice';

const Sidebar = () => {
  const dispatch = useDispatch();
  const { enquiries } = useSelector((state) => state.admin);

  const pendingEnquiriesCount =
    enquiries?.filter((e) => e.status === 'open' || e.status === 'pending')?.length || 0;

  const handleLogout = () => {
    dispatch(logout());
  };

  const navigationSections = [
    {
      category: 'Network & Accounts',
      items: [
        {
          name: 'User Management',
          path: '/users',
          icon: UserGroupIcon,
          description: 'Accounts, Garages & Roles',
          colorClass: 'text-blue-400 bg-blue-500/10 group-hover:bg-blue-500/20 group-hover:text-blue-300',
        },
      ],
    },
    {
      category: 'Catalog & Vehicle Linking',
      items: [
        {
          name: 'TecDoc Part Finder',
          path: '/parts',
          icon: MagnifyingGlassIcon,
          description: 'Pegasus 3.0 Database',
          colorClass: 'text-purple-400 bg-purple-500/10 group-hover:bg-purple-500/20 group-hover:text-purple-300',
        },
      ],
    },
    {
      category: 'Market Intelligence & Logs',
      items: [
        {
          name: 'Commercial Inquiries',
          path: '/enquiries',
          icon: ChatBubbleBottomCenterTextIcon,
          badge: pendingEnquiriesCount > 0 ? pendingEnquiriesCount : null,
          description: 'Buyer-to-Seller Audit Log',
          colorClass: 'text-orange-400 bg-orange-500/10 group-hover:bg-orange-500/20 group-hover:text-orange-300',
        },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col h-screen fixed left-0 top-0 z-30 shadow-xl border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-800 bg-slate-950/80 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-red flex items-center justify-center font-black text-white text-sm tracking-wider shadow-md shadow-brand-red/30">
            NGK
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-[13px] tracking-tight text-white leading-tight">
              NGK SPARK PLUG
            </span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase leading-tight mt-0.5">
              Administration Portal
            </span>
          </div>
        </div>
      </div>

      {/* Categorized Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {navigationSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1.5">
            <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {section.category}
            </h3>

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs tracking-normal transition-all duration-150 group ${
                        isActive
                          ? 'bg-brand-red text-white shadow-md shadow-brand-red/30'
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
                                : item.colorClass
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="truncate text-[12px] font-semibold text-white leading-tight">
                              {item.name}
                            </span>
                            <span
                              className={`text-[10px] truncate leading-tight mt-0.5 ${
                                isActive ? 'text-rose-100 font-medium' : 'text-slate-400 group-hover:text-slate-300 font-normal'
                              }`}
                            >
                              {item.description}
                            </span>
                          </div>
                        </div>

                        {typeof item.badge === 'number' && item.badge > 0 ? (
                          <span
                            className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isActive
                                ? 'bg-white text-brand-red shadow-xs'
                                : 'bg-brand-red text-white'
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
            </div>
          </div>
        ))}
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
