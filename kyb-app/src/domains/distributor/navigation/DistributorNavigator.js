import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DistributorHomeScreen from '../screens/DistributorHomeScreen';
import DistributorProfileScreen from '../screens/DistributorProfileScreen';
import PartsFinderScreen from '../../shared/screens/PartsFinderScreen';
import VerifiedPartsScreen from '../../shared/screens/VerifiedPartsScreen';
import TechnicalEnquiryScreen from '../../shared/screens/TechnicalEnquiryScreen';
import MyEnquiriesScreen from '../../shared/screens/MyEnquiriesScreen';
import DealerLocatorScreen from '../../shared/screens/DealerLocatorScreen';
import CustomDrawer from '../../shared/screens/CustomDrawer';
import NotificationScreen from '../../shared/screens/Notification';

const Stack = createNativeStackNavigator();

export default function DistributorNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="DistributorHome"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="DistributorHome" component={DistributorHomeScreen} />
      <Stack.Screen name="DistributorHomeScreen" component={DistributorHomeScreen} />
      <Stack.Screen name="Profile" component={DistributorProfileScreen} />
      <Stack.Screen name="PartsFinder" component={PartsFinderScreen} />
      <Stack.Screen name="CatalogSearch" component={PartsFinderScreen} />
      <Stack.Screen name="VerifiedParts" component={VerifiedPartsScreen} />
      <Stack.Screen name="TechnicalEnquiry" component={TechnicalEnquiryScreen} />
      <Stack.Screen name="MyEnquiries" component={MyEnquiriesScreen} />
      <Stack.Screen name="DealerLocator" component={DealerLocatorScreen} />
      <Stack.Screen name="DealerLocatorScreen" component={DealerLocatorScreen} />
      <Stack.Screen name="CustomDrawer" component={CustomDrawer} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
    </Stack.Navigator>
  );
}
