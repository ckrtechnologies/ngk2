import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  Animated,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreen = ({ navigation }) => {
  // Reveal Choreography Animated Values
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const auraScale = useRef(new Animated.Value(0.4)).current;
  const auraOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(24)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Multi-Stage Choreographed 3-Second Reveal Sequence
    Animated.sequence([
      // Stage 1: Aura ignite & Logo entrance spring (0ms - 900ms)
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 45,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(auraScale, {
          toValue: 1.2,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(auraOpacity, {
          toValue: 0.28,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Stage 2: Aura breathe & Tagline slide-up reveal (900ms - 1800ms)
      Animated.parallel([
        Animated.timing(auraScale, {
          toValue: 1.0,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(auraOpacity, {
          toValue: 0.16,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Full 3-second continuous progress indicator (0ms - 2900ms)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2900,
      useNativeDriver: false,
    }).start();

    // 2. Strict 3-Second Session Resolution & Navigation
    let isMounted = true;
    const checkSessionAndNavigate = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const role = await AsyncStorage.getItem('role');
        const userId = await AsyncStorage.getItem('userId');

        // Strictly wait 3000ms for the full reveal animation
        await new Promise((resolve) => setTimeout(resolve, 3000));

        if (!isMounted) return;

        if (navigation?.replace) {
          if ((token || userId) && role) {
            const lowerRole = role.toLowerCase();
            if (lowerRole === 'owner') {
              navigation.replace('OwnerHome');
            } else if (lowerRole === 'reseller') {
              navigation.replace('ResellerHome');
            } else if (lowerRole === 'distributor') {
              navigation.replace('DistributorHomeScreen');
            } else {
              navigation.replace('RoleSelection');
            }
          } else {
            navigation.replace('RoleSelection');
          }
        }
      } catch (err) {
        if (isMounted && navigation?.replace) {
          navigation.replace('RoleSelection');
        }
      }
    };

    checkSessionAndNavigate();

    return () => {
      isMounted = false;
    };
  }, [navigation, auraOpacity, auraScale, logoOpacity, logoScale, progressAnim, textOpacity, textTranslateY]);

  const progressBarWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0D14" />

      <View style={styles.centerBox}>
        {/* Animated Glow Aura */}
        <Animated.View
          style={[
            styles.logoAura,
            {
              opacity: auraOpacity,
              transform: [{ scale: auraScale }],
            },
          ]}
        />

        {/* 3-Sec Reveal Animated Logo Container */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={styles.logoFrame}>
            <Image
              source={require('../assets/images/logo_cropped.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Revealed Tagline & Identity */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Text style={styles.title}>NGK SPARK PLUGS</Text>
          <View style={styles.taglineBadge}>
            <Text style={styles.subtitle}>Innovation for All • Technical Services</Text>
          </View>
        </Animated.View>
      </View>

      {/* 3-Second Loading Bar Indicator */}
      <View style={styles.footerContainer}>
        <View style={styles.progressBarTrack}>
          <Animated.View style={[styles.progressBarFill, { width: progressBarWidth }]} />
        </View>
        <Text style={styles.footerText}>INITIALIZING TECHNICAL PORTAL</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0D14',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp('5%'),
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logoAura: {
    position: 'absolute',
    width: wp('55%'),
    height: wp('55%'),
    borderRadius: wp('27.5%'),
    backgroundColor: '#D0142C',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('3%'),
    zIndex: 2,
  },
  logoFrame: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 26,
    shadowColor: '#D0142C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: wp('28%'),
    height: wp('28%'),
  },
  textContainer: {
    alignItems: 'center',
    zIndex: 2,
  },
  title: {
    color: '#FFFFFF',
    fontSize: wp('6.5%'),
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: hp('1%'),
  },
  taglineBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  subtitle: {
    color: '#E2E8F0',
    fontSize: wp('3.3%'),
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  footerContainer: {
    width: wp('70%'),
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  progressBarTrack: {
    width: '100%',
    height: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#D0142C',
    borderRadius: 2,
  },
  footerText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});

export default SplashScreen;
