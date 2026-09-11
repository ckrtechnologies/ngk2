import React, { useState, useCallback } from 'react';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../../utils/theme';
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
            <LogOut size={16} color={COLORS.white} />
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
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
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
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <RefreshCw size={18} color={COLORS.white} style={{ marginRight: 8 }} />
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
    borderBottomColor: COLORS.slate800,
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
    color: COLORS.white,
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.heavy,
    letterSpacing: 0.8,
  },
  brandSubtitle: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: FONTS.weight.bold,
    letterSpacing: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.slate800,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.sm,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.slate700,
  },
  logoutBtnText: {
    color: COLORS.white,
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.semiBold,
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
    borderRadius: RADIUS.xs0,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconCirclePending: {
    backgroundColor: COLORS.warningLight,
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
    backgroundColor: COLORS.warningBorder,
  },
  innerRejected: {
    backgroundColor: COLORS.errorBorder,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.xl,
    marginBottom: 12,
  },
  statusPillPending: {
    backgroundColor: COLORS.warningLight,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  statusPillRejected: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  statusPillText: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.heavy,
    letterSpacing: 0.8,
  },
  statusTextPending: {
    color: '#92400E',
  },
  statusTextRejected: {
    color: '#B91C1C',
  },
  heroTitle: {
    fontSize: FONTS.size.h3,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: FONTS.size.sm,
    lineHeight: 20,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderTitle: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.slate700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceSecondary,
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
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailTextBox: {
    flex: 1,
  },
  detailLabel: {
    fontSize: FONTS.size.caption,
    color: COLORS.textTertiary,
    fontWeight: FONTS.weight.medium,
  },
  detailValue: {
    fontSize: FONTS.size.sm,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weight.bold,
    marginTop: 1,
  },
  noticeBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: RADIUS.md,
    padding: 14,
    marginBottom: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noticeText: {
    flex: 1,
    fontSize: FONTS.size.xs,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },
  actionContainer: {
    gap: 12,
    marginBottom: 16,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.bold,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 13,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  secondaryBtnText: {
    color: COLORS.slate700,
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.semiBold,
  },
  pullToRefreshHint: {
    textAlign: 'center',
    fontSize: FONTS.size.caption,
    color: COLORS.textMuted,
    marginTop: 8,
  },
});
