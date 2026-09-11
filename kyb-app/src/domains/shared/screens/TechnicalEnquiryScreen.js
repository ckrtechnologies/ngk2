import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../../utils/theme';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  KeyboardAvoidingView,
  RefreshControl,
  BackHandler,
  Keyboard,
  Image,
  Linking,
} from 'react-native';
import {
  CheckCircle2,
  Search,
  X,
  ShieldCheck,
  Check,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Send,
  SlidersHorizontal,
  Building2,
  Store,
  Home,
  Phone,
  Mail,
} from 'lucide-react-native';

const homeIcon = require('../../../App_Logos_and_Icons_and_Backgrounds/Icon-Home.png');
const locationIcon = require('../../../App_Logos_and_Icons_and_Backgrounds/Icon-Location.png');
import {
  SolidStoreIcon,
  SolidPartTagIcon,
  SolidCarSilhouetteIcon,
  SolidGarageBayIcon,
  SolidShieldVerifiedIcon,
  SolidLocationPinIcon,
  SolidStepperMinusIcon,
  SolidStepperPlusIcon,
} from '../../../components/icons/TechnicalEnquiryIcons';
import EnquiryStepIndicator from '../../../components/common/EnquiryStepIndicator';
import DealerFilterModal, { DEFAULT_FILTERS } from '../../../components/common/DealerFilterModal';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { apiFunction } from '../../../apis/apiFunction';
import { addEnquiryApi, dealersApi } from '../../../apis/api';
import { useDispatch, useSelector } from 'react-redux';
import { getUsersRedux } from '../../../redux/getData';
import Geolocation from '@react-native-community/geolocation';
import ScreenContainer from '../../../components/common/ScreenContainer';
import AppHeader from '../../../components/common/AppHeader';
import AppInput from '../../../components/common/AppInput';

