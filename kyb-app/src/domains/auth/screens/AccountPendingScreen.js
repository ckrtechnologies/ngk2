import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Image,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ShieldAlert,
  Clock,
  RefreshCw,
  LogOut,
  Building2,
  Mail,
  User,
  CheckCircle2,
  XCircle,
  Phone,
  MapPin,
  HelpCircle,
} from 'lucide-react-native';
import { useAuth } from '../../../core/auth/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import { getMyselfRedux } from '../../../redux/getData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

export default function AccountPendingScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { currentUser, signOut, refreshProfile } = useAuth();
  const { myself } = useSelector((state) => state.getData);

  const [refreshing, setRefreshing] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // User details from context or Redux
  const user = myself || currentUser || {};
  const isRejected = user?.approval_status === 'rejected';
  const roleName =
    user?.role === 'distributor'
      ? 'Regional Distributor'
      : user?.role === 'reseller'
      ? 'Authorized Reseller'
      : 'Commercial Partner';

  const handleCheckStatus = async () => {
    setCheckingStatus(true);
    try {
      const storedId = (await AsyncStorage.getItem('userId')) || user?.id;
      if (storedId) {
        const fresh = await dispatch(getMyselfRedux(storedId)).unwrap();
        if (fresh?.is_approved === true || fresh?.approval_status === 'approved') {
          await refreshProfile();
          Toast.show({
            type: 'success',
            text1: 'Account Approved!',
            text2: 'Welcome to KYB South Africa.',
          });
          return;
        }
      }
      Toast.show({
        type: 'info',
        text1: isRejected ? 'Application Declined' : 'Verification In Progress',
        text2: isRejected
          ? 'Your account application was not approved by administration.'
          : 'Your account is still pending verification by KYB Admin.',
      });
    } catch (e) {
      console.warn('Status check error:', e);
      Toast.show({
        type: 'error',
        text1: 'Connection Error',
        text2: 'Could not connect to server to check verification status.',
      });
    } finally {
      setCheckingStatus(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await handleCheckStatus();
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F121C" translucent={false} />

      {/* Modern Crimson & Dark Header */}
      <View style={[styles.headerSection, { paddingTop: insets.top + (Platform.OS === 'android' ? 12 : 8) }]}>
        <View style={styles.headerContent}>
          <View style={styles.logoRow}>
            <Image
              source={require('../../../assets/images/branding/kyb_logo.png')}
              style={styles.logoImg}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.brandTitle}>KYB SUSPENSION</Text>
              <Text style={styles.brandSubtitle}>COMMERCIAL NETWORK</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={signOut}
            activeOpacity={0.8}
          >
            <LogOut size={16} color="#FFFFFF" />
            <Text style={styles.logoutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#E31837']}
            tintColor="#E31837"
          />
        }
      >
        {/* Status Badge & Icon */}
        <View style={styles.statusHero}>
          <View
            style={[
              styles.iconCircleOuter,
              isRejected ? styles.iconCircleRejected : styles.iconCirclePending,
            ]}
          >
            <View
              style={[
                styles.iconCircleInner,
                isRejected ? styles.innerRejected : styles.innerPending,
              ]}
            >
              {isRejected ? (
                <XCircle size={36} color="#DC2626" strokeWidth={2.2} />
              ) : (
                <Clock size={36} color="#D97706" strokeWidth={2.2} />
              )}
            </View>
          </View>

          <View
            style={[
              styles.statusPill,
              isRejected ? styles.statusPillRejected : styles.statusPillPending,
            ]}
          >
            <Text
              style={[
                styles.statusPillText,
                isRejected ? styles.statusTextRejected : styles.statusTextPending,
              ]}
            >
              {isRejected ? 'APPLICATION DECLINED' : 'ACCOUNT UNDER VERIFICATION'}
            </Text>
          </View>

          <Text style={styles.heroTitle}>
            {isRejected
              ? 'Commercial Account Not Approved'
              : 'Admin Approval Required'}
          </Text>

          <Text style={styles.heroDescription}>
            {isRejected
              ? 'Your commercial trading application has been reviewed and declined. Please contact KYB compliance if you believe this is in error.'
              : `Thank you for registering as an authorized ${roleName}. For wholesale compliance and authorized trade access, all commercial accounts must be verified by KYB South Africa administration before access is granted.`}
          </Text>
        </View>

        {/* Account Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardHeaderTitle}>Submitted Registration Details</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Building2 size={16} color="#4B5563" />
            </View>
            <View style={styles.detailTextBox}>
              <Text style={styles.detailLabel}>Company / Trade Name</Text>
              <Text style={styles.detailValue}>{user?.name || 'Registered Commercial Partner'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Mail size={16} color="#4B5563" />
            </View>
            <View style={styles.detailTextBox}>
              <Text style={styles.detailLabel}>Registered Email</Text>
              <Text style={styles.detailValue}>{user?.email || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <User size={16} color="#4B5563" />
            </View>
            <View style={styles.detailTextBox}>
              <Text style={styles.detailLabel}>Account Role</Text>
              <Text style={styles.detailValue}>{roleName}</Text>
            </View>
          </View>

          {user?.address ? (
            <View style={styles.detailRow}>
              <View style={styles.detailIconBox}>
                <MapPin size={16} color="#4B5563" />
              </View>
              <View style={styles.detailTextBox}>
                <Text style={styles.detailLabel}>Business Location</Text>
                <Text style={styles.detailValue} numberOfLines={2}>{user.address}</Text>
              </View>
            </View>
          ) : null}

          {user?.phone ? (
            <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
              <View style={styles.detailIconBox}>
                <Phone size={16} color="#4B5563" />
              </View>
              <View style={styles.detailTextBox}>
                <Text style={styles.detailLabel}>Contact Phone</Text>
                <Text style={styles.detailValue}>{user.phone}</Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Security & Access Protection Notice */}
        <View style={styles.noticeBox}>
          <ShieldAlert size={20} color="#6B7280" style={{ marginTop: 2 }} />
          <Text style={styles.noticeText}>
            Wholesale catalog pricing, regional inquiry routing, and dealer directory placement activate automatically once an administrator approves your account credentials.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.primaryBtn, checkingStatus && styles.primaryBtnDisabled]}
            onPress={handleCheckStatus}
            disabled={checkingStatus}
            activeOpacity={0.8}
          >
            {checkingStatus ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <RefreshCw size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.primaryBtnText}>Check Approval Status</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={signOut}
            activeOpacity={0.8}
          >
            <LogOut size={16} color="#374151" style={{ marginRight: 8 }} />
            <Text style={styles.secondaryBtnText}>Sign Out of this Account</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.pullToRefreshHint}>
          Pull down to refresh approval status at any time
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerSection: {
    backgroundColor: '#0F121C',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoImg: {
    width: 38,
    height: 38,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  brandSubtitle: {
    color: '#E31837',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#374151',
  },
  logoutBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  statusHero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircleOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconCirclePending: {
    backgroundColor: '#FEF3C7',
  },
  iconCircleRejected: {
    backgroundColor: '#FEE2E2',
  },
  iconCircleInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerPending: {
    backgroundColor: '#FDE68A',
  },
  innerRejected: {
    backgroundColor: '#FECACA',
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusPillPending: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  statusPillRejected: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  statusTextPending: {
    color: '#92400E',
  },
  statusTextRejected: {
    color: '#B91C1C',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: '#4B5563',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  detailIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailTextBox: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '700',
    marginTop: 1,
  },
  noticeBox: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#4B5563',
  },
  actionContainer: {
    gap: 12,
    marginBottom: 16,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E31837',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#E31837',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  secondaryBtnText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
  },
  pullToRefreshHint: {
    textAlign: 'center',
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 8,
  },
});
