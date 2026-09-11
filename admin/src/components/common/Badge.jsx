import React from 'react';
import {
  ShieldCheckIcon,
  BuildingStorefrontIcon,
  BuildingOffice2Icon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/20/solid';

/**
 * Role Badge (Solid style with distinct enterprise colors)
 */
export const RoleBadge = ({ role }) => {
  const r = (role || 'owner').toLowerCase();

  switch (r) {
    case 'admin':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-purple-50 text-purple-700 border border-purple-200/80 shadow-xs">
          <ShieldCheckIcon className="w-3 h-3 text-purple-600" />
          Admin
        </span>
      );
    case 'distributor':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-amber-50 text-amber-800 border border-amber-200/80 shadow-xs">
          <BuildingOffice2Icon className="w-3 h-3 text-amber-600" />
          Distributor
        </span>
      );
    case 'reseller':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs">
          <BuildingStorefrontIcon className="w-3 h-3 text-emerald-600" />
          Reseller
        </span>
      );
    case 'owner':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-sky-50 text-sky-800 border border-sky-200/80 shadow-xs">
          <UserIcon className="w-3 h-3 text-sky-600" />
          Owner
        </span>
      );
  }
};

/**
 * Enquiry Status Badge
 */
export const StatusBadge = ({ status }) => {
  const s = (status || 'pending').toLowerCase();

  switch (s) {
    case 'resolved':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
          <CheckCircleIcon className="w-3 h-3 text-emerald-600" />
          Resolved
        </span>
      );
    case 'in progress':
    case 'inprogress':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">
          <ClockIcon className="w-3 h-3 text-blue-600 animate-spin" />
          In Progress
        </span>
      );
    case 'closed':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-slate-100 text-slate-700 border border-slate-200 shadow-xs">
          <XCircleIcon className="w-3 h-3 text-slate-500" />
          Closed
        </span>
      );
    case 'pending':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-rose-50 text-rose-700 border border-rose-200 shadow-xs">
          <ExclamationCircleIcon className="w-3 h-3 text-rose-600" />
          Pending
        </span>
      );
  }
};

export default { RoleBadge, StatusBadge };