// Helper: calculate spherical distance in km using Haversine formula
const haversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const TechnicalEnquiryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const { users, myself, part: reduxPart, selectedVehicle: reduxVehicle } = useSelector(
    (state) => state.getData
  );

  const passedPart = route.params?.part;
  const passedVehicle = route.params?.vehicle;
  const passedDealerId = route.params?.dealerId;
  const passedDealerName = route.params?.dealerName;
  const passedDealer = route.params?.dealer;

  // Multi-step Journey (Step 1: Part & Vehicle, Step 2: Select Dealer, Step 3: Query & Send)
  const [currentStep, setCurrentStep] = useState(1);

  // Role & Scope
  const [currentUserRole, setCurrentUserRole] = useState(
    myself?.role?.toLowerCase() || 'vehicle_owner'
  );

  const [storedUserId, setStoredUserId] = useState(null);
  const [storedUserEmail, setStoredUserEmail] = useState(null);

  useEffect(() => {
    const fetchRoleAndAuth = async () => {
      try {
        const storedRole = (await AsyncStorage.getItem('role')) || (await AsyncStorage.getItem('userRole'));
        const uId = await AsyncStorage.getItem('userId');
        const uEmail = await AsyncStorage.getItem('email');
        if (uId) setStoredUserId(uId);
        if (uEmail) setStoredUserEmail(uEmail.toLowerCase().trim());
        if (storedRole) {
          setCurrentUserRole(storedRole.toLowerCase());
        } else if (myself?.role) {
          setCurrentUserRole(myself.role.toLowerCase());
        }
      } catch (err) {
        console.warn('Error reading role or auth:', err);
      }
    };
    fetchRoleAndAuth();
  }, [myself?.role]);

  // If logged in as reseller, default stockist role filter to distributor;
  // If logged in as distributor, default stockist role filter to reseller
  useEffect(() => {
    if (
      currentUserRole === 'reseller' ||
      currentUserRole === 'retailer' ||
      currentUserRole === 'shop_owner'
    ) {
      setFilters((prev) => ({ ...prev, role: 'distributor' }));
    } else if (
      currentUserRole === 'distributor' ||
      currentUserRole === 'wholesaler'
    ) {
      setFilters((prev) => ({ ...prev, role: 'reseller' }));
    }
  }, [currentUserRole]);

  // Handle hardware back button inside multi-step enquiry
  useEffect(() => {
    const onBackPress = () => {
      if (currentStep > 1) {
        setCurrentStep((s) => s - 1);
        return true;
      }
      return false;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [currentStep]);

  const scrollViewRef = useRef(null);

  // Smooth keyboard shift up for active inputs
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const showSub = Keyboard.addListener(showEvent, () => {
      setTimeout(() => {
        if (currentStep === 1) {
          scrollViewRef.current?.scrollTo({ y: 120, animated: true });
        } else if (currentStep === 3) {
          scrollViewRef.current?.scrollTo({ y: 160, animated: true });
        }
      }, 70);
    });

    return () => {
      showSub.remove();
    };
  }, [currentStep]);

  const isReseller =
    currentUserRole === 'reseller' ||
    currentUserRole === 'retailer' ||
    currentUserRole === 'shop_owner';

  // Part Details State (Step 1)
  const [partNumber, setPartNumber] = useState('');
  const [partName, setPartName] = useState('');

  // Vehicle Details State (Step 1)
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [selectedGarageCarId, setSelectedGarageCarId] = useState(null);

  // Enquiry Details & Quantity (Step 3)
  const [quantity, setQuantity] = useState(1);
  const [enquiryDetails, setEnquiryDetails] = useState('');
  const [loading, setLoading] = useState(false);

  // Stockists & Geolocation State (Step 2)
  const [stockists, setStockists] = useState([]);
  const [fetchingStockists, setFetchingStockists] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [locatingGps, setLocatingGps] = useState(false);
  const [selectedDealerId, setSelectedDealerId] = useState(
    passedDealerId || passedDealer?.id || null
  );
  const [selectedDealerName, setSelectedDealerName] = useState(
    passedDealerName || passedDealer?.name || passedDealer?.companyName || null
  );
  const [selectedDealerObj, setSelectedDealerObj] = useState(passedDealer || null);

  // Sophisticated Dealer Filter Panel State (Step 2)
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [dealerSearchQuery, setDealerSearchQuery] = useState('');

  // Compute how many non-default filter criteria are applied
  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (filters.radius !== 50) c++;
    if (filters.role !== 'all') c++;
    if (filters.sortBy !== 'nearest') c++;
    return c;
  }, [filters]);

  const [refreshing, setRefreshing] = useState(false);

  // Fetch Nearby Stockists (Always fresh real data from Supabase backend)
  const loadStockists = useCallback(async () => {
    setFetchingStockists(true);
    const acquirePosition = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            fallbackFetch();
            return;
          }
        } catch (e) {
          fallbackFetch();
          return;
        }
      }

      setLocatingGps(true);
      Geolocation.getCurrentPosition(
        async (pos) => {
          setLocatingGps(false);
          const coords = {
            userLat: pos.coords.latitude,
            userLon: pos.coords.longitude,
            radius: filters.radius || 50,
          };
          setUserCoords(coords);
          try {
            const res = await apiFunction(dealersApi, [], coords, 'GET', false);
            const list = res?.dealers || res?.data?.array || [];
            setStockists(list);
          } catch (err) {
            console.warn('Geolocation dealer fetch failed:', err);
            fallbackFetch();
          } finally {
            setFetchingStockists(false);
          }
        },
        (err) => {
          setLocatingGps(false);
          fallbackFetch();
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
      );
    };

    const fallbackFetch = async () => {
      try {
        const res = await apiFunction(dealersApi, [], null, 'GET', false);
        const list = res?.dealers || res?.data?.array || [];
        setStockists(list);
      } catch (err) {
        console.warn('Fallback dealer fetch failed:', err);
        setStockists([]);
      } finally {
        setFetchingStockists(false);
      }
    };

    acquirePosition();
  }, [filters.radius]);

  // Pull-to-refresh handler to force re-fetch real data
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadStockists(),
        dispatch(getUsersRedux()),
      ]);
    } catch (e) {
      console.warn('Refresh failed:', e);
    } finally {
      setRefreshing(false);
    }
  }, [loadStockists, dispatch]);

  // Always re-fetch real stockists and real users when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadStockists();
      dispatch(getUsersRedux());
    }, [loadStockists, dispatch])
  );

  // Merge API dealers with Redux users with standardized roles and distanceKm
  const scopedCandidateDealers = useMemo(() => {
    const list = [];
    const seen = new Set();

    const myUserId = String(myself?.id || myself?._id || storedUserId || '').toLowerCase().trim();
    const myEmail = String(myself?.email || storedUserEmail || '').toLowerCase().trim();
    const myName = String(myself?.name || myself?.companyName || myself?.company_name || '').toLowerCase().trim();

    // Helper: Test if candidate dealer represents the logged-in user
    const isSelf = (item) => {
      const dUserId = String(item.userId || item.user_id || '').toLowerCase().trim();
      const dId = String(item.id || item.dealerId || '').toLowerCase().trim();
      const dEmail = String(item.email || item.contact_email || '').toLowerCase().trim();
      const dName = String(item.name || item.companyName || item.company_name || '').toLowerCase().trim();

      if (myUserId && (dUserId === myUserId || dId === myUserId)) return true;
      if (myEmail && dEmail && dEmail === myEmail) return true;
      if (myName && dName && dName === myName) return true;
      return false;
    };

    // 1. Process API stockists
    if (Array.isArray(stockists)) {
      stockists.forEach((d) => {
        const id = d.userId || d.dealerId || d.id || d._id;
        const name = d.name || d.companyName;
        if (id && !seen.has(id)) {
          // Exclude self: You cannot send queries to yourself
          if (isSelf(d)) return;

          // Exclude unapproved dealers
          if (
            d.isApproved === false ||
            d.approvalStatus === 'pending_approval' ||
            d.approvalStatus === 'rejected' ||
            d.approvalStatus === 'suspended'
          ) {
            return;
          }

          seen.add(id);
          const role = (d.role || '').toLowerCase();
          const isDistributor = role === 'distributor' || role === 'wholesaler';
          const rawDist = d.distance !== undefined && d.distance !== null ? d.distance : d.distanceKm;
          let parsedKm =
            rawDist !== undefined && rawDist !== null ? parseFloat(rawDist) : 999999;

          if (parsedKm === 999999 && userCoords?.userLat != null && d.latitude != null) {
            const calc = haversineDistanceKm(
              userCoords.userLat,
              userCoords.userLon,
              d.latitude,
              d.longitude
            );
            if (calc != null) {
              parsedKm = parseFloat(calc.toFixed(1));
            }
          }

          list.push({
            id,
            name: name || 'Authorized Reseller',
            companyName: d.companyName || d.name,
            role: isDistributor ? 'distributor' : 'reseller',
            distance:
              !isNaN(parsedKm) && parsedKm < 999999
                ? `${parsedKm.toFixed(1)} km`
                : null,
            distanceKm: isNaN(parsedKm) ? 999999 : parsedKm,
            address: d.address || d.streetAddress || '',
            city: d.city || '',
            rating: d.rating || '4.9',
            verified: true,
            isNearest: false,
            email: d.email || d.contact_email || '',
            userId: d.userId || d.user_id || id,
          });
        }
      });
    }

    // 2. Process Redux users ONLY if stockists list is empty (fallback)
    if ((!stockists || stockists.length === 0) && Array.isArray(users)) {
      users.forEach((u) => {
        const id = u.id || u._id;
        const role = (u.role || '').toLowerCase();
        const isDistributor = role === 'distributor' || role === 'wholesaler';
        const isStockist =
          role === 'stockist' ||
          role === 'dealer' ||
          role === 'retailer' ||
          role === 'reseller';

        if (id && !seen.has(id) && (isDistributor || isStockist)) {
          // Exclude self: You cannot send queries to yourself
          if (isSelf(u)) return;

          // Exclude unapproved users
          const isApproved = u.is_approved === true || u.approval_status === 'approved';
          if (!isApproved) return;

          seen.add(id);
          let parsedKm = 999999;
          if (userCoords?.userLat != null && u.latitude != null) {
            const calc = haversineDistanceKm(
              userCoords.userLat,
              userCoords.userLon,
              u.latitude,
              u.longitude
            );
            if (calc != null) {
              parsedKm = parseFloat(calc.toFixed(1));
            }
          }

          list.push({
            id,
            name:
              u.name ||
              u.companyName ||
              (isDistributor ? 'Regional Distributor' : 'Authorized Reseller'),
            companyName: u.companyName || u.name,
            role: isDistributor ? 'distributor' : 'reseller',
            distance:
              !isNaN(parsedKm) && parsedKm < 999999
                ? `${parsedKm.toFixed(1)} km`
                : null,
            distanceKm: parsedKm,
            address: u.address || '',
            city: u.city || '',
            rating: '4.8',
            verified: true,
            isNearest: false,
            email: u.email || '',
            userId: id,
          });
        }
      });
    }

    // Mark nearest
    const withDistance = list.filter((d) => d.distanceKm < 999999);
    if (withDistance.length > 0) {
      withDistance.sort((a, b) => a.distanceKm - b.distanceKm);
      withDistance[0].isNearest = true;
    }

    return list;
  }, [stockists, users, myself, storedUserId, storedUserEmail, userCoords]);

  // Compute dynamic counts based on active search query & radius filter
  const counts = useMemo(() => {
    const hasSearch = Boolean(dealerSearchQuery && dealerSearchQuery.trim());
    const q = (dealerSearchQuery || '').toLowerCase().trim();

    const baseList = scopedCandidateDealers.filter((d) => {
      // 1. Search query filter (Search by Dealer, City or Area)
      if (hasSearch) {
        const name = (d.name || d.companyName || '').toLowerCase();
        const city = (d.city || '').toLowerCase();
        const address = (d.address || d.streetAddress || '').toLowerCase();
        const email = (d.email || '').toLowerCase();
        const phone = (d.phone || '').toLowerCase();
        const matches =
          name.includes(q) ||
          city.includes(q) ||
          address.includes(q) ||
          email.includes(q) ||
          phone.includes(q);
        if (!matches) return false;
      } else if (filters.radius !== undefined && filters.radius !== null) {
        // Distance radius filter only when not searching by name
        if (d.distanceKm !== undefined && d.distanceKm !== null && d.distanceKm < 999999) {
          if (d.distanceKm > filters.radius) return false;
        }
      }

      return true;
    });

    const safeList = baseList.length > 0 ? baseList : scopedCandidateDealers;

    return {
      all: safeList.length,
      distributors: safeList.filter((d) => {
        const r = (d.role || '').toLowerCase();
        return r === 'distributor' || r === 'wholesaler';
      }).length,
      stockists: safeList.filter((d) => {
        const r = (d.role || '').toLowerCase();
        return r !== 'distributor' && r !== 'wholesaler';
      }).length,
    };
  }, [scopedCandidateDealers, filters.radius, dealerSearchQuery]);

  // Complete filter & sort pipeline driven by DealerFilterModal state
  const filteredDealers = useMemo(() => {
    const hasSearch = Boolean(dealerSearchQuery && dealerSearchQuery.trim());
    const q = (dealerSearchQuery || '').toLowerCase().trim();

    let list = scopedCandidateDealers.filter((d) => {
      const dRole = (d.role || '').toLowerCase().trim();

      // 1. Role filter (all | distributor | reseller)
      if (filters.role === 'distributor') {
        if (dRole !== 'distributor' && dRole !== 'wholesaler') return false;
      }
      if (filters.role === 'reseller') {
        if (
          dRole !== 'reseller' &&
          dRole !== 'stockist' &&
          dRole !== 'retailer' &&
          dRole !== 'dealer' &&
          dRole !== 'shop_owner'
        )
          return false;
      }

      // 2. Search query filter (Search by Dealer, City or Area)
      if (hasSearch) {
        const name = (d.name || d.companyName || '').toLowerCase();
        const city = (d.city || '').toLowerCase();
        const address = (d.address || d.streetAddress || '').toLowerCase();
        const email = (d.email || '').toLowerCase();
        const phone = (d.phone || '').toLowerCase();
        const matches =
          name.includes(q) ||
          city.includes(q) ||
          address.includes(q) ||
          email.includes(q) ||
          phone.includes(q);
        if (!matches) return false;
      } else if (filters.radius !== undefined && filters.radius !== null) {
        // Distance radius filter only when not explicitly searching
        if (d.distanceKm !== undefined && d.distanceKm !== null && d.distanceKm < 999999) {
          if (d.distanceKm > filters.radius) return false;
        }
      }

      return true;
    });

    // Fallback: If local radius yielded 0 dealers, auto-expand to show all matching
    // registered dealers nationwide rather than an empty blank screen
    if (list.length === 0 && !hasSearch) {
      list = scopedCandidateDealers.filter((d) => {
        const dRole = (d.role || '').toLowerCase().trim();
        if (filters.role === 'distributor') {
          return dRole === 'distributor' || dRole === 'wholesaler';
        }
        if (filters.role === 'reseller') {
          return (
            dRole === 'reseller' ||
            dRole === 'stockist' ||
            dRole === 'retailer' ||
            dRole === 'dealer' ||
            dRole === 'shop_owner'
          );
        }
        return true;
      });
    }

    // 4. Sort by nearest or alphabetical
    if (filters.sortBy === 'alpha') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else {
      list.sort((a, b) => {
        const distA = a.distanceKm !== undefined ? a.distanceKm : 999999;
        const distB = b.distanceKm !== undefined ? b.distanceKm : 999999;
        return distA - distB;
      });
    }

    return list;
  }, [scopedCandidateDealers, filters, dealerSearchQuery]);

  // Sync selected dealer object when list updates safely
  useEffect(() => {
    if (scopedCandidateDealers.length > 0) {
      const found = scopedCandidateDealers.find((d) => d.id === selectedDealerId);
      if (found) {
        setSelectedDealerName(found.name);
        setSelectedDealerObj(found);
      } else {
        const first = scopedCandidateDealers[0];
        setSelectedDealerId(first.id);
        setSelectedDealerName(first.name);
        setSelectedDealerObj(first);
      }
    } else {
      setSelectedDealerId(null);
      setSelectedDealerName(null);
      setSelectedDealerObj(null);
    }
  }, [scopedCandidateDealers, selectedDealerId]);

  // Auto-Select Nearest Stockist
  const handleAutoSelectNearest = () => {
    const withDistance = scopedCandidateDealers.filter((d) => d.distanceKm < 999999);
    if (withDistance.length > 0) {
      withDistance.sort((a, b) => a.distanceKm - b.distanceKm);
      const nearest = withDistance[0];
      setSelectedDealerId(nearest.id);
      setSelectedDealerName(nearest.name);
      setSelectedDealerObj(nearest);
      Toast.show({
        type: 'success',
        text1: 'Nearest Dealer Selected',
        text2: `${nearest.name} (${nearest.distance} away)`,
      });
    } else if (scopedCandidateDealers.length > 0) {
      const first = scopedCandidateDealers[0];
      setSelectedDealerId(first.id);
      setSelectedDealerName(first.name);
      setSelectedDealerObj(first);
      Toast.show({
        type: 'success',
        text1: 'Dealer Selected',
        text2: first.name,
      });
    }
  };

  // Resilient multi-source garage vehicles resolution
  const garageVehicles = useMemo(() => {
    return (
      (myself?.garage?.length
        ? myself.garage
        : myself?.cars?.length
        ? myself.cars
        : myself?.vehicleId?.length
        ? myself.vehicleId
        : myself?.watchList
            ?.filter((item) => item.article_summary?.make || item.brand_name)
            ?.map((item) => ({
              id: item.id || item._id,
              make: item.article_summary?.make || item.brand_name,
              model: item.article_summary?.model || item.part_number,
              year: item.article_summary?.year || '',
              licensePlate: item.article_summary?.licensePlate || '',
              linkageTargetId:
                item.article_summary?.linkageTargetId || item.article_summary?.carId,
              isPrimary: false,
            })) || [])
    );
  }, [myself?.garage, myself?.cars, myself?.vehicleId, myself?.watchList]);

  // Dynamic Part & Vehicle Auto-Fill (from route props, Redux, catalog, or own garage)
  useEffect(() => {
    // 1. Resolve Part Identification
    const p = passedPart || reduxPart;
    const resolvedPartNo =
      route.params?.partNumber ||
      route.params?.partNo ||
      route.params?.articleNo ||
      route.params?.articleNumber ||
      p?.tradeNumbers?.[0] ||
      p?.articleNumber ||
      p?.articleNo ||
      p?.partNumber ||
      p?.part_number ||
      p?.partNo ||
      p?.directArticle?.articleNo ||
      p?.dataSupplierArticleNumber ||
      '';

    const resolvedPartName =
      route.params?.partName ||
      route.params?.articleName ||
      p?.genericArticles?.[0]?.genericArticleDescription ||
      p?.articleName ||
      p?.directArticle?.articleName ||
      p?.name ||
      p?.partName ||
      p?.description ||
      p?.title ||
      '';

    if (resolvedPartNo) {
      setPartNumber(resolvedPartNo);
    }
    if (resolvedPartName) {
      setPartName(resolvedPartName);
    }

    // 2. Resolve Vehicle Specifications (Catalog vs Own Vehicle)
    const v = passedVehicle || reduxVehicle;
    const catMake =
      route.params?.make ||
      route.params?.vehicleMake ||
      v?.manuName ||
      v?.mfrName ||
      v?.make ||
      v?.manufacturer ||
      v?.brand ||
      route.params?.selectedManufacturer?.manuName ||
      '';

    const catModel =
      route.params?.model ||
      route.params?.vehicleModel ||
      v?.modelname ||
      v?.modelName ||
      v?.model ||
      v?.seriesName ||
      v?.series ||
      v?.description ||
      route.params?.selectedSeries?.modelname ||
      '';

    const catYear =
      route.params?.year ||
      route.params?.vehicleYear ||
      (v?.yearOfConstrFrom ? String(v.yearOfConstrFrom) : '') ||
      (v?.year ? String(v.year) : '') ||
      (v?.modelYear ? String(v.modelYear) : '') ||
      '';

    if (catMake || catModel) {
      setVehicleMake(catMake);
      setVehicleModel(catModel);
      setVehicleYear(catYear);

      if (garageVehicles && garageVehicles.length > 0) {
        const matched = garageVehicles.find((car) => {
          const carId = String(car.id || car._id || car.linkageTargetId || '');
          const passedId = String(v?.id || v?._id || v?.linkageTargetId || '');
          if (passedId && carId === passedId) return true;
          const cMake = (car.make || '').toLowerCase().trim();
          const cModel = (car.model || '').toLowerCase().trim();
          const pM = (catMake || '').toLowerCase().trim();
          const pMod = (catModel || '').toLowerCase().trim();
          return (
            cMake &&
            pM &&
            cMake === pM &&
            cModel &&
            pMod &&
            (cModel.includes(pMod) || pMod.includes(cModel))
          );
        });
        if (matched) {
          setSelectedGarageCarId(matched.id || matched._id);
        } else {
          setSelectedGarageCarId(null);
        }
      }
    } else if (garageVehicles && garageVehicles.length > 0) {
      const autoPopulateActive = async () => {
        try {
          const savedActiveId = await AsyncStorage.getItem('active_vehicle_id');
          const activeCar =
            (savedActiveId &&
              garageVehicles.find(
                (c) => String(c.id || c._id || c.linkageTargetId) === String(savedActiveId)
              )) ||
            garageVehicles.find((c) => c.isPrimary || c.is_primary) ||
            garageVehicles[0];

          if (activeCar) {
            setSelectedGarageCarId(activeCar.id || activeCar._id);
            setVehicleMake(activeCar.make || '');
            setVehicleModel(activeCar.model || '');
            setVehicleYear(activeCar.year ? String(activeCar.year) : '');
          }
        } catch (e) {
          if (garageVehicles[0]) {
            const firstCar = garageVehicles[0];
            setSelectedGarageCarId(firstCar.id || firstCar._id);
            setVehicleMake(firstCar.make || '');
            setVehicleModel(firstCar.model || '');
            setVehicleYear(firstCar.year ? String(firstCar.year) : '');
          }
        }
      };
      autoPopulateActive();
    }
  }, [passedPart, reduxPart, passedVehicle, reduxVehicle, garageVehicles]);

  // 1-Tap Select from Garage Vehicles
  const handleSelectGarageVehicle = (car) => {
    const carId = car.id || car._id;
    if (selectedGarageCarId === carId) {
      setSelectedGarageCarId(null);
      setVehicleMake('');
      setVehicleModel('');
      setVehicleYear('');
      Toast.show({
        type: 'info',
        text1: 'Vehicle Deselected',
        text2: 'Enter specifications manually or pick another vehicle.',
      });
    } else {
      setSelectedGarageCarId(carId);
      setVehicleMake(car.make || '');
      setVehicleModel(car.model || '');
      setVehicleYear(car.year ? String(car.year) : '');
      Toast.show({
        type: 'success',
        text1: 'Vehicle Auto-Filled',
        text2: `${car.make} ${car.model} selected from your garage.`,
      });
    }
  };

  // Step Validation & Navigation Handlers
  const validateStep1 = () => {
    if (!partNumber.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Part Required',
        text2: 'Please specify Part Number / Article No to continue.',
      });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!selectedDealerId) {
      Toast.show({
        type: 'error',
        text1: 'Reseller Required',
        text2: isReseller
          ? 'Please select a Regional Distributor to proceed.'
          : 'Please select an Authorized Reseller to proceed.',
      });
      return false;
    }
    return true;
  };

  const handleNextFromStep1 = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleNextFromStep2 = () => {
    if (validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleStepPress = (stepId) => {
    if (stepId === 1) {
      setCurrentStep(1);
    } else if (stepId === 2) {
      if (validateStep1()) setCurrentStep(2);
    } else if (stepId === 3) {
      if (validateStep1() && validateStep2()) setCurrentStep(3);
    }
  };

  // Submit Technical Ticket
  const handleSubmit = async () => {
    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }
    if (!validateStep2()) {
      setCurrentStep(2);
      return;
    }
    if (!enquiryDetails.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Notes Required',
        text2: 'Please describe your fitment question, query, or quote requirements.',
      });
      return;
    }

    // Guard: Prevent sending technical inquiry to oneself
    const myUserId = String(myself?.id || myself?._id || storedUserId || '').toLowerCase().trim();
    const myEmail = String(myself?.email || storedUserEmail || '').toLowerCase().trim();
    const selDealerId = String(selectedDealerId || '').toLowerCase().trim();
    const selDealerUser = String(selectedDealerObj?.userId || selectedDealerObj?.user_id || '').toLowerCase().trim();
    const selDealerEmail = String(selectedDealerObj?.email || selectedDealerObj?.contact_email || '').toLowerCase().trim();

    if (
      (myUserId && (selDealerId === myUserId || selDealerUser === myUserId)) ||
      (myEmail && selDealerEmail && selDealerEmail === myEmail)
    ) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Stockist Selection',
        text2: 'You cannot dispatch a technical enquiry to your own business.',
      });
      return;
    }

    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const constructedCarName = [vehicleMake, vehicleModel, vehicleYear]
        .filter(Boolean)
        .join(' ')
        .trim();

      const constructedTitle = partNumber.trim()
        ? `Part #${partNumber.trim()} - ${partName.trim() || 'Technical Enquiry'}`
        : partName.trim() || 'Technical Query';

      const payload = {
        userId: userId || null,
        dealerId: selectedDealerId || null,
        dealer: selectedDealerId || null,
        dealerName: selectedDealerName,
        title: constructedTitle,
        description: enquiryDetails.trim() || `Technical inquiry for ${constructedTitle}`,
        enquiryDetails: enquiryDetails.trim(),
        quantity: Number(quantity) || 1,
        partName: partName.trim() || null,
        partNumber: partNumber.trim() || null,
        carName: constructedCarName || null,
        imageUrl: null,
        imageurl: null,
        userLat: userCoords?.userLat || null,
        userLon: userCoords?.userLon || null,
        vehicle: {
          title: constructedTitle,
          description: enquiryDetails.trim(),
          quantity: Number(quantity) || 1,
          partNumber: partNumber.trim(),
          partName: partName.trim(),
          make: vehicleMake.trim(),
          model: vehicleModel.trim(),
          year: vehicleYear.trim(),
          dealerName: selectedDealerName,
          dealerId: selectedDealerId,
          imageurl: null,
          userLat: userCoords?.userLat || null,
          userLon: userCoords?.userLon || null,
        },
      };

      const response = await apiFunction(addEnquiryApi, [], payload, 'POST', false);

      if (response?.success) {
        setLoading(false);
        Toast.show({
          type: 'success',
          text1: 'Enquiry Submitted',
          text2: 'Your technical ticket has been assigned and dispatched.',
        });
        navigation.replace('MyEnquiries');
      } else {
        setLoading(false);
        Toast.show({
          type: 'error',
          text1: 'Submission Failed',
          text2: response?.message || 'Error submitting technical enquiry.',
        });
      }
    } catch (err) {
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err?.response?.data?.message || 'Network connection failed.',
      });
    }
  };

  // Render Step 1: Part & Vehicle Identification
  const renderStep1 = () => (
    <View>
      {/* Role Notice for Reseller */}
      {isReseller && (
        <View style={styles.resellerNoticeCard}>
          <View style={styles.resellerNoticeIconBox}>
            <ShieldCheck size={18} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.resellerNoticeTitle}>
              RESELLER QUERY SCOPE: REGIONAL DISTRIBUTOR
            </Text>
            <Text style={styles.resellerNoticeBody}>
              As an authorized reseller, this technical enquiry will be routed directly to your assigned Regional Wholesaler / Distributor.
            </Text>
          </View>
        </View>
      )}

      {/* Step 1 Banner */}
      <View style={styles.stepBannerCard}>
        <View style={styles.stepBannerIconBox}>
          <CheckCircle2 size={16} color="#059669" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.stepBannerTitle}>STEP 1: PART & VEHICLE IDENTIFICATION</Text>
          <Text style={styles.stepBannerSubtitle}>
            Details are auto-filled from catalog or garage. Confirm or customize below.
          </Text>
        </View>
      </View>

      {/* Garage Vehicle Quick Selector */}
      {garageVehicles.length > 0 && (
        <View style={styles.garageSelectorContainer}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <SolidGarageBayIcon size={15} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>SELECT FROM MY GARAGE</Text>
            </View>
            <Text style={styles.garageCountBadge}>
              {garageVehicles.length} Saved
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.garageChipsScroll}
          >
            {garageVehicles.map((car, idx) => {
              const carKey = car.id || car._id || `gcar-${idx}`;
              const isSelected = selectedGarageCarId === (car.id || car._id);
              return (
                <TouchableOpacity
                  key={carKey}
                  style={[
                    styles.garageChip,
                    isSelected && styles.garageChipSelected,
                  ]}
                  onPress={() => handleSelectGarageVehicle(car)}
                  activeOpacity={0.7}
                >
                  <SolidCarSilhouetteIcon
                    size={14}
                    color={isSelected ? COLORS.white : COLORS.textTertiary}
                  />
                  <Text
                    style={[
                      styles.garageChipText,
                      isSelected && styles.garageChipTextSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {car.make} {car.model} {car.year ? `(${car.year})` : ''}
                  </Text>
                  {isSelected && <Check size={12} color={COLORS.white} strokeWidth={2.6} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Part Identification Fields */}
      <View style={styles.formCard}>
        <View style={styles.cardHeaderRow}>
          <SolidPartTagIcon size={16} color={COLORS.primary} />
          <Text style={styles.cardTitle}>PART IDENTIFICATION</Text>
        </View>
        <Text style={styles.cardSubtitle}>
          Specify KYB shock absorber, strut, spring, or exact part number.
        </Text>

        <View style={styles.inputSpacing}>
          <AppInput
            label="Part Number / Article No *"
            placeholder="e.g. BKR6E-11, ILFR6A, 90919-01192"
            value={partNumber}
            onChangeText={setPartNumber}
            containerStyle={styles.appInputCompact}
          />
        </View>

        <View style={styles.inputSpacing}>
          <AppInput
            label="Part Name / Component"
            placeholder="e.g. Laser Iridium Spark Plug, Oxygen Sensor"
            value={partName}
            onChangeText={setPartName}
            containerStyle={styles.appInputCompact}
          />
        </View>
      </View>

      {/* Vehicle Specifications */}
      <View style={styles.formCard}>
        <View style={styles.cardHeaderRow}>
          <SolidCarSilhouetteIcon size={16} color="#2563EB" />
          <Text style={styles.cardTitle}>VEHICLE SPECIFICATIONS</Text>
        </View>
        <Text style={styles.cardSubtitle}>
          Helps verify precise application and engine compatibility.
        </Text>

        <View style={styles.twoColumnRow}>
          <View style={styles.twoColumnItem}>
            <AppInput
              label="Make / Brand"
              placeholder="e.g. Toyota, Mahindra"
              value={vehicleMake}
              onChangeText={setVehicleMake}
              containerStyle={styles.appInputCompact}
            />
          </View>
          <View style={styles.twoColumnItem}>
            <AppInput
              label="Model"
              placeholder="e.g. Scorpio N, Beetle"
              value={vehicleModel}
              onChangeText={setVehicleModel}
              containerStyle={styles.appInputCompact}
            />
          </View>
        </View>

        <View style={styles.inputSpacing}>
          <AppInput
            label="Year of Manufacture"
            placeholder="e.g. 2023"
            value={vehicleYear}
            onChangeText={setVehicleYear}
            keyboardType="numeric"
            containerStyle={styles.appInputCompact}
          />
        </View>
      </View>

      {/* Step 1 CTA Button */}
      <View style={styles.stepFooterRow}>
        <TouchableOpacity
          style={styles.fullNextStepBtn}
          onPress={handleNextFromStep1}
          activeOpacity={0.85}
        >
          <Text style={styles.nextStepBtnText}>CONTINUE</Text>
          <ChevronRight size={18} color={COLORS.white} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render Step 2: Choose Authorized Stockist / Distributor (with full filter panel)
  const renderStep2 = () => (
    <View>
      {/* Step 2 Banner */}
      <View style={styles.stepBannerCard}>
        <View style={styles.stepBannerIconBox}>
          <SolidStoreIcon size={18} color={COLORS.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.stepBannerTitle}>
            {isReseller ? 'STEP 2: CHOOSE REGIONAL DISTRIBUTOR' : 'STEP 2: CHOOSE AUTHORIZED RESELLER'}
          </Text>
          <Text style={styles.stepBannerSubtitle}>
            {isReseller
              ? 'Select verified distributor to process your wholesale ticket.'
              : 'Choose the nearest certified dealer for inventory & quote dispatch.'}
          </Text>
        </View>
      </View>

      {/* Auto-Select Nearest Reseller Action */}
      <TouchableOpacity
        style={styles.autoSelectNearestBtn}
        onPress={handleAutoSelectNearest}
        activeOpacity={0.8}
      >
        <SolidLocationPinIcon size={16} color={COLORS.white} />
        <Text style={styles.autoSelectNearestBtnText}>
          Auto-Select Nearest Authorized Reseller
        </Text>
      </TouchableOpacity>

      {/* Search Input Bar + Filter Trigger Button */}
      <View style={styles.searchBarRow}>
        <View style={styles.modalSearchBox}>
          <Search size={17} color="#9CA3AF" />
          <TextInput
            style={styles.modalSearchInput}
            placeholder="Search by Dealer, City or Area"
            placeholderTextColor="#9CA3AF"
            value={dealerSearchQuery}
            onChangeText={setDealerSearchQuery}
            clearButtonMode="while-editing"
          />
          {dealerSearchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setDealerSearchQuery('')}>
              <X size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Trigger Button opening DealerFilterModal */}
        <TouchableOpacity
          style={[
            styles.filterTriggerBtn,
            activeFilterCount > 0 && styles.filterTriggerBtnActive,
          ]}
          onPress={() => setFilterModalVisible(true)}
          activeOpacity={0.8}
        >
          <SlidersHorizontal
            size={18}
            color={activeFilterCount > 0 ? COLORS.white : COLORS.slate800}
          />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadgeCircle}>
              <Text style={styles.filterBadgeCircleText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Active Filter Chips Bar (Shown when any filter is active) */}
      {activeFilterCount > 0 && (
        <View style={styles.activeChipsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activeChipsScroll}
          >
            <Text style={styles.activeChipsLabel}>Filters:</Text>

            {filters.radius !== 50 && (
              <View style={styles.activeChipPill}>
                <Text style={styles.activeChipText}>
                  {`≤ ${filters.radius}km`}
                </Text>
                <TouchableOpacity
                  onPress={() => setFilters((prev) => ({ ...prev, radius: 50 }))}
                >
                  <X size={11} color={COLORS.primary} strokeWidth={2.4} />
                </TouchableOpacity>
              </View>
            )}

            {filters.role !== 'all' && (
              <View style={styles.activeChipPill}>
                <Text style={styles.activeChipText}>
                  {filters.role === 'distributor' ? 'Distributors' : 'Resellers'}
                </Text>
                <TouchableOpacity
                  onPress={() => setFilters((prev) => ({ ...prev, role: 'all' }))}
                >
                  <X size={11} color={COLORS.primary} strokeWidth={2.4} />
                </TouchableOpacity>
              </View>
            )}

            {filters.sortBy === 'alpha' && (
              <View style={styles.activeChipPill}>
                <Text style={styles.activeChipText}>A-Z Name</Text>
                <TouchableOpacity
                  onPress={() => setFilters((prev) => ({ ...prev, sortBy: 'nearest' }))}
                >
                  <X size={11} color={COLORS.primary} strokeWidth={2.4} />
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              onPress={() => setFilters(DEFAULT_FILTERS)}
              style={styles.clearAllBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.clearAllBtnText}>Clear All</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Quick Category Filter Tabs */}
      <View style={styles.modalFilterTabsRow}>
        <TouchableOpacity
          style={[
            styles.modalFilterTab,
            filters.role === 'all' && styles.modalFilterTabActive,
          ]}
          onPress={() => setFilters((prev) => ({ ...prev, role: 'all' }))}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.modalFilterTabText,
              filters.role === 'all' && styles.modalFilterTabTextActive,
            ]}
          >
            All ({counts.all})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modalFilterTab,
            filters.role === 'distributor' && styles.modalFilterTabActive,
          ]}
          onPress={() => setFilters((prev) => ({ ...prev, role: 'distributor' }))}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.modalFilterTabText,
              filters.role === 'distributor' && styles.modalFilterTabTextActive,
            ]}
          >
            Wholesale Hubs ({counts.distributors})
          </Text>
        </TouchableOpacity>

        {!isReseller && (
          <TouchableOpacity
            style={[
              styles.modalFilterTab,
              filters.role === 'reseller' && styles.modalFilterTabActive,
            ]}
            onPress={() => setFilters((prev) => ({ ...prev, role: 'reseller' }))}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.modalFilterTabText,
                filters.role === 'reseller' && styles.modalFilterTabTextActive,
              ]}
            >
              Retail Resellers ({counts.stockists})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Dealers List */}
      <View style={{ marginTop: 4 }}>
        {fetchingStockists ? (
          <View style={styles.loadingStockistsBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingStockistsText}>
              Discovering authorized dealers & distributors...
            </Text>
          </View>
        ) : filteredDealers.length === 0 ? (
          <View style={styles.emptyDealersBox}>
            <SolidStoreIcon size={36} color="#CBD5E1" />
            <Text style={styles.emptyDealersTitle}>No Dealers Found</Text>
            <Text style={styles.emptyDealersSub}>
              Try expanding your search radius or clearing filter criteria.
            </Text>
            <TouchableOpacity
              style={styles.emptyResetBtn}
              onPress={() => {
                setFilters(DEFAULT_FILTERS);
                setDealerSearchQuery('');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.emptyResetBtnText}>Reset All Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredDealers.map((d) => {
            const isSelected = selectedDealerId === d.id;
            const isDist = d.role === 'distributor';
            return (
              <TouchableOpacity
                key={d.id}
                style={[
                  styles.modalDealerCard,
                  isSelected && styles.modalDealerCardSelected,
                ]}
                onPress={() => {
                  setSelectedDealerId(d.id);
                  setSelectedDealerName(d.name);
                  setSelectedDealerObj(d);
                }}
                activeOpacity={0.75}
              >
                <View style={styles.modalDealerCardTop}>
                  <View style={[styles.modalDealerIconBox, { backgroundColor: isDist ? '#F1F5F9' : '#FEF3C7', borderColor: isDist ? '#CBD5E1' : '#FDE68A', borderWidth: 1 }]}>
                    <Image
                      source={locationIcon}
                      style={{ width: 22, height: 22, tintColor: isDist ? '#1E293B' : '#D97706' }}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <View style={styles.dealerNameBadgeRow}>
                      <Text style={styles.modalDealerName} numberOfLines={1}>
                        {d.name || d.companyName || 'Authorized Partner'}
                      </Text>
                      <View
                        style={[
                          styles.roleTag,
                          isDist ? styles.roleTagDistributor : styles.roleTagStockist,
                        ]}
                      >
                        <Text
                          style={[
                            styles.roleTagText,
                            isDist
                              ? styles.roleTagTextDistributor
                              : styles.roleTagTextStockist,
                          ]}
                        >
                          {isDist ? 'DISTRIBUTOR' : 'RESELLER'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.dealerLocationRow}>
                      <SolidLocationPinIcon size={12} color="#6B7280" />
                      <Text style={styles.modalDealerAddress} numberOfLines={1}>
                        {[d.address || d.streetAddress, d.city, d.postalCode || d.postal_code].filter(Boolean).join(', ')}
                      </Text>
                    </View>

                    {/* Contact Phone & Direct Call */}
                    {d.phone ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <Phone size={11} color="#64748B" />
                        <Text style={{ fontSize: 11, color: '#475569', fontWeight: '600' }}>{d.phone}</Text>
                        <TouchableOpacity
                          onPress={() => Linking.openURL(`tel:${d.phone}`)}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          style={{ marginLeft: 4, paddingHorizontal: 6, paddingVertical: 1.5, backgroundColor: '#EFF6FF', borderRadius: 4, borderWidth: 0.5, borderColor: '#BFDBFE' }}
                        >
                          <Text style={{ fontSize: 9.5, color: '#2563EB', fontWeight: '700' }}>CALL</Text>
                        </TouchableOpacity>
                      </View>
                    ) : null}
                  </View>

                  {isSelected ? (
                    <View style={styles.selectedCheckCircle}>
                      <Check size={14} color={COLORS.white} strokeWidth={3} />
                    </View>
                  ) : (
                    <View style={styles.unselectedCircle} />
                  )}
                </View>

                {d.distance && (
                  <View style={styles.modalDealerFooter}>
                    <View style={styles.modalDistanceChip}>
                      <SolidLocationPinIcon size={11} color="#047857" />
                      <Text style={styles.modalDistanceChipText}>
                        {d.distance} from your location
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.selectPrompt,
                        isSelected && { color: COLORS.primary, fontWeight: FONTS.weight.heavy },
                      ]}
                    >
                      {isSelected ? '✓ Selected Reseller' : 'Tap to Select'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* Step 2 Bottom Navigation */}
      <View style={styles.stepFooterRow}>
        <TouchableOpacity
          style={styles.prevStepBtn}
          onPress={() => setCurrentStep(1)}
          activeOpacity={0.7}
        >
          <ChevronLeft size={18} color={COLORS.textSecondary} strokeWidth={2.5} />
          <Text style={styles.prevStepBtnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.nextStepBtn}
          onPress={handleNextFromStep2}
          activeOpacity={0.85}
        >
          <Text style={styles.nextStepBtnText}>CONTINUE</Text>
          <ChevronRight size={18} color={COLORS.white} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render Step 3: Query Notes & Final Dispatch
  const renderStep3 = () => (
    <View>
      {/* Step 3 Banner */}
      <View style={styles.stepBannerCard}>
        <View style={[styles.stepBannerIconBox, { backgroundColor: COLORS.infoLight }]}>
          <Sparkles size={18} color="#2563EB" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.stepBannerTitle}>STEP 3: QUERY DETAILS & DISPATCH</Text>
          <Text style={styles.stepBannerSubtitle}>
            Review your verification summary, specify quantity, and add inquiry notes.
          </Text>
        </View>
      </View>

      {/* Verification Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryTitleRow}>
          <Text style={styles.summaryHeaderTitle}>VERIFICATION SUMMARY</Text>
          <TouchableOpacity onPress={() => setCurrentStep(1)} activeOpacity={0.7}>
            <Text style={styles.summaryEditLink}>Edit Specs</Text>
          </TouchableOpacity>
        </View>

        {/* Part Item */}
        <View style={styles.summaryItemRow}>
          <View style={[styles.summaryItemIconBox, { backgroundColor: COLORS.errorLight }]}>
            <SolidPartTagIcon size={14} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryItemLabel}>Selected Part</Text>
            <Text style={styles.summaryItemValue}>
              #{partNumber || 'N/A'} {partName ? `• ${partName}` : ''}
            </Text>
          </View>
        </View>

        {/* Vehicle Item */}
        <View style={styles.summaryItemRow}>
          <View style={[styles.summaryItemIconBox, { backgroundColor: COLORS.infoLight }]}>
            <SolidCarSilhouetteIcon size={14} color="#2563EB" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryItemLabel}>Vehicle Application</Text>
            <Text style={styles.summaryItemValue}>
              {[vehicleMake, vehicleModel, vehicleYear].filter(Boolean).join(' ') || 'General Enquiry'}
            </Text>
          </View>
        </View>

        {/* Assigned Dealer Item */}
        <View style={styles.summaryItemRow}>
          <View style={[styles.summaryItemIconBox, { backgroundColor: selectedDealerObj?.role === 'distributor' ? '#F1F5F9' : '#FEF3C7' }]}>
            <Image
              source={locationIcon}
              style={{ width: 18, height: 18, tintColor: selectedDealerObj?.role === 'distributor' ? '#1E293B' : '#D97706' }}
              resizeMode="contain"
            />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.summaryItemLabel}>
                {selectedDealerObj?.role === 'distributor' ? 'Assigned Distributor' : 'Assigned Reseller'}
              </Text>
              <TouchableOpacity onPress={() => setCurrentStep(2)} activeOpacity={0.7}>
                <Text style={styles.summaryEditLink}>Change</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.summaryItemValue}>
              {selectedDealerName || selectedDealerObj?.companyName || 'Nearest Authorized Partner'}
            </Text>
            {selectedDealerObj ? (
              <View style={{ marginTop: 2 }}>
                <Text style={styles.summaryItemSub}>
                  {[selectedDealerObj.address || selectedDealerObj.streetAddress, selectedDealerObj.city].filter(Boolean).join(', ')}
                  {selectedDealerObj.distance ? ` • ${selectedDealerObj.distance} away` : ''}
                </Text>
                {selectedDealerObj.phone ? (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(`tel:${selectedDealerObj.phone}`)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}
                  >
                    <Phone size={10} color="#2563EB" />
                    <Text style={{ fontSize: 11, color: '#2563EB', fontWeight: '600' }}>{selectedDealerObj.phone}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {/* Requested Quantity */}
      <View style={styles.quantityCard}>
        <View>
          <Text style={styles.quantityLabel}>Requested Quantity</Text>
          <Text style={styles.quantitySub}>Number of units needed</Text>
        </View>
        <View style={styles.stepperBox}>
          <TouchableOpacity
            style={styles.stepperBtn}
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            activeOpacity={0.7}
          >
            <SolidStepperMinusIcon size={13} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.stepperValue}>{quantity}</Text>
          <TouchableOpacity
            style={styles.stepperBtn}
            onPress={() => setQuantity((q) => q + 1)}
            activeOpacity={0.7}
          >
            <SolidStepperPlusIcon size={13} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Query Notes */}
      <View style={styles.inputSpacing}>
        <AppInput
          label="Enquiry Details / Query Notes *"
          placeholder="Describe requirement, stock availability check, fitment query, or price quote..."
          value={enquiryDetails}
          onChangeText={setEnquiryDetails}
          multiline={true}
          numberOfLines={4}
        />
      </View>

      {/* Step 3 Bottom Navigation */}
      <View style={styles.stepFooterRow}>
        <TouchableOpacity
          style={styles.prevStepBtn}
          onPress={() => setCurrentStep(2)}
          activeOpacity={0.7}
        >
          <ChevronLeft size={18} color={COLORS.textSecondary} strokeWidth={2.5} />
          <Text style={styles.prevStepBtnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextStepBtn, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.nextStepBtnText}>Submit Ticket</Text>
              <Send size={16} color={COLORS.white} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <AppHeader
        title={isReseller ? 'Wholesale Query' : 'Technical Enquiry'}
        subtitle={
          isReseller
            ? 'Distributor Lead & Fitment Support'
            : 'Authorized Verification & Dealer Dispatch'
        }
        onBack={() => {
          if (currentStep > 1) {
            setCurrentStep((s) => s - 1);
          } else {
            navigation.goBack();
          }
        }}
        rightElement={
          <TouchableOpacity
            onPress={() => {
              const homeRoute =
                currentUserRole === 'reseller' || currentUserRole === 'retailer' || currentUserRole === 'shop_owner'
                  ? 'ResellerHome'
                  : currentUserRole === 'distributor' || currentUserRole === 'wholesaler'
                  ? 'DistributorHome'
                  : 'OwnerHome';
              navigation.navigate(homeRoute);
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.75}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Image
              source={homeIcon}
              style={{ width: 20, height: 20, tintColor: COLORS.white }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        }
      />

      {/* 3-Step Guided Journey Indicator */}
      <EnquiryStepIndicator
        currentStep={currentStep}
        onStepPress={handleStepPress}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.enquiryScrollContent,
            { paddingHorizontal: 16, paddingTop: 10 },
          ]}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        >
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Full Sophisticated Dealer Filter Panel */}
      <DealerFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={filters}
        onApply={(newFilters) => setFilters(newFilters)}
        onReset={() => setFilters(DEFAULT_FILTERS)}
        dealers={scopedCandidateDealers}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  enquiryScrollContent: {
    paddingBottom: 80,
  },
  appInputCompact: {
    marginBottom: 6,
  },
  // Role Notice Card
  resellerNoticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: COLORS.errorLight,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    borderRadius: RADIUS.sm,
    padding: 10,
    marginBottom: 8,
  },
  resellerNoticeIconBox: {
    marginTop: 2,
  },
  resellerNoticeTitle: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.primary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  resellerNoticeBody: {
    fontSize: FONTS.size.caption,
    color: '#991B1B',
    lineHeight: 16,
  },

  // Step Banners
  stepBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepBannerIconBox: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.xs,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBannerTitle: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.slate900,
    letterSpacing: 0.5,
  },
  stepBannerSubtitle: {
    fontSize: FONTS.size.caption,
    color: COLORS.textTertiary,
    marginTop: 1,
  },

  // Section Headers
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },

  // Garage Quick Selector
  garageSelectorContainer: {
    marginBottom: 8,
  },
  garageCountBadge: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textTertiary,
  },
  garageChipsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  garageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  garageChipSelected: {
    backgroundColor: COLORS.slate900,
    borderColor: COLORS.slate900,
  },
  garageChipText: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.textSecondary,
  },
  garageChipTextSelected: {
    color: COLORS.white,
    fontWeight: FONTS.weight.bold,
  },

  // Form Cards
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.slate900,
    letterSpacing: 0.5,
  },
  cardSubtitle: {
    fontSize: FONTS.size.caption,
    color: COLORS.textTertiary,
    marginBottom: 6,
  },
  inputSpacing: {
    marginBottom: 0,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  twoColumnItem: {
    flex: 1,
    marginBottom: 0,
  },

  // Quantity Stepper
  quantityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quantityLabel: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.slate900,
  },
  quantitySub: {
    fontSize: FONTS.size.caption,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.slate100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepperValue: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.slate900,
    minWidth: 20,
    textAlign: 'center',
  },

  // Step Navigation Buttons
  stepFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    marginBottom: 14,
  },
  fullNextStepBtn: {
    width: '100%',
    height: 44,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  prevStepBtn: {
    flex: 1,
    height: 48,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.borderDark,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  prevStepBtnText: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textSecondary,
  },
  nextStepBtn: {
    flex: 2,
    height: 48,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  nextStepBtnText: {
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.bold,
    color: COLORS.white,
  },

  // Step 2 Dealer Selection UI & Filter Panel Controls
  autoSelectNearestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    borderRadius: RADIUS.sm,
    paddingVertical: 12,
    marginBottom: 12,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  autoSelectNearestBtnText: {
    color: COLORS.white,
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  modalSearchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: FONTS.size.sm,
    color: COLORS.slate900,
    padding: 0,
  },
  filterTriggerBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterTriggerBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterBadgeCircle: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  filterBadgeCircleText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: FONTS.weight.heavy,
  },

  // Active Chips Bar
  activeChipsContainer: {
    marginBottom: 10,
  },
  activeChipsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeChipsLabel: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textTertiary,
    marginRight: 2,
  },
  activeChipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.errorLight,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  activeChipText: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primary,
  },
  clearAllBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearAllBtnText: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.bold,
    color: COLORS.slate400,
  },

  // Quick Category Filter Tabs
  modalFilterTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  modalFilterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.slate100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalFilterTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modalFilterTabText: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textSecondary,
  },
  modalFilterTabTextActive: {
    color: COLORS.white,
  },

  loadingStockistsBox: {
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingStockistsText: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium,
    color: COLORS.textSecondary,
  },

  // Dealer Cards in Step 2
  modalDealerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalDealerCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFFBFB',
    borderWidth: 1.5,
  },
  modalDealerCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalDealerIconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  dealerNameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  modalDealerName: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.slate900,
    flexShrink: 1,
  },
  roleTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  roleTagDistributor: {
    backgroundColor: COLORS.errorLight,
  },
  roleTagStockist: {
    backgroundColor: '#F1F5F9',
  },
  roleTagText: {
    fontSize: 9,
    fontWeight: FONTS.weight.heavy,
  },
  roleTagTextDistributor: {
    color: COLORS.primary,
  },
  roleTagTextStockist: {
    color: '#475569',
  },
  dealerLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalDealerAddress: {
    fontSize: FONTS.size.xs,
    color: COLORS.textTertiary,
  },
  selectedCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unselectedCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.borderDark,
  },
  modalDealerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate100,
  },
  modalDistanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalDistanceChipText: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.bold,
    color: '#047857',
  },
  selectPrompt: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textTertiary,
  },
  emptyDealersBox: {
    alignItems: 'center',
    paddingVertical: 36,
  },
  emptyDealersTitle: {
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textSecondary,
    marginTop: 10,
  },
  emptyDealersSub: {
    fontSize: FONTS.size.xs,
    color: COLORS.slate400,
    marginTop: 2,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  emptyResetBtn: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primary,
  },
  emptyResetBtnText: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
    color: COLORS.white,
  },

  // Step 3 Summary Card
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
    marginBottom: 10,
  },
  summaryHeaderTitle: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.slate900,
    letterSpacing: 0.5,
  },
  summaryEditLink: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primary,
  },
  summaryItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  summaryItemIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  summaryItemLabel: {
    fontSize: 10,
    fontWeight: FONTS.weight.bold,
    color: COLORS.slate400,
    textTransform: 'uppercase',
    marginBottom: 1,
  },
  summaryItemValue: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.slate800,
  },
  summaryItemSub: {
    fontSize: FONTS.size.caption,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
});

export default TechnicalEnquiryScreen;
