import React, { useMemo, useState, useEffect, useRef } from 'react';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../../utils/theme';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Mail, Lock, Eye, EyeOff, ChevronLeft } from 'lucide-react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiFunction } from '../../../apis/apiFunction';
import { loginApi } from '../../../apis/api';
import Toast from 'react-native-toast-message';
import AppInput from '../../../components/common/AppInput';
import AppButton from '../../../components/common/AppButton';
import { useAuth } from '../../../core/auth/useAuth';

const headerBg = require('../../../App_Logos_and_Icons_and_Backgrounds/background-Landing-black.jpg');

const LoginScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const { role = 'owner' } = route.params || {};
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => {
      setIsKeyboardVisible(true);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 120, animated: true });
      }, 60);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Role Configuration
  const roleConfig = useMemo(() => {
    switch (role?.toLowerCase()) {
      case 'distributor':
        return {
          title: 'Distributor Portal',
          subtitle: 'Enterprise Tier-1 Logistics Access',
          emailPlaceholder: 'admin@distributor.com',
          buttonColor: '#1E293B',
          badgeText: 'Distributor',
          badgeBg: 'rgba(255, 255, 255, 0.16)',
          badgeColor: '#F1F5F9',
          showRegister: true,
        };
      case 'reseller':
        return {
          title: 'Reseller Portal',
          subtitle: 'Workshop & Trade Inquiries Access',
          emailPlaceholder: 'workshop@reseller.com',
          buttonColor: '#D97706',
          badgeText: 'Reseller / Workshop',
          badgeBg: 'rgba(217, 119, 6, 0.25)',
          badgeColor: '#FDE68A',
          showRegister: true,
        };
      case 'owner':
      default:
        return {
          title: 'Welcome Back',
          subtitle: 'Sign in to your garage & catalog portal',
          emailPlaceholder: 'owner@example.com',
          buttonColor: '#E31837',
          badgeText: 'Vehicle Owner',
          badgeBg: 'rgba(227, 24, 55, 0.22)',
          badgeColor: '#FECDD3',
          showRegister: true,
        };
    }
  }, [role]);

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      newErrors.email = 'Invalid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    Keyboard.dismiss();

    setLoading(true);
    try {
      const response = await apiFunction(
        loginApi,
        [],
        { email: email.trim(), password },
        'POST',
        false
      );

      setLoading(false);

      const token = response?.token || response?.data?.token;
      const user =
        response?.profile ||
        (Array.isArray(response?.user) ? response?.user[0] : response?.user) ||
        (Array.isArray(response?.data?.user) ? response?.data?.user[0] : response?.data?.user);

      if (token) {
        const assignedRole = user?.role || role;

        Toast.show({
          type: 'success',
          text1: 'Welcome to NGK NTK South Africa',
          text2: `Logged in as ${user?.name || email}`,
        });

        signIn({
          token: token,
          user: {
            ...user,
            role: assignedRole,
          },
        });
      } else {
        const isServerDown = response?.isUnreachable || response?.isServerError || (response?.status && response.status >= 500);
        const title = isServerDown
          ? (response?.status === 502 ? 'Backend Unreachable (502)' : 'Server Unavailable')
          : 'Authentication Failed';
        const msg = response?.message && !response.message.startsWith('<')
          ? response.message
          : isServerDown
          ? 'Cannot connect to backend server. Please verify the backend is running.'
          : 'Invalid email or password.';

        Toast.show({
          type: 'error',
          text1: title,
          text2: msg,
        });
      }
    } catch (error) {
      setLoading(false);
      const is502 = error?.response?.status === 502;
      Toast.show({
        type: 'error',
        text1: is502 ? 'Backend Unreachable (502)' : 'Connection Error',
        text2:
          is502
            ? 'Backend server is unreachable (502 Bad Gateway). Please verify that the backend is running.'
            : (error?.response?.data?.message || error?.message || 'Unable to connect to server.'),
      });
    }
  };

  const scrollToInput = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 120, animated: true });
    }, 100);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0F121C" translucent={false} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.mainScrollView}
          contentContainerStyle={[
            styles.scrollMainContent,
            { paddingBottom: Math.max(insets.bottom, 24) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          bounces={false}
        >
        {/* TOP DARK HEADER SECTION */}
        <ImageBackground
          source={headerBg}
          style={[
            styles.darkHeaderSection,
            { paddingTop: insets.top + (Platform.OS === 'android' ? 8 : 4) },
            isKeyboardVisible && styles.darkHeaderSectionCompact,
          ]}
          resizeMode="cover"
        >
          {/* Navigation Bar Row */}
          <View style={styles.navRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <ChevronLeft size={22} color={COLORS.white} strokeWidth={2.4} />
            </TouchableOpacity>

            <View style={styles.headerBadgeContainer}>
              <View style={[styles.badgePill, { backgroundColor: roleConfig.badgeBg }]}>
                <Text style={[styles.badgePillText, { color: roleConfig.badgeColor }]}>
                  {roleConfig.badgeText}
                </Text>
              </View>
            </View>

            <View style={{ width: 40 }} />
          </View>

          {/* Center Brand Identity */}
          <View style={[styles.headerHeroBox, isKeyboardVisible && styles.headerHeroBoxCompact]}>
            {!isKeyboardVisible && (
              <View style={styles.emblemWrapper}>
                <Image
                  source={require('../../../assets/images/ngk_emblem_red.png')}
                  style={styles.emblemImage}
                  resizeMode="contain"
                />
              </View>
            )}
            <Text style={[styles.heroTitle, isKeyboardVisible && styles.heroTitleCompact]}>
              {roleConfig.title}
            </Text>
            {!isKeyboardVisible && (
              <Text style={styles.heroSubtitle}>{roleConfig.subtitle}</Text>
            )}
          </View>
        </ImageBackground>

        {/* LOWER FORM SECTION WITH CURVED WHITE SHEET */}
        <View style={[styles.formSection, isKeyboardVisible && styles.formSectionCompact]}>
          <View style={styles.formCard}>
            <AppInput
              label="Email Address"
              placeholder={roleConfig.emailPlaceholder}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
              }}
              onFocus={scrollToInput}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={18} color="#64748B" />}
              error={errors.email}
            />

            <AppInput
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password)
                  setErrors((prev) => ({ ...prev, password: null }));
              }}
              onFocus={scrollToInput}
              secureTextEntry={!showPassword}
              leftIcon={<Lock size={18} color="#64748B" />}
              rightIcon={
                showPassword ? (
                  <Eye size={18} color="#475569" />
                ) : (
                  <EyeOff size={18} color="#475569" />
                )
              }
              onRightIconPress={() => setShowPassword((prev) => !prev)}
              rightActionText="Forgot?"
              rightActionColor={roleConfig.buttonColor}
              onRightActionPress={() =>
                navigation.navigate('ForgotPassword', { role })
              }
              error={errors.password}
            />

            <AppButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              backgroundColor={roleConfig.buttonColor}
              style={styles.submitBtn}
            />

            {roleConfig.showRegister && (
              <>
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <AppButton
                  title="Register New Account"
                  variant="outline"
                  onPress={() => navigation.navigate('Register', { role })}
                  textColor={roleConfig.buttonColor}
                  style={[styles.registerBtn, { borderColor: roleConfig.buttonColor }]}
                />
              </>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footerContainer}>
            <Text style={styles.copyrightText}>
              Protected by NGK Technical Security System • 2026
            </Text>
          </View>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F121C',
  },
  mainScrollView: {
    flex: 1,
    backgroundColor: '#0F121C',
  },
  scrollMainContent: {
    flexGrow: 1,
    backgroundColor: '#0F121C',
  },
  darkHeaderSection: {
    minHeight: 220,
    backgroundColor: '#0F121C',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBadgeContainer: {
    alignItems: 'center',
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: FONTS.weight.heavy,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  headerHeroBox: {
    alignItems: 'center',
    marginBottom: 4,
  },
  emblemWrapper: {
    width: 78,
    height: 78,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  emblemImage: {
    width: 78,
    height: 78,
  },
  heroTitle: {
    fontSize: FONTS.size.h3,
    fontWeight: FONTS.weight.black,
    color: COLORS.white,
    letterSpacing: -0.4,
    marginBottom: 4,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: FONTS.size.sm,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: FONTS.weight.medium,
    textAlign: 'center',
  },
  formSection: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 36,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  formCard: {
    width: '100%',
  },
  submitBtn: {
    marginTop: 10,
  },
  footerContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.bold,
    color: COLORS.slate400,
    letterSpacing: 0.8,
  },
  registerBtn: {
    borderWidth: 1.5,
    borderRadius: RADIUS.md,
  },
  copyrightText: {
    fontSize: FONTS.size.caption,
    color: COLORS.slate400,
    textAlign: 'center',
    fontWeight: FONTS.weight.semiBold,
  },
  darkHeaderSectionCompact: {
    minHeight: 110,
    paddingBottom: 8,
  },
  headerHeroBoxCompact: {
    marginBottom: 0,
    marginTop: 2,
  },
  heroTitleCompact: {
    fontSize: FONTS.size.xl,
    marginBottom: 0,
  },
  formSectionCompact: {
    paddingTop: 16,
    paddingBottom: 20,
  },
});

export default LoginScreen;
