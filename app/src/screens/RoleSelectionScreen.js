import React, { useEffect } from 'react';
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
import {
  OwnerRole3DIcon,
  ResellerRole3DIcon,
  DistributorRole3DIcon,
} from '../components/icons/HomeIcons';

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
      description: 'Search verified OE spark plugs, glow plugs & coils with fitment guarantee.',
      IconComponent: OwnerRole3DIcon,
      badge: 'Individual',
      badgeBg: '#FEE2E2',
      badgeColor: '#D0142C',
      boxBg: '#FEF2F2',
      boxBorder: '#FECDD3',
      ctaColor: '#D0142C',
    },
    {
      id: 'reseller',
      title: 'Professional Reseller',
      description: 'Workshop parts supply, quote requests & priority trade stock inquiry.',
      IconComponent: ResellerRole3DIcon,
      badge: 'Workshop & Trade',
      badgeBg: '#FEF3C7',
      badgeColor: '#D97706',
      boxBg: '#FFFBEB',
      boxBorder: '#FDE68A',
      ctaColor: '#D97706',
    },
    {
      id: 'distributor',
      title: 'Authorized Distributor',
      description: 'National freight, bulk stock management & regional stockist oversight.',
      IconComponent: DistributorRole3DIcon,
      badge: 'Enterprise Tier-1',
      badgeBg: '#E2E8F0',
      badgeColor: '#334155',
      boxBg: '#F1F5F9',
      boxBorder: '#CBD5E1',
      ctaColor: '#0F172A',
    },
  ];

  const handleRoleSelect = (roleId) => {
    navigation.navigate('Login', { role: roleId });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#D0142C" />

      {/* SOLID CRIMSON BRAND HERO HEADER */}
      <View style={[styles.solidHeader, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerBrandingPill}>
          <Image
            source={require('../assets/images/logo_cropped.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.headline}>Select Your Portal</Text>
        <Text style={styles.subheadline}>
          Choose your account persona to access verified automotive catalogs, trade pricing and technical services.
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
              const Icon = role.IconComponent;
              return (
                <TouchableOpacity
                  key={role.id}
                  style={styles.roleCard}
                  activeOpacity={0.84}
                  onPress={() => handleRoleSelect(role.id)}
                >
                  {/* Beautiful 3D Icon Box */}
                  <View
                    style={[
                      styles.cardIconBox,
                      {
                        backgroundColor: role.boxBg,
                        borderColor: role.boxBorder,
                      },
                    ]}
                  >
                    <Icon size={48} />
                  </View>

                  {/* Right Content Column */}
                  <View style={styles.cardContentCol}>
                    <View style={styles.cardTitleRow}>
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
                        Continue as {role.title}
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
              🔒 Official NGK Technical Services • Direct OEM Network
            </Text>
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerBrand}>NGK SPARK PLUG CO., LTD. • TECHNICAL SERVICES</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D0142C',
  },
  solidHeader: {
    backgroundColor: '#D0142C',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingBottom: 28,
  },
  headerBrandingPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 16,
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
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    textAlign: 'center',
    marginBottom: 6,
  },
  subheadline: {
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.92)',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
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
    borderRadius: 20,
  },
  headerFeaturePillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
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
    backgroundColor: '#F8FAFC',
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
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.1,
  },
  sectionSubText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  cardsStack: {
    gap: 15,
  },
  roleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
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
    borderRadius: 20,
    borderWidth: 1.5,
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
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  cardBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  cardBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  cardDescription: {
    fontSize: 12,
    color: '#64748B',
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
    borderRadius: 8,
    borderWidth: 1,
  },
  cardActionText: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  bottomSection: {
    gap: 8,
    alignItems: 'center',
    paddingTop: 8,
  },
  trustBanner: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  trustBannerText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.2,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 2,
  },
  footerBrand: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
});

export default RoleSelectionScreen;
