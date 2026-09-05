import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Mail, Lock, Eye, EyeOff, ChevronLeft } from 'lucide-react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiFunction } from '../apis/apiFunction';
import { loginApi } from '../apis/api';
import Toast from 'react-native-toast-message';
import AppInput from '../components/common/AppInput';
import AppButton from '../components/common/AppButton';
import { useAuth } from '../core/auth/useAuth';

const LoginScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const { role = 'owner' } = route.params || {};
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Role Configuration
  const roleConfig = useMemo(() => {
    switch (role?.toLowerCase()) {
      case 'distributor':
        return {
          title: 'Distributor Portal',
          subtitle: 'Enterprise Tier-1 Logistics Access',
          emailPlaceholder: 'admin@distributor.com',
          buttonColor: '#0F172A',
          badgeText: 'Distributor',
          badgeBg: 'rgba(255, 255, 255, 0.16)',
          badgeColor: '#F8FAFC',
          showRegister: false,
        };
      case 'reseller':
        return {
          title: 'Reseller Portal',
          subtitle: 'Workshop & Trade Inquiries Access',
          emailPlaceholder: 'reseller@workshop.com',
          buttonColor: '#D0142C',
          badgeText: 'Professional Reseller',
          badgeBg: 'rgba(245, 158, 11, 0.2)',
          badgeColor: '#FBBF24',
          showRegister: true,
        };
      default:
        return {
          title: 'Welcome Back',
          subtitle: 'Sign in to your garage & catalog portal',
          emailPlaceholder: 'owner@example.com',
          buttonColor: '#D0142C',
          badgeText: 'Vehicle Owner',
          badgeBg: 'rgba(208, 20, 44, 0.25)',
          badgeColor: '#FCA5A5',
          showRegister: true,
        };
    }
  }, [role]);

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!emailRegex.test(email.trim())) {
      errs.email = 'Enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 4) {
      errs.password = 'Password must be at least 4 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await apiFunction(
        loginApi,
        [],
        { email: email.trim(), password, role },
        'POST',
        false
      );

      if (response?.success) {
        const userObj =
          response.profile || (response.user && response.user[0]) || response.user;
        const userId = userObj?.id || response.user?.[0]?.id;

        await signIn({
          token: response.token,
          role,
          user: userObj,
          userId: userId ? String(userId) : undefined,
        });

        setLoading(false);
        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: `Welcome back, ${userObj?.name || 'User'}!`,
        });
      } else {
        setLoading(false);
        Toast.show({
          type: 'error',
          text1: 'Authentication Failed',
          text2: response?.message || 'Invalid credentials. Please try again.',
        });
      }
    } catch (error) {
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Connection Error',
        text2:
          error?.response?.data?.message || 'Unable to connect to server.',
      });
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0F121C" translucent={false} />

      {/* TOP 35% DARK HEADER SECTION */}
      <View style={[styles.darkHeaderSection, { paddingTop: insets.top + (Platform.OS === 'android' ? 8 : 4) }]}>
        {/* Navigation Bar Row */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <ChevronLeft size={22} color="#FFFFFF" strokeWidth={2.4} />
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
        <View style={styles.headerHeroBox}>
          <View style={styles.logoCapsule}>
            <Image
              source={require('../assets/images/logo_cropped.png')}
              style={styles.brandLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.heroTitle}>{roleConfig.title}</Text>
          <Text style={styles.heroSubtitle}>{roleConfig.subtitle}</Text>
        </View>
      </View>

      {/* LOWER 65% FORM SECTION WITH CURVED WHITE SHEET */}
      <KeyboardAvoidingView
        style={styles.formSection}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollFormContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formCard}>
            <AppInput
              label="Email Address"
              placeholder={roleConfig.emailPlaceholder}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
              }}
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
          </View>

          {/* Footer & Registration */}
          <View style={styles.footerContainer}>
            {roleConfig.showRegister && (
              <TouchableOpacity
                style={styles.registerRow}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Register', { role })}
              >
                <Text style={styles.registerPrompt}>Don't have an account? </Text>
                <Text style={[styles.registerLink, { color: roleConfig.buttonColor }]}>
                  Register
                </Text>
              </TouchableOpacity>
            )}
            <Text style={styles.copyrightText}>
              Protected by NGK Technical Security System • 2026
            </Text>
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
  darkHeaderSection: {
    height: hp('35%'),
    minHeight: 250,
    backgroundColor: '#0F121C',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingBottom: 32,
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
    borderRadius: 12,
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  headerHeroBox: {
    alignItems: 'center',
    marginBottom: 4,
  },
  logoCapsule: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 22,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogo: {
    width: 88,
    height: 88,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    marginBottom: 4,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '500',
    textAlign: 'center',
  },
  formSection: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  scrollFormContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
    flexGrow: 1,
    justifyContent: 'space-between',
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
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    marginBottom: 6,
  },
  registerPrompt: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '800',
  },
  copyrightText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default LoginScreen;
