import React, { useEffect, useState } from 'react';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../../utils/theme';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, ChevronRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { getMyselfRedux } from '../../../redux/getData';
import {
  HomeDashboard3DIcon,
  FindParts3DIcon,
  MyGarage3DIcon,
  TechEnquiry3DIcon,
  DealerLocator3DIcon,
  Profile3DIcon,
  DrawerSignOut3DIcon,
} from '../../../components/icons/HomeIcons';

import { useAuth } from '../../../core/auth/useAuth';

export default function CustomDrawer({ navigation }) {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { signOut, userRole } = useAuth();
  const { myself } = useSelector((state) => state.getData);
  const [role, setRole] = useState(userRole || 'owner');

  useEffect(() => {
    const fetchUser = async () => {
      const storedRole = await AsyncStorage.getItem('role');
      const userId = await AsyncStorage.getItem('userId');
      if (storedRole) setRole(storedRole);
      if (userId && !myself) dispatch(getMyselfRedux(userId));
    };
    fetchUser();
  }, [dispatch, myself]);

  const handleLogout = async () => {
    await signOut();
  };

  const menuItems = [
    {
      id: 'home',
      label: 'Home Dashboard',
      subtitle: 'Main portal & live status',
      Icon: HomeDashboard3DIcon,
      bgColor: '#FFF1F2',
      borderColor: '#FFE4E6',
      action: () => {
        const homeRoute =
          role === 'reseller'
            ? 'ResellerHome'
            : role === 'distributor'
            ? 'DistributorHomeScreen'
            : 'OwnerHome';
        navigation.navigate(homeRoute);
      },
    },
    {
      id: 'profile',
      label: 'My Profile',
      subtitle: 'Account info & credentials',
      Icon: Profile3DIcon,
      bgColor: '#EEF2FF',
      borderColor: '#C7D2FE',
      action: () => navigation.navigate('Profile'),
    },
    {
      id: 'parts',
      label: 'Parts & Catalog Lookup',
      subtitle: 'TecDoc verified database',
      Icon: FindParts3DIcon,
      bgColor: COLORS.errorLight,
      borderColor: COLORS.errorBorder,
      action: () => navigation.navigate('PartsFinder'),
    },
    {
      id: 'garage',
      label: 'My Garage Vehicles',
      subtitle: 'Saved fleet & compatibility',
      Icon: MyGarage3DIcon,
      bgColor: COLORS.infoLight,
      borderColor: COLORS.infoLight,
      action: () => navigation.navigate('MyGarage'),
    },
    {
      id: 'enquiries',
      label: 'Technical Enquiries',
      subtitle: 'Direct engineering support',
      Icon: TechEnquiry3DIcon,
      bgColor: COLORS.successLight,
      borderColor: COLORS.successBorder,
      action: () => navigation.navigate('MyEnquiries'),
    },
    {
      id: 'dealers',
      label: 'Authorized Resellers',
      subtitle: 'Official certified network',
      Icon: DealerLocator3DIcon,
      bgColor: '#FFFBEB',
      borderColor: COLORS.warningBorder,
      action: () => navigation.navigate('DealerLocator'),
    },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent={false} />

      {/* Drawer Header (Solid NGK Crimson Theme matching rest of the app) */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.profileRow}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.8}
        >
          <View style={styles.profileTextCol}>
            <View style={styles.nameRow}>
              <Text style={styles.userName} numberOfLines={1}>
                {myself?.name || 'Account User'}
              </Text>
              <ChevronRight size={16} color={COLORS.white} opacity={0.8} />
            </View>
            <View style={styles.badgeRow}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>
                  {role.toUpperCase()}
                </Text>
              </View>
              <View style={styles.verifiedDot} />
              <Text style={styles.verifiedText}>View Profile</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Menu List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.menuList}
      >
        <Text style={styles.menuSectionHeader}>NAVIGATION</Text>

        {menuItems.map((item) => {
          const IconComp = item.Icon;
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.action}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.menuIconWrapper,
                  {
                    backgroundColor: item.bgColor,
                    borderColor: item.borderColor,
                  },
                ]}
              >
                <IconComp size={24} />
              </View>
              <View style={styles.menuItemTextCol}>
                <Text style={styles.menuItemText}>{item.label}</Text>
                <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
              </View>
              <View style={styles.chevronWrapper}>
                <ChevronRight size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Drawer Footer & Logout */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.75}
        >
          <DrawerSignOut3DIcon size={18} />
          <Text style={styles.logoutText}>Sign Out Account</Text>
        </TouchableOpacity>

        <View style={styles.brandFooterRow}>
          <Text style={styles.copyrightText}>
            KYB CORPORATION • SUSPENSION
          </Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionBadgeText}>v2.0 PRO</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: '#B91024',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: RADIUS.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  profileTextCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userName: {
    flex: 1,
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.white,
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 6,
  },
  roleBadge: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  roleBadgeText: {
    fontSize: 9.5,
    fontWeight: FONTS.weight.black,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  verifiedDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FEE2E2',
  },
  verifiedText: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.semiBold,
    color: '#FEE2E2',
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuList: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 8,
  },
  menuSectionHeader: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
  },
  menuIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuItemTextCol: {
    flex: 1,
  },
  menuItemText: {
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.bold,
    color: COLORS.slate800,
    letterSpacing: -0.1,
  },
  menuItemSubtitle: {
    fontSize: 11.5,
    fontWeight: FONTS.weight.medium,
    color: COLORS.textTertiary,
    marginTop: 1.5,
  },
  chevronWrapper: {
    paddingLeft: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceSecondary,
    backgroundColor: COLORS.white,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.errorLight,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    height: 46,
    borderRadius: RADIUS.md,
    marginBottom: 12,
  },
  logoutText: {
    fontSize: 13.5,
    fontWeight: FONTS.weight.bold,
    color: COLORS.error,
    letterSpacing: 0.1,
  },
  brandFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  copyrightText: {
    fontSize: 10.5,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.textMuted,
  },
  versionBadge: {
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: RADIUS.xs,
  },
  versionBadgeText: {
    fontSize: 9.5,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textTertiary,
  },
});