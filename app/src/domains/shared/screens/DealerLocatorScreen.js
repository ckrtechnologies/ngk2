import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../../utils/theme';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Linking,
  ActivityIndicator,
Platform,
  PermissionsAndroid,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MapPin,
  Phone,
  Search,
  Store,
  MessageSquare,
  X,
  Navigation as NavigationIcon,
  ShieldCheck,
  Building2,
  Locate,
  SlidersHorizontal,
} from 'lucide-react-native';
import Geolocation from '@react-native-community/geolocation';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { apiFunction } from '../../../apis/apiFunction';
import { dealersApi } from '../../../apis/api';
import { getDealersRedux } from '../../../redux/getData';
import AppHeader from '../../../components/common/AppHeader';
import DealerFilterModal, {
  DEFAULT_FILTERS,
} from '../../../components/common/DealerFilterModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const DealerLocatorScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const { dealers: apiDealersData, myself } = useSelector((state) => state.getData);

  const [storedUserId, setStoredUserId] = useState(null);
  const [storedUserEmail, setStoredUserEmail] = useState(null);

  useEffect(() => {
    const fetchStoredAuth = async () => {
      try {
        const uId = await AsyncStorage.getItem('userId');
        const uEmail = await AsyncStorage.getItem('email');
        if (uId) setStoredUserId(uId);
        if (uEmail) setStoredUserEmail(uEmail.toLowerCase().trim());
      } catch (e) {
        // silent fallback
      }
    };
    fetchStoredAuth();
  }, [myself]);

  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locating, setLocating] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter Modal & Filter State
  const [modalVisible, setModalVisible] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // Keep a ref to apiDealersData so the fallback in fetchDealers can read the
  // latest Redux value without making apiDealersData a dependency (which would
  // rebuild fetchDealers → acquireGPS → trigger the mount effect repeatedly).
  const apiDealersDataRef = useRef(apiDealersData);
  useEffect(() => { apiDealersDataRef.current = apiDealersData; }, [apiDealersData]);

  const fetchDealers = useCallback(
    async (coords = null) => {
      try {
        const rad = coords?.radius || filters.radius || 50;
        const queryParams =
          coords?.userLat && coords?.userLon
            ? {
                userLat: coords.userLat,
                userLon: coords.userLon,
                radius: rad,
              }
            : {};

        const res = await apiFunction(dealersApi, [], queryParams, 'GET', false);
        const list =
          res?.dealers ||
          res?.data?.array ||
          (Array.isArray(res?.data) ? res.data : []) ||
          [];
        setDealers(list);
        dispatch(getDealersRedux(queryParams));
      } catch (err) {
        console.warn('Failed to load dealers:', err);
        setDealers([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLocating(false);
      }
    },
    [dispatch, filters.radius]
  );

  const acquireGPS = useCallback(async () => {
    setLocating(true);
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'NGK Location Access',
            message:
              'Allow NGK to discover verified stockists and dealers near your current location.',
            buttonPositive: 'Allow',
            buttonNegative: 'Cancel',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setLocating(false);
          fetchDealers(null);
          return;
        }
      }

      Geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            userLat: pos.coords.latitude,
            userLon: pos.coords.longitude,
          };
          setUserCoords(coords);
          fetchDealers(coords);
        },
        (err) => {
          console.warn('Geolocation error:', err.message);
          setLocating(false);
          fetchDealers(null);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (err) {
      console.warn('Failed to acquire location:', err);
      setLocating(false);
      fetchDealers(null);
    }
  }, [fetchDealers]);

  // Keep a stable ref to acquireGPS so the mount effect below can call the
  // latest version without listing it as a dependency (which would re-fire
  // the effect every time fetchDealers rebuilds due to filter/Redux changes).
  const acquireGPSRef = useRef(acquireGPS);
  useEffect(() => { acquireGPSRef.current = acquireGPS; }, [acquireGPS]);

  // Always re-fetch fresh real data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      acquireGPS();
    }, [acquireGPS])
  );

  const onRefresh = () => {
    setRefreshing(true);
    if (userCoords) {
      fetchDealers(userCoords);
    } else {
      acquireGPS();
    }
  };

  // Compute how many non-default filter settings are active
  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (filters.radius !== 50) c++;
    if (filters.role !== 'all') c++;
    if (filters.sortBy !== 'nearest') c++;
    return c;
  }, [filters]);

  // Apply complete set of client & server filter rules
  const filteredDealers = useMemo(() => {
    let list = dealers.filter((d) => {
      // 1. Role filter
      if (filters.role === 'distributor' && d.role !== 'distributor') return false;
      if (filters.role === 'reseller' && d.role !== 'reseller') return false;

      // 2. Distance radius filter
      if (
        filters.radius !== undefined &&
        filters.radius !== null &&
        d.distanceKm !== undefined &&
        d.distanceKm !== null &&
        d.distanceKm !== 999999
      ) {
        if (d.distanceKm > filters.radius) {
          return false;
        }
      }

      // 3. Text search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const name = (
          d.name ||
          d.dealer_name ||
          d.companyName ||
          ''
        ).toLowerCase();
        const city = (d.city || '').toLowerCase();
        const province = (d.province || '').toLowerCase();
        const address = (d.address || d.streetAddress || '').toLowerCase();
        if (
          !name.includes(query) &&
          !city.includes(query) &&
          !province.includes(query) &&
          !address.includes(query)
        ) {
          return false;
        }
      }

      return true;
    });

    // 6. Sort Order
    if (filters.sortBy === 'alpha') {
      list.sort((a, b) => {
        const nameA = a.name || a.companyName || '';
        const nameB = b.name || b.companyName || '';
        return nameA.localeCompare(nameB);
      });
    } else {
      // Default: nearest first
      list.sort((a, b) => {
        const distA =
          a.distanceKm !== undefined && a.distanceKm !== null
            ? a.distanceKm
            : 999999;
        const distB =
          b.distanceKm !== undefined && b.distanceKm !== null
            ? b.distanceKm
            : 999999;
        return distA - distB;
      });
    }

    return list;
  }, [dealers, searchQuery, filters]);

  const handleCall = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`).catch(() => {});
    }
  };

  const handleWhatsApp = (phone) => {
    if (phone) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      Linking.openURL(`https://wa.me/${cleanPhone}`).catch(() => {});
    }
  };

  const handleOpenMap = (dealer) => {
    const query = encodeURIComponent(
      `${dealer.name || ''}, ${dealer.address || dealer.streetAddress || ''}, ${
        dealer.city || ''
      }`
    );
    Linking.openURL(`https://maps.google.com/?q=${query}`).catch(() => {});
  };

  const isSelf = useCallback(
    (dealer) => {
      if (!dealer) return false;
      const currentUid = String(myself?.id || storedUserId || myself?.userId || '').trim().toLowerCase();
      const currentEmail = String(myself?.email || storedUserEmail || '').trim().toLowerCase();
      const currentComp = String(
        myself?.companyName || myself?.company_name || myself?.businessName || myself?.name || ''
      ).trim().toLowerCase();

      const dId = String(dealer.id || dealer.dealerId || dealer._id || '').trim().toLowerCase();
      const dUserId = String(dealer.userId || dealer.user_id || '').trim().toLowerCase();
      const dEmail = String(dealer.email || '').trim().toLowerCase();
      const dComp = String(dealer.name || dealer.dealer_name || dealer.companyName || '').trim().toLowerCase();

      if (currentUid && (dId === currentUid || dUserId === currentUid)) return true;
      if (currentEmail && dEmail && dEmail === currentEmail) return true;
      if (currentComp && currentComp.length > 2 && dComp && dComp === currentComp) return true;

      return false;
    },
    [myself, storedUserId, storedUserEmail]
  );

  const handleEnquire = (dealer) => {
    if (isSelf(dealer)) {
      Toast.show({
        type: 'info',
        text1: 'Self-Enquiry Restricted',
        text2: 'You cannot send a stock or technical enquiry to your own business.',
      });
      return;
    }
    navigation.navigate('TechnicalEnquiry', {
      dealerId: dealer.id || dealer.dealerId,
      dealerName: dealer.name || dealer.companyName,
    });
  };

  // Compute dynamic counts based on active search query & radius filter (Item 8)
  const counts = useMemo(() => {
    const baseList = dealers.filter((d) => {
      // 1. Distance radius filter
      if (
        filters.radius !== undefined &&
        filters.radius !== null &&
        d.distanceKm !== undefined &&
        d.distanceKm !== null &&
        d.distanceKm !== 999999
      ) {
        if (d.distanceKm > filters.radius) {
          return false;
        }
      }

      // 2. Text search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const name = (
          d.name ||
          d.dealer_name ||
          d.companyName ||
          ''
        ).toLowerCase();
        const city = (d.city || '').toLowerCase();
        const province = (d.province || '').toLowerCase();
        const address = (d.address || d.streetAddress || '').toLowerCase();
        if (
          !name.includes(query) &&
          !city.includes(query) &&
          !province.includes(query) &&
          !address.includes(query)
        ) {
          return false;
        }
      }

      return true;
    });

    return {
      all: baseList.length,
      distributors: baseList.filter((d) => d.role === 'distributor').length,
      resellers: baseList.filter((d) => d.role === 'reseller').length,
    };
  }, [dealers, searchQuery, filters.radius]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={styles.safeArea}
    >
      <AppHeader
        title="Authorized Dealers"
        subtitle={`${filteredDealers.length} Official Resellers & Hubs`}
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
        {/* Search Bar + Filter Modal Button Row */}
        <View style={styles.searchBarRow}>
          <View style={styles.searchBar}>
            <Search size={16} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by city, province, or dealer..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Modal Trigger Button */}
          <TouchableOpacity
            style={[
              styles.filterTriggerBtn,
              activeFilterCount > 0 && styles.filterTriggerBtnActive,
            ]}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <SlidersHorizontal
              size={18}
              color={activeFilterCount > 0 ? COLORS.white : COLORS.slate800}
            />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadgeCircle}>
                <Text style={styles.filterBadgeCircleText}>
                  {activeFilterCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Location Status Bar */}
        <View style={styles.locationBar}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              flex: 1,
            }}
          >
            <Locate
              size={14}
              color={
                locating
                  ? COLORS.textMuted
                  : userCoords
                  ? COLORS.success
                  : COLORS.textMuted
              }
            />
            <Text style={styles.locationBarText} numberOfLines={1}>
              {locating
                ? 'Acquiring mobile GPS...'
                : userCoords
                ? `Mobile GPS • Within ${filters.radius}km`
                : 'GPS inactive • Showing national directory'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <TouchableOpacity
              onPress={acquireGPS}
              style={styles.locateBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.locateBtnText}>
                {userCoords ? 'Refresh' : 'Enable GPS'}
              </Text>
            </TouchableOpacity>
          </View>
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
                    onPress={() =>
                      setFilters((prev) => ({ ...prev, radius: 50 }))
                    }
                  >
                    <X size={11} color={COLORS.primary} strokeWidth={2.4} />
                  </TouchableOpacity>
                </View>
              )}

              {filters.role !== 'all' && (
                <View style={styles.activeChipPill}>
                  <Text style={styles.activeChipText}>
                    {filters.role === 'distributor'
                      ? 'Distributors'
                      : 'Resellers'}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      setFilters((prev) => ({ ...prev, role: 'all' }))
                    }
                  >
                    <X size={11} color={COLORS.primary} strokeWidth={2.4} />
                  </TouchableOpacity>
                </View>
              )}

              {filters.sortBy === 'alpha' && (
                <View style={styles.activeChipPill}>
                  <Text style={styles.activeChipText}>A-Z Name</Text>
                  <TouchableOpacity
                    onPress={() =>
                      setFilters((prev) => ({ ...prev, sortBy: 'nearest' }))
                    }
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

        {/* Quick Filter Pills: All | Distributors | Resellers */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              filters.role === 'all' && styles.filterPillActive,
            ]}
            onPress={() => setFilters((prev) => ({ ...prev, role: 'all' }))}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterPillText,
                filters.role === 'all' && styles.filterPillTextActive,
              ]}
            >
              All ({counts.all})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              filters.role === 'distributor' && styles.filterPillActive,
            ]}
            onPress={() =>
              setFilters((prev) => ({ ...prev, role: 'distributor' }))
            }
            activeOpacity={0.7}
          >
            <Building2
              size={12}
              color={filters.role === 'distributor' ? COLORS.white : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.filterPillText,
                filters.role === 'distributor' && styles.filterPillTextActive,
              ]}
            >
              Distributors ({counts.distributors})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              filters.role === 'reseller' && styles.filterPillActive,
            ]}
            onPress={() =>
              setFilters((prev) => ({ ...prev, role: 'reseller' }))
            }
            activeOpacity={0.7}
          >
            <Store
              size={12}
              color={filters.role === 'reseller' ? COLORS.white : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.filterPillText,
                filters.role === 'reseller' && styles.filterPillTextActive,
              ]}
            >
              Resellers ({counts.resellers})
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>
              Loading authorized resellers...
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredDealers}
            keyExtractor={(item, index) =>
              String(item.id || item.dealerId || index)
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            renderItem={({ item }) => {
              const isDistributor = item.role === 'distributor';
              const name =
                item.name ||
                item.companyName ||
                item.dealer_name ||
                'Authorized Reseller';
              const address = item.address || item.streetAddress;
              const cityProvince =
                [item.city, item.province].filter(Boolean).join(' • ') ||
                'South Africa';

              return (
                <View style={styles.dealerCard}>
                  {/* Top Row: Name & Role Badge */}
                  <View style={styles.cardHeader}>
                    <View style={styles.dealerIconBox}>
                      {isDistributor ? (
                        <Building2 size={18} color={COLORS.primary} />
                      ) : (
                        <Store size={18} color={COLORS.primary} />
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={styles.titleBadgeRow}>
                        <Text style={styles.dealerName} numberOfLines={1}>
                          {name}
                        </Text>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          {item.distance && item.distance !== 'N/A' && (
                            <View style={styles.distanceBadge}>
                              <NavigationIcon size={9} color={COLORS.primary} />
                              <Text style={styles.distanceBadgeText}>
                                {item.distance}
                              </Text>
                            </View>
                          )}
                          <View
                            style={[
                              styles.roleBadge,
                              isDistributor
                                ? styles.distributorBadge
                                : styles.resellerBadge,
                            ]}
                          >
                            <ShieldCheck
                              size={10}
                              color={isDistributor ? '#1D4ED8' : '#047857'}
                            />
                            <Text
                              style={[
                                styles.roleBadgeText,
                                isDistributor
                                  ? styles.distributorBadgeText
                                  : styles.resellerBadgeText,
                              ]}
                            >
                              {isDistributor ? 'DISTRIBUTOR' : 'RESELLER'}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <Text style={styles.dealerCity}>{cityProvince}</Text>
                    </View>
                  </View>

                  {/* Address */}
                  {address ? (
                    <View style={styles.addressRow}>
                      <MapPin
                        size={13}
                        color="#6B7280"
                        style={{ marginTop: 2 }}
                      />
                      <Text style={styles.addressText} numberOfLines={2}>
                        {address}
                      </Text>
                    </View>
                  ) : null}

                  {/* Actions Row */}
                  <View style={styles.cardActions}>
                    {item.phone ? (
                      <TouchableOpacity
                        style={styles.actionBtnCall}
                        onPress={() => handleCall(item.phone)}
                        activeOpacity={0.7}
                      >
                        <Phone size={13} color="#059669" />
                        <Text style={styles.actionTextCall}>Call</Text>
                      </TouchableOpacity>
                    ) : null}

                    {item.phone ? (
                      <TouchableOpacity
                        style={styles.actionBtnWhatsApp}
                        onPress={() => handleWhatsApp(item.phone)}
                        activeOpacity={0.7}
                      >
                        <MessageSquare size={13} color="#047857" />
                        <Text style={styles.actionTextWhatsApp}>WhatsApp</Text>
                      </TouchableOpacity>
                    ) : null}

                    <TouchableOpacity
                      style={styles.actionBtnMap}
                      onPress={() => handleOpenMap(item)}
                      activeOpacity={0.7}
                    >
                      <NavigationIcon size={13} color="#2563EB" />
                      <Text style={styles.actionTextMap}>Directions</Text>
                    </TouchableOpacity>

                    {isSelf(item) ? (
                      <View style={styles.selfBadge}>
                        <ShieldCheck size={12} color="#059669" />
                        <Text style={styles.selfBadgeText}>Your Business</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.actionBtnEnquire}
                        onPress={() => handleEnquire(item)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.actionTextEnquire}>Enquire</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Store size={40} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>
                  No Resellers Within Radius
                </Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery
                    ? `No dealers match "${searchQuery}". Try adjusting your filters or radius.`
                    : dealers.length > 0 && dealers[0]?.distanceKm > filters.radius
                    ? `Nearest authorized reseller is ${dealers[0]?.distance || `${dealers[0]?.distanceKm} km`} away. Expand your search radius or type a higher distance in km.`
                    : activeFilterCount > 0
                    ? 'No resellers match the active filters. Try expanding the search radius or resetting filters.'
                    : 'No resellers currently available in this category.'}
                </Text>

                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
                  {dealers.length > 0 && filters.radius < 500 && (
                    <TouchableOpacity
                      onPress={() => setFilters((prev) => ({ ...prev, radius: 500 }))}
                      style={[styles.emptyResetBtn, { backgroundColor: COLORS.primary }]}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.emptyResetBtnText, { color: COLORS.white }]}>
                        Expand to 500 km
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    style={[styles.emptyResetBtn, { backgroundColor: COLORS.slate100, borderWidth: 1, borderColor: COLORS.borderDark }]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.emptyResetBtnText, { color: '#334155' }]}>
                      Adjust Radius in Filter
                    </Text>
                  </TouchableOpacity>

                  {activeFilterCount > 0 && (
                    <TouchableOpacity
                      onPress={() => setFilters(DEFAULT_FILTERS)}
                      style={styles.emptyResetBtn}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.emptyResetBtnText}>
                        Reset Filters
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            }
          />
        )}
      </View>
      </KeyboardAvoidingView>

      {/* Dealer Filter Modal */}
      <DealerFilterModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        filters={filters}
        onApply={handleApplyFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
        dealers={dealers}
      />
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
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.size.sm,
    color: COLORS.textPrimary,
    padding: 0,
  },
  filterTriggerBtn: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    borderWidth: 1.2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  filterTriggerBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterBadgeCircle: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.slate800,
    borderWidth: 1.5,
    borderColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeCircleText: {
    color: COLORS.white,
    fontSize: 9.5,
    fontWeight: FONTS.weight.heavy,
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  locationBarText: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.textSecondary,
  },
  locateBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: COLORS.white,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  locateBtnText: {
    fontSize: 10,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primary,
  },
  activeChipsContainer: {
    marginBottom: 8,
  },
  activeChipsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeChipsLabel: {
    fontSize: 10.5,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginRight: 2,
  },
  activeChipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: RADIUS.sm,
  },
  activeChipText: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primary,
  },
  clearAllBtn: {
    paddingHorizontal: 6,
    paddingVertical: 3.5,
  },
  clearAllBtnText: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textTertiary,
    textDecorationLine: 'underline',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterPillText: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textSecondary,
  },
  filterPillTextActive: {
    color: COLORS.white,
  },
  listContent: {
    paddingBottom: 24,
    gap: 10,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: FONTS.size.sm,
    color: COLORS.textTertiary,
    fontWeight: FONTS.weight.medium,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
  emptySubtitle: {
    fontSize: FONTS.size.sm,
    color: COLORS.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyResetBtn: {
    marginTop: 10,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  emptyResetBtnText: {
    color: COLORS.white,
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.errorLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
  },
  distanceBadgeText: {
    fontSize: 10,
    fontWeight: FONTS.weight.heavy,
    color: COLORS.primary,
  },
  dealerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  dealerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  dealerName: {
    flex: 1,
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  distributorBadge: {
    backgroundColor: COLORS.infoLight,
    borderWidth: 1,
    borderColor: COLORS.infoBorder,
  },
  resellerBadge: {
    backgroundColor: COLORS.successLight,
    borderWidth: 1,
    borderColor: COLORS.successBorder,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: FONTS.weight.heavy,
    letterSpacing: 0.3,
  },
  distributorBadgeText: {
    color: '#1D4ED8',
  },
  resellerBadgeText: {
    color: '#047857',
  },
  dealerCity: {
    fontSize: FONTS.size.xs,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 12,
    paddingLeft: 2,
  },
  addressText: {
    flex: 1,
    fontSize: FONTS.size.xs,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceSecondary,
    paddingTop: 10,
  },
  actionBtnCall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.successLight,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.successBorder,
  },
  actionTextCall: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.bold,
    color: '#047857',
  },
  actionBtnWhatsApp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  actionTextWhatsApp: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.bold,
    color: '#15803D',
  },
  actionBtnMap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.infoLight,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.infoBorder,
  },
  actionTextMap: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.bold,
    color: COLORS.info,
  },
  actionBtnEnquire: {
    marginLeft: 'auto',
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.sm,
  },
  actionTextEnquire: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.bold,
    color: COLORS.white,
  },
  selfBadge: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.successLight,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.successBorder,
  },
  selfBadgeText: {
    fontSize: FONTS.size.caption,
    fontWeight: FONTS.weight.bold,
    color: COLORS.success,
  },
});

export default DealerLocatorScreen;
