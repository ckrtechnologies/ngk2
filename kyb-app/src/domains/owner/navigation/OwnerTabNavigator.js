import React from 'react';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../../utils/theme';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.white,
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
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
    height: hp('10%'),
    borderTopLeftRadius: wp('8%'),
    borderTopRightRadius: wp('8%'),
    position: 'absolute',
    borderTopWidth: 0,
    paddingBottom: hp('2%'),
    paddingTop: hp('1%'),
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  tabBarLabel: {
    fontSize: wp('3%'),
    fontWeight: FONTS.weight.semiBold,
    marginBottom: hp('0.5%'),
  },
});
