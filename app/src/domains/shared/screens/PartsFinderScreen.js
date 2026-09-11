import React, { useEffect, useState, useMemo } from 'react';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../../utils/theme';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Car,
  Truck,
  Bike,
  Wrench,
  Tractor,
  Anchor,
  Search,
  ChevronDown,
  Check,
  X,
  Sparkles,
  ArrowRight,
  Building2,
  Layers,
  Cpu,
  Zap,
  Calendar,
  Gauge,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFunction } from '../../../apis/apiFunction';
import {
  serviceJsonApi,
  addSearchHistoryApi,
  vehiclesApi,
  popularBrandsApi,
  articlesByPartApi,
} from '../../../apis/api';
import { getMyselfRedux } from '../../../redux/getData';
import Toast from 'react-native-toast-message';
import AppHeader from '../../../components/common/AppHeader';
import AppButton from '../../../components/common/AppButton';
import AppInput from '../../../components/common/AppInput';
import JourneyStepIndicator from '../../../components/common/JourneyStepIndicator';
import BrandLogoCard from '../../../components/parts/BrandLogoCard';
const DEFAULT_POPULAR_BRANDS = {
  passenger: [
    { id: 111, manuId: 111, name: 'TOYOTA', manuName: 'TOYOTA', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/toyota.png' },
    { id: 121, manuId: 121, name: 'VOLKSWAGEN', manuName: 'VOLKSWAGEN', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/volkswagen.png' },
    { id: 16, manuId: 16, name: 'BMW', manuName: 'BMW', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/bmw.png' },
    { id: 74, manuId: 74, name: 'MERCEDES-BENZ', manuName: 'MERCEDES-BENZ', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/mercedes-benz.png' },
    { id: 36, manuId: 36, name: 'FORD', manuName: 'FORD', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/ford.png' },
    { id: 5, manuId: 5, name: 'AUDI', manuName: 'AUDI', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/audi.png' },
    { id: 80, manuId: 80, name: 'NISSAN', manuName: 'NISSAN', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/nissan.png' },
    { id: 183, manuId: 183, name: 'HYUNDAI', manuName: 'HYUNDAI', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/hyundai.png' },
    { id: 63, manuId: 63, name: 'MARUTI SUZUKI', manuName: 'MARUTI SUZUKI', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/suzuki.png' },
    { id: 54, manuId: 54, name: 'ISUZU', manuName: 'ISUZU', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/isuzu.png' },
  ],
  commercial: [
    { id: 54, manuId: 54, name: 'ISUZU', manuName: 'ISUZU', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/isuzu.png' },
    { id: 74, manuId: 74, name: 'MERCEDES-BENZ', manuName: 'MERCEDES-BENZ', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/mercedes-benz.png' },
    { id: 120, manuId: 120, name: 'VOLVO', manuName: 'VOLVO', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/volvo.png' },
    { id: 103, manuId: 103, name: 'SCANIA', manuName: 'SCANIA', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/scania.png' },
    { id: 69, manuId: 69, name: 'MAN', manuName: 'MAN', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/man.png' },
    { id: 151, manuId: 151, name: 'HINO', manuName: 'HINO', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/hino.png' },
    { id: 24, manuId: 24, name: 'DAF', manuName: 'DAF', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/daf.png' },
    { id: 55, manuId: 55, name: 'IVECO', manuName: 'IVECO', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/iveco.png' },
    { id: 36, manuId: 36, name: 'FORD', manuName: 'FORD', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/ford.png' },
  ],
  lcv: [
    { id: 111, manuId: 111, name: 'TOYOTA', manuName: 'TOYOTA', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/toyota.png' },
    { id: 36, manuId: 36, name: 'FORD', manuName: 'FORD', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/ford.png' },
    { id: 54, manuId: 54, name: 'ISUZU', manuName: 'ISUZU', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/isuzu.png' },
    { id: 121, manuId: 121, name: 'VOLKSWAGEN', manuName: 'VOLKSWAGEN', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/volkswagen.png' },
    { id: 80, manuId: 80, name: 'NISSAN', manuName: 'NISSAN', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/nissan.png' },
    { id: 74, manuId: 74, name: 'MERCEDES-BENZ', manuName: 'MERCEDES-BENZ', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/mercedes-benz.png' },
    { id: 183, manuId: 183, name: 'HYUNDAI', manuName: 'HYUNDAI', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/hyundai.png' },
    { id: 93, manuId: 93, name: 'RENAULT', manuName: 'RENAULT', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/renault.png' },
  ],
  motorcycle: [
    { id: 45, manuId: 45, name: 'HONDA', manuName: 'HONDA', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/honda.png' },
    { id: 109, manuId: 109, name: 'SUZUKI', manuName: 'SUZUKI', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/suzuki.png' },
    { id: 16, manuId: 16, name: 'BMW', manuName: 'BMW', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/bmw.png' },
    { id: 2760, manuId: 2760, name: 'KTM', manuName: 'KTM', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/ktm.png' },
    { id: 112, manuId: 112, name: 'TRIUMPH', manuName: 'TRIUMPH', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/triumph.png' },
    { id: 1164, manuId: 1164, name: 'YAMAHA', manuName: 'YAMAHA', logoUrl: 'https://ngkapi.ckrtechnologies.in/uploads/logos/yamaha.png' },
    { id: 574, manuId: 574, name: 'KAWASAKI', manuName: 'KAWASAKI', logoUrl: 'https://ngkapi.ckrtechnologies.in/uploads/logos/kawasaki.png' },
    { id: 4552, manuId: 4552, name: 'BAJAJ', manuName: 'BAJAJ', logoUrl: 'https://ngkapi.ckrtechnologies.in/uploads/logos/bajaj.png' },
    { id: 181, manuId: 181, name: 'PIAGGIO', manuName: 'PIAGGIO', logoUrl: 'https://ngkapi.ckrtechnologies.in/uploads/logos/piaggio.png' },
  ],
  tractor: [
    { id: 301, manuId: 301, name: 'JOHN DEERE', manuName: 'JOHN DEERE', logoUrl: 'https://ngkapi.ckrtechnologies.in/uploads/logos/johndeere.png' },
    { id: 302, manuId: 302, name: 'MASSEY FERGUSON', manuName: 'MASSEY FERGUSON', logoUrl: 'https://ngkapi.ckrtechnologies.in/uploads/logos/masseyferguson.png' },
    { id: 303, manuId: 303, name: 'NEW HOLLAND', manuName: 'NEW HOLLAND', logoUrl: 'https://ngkapi.ckrtechnologies.in/uploads/logos/newholland.png' },
    { id: 304, manuId: 304, name: 'CASE IH', manuName: 'CASE IH', logoUrl: 'https://ngkapi.ckrtechnologies.in/uploads/logos/caseih.png' },
    { id: 305, manuId: 305, name: 'KUBOTA', manuName: 'KUBOTA', logoUrl: 'https://ngkapi.ckrtechnologies.in/uploads/logos/kubota.png' },
    { id: 306, manuId: 306, name: 'DEUTZ-FAHR', manuName: 'DEUTZ-FAHR', logoUrl: 'https://ngkapi.ckrtechnologies.in/uploads/logos/deutzfahr.png' },
    { id: 307, manuId: 307, name: 'CLAAS', manuName: 'CLAAS', logoUrl: 'https://ngkapi.ckrtechnologies.in/uploads/logos/claas.png' },
  ],
  marine: [
    { id: 11640, manuId: 11640, name: 'YAMAHA MARINE', manuName: 'YAMAHA MARINE', logoUrl: 'https://ngkapi.ckrtechnologies.in/uploads/logos/yamaha.png' },
    { id: 602, manuId: 602, name: 'MERCURY MARINE', manuName: 'MERCURY MARINE', logoUrl: 'https://ngkapi.ckrtechnologies.in/uploads/logos/mercury.png' },
    { id: 450, manuId: 450, name: 'HONDA MARINE', manuName: 'HONDA MARINE', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/honda.png' },
    { id: 1090, manuId: 1090, name: 'SUZUKI MARINE', manuName: 'SUZUKI MARINE', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/suzuki.png' },
    { id: 1200, manuId: 1200, name: 'VOLVO PENTA', manuName: 'VOLVO PENTA', logoUrl: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/volvo.png' },
    { id: 603, manuId: 603, name: 'YANMAR', manuName: 'YANMAR', logoUrl: 'https://ngkapi.ckrtechnologies.in/uploads/logos/yanmar.png' },
    { id: 5740, manuId: 5740, name: 'KAWASAKI WATERCRAFT', manuName: 'KAWASAKI WATERCRAFT', logoUrl: 'https://ngkapi.ckrtechnologies.in/uploads/logos/kawasaki.png' },
    { id: 604, manuId: 604, name: 'TOHATSU', manuName: 'TOHATSU', logoUrl: 'https://ngkapi.ckrtechnologies.in/uploads/logos/tohatsu.png' },
  ],
};

const PartsFinderScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { myself } = useSelector((state) => state.getData);

  const [searchMode, setSearchMode] = useState('vehicle'); // 'vehicle' | 'part'
  const [selectedApp, setSelectedApp] = useState('Passenger');
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehiclesData, setVehiclesData] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  // Direct Part Number state
  const [partNumber, setPartNumber] = useState('');
  const [partSearching, setPartSearching] = useState(false);

  // Dropdown data
  const [manufacturersData, setManufacturersData] = useState([]);
  const [seriesData, setSeriesData] = useState([]);
  const [loadingDropdown, setLoadingDropdown] = useState(false);
  // All popular brands pre-loaded into local state
  const [brandsByCategory, setBrandsByCategory] = useState(DEFAULT_POPULAR_BRANDS);
  const [brandCount, setBrandCount] = useState(9);

  // Modal selector state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(''); // 'manufacturer' | 'series' | 'model'
  const [filterQuery, setFilterQuery] = useState('');

  const applications = [
    { id: 'Passenger', label: 'Vehicle', icon: Car, type: 'P' },
    { id: 'Commercial', label: 'Commercial', icon: Truck, type: 'O' },
    { id: 'LightCommercial', label: 'LCV / Van', icon: Wrench, type: 'L' },
    { id: 'Motorcycle', label: 'Motorcycle', icon: Bike, type: 'M' },
    { id: 'Tractor', label: 'Tractor', icon: Tractor, type: 'T' },
    { id: 'Marine', label: 'Marine', icon: Anchor, type: 'MARINE' },
  ];

  useEffect(() => {
    const fetchMyself = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) dispatch(getMyselfRedux(userId));
    };
    if (!myself) fetchMyself();
  }, [dispatch]);

  // Canonical mapper for TecDoc South Africa (ZA) manufacturer IDs
  const resolveManuId = (manu) => {
    if (!manu) return null;
    const name = (manu.manuName || manu.name || '').toUpperCase().trim();
    const rawId = Number(manu.manuId || manu.id);
    if (name.includes('HYUNDAI')) return 183;
    if (name === 'FORD' && rawId === 45) return 36;
    if (name === 'ISUZU' && (rawId === 56 || !rawId)) return 54;
    return rawId;
  };

  const sanitizeBrand = (b) => {
    const fixedId = resolveManuId(b);
    return { ...b, id: fixedId, manuId: fixedId };
  };

  // Single initial API call on screen mount - loads categories
  useEffect(() => {
    const fetchAllBrands = async () => {
      try {
        const res = await apiFunction(popularBrandsApi, [], {}, 'GET', false);
        const data = res?.data || res;
        if (data?.passenger || data?.commercial) {
          setBrandsByCategory((prev) => ({
            passenger: (data.passenger?.length ? data.passenger : prev.passenger).map(sanitizeBrand),
            commercial: (data.commercial?.length ? data.commercial : prev.commercial).map(sanitizeBrand),
          }));
        } else if (Array.isArray(data?.array) && data.array.length > 0) {
          setBrandsByCategory((prev) => ({ ...prev, passenger: data.array.map(sanitizeBrand) }));
        }
      } catch (err) {
        console.warn('Failed to pre-load popular brands:', err);
      }
    };
    fetchAllBrands();
  }, []);

  // Synchronous in-memory lookup: ZERO network calls on tab toggle!
  const popularBrands = useMemo(() => {
    if (selectedApp === 'Commercial') return brandsByCategory.commercial || [];
    if (selectedApp === 'LightCommercial') return brandsByCategory.lcv || [];
    if (selectedApp === 'Motorcycle') return brandsByCategory.motorcycle || [];
    if (selectedApp === 'Tractor') return brandsByCategory.tractor || [];
    if (selectedApp === 'Marine') return brandsByCategory.marine || [];
    return brandsByCategory.passenger || [];
  }, [selectedApp, brandsByCategory]);

  // Fetch manufacturers when application changes
  useEffect(() => {
    const fetchManufacturers = async () => {
      setLoadingDropdown(true);
      const appType =
        applications.find((a) => a.id === selectedApp)?.type || 'P';
      const payload = {
        getManufacturers2: {
          country: 'ZA',
          lang: 'en',
          linkingTargetType: appType,
          includeAll: true,
        },
      };

      try {
        const res = await apiFunction(serviceJsonApi, [], payload, 'POST', false);
        const list =
          res?.data?.array ||
          res?.getManufacturers2?.array ||
          res?.data ||
          [];
        const normalizedList = list.map((m) => {
          const s = sanitizeBrand(m);
          return {
            ...s,
            id: s.manuId || s.id,
            manuId: s.manuId || s.id,
            name: s.manuName || s.name || '',
            manuName: s.manuName || s.name || '',
          };
        });
        setManufacturersData(normalizedList);
      } catch (err) {
        console.warn('Failed to load manufacturers', err);
      } finally {
        setLoadingDropdown(false);
      }
    };

    fetchManufacturers();
    setSelectedManufacturer(null);
    setSelectedSeries(null);
    setSelectedVehicle(null);
    setSeriesData([]);
    setVehiclesData([]);
  }, [selectedApp]);

  // Normalize series item helper
  const normalizeSeriesItem = (s, targetType) => ({
    ...s,
    id: s.modelId || s.id,
    modelId: s.modelId || s.id,
    name: s.modelname || s.name || s.modelName || '',
    modelname: s.modelname || s.name || s.modelName || '',
    linkingTargetType: s.linkingTargetType || targetType,
  });

  // Fetch series when manufacturer is selected
  const fetchSeriesForManufacturer = async (manu) => {
    setLoadingDropdown(true);
    const mfrId = resolveManuId(manu);
    const appType =
      applications.find((a) => a.id === selectedApp)?.type || 'P';

    try {
      if (selectedApp === 'Commercial') {
        // In TecDoc Pegasus, Commercial vehicles are divided:
        // 1. Heavy Commercial trucks (type: 'O')
        // 2. Light Commercial vans/bakkies/pickups (type: 'P', e.g. Sprinter, Vito, Hilux, Ranger, D-Max, Amarok)
        const [resO, resP] = await Promise.all([
          apiFunction(
            serviceJsonApi,
            [],
            {
              getModelSeries2: {
                country: 'ZA',
                lang: 'en',
                linkingTargetType: 'O',
                manuId: mfrId,
                includeAll: true,
              },
            },
            'POST',
            false
          ),
          apiFunction(
            serviceJsonApi,
            [],
            {
              getModelSeries2: {
                country: 'ZA',
                lang: 'en',
                linkingTargetType: 'P',
                manuId: mfrId,
                includeAll: true,
              },
            },
            'POST',
            false
          ),
        ]);

        const listO = (
          resO?.data?.array ||
          resO?.getModelSeries2?.array ||
          resO?.data ||
          []
        ).map((s) => normalizeSeriesItem(s, 'O'));

        const commRegex =
          /\b(SPRINTER|VITO|VIANO|CITAN|VARIO|HILUX|HIACE|QUANTUM|DYNA|PROBOX|D-MAX|KB|RANGER|TRANSIT|BANTAM|COURIER|AMAROK|CADDY|TRANSPORTER|CRAFTER|CARAVELLE|MULTIVAN|H-100|H-1|PORTER|STAREX|NAVARA|HARDBODY|NP200|NP300|1400 BAKKIE|NV200|NV350|CABSTAR)\b/i;

        const rawListP =
          resP?.data?.array ||
          resP?.getModelSeries2?.array ||
          resP?.data ||
          [];

        const listP = rawListP
          .filter((s) => commRegex.test(s.name || s.modelname || ''))
          .map((s) => normalizeSeriesItem(s, 'P'));

        // Deduplicate series by ID
        const seen = new Set();
        const combined = [];
        for (const item of [...listP, ...listO]) {
          const sId = item.modelId || item.id;
          if (sId && !seen.has(sId)) {
            seen.add(sId);
            combined.push(item);
          }
        }

        // Prioritize popular high-coverage commercial series (FH, FM, FL, Actros, Sprinter, D-Max, etc.)
        const popPrefix =
          /^(FH|FM|FL|FE|FMX|9400|B12|B9|B7|ACTROS|ATEGO|AXOR|AROCS|SPRINTER|VITO|VIANO|CITAN|D-MAX|KB|N-SERIES|F-SERIES|NPR|NQR|NHR|NMR|FRR|FTR|FVR|R|G|P|S|TGX|TGS|TGM|TGL|CLA|TGE|XF|CF|LF|300|500|700|DAILY|EUROCARGO|STRALIS|TRAKKER|S-WAY|HILUX|QUANTUM|HIACE|DYNA|LAND CRUISER|HINO|RANGER|TRANSIT|CUSTOM|CARGO|AMAROK|CADDY|TRANSPORTER|CRAFTER)/i;

        combined.sort((a, b) => {
          const aName = a.name || a.modelname || '';
          const bName = b.name || b.modelname || '';
          const aPop = popPrefix.test(aName) ? 0 : 1;
          const bPop = popPrefix.test(bName) ? 0 : 1;
          if (aPop !== bPop) return aPop - bPop;
          return aName.localeCompare(bName);
        });

        setSeriesData(combined.length > 0 ? combined : listO);
      } else {
        const payload = {
          getModelSeries2: {
            country: 'ZA',
            lang: 'en',
            linkingTargetType: appType,
            manuId: mfrId,
            includeAll: true,
          },
        };
        const res = await apiFunction(serviceJsonApi, [], payload, 'POST', false);
        const list = (
          res?.data?.array ||
          res?.getModelSeries2?.array ||
          res?.data ||
          []
        ).map((s) => normalizeSeriesItem(s, appType));
        setSeriesData(list);
      }
    } catch (err) {
      console.warn('Failed to load model series', err);
    } finally {
      setLoadingDropdown(false);
    }
  };

  // Fetch models/engines when a series is selected
  const fetchVehiclesForSeries = async (manu, series) => {
    if (!manu || !series) return;
    setLoadingVehicles(true);
    const mfrId = resolveManuId(manu);
    const seriesId = series.modelId || series.id;
    const seriesType =
      series.linkingTargetType ||
      applications.find((a) => a.id === selectedApp)?.type ||
      'P';

    let list = [];
    try {
      const payload = {
        getLinkageTargets: {
          linkageTargetCountry: 'ZA',
          lang: 'en',
          linkageTargetType: seriesType,
          mfrIds: [Number(mfrId)],
          vehicleModelSeriesIds: [Number(seriesId)],
          perPage: 100,
          page: 1,
        },
      };

      const res = await apiFunction(serviceJsonApi, [], payload, 'POST', false);
      list = res?.linkageTargets || res?.data?.array || res?.data || [];

      if (!list || list.length === 0) {
        const restRes = await apiFunction(
          `${vehiclesApi}?mfrId=${mfrId}&seriesId=${seriesId}&type=${seriesType}`,
          [],
          {},
          'GET',
          false
        );
        list = restRes?.data?.array || restRes?.data || [];
      }

      const formatted = (list || []).map((v) => {
        const title =
          v.description ||
          v.typeName ||
          v.vehicleSalesDescription ||
          v.modelName ||
          v.vehicleModelSeriesName ||
          (v.engines?.[0]?.code ? `Model ${v.engines[0].code}` : 'Standard Trim');
        return {
          ...v,
          id: v.linkageTargetId || v.carId || v.id,
          linkageTargetId: v.linkageTargetId || v.carId || v.id,
          linkageTargetType: v.linkageTargetType || seriesType,
          description: title,
          typeName: title,
          modelName: title,
        };
      });

      setVehiclesData(formatted);
    } catch (err) {
      console.warn('Failed to fetch models for series:', err);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const openPicker = (type) => {
    setModalType(type);
    setFilterQuery('');
    setModalVisible(true);
  };

  const handleSelectManufacturer = (item) => {
    const fixed = sanitizeBrand(item);
    setSelectedManufacturer(fixed);
    setSelectedSeries(null);
    setSelectedVehicle(null);
    setVehiclesData([]);
    setModalVisible(false);
    fetchSeriesForManufacturer(fixed);
  };

  const handleSelectPopularBrand = (item) => {
    const fixed = sanitizeBrand(item);
    setSelectedManufacturer(fixed);
    setSelectedSeries(null);
    setSelectedVehicle(null);
    setVehiclesData([]);
    fetchSeriesForManufacturer(fixed);
  };

  const handleSelectSeries = (item) => {
    setSelectedSeries(item);
    setSelectedVehicle(null);
    setVehiclesData([]);
    setModalVisible(false);
    fetchVehiclesForSeries(selectedManufacturer, item);
  };

  const handleSelectModel = (item) => {
    setSelectedVehicle(item);
    setModalVisible(false);
  };

  const handleProceedToVehicles = async () => {
    if (!selectedManufacturer || !selectedSeries) {
      Toast.show({
        type: 'error',
        text1: 'Selection Required',
        text2: 'Please choose both Manufacturer and Series.',
      });
      return;
    }

    const seriesType =
      selectedSeries?.linkingTargetType ||
      applications.find((a) => a.id === selectedApp)?.type ||
      'P';

    if (selectedVehicle) {
      navigation.navigate('VerifiedParts', {
        vehicle: selectedVehicle,
        selectedManufacturer,
        selectedSeries,
        appType: selectedVehicle.linkageTargetType || seriesType,
      });
      return;
    }

    // If no specific model selected, navigate to list with pre-fetched vehicles
    navigation.navigate('vehiclesListScreen', {
      selectedApp,
      appType: seriesType,
      selectedManufacturer,
      selectedSeries,
      vehiclesList: vehiclesData,
    });
  };

  const handlePartSearch = async (overrideQuery) => {
    const rawQuery = typeof overrideQuery === 'string' ? overrideQuery : partNumber;
    const trimmed = (rawQuery || '').trim();

    if (!trimmed) {
      Toast.show({
        type: 'error',
        text1: 'Part Number Required',
        text2: 'Please enter or tap an NGK part number below.',
      });
      return;
    }

    setPartSearching(true);

    try {
      // 1. Prioritize dedicated backend REST articlesByPartApi endpoint
      let results = [];
      try {
        const restRes = await apiFunction(
          `${articlesByPartApi}?searchQuery=${encodeURIComponent(trimmed)}&brand=ngk`,
          [],
          {},
          'GET',
          false
        );
        results = restRes?.articles || restRes?.data?.array || restRes?.data || [];
      } catch (e) {
        console.warn('REST articles/by-part attempt failed:', e);
      }

      // 2. Fallback to serviceJsonApi with searchType: 10 if needed
      if (!results || results.length === 0) {
        const payload = {
          getArticles: {
            articleCountry: 'ZA',
            searchQuery: trimmed,
            searchType: 10,
            dataSupplierIds: [15, 5414],
            lang: 'en',
            perPage: 30,
            page: 1,
            includeAll: true,
          },
        };
        const rawRes = await apiFunction(serviceJsonApi, [], payload, 'POST', false);
        results = rawRes?.articles || rawRes?.data?.array || rawRes?.data || [];
      }

      // Strict NGK brand isolation
      results = (results || []).filter((p) => {
        const b = (p.brandName || p.mfrName || p.brand || p.dataSupplierName || '').toUpperCase();
        return !b.includes('KYB');
      });

      setPartSearching(false);

      if (!results || results.length === 0) {
        Toast.show({
          type: 'info',
          text1: 'No Parts Found',
          text2: `No components matched "${trimmed}". Try searching by trade or stock number.`,
        });
        return;
      }

      // Record Search History if user logged in
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        apiFunction(
          addSearchHistoryApi,
          [],
          { userId, query: trimmed, resultsCount: results.length },
          'POST',
          false
        ).catch(() => {});
      }

      navigation.navigate('VerifiedParts', {
        articles: results,
        searchQuery: trimmed,
        directSearch: true,
      });
    } catch (err) {
      setPartSearching(false);
      Toast.show({
        type: 'error',
        text1: 'Search Failed',
        text2: 'Unable to reach parts database. Please try again.',
      });
    }
  };

  const getFilteredModalList = () => {
    let list = [];
    if (modalType === 'manufacturer') list = manufacturersData;
    else if (modalType === 'series') list = seriesData;
    else if (modalType === 'model') list = vehiclesData;

    if (!filterQuery.trim()) return list;
    const q = filterQuery.toLowerCase();
    return list.filter((item) => {
      const name =
        item.manuName ||
        item.modelname ||
        item.description ||
        item.typeName ||
        item.name ||
        '';
      const engineCode = item.engines?.[0]?.code || item.engineCode || '';
      return name.toLowerCase().includes(q) || engineCode.toLowerCase().includes(q);
    });
  };

  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={styles.safeArea}
    >
      <AppHeader
        title="Parts Finder"
        subtitle="Official Parts Catalog"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* 3-Step Journey Indicator */}
        <JourneyStepIndicator currentStep={1} />

        <View style={styles.container}>
        {/* Segmented Mode Tabs */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              searchMode === 'vehicle' && styles.segmentBtnActive,
            ]}
            onPress={() => setSearchMode('vehicle')}
            activeOpacity={0.8}
          >
            <Car
              size={16}
              color={searchMode === 'vehicle' ? COLORS.primary : COLORS.textTertiary}
            />
            <Text
              style={[
                styles.segmentText,
                searchMode === 'vehicle' && styles.segmentTextActive,
              ]}
            >
              By Vehicle
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentBtn,
              searchMode === 'part' && styles.segmentBtnActive,
            ]}
            onPress={() => setSearchMode('part')}
            activeOpacity={0.8}
          >
            <Search
              size={16}
              color={searchMode === 'part' ? COLORS.primary : COLORS.textTertiary}
            />
            <Text
              style={[
                styles.segmentText,
                searchMode === 'part' && styles.segmentTextActive,
              ]}
            >
              By Part #
            </Text>
          </TouchableOpacity>
        </View>

        {searchMode === 'vehicle' ? (
          <View style={styles.vehicleContainer}>
            <View style={styles.vehicleTopSection}>
              {/* Step 1: Vehicle Application Type Pills */}
              <Text style={styles.inputSectionLabel}>APPLICATION TYPE</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.appTypeScrollContent}
                style={styles.appTypeScrollView}
              >
                {applications.map((app) => {
                  const IconComponent = app.icon;
                  const isSelected = selectedApp === app.id;
                  return (
                    <TouchableOpacity
                      key={app.id}
                      style={[
                        styles.appTypePill,
                        isSelected && styles.appTypePillSelected,
                      ]}
                      onPress={() => {
                        if (selectedApp !== app.id) {
                          setSelectedApp(app.id);
                          setSelectedManufacturer(null);
                          setSelectedSeries(null);
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <IconComponent
                        size={16}
                        color={isSelected ? COLORS.white : COLORS.textSecondary}
                      />
                      <Text
                        style={[
                          styles.appTypePillText,
                          isSelected && styles.appTypePillTextSelected,
                        ]}
                        numberOfLines={1}
                      >
                        {app.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Popular Vehicle Brands Quick Select (6-9 Cards) */}
              {popularBrands.length > 0 && (
                <View style={styles.popularSection}>
                  <View style={styles.popularHeaderRow}>
                    <Text style={styles.inputSectionLabel}>
                      TOP 9 {selectedApp.toUpperCase()} BRANDS
                    </Text>
                  </View>
                  <View style={styles.brandsGrid}>
                    {popularBrands.slice(0, brandCount).map((b) => {
                      const isSelected =
                        (selectedManufacturer?.manuId || selectedManufacturer?.id) ===
                        (b.manuId || b.id);
                      return (
                        <BrandLogoCard
                          key={b.id || b.manuId}
                          item={b}
                          isSelected={isSelected}
                          onPress={handleSelectPopularBrand}
                        />
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Step 2: Make, Series & Model Selectors */}
              <Text style={[styles.inputSectionLabel, { marginTop: 12 }]}>
                VEHICLE SPECIFICATIONS
              </Text>

              <View style={styles.specsRow}>
                {/* 1. Make / Manufacturer Selector */}
                <TouchableOpacity
                  style={[styles.pickerField, styles.halfPicker]}
                  onPress={() => openPicker('manufacturer')}
                  activeOpacity={0.75}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pickerFieldLabel}>Make</Text>
                    <Text
                      style={[
                        styles.pickerFieldValue,
                        !selectedManufacturer && styles.pickerFieldPlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {selectedManufacturer?.manuName ||
                        selectedManufacturer?.name ||
                        'Select Make'}
                    </Text>
                  </View>
                  <ChevronDown size={14} color="#9CA3AF" />
                </TouchableOpacity>

                {/* 2. Series Selector */}
                <TouchableOpacity
                  style={[
                    styles.pickerField,
                    styles.halfPicker,
                    !selectedManufacturer && styles.pickerFieldDisabled,
                  ]}
                  onPress={() => selectedManufacturer && openPicker('series')}
                  disabled={!selectedManufacturer}
                  activeOpacity={0.75}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pickerFieldLabel}>Series</Text>
                    <Text
                      style={[
                        styles.pickerFieldValue,
                        !selectedSeries && styles.pickerFieldPlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {selectedSeries?.modelname ||
                        selectedSeries?.name ||
                        (selectedManufacturer ? 'Select Series' : 'Choose Make')}
                    </Text>
                  </View>
                  <ChevronDown size={14} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* 3. Model / Engine Selector (Row 2, full width) */}
              <TouchableOpacity
                style={[
                  styles.pickerField,
                  { marginTop: 8 },
                  (!selectedSeries || loadingVehicles) && styles.pickerFieldDisabled,
                ]}
                onPress={() => selectedSeries && openPicker('model')}
                disabled={!selectedSeries || loadingVehicles}
                activeOpacity={0.75}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.pickerFieldLabel}>Model / Engine</Text>
                  <Text
                    style={[
                      styles.pickerFieldValue,
                      !selectedVehicle && styles.pickerFieldPlaceholder,
                    ]}
                    numberOfLines={1}
                  >
                    {selectedVehicle
                      ? (selectedVehicle.description || selectedVehicle.typeName || selectedVehicle.modelName)
                      : (loadingVehicles
                          ? 'Loading Models & Engines...'
                          : (selectedSeries
                              ? (vehiclesData.length > 0 ? `Select Model (${vehiclesData.length} available)` : 'Select Model / Engine')
                              : 'Choose Series First'))}
                  </Text>
                </View>
                {loadingVehicles ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <ChevronDown size={14} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>

            {/* Bottom CTA Button pinned at the bottom */}
            <View style={styles.vehicleBottomSection}>
              <AppButton
                title={selectedVehicle ? "Search Parts for this Vehicle" : "View Matching Engines & Trims"}
                rightIcon={<ArrowRight size={16} color={COLORS.white} />}
                onPress={handleProceedToVehicles}
                disabled={!selectedManufacturer || !selectedSeries}
                loading={loadingVehicles}
                height={48}
                style={styles.proceedBtn}
              />
            </View>
          </View>
        ) : (
          <View style={styles.partSearchContainer}>
            <Text style={styles.inputSectionLabel}>DIRECT PART NUMBER LOOKUP</Text>
            <AppInput
              placeholder="e.g. BKR6E-11, ILKAR7C10, 4856"
              value={partNumber}
              onChangeText={setPartNumber}
              autoCapitalize="characters"
              leftIcon={<Search size={18} color="#9CA3AF" />}
              containerStyle={{ marginBottom: 10 }}
            />

            {/* Quick Part Suggestions Chips */}
            <View style={styles.quickSearchRow}>
              <Text style={styles.quickSearchLabel}>Popular:</Text>
              {['U5154', 'BKR6E-11', 'BKR6E', 'ILKAR7C10', '4856'].map((q) => (
                <TouchableOpacity
                  key={q}
                  style={styles.quickSearchChip}
                  onPress={() => {
                    setPartNumber(q);
                    handlePartSearch(q);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickSearchChipText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <AppButton
              title="Search NGK & OE Catalog"
              onPress={() => handlePartSearch()}
              loading={partSearching}
              style={styles.proceedBtn}
            />

            <View style={styles.infoHintCard}>
              <Sparkles size={18} color={COLORS.primary} />
              <Text style={styles.infoHintText}>
                Supports NGK Stock Numbers, Order Numbers, and OE Cross-Reference Part Numbers.
              </Text>
            </View>
          </View>
        )}
      </View>
      </KeyboardAvoidingView>

      {/* Modern Bottom Sheet Modal Picker */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
            {/* Top Drag Pill Handle */}
            <View style={styles.modalHandle} />

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>
                  {modalType === 'manufacturer'
                    ? 'Select Make'
                    : modalType === 'series'
                    ? 'Select Series'
                    : 'Select Model / Engine'}
                </Text>
                <Text style={styles.modalSubtitle} numberOfLines={1}>
                  {modalType === 'manufacturer'
                    ? 'Choose vehicle manufacturer'
                    : modalType === 'series'
                    ? (selectedManufacturer?.manuName || selectedManufacturer?.name || 'Choose series family')
                    : (selectedSeries?.modelname || selectedSeries?.name || 'Choose matching engine trim')}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseCircle}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={18} color="#4B5563" />
              </TouchableOpacity>
            </View>

            {/* Filter Search Input */}
            <View style={styles.modalSearchBox}>
              <Search size={16} color={COLORS.primary} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder={
                  modalType === 'manufacturer'
                    ? 'Search make (e.g. Toyota, BMW)...'
                    : modalType === 'series'
                    ? 'Search series (e.g. Corolla, Hilux)...'
                    : 'Search trim or engine (e.g. 2.0, N47)...'
                }
                placeholderTextColor="#9CA3AF"
                value={filterQuery}
                onChangeText={setFilterQuery}
                autoCapitalize="none"
              />
              {filterQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setFilterQuery('')}
                  style={styles.modalSearchClear}
                >
                  <X size={14} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>

            {/* List */}
            {loadingDropdown || (modalType === 'model' && loadingVehicles) ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator color={COLORS.primary} size="small" />
                <Text style={styles.modalLoadingText}>Loading automotive catalog...</Text>
              </View>
            ) : (
              <FlatList
                data={getFilteredModalList()}
                keyExtractor={(item, idx) =>
                  String(item.linkageTargetId || item.carId || item.manuId || item.modelId || idx)
                }
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 16 }}
                renderItem={({ item }) => {
                  if (modalType === 'model') {
                    const trimTitle =
                      (item.description && item.description.trim()) ||
                      (item.typeName && item.typeName.trim()) ||
                      (item.vehicleSalesDescription && item.vehicleSalesDescription.trim()) ||
                      (item.modelName && item.modelName.trim()) ||
                      (item.vehicleModelSeriesName && item.vehicleModelSeriesName.trim()) ||
                      (item.engines?.[0]?.code ? `Model ${item.engines[0].code}` : 'Standard Trim');

                    const kw = item.kiloWattsFrom || item.powerKwFrom || item.kw;
                    const hp = item.horsePowerFrom || item.powerHpFrom || item.hp;
                    const powerStr = kw && hp ? `${kw} kW / ${hp} HP` : hp ? `${hp} HP` : kw ? `${kw} kW` : null;
                    const begin = item.beginYearMonth || item.yearOfConstrFrom;
                    const end = item.endYearMonth || item.yearOfConstrTo || 'Present';
                    const yearStr = begin ? `${begin} - ${end}` : null;
                    const engineCode = item.engines?.[0]?.code || item.engineCode;
                    const isSelected =
                      selectedVehicle &&
                      (selectedVehicle.linkageTargetId || selectedVehicle.id) ===
                        (item.linkageTargetId || item.id);

                    return (
                      <TouchableOpacity
                        style={[
                          styles.modalRowItem,
                          isSelected && styles.modalRowItemSelected,
                        ]}
                        onPress={() => handleSelectModel(item)}
                        activeOpacity={0.7}
                      >
                        <View style={{ flex: 1, paddingRight: 8 }}>
                          <Text style={[styles.modalItemTitle, isSelected && styles.modalItemTitleSelected]}>
                            {trimTitle}
                          </Text>
                          <View style={styles.modalSpecsRow}>
                            {powerStr && (
                              <View style={styles.specPill}>
                                <Text style={styles.specPillText}>{powerStr}</Text>
                              </View>
                            )}
                            {yearStr && (
                              <View style={styles.specPill}>
                                <Text style={styles.specPillText}>{yearStr}</Text>
                              </View>
                            )}
                            {engineCode && (
                              <View style={styles.specPillEngine}>
                                <Text style={styles.specPillEngineText}>Engine: {engineCode}</Text>
                              </View>
                            )}
                          </View>
                        </View>
                        {isSelected ? (
                          <Check size={18} color={COLORS.primary} />
                        ) : (
                          <ChevronRight size={16} color="#9CA3AF" />
                        )}
                      </TouchableOpacity>
                    );
                  }

                  if (modalType === 'series') {
                    const label = item.modelname || item.name || '';
                    const isSelected =
                      selectedSeries &&
                      (selectedSeries.modelId || selectedSeries.id) ===
                        (item.modelId || item.id);

                    return (
                      <TouchableOpacity
                        style={[
                          styles.modalRowItem,
                          isSelected && styles.modalRowItemSelected,
                        ]}
                        onPress={() => handleSelectSeries(item)}
                        activeOpacity={0.7}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.modalItemTitle, isSelected && styles.modalItemTitleSelected]}>
                            {label}
                          </Text>
                          {selectedManufacturer?.manuName && (
                            <Text style={styles.modalItemSubtitle}>
                              {selectedManufacturer.manuName}
                            </Text>
                          )}
                        </View>
                        {isSelected ? (
                          <Check size={18} color={COLORS.primary} />
                        ) : (
                          <ChevronRight size={16} color="#9CA3AF" />
                        )}
                      </TouchableOpacity>
                    );
                  }

                  // Default: Manufacturer
                  const label = item.manuName || item.name || '';
                  const isSelected =
                    selectedManufacturer &&
                    (selectedManufacturer.manuId || selectedManufacturer.id) ===
                      (item.manuId || item.id);

                  return (
                    <TouchableOpacity
                      style={[
                        styles.modalRowItem,
                        isSelected && styles.modalRowItemSelected,
                      ]}
                      onPress={() => handleSelectManufacturer(item)}
                      activeOpacity={0.7}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.modalItemTitle, isSelected && styles.modalItemTitleSelected]}>
                          {label}
                        </Text>
                      </View>
                      {isSelected ? (
                        <Check size={18} color={COLORS.primary} />
                      ) : (
                        <ChevronRight size={16} color="#9CA3AF" />
                      )}
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <View style={styles.modalEmptyState}>
                    <Text style={styles.modalEmptyTitle}>
                      {filterQuery ? 'No matching results' : 'No items available'}
                    </Text>
                    <Text style={styles.modalEmptySubtitle}>
                      {filterQuery
                        ? `We couldn't find anything matching "${filterQuery}"`
                        : modalType === 'series'
                        ? 'No model series found for this manufacturer.'
                        : modalType === 'model'
                        ? 'No vehicle trims or engines found.'
                        : 'No records found.'}
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.border,
    borderRadius: 10,
    padding: 2,
    marginBottom: 8,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 34,
    borderRadius: RADIUS.sm,
  },
  segmentBtnActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.textTertiary,
  },
  segmentTextActive: {
    color: COLORS.textPrimary,
    fontWeight: FONTS.weight.bold,
  },
  scrollBody: {
    paddingBottom: 16,
  },
  vehicleContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  vehicleTopSection: {
    flex: 1,
  },
  vehicleBottomSection: {
    paddingTop: 8,
  },
  inputSectionLabel: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  appTypeScrollView: {
    marginBottom: 8,
    flexGrow: 0,
  },
  appTypeScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 12,
  },
  appTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  popularSection: {
    marginTop: 8,
    marginBottom: 8,
  },
  popularHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  popularHint: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: FONTS.weight.medium,
  },
  toggleText: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primary,
  },
  brandsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  appTypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  appTypePillSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  appTypePillText: {
    fontSize: 11.5,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textSecondary,
  },
  appTypePillTextSelected: {
    color: COLORS.white,
  },
  specsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  halfPicker: {
    flex: 1,
    height: 50,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 0,
  },
  pickerField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  pickerFieldDisabled: {
    backgroundColor: COLORS.surfaceSecondary,
    opacity: 0.7,
  },
  pickerFieldLabel: {
    fontSize: 10,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  pickerFieldValue: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
  pickerFieldPlaceholder: {
    color: COLORS.textMuted,
    fontWeight: FONTS.weight.medium,
  },
  proceedBtn: {
    marginTop: 4,
  },
  partSearchContainer: {
    flex: 1,
  },
  quickSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  quickSearchLabel: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textTertiary,
    marginRight: 2,
  },
  quickSearchChip: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: RADIUS.sm,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickSearchChipText: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.bold,
    color: COLORS.slate700,
  },
  infoHintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: 14,
    marginTop: 14,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  infoHintText: {
    flex: 1,
    fontSize: FONTS.size.xs,
    color: COLORS.textTertiary,
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '82%',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.borderDark,
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.textPrimary,
  },
  modalSubtitle: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.medium,
    color: COLORS.textTertiary,
    marginTop: 1,
  },
  modalCloseCircle: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
    gap: 10,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: FONTS.size.sm,
    color: COLORS.textPrimary,
    padding: 0,
  },
  modalSearchClear: {
    padding: 4,
  },
  modalLoading: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 10,
  },
  modalLoadingText: {
    fontSize: FONTS.size.sm,
    color: COLORS.textTertiary,
    fontWeight: FONTS.weight.medium,
  },
  modalRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceSecondary,
  },
  modalRowItemSelected: {
    backgroundColor: '#FFF5F5',
  },
  modalItemTitle: {
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.slate800,
  },
  modalItemTitleSelected: {
    color: COLORS.primary,
    fontWeight: FONTS.weight.bold,
  },
  modalItemSubtitle: {
    fontSize: FONTS.size.caption,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: FONTS.weight.medium,
  },
  modalSpecsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  specPill: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  specPillText: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.medium,
    color: COLORS.textSecondary,
  },
  specPillEngine: {
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  specPillEngineText: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.primary,
  },
  modalEmptyState: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalEmptyTitle: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.bold,
    color: COLORS.slate700,
    marginBottom: 6,
  },
  modalEmptySubtitle: {
    fontSize: FONTS.size.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default PartsFinderScreen;
