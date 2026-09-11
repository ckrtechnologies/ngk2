import React, { useState, useEffect, useMemo } from 'react';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../../utils/theme';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    TextInput,
    Image,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ChevronLeft, Search, Car, ChevronRight, X } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { apiFunction } from '../../../apis/apiFunction';
import { addVehicleToGarageApi, serviceJsonApi } from '../../../apis/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import AppHeader from '../../../components/common/AppHeader';

const ModalsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const dispatch = useDispatch();
    const { myself } = useSelector((state) => state.getData);
    const [modelsList, setModalList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const { manuId, mfrName } = route.params || {};

    const appType = route.params?.linkingTargetType || route.params?.appType || 'P';

    useEffect(() => {
        const getVehicleModels = async () => {
            if (!manuId) return;
            setLoading(true);
            const payload = {
                "getModelSeries2": {
                    "country": "ZA",
                    "lang": "en",
                    "manuId": Number(manuId),
                    "linkingTargetType": appType,
                    "includeAll": true,
                }
            };
            try {
                const res = await apiFunction(serviceJsonApi, [], payload, "POST", false);
                const array = res?.modelSeries?.array || res?.data?.array || res?.getModelSeries2?.array || res?.data || [];
                setModalList(Array.isArray(array) ? array : []);
            } catch (err) {
                console.error("Failed to fetch vehicle models:", err);
            } finally {
                setLoading(false);
            }
        };
        getVehicleModels();
    }, [manuId, appType]);

    const filteredModels = useMemo(() => {
        if (!searchQuery.trim()) return modelsList;
        return modelsList.filter(item => {
            const name = (item.modelname || item.name || item.description || '').toLowerCase();
            return name.includes(searchQuery.toLowerCase());
        });
    }, [modelsList, searchQuery]);

    const handleSelect = async (model) => {
        console.log("Model selected:", model);
        const storedUserId = await AsyncStorage.getItem("userId");
        const effectiveUserId = myself?.id || storedUserId;
        if (!effectiveUserId) {
            Toast.show({
                type: 'error',
                text1: 'Sign In Required',
                text2: 'Please sign in to save vehicles to your garage.',
            });
            navigation.navigate('Login');
            return;
        }

        const modal = {
            make: mfrName || route.params?.manuName || 'Unknown',
            model: model.modelname || model.name,
            modelId: model.modelId,
            vehicleDescription: model.modelname,
            yearOfConstrFrom: model.yearOfConstrFrom,
            yearOfConstrTo: model.yearOfConstrTo,
            year: model.yearOfConstrFrom ? String(model.yearOfConstrFrom).substring(0, 4) : undefined,
        };

        const res = await apiFunction(addVehicleToGarageApi, [effectiveUserId], { modal, userId: effectiveUserId }, "PUT", true);
        console.log("response of add Vehicle ==>>>>", res);
        if (res?.success) {
            Toast.show({
                type: 'success',
                text1: 'Vehicle Added to Garage',
                text2: `${modal.make} ${modal.model}`,
            });
            navigation.goBack();
        } else {
            if (
                res?.message?.includes('violates foreign key constraint') ||
                res?.message?.includes('User account not found') ||
                res?.message?.includes('session expired')
            ) {
                Toast.show({
                    type: 'error',
                    text1: 'Session Expired',
                    text2: 'Your account was reset or not found. Please log in again.',
                });
                await AsyncStorage.multiRemove(['token', 'userId', 'role', 'user']);
                navigation.navigate('Login');
                return;
            }
            Toast.show({
                type: 'error',
                text1: 'Failed to Add Vehicle',
                text2: res?.message || 'Error saving vehicle.',
            });
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
    };

    const renderModelItem = ({ item }) => {
        const title = item.modelname || item.name || item.description || 'Unknown Model';
        const yearFrom = item.yearOfConstrFrom ? `${item.yearOfConstrFrom.toString().substring(0, 4)}` : '';
        const yearTo = item.yearOfConstrTo ? `${item.yearOfConstrTo.toString().substring(0, 4)}` : 'Present';
        const dateRange = yearFrom ? `${yearFrom} - ${yearTo}` : '';


        const imageUrl = item.image || item.thumb || null;

        return (
            <TouchableOpacity style={styles.card} onPress={() => handleSelect(item)}>
                <View style={styles.imageContainer}>
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.modelImage} resizeMode="cover" />
                    ) : (
                        <Car color={COLORS.primary} size={wp('8%')} />
                    )}
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.title} numberOfLines={1}>{title}</Text>
                    {dateRange ? (
                        <Text style={styles.subtitle} numberOfLines={1}>{dateRange}</Text>
                    ) : null}
                </View>
                <ChevronRight color="#D1D1D1" size={wp('6%')} />
            </TouchableOpacity>
        );
    };

    return (
      <View style={styles.container}>
        <AppHeader
          title={`Models for ${mfrName || 'Vehicle'}`}
          subtitle="Select vehicle series"
          onBack={() => navigation.goBack()}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          {/* Search Bar Container */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Search color="#8E8E8E" size={wp('5%')} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search models..."
                placeholderTextColor="#8E8E8E"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="done"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={clearSearch} style={{ padding: wp('2%') }}>
                  <X color="#8E8E8E" size={wp('5%')} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* List */}
          <FlatList
            data={filteredModels}
            keyExtractor={(item, index) => item.modelId?.toString() || item.id?.toString() || index.toString()}
            renderItem={renderModelItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {loading ? "Loading models..." : "No models found."}
                </Text>
              </View>
            }
          />
        </KeyboardAvoidingView>
      </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F6FA',
    },
    header: {
        backgroundColor: COLORS.primary,
        height: hp('8%'),
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp('4%'),
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerTitle: {
        color: COLORS.white,
        fontSize: wp('5%'),
        fontWeight: 'bold',
        marginLeft: wp('4%'),
        flex: 1,
    },
    searchContainer: {
        paddingHorizontal: wp('6%'),
        paddingBottom: hp('2%'),
        paddingTop: hp('2%'),
        backgroundColor: COLORS.primary,
        borderBottomLeftRadius: wp('6%'),
        borderBottomRightRadius: wp('6%'),
        marginBottom: hp('1%'),
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: wp('4%'),
        paddingLeft: wp('4%'),
        paddingRight: wp('2%'),
        height: hp('6%'),
    },
    searchIcon: {
        marginRight: wp('2%'),
    },
    searchInput: {
        flex: 1,
        fontSize: wp('3.8%'),
        color: '#000000',
        height: '100%',
    },
    listContent: {
        paddingHorizontal: wp('6%'),
        paddingTop: hp('1%'),
        paddingBottom: hp('5%'),
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: wp('5%'),
        padding: wp('4%'),
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp('2%'),
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    imageContainer: {
        backgroundColor: '#FFF1F3',
        width: wp('16%'),
        height: wp('16%'),
        borderRadius: wp('4%'),
        marginRight: wp('4%'),
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    modelImage: {
        width: '100%',
        height: '100%',
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: wp('4.5%'),
        fontWeight: 'bold',
        color: '#000000',
    },
    subtitle: {
        fontSize: wp('3.2%'),
        color: '#8E8E8E',
        marginTop: hp('0.5%'),
    },
    emptyContainer: {
        paddingVertical: hp('10%'),
        alignItems: 'center',
    },
    emptyText: {
        fontSize: wp('4%'),
        color: '#8E8E8E',
        textAlign: 'center',
        paddingHorizontal: wp('10%'),
    },
});

export default ModalsScreen;
