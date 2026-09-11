import React from 'react';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../../utils/theme';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {
  PortalTabIcon,
  SearchTabIcon,
  EnquiriesTabIcon,
  DealersTabIcon,
} from '../../../components/icons/NavigationTabIcons';

import OwnerHomeScreen from '../screens/OwnerHomeScreen';
import PartsFinderScreen from '../../shared/screens/PartsFinderScreen';
import MyEnquiriesScreen from '../../shared/screens/MyEnquiriesScreen';
import DealerLocatorScreen from '../../shared/screens/DealerLocatorScreen';

const Tab = createBottomTabNavigator();

const renderTabBarIcon = (routeName, focused, size) => {
  if (routeName === 'Portal') {
    return <PortalTabIcon focused={focused} size={size || 24} />;
  }
  if (routeName === 'Search') {
    return <SearchTabIcon focused={focused} size={size || 24} />;
  }
  if (routeName === 'Enquiries') {
    return <EnquiriesTabIcon focused={focused} size={size || 24} />;
  }
  if (routeName === 'Dealers') {
    return <DealersTabIcon focused={focused} size={size || 24} />;
  }
  return null;
};

export default function OwnerTabNavigator() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 12);
  const tabBarHeight = 58 + bottomInset;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        unmountOnBlur: true,
        tabBarStyle: [
          styles.tabBar,
          {
            height: tabBarHeight,
            paddingBottom: bottomInset,
          },
        ],
        tabBarActiveTintColor: COLORS.white,
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.65)',
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ size, focused }) => renderTabBarIcon(route.name, focused, size),
      })}
    >
      <Tab.Screen name="Portal" component={OwnerHomeScreen} />
      <Tab.Screen
        name="Search"
        component={PartsFinderScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('PartsFinder');
          },
        })}
      />
      <Tab.Screen
        name="Enquiries"
        component={MyEnquiriesScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('MyEnquiries');
          },
        })}
      />
      <Tab.Screen
        name="Dealers"
        component={DealerLocatorScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('DealerLocator');
          },
        })}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: wp('8%'),
    borderTopRightRadius: wp('8%'),
    position: 'absolute',
    borderTopWidth: 0,
    paddingTop: 8,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  tabBarLabel: {
    fontSize: wp('3%'),
    fontWeight: FONTS.weight.semiBold,
    marginBottom: 4,
  },
});
