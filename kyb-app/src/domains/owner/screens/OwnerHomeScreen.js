import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../../utils/theme';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
Modal,
} from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Menu,
  Bell,
  Search,
  Car,
  ChevronRight,
  Plus,
  CheckCircle2,
  X,
  Layers,
} from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { getMyselfRedux } from '../../../redux/getData';
import LiveFeatureTicker from '../../../components/common/LiveFeatureTicker';
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
} from '../../../components/icons/HomeIcons';
import VehicleCardImage from '../../../components/vehicle/VehicleCardImage';

// Static Live Feature Ticker items (auto-cycles every 3.6s with spring-back animation)
const TICKER_ITEMS = [
  {
    id: 'oem_fit',
    IconComponent: TickerLiveRadarIcon,
    themeColor: COLORS.primary,
    badgeBg: '#FEE2E2',
    countHighlight: '100% Genuine',
    text: 'OEM shocks & struts',
    highlight: 'Live Fit',
    route: 'PartsFinder',
  },
  {
    id: 'tecdoc_catalog',
    IconComponent: TickerCatalogIcon,
    themeColor: COLORS.info,
    badgeBg: COLORS.infoLight,
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
    themeColor: COLORS.warning,
    badgeBg: COLORS.warningLight,
    countHighlight: 'Resellers Nearby',
    text: 'Verified KYB dealers',
    highlight: 'Dealers',
    route: 'DealerLocator',
  },
  {
    id: 'tech_quote',
    IconComponent: TickerQuoteIcon,
    themeColor: COLORS.primary,
    badgeBg: COLORS.primaryLight,
    countHighlight: 'Direct Support',
    text: 'Instant technical quotes',
    highlight: 'Quotes',
    route: 'MyEnquiries',
  },
];

