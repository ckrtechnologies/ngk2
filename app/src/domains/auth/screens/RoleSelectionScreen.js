import React, { useEffect } from 'react';
import { COLORS } from '../../../utils/theme';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const headerBg = require('../../../App_Logos_and_Icons_and_Backgrounds/background-Landing-header-spark.jpg');
const emblemImg = require('../../../assets/images/ngk_emblem_red.png');
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
      badge: 'INDIVIDUAL',
      badgeColor: '#E31837',
      description: 'Search verified OE spark plugs, glow plugs & coils with fitment guarantee.',
      iconSource: ownerIcon,
      arrowBg: '#E31837',
    },
    {
      id: 'reseller',
      title: 'Certified Reseller',
      badge: 'WORKSHOP & TRADE',
      badgeColor: '#D97706',
      description: 'Workshop parts supply, quote requests & priority trade stock inquiry.',
      iconSource: resellerIcon,
      arrowBg: '#D97706',
    },
    {
      id: 'distributor',
      title: 'Distributor',
      badge: 'ENTERPRISE TIER',
      badgeColor: '#475569',
      description: 'National freight, bulk stock management & regional reseller oversight.',
      iconSource: distributorIcon,
      arrowBg: '#475569',
    },
  ];

  const handleRoleSelect = (roleId) => {
    navigation.navigate('Login', { role: roleId });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#07090E" translucent={false} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO HEADER SECTION WITH BURST SPARK BACKGROUND */}
        <ImageBackground
          source={headerBg}
          style={[
            styles.heroHeader,
            { paddingTop: insets.top + (Platform.OS === 'android' ? 24 : 16) },
          ]}
          resizeMode="cover"
        >
          {/* Subtle dark tint so spark flare remains bright & crisp */}
          <View style={styles.heroOverlay} />

          {/* Clean NGK Sunburst Round Emblem */}
          <View style={styles.emblemWrapper}>
            <Image
              source={emblemImg}
              style={styles.emblemImage}
              resizeMode="contain"
            />
          </View>

          {/* Digital Catalog Brand Headline */}
          <Text style={styles.headline}>DIGITAL CATALOG</Text>
          <Text style={styles.subheadline}>
            CHOOSE YOUR CORRECT ACCOUNT TYPE TO LOG IN
          </Text>
        </ImageBackground>

        {/* LOWER SECTION: CURVED WHITE CARD CONTAINER */}
        <View
          style={[
            styles.lowerContainer,
            { paddingBottom: Math.max(insets.bottom, 16) + 16 },
          ]}
        >
          <Text style={styles.sectionHeaderText}>AVAILABLE ACCESS PORTALS</Text>

          <View style={styles.cardsStack}>
            {roles.map((role) => {
              return (
                <TouchableOpacity
                  key={role.id}
                  style={styles.roleCard}
                  activeOpacity={0.88}
                  onPress={() => handleRoleSelect(role.id)}
                >
                  {/* Circular Persona Icon - crisp with no artificial gray box */}
                  <Image
                    source={role.iconSource}
                    style={styles.cardIcon}
                    resizeMode="contain"
                  />

                  {/* Middle Text Column */}
                  <View style={styles.cardContentCol}>
                    <Text style={styles.cardTitle}>{role.title}</Text>
                    <Text style={[styles.cardBadgeText, { color: role.badgeColor }]}>
                      {role.badge}
                    </Text>
                    <Text style={styles.cardDescription} numberOfLines={2}>
                      {role.description}
                    </Text>
                  </View>

                  {/* Bottom-Right Chevron Action Button matching Mockup */}
                  <View style={[styles.arrowCircle, { backgroundColor: role.arrowBg }]}>
                    <ChevronRight size={13} color={COLORS.white} strokeWidth={3} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Bottom Trust & Corporate Footer */}
          <View style={styles.bottomSection}>
            <Text style={styles.trustBannerText}>
              Official NGK Technical Services • Direct OEM Network
            </Text>
            <Text style={styles.footerBrand}>
              NGK SPARK PLUG CO., LTD. • TECHNICAL SERVICES
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07090E',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#07090E',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#07090E',
  },
  heroHeader: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 28,
    position: 'relative',
    overflow: 'hidden',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  emblemWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  emblemImage: {
    width: 96,
    height: 96,
  },
  headline: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: 6,
    textTransform: 'uppercase',
  },
  subheadline: {
    fontSize: 9.5,
    color: 'rgba(255, 255, 255, 0.92)',
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 0.8,
    maxWidth: 320,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  lowerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 18,
    paddingTop: 22,
  },
  sectionHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  cardsStack: {
    gap: 12,
  },
  roleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  cardIcon: {
    width: 54,
    height: 54,
  },
  cardContentCol: {
    flex: 1,
    marginLeft: 14,
    marginRight: 28,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 20,
  },
  cardBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 2,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 15.5,
  },
  arrowCircle: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 2,
  },
  bottomSection: {
    alignItems: 'center',
    paddingVertical: 22,
  },
  trustBannerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  footerBrand: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 0.8,
    marginTop: 6,
    textAlign: 'center',
  },
});

export default RoleSelectionScreen;
