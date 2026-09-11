import React, { useEffect } from 'react';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../../utils/theme';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
} from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
const ownerIcon = require('../../../App_Logos_and_Icons_and_Backgrounds/Icon-VehicleOwner.png');
const resellerIcon = require('../../../App_Logos_and_Icons_and_Backgrounds/Icon-Reseller.png');
const distributorIcon = require('../../../App_Logos_and_Icons_and_Backgrounds/Icon-Distributor.png');

const RoleSelectionScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const checkAlreadyLogin = async () => {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      const role = await AsyncStorage.getItem('role');
      if ((token || userId) && role) {
        const lowerRole = role.toLowerCase();
        navigation.replace(
          lowerRole === 'owner'
            ? 'OwnerHome'
            : lowerRole === 'reseller'
            ? 'ResellerHome'
            : 'DistributorHomeScreen'
        );
      }
    };
    checkAlreadyLogin();
  }, [navigation]);

  const roles = [
    {
      id: 'owner',
      title: 'Vehicle Owner',
      description: 'Search verified OE shock absorbers, struts, and coil springs with fitment guarantee.',
      iconSource: ownerIcon,
      badge: 'Individual',
      badgeBg: '#FEE2E2',
      badgeColor: '#E31837',
      boxBg: '#FEF2F2',
      boxBorder: '#FECDD3',
      ctaColor: '#E31837',
    },
    {
      id: 'reseller',
      title: 'Professional Reseller',
      description: 'Workshop parts supply, quote requests & priority trade stock inquiry.',
      iconSource: resellerIcon,
      badge: 'Workshop & Trade',
      badgeBg: '#FEF3C7',
      badgeColor: '#B45309',
      boxBg: '#FFFBEB',
      boxBorder: '#FDE68A',
      ctaColor: '#D97706',
    },
    {
      id: 'distributor',
      title: 'Authorized Distributor',
      description: 'National freight, bulk stock management & regional reseller oversight.',
      iconSource: distributorIcon,
      badge: 'Enterprise Tier-1',
      badgeBg: '#F1F5F9',
      badgeColor: '#1E293B',
      boxBg: '#F8FAFC',
      boxBorder: '#CBD5E1',
      ctaColor: '#1E293B',
    },
  ];

  const handleRoleSelect = (roleId) => {
    navigation.navigate('Login', { role: roleId });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* SOLID CRIMSON BRAND HERO HEADER */}
      <View style={[styles.solidHeader, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerBrandingPill}>
          <Image
            source={require('../../../assets/images/branding/kyb_logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.headline}>Select Your Portal</Text>
        <Text style={styles.subheadline}>
          Choose your Account Type in order to view our digital catalogue
        </Text>

        {/* Feature Highlights Pills */}
        <View style={styles.headerPillsRow}>
          <View style={styles.headerFeaturePill}>
            <Text style={styles.headerFeaturePillText}>OE Fitment Guarantee</Text>
          </View>
          <View style={styles.headerFeatureDot} />
          <View style={styles.headerFeaturePill}>
            <Text style={styles.headerFeaturePillText}>Trade Pricing</Text>
          </View>
          <View style={styles.headerFeatureDot} />
          <View style={styles.headerFeaturePill}>
            <Text style={styles.headerFeaturePillText}>Priority Dispatch</Text>
          </View>
        </View>
      </View>

      {/* LOWER SECTION: WELL-PROPORTIONED CARDS WITH BEAUTIFUL 3D ICONS */}
      <View style={[styles.lowerContainer, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
        <View style={styles.cardsWrapper}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderText}>AVAILABLE ACCESS PORTALS</Text>
            <Text style={styles.sectionSubText}>3 Personas</Text>
          </View>

          <View style={styles.cardsStack}>
            {roles.map((role) => {
              return (
                <TouchableOpacity
                  key={role.id}
                  style={styles.roleCard}
                  activeOpacity={0.84}
                  onPress={() => handleRoleSelect(role.id)}
                >
                  {/* Clean White Icon Box */}
                  <View style={styles.cardIconBox}>
                    <Image
                      source={role.iconSource}
                      style={{ width: 44, height: 44 }}
                      resizeMode="contain"
                    />
                  </View>

                  {/* Right Content Column */}
                  <View style={styles.cardContentCol}>
                    <View style={styles.cardHeaderStack}>
                      <Text style={styles.cardTitle}>{role.title}</Text>
                      <View style={[styles.cardBadge, { backgroundColor: role.badgeBg }]}>
                        <Text style={[styles.cardBadgeText, { color: role.badgeColor }]}>
                          {role.badge}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.cardDescription} numberOfLines={2}>
                      {role.description}
                    </Text>

                    <View
                      style={[
                        styles.cardActionPill,
                        { backgroundColor: role.boxBg, borderColor: role.boxBorder },
                      ]}
                    >
                      <Text style={[styles.cardActionText, { color: role.ctaColor }]}>
                        Continue
                      </Text>
                      <ArrowRight size={13} color={role.ctaColor} strokeWidth={2.5} />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Bottom Trust & Footer */}
        <View style={styles.bottomSection}>
          <View style={styles.trustBanner}>
            <Text style={styles.trustBannerText}>
              🔒 Official KYB Suspension Services • Direct OEM Network
            </Text>
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerBrand}>KYB CORPORATION • SUSPENSION & DAMPING SYSTEMS</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  solidHeader: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingBottom: 28,
  },
  headerBrandingPill: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: RADIUS.lg,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogo: {
    width: 54,
    height: 34,
  },
  headline: {
    fontSize: 24,
    fontWeight: FONTS.weight.black,
    color: COLORS.white,
    letterSpacing: -0.4,
    textAlign: 'center',
    marginBottom: 6,
  },
  subheadline: {
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.92)',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: FONTS.weight.medium,
    maxWidth: 330,
    marginBottom: 14,
  },
  headerPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  headerFeaturePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.xl,
  },
  headerFeaturePillText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: FONTS.weight.bold,
    letterSpacing: 0.2,
  },
  headerFeatureDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  lowerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 18,
    paddingTop: 20,
    justifyContent: 'space-between',
  },
  cardsWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionHeaderText: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.slate400,
    letterSpacing: 1.1,
  },
  sectionSubText: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.bold,
    color: COLORS.borderDark,
  },
  cardsStack: {
    gap: 15,
  },
  roleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: COLORS.slate900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconBox: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  cardContentCol: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  cardHeaderStack: {
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.slate900,
    letterSpacing: -0.3,
  },
  cardBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    marginTop: 3,
    marginBottom: 3,
  },
  cardBadgeText: {
    fontSize: 8.5,
    fontWeight: FONTS.weight.heavy,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  cardDescription: {
    fontSize: FONTS.size.xs,
    color: COLORS.textTertiary,
    lineHeight: 17,
    marginBottom: 8,
  },
  cardActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  cardActionText: {
    fontSize: 11.5,
    fontWeight: FONTS.weight.bold,
    letterSpacing: 0.1,
  },
  bottomSection: {
    gap: 8,
    alignItems: 'center',
    paddingTop: 8,
  },
  trustBanner: {
    backgroundColor: COLORS.white,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  trustBannerText: {
    fontSize: 10.5,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textSecondary,
    letterSpacing: 0.2,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 2,
  },
  footerBrand: {
    fontSize: 9.5,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.slate400,
    letterSpacing: 0.8,
  },
});

export default RoleSelectionScreen;