const VehicleCarouselCard = memo(function VehicleCarouselCard({
  car,
  isActive,
  onSelectActive,
  onLookupParts,
}) {
  return (
    <View
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
              <CheckCircle2 size={13} color={COLORS.primary} strokeWidth={2.4} />
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
            onPress={() => onSelectActive(car)}
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
          onPress={() => onLookupParts(car)}
          activeOpacity={0.8}
        >
          <Search size={13} color={COLORS.white} strokeWidth={2.2} />
          <Text style={styles.activePartsCtaText}>View Compatible Parts</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.inactiveSetBtn}
          onPress={() => onSelectActive(car)}
          activeOpacity={0.75}
        >
          <Text style={styles.inactiveSetBtnText}>Tap to Set as Active</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const PickerVehicleItem = memo(function PickerVehicleItem({
  car,
  isCurrentActive,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={[
        styles.pickerVehicleItem,
        isCurrentActive && styles.pickerVehicleItemActive,
      ]}
      onPress={() => onPress(car)}
      activeOpacity={0.75}
    >
      <View style={styles.pickerItemLeft}>
        <View
          style={[
            styles.pickerVehicleThumbContainer,
            isCurrentActive && styles.pickerVehicleThumbContainerActive,
          ]}
        >
          <VehicleCardImage
            car={car}
            height={54}
            resizeMode="cover"
            compact={true}
            style={styles.pickerVehicleThumb}
          />
        </View>
        <View style={{ flex: 1, minWidth: 0, paddingRight: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.pickerItemTitle, { flexShrink: 1 }]} numberOfLines={1}>
              {car.make} {car.model}
            </Text>
            {isCurrentActive && (
              <View style={styles.pickerActiveTag}>
                <Text style={styles.pickerActiveTagText}>ACTIVE</Text>
              </View>
            )}
          </View>
          <Text style={styles.pickerItemSub} numberOfLines={1}>
            {car.year ? `${car.year} • ` : ''}{car.engine || 'Standard Trim'}
            {car.licensePlate ? ` • ${car.licensePlate}` : ''}
          </Text>
        </View>
      </View>
      <View style={styles.pickerItemArrow}>
        <ChevronRight size={18} color={isCurrentActive ? COLORS.primary : COLORS.slate400} strokeWidth={2.2} />
      </View>
    </TouchableOpacity>
  );
});

const OwnerHomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { myself } = useSelector((state) => state.getData);

  const [refreshing, setRefreshing] = useState(false);
  const [activeVehicleId, setActiveVehicleId] = useState(null);
  const [vehiclePickerModalVisible, setVehiclePickerModalVisible] = useState(false);

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

  const hasUnreadNotifications = useMemo(() => {
    if (!myself?.notifications || !Array.isArray(myself.notifications)) return false;
    return myself.notifications.some(
      (n) => n.isRead === false || n.is_read === false
    );
  }, [myself?.notifications]);

  // Resilient multi-level garage vehicle resolution (handles garage, cars, vehicleId, or watchlist vehicle summaries)
  const garageVehicles = useMemo(() => {
    if (myself?.garage?.length) return myself.garage;
    if (myself?.cars?.length) return myself.cars;
    if (myself?.vehicleId?.length) return myself.vehicleId;
    if (myself?.watchList?.length) {
      return myself.watchList
        .filter((item) => item.article_summary?.make || item.brand_name)
        .map((item) => ({
          id: item.id || item._id,
          make: item.article_summary?.make || item.brand_name,
          model: item.article_summary?.model || item.part_number,
          year: item.article_summary?.year || '',
          engine: item.article_summary?.engine || 'Standard',
          licensePlate: item.article_summary?.licensePlate || '',
          vin: item.article_summary?.vin || '',
          linkageTargetId: item.article_summary?.linkageTargetId || item.article_summary?.carId,
          isPrimary: false,
        }));
    }
    return [];
  }, [myself?.garage, myself?.cars, myself?.vehicleId, myself?.watchList]);

  // Restore saved active vehicle preference
  useEffect(() => {
    const restoreActive = async () => {
      try {
        const savedId = await AsyncStorage.getItem('active_vehicle_id');
        if (savedId) {
          setActiveVehicleId(savedId);
        }
      } catch (e) {
        // ignore
      }
    };
    restoreActive();
  }, []);

  // Sort vehicles so the selected / active vehicle is ALWAYS at position 0 (1st position)
  const sortedGarageVehicles = useMemo(() => {
    if (!garageVehicles || garageVehicles.length === 0) return [];

    let activeId = activeVehicleId;
    const hasActiveIdMatch = activeId && garageVehicles.some(
      v => String(v.id || v._id || v.linkageTargetId) === String(activeId)
    );

    if (!hasActiveIdMatch) {
      const primary = garageVehicles.find(v => v.isPrimary || v.is_primary);
      activeId = primary
        ? String(primary.id || primary._id || primary.linkageTargetId)
        : String(garageVehicles[0].id || garageVehicles[0]._id || garageVehicles[0].linkageTargetId);
    }

    const selectedCar = garageVehicles.find(
      v => String(v.id || v._id || v.linkageTargetId) === String(activeId)
    ) || garageVehicles[0];

    const otherCars = garageVehicles.filter(
      v => String(v.id || v._id || v.linkageTargetId) !== String(selectedCar.id || selectedCar._id || selectedCar.linkageTargetId)
    );

    return [selectedCar, ...otherCars];
  }, [garageVehicles, activeVehicleId]);

  const activeCar = sortedGarageVehicles[0] || null;

  const handleSelectActiveVehicle = useCallback((car) => {
    if (!car) return;
    const carId = String(car.id || car._id || car.linkageTargetId);
    setActiveVehicleId(carId);
    AsyncStorage.setItem('active_vehicle_id', carId).catch(() => {});
  }, []);

  // Smart Direct Parts Lookup:
  // If registered vehicle has a TecDoc linkageTargetId, navigate directly to VerifiedPartsScreen!
  // Otherwise, route to PartsFinder with preselected vehicle data.
  const handleLookupActiveCarParts = useCallback((car = activeCar) => {
    const targetCar = car || activeCar;
    if (!targetCar) {
      navigation.navigate('MyGarage');
      return;
    }
    const targetId =
      targetCar.linkageTargetId ||
      targetCar.linkage_target_id ||
      targetCar.raw_specs?.linkageTargetId ||
      targetCar.raw_specs?.carId;

    if (targetId) {
      navigation.navigate('VerifiedParts', {
        vehicle: {
          linkageTargetId: targetId,
          description: `${targetCar.make} ${targetCar.model} ${targetCar.year ? `(${targetCar.year})` : ''} ${targetCar.engine || ''}`.trim(),
          linkageTargetType: 'P',
          make: targetCar.make,
          model: targetCar.model,
          year: targetCar.year,
          engine: targetCar.engine || targetCar.engine_code,
          licensePlate: targetCar.licensePlate || targetCar.license_plate,
        },
        selectedManufacturer: { manuName: targetCar.make },
        selectedSeries: { modelname: targetCar.model },
        appType: 'P',
        source: 'home_card',
      });
    } else {
      navigation.navigate('PartsFinder', { preselectedVehicle: targetCar });
    }
  }, [activeCar, navigation]);

  // Upgraded Quick Tools with bespoke multi-layered 3D SVG icons and iPhone app layout
  const quickActions = [
    {
      id: 'parts',
      title: 'Find Parts',
      subtitle: 'Shock absorbers, struts & dampers',
      IconComponent: FindParts3DIcon,
      bg: COLORS.errorLight,
      accentColor: COLORS.primary,
      tag: '50k+ Parts',
      route: 'PartsFinder',
    },
    {
      id: 'garage',
      title: 'My Garage',
      subtitle: 'Saved cars & fitment guarantee',
      IconComponent: MyGarage3DIcon,
      bg: COLORS.infoLight,
      accentColor: COLORS.info,
      tag: garageVehicles.length > 0 ? `${garageVehicles.length} Saved` : 'Add Car',
      route: 'MyGarage',
    },
    {
      id: 'enquiry',
      title: 'Tech Enquiry',
      subtitle: 'Track tickets & expert advice',
      IconComponent: TechEnquiry3DIcon,
      bg: COLORS.primaryLight,
      accentColor: COLORS.primary,
      tag: 'Tickets',
      route: 'MyEnquiries',
    },
    {
      id: 'dealers',
      title: 'Dealer Locator',
      subtitle: 'Find authorized resellers nearby',
      IconComponent: DealerLocator3DIcon,
      bg: '#FFFBEB',
      accentColor: COLORS.warning,
      tag: 'Resellers',
      route: 'DealerLocator',
    },
  ];

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.rootContainer}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Solid Branded NGK Crimson Header: Spacious, Elegant, Non-Sticky */}
      <View style={[styles.solidHeader, { paddingTop: insets.top + 8 }]}>
        {/* Left: Navigation Menu Trigger + Dedicated Welcome Greeting */}
        <View style={styles.headerLeftCluster}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('CustomDrawer')}
            activeOpacity={0.75}
          >
            <Menu size={22} color={COLORS.white} strokeWidth={2.4} />
          </TouchableOpacity>

          <View style={styles.headerGreetingBlock}>
            <Text style={styles.headerGreetingHello}>HELLO,</Text>
            <Text style={styles.headerUserName} numberOfLines={1}>
              {myself?.name ? myself.name : 'Vehicle Owner'}
            </Text>
          </View>
        </View>

        {/* Right: Iconic Crisp KYB Brand Seal & Notification Bell */}
        <View style={styles.headerRightCluster}>
          <View style={styles.headerLogoPill}>
            <Image
              source={require('../../../assets/images/branding/kyb_logo.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>

          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.75}
          >
            <Bell size={20} color={COLORS.white} strokeWidth={2.4} />
            {hasUnreadNotifications && <View style={styles.badgeDot} />}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 84 + insets.bottom }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
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
            {sortedGarageVehicles.map((car, idx) => (
              <VehicleCarouselCard
                key={car.id || car._id || `car-${idx}`}
                car={car}
                isActive={idx === 0}
                onSelectActive={handleSelectActiveVehicle}
                onLookupParts={handleLookupActiveCarParts}
              />
            ))}

            {/* Add Another Vehicle Card */}
            <TouchableOpacity
              style={styles.addAnotherVehicleCard}
              onPress={() => navigation.navigate('MyGarage')}
              activeOpacity={0.75}
            >
              <View style={styles.addVehicleCircle}>
                <Plus size={22} color={COLORS.primary} strokeWidth={2.4} />
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
                <Plus size={20} color={COLORS.primary} strokeWidth={2.4} />
              </View>
              <View style={styles.emptyGarageTextContainer}>
                <Text style={styles.emptyGarageTitle}>Add your vehicle to garage</Text>
                <Text style={styles.emptyGarageSub}>
                  Get 100% verified shock absorbers & strut matches
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
                  if (action.id === 'parts') {
                    if (garageVehicles && garageVehicles.length > 1) {
                      setVehiclePickerModalVisible(true);
                    } else if (activeCar) {
                      handleLookupActiveCarParts(activeCar);
                    } else {
                      navigation.navigate('PartsFinder');
                    }
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

        {/* Genuine KYB Guarantee Compact Trust Bar */}
        <View style={styles.tipBanner}>
          <GenuineGuarantee3DIcon size={26} />
          <View style={styles.tipContent}>
            <View style={styles.tipHeaderRow}>
              <Text style={styles.tipTitle}>Genuine KYB Guarantee</Text>
              <View style={styles.tipBadge}>
                <Text style={styles.tipBadgeText}>100% OEM</Text>
              </View>
            </View>
            <Text style={styles.tipText} numberOfLines={1}>
              Always replace shock absorbers and struts in axle pairs for optimal handling.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Vehicle Selection Modal for Find Parts (Item 2) */}
      <Modal
        visible={vehiclePickerModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setVehiclePickerModalVisible(false)}
      >
        <View style={styles.pickerModalBackdrop}>
          <TouchableOpacity
            style={styles.pickerModalDismissArea}
            activeOpacity={1}
            onPress={() => setVehiclePickerModalVisible(false)}
          />
          <View style={styles.pickerModalSheet}>
            <View style={styles.pickerModalHandle} />
            <View style={styles.pickerModalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.pickerModalTitle}>Select Vehicle for Parts</Text>
                <Text style={styles.pickerModalSub}>
                  Choose which vehicle to match verified KYB components
                </Text>
              </View>
              <TouchableOpacity
                style={styles.pickerModalCloseBtn}
                onPress={() => setVehiclePickerModalVisible(false)}
                activeOpacity={0.7}
              >
                <X size={20} color="#64748B" strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.pickerModalList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
            >
              {sortedGarageVehicles.map((car, idx) => (
                <PickerVehicleItem
                  key={car.id || car._id || `pick-${idx}`}
                  car={car}
                  isCurrentActive={idx === 0}
                  onPress={(selectedCar) => {
                    handleSelectActiveVehicle(selectedCar);
                    setVehiclePickerModalVisible(false);
                    requestAnimationFrame(() => {
                      handleLookupActiveCarParts(selectedCar);
                    });
                  }}
                />
              ))}

              {/* Manual search option */}
              <TouchableOpacity
                style={styles.pickerManualSearchBtn}
                onPress={() => {
                  setVehiclePickerModalVisible(false);
                  navigation.navigate('PartsFinder');
                }}
                activeOpacity={0.75}
              >
                <View style={styles.pickerManualSearchIconBox}>
                  <Search size={18} color={COLORS.primary} strokeWidth={2.2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pickerManualSearchTitle}>Select Another Vehicle</Text>
                  <Text style={styles.pickerManualSearchSub}>Browse full catalog by Make & Model</Text>
                </View>
                <ChevronRight size={16} color={COLORS.slate400} strokeWidth={2} />
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  solidHeader: {
    backgroundColor: COLORS.primary,
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
    fontWeight: FONTS.weight.heavy,
    color: 'rgba(255, 255, 255, 0.82)',
    letterSpacing: 0.8,
  },
  headerUserName: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.black,
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  headerRightCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  headerLogoPill: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: RADIUS.md,
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
    borderRadius: RADIUS.xs,
    backgroundColor: '#FBBF24',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
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
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.slate900,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  manageGarageLink: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.primary,
  },
  vehicleScrollContainer: {
    paddingRight: 16,
    gap: 10,
    paddingBottom: 4,
  },
  vehicleCarouselCard: {
    width: 270,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  vehicleCarouselCardActive: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    shadowColor: COLORS.primary,
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
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    backgroundColor: COLORS.errorLight,
  },
  vehicleStatusInactiveBg: {
    backgroundColor: COLORS.slate100,
  },
  vehicleStatusActiveText: {
    fontSize: 9.5,
    fontWeight: FONTS.weight.black,
    color: COLORS.primary,
    letterSpacing: 0.3,
  },
  vehicleStatusInactiveText: {
    fontSize: 9.5,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.textSecondary,
    letterSpacing: 0.2,
  },
  switchActivePill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: COLORS.errorLight,
  },
  switchActivePillText: {
    fontSize: 10,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.primary,
  },
  vehicleCardTitle: {
    fontSize: 14.5,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.slate900,
    marginBottom: 2,
  },
  vehicleCardDetails: {
    fontSize: 11.5,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  activePartsCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.slate900,
    height: 35,
    borderRadius: 10,
  },
  activePartsCtaText: {
    color: COLORS.white,
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.heavy,
  },
  inactiveSetBtn: {
    height: 35,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveSetBtnText: {
    color: COLORS.slate900,
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
  },
  addAnotherVehicleCard: {
    width: 120,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1.5,
    borderColor: COLORS.borderDark,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addVehicleCircle: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  addVehicleTitle: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.slate900,
  },
  addVehicleSub: {
    fontSize: 10.5,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emptyGarageCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    backgroundColor: COLORS.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  emptyGarageTextContainer: {
    flex: 1,
  },
  emptyGarageTitle: {
    fontSize: 13.5,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.slate900,
  },
  emptyGarageSub: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.medium,
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingVertical: 9,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
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
    fontWeight: FONTS.weight.heavy,
    color: COLORS.slate900,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  iphoneCardSub: {
    fontSize: 10,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: 1,
  },
  iphoneCardMiniBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: COLORS.info,
    minWidth: 16,
    height: 16,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  iphoneCardMiniBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: FONTS.weight.black,
  },
  tipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderLeftWidth: 3.5,
    borderLeftColor: COLORS.primary,
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
    fontWeight: FONTS.weight.heavy,
    color: COLORS.slate900,
  },
  tipBadge: {
    backgroundColor: COLORS.errorLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 5,
  },
  tipBadgeText: {
    fontSize: 9,
    fontWeight: FONTS.weight.black,
    color: COLORS.primary,
  },
  tipText: {
    fontSize: 10.5,
    fontWeight: FONTS.weight.medium,
    color: '#334155',
    lineHeight: 14,
  },

  /* Vehicle Picker Modal Styles (Item 2) */
  pickerModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  pickerModalDismissArea: {
    flex: 1,
  },
  pickerModalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    maxHeight: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  pickerModalHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.borderDark,
    alignSelf: 'center',
    marginBottom: 16,
  },
  pickerModalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pickerModalTitle: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.slate900,
    letterSpacing: -0.3,
  },
  pickerModalSub: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  pickerModalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.slate100,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  pickerModalList: {
    maxHeight: 380,
  },
  pickerVehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  pickerVehicleItemActive: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FCA5A5',
  },
  pickerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  pickerVehicleThumbContainer: {
    width: 80,
    height: 54,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: COLORS.slate900,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pickerVehicleThumbContainerActive: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  pickerVehicleThumb: {
    width: 80,
    height: 54,
    borderRadius: 10,
  },
  pickerItemTitle: {
    fontSize: 14.5,
    fontWeight: FONTS.weight.bold,
    color: COLORS.slate900,
    flexShrink: 1,
  },
  pickerActiveTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: RADIUS.xs,
    flexShrink: 0,
  },
  pickerActiveTagText: {
    fontSize: 9,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  pickerItemSub: {
    fontSize: FONTS.size.xs,
    color: COLORS.textTertiary,
    marginTop: 2,
    fontWeight: FONTS.weight.medium,
  },
  pickerItemArrow: {
    paddingLeft: 4,
  },
  pickerManualSearchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  pickerManualSearchIconBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  pickerManualSearchTitle: {
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.bold,
    color: COLORS.slate900,
  },
  pickerManualSearchSub: {
    fontSize: 11.5,
    color: COLORS.textTertiary,
    marginTop: 1,
  },
});

export default OwnerHomeScreen;
