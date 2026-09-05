import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Menu,
  Bell,
  Search,
  Car,
  ChevronRight,
  Plus,
  CheckCircle2,
} from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { getMyselfRedux } from '../redux/getData';
import LiveFeatureTicker from '../components/common/LiveFeatureTicker';
import {
  FindParts3DIcon,
  MyGarage3DIcon,
  TechEnquiry3DIcon,
  DealerLocator3DIcon,
  GenuineGuarantee3DIcon,
  TickerLiveRadarIcon,
  TickerCatalogIcon,
  Ticker360Icon,
  TickerDealerIcon,
  TickerQuoteIcon,
} from '../components/icons/HomeIcons';
import VehicleCardImage from '../components/vehicle/VehicleCardImage';

// Static Live Feature Ticker items (auto-cycles every 3.6s with spring-back animation)
const TICKER_ITEMS = [
  {
    id: 'oem_fit',
    IconComponent: TickerLiveRadarIcon,
    themeColor: '#D0142C',
    badgeBg: '#FEE2E2',
    countHighlight: '100% Genuine',
    text: 'OEM spark plugs & coils',
    highlight: 'Live Fit',
    route: 'PartsFinder',
  },
  {
    id: 'tecdoc_catalog',
    IconComponent: TickerCatalogIcon,
    themeColor: '#2563EB',
    badgeBg: '#DBEAFE',
    countHighlight: '50,000+ Parts',
    text: 'TecDoc Pegasus catalog',
    highlight: 'Catalog',
    route: 'PartsFinder',
  },
  {
    id: '360_showroom',
    IconComponent: Ticker360Icon,
    themeColor: '#7C3AED',
    badgeBg: '#EDE9FE',
    countHighlight: '360° Showroom',
    text: 'Inspect pins & gap in 3D',
    highlight: '3D View',
    route: 'PartsFinder',
  },
  {
    id: 'dealers_nearby',
    IconComponent: TickerDealerIcon,
    themeColor: '#D97706',
    badgeBg: '#FEF3C7',
    countHighlight: 'Stockists Nearby',
    text: 'Verified NGK dealers',
    highlight: 'Dealers',
    route: 'DealerLocator',
  },
  {
    id: 'tech_quote',
    IconComponent: TickerQuoteIcon,
    themeColor: '#059669',
    badgeBg: '#D1FAE5',
    countHighlight: 'Direct Support',
    text: 'Instant technical quotes',
    highlight: 'Quotes',
    route: 'MyEnquiries',
  },
];

const OwnerHomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { myself } = useSelector((state) => state.getData);

  const [refreshing, setRefreshing] = useState(false);
  const [activeVehicleIndex, setActiveVehicleIndex] = useState(0);

  const fetchInitialData = useCallback(async () => {
    const userId = await AsyncStorage.getItem('userId');
    if (userId) {
      dispatch(getMyselfRedux(userId));
    }
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchInitialData();
    }, [fetchInitialData])
  );

  // Resilient multi-level garage vehicle resolution (handles garage, cars, vehicleId, or watchlist vehicle summaries)
  const garageVehicles = (myself?.garage?.length
    ? myself.garage
    : (myself?.cars?.length
      ? myself.cars
      : (myself?.vehicleId?.length
        ? myself.vehicleId
        : (myself?.watchList?.filter(item => item.article_summary?.make || item.brand_name)?.map(item => ({
            id: item.id || item._id,
            make: item.article_summary?.make || item.brand_name,
            model: item.article_summary?.model || item.part_number,
            year: item.article_summary?.year || '',
            engine: item.article_summary?.engine || 'Standard',
            licensePlate: item.article_summary?.licensePlate || '',
            vin: item.article_summary?.vin || '',
            linkageTargetId: item.article_summary?.linkageTargetId || item.article_summary?.carId,
            isPrimary: false,
          })) || []))));

  // Restore saved active vehicle preference
  useEffect(() => {
    const restoreActive = async () => {
      try {
        const savedId = await AsyncStorage.getItem('active_vehicle_id');
        if (savedId && garageVehicles.length > 0) {
          const foundIdx = garageVehicles.findIndex(
            (v, i) => (v.id || v._id || v.linkageTargetId || String(i)) === savedId
          );
          if (foundIdx !== -1) {
            setActiveVehicleIndex(foundIdx);
          }
        }
      } catch (e) {
        // ignore
      }
    };
    restoreActive();
  }, [garageVehicles.length]);

  const handleSelectActiveVehicle = async (index, car) => {
    setActiveVehicleIndex(index);
    try {
      const carId = car.id || car._id || car.linkageTargetId || String(index);
      await AsyncStorage.setItem('active_vehicle_id', carId);
    } catch (e) {
      // ignore
    }
  };

  const activeCar = garageVehicles[activeVehicleIndex] || garageVehicles[0] || null;

  // Smart Direct Parts Lookup:
  // If registered vehicle has a TecDoc linkageTargetId, navigate directly to VerifiedPartsScreen!
  // Otherwise, route to PartsFinder with preselected vehicle data.
  const handleLookupActiveCarParts = (car = activeCar) => {
    if (!car) {
      navigation.navigate('MyGarage');
      return;
    }
    const targetId =
      car.linkageTargetId ||
      car.linkage_target_id ||
      car.raw_specs?.linkageTargetId ||
      car.raw_specs?.carId;

    if (targetId) {
      navigation.navigate('VerifiedParts', {
        vehicle: {
          linkageTargetId: targetId,
          description: `${car.make} ${car.model} ${car.year ? `(${car.year})` : ''} ${car.engine || ''}`.trim(),
          linkageTargetType: 'P',
          make: car.make,
          model: car.model,
          year: car.year,
          engine: car.engine || car.engine_code,
          licensePlate: car.licensePlate || car.license_plate,
        },
        selectedManufacturer: { manuName: car.make },
        selectedSeries: { modelname: car.model },
        appType: 'P',
        source: 'home_card',
      });
    } else {
      navigation.navigate('PartsFinder', { preselectedVehicle: car });
    }
  };

  // Upgraded Quick Tools with bespoke multi-layered 3D SVG icons and iPhone app layout
  const quickActions = [
    {
      id: 'parts',
      title: 'Find Parts',
      subtitle: 'Spark plugs, sensors & ignition coils',
      IconComponent: FindParts3DIcon,
      bg: '#FEF2F2',
      accentColor: '#D0142C',
      tag: '50k+ Parts',
      route: 'PartsFinder',
    },
    {
      id: 'garage',
      title: 'My Garage',
      subtitle: 'Saved cars & fitment guarantee',
      IconComponent: MyGarage3DIcon,
      bg: '#EFF6FF',
      accentColor: '#2563EB',
      tag: garageVehicles.length > 0 ? `${garageVehicles.length} Saved` : 'Add Car',
      route: 'MyGarage',
    },
    {
      id: 'enquiry',
      title: 'Tech Enquiry',
      subtitle: 'Track tickets & expert advice',
      IconComponent: TechEnquiry3DIcon,
      bg: '#ECFDF5',
      accentColor: '#059669',
      tag: 'Tickets',
      route: 'MyEnquiries',
    },
    {
      id: 'dealers',
      title: 'Dealer Locator',
      subtitle: 'Find authorized stockists nearby',
      IconComponent: DealerLocator3DIcon,
      bg: '#FFFBEB',
      accentColor: '#D97706',
      tag: 'Stockists',
      route: 'DealerLocator',
    },
  ];

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.rootContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#D0142C" />

      {/* Solid Branded NGK Crimson Header: Spacious, Elegant, Non-Sticky */}
      <View style={[styles.solidHeader, { paddingTop: insets.top + 8 }]}>
        {/* Left: Navigation Menu Trigger + Dedicated Welcome Greeting */}
        <View style={styles.headerLeftCluster}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('CustomDrawer')}
            activeOpacity={0.75}
          >
            <Menu size={22} color="#FFFFFF" strokeWidth={2.4} />
          </TouchableOpacity>

          <View style={styles.headerGreetingBlock}>
            <Text style={styles.headerGreetingHello}>HELLO,</Text>
            <Text style={styles.headerUserName} numberOfLines={1}>
              {myself?.name ? myself.name : 'Vehicle Owner'}
            </Text>
          </View>
        </View>

        {/* Right: Iconic Crisp NGK Brand Seal & Notification Bell */}
        <View style={styles.headerRightCluster}>
          <View style={styles.headerLogoPill}>
            <Image
              source={require('../assets/images/ngk_emblem_clean.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>

          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.75}
          >
            <Bell size={20} color="#FFFFFF" strokeWidth={2.4} />
            <View style={styles.badgeDot} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#D0142C']}
            tintColor="#D0142C"
          />
        }
      >
        {/* Animated Live Feature Ticker */}
        <LiveFeatureTicker
          items={TICKER_ITEMS}
          onItemPress={(item) => {
            if (item.route) navigation.navigate(item.route);
          }}
        />

        {/* In-Place Vehicle Switching Carousel Header (Item 7) */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>My Vehicles</Text>
            <Text style={styles.sectionSubtitle}>Swipe to switch active fitment</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('MyGarage')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.manageGarageLink}>
              {garageVehicles.length > 0 ? 'Manage Garage' : '+ Add Car'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal Vehicle Carousel for In-Place Switching (Item 7) */}
        {garageVehicles.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.vehicleScrollContainer}
            decelerationRate="fast"
            snapToInterval={292}
          >
            {garageVehicles.map((car, idx) => {
              const isActive = idx === activeVehicleIndex;
              return (
                <View
                  key={car.id || car._id || `car-${idx}`}
                  style={[
                    styles.vehicleCarouselCard,
                    isActive && styles.vehicleCarouselCardActive,
                  ]}
                >
                  <View style={styles.vehicleCardTopRow}>
                    <View
                      style={[
                        styles.vehicleStatusBadge,
                        isActive ? styles.vehicleStatusActiveBg : styles.vehicleStatusInactiveBg,
                      ]}
                    >
                      {isActive ? (
                        <>
                          <CheckCircle2 size={13} color="#D0142C" strokeWidth={2.4} />
                          <Text style={styles.vehicleStatusActiveText}>ACTIVE VEHICLE</Text>
                        </>
                      ) : (
                        <>
                          <Car size={13} color="#475569" strokeWidth={2.2} />
                          <Text style={styles.vehicleStatusInactiveText}>IN GARAGE</Text>
                        </>
                      )}
                    </View>

                    {!isActive && (
                      <TouchableOpacity
                        style={styles.switchActivePill}
                        onPress={() => handleSelectActiveVehicle(idx, car)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.switchActivePillText}>Select Active</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Dynamic Authentic Vehicle Photo */}
                  <VehicleCardImage
                    car={car}
                    height={120}
                    resizeMode="cover"
                    style={styles.vehicleCardImageWrapper}
                  />

                  <Text style={styles.vehicleCardTitle} numberOfLines={1}>
                    {car.make} {car.model}
                  </Text>
                  <Text style={styles.vehicleCardDetails} numberOfLines={1}>
                    {car.year ? `${car.year} • ` : ''}{car.engine || 'Standard Trim'}
                    {car.licensePlate ? ` • ${car.licensePlate}` : ''}
                  </Text>

                  {isActive ? (
                    <TouchableOpacity
                      style={styles.activePartsCtaBtn}
                      onPress={() => handleLookupActiveCarParts(car)}
                      activeOpacity={0.8}
                    >
                      <Search size={13} color="#FFFFFF" strokeWidth={2.2} />
                      <Text style={styles.activePartsCtaText}>View Compatible Parts</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.inactiveSetBtn}
                      onPress={() => handleSelectActiveVehicle(idx, car)}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.inactiveSetBtnText}>Tap to Set as Active</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}

            {/* Add Another Vehicle Card */}
            <TouchableOpacity
              style={styles.addAnotherVehicleCard}
              onPress={() => navigation.navigate('MyGarage')}
              activeOpacity={0.75}
            >
              <View style={styles.addVehicleCircle}>
                <Plus size={22} color="#D0142C" strokeWidth={2.4} />
              </View>
              <Text style={styles.addVehicleTitle}>Add Vehicle</Text>
              <Text style={styles.addVehicleSub}>Expand garage</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <View style={styles.emptyGarageCard}>
            <TouchableOpacity
              style={styles.emptyGaragePrompt}
              onPress={() => navigation.navigate('MyGarage')}
              activeOpacity={0.7}
            >
              <View style={styles.addCarCircle}>
                <Plus size={20} color="#D0142C" strokeWidth={2.4} />
              </View>
              <View style={styles.emptyGarageTextContainer}>
                <Text style={styles.emptyGarageTitle}>Add your vehicle to garage</Text>
                <Text style={styles.emptyGarageSub}>
                  Get 100% verified spark plugs & sensor matches
                </Text>
              </View>
              <ChevronRight size={18} color="#0F172A" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
        )}

        {/* 2x2 iPhone-Style Center-Aligned Quick Tool Cards */}
        <View style={[styles.sectionHeader, { marginTop: 10 }]}>
          <View>
            <Text style={styles.sectionTitle}>Quick Tools</Text>
            <Text style={styles.sectionSubtitle}>OEM Verified Services</Text>
          </View>
        </View>

        <View style={styles.iphoneGridContainer}>
          {quickActions.map((action) => {
            const IconCmp = action.IconComponent;
            return (
              <TouchableOpacity
                key={action.id}
                style={styles.iphoneCard}
                onPress={() => {
                  if (action.id === 'parts' && activeCar) {
                    handleLookupActiveCarParts(activeCar);
                  } else {
                    navigation.navigate(action.route);
                  }
                }}
                activeOpacity={0.78}
              >
                {/* Big Center-Aligned Icon Squircle */}
                <View
                  style={[
                    styles.iphoneIconSquircle,
                    { backgroundColor: action.bg },
                  ]}
                >
                  <IconCmp size={30} />
                  {action.id === 'garage' && garageVehicles.length > 0 ? (
                    <View style={styles.iphoneCardMiniBadge}>
                      <Text style={styles.iphoneCardMiniBadgeText}>
                        {garageVehicles.length}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Center-Aligned Typography */}
                <Text style={styles.iphoneCardTitle} numberOfLines={1}>
                  {action.title}
                </Text>
                <Text style={styles.iphoneCardSub} numberOfLines={1}>
                  {action.tag || action.subtitle}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Genuine NGK Guarantee Compact Trust Bar */}
        <View style={styles.tipBanner}>
          <GenuineGuarantee3DIcon size={26} />
          <View style={styles.tipContent}>
            <View style={styles.tipHeaderRow}>
              <Text style={styles.tipTitle}>Genuine NGK Guarantee</Text>
              <View style={styles.tipBadge}>
                <Text style={styles.tipBadgeText}>100% OEM</Text>
              </View>
            </View>
            <Text style={styles.tipText} numberOfLines={1}>
              Always verify part numbers and electrode gap before installation.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  solidHeader: {
    backgroundColor: '#D0142C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#A50E26',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerLeftCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  headerGreetingBlock: {
    justifyContent: 'center',
    flexShrink: 1,
  },
  headerGreetingHello: {
    fontSize: 9.5,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.82)',
    letterSpacing: 0.8,
  },
  headerUserName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerRightCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  headerLogoPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 3,
    elevation: 3,
  },
  headerLogo: {
    width: 30,
    height: 18,
  },
  badgeDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FBBF24',
    borderWidth: 1.5,
    borderColor: '#D0142C',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 96,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginTop: 1,
  },
  manageGarageLink: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D0142C',
  },
  vehicleScrollContainer: {
    paddingRight: 16,
    gap: 10,
    paddingBottom: 4,
  },
  vehicleCarouselCard: {
    width: 270,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  vehicleCarouselCardActive: {
    borderColor: '#D0142C',
    borderWidth: 2,
    shadowColor: '#D0142C',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  vehicleCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  vehicleCardImageWrapper: {
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  vehicleStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
  },
  vehicleStatusActiveBg: {
    backgroundColor: '#FEF2F2',
  },
  vehicleStatusInactiveBg: {
    backgroundColor: '#F1F5F9',
  },
  vehicleStatusActiveText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#D0142C',
    letterSpacing: 0.3,
  },
  vehicleStatusInactiveText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.2,
  },
  switchActivePill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: '#FEF2F2',
  },
  switchActivePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D0142C',
  },
  vehicleCardTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  vehicleCardDetails: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  activePartsCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    height: 35,
    borderRadius: 10,
  },
  activePartsCtaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  inactiveSetBtn: {
    height: 35,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveSetBtnText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  addAnotherVehicleCard: {
    width: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addVehicleCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  addVehicleTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  addVehicleSub: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
  },
  emptyGarageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  emptyGaragePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  addCarCircle: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  emptyGarageTextContainer: {
    flex: 1,
  },
  emptyGarageTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyGarageSub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#475569',
    marginTop: 2,
  },
  iphoneGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  iphoneCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 9,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
    position: 'relative',
  },
  iphoneIconSquircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    position: 'relative',
  },
  iphoneCardTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  iphoneCardSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    marginTop: 1,
  },
  iphoneCardMiniBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#2563EB',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  iphoneCardMiniBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  tipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderLeftWidth: 3.5,
    borderLeftColor: '#D0142C',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 6,
  },
  tipContent: {
    flex: 1,
    marginLeft: 10,
  },
  tipHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  tipTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  tipBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 5,
  },
  tipBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#D0142C',
  },
  tipText: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#334155',
    lineHeight: 14,
  },
});

export default OwnerHomeScreen;
