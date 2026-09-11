import React, { useState, useRef } from 'react';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../../utils/theme';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Geolocation from '@react-native-community/geolocation';
import {
  User,
  Mail,
  Lock,
  MapPin,
  Eye,
  EyeOff,
  Phone,
  Building2,
  Navigation as NavigationIcon,
  Compass,
} from 'lucide-react-native';
import { apiFunction } from '../../../apis/apiFunction';
import { registerApi } from '../../../apis/api';
import Toast from 'react-native-toast-message';
import AppHeader from '../../../components/common/AppHeader';
import AppInput from '../../../components/common/AppInput';
import AppButton from '../../../components/common/AppButton';

const RegisterScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
  const role = route?.params?.role || 'owner';
  const isCommercial = role === 'reseller' || role === 'distributor';

  // Form Fields
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('South Africa');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Persona Colors
  const buttonColor =
    role === 'distributor'
      ? '#1E293B'
      : role === 'reseller'
      ? '#D97706'
      : '#E31837';

  const roleLabel =
    role === 'distributor'
      ? 'Authorized Distributor'
      : role === 'reseller'
      ? 'Professional Reseller'
      : 'Vehicle Owner';

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) errs.name = 'Full name is required';
    if (isCommercial && !companyName.trim()) {
      errs.companyName = 'Company / Workshop name is required';
    }
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      errs.email = 'Enter a valid email address';
    }
    if (!phone.trim()) {
      errs.phone = 'Phone number is required';
    }
    if (!streetAddress.trim() && !address.trim()) {
      errs.streetAddress = 'Street address is required';
    }
    if (!city.trim()) {
      errs.city = 'City / Town is required';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const requestLocation = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          fetchCoords();
        } else {
          Toast.show({ type: 'error', text1: 'Location permission required' });
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      fetchCoords();
    }
  };

  const fetchCoords = () => {
    setLocationLoading(true);
    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });

        let fullAddr = `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { 'User-Agent': 'NGKApp/1.0' } }
          );
          const geoData = await geoRes.json();
          if (geoData && geoData.address) {
            const a = geoData.address;
            const street = [a.house_number, a.road].filter(Boolean).join(' ') || a.suburb || '';
            const c = a.city || a.town || a.village || a.municipality || 'Johannesburg';
            const prov = a.state || a.province || 'Gauteng';
            const post = a.postcode || '';
            const cntry = a.country || 'South Africa';

            if (street) setStreetAddress(street);
            if (c) setCity(c);
            if (prov) setProvince(prov);
            if (post) setPostalCode(post);
            if (cntry) setCountry(cntry);
            fullAddr = geoData.display_name || [street, c, prov, post, cntry].filter(Boolean).join(', ');
          } else if (geoData?.display_name) {
            fullAddr = geoData.display_name;
          }
        } catch (geoErr) {
          console.warn('Reverse geocode error:', geoErr.message);
        }

        setAddress(fullAddr);
        setLocationLoading(false);
        Toast.show({
          type: 'success',
          text1: 'Location Prefetched',
          text2: 'Address fields have been populated.',
        });
      },
      (error) => {
        setLocationLoading(false);
        Toast.show({
          type: 'error',
          text1: 'Unable to acquire location',
          text2: error.message,
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const combinedAddr =
        [streetAddress, city, province, postalCode, country].filter(Boolean).join(', ') ||
        address.trim();

      const payload = {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        company_name: isCommercial ? companyName.trim() : undefined,
        phone: phone.trim(),
        street_address: streetAddress.trim(),
        city: city.trim(),
        province: province.trim(),
        postal_code: postalCode.trim(),
        country: country.trim() || 'ZA',
        address: combinedAddr,
        ...(coords ? { latitude: coords.latitude, longitude: coords.longitude } : {}),
      };

      const response = await apiFunction(registerApi, [], payload, 'POST', false);

      if (response?.success) {
        setLoading(false);
        Toast.show({
          type: 'success',
          text1: 'Account Created',
          text2: 'Please sign in with your credentials.',
        });
        navigation.replace('Login', { role });
      } else {
        setLoading(false);
        const isServerDown = response?.isUnreachable || response?.isServerError || (response?.status && response.status >= 500);
        const title = isServerDown
          ? (response?.status === 502 ? 'Backend Unreachable (502)' : 'Server Unavailable')
          : 'Registration Failed';
        const msg = response?.message && !response.message.startsWith('<')
          ? response.message
          : isServerDown
          ? 'Cannot connect to backend server. Please verify the backend is running.'
          : 'Email may already be in use.';

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
        text1: is502 ? 'Backend Unreachable (502)' : 'Registration Error',
        text2:
          is502
            ? 'Backend server is unreachable (502 Bad Gateway). Please verify that the backend is running.'
            : (error?.response?.data?.message || error?.message || 'Server connection error.'),
      });
    }
  };

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={{ flex: 1, backgroundColor: COLORS.white }}>
      <AppHeader
        title="Create Account"
        subtitle={`Register as ${roleLabel}`}
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: Math.max(insets.bottom, 24) + 120,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Top Persona Banner */}
          <View style={[styles.roleBadgeBanner, { backgroundColor: role === 'distributor' ? '#F1F5F9' : role === 'reseller' ? '#FFFBEB' : '#FEF2F2', borderColor: role === 'distributor' ? '#CBD5E1' : role === 'reseller' ? '#FDE68A' : '#FECDD3' }]}>
            <Text style={[styles.roleBadgeText, { color: buttonColor }]}>
              {roleLabel} Registration
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionHeading}>PERSONAL & ACCOUNT DETAILS</Text>

            <AppInput
              label="Full Name"
              placeholder="e.g. Johnathan Smith"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
              }}
              leftIcon={<User size={18} color="#9CA3AF" />}
              error={errors.name}
            />

            {isCommercial && (
              <AppInput
                label="Company / Workshop Name"
                placeholder={role === 'distributor' ? 'e.g. Apex National Distribution Ltd' : 'e.g. Pro Auto Service Workshop'}
                value={companyName}
                onChangeText={(text) => {
                  setCompanyName(text);
                  if (errors.companyName) setErrors((prev) => ({ ...prev, companyName: null }));
                }}
                leftIcon={<Building2 size={18} color="#9CA3AF" />}
                error={errors.companyName}
              />
            )}

            <AppInput
              label="Email Address"
              placeholder="name@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={18} color="#9CA3AF" />}
              error={errors.email}
            />

            <AppInput
              label="Contact Phone Number"
              placeholder="+27 82 123 4567"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
              }}
              keyboardType="phone-pad"
              leftIcon={<Phone size={18} color="#9CA3AF" />}
              error={errors.phone}
            />

            {/* Address Header with GPS Autofill Button */}
            <View style={styles.addressSectionHeader}>
              <Text style={styles.sectionHeading}>LOCATION & ADDRESS DETAILS</Text>
              <TouchableOpacity
                style={[styles.gpsAutoBtn, { borderColor: buttonColor }]}
                onPress={requestLocation}
                activeOpacity={0.7}
                disabled={locationLoading}
              >
                {locationLoading ? (
                  <ActivityIndicator size="small" color={buttonColor} />
                ) : (
                  <>
                    <Compass size={14} color={buttonColor} />
                    <Text style={[styles.gpsAutoText, { color: buttonColor }]}>Auto-Fill GPS</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <AppInput
              label="Street Address"
              placeholder="e.g. 14 Main Road, Sandton"
              value={streetAddress}
              onChangeText={(text) => {
                setStreetAddress(text);
                if (errors.streetAddress) setErrors((prev) => ({ ...prev, streetAddress: null }));
              }}
              leftIcon={<MapPin size={18} color="#9CA3AF" />}
              error={errors.streetAddress}
            />

            <View style={styles.rowInputs}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <AppInput
                  label="City / Town"
                  placeholder="e.g. Johannesburg"
                  value={city}
                  onChangeText={(text) => {
                    setCity(text);
                    if (errors.city) setErrors((prev) => ({ ...prev, city: null }));
                  }}
                  error={errors.city}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 6 }}>
                <AppInput
                  label="Province / Region"
                  placeholder="e.g. Gauteng"
                  value={province}
                  onChangeText={(text) => setProvince(text)}
                />
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <AppInput
                  label="Postal Code"
                  placeholder="e.g. 2196"
                  value={postalCode}
                  keyboardType="numeric"
                  onChangeText={(text) => setPostalCode(text)}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 6 }}>
                <AppInput
                  label="Country"
                  placeholder="South Africa"
                  value={country}
                  onChangeText={(text) => setCountry(text)}
                />
              </View>
            </View>

            <Text style={[styles.sectionHeading, { marginTop: 12 }]}>SECURITY CREDENTIALS</Text>

            <AppInput
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
              }}
              secureTextEntry={!showPassword}
              leftIcon={<Lock size={18} color="#9CA3AF" />}
              rightIcon={
                showPassword ? (
                  <Eye size={18} color="#6B7280" />
                ) : (
                  <EyeOff size={18} color="#6B7280" />
                )
              }
              onRightIconPress={() => setShowPassword((prev) => !prev)}
              error={errors.password}
            />

            <AppInput
              label="Confirm Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }));
              }}
              secureTextEntry={!showPassword}
              leftIcon={<Lock size={18} color="#9CA3AF" />}
              error={errors.confirmPassword}
            />

            <AppButton
              title={`Register as ${roleLabel}`}
              onPress={handleRegister}
              loading={loading}
              backgroundColor={buttonColor}
              style={styles.submitBtn}
            />
          </View>

          <View style={styles.footerContainer}>
            <TouchableOpacity
              style={styles.loginRow}
              activeOpacity={0.7}
              onPress={() => navigation.replace('Login', { role })}
            >
              <Text style={styles.loginPrompt}>Already have an account? </Text>
              <Text style={[styles.loginLink, { color: buttonColor }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  roleBadgeBanner: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: 10,
    alignItems: 'center',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: FONTS.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginTop: 4,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeading: {
    fontSize: 10.5,
    fontWeight: FONTS.weight.heavy,
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 4,
  },
  addressSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  gpsAutoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  gpsAutoText: {
    fontSize: 10.5,
    fontWeight: FONTS.weight.bold,
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  submitBtn: {
    marginTop: 12,
  },
  footerContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  loginPrompt: {
    fontSize: FONTS.size.sm,
    color: COLORS.textTertiary,
    fontWeight: FONTS.weight.medium,
  },
  loginLink: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
  },
});

export default RegisterScreen;
