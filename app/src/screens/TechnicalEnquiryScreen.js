import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
} from 'react-native';
import {
  CheckCircle2,
  Search,
  X,
  ShieldCheck,
  Check,
  Sparkles,
  ChevronRight,
  Send,
  SlidersHorizontal,
  Building2,
  Store,
} from 'lucide-react-native';
import {
  SolidStoreIcon,
  SolidPartTagIcon,
  SolidCarSilhouetteIcon,
  SolidGarageBayIcon,
  SolidShieldVerifiedIcon,
  SolidLocationPinIcon,
  SolidStepperMinusIcon,
  SolidStepperPlusIcon,
} from '../components/icons/TechnicalEnquiryIcons';
import EnquiryStepIndicator from '../components/common/EnquiryStepIndicator';
import DealerFilterModal, { DEFAULT_FILTERS } from '../components/common/DealerFilterModal';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { apiFunction } from '../apis/apiFunction';
import { addEnquiryApi, dealersApi } from '../apis/api';
import { useDispatch, useSelector } from 'react-redux';
import { getUsersRedux } from '../redux/getData';
import Geolocation from '@react-native-community/geolocation';
import ScreenContainer from '../components/common/ScreenContainer';
import AppHeader from '../components/common/AppHeader';
import AppInput from '../components/common/AppInput';

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

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const storedRole = (await AsyncStorage.getItem('role')) || (await AsyncStorage.getItem('userRole'));
        if (storedRole) {
          setCurrentUserRole(storedRole.toLowerCase());
        } else if (myself?.role) {
          setCurrentUserRole(myself.role.toLowerCase());
        }
      } catch (err) {
        console.warn('Error reading role:', err);
      }
    };
    fetchRole();
  }, [myself?.role]);

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

  // Fetch Nearby Stockists
  const loadStockists = useCallback(async () => {
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
          };
          setUserCoords(coords);
          try {
            const res = await apiFunction(dealersApi, [], coords, 'GET', false);
            const list = res?.dealers || res?.data?.array || [];
            if (list.length > 0) {
              setStockists(list);
              if (!selectedDealerId) {
                const nearest = list[0];
                const id = nearest.userId || nearest.dealerId || nearest.id;
                const name = nearest.name || nearest.companyName;
                setSelectedDealerId(id);
                setSelectedDealerName(name);
                setSelectedDealerObj(nearest);
              }
            }
          } catch (err) {
            console.warn('Geolocation dealer fetch failed:', err);
            fallbackFetch();
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
        if (list.length > 0) {
          setStockists(list);
          if (!selectedDealerId) {
            const first = list[0];
            const id = first.userId || first.dealerId || first.id;
            const name = first.name || first.companyName;
            setSelectedDealerId(id);
            setSelectedDealerName(name);
            setSelectedDealerObj(first);
          }
        }
      } catch (err) {
        console.warn('Fallback dealer fetch failed:', err);
      }
    };

    acquirePosition();
  }, [selectedDealerId]);

  useEffect(() => {
    loadStockists();
    if (!users || users.length === 0) {
      dispatch(getUsersRedux());
    }
  }, [loadStockists, dispatch, users]);

  // Merge API dealers with Redux users with standardized roles and distanceKm
  const scopedCandidateDealers = useMemo(() => {
    const list = [];
    const seen = new Set();

    // 1. Process API stockists
    if (Array.isArray(stockists)) {
      stockists.forEach((d) => {
        const id = d.userId || d.dealerId || d.id || d._id;
        const name = d.name || d.companyName;
        if (id && !seen.has(id)) {
          seen.add(id);
          const role = (d.role || '').toLowerCase();
          const isDistributor = role === 'distributor' || role === 'wholesaler';
          const rawDist = d.distance !== undefined && d.distance !== null ? d.distance : d.distanceKm;
          const parsedKm =
            rawDist !== undefined && rawDist !== null ? parseFloat(rawDist) : 999999;

          list.push({
            id,
            name: name || 'Authorized Stockist',
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
          });
        }
      });
    }

    // 2. Process Redux users for matching roles
    if (Array.isArray(users)) {
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
          seen.add(id);
          list.push({
            id,
            name:
              u.name ||
              u.companyName ||
              (isDistributor ? 'Regional Distributor' : 'Authorized Stockist'),
            companyName: u.companyName || u.name,
            role: isDistributor ? 'distributor' : 'reseller',
            distance: null,
            distanceKm: 999999,
            address: u.address || '',
            city: u.city || '',
            rating: '4.8',
            verified: true,
            isNearest: false,
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
  }, [stockists, users]);

  // Compute dynamic counts based on active search query & radius filter
  const counts = useMemo(() => {
    const baseList = scopedCandidateDealers.filter((d) => {
      // 1. Distance radius filter
      if (
        filters.radius !== undefined &&
        filters.radius !== null &&
        d.distanceKm !== undefined &&
        d.distanceKm !== null &&
        d.distanceKm !== 999999
      ) {
        if (filters.radius === 1500) {
          // All SA preset
        } else if (d.distanceKm > filters.radius) {
          return false;
        }
      }

      // 2. Search query filter
      if (dealerSearchQuery.trim()) {
        const q = dealerSearchQuery.toLowerCase().trim();
        const matchName = d.name && d.name.toLowerCase().includes(q);
        const matchCity = d.city && d.city.toLowerCase().includes(q);
        const matchAddress = d.address && d.address.toLowerCase().includes(q);
        if (!matchName && !matchCity && !matchAddress) return false;
      }

      return true;
    });

    return {
      all: baseList.length,
      distributors: baseList.filter((d) => d.role === 'distributor').length,
      stockists: baseList.filter((d) => d.role !== 'distributor').length,
    };
  }, [scopedCandidateDealers, filters.radius, dealerSearchQuery]);

  // Complete filter & sort pipeline driven by DealerFilterModal state
  const filteredDealers = useMemo(() => {
    let list = scopedCandidateDealers.filter((d) => {
      // 1. Role filter (all | distributor | reseller)
      if (filters.role === 'distributor' && d.role !== 'distributor') return false;
      if (
        filters.role === 'reseller' &&
        d.role !== 'reseller' &&
        d.role !== 'stockist' &&
        d.role !== 'dealer'
      )
        return false;

      // 2. Distance radius filter
      if (
        filters.radius !== undefined &&
        filters.radius !== null &&
        d.distanceKm !== undefined &&
        d.distanceKm !== null &&
        d.distanceKm !== 999999
      ) {
        if (filters.radius === 1500) {
          // All SA preset - no distance restriction
        } else if (d.distanceKm > filters.radius) {
          return false;
        }
      }

      // 3. Search query filter
      if (dealerSearchQuery.trim()) {
        const q = dealerSearchQuery.toLowerCase().trim();
        const matchName = d.name && d.name.toLowerCase().includes(q);
        const matchCity = d.city && d.city.toLowerCase().includes(q);
        const matchAddress = d.address && d.address.toLowerCase().includes(q);
        if (!matchName && !matchCity && !matchAddress) return false;
      }

      return true;
    });

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

  // Sync selected dealer object when list updates
  useEffect(() => {
    if (selectedDealerId && scopedCandidateDealers.length > 0) {
      const found = scopedCandidateDealers.find((d) => d.id === selectedDealerId);
      if (found) {
        setSelectedDealerName(found.name);
        setSelectedDealerObj(found);
      }
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
        text1: 'Stockist Required',
        text2: isReseller
          ? 'Please select a Regional Distributor to proceed.'
          : 'Please select an Authorized Stockist to proceed.',
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
        navigation.navigate('MyEnquiries');
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
            <ShieldCheck size={18} color="#D0142C" />
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
          <CheckCircle2 size={18} color="#059669" />
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
              <SolidGarageBayIcon size={16} color="#D0142C" />
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
                    size={15}
                    color={isSelected ? '#FFFFFF' : '#64748B'}
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
                  {isSelected && <Check size={13} color="#FFFFFF" strokeWidth={2.6} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Part Identification Fields */}
      <View style={styles.formCard}>
        <View style={styles.cardHeaderRow}>
          <SolidPartTagIcon size={17} color="#D0142C" />
          <Text style={styles.cardTitle}>PART IDENTIFICATION</Text>
        </View>
        <Text style={styles.cardSubtitle}>
          Specify NGK spark plug, ignition coil, sensor, or exact part number.
        </Text>

        <View style={styles.inputSpacing}>
          <AppInput
            label="Part Number / Article No *"
            placeholder="e.g. BKR6E-11, ILFR6A, 90919-01192"
            value={partNumber}
            onChangeText={setPartNumber}
          />
        </View>

        <View style={styles.inputSpacing}>
          <AppInput
            label="Part Name / Component"
            placeholder="e.g. Laser Iridium Spark Plug, Oxygen Sensor"
            value={partName}
            onChangeText={setPartName}
          />
        </View>
      </View>

      {/* Vehicle Specifications */}
      <View style={styles.formCard}>
        <View style={styles.cardHeaderRow}>
          <SolidCarSilhouetteIcon size={17} color="#2563EB" />
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
            />
          </View>
          <View style={styles.twoColumnItem}>
            <AppInput
              label="Model"
              placeholder="e.g. Scorpio N, Beetle"
              value={vehicleModel}
              onChangeText={setVehicleModel}
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
          <Text style={styles.nextStepBtnText}>Continue to Select Dealer</Text>
          <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render Step 2: Choose Authorized Stockist / Distributor (with full filter panel)
  const renderStep2 = () => (
    <View>
      {/* Step 2 Banner */}
      <View style={styles.stepBannerCard}>
        <View style={[styles.stepBannerIconBox, { backgroundColor: '#FEF2F2' }]}>
          <SolidStoreIcon size={18} color="#D0142C" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.stepBannerTitle}>
            {isReseller ? 'STEP 2: CHOOSE REGIONAL DISTRIBUTOR' : 'STEP 2: CHOOSE AUTHORIZED STOCKIST'}
          </Text>
          <Text style={styles.stepBannerSubtitle}>
            {isReseller
              ? 'Select verified distributor to process your wholesale ticket.'
              : 'Choose the nearest certified dealer for inventory & quote dispatch.'}
          </Text>
        </View>
      </View>

      {/* Auto-Select Nearest Stockist Action */}
      <TouchableOpacity
        style={styles.autoSelectNearestBtn}
        onPress={handleAutoSelectNearest}
        activeOpacity={0.8}
      >
        <SolidLocationPinIcon size={16} color="#FFFFFF" />
        <Text style={styles.autoSelectNearestBtnText}>
          Auto-Select Nearest Authorized Stockist
        </Text>
      </TouchableOpacity>

      {/* Search Input Bar + Filter Trigger Button */}
      <View style={styles.searchBarRow}>
        <View style={styles.modalSearchBox}>
          <Search size={17} color="#9CA3AF" />
          <TextInput
            style={styles.modalSearchInput}
            placeholder="Search by dealer name, city, or area..."
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
            color={activeFilterCount > 0 ? '#FFFFFF' : '#1E293B'}
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
                  {filters.radius === 1500 ? 'All SA' : `≤ ${filters.radius}km`}
                </Text>
                <TouchableOpacity
                  onPress={() => setFilters((prev) => ({ ...prev, radius: 50 }))}
                >
                  <X size={11} color="#D0142C" strokeWidth={2.4} />
                </TouchableOpacity>
              </View>
            )}

            {filters.role !== 'all' && (
              <View style={styles.activeChipPill}>
                <Text style={styles.activeChipText}>
                  {filters.role === 'distributor' ? 'Distributors' : 'Stockists'}
                </Text>
                <TouchableOpacity
                  onPress={() => setFilters((prev) => ({ ...prev, role: 'all' }))}
                >
                  <X size={11} color="#D0142C" strokeWidth={2.4} />
                </TouchableOpacity>
              </View>
            )}

            {filters.sortBy === 'alpha' && (
              <View style={styles.activeChipPill}>
                <Text style={styles.activeChipText}>A-Z Name</Text>
                <TouchableOpacity
                  onPress={() => setFilters((prev) => ({ ...prev, sortBy: 'nearest' }))}
                >
                  <X size={11} color="#D0142C" strokeWidth={2.4} />
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

      {/* Quick Category Filter Pills */}
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
              Retail Stockists ({counts.stockists})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Dealers List */}
      <View style={{ marginTop: 4 }}>
        {filteredDealers.length === 0 ? (
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
                  <View style={styles.modalDealerIconBox}>
                    <SolidStoreIcon
                      size={18}
                      color={isDist ? '#D0142C' : '#059669'}
                    />
                  </View>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <View style={styles.dealerNameBadgeRow}>
                      <Text style={styles.modalDealerName} numberOfLines={1}>
                        {d.name}
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
                          {isDist ? 'DISTRIBUTOR' : 'STOCKIST'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.dealerLocationRow}>
                      <SolidLocationPinIcon size={12} color="#6B7280" />
                      <Text style={styles.modalDealerAddress} numberOfLines={1}>
                        {d.address || d.city}
                      </Text>
                    </View>
                  </View>

                  {isSelected ? (
                    <View style={styles.selectedCheckCircle}>
                      <Check size={14} color="#FFFFFF" strokeWidth={3} />
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
                        isSelected && { color: '#D0142C', fontWeight: '800' },
                      ]}
                    >
                      {isSelected ? '✓ Selected Stockist' : 'Tap to Select'}
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
          <Text style={styles.prevStepBtnText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.nextStepBtn}
          onPress={handleNextFromStep2}
          activeOpacity={0.85}
        >
          <Text style={styles.nextStepBtnText}>Continue to Query</Text>
          <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render Step 3: Query Notes & Final Dispatch
  const renderStep3 = () => (
    <View>
      {/* Step 3 Banner */}
      <View style={styles.stepBannerCard}>
        <View style={[styles.stepBannerIconBox, { backgroundColor: '#EFF6FF' }]}>
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
          <View style={[styles.summaryItemIconBox, { backgroundColor: '#FEF2F2' }]}>
            <SolidPartTagIcon size={14} color="#D0142C" />
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
          <View style={[styles.summaryItemIconBox, { backgroundColor: '#EFF6FF' }]}>
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
          <View style={[styles.summaryItemIconBox, { backgroundColor: '#F0FDF4' }]}>
            <SolidStoreIcon size={14} color="#059669" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.summaryItemLabel}>Assigned Stockist</Text>
              <TouchableOpacity onPress={() => setCurrentStep(2)} activeOpacity={0.7}>
                <Text style={styles.summaryEditLink}>Change</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.summaryItemValue}>
              {selectedDealerName || 'Nearest Authorized Stockist'}
            </Text>
            {selectedDealerObj?.distance && (
              <Text style={styles.summaryItemSub}>
                {selectedDealerObj.distance} away • {selectedDealerObj.city || selectedDealerObj.address}
              </Text>
            )}
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
            <SolidStepperMinusIcon size={13} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.stepperValue}>{quantity}</Text>
          <TouchableOpacity
            style={styles.stepperBtn}
            onPress={() => setQuantity((q) => q + 1)}
            activeOpacity={0.7}
          >
            <SolidStepperPlusIcon size={13} color="#111827" />
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
          <Text style={styles.prevStepBtnText}>← Change Dealer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextStepBtn, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.nextStepBtnText}>Submit Ticket</Text>
              <Send size={16} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
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
      />

      {/* 3-Step Guided Journey Indicator */}
      <EnquiryStepIndicator
        currentStep={currentStep}
        onStepPress={handleStepPress}
      />

      <ScreenContainer
        scrollable={true}
        includeTopInset={false}
        showStatusBar={false}
      >
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </ScreenContainer>

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
  // Role Notice Card
  resellerNoticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },
  resellerNoticeIconBox: {
    marginTop: 2,
  },
  resellerNoticeTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D0142C',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  resellerNoticeBody: {
    fontSize: 11,
    color: '#991B1B',
    lineHeight: 16,
  },

  // Step Banners
  stepBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepBannerIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBannerTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  stepBannerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  // Section Headers
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
  },

  // Garage Quick Selector
  garageSelectorContainer: {
    marginBottom: 14,
  },
  garageCountBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  garageChipsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  garageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  garageChipSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  garageChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  garageChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Form Cards
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 12,
  },
  inputSpacing: {
    marginBottom: 10,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  twoColumnItem: {
    flex: 1,
    marginBottom: 10,
  },

  // Quantity Stepper
  quantityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quantityLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  quantitySub: {
    fontSize: 11,
    color: '#64748B',
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
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepperValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    minWidth: 20,
    textAlign: 'center',
  },

  // Step Navigation Buttons
  stepFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    marginBottom: 28,
  },
  fullNextStepBtn: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    backgroundColor: '#D0142C',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    shadowColor: '#D0142C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  prevStepBtn: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prevStepBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  nextStepBtn: {
    flex: 2,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#D0142C',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    shadowColor: '#D0142C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  nextStepBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Step 2 Dealer Selection UI & Filter Panel Controls
  autoSelectNearestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 12,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  autoSelectNearestBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    padding: 0,
  },
  filterTriggerBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterTriggerBtnActive: {
    backgroundColor: '#D0142C',
    borderColor: '#D0142C',
  },
  filterBadgeCircle: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#D0142C',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  filterBadgeCircleText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
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
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginRight: 2,
  },
  activeChipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  activeChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D0142C',
  },
  clearAllBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearAllBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
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
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalFilterTabActive: {
    backgroundColor: '#D0142C',
    borderColor: '#D0142C',
  },
  modalFilterTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  modalFilterTabTextActive: {
    color: '#FFFFFF',
  },

  // Dealer Cards in Step 2
  modalDealerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalDealerCardSelected: {
    borderColor: '#D0142C',
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
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
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
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    flexShrink: 1,
  },
  roleTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleTagDistributor: {
    backgroundColor: '#FEF2F2',
  },
  roleTagStockist: {
    backgroundColor: '#F0FDF4',
  },
  roleTagText: {
    fontSize: 9,
    fontWeight: '800',
  },
  roleTagTextDistributor: {
    color: '#D0142C',
  },
  roleTagTextStockist: {
    color: '#059669',
  },
  dealerLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalDealerAddress: {
    fontSize: 12,
    color: '#64748B',
  },
  selectedCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#D0142C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unselectedCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  modalDealerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  modalDistanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalDistanceChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  selectPrompt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  emptyDealersBox: {
    alignItems: 'center',
    paddingVertical: 36,
  },
  emptyDealersTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginTop: 10,
  },
  emptyDealersSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  emptyResetBtn: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#D0142C',
  },
  emptyResetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Step 3 Summary Card
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    borderBottomColor: '#F1F5F9',
    marginBottom: 10,
  },
  summaryHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  summaryEditLink: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D0142C',
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
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 1,
  },
  summaryItemValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  summaryItemSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});

export default TechnicalEnquiryScreen;
