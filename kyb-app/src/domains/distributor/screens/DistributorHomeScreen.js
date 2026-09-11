import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../../utils/theme';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  ImageBackground,
} from 'react-native';

const headerRedBg = require('../../../App_Logos_and_Icons_and_Backgrounds/background-Landing-red.jpg');
import { RefreshControl } from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Menu,
  Bell,
  Search,
  MessageSquare,
  Truck,
  Layers,
  Clock,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getEnquiryRedux, getMyselfRedux } from '../../../redux/getData';

const DistributorHomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { enquiry, myself } = useSelector((state) => state.getData);

  const [refreshing, setRefreshing] = useState(false);

  const fetchHubData = useCallback(async () => {
    const userId = await AsyncStorage.getItem('userId');
    if (userId) {
      dispatch(getMyselfRedux(userId));
      dispatch(getEnquiryRedux(userId));
    }
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHubData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchHubData();
  }, [fetchHubData]);

  const pendingCount = useMemo(() => {
    return (
      enquiry?.filter((e) => {
        const s = (e.status || 'Pending').toLowerCase().replace(/[\s_-]+/g, '');
        return s === 'pending' || s === 'open';
      })?.length || 0
    );
  }, [enquiry]);

  const inProgressCount = useMemo(() => {
    return (
      enquiry?.filter((e) => {
        const s = (e.status || '').toLowerCase().replace(/[\s_-]+/g, '');
        return s === 'inprogress' || s === 'inprocess';
      })?.length || 0
    );
  }, [enquiry]);

  const hasUnreadNotifications = useMemo(() => {
    if (!myself?.notifications || !Array.isArray(myself.notifications)) return false;
    return myself.notifications.some(
      (n) => n.isRead === false || n.is_read === false
    );
  }, [myself?.notifications]);

  const quickActions = [
    {
      id: 'catalog',
      title: 'Bulk Catalog',
      subtitle: 'OE & application index',
      icon: <Search size={22} color={COLORS.textPrimary} />,
      bg: COLORS.surfaceSecondary,
      route: 'PartsFinder',
    },
    {
      id: 'enquiries',
      title: 'Regional Tickets',
      subtitle: `${pendingCount} open technical enquiries`,
      icon: <MessageSquare size={22} color={COLORS.primary} />,
      bg: '#FEE2E2',
      route: 'MyEnquiries',
    },
    {
      id: 'logistics',
      title: 'Stock Allocation',
      subtitle: 'Regional inventory levels',
      icon: <Truck size={22} color="#2563EB" />,
      bg: COLORS.infoLight,
      route: 'PartsFinder',
    },
    {
      id: 'dealers',
      title: 'Reseller Network',
      subtitle: 'Authorized dealer management',
      icon: <Layers size={22} color={COLORS.primary} />,
      bg: COLORS.primaryLight,
      route: 'DealerLocator',
    },
  ];

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Branded KYB Crimson Header with dynamic speed background */}
      <ImageBackground
        source={headerRedBg}
        style={[styles.solidHeader, { paddingTop: insets.top + 8 }]}
        resizeMode="cover"
      >
        {/* Left: Navigation Menu Trigger + Dedicated Welcome Greeting */}
        <View style={styles.headerLeftCluster}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('CustomDrawer')}
            activeOpacity={0.75}
          >
            <Menu size={22} color={COLORS.white} strokeWidth={2.4} />
          </TouchableOpacity>

          <View style={styles.headerGreetingBlock}>
            <Text style={styles.headerGreetingHello}>DISTRIBUTOR,</Text>
            <Text style={styles.headerUserName} numberOfLines={1}>
              {myself?.name ? myself.name : 'Partner'}
            </Text>
          </View>
        </View>

        {/* Right: Iconic Crisp KYB Brand Seal & Notification Bell */}
        <View style={styles.headerRightCluster}>
          <View style={styles.headerLogoPill}>
            <Image
              source={require('../../../assets/images/branding/kyb_logo.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>

          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.75}
          >
            <Bell size={20} color={COLORS.white} strokeWidth={2.4} />
            {hasUnreadNotifications && <View style={styles.badgeDot} />}
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Distributor Header */}
        <View style={styles.greetingSection}>
          <View style={styles.distributorBadge}>
            <Text style={styles.distributorBadgeText}>AUTHORIZED DISTRIBUTOR</Text>
          </View>
          <Text style={styles.greetingName}>
            {myself?.name ? myself.name : 'Distribution Partner'}
          </Text>
        </View>

        {/* Account Approval Review Banner */}
        {myself && (myself.is_approved === false || myself.approval_status === 'pending_approval') && (
          <View style={styles.reviewBanner}>
            <View style={styles.reviewBannerIconBox}>
              <Clock size={16} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.reviewBannerTitle}>Regional Hub Under Review</Text>
              <Text style={styles.reviewBannerDesc}>
                Your distributor credentials are under verification by KYB Admin. Network queries will activate once approved.
              </Text>
            </View>
          </View>
        )}

        {/* KPI Metric Chips */}
        <View style={styles.kpiRow}>
          <TouchableOpacity
            style={styles.kpiCard}
            onPress={() => navigation.navigate('MyEnquiries', { initialFilter: 'pending' })}
            activeOpacity={0.75}
          >
            <View style={styles.kpiIconWrapper}>
              <Clock size={16} color={COLORS.primary} />
            </View>
            <Text style={styles.kpiValue}>{pendingCount}</Text>
            <Text style={styles.kpiLabel}>Pending Actions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.kpiCard}
            onPress={() => navigation.navigate('MyEnquiries', { initialFilter: 'inprogress' })}
            activeOpacity={0.75}
          >
            <View style={[styles.kpiIconWrapper, { backgroundColor: COLORS.infoLight }]}>
              <TrendingUp size={16} color="#2563EB" />
            </View>
            <Text style={styles.kpiValue}>{inProgressCount}</Text>
            <Text style={styles.kpiLabel}>Active Tickets</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.kpiCard}
            onPress={() => navigation.navigate('MyEnquiries', { initialFilter: 'all' })}
            activeOpacity={0.75}
          >
            <View style={[styles.kpiIconWrapper, { backgroundColor: COLORS.primaryLight }]}>
              <CheckCircle2 size={16} color={COLORS.primary} />
            </View>
            <Text style={styles.kpiValue}>
              {enquiry?.length || 0}
            </Text>
            <Text style={styles.kpiLabel}>Total Managed</Text>
          </TouchableOpacity>
        </View>

        {/* 2x2 Quick Action Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Distribution Hub</Text>
        </View>

        <View style={styles.gridContainer}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.gridTile}
              onPress={() => navigation.navigate(action.route)}
              activeOpacity={0.75}
            >
              <View style={[styles.tileIconCircle, { backgroundColor: action.bg }]}>
                {action.icon}
              </View>
              <Text style={styles.tileTitle}>{action.title}</Text>
              <Text style={styles.tileSubtitle} numberOfLines={2}>
                {action.subtitle}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  solidHeader: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#A50E26',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerLeftCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  headerGreetingBlock: {
    justifyContent: 'center',
    flexShrink: 1,
  },
  headerGreetingHello: {
    fontSize: 13.5,
    fontWeight: FONTS.weight.heavy,
    color: 'rgba(255, 255, 255, 0.82)',
    letterSpacing: 0.8,
  },
  headerUserName: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.black,
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  headerRightCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  headerLogoPill: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 3,
    elevation: 3,
  },
  headerLogo: {
    width: 38,
    height: 16,
  },
  badgeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 7.5,
    height: 7.5,
    borderRadius: RADIUS.xs,
    backgroundColor: '#FBBF24',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  greetingSection: {
    marginBottom: 14,
  },
  distributorBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.textPrimary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  distributorBadgeText: {
    fontSize: 10,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.white,
  },
  greetingName: {
    fontSize: FONTS.size.h3,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  kpiIconWrapper: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.sm,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  kpiValue: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.textPrimary,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.textTertiary,
    marginTop: 2,
    textAlign: 'center',
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridTile: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  tileIconCircle: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  tileTitle: {
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  tileSubtitle: {
    fontSize: FONTS.size.caption,
    color: COLORS.textTertiary,
    lineHeight: 15,
  },
  reviewBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: COLORS.warningLight,
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  reviewBannerIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: COLORS.warningBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  reviewBannerTitle: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.heavy,
    color: '#92400E',
  },
  reviewBannerDesc: {
    fontSize: FONTS.size.caption,
    color: '#B45309',
    marginTop: 2,
    lineHeight: 15,
  },
});

export default DistributorHomeScreen;