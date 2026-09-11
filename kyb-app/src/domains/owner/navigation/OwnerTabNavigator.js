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

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OwnerTabNavigator() {
  const insets = useSafeAreaInsets();

  // Dynamically compute comfortable tab bar height adapting to device navigation bar
  const bottomPadding = insets.bottom > 0 ? insets.bottom : 6;
  const barHeight = Platform.OS === 'ios' ? 56 + insets.bottom : 58 + (insets.bottom > 0 ? insets.bottom : 0);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        unmountOnBlur: true,
        tabBarStyle: [
          styles.tabBar,
          {
            height: barHeight,
            paddingBottom: bottomPadding,
          },
        ],
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.55)',
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
    backgroundColor: '#121214',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 6,
    paddingBottom: 6,
    elevation: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: FONTS.weight.bold,
    marginBottom: 2,
  },
});
