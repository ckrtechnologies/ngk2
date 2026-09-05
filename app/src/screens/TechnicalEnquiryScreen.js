import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {
  UploadCloud,
  Car,
  Tag,
  Store,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  Search,
  MapPin,
  Navigation,
  X,
  ShieldCheck,
  Check,
  Sparkles,
  ChevronRight,
  Info,
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { apiFunction } from '../apis/apiFunction';
import { addEnquiryApi, uploadApi, dealersApi } from '../apis/api';
import { useDispatch, useSelector } from 'react-redux';
import { getUsersRedux } from '../redux/getData';
import { launchImageLibrary } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import ScreenContainer from '../components/common/ScreenContainer';
import AppHeader from '../components/common/AppHeader';
import AppInput from '../components/common/AppInput';
import AppButton from '../components/common/AppButton';

const TechnicalEnquiryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const { users, myself } = useSelector((state) => state.getData);

  const passedPart = route.params?.part;
  const passedVehicle = route.params?.vehicle;
  const passedDealerId = route.params?.dealerId;
  const passedDealerName = route.params?.dealerName;
  const passedDealer = route.params?.dealer;

  // Role & Scope
  const [currentUserRole, setCurrentUserRole] = useState(
    myself?.role?.toLowerCase() || 'vehicle_owner'
  );

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const storedRole = await AsyncStorage.getItem('role') || await AsyncStorage.getItem('userRole');
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

  // Part Details State (Item 5)
  const [partNumber, setPartNumber] = useState(
    passedPart?.articleNo || passedPart?.partNumber || ''
  );
  const [partName, setPartName] = useState(
    passedPart?.articleName || passedPart?.name || ''
  );

  // Vehicle Details State (Item 5)
  const [vehicleMake, setVehicleMake] = useState(
    passedVehicle?.manuName || passedVehicle?.make || ''
  );
  const [vehicleModel, setVehicleModel] = useState(
    passedVehicle?.modelname || passedVehicle?.model || ''
  );
  const [vehicleYear, setVehicleYear] = useState(
    passedVehicle?.yearOfConstrFrom
      ? String(passedVehicle.yearOfConstrFrom)
      : passedVehicle?.year
      ? String(passedVehicle.year)
      : ''
  );
  const [vehicleEngine, setVehicleEngine] = useState(
    passedVehicle?.engine || passedVehicle?.motorType || ''
  );
  const [vehicleVin, setVehicleVin] = useState(
    passedVehicle?.vin || passedVehicle?.chassisNo || ''
  );
  const [selectedGarageCarId, setSelectedGarageCarId] = useState(null);

  // Enquiry Details & Quantity
  const [quantity, setQuantity] = useState(1);
  const [enquiryDetails, setEnquiryDetails] = useState('');
  const [loading, setLoading] = useState(false);

  // Stockists & Geolocation State (Item 6 & 8)
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

  // Dealer Selection Modal State (Item 6)
  const [dealerModalVisible, setDealerModalVisible] = useState(false);
  const [dealerSearchQuery, setDealerSearchQuery] = useState('');
  const [dealerFilterTab, setDealerFilterTab] = useState('ALL'); // ALL, NEAREST, DISTRIBUTOR, STOCKIST

  // Image Attachment State
  const [imageUri, setImageUri] = useState(null);
  const [imageObj, setImageObj] = useState(null);

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
            console.warn('Failed to fetch nearby stockists with GPS:', err);
          }
        },
        async () => {
          setLocatingGps(false);
          fallbackFetch();
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    };

    const fallbackFetch = async () => {
      try {
        const res = await apiFunction(dealersApi, [], {}, 'GET', false);
        const list = res?.dealers || res?.data?.array || [];
        if (list.length > 0) {
          setStockists(list);
          if (!selectedDealerId) {
            const id = list[0].userId || list[0].id;
            const name = list[0].name || list[0].companyName;
            setSelectedDealerId(id);
            setSelectedDealerName(name);
            setSelectedDealerObj(list[0]);
          }
        }
      } catch (err) {
        console.warn('Fallback dealer fetch failed:', err);
      }
    };

    acquirePosition();
  }, [selectedDealerId]);

  useEffect(() => {
    if (!users || users.length === 0) {
      dispatch(getUsersRedux());
    }
    loadStockists();
  }, [dispatch, loadStockists, users]);

  // Combine stockists from API and registered distributors/resellers from Redux
  const allCandidateDealers = useMemo(() => {
    const map = new Map();

    // Add stockists from dealers API first (they have calculated distance)
    (stockists || []).forEach((d) => {
      const id = d.userId || d.dealerId || d.id;
      if (id) {
        map.set(id, {
          ...d,
          id,
          name: d.name || d.companyName || d.businessName || 'Authorized Stockist',
          role: d.role?.toLowerCase() || (d.isDistributor ? 'distributor' : 'stockist'),
          city: d.city || d.location || 'India',
          address: d.address || d.city || 'Verified Location',
          distance: d.distance && d.distance !== 'N/A' ? d.distance : null,
          isStockist: true,
        });
      }
    });

    // Add Redux users (distributors and resellers)
    (users || []).forEach((u) => {
      const id = u.id || u.userId;
      const role = (u.role || '').toLowerCase();
      if ((role === 'distributor' || role === 'reseller') && id && !map.has(id)) {
        map.set(id, {
          ...u,
          id,
          name: u.name || u.companyName || u.email,
          role,
          city: u.city || u.state || 'India',
          address: u.address || u.city || 'Authorized Regional Office',
          distance: null,
          isStockist: false,
        });
      }
    });

    return Array.from(map.values());
  }, [stockists, users]);

  // Item 8: For resellers, strictly filter queries to Distributors / Wholesalers
  const scopedCandidateDealers = useMemo(() => {
    if (isReseller) {
      const filtered = allCandidateDealers.filter(
        (d) =>
          d.role === 'distributor' ||
          d.role === 'wholesaler' ||
          d.isDistributor === true
      );
      return filtered.length > 0 ? filtered : allCandidateDealers;
    }
    return allCandidateDealers;
  }, [allCandidateDealers, isReseller]);

  // Filtered Candidate Dealers in Modal (Search + Tab filter)
  const modalFilteredDealers = useMemo(() => {
    let list = [...scopedCandidateDealers];

    // Tab filter
    if (dealerFilterTab === 'NEAREST') {
      list = list.filter((d) => d.distance && parseFloat(d.distance) <= 30);
    } else if (dealerFilterTab === 'DISTRIBUTOR') {
      list = list.filter((d) => d.role === 'distributor' || d.role === 'wholesaler');
    } else if (dealerFilterTab === 'STOCKIST') {
      list = list.filter((d) => d.role !== 'distributor');
    }

    // Search query filter
    if (dealerSearchQuery.trim()) {
      const q = dealerSearchQuery.toLowerCase().trim();
      list = list.filter(
        (d) =>
          (d.name && d.name.toLowerCase().includes(q)) ||
          (d.city && d.city.toLowerCase().includes(q)) ||
          (d.address && d.address.toLowerCase().includes(q))
      );
    }

    // Sort by proximity if distance is available
    list.sort((a, b) => {
      const distA = a.distance ? parseFloat(a.distance) : 99999;
      const distB = b.distance ? parseFloat(b.distance) : 99999;
      return distA - distB;
    });

    return list;
  }, [scopedCandidateDealers, dealerFilterTab, dealerSearchQuery]);

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
    const withDistance = scopedCandidateDealers.filter((d) => d.distance);
    if (withDistance.length > 0) {
      withDistance.sort(
        (a, b) => parseFloat(a.distance || 9999) - parseFloat(b.distance || 9999)
      );
      const nearest = withDistance[0];
      setSelectedDealerId(nearest.id);
      setSelectedDealerName(nearest.name);
      setSelectedDealerObj(nearest);
      setDealerModalVisible(false);
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
      setDealerModalVisible(false);
    }
  };

  // 1-Tap Select from Garage Vehicles
  const garageVehicles = myself?.garage || [];
  const handleSelectGarageVehicle = (car) => {
    if (selectedGarageCarId === car.id) {
      // Deselect
      setSelectedGarageCarId(null);
      return;
    }
    setSelectedGarageCarId(car.id);
    setVehicleMake(car.make || '');
    setVehicleModel(car.model || '');
    setVehicleYear(car.year ? String(car.year) : '');
    setVehicleEngine(car.engine || car.motorType || '');
    setVehicleVin(car.vin || car.licensePlate || '');
    Toast.show({
      type: 'info',
      text1: 'Garage Vehicle Loaded',
      text2: `${car.make} ${car.model} specifications auto-filled`,
    });
  };

  // Image Picker
  const handleImagePick = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (
      result.didCancel ||
      result.errorCode ||
      !result.assets ||
      result.assets.length === 0
    ) {
      return;
    }
    const asset = result.assets[0];
    setImageUri(asset.uri);
    setImageObj(asset);
  };

  const handleRemoveImage = () => {
    setImageUri(null);
    setImageObj(null);
  };

  // Form Submission
  const handleSubmit = async () => {
    if (!partNumber.trim() && !partName.trim() && !enquiryDetails.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Details Required',
        text2: 'Please provide Part Number or describe the technical query.',
      });
      return;
    }

    if (!selectedDealerId) {
      Toast.show({
        type: 'error',
        text1: 'Dealer Required',
        text2: isReseller
          ? 'Please select an authorized Distributor.'
          : 'Please select an authorized Dealer / Stockist.',
      });
      return;
    }

    setLoading(true);
    try {
      let uploadedImageUrl = null;
      if (imageObj) {
        const ext = imageObj.fileName ? imageObj.fileName.split('.').pop() : 'jpg';
        const fileName = `enquiry_${Date.now()}.${ext}`;
        const formData = new FormData();
        formData.append('file', {
          uri: imageObj.uri,
          name: fileName,
          type: imageObj.type || 'image/jpeg',
        });

        const uploadRes = await apiFunction(uploadApi, [], formData, 'POST', true);
        if (uploadRes?.success && uploadRes?.file?.url) {
          uploadedImageUrl = uploadRes.file.url;
        }
      }

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
        imageUrl: uploadedImageUrl,
        imageurl: uploadedImageUrl,
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
          engine: vehicleEngine.trim(),
          vin: vehicleVin.trim(),
          dealerName: selectedDealerName,
          dealerId: selectedDealerId,
          imageurl: uploadedImageUrl,
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

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <AppHeader
        title={isReseller ? 'Wholesale Query' : 'Technical Enquiry'}
        subtitle={
          isReseller
            ? 'Distributor Lead & Fitment Support'
            : 'Authorized Verification & Dealer Dispatch'
        }
        onBack={() => navigation.goBack()}
      />

      <ScreenContainer
        scrollable={true}
        includeTopInset={false}
        showStatusBar={false}
        footer={
          <AppButton
            title="Submit Technical Ticket"
            onPress={handleSubmit}
            loading={loading}
            backgroundColor="#D0142C"
          />
        }
      >
        {/* Role Notice for Reseller (Item 8) */}
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

        {/* Section 1: Assigned Dealer / Stockist Card (Item 6 & 8) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            {isReseller ? 'ASSIGNED DISTRIBUTOR' : 'ASSIGNED AUTHORIZED STOCKIST'}
          </Text>
          <TouchableOpacity
            style={styles.changeDealerLink}
            onPress={() => setDealerModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.changeDealerLinkText}>
              {selectedDealerName ? 'Change Dealer' : 'Select Dealer'}
            </Text>
            <ChevronRight size={14} color="#D0142C" />
          </TouchableOpacity>
        </View>

        {selectedDealerName ? (
          <TouchableOpacity
            style={styles.assignedDealerCard}
            onPress={() => setDealerModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.dealerIconBadge}>
              <Store size={22} color="#D0142C" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.dealerTitleRow}>
                <Text style={styles.assignedDealerName} numberOfLines={1}>
                  {selectedDealerName}
                </Text>
                <View style={styles.verifiedTag}>
                  <ShieldCheck size={11} color="#059669" />
                  <Text style={styles.verifiedTagText}>
                    {isReseller ? 'DISTRIBUTOR' : 'VERIFIED'}
                  </Text>
                </View>
              </View>

              <View style={styles.dealerMetaRow}>
                {selectedDealerObj?.distance && (
                  <View style={styles.distanceBadge}>
                    <MapPin size={11} color="#059669" />
                    <Text style={styles.distanceBadgeText}>
                      {selectedDealerObj.distance} away
                    </Text>
                  </View>
                )}
                <Text style={styles.dealerLocationText} numberOfLines={1}>
                  {selectedDealerObj?.city || selectedDealerObj?.address || 'Authorized Center'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.noDealerPromptCard}
            onPress={() => setDealerModalVisible(true)}
            activeOpacity={0.8}
          >
            <Store size={22} color="#9CA3AF" />
            <Text style={styles.noDealerPromptText}>
              Tap to choose nearest authorized {isReseller ? 'Distributor' : 'Stockist'}
            </Text>
            <ChevronRight size={16} color="#9CA3AF" />
          </TouchableOpacity>
        )}

        {/* Section 2: Garage Vehicle Quick Selector (Item 5) */}
        {garageVehicles.length > 0 && (
          <View style={styles.garageSelectorContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>SELECT FROM MY GARAGE</Text>
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
                const isSelected = selectedGarageCarId === car.id;
                return (
                  <TouchableOpacity
                    key={car.id || idx}
                    style={[
                      styles.garageChip,
                      isSelected && styles.garageChipSelected,
                    ]}
                    onPress={() => handleSelectGarageVehicle(car)}
                    activeOpacity={0.7}
                  >
                    <Car
                      size={15}
                      color={isSelected ? '#FFFFFF' : '#4B5563'}
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

        {/* Section 3: Part Identification Fields (Item 5) */}
        <View style={styles.formCard}>
          <View style={styles.cardHeaderRow}>
            <Tag size={16} color="#D0142C" />
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

        {/* Section 4: Vehicle Specifications (Item 5) */}
        <View style={styles.formCard}>
          <View style={styles.cardHeaderRow}>
            <Car size={16} color="#2563EB" />
            <Text style={styles.cardTitle}>VEHICLE SPECIFICATIONS</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Helps verify precise application, gap size, and engine compatibility.
          </Text>

          <View style={styles.twoColumnRow}>
            <View style={styles.twoColumnItem}>
              <AppInput
                label="Make / Brand"
                placeholder="e.g. Toyota"
                value={vehicleMake}
                onChangeText={setVehicleMake}
              />
            </View>
            <View style={styles.twoColumnItem}>
              <AppInput
                label="Model"
                placeholder="e.g. Corolla / Fortuner"
                value={vehicleModel}
                onChangeText={setVehicleModel}
              />
            </View>
          </View>

          <View style={styles.twoColumnRow}>
            <View style={styles.twoColumnItem}>
              <AppInput
                label="Year"
                placeholder="e.g. 2021"
                value={vehicleYear}
                onChangeText={setVehicleYear}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.twoColumnItem}>
              <AppInput
                label="Engine / CC"
                placeholder="e.g. 1.8L 2ZR-FE"
                value={vehicleEngine}
                onChangeText={setVehicleEngine}
              />
            </View>
          </View>

          <View style={styles.inputSpacing}>
            <AppInput
              label="VIN / Chassis Number (Optional)"
              placeholder="17-digit VIN for exact OE cross-reference"
              value={vehicleVin}
              onChangeText={setVehicleVin}
            />
          </View>
        </View>

        {/* Section 5: Requested Quantity */}
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
              <Minus size={16} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{quantity}</Text>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setQuantity((q) => q + 1)}
              activeOpacity={0.7}
            >
              <Plus size={16} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 6: Issue Description */}
        <View style={styles.inputSpacing}>
          <AppInput
            label="Enquiry Details / Query Notes *"
            placeholder="Describe symptom, gap query, fitment doubt, or wholesale requirements..."
            value={enquiryDetails}
            onChangeText={setEnquiryDetails}
            multiline={true}
            numberOfLines={4}
          />
        </View>

        {/* Section 7: Photo Attachment */}
        <Text style={styles.sectionTitle}>PHOTO REFERENCE (OPTIONAL)</Text>
        <View style={styles.photoContainer}>
          {imageUri ? (
            <View style={styles.photoPreviewWrapper}>
              <Image source={{ uri: imageUri }} style={styles.photoPreview} />
              <TouchableOpacity
                style={styles.photoDeleteBtn}
                onPress={handleRemoveImage}
                activeOpacity={0.7}
              >
                <Trash2 size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.photoUploadBtn}
              onPress={handleImagePick}
              activeOpacity={0.7}
            >
              <UploadCloud size={22} color="#6B7280" />
              <View>
                <Text style={styles.photoUploadTitle}>Attach Part / Vehicle Photo</Text>
                <Text style={styles.photoUploadSubtitle}>
                  Take picture of part number stamp, plug tip, or VIN plate
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScreenContainer>

      {/* SOPHISTICATED DEALER SELECTION MODAL (Item 6 & 8) */}
      <Modal
        visible={dealerModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDealerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {isReseller ? 'Select Regional Distributor' : 'Select Authorized Stockist'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {isReseller
                    ? 'Choose verified wholesaler to route enquiry'
                    : 'Choose nearest dealer for stock inquiry & fitment'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setDealerModalVisible(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={styles.modalCloseBtn}
              >
                <X size={20} color="#4B5563" />
              </TouchableOpacity>
            </View>

            {/* Quick Auto-Select Nearest Button */}
            <TouchableOpacity
              style={styles.autoSelectNearestBtn}
              onPress={handleAutoSelectNearest}
              activeOpacity={0.8}
            >
              <Navigation size={16} color="#FFFFFF" />
              <Text style={styles.autoSelectNearestBtnText}>
                Auto-Select Nearest Authorized Stockist
              </Text>
            </TouchableOpacity>

            {/* Search Input Bar */}
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

            {/* Filter Tabs */}
            <View style={styles.modalFilterTabsRow}>
              {['ALL', 'NEAREST', !isReseller && 'STOCKIST', 'DISTRIBUTOR']
                .filter(Boolean)
                .map((tabKey) => {
                  const isSelected = dealerFilterTab === tabKey;
                  const label =
                    tabKey === 'ALL'
                      ? 'All'
                      : tabKey === 'NEAREST'
                      ? 'Nearest (<30km)'
                      : tabKey === 'DISTRIBUTOR'
                      ? 'Distributors'
                      : 'Stockists';
                  return (
                    <TouchableOpacity
                      key={tabKey}
                      style={[
                        styles.modalFilterTab,
                        isSelected && styles.modalFilterTabActive,
                      ]}
                      onPress={() => setDealerFilterTab(tabKey)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.modalFilterTabText,
                          isSelected && styles.modalFilterTabTextActive,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </View>

            {/* Dealer List */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalDealersScroll}
            >
              {modalFilteredDealers.length === 0 ? (
                <View style={styles.emptyDealersBox}>
                  <Store size={36} color="#D1D5DB" />
                  <Text style={styles.emptyDealersTitle}>No Dealers Found</Text>
                  <Text style={styles.emptyDealersSub}>
                    Try clearing your search query or filter tab.
                  </Text>
                </View>
              ) : (
                modalFilteredDealers.map((d) => {
                  const isSelected = selectedDealerId === d.id;
                  const isDist = d.role === 'distributor' || d.role === 'wholesaler';
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
                        setDealerModalVisible(false);
                      }}
                      activeOpacity={0.75}
                    >
                      <View style={styles.modalDealerCardTop}>
                        <View style={styles.modalDealerIconBox}>
                          <Store
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
                            <MapPin size={12} color="#6B7280" />
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
                            <Navigation size={11} color="#047857" />
                            <Text style={styles.modalDistanceChipText}>
                              {d.distance} from your location
                            </Text>
                          </View>
                          <Text style={styles.selectPrompt}>
                            {isSelected ? 'Currently Assigned' : 'Tap to Assign'}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
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
    color: '#64748B',
    letterSpacing: 0.8,
  },
  changeDealerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  changeDealerLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D0142C',
  },
  resellerNoticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 12,
  },
  resellerNoticeIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  resellerNoticeTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#991B1B',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  resellerNoticeBody: {
    fontSize: 12,
    color: '#7F1D1D',
    lineHeight: 16,
  },
  assignedDealerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  dealerIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dealerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  assignedDealerName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 6,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.3,
  },
  dealerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  distanceBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  dealerLocationText: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
  noDealerPromptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  noDealerPromptText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    flex: 1,
    marginLeft: 10,
  },
  garageSelectorContainer: {
    marginBottom: 14,
  },
  garageCountBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  garageChipsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  garageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  garageChipSelected: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  garageChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  garageChipTextSelected: {
    color: '#FFFFFF',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
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
    lineHeight: 15,
  },
  inputSpacing: {
    marginBottom: 10,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  twoColumnItem: {
    flex: 1,
  },
  quantityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  quantityLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  quantitySub: {
    fontSize: 11,
    color: '#64748B',
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 3,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  stepperValue: {
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  photoContainer: {
    marginBottom: 20,
    marginTop: 6,
  },
  photoUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  photoUploadTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  photoUploadSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  photoPreviewWrapper: {
    position: 'relative',
    width: 120,
    height: 90,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoDeleteBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  autoSelectNearestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 10,
    paddingVertical: 10,
    borderRadius: 10,
  },
  autoSelectNearestBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 0,
  },
  modalFilterTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  modalFilterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  modalFilterTabActive: {
    backgroundColor: '#D0142C',
  },
  modalFilterTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  modalFilterTabTextActive: {
    color: '#FFFFFF',
  },
  modalDealersScroll: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 10,
  },
  emptyDealersBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyDealersTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
  },
  emptyDealersSub: {
    fontSize: 12,
    color: '#94A3B8',
  },
  modalDealerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  modalDealerCardSelected: {
    borderColor: '#D0142C',
    backgroundColor: '#FFF5F5',
  },
  modalDealerCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  modalDealerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  dealerNameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  modalDealerName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
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
});

export default TechnicalEnquiryScreen;
