import React from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '../auth/useAuth';
import SplashScreen from '../../domains/auth/screens/SplashScreen';
import AuthNavigator from '../../domains/auth/navigation/AuthNavigator';
import AccountPendingScreen from '../../domains/auth/screens/AccountPendingScreen';
import OwnerNavigator from '../../domains/owner/navigation/OwnerNavigator';
import ResellerNavigator from '../../domains/reseller/navigation/ResellerNavigator';
import DistributorNavigator from '../../domains/distributor/navigation/DistributorNavigator';

export default function RootNavigator() {
  const { isLoading, isAuthenticated, userRole, currentUser } = useAuth();
  const { myself } = useSelector((state) => state.getData);

  // Show splash branding screen while verifying stored credentials & hydrating session
  if (isLoading) {
    return <SplashScreen />;
  }

  // Unauthenticated: Mount AuthNavigator (Login, RoleSelection, Register, ForgotPassword).
  // Once the user authenticates, this stack is unmounted completely from the tree,
  // making it impossible to navigate or back-press to the login/role-selection screen.
  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  const effectiveUser = myself || currentUser;
  const normalizedRole = (userRole || effectiveUser?.role || 'owner').toLowerCase();
  const isCommercial = normalizedRole === 'distributor' || normalizedRole === 'reseller';

  // Strict Commercial Approval Gate:
  // Resellers & Distributors MUST be verified & approved by KYB Admin before accessing the app.
  if (isCommercial) {
    const isApproved =
      effectiveUser?.is_approved === true &&
      effectiveUser?.approval_status === 'approved';

    const isPendingOrRejected =
      effectiveUser?.is_approved === false ||
      effectiveUser?.approval_status === 'pending_approval' ||
      effectiveUser?.approval_status === 'rejected';

    if (!isApproved || isPendingOrRejected) {
      return <AccountPendingScreen />;
    }
  }

  // Authenticated & Approved: Route strictly to the appropriate domain stack based on user role
  switch (normalizedRole) {
    case 'distributor':
      return <DistributorNavigator />;
    case 'reseller':
      return <ResellerNavigator />;
    case 'owner':
    default:
      return <OwnerNavigator />;
  }
}
