import React, { useEffect, useState } from 'react';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../../utils/theme';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Mail,
  ChevronRight,
  LogOut,
  Car,
  MessageSquare,
  Wrench,
  CheckCircle2,
  Pencil,
  Phone,
  User,
  X,
  Check,
  Trash2,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  getMyselfRedux,
  getEnquiryRedux,
  updateUserRedux,
  deleteUserRedux,
} from '../../../redux/getData';
import { useAuth } from '../../../core/auth/AuthContext';
import Toast from 'react-native-toast-message';

export default function OwnerProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { myself, enquiry } = useSelector((state) => state.getData);
  const { signOut } = useAuth();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Vehicle Owner edit form state (no workshop or business address)
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      const userId = myself?.id;
      if (userId) {
        dispatch(getMyselfRedux(userId));
        dispatch(getEnquiryRedux(userId));
      }
    };
    loadProfile();
  }, [dispatch, myself?.id]);

  // Sync form state when modal opens
  const openEditModal = () => {
    setEditName(myself?.name || '');
    setEditEmail(myself?.email || '');
    setEditPhone(myself?.phone || '');
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    const trimmedName = editName.trim();
    const trimmedEmail = editEmail.trim().toLowerCase();
    const trimmedPhone = editPhone.trim();

    if (!trimmedName || trimmedName.length < 2) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Full name must be at least 2 characters.',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please provide a valid email address.',
      });
      return;
    }

    const userId = myself?.id;
    if (!userId) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'User session not found.',
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone || null,
      };

      const result = await dispatch(
        updateUserRedux({ userId, userData: payload })
      ).unwrap();

      if (result) {
        Toast.show({
          type: 'success',
          text1: 'Profile Updated',
          text2: 'Your profile details have been saved.',
        });
        setEditModalVisible(false);
        dispatch(getMyselfRedux(userId));
      } else {
        Toast.show({
          type: 'error',
          text1: 'Update Failed',
          text2: 'Could not update profile. Please try again.',
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: err?.message || 'Failed to update profile',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account and all associated vehicles and enquiry history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            const userId = myself?.id;
            if (userId) {
              await dispatch(deleteUserRedux(userId));
            }
            await signOut();
          },
        },
      ]
    );
  };

  const userName = myself?.name || '';
  const userEmail = myself?.email || '';
  const userPhone = myself?.phone || '';
  const carsCount =
    myself?.garage?.length ||
    myself?.cars?.length ||
    myself?.vehicleId?.length ||
    0;
  const enquiriesCount = enquiry?.length || 0;

  // Generate 2-letter initials monogram without image CDN
  const getInitials = (name) => {
    if (!name || !name.trim()) return 'U';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Solid Crimson Header */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <ArrowLeft size={22} color={COLORS.white} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Vehicle Owner Profile</Text>
          <Text style={styles.headerSubtitle}>KYB DRIVER NETWORK</Text>
        </View>

        <TouchableOpacity
          style={styles.headerEditBtn}
          onPress={openEditModal}
          activeOpacity={0.75}
        >
          <Pencil size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Executive Profile Card (No CDN Image, Clean Initials Badge) */}
        <View style={styles.profileCard}>
          <View style={styles.profileCardTop}>
            <View style={styles.monogramBadge}>
              <Text style={styles.monogramText}>{getInitials(userName)}</Text>
            </View>

            <View style={styles.profileInfoCol}>
              <Text style={styles.profileName} numberOfLines={1}>
                {userName || 'Account User'}
              </Text>
              <View style={styles.roleRow}>
                <View style={styles.rolePill}>
                  <Text style={styles.rolePillText}>VEHICLE OWNER</Text>
                </View>
                <View style={styles.verifiedRow}>
                  <CheckCircle2 size={13} color={COLORS.primary} />
                  <Text style={styles.verifiedLabel}>Verified Driver</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Quick Edit CTA Pill */}
          <TouchableOpacity
            style={styles.editPillBtn}
            onPress={openEditModal}
            activeOpacity={0.75}
          >
            <Pencil size={14} color={COLORS.primary} />
            <Text style={styles.editPillText}>Edit Personal Details</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('MyGarage')}
            activeOpacity={0.75}
          >
            <View style={styles.statIconBadgeBlue}>
              <Car size={20} color="#2563EB" />
            </View>
            <Text style={styles.statNumber}>{carsCount}</Text>
            <Text style={styles.statLabel}>Garage Fleet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('MyEnquiries')}
            activeOpacity={0.75}
          >
            <View style={styles.statIconBadgeCrimson}>
              <MessageSquare size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.statNumber}>{enquiriesCount}</Text>
            <Text style={styles.statLabel}>Tech Enquiries</Text>
          </TouchableOpacity>
        </View>

        {/* Account Details Section (Strictly Owner fields: Name, Email, Phone) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>CONTACT DETAILS</Text>
            <TouchableOpacity onPress={openEditModal} activeOpacity={0.7}>
              <Text style={styles.sectionEditLink}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Full Name Item */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconWrapper}>
              <User size={16} color="#4B5563" />
            </View>
            <View style={styles.detailTextWrapper}>
              <Text style={styles.detailLabel}>Full Name</Text>
              <Text style={styles.detailValue}>{userName || 'Not provided'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Email Item */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconWrapper}>
              <Mail size={16} color="#4B5563" />
            </View>
            <View style={styles.detailTextWrapper}>
              <Text style={styles.detailLabel}>Email Address</Text>
              <Text style={styles.detailValue}>{userEmail || 'Not provided'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Phone Item */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconWrapper}>
              <Phone size={16} color="#4B5563" />
            </View>
            <View style={styles.detailTextWrapper}>
              <Text style={styles.detailLabel}>Phone Number</Text>
              <Text style={styles.detailValue}>{userPhone || 'Not provided'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Fleet Status */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconWrapper}>
              <Car size={16} color="#4B5563" />
            </View>
            <View style={styles.detailTextWrapper}>
              <Text style={styles.detailLabel}>Garage Fleet</Text>
              <Text style={styles.detailValue}>
                {carsCount === 1 ? '1 vehicle saved' : `${carsCount} vehicles saved`}
              </Text>
            </View>
          </View>
        </View>

        {/* Technical Direct Access */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>VEHICLE SERVICES</Text>

          <TouchableOpacity
            style={styles.navRow}
            onPress={() => navigation.navigate('MyGarage')}
            activeOpacity={0.7}
          >
            <View style={styles.navIconBadgeBlue}>
              <Car size={16} color="#2563EB" />
            </View>
            <View style={styles.navTextCol}>
              <Text style={styles.navTitle}>Manage Garage Fleet</Text>
              <Text style={styles.navSubtitle}>
                Add or remove personal vehicles for exact fitment lookup
              </Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.navRow}
            onPress={() => navigation.navigate('MyEnquiries')}
            activeOpacity={0.7}
          >
            <View style={styles.navIconBadgeCrimson}>
              <MessageSquare size={16} color={COLORS.primary} />
            </View>
            <View style={styles.navTextCol}>
              <Text style={styles.navTitle}>Technical Enquiries & Support</Text>
              <Text style={styles.navSubtitle}>
                Review expert engineering advice & quote requests
              </Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.navRow}
            onPress={() => navigation.navigate('PartsFinder')}
            activeOpacity={0.7}
          >
            <View style={styles.navIconBadgeRed}>
              <Wrench size={16} color={COLORS.primary} />
            </View>
            <View style={styles.navTextCol}>
              <Text style={styles.navTitle}>TecDoc Parts & Catalog</Text>
              <Text style={styles.navSubtitle}>
                Instant part verification across 50,000+ items
              </Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LogOut size={18} color="#DC2626" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity
          style={styles.deleteAccountBtn}
          onPress={confirmDeleteAccount}
          activeOpacity={0.8}
        >
          <Trash2 size={16} color="#9CA3AF" />
          <Text style={styles.deleteAccountText}>Delete Account Data</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          KYB CORPORATION • SUSPENSION & DAMPING
        </Text>
      </ScrollView>

      {/* Edit Profile Modal (Strictly Owner: Name, Email, Phone) */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setEditModalVisible(false)}
          />
          <View
            style={[
              styles.modalContainer,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <Text style={styles.modalSubtitle}>
                  Update your contact details
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setEditModalVisible(false)}
                activeOpacity={0.7}
              >
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Name Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <User size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Enter your full name"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Email Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Mail size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={editEmail}
                    onChangeText={setEditEmail}
                    placeholder="Enter your email address"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Phone Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={styles.inputWrapper}>
                  <Phone size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={editPhone}
                    onChangeText={setEditPhone}
                    placeholder="Enter your phone number"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setEditModalVisible(false)}
                disabled={isSaving}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalSaveBtn,
                  isSaving && styles.modalSaveBtnDisabled,
                ]}
                onPress={handleSaveProfile}
                disabled={isSaving}
                activeOpacity={0.8}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <>
                    <Check size={18} color={COLORS.white} style={styles.saveIcon} />
                    <Text style={styles.modalSaveText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBar: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.white,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: FONTS.weight.bold,
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  headerEditBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.slate100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  monogramBadge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: '#FACC15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  monogramText: {
    fontSize: FONTS.size.h3,
    fontWeight: FONTS.weight.black,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  profileInfoCol: {
    flex: 1,
  },
  profileName: {
    fontSize: 19,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rolePill: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rolePillText: {
    fontSize: 10,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.primary,
    letterSpacing: 0.4,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  verifiedLabel: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.primary,
  },
  editPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.errorLight,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    borderRadius: RADIUS.md,
    paddingVertical: 10,
  },
  editPillText: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.slate100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  statIconBadgeBlue: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.infoLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIconBadgeCrimson: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: FONTS.size.xxl,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.textTertiary,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.slate100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionHeader: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.textTertiary,
    letterSpacing: 0.6,
  },
  sectionEditLink: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primary,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailTextWrapper: {
    flex: 1,
  },
  detailLabel: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.bold,
    color: COLORS.slate800,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surfaceSecondary,
    marginVertical: 4,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  navIconBadgeBlue: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.infoLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  navIconBadgeCrimson: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  navIconBadgeRed: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  navTextCol: {
    flex: 1,
    marginRight: 8,
  },
  navTitle: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  navSubtitle: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.medium,
    color: COLORS.textTertiary,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.errorLight,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    marginBottom: 12,
  },
  signOutText: {
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.bold,
    color: COLORS.error,
  },
  deleteAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginBottom: 16,
  },
  deleteAccountText: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.textMuted,
  },
  footerNote: {
    fontSize: 10,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textMuted,
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceSecondary,
  },
  modalTitle: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.medium,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  modalScrollContent: {
    paddingBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
    color: COLORS.slate700,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: 48,
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.textPrimary,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceSecondary,
    backgroundColor: COLORS.white,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textSecondary,
  },
  modalSaveBtn: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  modalSaveBtnDisabled: {
    opacity: 0.65,
  },
  saveIcon: {
    marginRight: 6,
  },
  modalSaveText: {
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.bold,
    color: COLORS.white,
  },
});
